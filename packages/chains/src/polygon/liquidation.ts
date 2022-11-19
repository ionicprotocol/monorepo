import { assetSymbols, LiquidationDefaults, LiquidationStrategy, underlying } from "@midas-capital/types";
import { BigNumber, constants } from "ethers";

import chainAddresses from "./addresses";
import { assets } from "./assets";

const liquidationDefaults: LiquidationDefaults = {
  DEFAULT_ROUTER: chainAddresses.UNISWAP_V2_ROUTER,
  ASSET_SPECIFIC_ROUTER: {},
  SUPPORTED_OUTPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WMATIC)],
  SUPPORTED_INPUT_CURRENCIES: [constants.AddressZero, underlying(assets, assetSymbols.WMATIC)],
  LIQUIDATION_STRATEGY: LiquidationStrategy.UNISWAP,
  MINIMUM_PROFIT_NATIVE: BigNumber.from(0),
  LIQUIDATION_INTERVAL_SECONDS: 30,
  jarvisPools: [
    // jAUD <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x36572797Cc569A74731E0738Ef56e3b8ce3F309c",
      syntheticToken: underlying(assets, assetSymbols.JAUD),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jGBP <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x36d6D1d6249fbC6EBd0fC28fd46C846fB69b9074",
      syntheticToken: underlying(assets, assetSymbols.JGBP),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jCAD <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x06440a2DA257233790B5355322dAD82C10F0389A",
      syntheticToken: underlying(assets, assetSymbols.JCAD),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jCHF <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x8734CF40A402D4191BD4D7a64bEeF12E4c452DeF",
      syntheticToken: underlying(assets, assetSymbols.JCHF),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jCNY <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x72E7Da7C0dD3C082Dfe8f22343D6AD70286e07bd",
      syntheticToken: underlying(assets, assetSymbols.JCNY),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    // //  jCOP <-> USDC
    // {
    //   expirationTime: 40 * 60,
    //   liquidityPoolAddress: "0x1493607042C5725cEf277A83CFC94caA4fc6278F",
    //   syntheticToken: underlying(assets, assetSymbols.JCOP),
    //   collateralToken: underlying(assets, assetSymbols.USDC),
    // },
    //  jEUR <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x65a7b4Ff684C2d08c115D55a4B089bf4E92F5003",
      syntheticToken: underlying(assets, assetSymbols.JEUR),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jJPY <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0xAEc757BF73cc1f4609a1459205835Dd40b4e3F29",
      syntheticToken: underlying(assets, assetSymbols.JJPY),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jKRW <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x7aC6515f4772fcB6EEeF978f60D996B21C56089D",
      syntheticToken: underlying(assets, assetSymbols.JKRW),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jMXN <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x25E9F976f5020F6BF2d417b231e5f414b7700E31",
      syntheticToken: underlying(assets, assetSymbols.JMXN),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    // //  jNGN <-> USDC
    // {
    //   expirationTime: 40 * 60,
    //   liquidityPoolAddress: "0x63B5891895A57C31d5Ec2a8A5521b6EE67700f9F",
    //   syntheticToken: underlying(assets, assetSymbols.JNGN),
    //   collateralToken: underlying(assets, assetSymbols.USDC),
    // },
    //  jNZD <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x4FDA1B4b16f5F2535482b91314018aE5A2fda602",
      syntheticToken: underlying(assets, assetSymbols.JNZD),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jPHP <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x8aE34663B4622336818e334dC42f92C41eFbfa35",
      syntheticToken: underlying(assets, assetSymbols.JPHP),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jPLN <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0x166e4B3Ec3F81F32f0863B9cD63621181d6bFED5",
      syntheticToken: underlying(assets, assetSymbols.JPLN),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jSEK <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0xc8442072CF1E131506eaC7df33eA8910e1d5cFDd",
      syntheticToken: underlying(assets, assetSymbols.JSEK),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
    //  jSGD <-> USDC
    {
      expirationTime: 40 * 60,
      liquidityPoolAddress: "0xBE813590e1B191120f5df3343368f8a2F579514C",
      syntheticToken: underlying(assets, assetSymbols.JSGD),
      collateralToken: underlying(assets, assetSymbols.USDC),
    },
  ],
  curveSwapPools: [
    {
      poolAddress: underlying(assets, assetSymbols["AGEUR-JEUR"]),
      coins: [
        underlying(assets, assetSymbols.AGEUR), // coin 0
        underlying(assets, assetSymbols.JEUR), // coin 1
      ],
    },
    {
      poolAddress: underlying(assets, assetSymbols["JEUR-PAR"]),
      coins: [
        underlying(assets, assetSymbols.PAR), // coin 0
        underlying(assets, assetSymbols.JEUR), // coin 1
      ],
    },
    {
      poolAddress: underlying(assets, assetSymbols["JJPY-JPYC"]),
      coins: [
        underlying(assets, assetSymbols.JJPY), // coin 0
        underlying(assets, assetSymbols.JPYC), // coin 1
      ],
    },
    {
      poolAddress: underlying(assets, assetSymbols["JCAD-CADC"]),
      coins: [
        underlying(assets, assetSymbols.JCAD), // coin 0
        underlying(assets, assetSymbols.CADC), // coin 1
      ],
    },
    {
      poolAddress: underlying(assets, assetSymbols["JSGD-XSGD"]),
      coins: [
        underlying(assets, assetSymbols.JSGD), // coin 0
        underlying(assets, assetSymbols.XSGD), // coin 1
      ],
    },
    {
      poolAddress: underlying(assets, assetSymbols["JNZD-NZDS"]),
      coins: [
        underlying(assets, assetSymbols.JNZD), // coin 0
        underlying(assets, assetSymbols.NZDS), // coin 1
      ],
    },
    {
      poolAddress: underlying(assets, assetSymbols["JEUR-EURT"]),
      coins: [
        underlying(assets, assetSymbols.EURT), // coin 0
        underlying(assets, assetSymbols.JEUR), // coin 1
      ],
    },
    {
      poolAddress: underlying(assets, assetSymbols["EURE-JEUR"]),
      coins: [
        underlying(assets, assetSymbols.EURE), // coin 0
        underlying(assets, assetSymbols.JEUR), // coin 1
      ],
    },
  ],
};

export default liquidationDefaults;
