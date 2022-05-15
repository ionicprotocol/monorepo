import { SupportedAsset } from "../../Fuse/types";
import { assetSymbols } from "./index";

export const assets: SupportedAsset[] = [
  {
    symbol: assetSymbols.WGLMR,
    underlying: "0xAcc15dC74880C9944775448304B263D191c6077F",
    name: "Wrapped GLMR ",
    decimals: 18,
  },
  {
    symbol: assetSymbols.GLINT,
    underlying: "0xcd3B51D98478D53F4515A306bE565c6EebeF1D58",
    name: "Beamswap Token",
    decimals: 18,
  },
  {
    symbol: assetSymbols.FTM,
    underlying: "0xC19281F22A075E0F10351cd5D6Ea9f0AC63d4327",
    name: "Fantom",
    decimals: 18,
  },
  {
    symbol: assetSymbols.USDC,
    underlying: "0x818ec0A7Fe18Ff94269904fCED6AE3DaE6d6dC0b",
    name: "USD Coin ",
    decimals: 18,
  },
  {
    symbol: assetSymbols.ETH,
    underlying: "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f",
    name: "ETH",
    decimals: 18,
  },
  {
    symbol: assetSymbols["GLMR-USDC"],
    underlying: "0xb929914B89584b4081C7966AC6287636F7EfD053",
    name: "BeamSwap GLMR-USDC LP Token",
    decimals: 18,
  },
  {
    symbol: assetSymbols["GLMR-GLINT"],
    underlying: "0x99588867e817023162F4d4829995299054a5fC57",
    name: "BeamSwap GLMR-GLINT LP Token",
    decimals: 18,
  },
];

export default assets;
