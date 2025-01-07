// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

// import "forge-std/Test.sol";

// import { LeveredPosition } from "../ionic/levered/LeveredPosition.sol";
// import { ILeveredPositionFactory } from "../ionic/levered/ILeveredPositionFactory.sol";
// import { ICErc20 } from "../compound/CTokenInterfaces.sol";
// import { ILiquidatorsRegistry } from "../liquidators/registry/ILiquidatorsRegistry.sol";
// import { IRedemptionStrategy } from "../liquidators/IRedemptionStrategy.sol";
// import { IERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

// contract ezEthWethLeveredPositionTest is Test {
//   address me = 0x1155b614971f16758C92c4890eD338C9e3ede6b7;

//   function setUp() public {}

//   function test_ezEthWeth() public {
//     vm.createSelectFork(vm.rpcUrl("base_archive"));
//     vm.rollFork(19713666);

//     ILeveredPositionFactory factory = ILeveredPositionFactory(0x0Bd42a5226db7FCEb9D3e50539778A15C3665da8);
//     ICErc20 collateralMarket = ICErc20(0x014e08F05ac11BB532BE62774A4C548368f59779);
//     ICErc20 stableMarket = ICErc20(0xa900A17a49Bc4D442bA7F72c39FA2108865671f0);
//     uint256 depositAmount = 48672877617700471281;

//     IERC20Upgradeable collateralToken = IERC20Upgradeable(collateralMarket.underlying());
//     emit log_named_uint("collateral balance", collateralToken.balanceOf(me));

//     vm.startPrank(me);
//     collateralToken.approve(address(factory), depositAmount);
//     LeveredPosition position = factory.createAndFundPositionAtRatio(
//       collateralMarket,
//       stableMarket,
//       collateralToken,
//       depositAmount,
//       3 ether
//     );
//     vm.stopPrank();

//     uint256 _maxRatio;
//     uint256 _minRatio;

//     _maxRatio = position.getMaxLeverageRatio();
//     emit log_named_uint("max ratio", _maxRatio);
//     _minRatio = position.getMinLeverageRatio();
//     emit log_named_uint("min ratio", _minRatio);
//     assertGt(_maxRatio, _minRatio, "max ratio <= min ratio");

//     uint256 currentRatio = position.getCurrentLeverageRatio();
//     emit log_named_uint("current ratio", currentRatio);
//   }
// }
