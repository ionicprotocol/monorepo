// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import { IERC20Upgradeable } from "@openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import { UpgradesBaseTest } from "./UpgradesBaseTest.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { CTokenFirstExtension, DiamondExtension } from "../compound/CTokenFirstExtension.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { InterestRateModel } from "../compound/InterestRateModel.sol";

struct AccrualDiff {
  uint256 borrowIndex;
  uint256 totalBorrows;
  uint256 totalReserves;
  uint256 totalIonicFees;
  uint256 totalAdminFees;
}

contract AccrueInterestTest is UpgradesBaseTest {
  // fork before the accrue interest refactoring
  function testAccrueInterest() public debuggingOnly forkAtBlock(BSC_MAINNET, 26032460) {
    address busdMarketAddress = 0xa7213deB44f570646Ea955771Cc7f39B58841363;
    address wbnbMarketAddress = 0x57a64a77f8E4cFbFDcd22D5551F52D675cc5A956;

    _testAccrueInterest(wbnbMarketAddress);
  }

  function _testAccrueInterest(address marketAddress) internal {
    //CErc20Delegate market = CErc20Delegate(marketAddress);
    CTokenFirstExtension marketAsExt = CTokenFirstExtension(marketAddress);
    ICErc20 market = ICErc20(marketAddress);

    uint256 adminFeeMantissa = market.adminFeeMantissa();
    uint256 ionicFeeMantissa = market.ionicFeeMantissa();
    uint256 reserveFactorMantissa = market.reserveFactorMantissa();

    // test with the logic before the refactoring

    AccrualDiff memory diffBefore;
    // accrue at the latest block in order to have an equal/comparable accrual period
    marketAsExt.accrueInterest();
    {
      CTokenFirstExtension.InterestAccrual memory accrualDataBefore;
      CTokenFirstExtension.InterestAccrual memory accrualDataAfter;

      accrualDataBefore.accrualBlockNumber = marketAsExt.accrualBlockNumber();
      accrualDataBefore.borrowIndex = marketAsExt.borrowIndex();
      accrualDataBefore.totalBorrows = marketAsExt.totalBorrows();
      accrualDataBefore.totalReserves = marketAsExt.totalReserves();
      accrualDataBefore.totalIonicFees = marketAsExt.totalIonicFees();
      accrualDataBefore.totalAdminFees = marketAsExt.totalAdminFees();
      accrualDataBefore.totalSupply = marketAsExt.totalSupply();

      vm.roll(block.number + 1e6); // move 1M blocks forward
      marketAsExt.accrueInterest();

      accrualDataAfter.accrualBlockNumber = marketAsExt.accrualBlockNumber();
      accrualDataAfter.borrowIndex = marketAsExt.borrowIndex();
      accrualDataAfter.totalBorrows = marketAsExt.totalBorrows();
      accrualDataAfter.totalReserves = marketAsExt.totalReserves();
      accrualDataAfter.totalIonicFees = marketAsExt.totalIonicFees();
      accrualDataAfter.totalAdminFees = marketAsExt.totalAdminFees();
      accrualDataAfter.totalSupply = marketAsExt.totalSupply();

      assertEq(
        accrualDataBefore.accrualBlockNumber,
        accrualDataAfter.accrualBlockNumber - 1e6,
        "!total supply old impl"
      );
      assertLt(accrualDataBefore.borrowIndex, accrualDataAfter.borrowIndex, "!borrow index old impl");
      assertLt(accrualDataBefore.totalBorrows, accrualDataAfter.totalBorrows, "!total borrows old impl");
      if (reserveFactorMantissa > 0) {
        assertLt(accrualDataBefore.totalReserves, accrualDataAfter.totalReserves, "!total reserves old impl");
      }
      if (ionicFeeMantissa > 0) {
        assertLt(accrualDataBefore.totalIonicFees, accrualDataAfter.totalIonicFees, "!total ionic fees old impl");
      }
      if (adminFeeMantissa > 0) {
        assertLt(accrualDataBefore.totalAdminFees, accrualDataAfter.totalAdminFees, "!total admin fees old impl");
      }
      assertEq(accrualDataBefore.totalSupply, accrualDataAfter.totalSupply, "!total supply old impl");

      diffBefore.borrowIndex = accrualDataAfter.borrowIndex - accrualDataBefore.borrowIndex;
      diffBefore.totalBorrows = accrualDataAfter.totalBorrows - accrualDataBefore.totalBorrows;
      diffBefore.totalReserves = accrualDataAfter.totalReserves - accrualDataBefore.totalReserves;
      diffBefore.totalIonicFees = accrualDataAfter.totalIonicFees - accrualDataBefore.totalIonicFees;
      diffBefore.totalAdminFees = accrualDataAfter.totalAdminFees - accrualDataBefore.totalAdminFees;
    }

    // test with the logic after the refactoring
    vm.rollFork(26032460);
    afterForkSetUp();
    _upgradeMarketWithExtension(market);

    AccrualDiff memory diffAfter;
    // accrue at the latest block in order to have an equal/comparable accrual period
    marketAsExt.accrueInterest();
    {
      CTokenFirstExtension.InterestAccrual memory accrualDataBefore;
      CTokenFirstExtension.InterestAccrual memory accrualDataAfter;

      accrualDataBefore.accrualBlockNumber = marketAsExt.accrualBlockNumber();
      accrualDataBefore.borrowIndex = marketAsExt.borrowIndex();
      accrualDataBefore.totalBorrows = marketAsExt.totalBorrows();
      accrualDataBefore.totalReserves = marketAsExt.totalReserves();
      accrualDataBefore.totalIonicFees = marketAsExt.totalIonicFees();
      accrualDataBefore.totalAdminFees = marketAsExt.totalAdminFees();
      accrualDataBefore.totalSupply = marketAsExt.totalSupply();

      vm.roll(block.number + 1e6); // move 1M blocks forward
      marketAsExt.accrueInterest();

      accrualDataAfter.accrualBlockNumber = marketAsExt.accrualBlockNumber();
      accrualDataAfter.borrowIndex = marketAsExt.borrowIndex();
      accrualDataAfter.totalBorrows = marketAsExt.totalBorrows();
      accrualDataAfter.totalReserves = marketAsExt.totalReserves();
      accrualDataAfter.totalIonicFees = marketAsExt.totalIonicFees();
      accrualDataAfter.totalAdminFees = marketAsExt.totalAdminFees();
      accrualDataAfter.totalSupply = marketAsExt.totalSupply();

      assertEq(
        accrualDataBefore.accrualBlockNumber,
        accrualDataAfter.accrualBlockNumber - 1e6,
        "!total supply old impl"
      );
      assertLt(accrualDataBefore.borrowIndex, accrualDataAfter.borrowIndex, "!borrow index new impl");
      assertLt(accrualDataBefore.totalBorrows, accrualDataAfter.totalBorrows, "!total borrows new impl");
      if (reserveFactorMantissa > 0) {
        assertLt(accrualDataBefore.totalReserves, accrualDataAfter.totalReserves, "!total reserves new impl");
      }
      if (ionicFeeMantissa > 0) {
        assertLt(accrualDataBefore.totalIonicFees, accrualDataAfter.totalIonicFees, "!total ionic fees new impl");
      }
      if (adminFeeMantissa > 0) {
        assertLt(accrualDataBefore.totalAdminFees, accrualDataAfter.totalAdminFees, "!total admin fees new impl");
      }
      assertEq(accrualDataBefore.totalSupply, accrualDataAfter.totalSupply, "!total supply new impl");

      diffAfter.borrowIndex = accrualDataAfter.borrowIndex - accrualDataBefore.borrowIndex;
      diffAfter.totalBorrows = accrualDataAfter.totalBorrows - accrualDataBefore.totalBorrows;
      diffAfter.totalReserves = accrualDataAfter.totalReserves - accrualDataBefore.totalReserves;
      diffAfter.totalIonicFees = accrualDataAfter.totalIonicFees - accrualDataBefore.totalIonicFees;
      diffAfter.totalAdminFees = accrualDataAfter.totalAdminFees - accrualDataBefore.totalAdminFees;
    }

    assertEq(diffBefore.borrowIndex, diffAfter.borrowIndex, "!borrowIndexDiff");
    assertEq(diffBefore.totalBorrows, diffAfter.totalBorrows, "!totalBorrowsDiff");
    assertEq(diffBefore.totalReserves, diffAfter.totalReserves, "!totalReservesDiff");
    assertEq(diffBefore.totalIonicFees, diffAfter.totalIonicFees, "!totalIonicFeesDiff");
    assertEq(diffBefore.totalAdminFees, diffAfter.totalAdminFees, "!totalAdminFeesDiff");
  }

  function _functionCall(
    address target,
    bytes memory data,
    string memory errorMessage
  ) internal returns (bytes memory) {
    (bool success, bytes memory returndata) = target.call(data);

    if (!success) {
      // Look for revert reason and bubble it up if present
      if (returndata.length > 0) {
        // The easiest way to bubble the revert reason is using memory via assembly

        // solhint-disable-next-line no-inline-assembly
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }

    return returndata;
  }

  function testMintGated() public fork(POLYGON_MAINNET) {
    address newMarket = 0x71A7037a42D0fB9F905a76B7D16846b2EACC59Aa;
    address assetWhale = 0x5a52E96BAcdaBb82fd05763E25335261B270Efcb;
    // approve spending
    vm.startPrank(assetWhale);
    IERC20Upgradeable(CErc20Delegate(newMarket).underlying()).approve(newMarket, 1e6);
    require(CErc20Delegate(newMarket).mint(1e6) == 0, "!mint failed");
    vm.stopPrank();
  }

  function testDeployCToken() public debuggingOnly fork(POLYGON_MAINNET) {
    CErc20Delegate cErc20Delegate = new CErc20Delegate();
    IonicComptroller pool = IonicComptroller(0x69617fE545804BcDfE853626B4C8EF23475Ac54B);
    emit log_named_address("admin", pool.admin());
    pool.adminHasRights();
    vm.startPrank(0x9308dddeC9B5cCd8a2685A46E913C892FE31C826);
    pool._deployMarket(
      cErc20Delegate.delegateType(),
      abi.encode(
        address(0xb5DFABd7fF7F83BAB83995E72A52B97ABb7bcf63),
        0x69617fE545804BcDfE853626B4C8EF23475Ac54B,
        payable(address(0x62E27eA8d0389390039277CFfD83Ca18ce9B2D9c)),
        InterestRateModel(address(0xA433B7d3a8A87D8fd40dA68A424007Dd8a21Ce41)),
        "cUnderlyingToken",
        "CUT",
        uint256(0),
        uint256(0)
      ),
      "",
      0.72e18
    );
    vm.stopPrank();
    // _functionCall(0xC40119C7269A5FA813d878BF83d14E3462fC8Fde, hex"8f93bfba", "raw liquidation failed");
  }

  function testDeployNeonPool() public debuggingOnly fork(NEON_MAINNET) {
    PoolDirectory poolDirectory = PoolDirectory(0x297a15F615aCdf87580af1Fc497EE57424975Dae);
    FeeDistributor ionicAdmin = FeeDistributor(payable(0x62E27eA8d0389390039277CFfD83Ca18ce9B2D9c));
    Comptroller tempComptroller = new Comptroller();
    vm.prank(ionicAdmin.owner());
    ionicAdmin._setLatestComptrollerImplementation(address(0), address(tempComptroller));
    DiamondExtension[] memory extensions = new DiamondExtension[](2);
    extensions[0] = new ComptrollerFirstExtension();
    extensions[1] = tempComptroller;
    vm.prank(ionicAdmin.owner());
    ionicAdmin._setComptrollerExtensions(address(tempComptroller), extensions);
    vm.prank(ionicAdmin.owner());
    (, address comptrollerAddress) = poolDirectory.deployPool(
      "TestPool",
      address(tempComptroller),
      abi.encode(payable(address(ionicAdmin))), // FD
      false,
      0.1e18,
      1.1e18,
      0xBAAb9986A7002ad67cb5a9C1761210C2Cdd98BFa // MPO
    );
  }
}
