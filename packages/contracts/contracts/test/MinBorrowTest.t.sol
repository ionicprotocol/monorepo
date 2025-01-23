// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";

import { BaseTest } from "./config/BaseTest.t.sol";
import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

contract MinBorrowTest is BaseTest {
  FeeDistributor ffd;

  function afterForkSetUp() internal override {
    ffd = FeeDistributor(payable(ap.getAddress("FeeDistributor")));
  }

  function testMinBorrow() public fork(BSC_MAINNET) {
    IERC20Upgradeable usdc = IERC20Upgradeable(0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d);
    IERC20Upgradeable busd = IERC20Upgradeable(0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56);

    ICErc20 usdcMarket = ICErc20(0x16B8da195CdC7F380B333bf6cF2f0f33c1061755);
    ICErc20 busdMarket = ICErc20(0x3BCb7dbBe729B24bE6c660B3e8ADD1Cb352e371D);
    IonicComptroller comptroller = usdcMarket.comptroller();
    deal(address(usdc), address(this), 10000e18);
    deal(address(busd), address(1), 10000e18);

    usdc.approve(address(usdcMarket), 1e36);
    usdcMarket.mint(1000e18);

    vm.startPrank(address(1));
    busd.approve(address(busdMarket), 1e36);
    busdMarket.mint(1000e18);
    vm.stopPrank();

    // the 0 liquidity base min borrow amount
    uint256 baseMinBorrowEth = ffd.minBorrowEth();

    address[] memory cTokens = new address[](2);
    cTokens[0] = address(usdcMarket);
    cTokens[1] = address(busdMarket);
    comptroller.enterMarkets(cTokens);

    uint256 minBorrowEth = ffd.getMinBorrowEth(busdMarket);
    assertEq(minBorrowEth, baseMinBorrowEth, "!minBorrowEth for default min borrow eth");

    busdMarket.borrow(300e18);

    minBorrowEth = ffd.getMinBorrowEth(busdMarket);
    assertEq(minBorrowEth, 0, "!minBorrowEth after borrowing less amount than min amount");
  }
}
