import { task, types } from "hardhat/config";
import { Address, encodeAbiParameters, Hash, parseAbiParameters } from "viem";
import { prepareAndLogTransaction } from "../../chainDeploy/helpers/logging";

/**
 * Retire a frozen/abandoned cToken market that reverts every accruing call with "!borrowRate".
 *
 * Such a market cannot be repaired through any accruing entrypoint (mint/redeem/borrow/repay,
 * _setInterestRateModel, _withdraw*Fees all accrue first). The only non-accruing admin lever is
 * `_setImplementationSafe`, so we upgrade the market to a one-shot `CErc20RetireDelegate` whose
 * `_becomeImplementation(abi.encode(treasury))` sweeps the underlying to `treasury` and zeroes the
 * accounting (reserves/fees/borrows). That unfreezes `accrueInterest`, after which the market can be
 * unlisted via `_unsupportMarket` (requires totalSupply == 0).
 *
 * SAFETY: refuses to run unless `totalSupply == 0` (no suppliers). Validate on a fork first
 * (see contracts/test/RetireFrozenMarketTest.t.sol).
 *
 * Example:
 *   yarn hardhat market:retire-frozen --network base \
 *     --market 0x5BE1Cb6CB3C9bfd16Db43ed4f6c081FA9783dd1C \
 *     --treasury 0x<treasury>
 */
export default task("market:retire-frozen", "Retire a frozen/abandoned market: sweep funds, zero state, unlist")
  .addParam("market", "Address of the frozen cToken market", undefined, types.string)
  .addParam("treasury", "Recipient of the swept underlying", undefined, types.string)
  .addOptionalParam("unsupport", "Whether to unlist the market from the pool after retiring", true, types.boolean)
  .setAction(async ({ market, treasury, unsupport }, { viem, deployments, getNamedAccounts }) => {
    const { deployer } = await getNamedAccounts();
    const publicClient = await viem.getPublicClient();

    const cToken = await viem.getContractAt("ICErc20", market as Address);

    // --- Safety guard: only retire abandoned markets (no suppliers) ---
    const totalSupply = await cToken.read.totalSupply();
    if (totalSupply !== 0n) {
      throw new Error(`Refusing to retire ${market}: totalSupply is ${totalSupply} (expected 0 — has suppliers).`);
    }

    const underlying = await cToken.read.underlying();
    const comptrollerAddress = await cToken.read.comptroller();
    const cash = await (await viem.getContractAt("ICErc20", underlying)).read.balanceOf([market as Address]);
    console.log(`Retiring market ${market} (underlying ${underlying}); sweeping ${cash} to ${treasury}`);

    const feeDistributor = await viem.getContractAt(
      "FeeDistributor",
      (await deployments.get("FeeDistributor")).address as Address
    );
    const cTokenFirstExtension = (await deployments.get("CTokenFirstExtension")).address as Address;

    // 1. Deploy the one-shot retire delegate.
    const retire = await deployments.deploy("CErc20RetireDelegate", {
      from: deployer,
      args: [],
      log: true,
      waitConfirmations: 1
    });
    if (retire.transactionHash) await publicClient.waitForTransactionReceipt({ hash: retire.transactionHash as Hash });
    const retireDelegate = retire.address as Address;
    console.log(`CErc20RetireDelegate: ${retireDelegate}`);

    // 2. Register the retire delegate's extensions in the FeeDistributor (owner). Mirrors the
    //    canonical [delegate, CTokenFirstExtension] registration in 03-deploy-ctokens-set-extensions.
    const ffdOwner = await feeDistributor.read.owner();
    const currentExts = await feeDistributor.read.getCErc20DelegateExtensions([retireDelegate]);
    const extsArgs: [Address, Address[]] = [retireDelegate, [retireDelegate, cTokenFirstExtension]];
    if (currentExts.length < 2 || currentExts[0] !== retireDelegate || currentExts[1] !== cTokenFirstExtension) {
      if (ffdOwner.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: feeDistributor,
          functionName: "_setCErc20DelegateExtensions",
          args: extsArgs,
          description: "Register CErc20RetireDelegate extensions",
          inputs: [
            { internalType: "address", name: "cErc20Delegate", type: "address" },
            { internalType: "address[]", name: "extensions", type: "address[]" }
          ]
        });
      } else {
        const tx = await feeDistributor.write._setCErc20DelegateExtensions(extsArgs);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Registered extensions for retire delegate: ${tx}`);
      }
    } else {
      console.log(`Retire delegate extensions already registered`);
    }

    // 3. Upgrade the market to the retire delegate (pool/ionic admin). This sweeps + zeroes state.
    const becomeData = encodeAbiParameters(parseAbiParameters("address"), [treasury as Address]);
    const cTokenDelegator = await viem.getContractAt("CErc20Delegator", market as Address);
    const comptroller = await viem.getContractAt("IonicComptroller", comptrollerAddress as Address);
    const poolAdmin = await comptroller.read.admin();
    if (poolAdmin.toLowerCase() !== deployer.toLowerCase()) {
      await prepareAndLogTransaction({
        contractInstance: cTokenDelegator,
        functionName: "_setImplementationSafe",
        args: [retireDelegate, becomeData],
        description: `Retire market ${market}: set CErc20RetireDelegate (sweep to ${treasury})`,
        inputs: [
          { internalType: "address", name: "implementation_", type: "address" },
          { internalType: "bytes", name: "implementationData", type: "bytes" }
        ]
      });
    } else {
      const tx = await cTokenDelegator.write._setImplementationSafe([retireDelegate, becomeData]);
      await publicClient.waitForTransactionReceipt({ hash: tx });
      console.log(`Retired market (swept + zeroed) via _setImplementationSafe: ${tx}`);
    }

    // 4. Unlist the market from the pool (admin). Requires totalSupply == 0 (already enforced).
    if (unsupport) {
      if (poolAdmin.toLowerCase() !== deployer.toLowerCase()) {
        await prepareAndLogTransaction({
          contractInstance: comptroller,
          functionName: "_unsupportMarket",
          args: [market as Address],
          description: `Unlist retired market ${market}`,
          inputs: [{ internalType: "address", name: "cToken", type: "address" }]
        });
      } else {
        const tx = await comptroller.write._unsupportMarket([market as Address]);
        await publicClient.waitForTransactionReceipt({ hash: tx });
        console.log(`Unsupported (unlisted) market: ${tx}`);
      }
    }

    console.log(
      `Done. If multisig transactions were queued, execute them in order: ` +
        `(1) register extensions, (2) _setImplementationSafe, (3) _unsupportMarket.`
    );
  });
