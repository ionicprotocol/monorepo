// // SPDX-License-Identifier: UNLICENSED
// pragma solidity >=0.8.0;

// import { BaseTest } from "../config/BaseTest.t.sol";

// import { JumpRateModel } from "../../compound/JumpRateModel.sol";

// contract InterestRateModelTest is BaseTest {
//   AnkrFTMInterestRateModel ankrCertificateInterestRateModelFTM;
//   AnkrBNBInterestRateModel ankrCertificateInterestRateModelBNB;

//   JumpRateModel jumpRateModel;
//   JumpRateModel mimoRateModel;

//   address ANKR_BNB_RATE_PROVIDER = 0xCb0006B31e6b403fEeEC257A8ABeE0817bEd7eBa;
//   address ANKR_BNB_BOND = 0x52F24a5e03aee338Da5fd9Df68D2b6FAe1178827;
//   address ANKR_FTM_RATE_PROVIDER = 0xB42bF10ab9Df82f9a47B86dd76EEE4bA848d0Fa2;

//   uint8 day = 3;

//   function afterForkSetUp() internal override {
//     if (block.chainid == BSC_MAINNET) {
//       ankrCertificateInterestRateModelBNB = new AnkrBNBInterestRateModel(
//         10512000,
//         0.5e16,
//         3e18,
//         0.85e18,
//         day,
//         ANKR_BNB_RATE_PROVIDER,
//         ANKR_BNB_BOND
//       );
//       jumpRateModel = new JumpRateModel(10512000, 0.2e17, 0.18e18, 4e18, 0.8e18);
//     } else if (block.chainid == POLYGON_MAINNET) {
//       mimoRateModel = new JumpRateModel(13665600, 2e18, 0.4e17, 4e18, 0.8e18);
//       jumpRateModel = new JumpRateModel(13665600, 0.2e17, 0.18e18, 2e18, 0.8e18);
//     }
//   }

//   function testBscIrm() public fork(BSC_MAINNET) {
//     testJumpRateBorrowRate();
//     testJumpRateSupplyRate();
//     testAnkrBNBBorrowModelRate();
//     testAnkrBNBSupplyModelRate();
//   }

//   function testPolygonIrm() public fork(POLYGON_MAINNET) {
//     testJumpRateBorrowRatePolygon();
//   }

//   function _convertToPerYearBsc(uint256 value) internal pure returns (uint256) {
//     return value * 10512000;
//   }

//   function _convertToPerYearPolygon(uint256 value) internal pure returns (uint256) {
//     return value * 13665600;
//   }

//   function _convertToPerYearFtm(uint256 value) internal pure returns (uint256) {
//     return value * 21024000;
//   }

//   function testJumpRateBorrowRatePolygon() internal {
//     uint256 borrowRate = mimoRateModel.getBorrowRate(0, 0, 5e18);
//     assertGe(_convertToPerYearPolygon(borrowRate), 0);
//     assertLe(_convertToPerYearPolygon(borrowRate), 100e18);
//     borrowRate = mimoRateModel.getBorrowRate(1e18, 10e18, 5e18);
//     assertGe(_convertToPerYearPolygon(borrowRate), 0);
//     assertLe(_convertToPerYearPolygon(borrowRate), 100e18);
//     borrowRate = mimoRateModel.getBorrowRate(2e18, 10e18, 5e18);
//     assertGe(_convertToPerYearPolygon(borrowRate), 0);
//     assertLe(_convertToPerYearPolygon(borrowRate), 100e18);
//     borrowRate = mimoRateModel.getBorrowRate(3e18, 10e18, 5e18);
//     assertGe(_convertToPerYearPolygon(borrowRate), 0);
//     assertLe(_convertToPerYearPolygon(borrowRate), 100e18);
//     borrowRate = mimoRateModel.getBorrowRate(4e18, 10e18, 5e18);
//     assertGe(_convertToPerYearPolygon(borrowRate), 0);
//     assertLe(_convertToPerYearPolygon(borrowRate), 100e18);
//     borrowRate = mimoRateModel.getBorrowRate(5e18, 10e18, 5e18);
//     assertGe(_convertToPerYearPolygon(borrowRate), 0);
//     assertLe(_convertToPerYearPolygon(borrowRate), 100e18);
//     borrowRate = mimoRateModel.getBorrowRate(6e18, 10e18, 5e18);
//     assertGe(_convertToPerYearPolygon(borrowRate), 0);
//     assertLe(_convertToPerYearPolygon(borrowRate), 100e18);
//   }

//   function testJumpRateBorrowRate() internal {
//     uint256 borrowRate = jumpRateModel.getBorrowRate(0, 0, 5e18);
//     assertGe(_convertToPerYearBsc(borrowRate), 0);
//     assertLe(_convertToPerYearBsc(borrowRate), 100e18);
//     borrowRate = jumpRateModel.getBorrowRate(1e18, 10e18, 5e18);
//     assertGe(_convertToPerYearBsc(borrowRate), 0);
//     assertLe(_convertToPerYearBsc(borrowRate), 100e18);
//     borrowRate = jumpRateModel.getBorrowRate(2e18, 10e18, 5e18);
//     assertGe(_convertToPerYearBsc(borrowRate), 0);
//     assertLe(_convertToPerYearBsc(borrowRate), 100e18);
//     borrowRate = jumpRateModel.getBorrowRate(3e18, 10e18, 5e18);
//     assertGe(_convertToPerYearBsc(borrowRate), 0);
//     assertLe(_convertToPerYearBsc(borrowRate), 100e18);
//     borrowRate = jumpRateModel.getBorrowRate(4e18, 10e18, 5e18);
//     assertGe(_convertToPerYearBsc(borrowRate), 0);
//     assertLe(_convertToPerYearBsc(borrowRate), 100e18);
//     borrowRate = jumpRateModel.getBorrowRate(5e18, 10e18, 5e18);
//     assertGe(_convertToPerYearBsc(borrowRate), 0);
//     assertLe(_convertToPerYearBsc(borrowRate), 100e18);
//     borrowRate = jumpRateModel.getBorrowRate(6e18, 10e18, 5e18);
//     assertGe(_convertToPerYearBsc(borrowRate), 0);
//     assertLe(_convertToPerYearBsc(borrowRate), 100e18);
//   }

//   function testJumpRateSupplyRate() internal {
//     uint256 supplyRate = jumpRateModel.getSupplyRate(0, 10e18, 5e18, 0.2e18);
//     assertGe(_convertToPerYearBsc(supplyRate), 0);
//     assertLe(_convertToPerYearBsc(supplyRate), 100e18);
//     jumpRateModel.getSupplyRate(10e18, 10e18, 5e18, 0.2e18);
//     assertGe(_convertToPerYearBsc(supplyRate), 0);
//     assertLe(_convertToPerYearBsc(supplyRate), 100e18);
//     jumpRateModel.getSupplyRate(20e18, 10e18, 20e18, 0.2e18);
//     assertGe(_convertToPerYearBsc(supplyRate), 0);
//     assertLe(_convertToPerYearBsc(supplyRate), 100e18);
//     jumpRateModel.getSupplyRate(30e18, 10e18, 30e18, 0.2e18);
//     assertGe(_convertToPerYearBsc(supplyRate), 0);
//     assertLe(_convertToPerYearBsc(supplyRate), 100e18);
//     jumpRateModel.getSupplyRate(40e18, 10e18, 10e18, 0.2e18);
//     assertGe(_convertToPerYearBsc(supplyRate), 0);
//     assertLe(_convertToPerYearBsc(supplyRate), 100e18);
//     jumpRateModel.getSupplyRate(50e18, 10e18, 40e18, 0.2e18);
//     assertGe(_convertToPerYearBsc(supplyRate), 0);
//     assertLe(_convertToPerYearBsc(supplyRate), 100e18);
//     jumpRateModel.getSupplyRate(60e18, 10e18, 60e18, 0.2e18);
//     assertGe(_convertToPerYearBsc(supplyRate), 0);
//     assertLe(_convertToPerYearBsc(supplyRate), 100e18);
//   }

//   function testAnkrFTMBorrowModelRate() internal {
//     vm.mockCall(
//       address(ANKR_FTM_RATE_PROVIDER),
//       abi.encodeWithSelector(IAnkrFTMRateProvider.averagePercentageRate.selector),
//       abi.encode(5e18)
//     );
//     // utilization 1 -> borrow rate: 0.084%
//     uint256 borrowRate = ankrCertificateInterestRateModelFTM.getBorrowRate(800e18, 8e18, 8e18);
//     uint256 util = ankrCertificateInterestRateModelFTM.utilizationRate(800e18, 8e18, 8e18);
//     assertEq(util, 0.1e17);
//     assertApproxEqRel(_convertToPerYearFtm(borrowRate) * 100, 0.084e18, 1e16, "!borrow rate for utilization 1");

//     // utilization 10 -> borrow rate: 0.61%
//     borrowRate = ankrCertificateInterestRateModelFTM.getBorrowRate(80e18, 8e18, 8e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(80e18, 8e18, 8e18);
//     assertEq(util, 0.1e18);
//     assertApproxEqRel(_convertToPerYearFtm(borrowRate) * 100, 0.61e18, 1e16, "!borrow rate for utilization 10");

//     // utilization 20 -> borrow rate: 1.2%
//     borrowRate = ankrCertificateInterestRateModelFTM.getBorrowRate(40e18, 8e18, 8e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(40e18, 8e18, 8e18);
//     assertEq(util, 0.2e18);
//     assertApproxEqRel(_convertToPerYearFtm(borrowRate) * 100, 1.2e18, 1e16, "!borrow rate for utilization 20");

//     // utilization 80 -> borrow rate: 4.7%
//     borrowRate = ankrCertificateInterestRateModelFTM.getBorrowRate(3e18, 8e18, 1e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(3e18, 8e18, 1e18);
//     assertEq(util, 0.8e18);
//     assertApproxEqRel(_convertToPerYearFtm(borrowRate) * 100, 4.7e18, 1e16, "!borrow rate for utilization 80");

//     // utilization 90 -> borrow rate: 20.3%
//     borrowRate = ankrCertificateInterestRateModelFTM.getBorrowRate(8e18, 7.2e18, 7.2e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(8e18, 7.2e18, 7.2e18);
//     assertEq(util, 0.9e18);
//     assertApproxEqRel(_convertToPerYearFtm(borrowRate) * 100, 20.3e18, 1e16, "!borrow rate for utilization 90");
//   }

//   function testAnkrBNBBorrowModelRate() internal {
//     vm.mockCall(
//       address(ANKR_BNB_RATE_PROVIDER),
//       abi.encodeWithSelector(IAnkrBNBRateProvider.averagePercentageRate.selector),
//       abi.encode(2.5e18)
//     );

//     // utilization 1 -> borrow rate: 0.04%
//     uint256 borrowRate = ankrCertificateInterestRateModelBNB.getBorrowRate(800e18, 8e18, 8e18);
//     uint256 util = ankrCertificateInterestRateModelBNB.utilizationRate(800e18, 8e18, 8e18);
//     assertEq(util, 0.1e17);
//     assertApproxEqRel(_convertToPerYearBsc(borrowRate) * 100, 0.04e18, 1e17, "!borrow rate for utilization 1");

//     // utilization 10 -> borrow rate: 0.3%
//     borrowRate = ankrCertificateInterestRateModelBNB.getBorrowRate(80e18, 8e18, 8e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(80e18, 8e18, 8e18);
//     assertEq(util, 0.1e18);
//     assertApproxEqRel(_convertToPerYearBsc(borrowRate) * 100, 0.3e18, 1e17, "!borrow rate for utilization 10");

//     // utilization 20 -> borrow rate: 0.6%
//     borrowRate = ankrCertificateInterestRateModelBNB.getBorrowRate(40e18, 8e18, 8e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(40e18, 8e18, 8e18);
//     assertEq(util, 0.2e18);
//     assertApproxEqRel(_convertToPerYearBsc(borrowRate) * 100, 0.6e18, 1e17, "!borrow rate for utilization 20");

//     // utilization 80 -> borrow rate: 2.36%
//     borrowRate = ankrCertificateInterestRateModelBNB.getBorrowRate(3e18, 8e18, 1e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(3e18, 8e18, 1e18);
//     assertEq(util, 0.8e18);
//     assertApproxEqRel(_convertToPerYearBsc(borrowRate) * 100, 2.36e18, 1e17, "!borrow rate for utilization 80");

//     // utilization 90 -> borrow rate: 17%
//     borrowRate = ankrCertificateInterestRateModelBNB.getBorrowRate(8e18, 7.2e18, 7.2e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(8e18, 7.2e18, 7.2e18);
//     assertEq(util, 0.9e18);
//     assertApproxEqRel(_convertToPerYearBsc(borrowRate) * 100, 17e18, 1e17, "!borrow rate for utilization 90");
//   }

//   function testAnkrFTMSupplyModelRate() internal {
//     vm.mockCall(
//       address(ANKR_FTM_RATE_PROVIDER),
//       abi.encodeWithSelector(IAnkrFTMRateProvider.averagePercentageRate.selector),
//       abi.encode(5e18)
//     );

//     // utilization 1 -> supply rate: 0.00075%
//     uint256 supplyRate = ankrCertificateInterestRateModelFTM.getSupplyRate(800e18, 8e18, 8e18, 0.1e18);
//     uint256 util = ankrCertificateInterestRateModelFTM.utilizationRate(800e18, 8e18, 8e18);
//     assertEq(util, 0.1e17);
//     assertApproxEqRel(_convertToPerYearFtm(supplyRate) * 100, 0.00075e18, 1e16, "!supply rate for utilization 1");

//     // utilization 10 -> supply rate: 0.0055%
//     supplyRate = ankrCertificateInterestRateModelFTM.getSupplyRate(80e18, 8e18, 8e18, 0.1e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(80e18, 8e18, 8e18);
//     assertEq(util, 0.1e18);
//     assertApproxEqRel(_convertToPerYearFtm(supplyRate) * 100, 0.055e18, 1e16, "!supply rate for utilization 10");

//     // utilization 20 -> supply rate: 0.022%
//     supplyRate = ankrCertificateInterestRateModelFTM.getSupplyRate(40e18, 8e18, 8e18, 0.1e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(40e18, 8e18, 8e18);
//     assertEq(util, 0.2e18);
//     assertApproxEqRel(_convertToPerYearFtm(supplyRate) * 100, 0.216e18, 1e16, "!supply rate for utilization 20");

//     // utilization 80 -> supply rate: 3.4%
//     supplyRate = ankrCertificateInterestRateModelFTM.getSupplyRate(3e18, 8e18, 1e18, 0.1e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(3e18, 8e18, 1e18);
//     assertEq(util, 0.8e18);
//     assertApproxEqRel(_convertToPerYearFtm(supplyRate) * 100, 3.4e18, 1e16, "!supply rate for utilization 80");

//     // utilization 90 -> supply rate: 16.5%
//     supplyRate = ankrCertificateInterestRateModelFTM.getSupplyRate(8e18, 7.2e18, 7.2e18, 0.1e18);
//     util = ankrCertificateInterestRateModelFTM.utilizationRate(8e18, 7.2e18, 7.2e18);
//     assertEq(util, 0.9e18);
//     assertApproxEqRel(_convertToPerYearFtm(supplyRate) * 100, 16.5e18, 1e16, "!supply rate for utilization 90");
//   }

//   function testAnkrBNBSupplyModelRate() internal {
//     vm.mockCall(
//       address(ANKR_BNB_RATE_PROVIDER),
//       abi.encodeWithSelector(IAnkrBNBRateProvider.averagePercentageRate.selector),
//       abi.encode(2.5e18)
//     );

//     // utilization 1 -> supply rate: 0.00037%
//     uint256 supplyRate = ankrCertificateInterestRateModelBNB.getSupplyRate(800e18, 8e18, 8e18, 0.1e18);
//     uint256 util = ankrCertificateInterestRateModelBNB.utilizationRate(800e18, 8e18, 8e18);
//     assertEq(util, 0.1e17);
//     assertApproxEqRel(_convertToPerYearBsc(supplyRate) * 100, 0.00037e18, 1e17, "!supply rate for utilization 1");

//     // utilization 10 -> supply rate: 0.027%
//     supplyRate = ankrCertificateInterestRateModelBNB.getSupplyRate(80e18, 8e18, 8e18, 0.1e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(80e18, 8e18, 8e18);
//     assertEq(util, 0.1e18);
//     assertApproxEqRel(_convertToPerYearBsc(supplyRate) * 100, 0.027e18, 1e17, "!supply rate for utilization 10");

//     // utilization 20 -> supply rate: 0.1%
//     supplyRate = ankrCertificateInterestRateModelBNB.getSupplyRate(40e18, 8e18, 8e18, 0.1e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(40e18, 8e18, 8e18);
//     assertEq(util, 0.2e18);
//     assertApproxEqRel(_convertToPerYearBsc(supplyRate) * 100, 0.1e18, 1e17, "!supply rate for utilization 20");

//     // utilization 80 -> supply rate: 1.7%
//     supplyRate = ankrCertificateInterestRateModelBNB.getSupplyRate(3e18, 8e18, 1e18, 0.1e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(3e18, 8e18, 1e18);
//     assertEq(util, 0.8e18);
//     assertApproxEqRel(_convertToPerYearBsc(supplyRate) * 100, 1.7e18, 1e17, "!supply rate for utilization 80");

//     // utilization 90 -> supply rate: 14.3%
//     supplyRate = ankrCertificateInterestRateModelBNB.getSupplyRate(8e18, 7.2e18, 7.2e18, 0.1e18);
//     util = ankrCertificateInterestRateModelBNB.utilizationRate(8e18, 7.2e18, 7.2e18);
//     assertEq(util, 0.9e18);
//     assertApproxEqRel(_convertToPerYearBsc(supplyRate) * 100, 14.3e18, 1e17, "!supply rate for utilization 90");
//   }
// }
