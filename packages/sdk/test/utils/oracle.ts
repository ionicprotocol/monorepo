import { constants } from "ethers";

export const setUpOracleWithToken = async (_token, _address, ethers, getNamedAccounts) => {
  const { deployer } = await getNamedAccounts();
  const signer = await ethers.getSigner(deployer);
  const spo = await ethers.getContract("SimplePriceOracle", signer);

  if (_address) {
    return [_address, spo];
  }
  if (_token === "ETH") {
    return [constants.AddressZero, spo];
  } else {
    const token = await ethers.getContract(`${_token}Token`);
    return [token.address, spo];
  }
};
