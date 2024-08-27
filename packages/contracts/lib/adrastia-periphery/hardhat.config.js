require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("hardhat-gas-reporter");
require("hardhat-tracer");
require("@atixlabs/hardhat-time-n-mine");
require("@nomiclabs/hardhat-etherscan");

const SOLC_8 = {
    version: "0.8.13",
    settings: {
        optimizer: {
            enabled: true,
            runs: 2000,
        },
    },
};

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    solidity: {
        compilers: [SOLC_8],
    },
    networks: {
        hardhat: {
            forking: {
                url: process.env.ETHEREUM_URL || "",
            },
            mining: {
                auto: true,
                mempool: {
                    order: "fifo",
                },
            },
        },
        polygon: {
            chainId: 137,
            url: process.env.POLYGON_URL || "",
        },
    },
    etherscan: {
        apiKey: {
            mainnet: process.env.ETHERSCAN_API_KEY,
            polygon: process.env.POLYGONSCAN_API_KEY,
        },
    },
};
