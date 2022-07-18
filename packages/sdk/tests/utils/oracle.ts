import { constants, utils } from "ethers";

import { getOrCreateFuse } from "./fuseSdk";

enum ChainlinkFeedBaseCurrency {
  ETH,
  USD,
}

export const setUpOracleWithToken = async (_token, _address, ethers, getNamedAccounts) => {
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const sdk = await getOrCreateFuse();
  const mpo = await ethers.getContractAt("MasterPriceOracle", sdk.oracles.MasterPriceOracle.address, signer);
  const oracle = await mpo.callStatic.oracles(_address);

  const clOracle = await ethers.getContractAt("ChainlinkPriceOracleV2", oracle, signer);

  const tx = await clOracle.setPriceFeeds(
    [_address],
    ["0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e"],
    ChainlinkFeedBaseCurrency.USD
  );

  await tx.wait();

  console.log(await clOracle.callStatic.priceFeeds(_address));
  console.log(await clOracle.callStatic.feedBaseCurrencies(_address));
  console.log(utils.formatEther(await clOracle.callStatic.price(_address)), "PRICE");

  if (_address) {
    return [_address, mpo];
  }
  if (_token === "ETH") {
    return [constants.AddressZero, mpo];
  } else {
    const token = await ethers.getContract(`${_token}Token`);
    return [token.address, mpo];
  }
};
