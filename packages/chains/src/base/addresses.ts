import { assetSymbols, ChainAddresses, underlying } from "@ionicprotocol/types";

import { assets } from "./assets";

const chainAddresses: ChainAddresses = {
  PAIR_INIT_HASH: "", // TODO is this used anywhere?
  STABLE_TOKEN: underlying(assets, assetSymbols.USDC),
  UNISWAP_V2_ROUTER: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
  UNISWAP_V2_FACTORY: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
  UNISWAP_V3: {
    FACTORY: "0x33128a8fC17869897dcE68Ed026d694621f6FDfD", // kim v4
    PAIR_INIT_HASH: "", // unused
    QUOTER_V2: "" // unused
  },
  UNISWAP_V3_ROUTER: "0x198EF79F1F515F02dFE9e3115eD9fC07183f02fC", // universal router, need to check if this works
  W_BTC_TOKEN: underlying(assets, assetSymbols.WBTC),
  W_TOKEN: underlying(assets, assetSymbols.WETH),
  W_TOKEN_USD_CHAINLINK_PRICE_FEED: "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
};

export default chainAddresses;
