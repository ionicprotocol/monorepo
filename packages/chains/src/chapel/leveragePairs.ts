import { LeveragePoolConfig } from "@ionicprotocol/types";

const TEST_BOMB = "0x9B6E1039103812E0dcC1100a158e4a68014b2571";
const TEST_WBNB = "0x9dD00920f5B74A31177cbaB834AB0904703c31B1";

const leveragePairs: LeveragePoolConfig[] = [
  { pool: "0xa4bc2fCF2F9d87EB349f74f8729024F92A030330", pairs: [{ borrow: TEST_WBNB, collateral: TEST_BOMB }] }
];

export default leveragePairs;
