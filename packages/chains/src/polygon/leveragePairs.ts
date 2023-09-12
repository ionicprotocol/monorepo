import { LeveragePoolConfig } from "@ionicprotocol/types";

// markets addresses
const STARSEED_USDC = "0x71A7037a42D0fB9F905a76B7D16846b2EACC59Aa";
const STARSEED_USDR = "0x1F11940B239D129dE0e5D30A3E59089af5Ecd6ed";
const STARSEED_WUSDR = "0x26EA46e975778662f98dAa0E7a12858dA9139262";
const STARSEED_USDR_DAI = "0xBcE30B4D78cEb9a75A1Aa62156529c3592b3F08b";
const STARSEED_USDC_USDR = "0x83DF24fE1B1eBF38048B91ffc4a8De0bAa88b891";
const STARSEED_WMATIC_USDR = "0xfacEdA4f9731797102f040380aD5e234c92d1942";
const STARSEED_USDR_TNGBL = "0x2E870Aeee3D9d1eA29Ec93d2c0A99A4e0D5EB697";
const STARSEED_WBTC_USDR = "0xffc8c8d747E52fAfbf973c64Bab10d38A6902c46";
const STARSEED_USDR_WETH = "0x343D9a8D2Bc6A62390aEc764bb5b900C4B039127";
const STARSEED_wUSDR_USDR = "0x06F61E22ef144f1cC4550D40ffbF681CB1C3aCAF";

const RETRO_CASH = "0xf69207CFDe6228A1e15A34F2b0c4fDe0845D9eBa";
const RETRO_WETH = "0x2469B23354cb7cA50b798663Ec5812Bf28d15e9e";
const RETRO_USDC = "0x38EbA94210bCEf3F9231E1764EE230abC14D1cbc";
const RETRO_USDC_CASH = "0x1D2A7078a404ab970f951d5A6dbECD9e24838FB6";
const RETRO_USDC_WETH = "0xC7cA03A0bE1dBAc350E5BfE5050fC5af6406490E";
const RETRO_WBTC_WETH = "0xCB1a06eff3459078c26516ae3a1dB44A61D2DbCA";

const DAVOS_USDC = "0x14787e50578d8c606C3d57bDbA53dD65Fd665449";
const DAVOS_DUSD = "0xE70d09dA78900A0429ee70b35200F70A30d7d2B9";

const STADER_WMATIC = "0xCb8D7c2690536d3444Da3d207f62A939483c8A93";
const STADER_MATICX = "0x6ebdbEe1a509247B4A3ac3b73a43bd434C52C7c2";

const leveragePairs: LeveragePoolConfig[] = [
  // StarSeed
  // USDC
  {
    pool: "0x",
    pairs: [
      // USDC borrow
      { borrow: STARSEED_USDC, collateral: STARSEED_USDC_USDR },
      // USDR borrow
      { borrow: STARSEED_USDR, collateral: STARSEED_USDR_DAI },
      { borrow: STARSEED_USDR, collateral: STARSEED_USDC_USDR },
      { borrow: STARSEED_USDR, collateral: STARSEED_WMATIC_USDR },
      { borrow: STARSEED_USDR, collateral: STARSEED_USDR_TNGBL },
      { borrow: STARSEED_USDR, collateral: STARSEED_WBTC_USDR },
      { borrow: STARSEED_USDR, collateral: STARSEED_USDR_WETH },
      { borrow: STARSEED_USDR, collateral: STARSEED_wUSDR_USDR },
      { borrow: STARSEED_USDR, collateral: STARSEED_WUSDR },
      { borrow: STARSEED_WUSDR, collateral: STARSEED_USDR },
      // wUSDR borrow
      { borrow: STARSEED_WUSDR, collateral: STARSEED_wUSDR_USDR }
    ]
  },

  // Retro pool
  {
    pool: "0x",
    pairs: [
      { borrow: RETRO_CASH, collateral: RETRO_USDC_CASH },
      { borrow: RETRO_USDC, collateral: RETRO_USDC_CASH },
      { borrow: RETRO_CASH, collateral: RETRO_USDC },
      { borrow: RETRO_CASH, collateral: RETRO_USDC_WETH },
      { borrow: RETRO_CASH, collateral: RETRO_WBTC_WETH },
      { borrow: RETRO_WETH, collateral: RETRO_WBTC_WETH }
    ]
  },
  // Davos
  { pool: "0x", pairs: [{ borrow: DAVOS_USDC, collateral: DAVOS_DUSD }] },
  // Stader MaticX
  { pool: "0x", pairs: [{ borrow: STADER_WMATIC, collateral: STADER_MATICX }] }
];

export default leveragePairs;
