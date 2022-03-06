import { task } from "hardhat/config";

export default task("add-chainlink-feeds", "Add Chainlink Feeds")
  .addParam("underlyings", "Comma-separated underlyings")
  .addParam("feeds", "Comma-separated feeds")
  .addParam("baseCurrency", "0 for native, 1 for USD")
  .setAction(async ({ underlyings: _underlyings, feeds: _feeds, baseCurrency }, { getNamedAccounts, ethers }) => {
    const underlyings = _underlyings.split(",");
    console.log("underlyings: ", underlyings);

    const feeds = _feeds.split(",");
    console.log("feeds: ", feeds);

    console.log("baseCurrency: ", baseCurrency);

    const { deployer } = await getNamedAccounts();

    const cpo = await ethers.getContract("ChainlinkPriceOracleV2", deployer);
    let tx = await cpo.setPriceFeeds(underlyings, feeds, baseCurrency);

    console.log("setPriceFeeds tx: ", tx);
    let receipt = await tx.wait();
    console.log("setPriceFeeds tx mined: ", receipt.transactionHash);

    const mpo = await ethers.getContract("MasterPriceOracle", deployer);
    tx = await mpo.add(underlyings, Array(underlyings.length).fill(cpo.address));

    console.log("add tx: ", tx);
    receipt = await tx.wait();
    console.log("add tx mined: ", receipt.transactionHash);
  });
