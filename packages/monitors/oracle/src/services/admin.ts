import { icErc20Abi, ionicComptrollerAbi, IonicSdk } from "@ionicprotocol/sdk";
import { SupportedAsset } from "@ionicprotocol/types";
import { Address, GetContractReturnType, PublicClient, WalletClient, zeroAddress } from "viem";

export class AdminService {
  admin: WalletClient;
  publicClient: PublicClient;
  adminAddress: Address;
  sdk: IonicSdk;
  asset: SupportedAsset;

  constructor(sdk: IonicSdk, asset: SupportedAsset) {
    this.asset = asset;
    this.admin = sdk.walletClient;
    this.sdk = sdk;
  }
  async init(): Promise<AdminService> {
    this.adminAddress = this.admin.account!.address;
    return this;
  }

  async pauseAllPools(pools: Array<GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>>) {
    for (const pool of pools) {
      const cTokenAddress = await pool.read.cTokensByUnderlying([this.asset.underlying]);
      const cToken = this.sdk.createICErc20(cTokenAddress, this.publicClient, this.admin);
      await this.pauseMarketActivity(pool, cToken);
    }
  }

  private async getPauseGuardian(pool: GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>) {
    return await pool.read.pauseGuardian();
  }
  private async setPauseGuardian(pool: GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>) {
    const tx = await pool.write._setPauseGuardian([this.adminAddress], {
      account: this.admin.account!.address,
      chain: this.admin.chain,
    });
    await this.publicClient.waitForTransactionReceipt({ hash: tx });
    console.log(`Set the pause guardian to ${this.adminAddress}`);
  }

  async pauseMarketActivity(
    pool: GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>,
    cToken: GetContractReturnType<typeof icErc20Abi, PublicClient>,
  ) {
    const pauseGuardian = await this.getPauseGuardian(pool);
    if (pauseGuardian === zeroAddress) {
      await this.setPauseGuardian(pool);
    }
    await this.pauseMintActivity(pool, cToken);
    await this.pauseBorrowActivity(pool);
  }

  async pauseMintActivity(
    pool: GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>,
    cToken: GetContractReturnType<typeof icErc20Abi, PublicClient>,
  ) {
    const isPaused: boolean = await pool.read.mintGuardianPaused([cToken.address]);
    if (!isPaused) {
      const tx = await pool.write._setMintPaused([cToken.address, true], {
        account: this.admin.account!.address,
        chain: this.admin.chain,
      });
      await this.publicClient.waitForTransactionReceipt({ hash: tx });
      console.warn(`Market mint pause tx ${tx}`);
    } else {
      console.log(`Minting already paused`);
    }
  }
  async pauseBorrowActivity(pool: GetContractReturnType<typeof ionicComptrollerAbi, PublicClient>) {
    const markets = await this.sdk.createComptroller(pool.address).read.getAllMarkets();
    for (const market of markets) {
      const isPaused: boolean = await pool.read.borrowGuardianPaused([market]);
      if (!isPaused) {
        const tx = await pool.write._setBorrowPaused([market, true], {
          account: this.admin.account!.address,
          chain: this.admin.chain,
        });
        await this.publicClient.waitForTransactionReceipt({ hash: tx });
        console.warn(`Market borrow pause tx ${tx}`);
      } else {
        console.info(`Borrowing already paused`);
      }
    }
  }
}
