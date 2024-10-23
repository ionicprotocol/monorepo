// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity >=0.8.0;

import {Test} from "forge-std/Test.sol";
import "forge-std/Vm.sol";

import {ERC20} from "solmate/tokens/ERC20.sol";
import {FlywheelCore} from "flywheel/FlywheelCore.sol";

import "../../interfaces/IFuseAdmin.sol";
import "../../interfaces/ICErc20.sol";
import "../../interfaces/IComptroller.sol";
import "../../interfaces/IPlugin.sol";

contract FusePool156Test is Test {
    FuseAdmin fuseAdmin = FuseAdmin(0xa731585ab05fC9f83555cf9Bff8F58ee94e18F85);

    // pool 156 comptroller
    Comptroller comptroller =
        Comptroller(0x07cd53380FE9B2a5E64099591b498c73F0EfaA66);
    address multisig = 0x5eA4A9a7592683bF0Bc187d6Da706c6c4770976F;
    address user = 0xB290f2F3FAd4E540D0550985951Cdad2711ac34A;

    address cvxcrvCRV = 0x9D0464996170c6B9e75eED71c68B99dDEDf279e8;
    address cvxFXSFXS = 0xF3A43307DcAFa93275993862Aae628fCB50dC768;
    address rethstethCRV = 0x447Ddd4960d9fdBF6af9a790560d0AF76795CB08;

    ERC20 cvx = ERC20(0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B);
    ERC20 crv = ERC20(0xD533a949740bb3306d119CC777fa900bA034cd52);
    ERC20 fxs = ERC20(0x3432B6A60D23Ca0dFCa7761B7ab56459D9C964D0);

    FlywheelCore cvxFlywheelCore =
        FlywheelCore(0x18B9aE8499e560bF94Ef581420c38EC4CfF8559C);
    FlywheelCore crvFlywheelCore =
        FlywheelCore(0x65DFbde18D7f12a680480aBf6e17F345d8637829);
    FlywheelCore fxsFlywheelCore =
        FlywheelCore(0x30E9A1Bc6A6a478fC32F9ac900C6530Ad3A1616F);

    function setUp() public {
        vm.label(address(fuseAdmin), "fuseAdmin");
        vm.label(address(comptroller), "comptroller");
        vm.label(multisig, "multisig");
    }

    function testPool156() public {
        vm.startPrank(user);

        deal(cvxFXSFXS, user, 100e18);
        CErc20 cvxFXSf = CErc20(0x30916E14C139d65CAfbEEcb3eA525c59df643281);
        require(cvxFXSf.mint(100e18) == 0, "mint failed");

        deal(cvxcrvCRV, user, 100e18);
        CErc20 cvxCRVf = CErc20(0x58c8087eF758DF6F6B3dc045cF135C850a8307b6);
        require(cvxCRVf.mint(100e18) == 0, "mint failed");

        deal(rethstethCRV, user, 100e18);
        CErc20 rethstethCRVf = CErc20(
            0xD88B2E6304d1827e22D2ACC2FbCeD836cd439b85
        );
        require(rethstethCRVf.mint(100e18) == 0, "mint failed");

        // cvxFXSFXSf
        uint256 accrue = cvxFlywheelCore.accrue(ERC20(address(cvxFXSf)), user);
        require(accrue > 0, "cvxFlywheel accrue");
        uint256 accrued = cvxFlywheelCore.rewardsAccrued(user);
        uint256 prebalance = cvx.balanceOf(user);
        cvxFlywheelCore.claimRewards(user);
        require(
            cvx.balanceOf(user) == prebalance + accrued,
            "cvxFlywheel claimRewards"
        );

        accrue = crvFlywheelCore.accrue(ERC20(address(cvxFXSf)), user);
        require(accrue > 0, "crvFlywheel accrue");
        accrued = crvFlywheelCore.rewardsAccrued(user);
        prebalance = crv.balanceOf(user);
        crvFlywheelCore.claimRewards(user);
        require(
            crv.balanceOf(user) == prebalance + accrued,
            "crvFlywheel claimRewards"
        );

        accrue = fxsFlywheelCore.accrue(ERC20(address(cvxFXSf)), user);
        require(accrue > 0, "fxsFlywheel accrue");
        accrued = fxsFlywheelCore.rewardsAccrued(user);
        prebalance = fxs.balanceOf(user);
        fxsFlywheelCore.claimRewards(user);
        require(
            fxs.balanceOf(user) == prebalance + accrued,
            "fxsFlywheel claimRewards"
        );

        // cvxCRVf
        vm.warp(block.timestamp + 10);
        accrue = cvxFlywheelCore.accrue(ERC20(address(cvxCRVf)), user);
        require(accrue > 0, "cvxFlywheel accrue");
        accrued = cvxFlywheelCore.rewardsAccrued(user);
        prebalance = cvx.balanceOf(user);
        cvxFlywheelCore.claimRewards(user);
        require(
            cvx.balanceOf(user) == prebalance + accrued,
            "cvxFlywheel claimRewards"
        );

        accrue = crvFlywheelCore.accrue(ERC20(address(cvxCRVf)), user);
        require(accrue > 0, "crvFlywheel accrue");
        accrued = crvFlywheelCore.rewardsAccrued(user);
        prebalance = crv.balanceOf(user);
        crvFlywheelCore.claimRewards(user);
        require(
            crv.balanceOf(user) == prebalance + accrued,
            "crvFlywheel claimRewards"
        );

        // rethstethCRVf
        vm.warp(block.timestamp + 10);
        accrue = cvxFlywheelCore.accrue(ERC20(address(rethstethCRVf)), user);
        require(accrue > 0, "cvxFlywheel accrue");
        accrued = cvxFlywheelCore.rewardsAccrued(user);
        prebalance = cvx.balanceOf(user);
        cvxFlywheelCore.claimRewards(user);
        require(
            cvx.balanceOf(user) == prebalance + accrued,
            "cvxFlywheel claimRewards"
        );

        accrue = crvFlywheelCore.accrue(ERC20(address(rethstethCRVf)), user);
        require(accrue > 0, "crvFlywheel accrue");
        accrued = crvFlywheelCore.rewardsAccrued(user);
        prebalance = crv.balanceOf(user);
        crvFlywheelCore.claimRewards(user);
        require(
            crv.balanceOf(user) == prebalance + accrued,
            "crvFlywheel claimRewards"
        );

        require(cvxFXSf.redeem(cvxFXSf.balanceOf(user)) == 0, "cvxFXS redeem");
        require(cvxCRVf.redeem(cvxCRVf.balanceOf(user)) == 0, "cvxCRV redeem");
        require(
            rethstethCRVf.redeem(rethstethCRVf.balanceOf(user)) == 0,
            "rethstethCRV redeem"
        );
    }
}
