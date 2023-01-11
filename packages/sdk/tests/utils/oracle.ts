import { constants } from "ethers";

import { getOrCreateMidas } from "./midasSdk";

export const setUpOracleWithToken = async (_token, _address, ethers, getNamedAccounts) => {
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const sdk = await getOrCreateMidas();
  const mpo = sdk.createMasterPriceOracle(signer);

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
