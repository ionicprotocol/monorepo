import { base } from "@ionicprotocol/chains";
import { Address, zeroAddress } from "viem";
import { task } from "hardhat/config";
import { deployIonicMarketERC4626 } from "../../erc4626/deploy";
import { COMPTROLLER } from ".";

task("deploy:erc4626:base", "Deploy ERC4626 on Base").setAction(async ({}, { deployments, viem, getNamedAccounts }) => {
  const { deployer, multisig } = await getNamedAccounts();
  const comptroller = await viem.getContractAt(
    "contracts/src/compound/ComptrollerInterface.sol:IonicComptroller",
    COMPTROLLER
  );
  const symbols = ["USDC", "WETH"];
  const assets = base.assets.filter((asset) => symbols.includes(asset.symbol));
  for (const asset of assets) {
    const cToken = await comptroller.read.cTokensByUnderlying([asset.underlying]);
    if (cToken !== zeroAddress) {
      await deployIonicMarketERC4626({
        cToken,
        deployer,
        deployments,
        multisig: "0x7d922bf0975424b3371074f54cC784AF738Dac0D"
      });
    }
  }
});
