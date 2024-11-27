// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "../config/BaseTest.t.sol";
import "../../EmissionsManager.sol";
import "../../PoolDirectory.sol";
import "./mocks/MockVeION.sol";
import "./mocks/MockPoolDirectory.sol";
import "./mocks/MockIonicComptroller.sol";
import "./mocks/MockOracle.sol";
import "./mocks/MockIonicFlywheelCore.sol";
import "./mocks/MockICErc20.sol";

import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "../../veION/interfaces/IveION.sol";

contract EmissionsManagerTest is BaseTest {
    MockPoolDirectory poolDirectory;
    MockIonicComptroller comptroller;
    MockICErc20 mockAsset;
    MockVeION mockVeION;
    MockOracle oracle;
    MockIonicFlywheelCore ionicFlywheelCore;

    EmissionsManager emissionsManager;
    MockERC20 rewardToken;

    address user = address(0x123);
    address reporter = address(0x124);
    address flywheelRewards = address(0x125);
    address protocalAddress = address(0x456);
    uint256 collateralBp = 250; // Example value
    bytes nonBlacklistableBytecode = hex"deadbeef";

    function setUp() public {

        mockAsset = new MockICErc20();
        mockAsset.setBalanceOfUnderlying(user, 1e18);

        oracle = new MockOracle();
        oracle.setUnderlyingPrice(ICErc20(address(mockAsset)), 100);
        
        // Deploy a mock ERC20 reward token
        //rewardToken = new MockERC20();
        rewardToken = new MockERC20("ION", "ION", 18);

        // Deploy the IonicFlywheelCore mock
        ionicFlywheelCore = new MockIonicFlywheelCore();
        ionicFlywheelCore.setRewardToken(address(rewardToken));

        // Deploy the Comptroller mock
        comptroller = new MockIonicComptroller();
        comptroller.setAssetsIn(address(mockAsset));
        comptroller.setOracle(address(oracle));
        comptroller.setFlywheel(address(ionicFlywheelCore));

        // Deploy the PoolDirectory mock
        poolDirectory = new MockPoolDirectory();
        poolDirectory.setActivePools(address(comptroller));

        // Deploy the EmissionsManager
        emissionsManager = new EmissionsManager();
        emissionsManager.initialize(PoolDirectory(address(poolDirectory)), protocalAddress, rewardToken, collateralBp, nonBlacklistableBytecode);

        mockVeION = new MockVeION();
        mockVeION.setMockTotalEthValueOfTokens(user, 1);
        emissionsManager.setVeIon(IveION(address(mockVeION)));
    }

    function test_Initialize() public {
        assertEq(emissionsManager.protocalAddress(), protocalAddress, "Protocol address mismatch");

        assertEq(emissionsManager.collateralBp(), collateralBp, "Collateral basis points mismatch");

        assertEq(address(emissionsManager.rewardToken()), address(rewardToken), "Reward token mismatch");
    }

    function test_setVeIon_OwnerCanSetVeIonAddress() public {
        IveION veIONMock = IveION(address(new MockVeION()));

        emissionsManager.setVeIon(veIONMock);

        assertEq(address(emissionsManager.veION()), address(veIONMock), "veION address mismatch");
    }

    function test_setCollateralBp_OwnerCanSetCollateralBp() public {
        uint256 newCollateralBp = 2_500;
        
        emissionsManager.setCollateralBp(newCollateralBp);

        assertEq(emissionsManager.collateralBp(), newCollateralBp, "Collateral basis points not updated");
    }

    function test_setNonBlacklistableAddress_OwnerCanSetNonBlacklistableAddress() public {
        emissionsManager.setNonBlacklistableAddress(user, true);

        assertTrue(emissionsManager.nonBlacklistable(user), "User should be non-blacklistable");

        emissionsManager.setNonBlacklistableAddress(user, false);

        assertFalse(emissionsManager.nonBlacklistable(user), "User should be blacklistable");
    }

    function test_setNonBlacklistableTargetBytecode_OwnerCanSetNonBlacklistableTargetBytecode() public {
        bytes memory bytecode = hex"deadbeef";

        emissionsManager.setNonBlacklistableTargetBytecode(bytecode);

        assertEq(emissionsManager.nonBlacklistableTargetBytecode(), bytecode, "Non-blacklistable target bytecode mismatch");
    }

    function test_reportUser_ReporterCanReportUser() public {
        assertFalse(emissionsManager.isUserBlacklisted(user), "User should not be blacklisted initially");
        emissionsManager.setNonBlacklistableAddress(user, false);
        assertEq(rewardToken.balanceOf(address(ionicFlywheelCore)), 0);
        
        ionicFlywheelCore.setFlywheelRewards(flywheelRewards);
        rewardToken.mint(flywheelRewards, 1e18);
        vm.prank(flywheelRewards);
        rewardToken.approve(address(ionicFlywheelCore), 1e18);

        assertEq(rewardToken.balanceOf(flywheelRewards), 1e18);

        vm.prank(reporter);
        emissionsManager.reportUser(user);
        assertEq(rewardToken.balanceOf(flywheelRewards), 0);
        assertEq(rewardToken.balanceOf(reporter),8e17);
        assertEq(rewardToken.balanceOf(protocalAddress),2e17);

        assertTrue(emissionsManager.isUserBlacklisted(user), "User should be blacklisted");
    }

    function test_reportUser_ReporterCantReportUserWithLPBalanceAboveThreshold() public {       
        mockVeION.setMockTotalEthValueOfTokens(user, 1e18);
        vm.prank(reporter);
        vm.expectRevert("LP balance above threshold");
        emissionsManager.reportUser(user);
    }

    function test_reportUser_ReporterCantReportAlreadyBlacklistedUser() public {       
        vm.prank(reporter);
        emissionsManager.reportUser(user);

        assertTrue(emissionsManager.isUserBlacklisted(user), "User should be blacklisted");
        vm.prank(reporter);
        vm.expectRevert("Already blacklisted");
        emissionsManager.reportUser(user);
    }

    function test_reportUser_ReporterCantReportNonBlacklistableBytecode() public {        
        emissionsManager.setNonBlacklistableTargetBytecode(address(mockAsset).code);

        vm.prank(reporter);
        vm.expectRevert("Non-blacklistable bytecode");
        emissionsManager.reportUser(address(mockAsset));
    }

    function test_reportUser_ReporterCantReportNonBlacklistableUser() public {
        emissionsManager.setNonBlacklistableAddress(user, true);
        
        vm.prank(reporter);
        vm.expectRevert("Non-blacklistable user");
        emissionsManager.reportUser(user);
    }

    function test_whitelistUser_ReporterCanWhitelistBlacklistedUser() public {
        assertFalse(emissionsManager.isUserBlacklisted(user), "User should not be blacklisted initially");

        emissionsManager.setNonBlacklistableAddress(user, false);
        
        vm.prank(reporter);
        emissionsManager.reportUser(user);

        assertTrue(emissionsManager.isUserBlacklisted(user), "User should be blacklisted");

        mockVeION.setMockTotalEthValueOfTokens(user, 1e18);
        emissionsManager.whitelistUser(user);

        assertFalse(emissionsManager.isUserBlacklisted(user), "User should be whitelisted");

    }

    function test_whitelistUser_ReporterCantWhitelistUserWithLpBalanceBelowThreshold() public {
        assertFalse(emissionsManager.isUserBlacklisted(user), "User should not be blacklisted initially");

        emissionsManager.setNonBlacklistableAddress(user, false);
        
        vm.prank(reporter);
        emissionsManager.reportUser(user);

        assertTrue(emissionsManager.isUserBlacklisted(user), "User should be blacklisted");

        vm.expectRevert("LP balance below threshold");
        emissionsManager.whitelistUser(user);
    }

    function test_whitelistUser_ReporterCantWhitelistAlreadyWhitelistedUser() public {
        assertFalse(emissionsManager.isUserBlacklisted(user), "User should not be blacklisted initially");

        emissionsManager.setNonBlacklistableAddress(user, false);
        
        vm.prank(reporter);
        emissionsManager.reportUser(user);

        assertTrue(emissionsManager.isUserBlacklisted(user), "User should be blacklisted");

        mockVeION.setMockTotalEthValueOfTokens(user, 1e18);
        emissionsManager.whitelistUser(user);

        assertFalse(emissionsManager.isUserBlacklisted(user), "User should be whitelisted");

        vm.expectRevert("Already whitelisted");
        emissionsManager.whitelistUser(user);
    }
}