import { task, types } from "hardhat/config";

const COMPTROLLER = "0xD265ff7e5487E9DD556a4BB900ccA6D087Eb3AD2";

const UNDERLYINGS = {
  "agEUR-jEUR": "0x2fFbCE9099cBed86984286A54e5932414aF4B717",
  "jEUR-PAR": "0x0f110c55EfE62c16D553A3d3464B77e1853d0e97",
  "jJPY-JPYC": "0xaA91CDD7abb47F821Cf07a2d38Cc8668DEAf1bdc",
  "jCAD-CADC (2cad)": "0xA69b0D5c0C401BBA2d5162138613B5E38584F63F",
  "jSGD-XSGD (2sgd)": "0xeF75E9C7097842AcC5D0869E1dB4e5fDdf4BFDDA",
  "jEUR-EURt": "0x2c3cc8e698890271c8141be9f6fd6243d56b39f1",
  "jNZD-NZDS": "0x976A750168801F58E8AEdbCfF9328138D544cc09",
};

const DETAILS = [
  // {
  //   strategyName: "AGEURJEUR",
  //   underlying: UNDERLYINGS["agEUR-jEUR"],
  //   deployedPlugin: "0x6578e774120F6010315784C69C634bF3946AFb0c",
  //   otherParams: ["0x5F1b5714f30bAaC4Cb1ee95E1d0cF6d5694c2204", "10"],
  // },
  // {
  //   strategyName: "JEURPAR",
  //   underlying: UNDERLYINGS["jEUR-PAR"],
  //   deployedPlugin: "0x74bA0D32B7430a2aad36e48B7aAD57bf233bDDa6",
  //   otherParams: ["0xfE1779834EaDD60660a7F3f576448D6010f5e3Fc", "10"],
  // },
  // {
  //   strategyName: "JJPYJPYC",
  //   underlying: UNDERLYINGS["jJPY-JPYC"],
  //   deployedPlugin: "0xCC9083ad35bd9d55eF9D4cB4C2A6e879fB70fdc1",
  //   otherParams: ["0x122E09FdD2FF73C8CEa51D432c45A474BAa1518a", "10"],
  // },
  // {
  //   strategyName: "JCADCADC",
  //   underlying: UNDERLYINGS["jCAD-CADC (2cad)"],
  //   deployedPlugin: "0x742EF90E1828FCEec848c8FB548d45Eaaf17B56d",
  //   otherParams: ["0xcf9Dd1de1D02158B3d422779bd5184032674A6D1", "10"],
  // },
  // {
  //   strategyName: "JSGDXSGD",
  //   underlying: UNDERLYINGS["jSGD-XSGD (2sgd)"],
  //   deployedPlugin: "0x05fCE131DA43e7Be1cdDda3137f402034a5232fc",
  //   otherParams: ["0x18DAdac6d0AAF37BaAAC811F6338427B46815a81", "10"],
  // },
  {
    strategyName: "JEUREURT",
    underlying: UNDERLYINGS["jEUR-EURt"],
    deployedPlugin: null,

    otherParams: ["0x26B7d2fe697e932907175A3920B5dC2C2e2440A4", "10"],
  },
  {
    strategyName: "JNZDNZDS",
    underlying: UNDERLYINGS["jNZD-NZDS"],
    deployedPlugin: null,
    otherParams: ["0x6720C2b7fd7dE1CAD3242dd3E8a86d033D4ed3f9", "10"],
  },
];

task("jarvis:polygon:deploy-plugins", "deploy beefy plugins for jarvis 2fiat pool on polygon")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    for (const detail of DETAILS) {
      await hre.run("plugin:deploy", {
        contractName: "BeefyERC4626",
        deploymentName: `BeefyERC4626_${detail.strategyName}_${COMPTROLLER}`,
        underlying: detail.underlying,
        creator: taskArgs.signer,
        otherParams: detail.otherParams.join(","),
      });
    }
  });

task("jarvis:polygon:whitelist-plugins", "deploy beefy plugins for jarvis 2fiat pool on polygon")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    for (const detail of DETAILS) {
      console.log(`whitelisting plugin for: ${detail.strategyName} ...`);

      // setting the whitelist for the first time for this plugin
      await hre.run("plugin:whitelist", {
        oldImplementation: detail.deployedPlugin,
        newImplementation: detail.deployedPlugin,
        admin: taskArgs.signer,
      });
    }
  });

task("jarvis:polygon:upgrade-implementations", "upgrade all markets of the polygon pool to handle plugins")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    const IMPLEMENTATION_ADDRESS = "0xDf35EaAE5bacd47d193cb3795be32756d6b5993d"; // Polygon CErc20PluginDelegate

    for (const detail of DETAILS) {
      console.log(`upgrading market for: ${detail.strategyName} ...`);

      await hre.run("market:upgrade", {
        comptroller: COMPTROLLER,
        underlying: detail.underlying, // FYI it's expecting the underlying here
        implementationAddress: IMPLEMENTATION_ADDRESS,
        pluginAddress: detail.deployedPlugin,
        signer: taskArgs.signer,
      });
    }
  });

task("jarvis:polygon:set-plugins", "set plugin for each market")
  .addParam("signer", "Named account to use for tx", "deployer", types.string)
  .setAction(async (taskArgs, hre) => {
    for (const detail of DETAILS) {
      await hre.run("market:set-plugin", {
        comptrollerAddress: COMPTROLLER,
        underlying: detail.underlying, // FYI it's expecting the underlying here
        pluginAddress: detail.deployedPlugin,
        signer: taskArgs.signer,
      });
    }
  });
