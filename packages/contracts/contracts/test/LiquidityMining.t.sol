// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "forge-std/Vm.sol";

import { ERC20 } from "solmate/tokens/ERC20.sol";
import { Auth, Authority } from "solmate/auth/Auth.sol";
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import { FlywheelStaticRewards } from "../ionic/strategies/flywheel/rewards/FlywheelStaticRewards.sol";
import { IFlywheelBooster } from "../ionic/strategies/flywheel/IFlywheelBooster.sol";
import { IFlywheelRewards } from "../ionic/strategies/flywheel/rewards/IFlywheelRewards.sol";
import { TransparentUpgradeableProxy } from "@openzeppelin/contracts/proxy/transparent/TransparentUpgradeableProxy.sol";

import { ICErc20 } from "../compound/CTokenInterfaces.sol";
import { CErc20 } from "../compound/CToken.sol";
import { JumpRateModel } from "../compound/JumpRateModel.sol";
import { Unitroller } from "../compound/Unitroller.sol";
import { Comptroller } from "../compound/Comptroller.sol";
import { ComptrollerFirstExtension } from "../compound/ComptrollerFirstExtension.sol";
import { CErc20Delegate } from "../compound/CErc20Delegate.sol";
import { CErc20Delegator } from "../compound/CErc20Delegator.sol";
import { IonicComptroller } from "../compound/ComptrollerInterface.sol";
import { InterestRateModel } from "../compound/InterestRateModel.sol";
import { FeeDistributor } from "../FeeDistributor.sol";
import { PoolDirectory } from "../PoolDirectory.sol";
import { AuthoritiesRegistry } from "../ionic/AuthoritiesRegistry.sol";
import { PoolRolesAuthority } from "../ionic/PoolRolesAuthority.sol";

import { MockPriceOracle } from "../oracles/1337/MockPriceOracle.sol";
import { CTokenFirstExtension, DiamondExtension } from "../compound/CTokenFirstExtension.sol";
import { IonicFlywheelLensRouter } from "../ionic/strategies/flywheel/IonicFlywheelLensRouter.sol";
import { IonicFlywheel } from "../ionic/strategies/flywheel/IonicFlywheel.sol";
import { IonicFlywheelCore } from "../ionic/strategies/flywheel/IonicFlywheelCore.sol";

import { BaseTest } from "./config/BaseTest.t.sol";

contract LiquidityMiningTest is BaseTest {
  MockERC20 underlyingToken;
  MockERC20 rewardToken;

  JumpRateModel interestModel;
  IonicComptroller comptroller;
  CErc20Delegate cErc20Delegate;
  ICErc20 cErc20;
  FeeDistributor ionicAdmin;
  PoolDirectory poolDirectory;

  IonicFlywheel flywheel;
  FlywheelStaticRewards rewards;
  IonicFlywheelLensRouter flywheelClaimer;

  address user = address(1337);

  uint8 baseDecimal;
  uint8 rewardDecimal;

  address[] markets;
  IonicFlywheelCore[] flywheelsToClaim;

  function setUpBaseContracts(uint8 _baseDecimal, uint8 _rewardDecimal) public {
    baseDecimal = _baseDecimal;
    rewardDecimal = _rewardDecimal;
    underlyingToken = new MockERC20("UnderlyingToken", "UT", baseDecimal);
    rewardToken = new MockERC20("RewardToken", "RT", rewardDecimal);
    interestModel = new JumpRateModel(2343665, 1 * 10**baseDecimal, 1 * 10**baseDecimal, 4 * 10**baseDecimal, 0.8e18);
    ionicAdmin = new FeeDistributor();
    ionicAdmin.initialize(1 * 10**(baseDecimal - 2));
    poolDirectory = new PoolDirectory();
    poolDirectory.initialize(false, new address[](0));
    cErc20Delegate = new CErc20Delegate();
    // set the new delegate as the latest
    ionicAdmin._setLatestCErc20Delegate(cErc20Delegate.delegateType(), address(cErc20Delegate), abi.encode(address(0)));
    DiamondExtension[] memory cErc20DelegateExtensions = new DiamondExtension[](2);
    cErc20DelegateExtensions[0] = new CTokenFirstExtension();
    cErc20DelegateExtensions[1] = cErc20Delegate;
    ionicAdmin._setCErc20DelegateExtensions(address(cErc20Delegate), cErc20DelegateExtensions);
  }

  function setUpPoolAndMarket() public {
    MockPriceOracle priceOracle = new MockPriceOracle(10);
    Comptroller tempComptroller = new Comptroller();
    ionicAdmin._setLatestComptrollerImplementation(address(0), address(tempComptroller));
    DiamondExtension[] memory extensions = new DiamondExtension[](2);
    extensions[0] = new ComptrollerFirstExtension();
    extensions[1] = tempComptroller;
    ionicAdmin._setComptrollerExtensions(address(tempComptroller), extensions);
    (, address comptrollerAddress) = poolDirectory.deployPool(
      "TestPool",
      address(tempComptroller),
      abi.encode(payable(address(ionicAdmin))),
      false,
      0.1e18,
      1.1e18,
      address(priceOracle)
    );

    Unitroller(payable(comptrollerAddress))._acceptAdmin();
    comptroller = IonicComptroller(comptrollerAddress);

    AuthoritiesRegistry impl = new AuthoritiesRegistry();
    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), address(1), "");
    AuthoritiesRegistry newAr = AuthoritiesRegistry(address(proxy));
    newAr.initialize(address(321));
    ionicAdmin.reinitialize(newAr);
    PoolRolesAuthority poolAuth = newAr.createPoolAuthority(comptrollerAddress);
    newAr.setUserRole(comptrollerAddress, user, poolAuth.BORROWER_ROLE(), true);

    vm.roll(1);
    comptroller._deployMarket(
      cErc20Delegate.delegateType(),
      abi.encode(
        address(underlyingToken),
        comptroller,
        payable(address(ionicAdmin)),
        InterestRateModel(address(interestModel)),
        "CUnderlyingToken",
        "CUT",
        uint256(1),
        uint256(0)
      ),
      "",
      0.9e18
    );

    ICErc20[] memory allMarkets = comptroller.getAllMarkets();
    cErc20 = allMarkets[allMarkets.length - 1];
  }

  function setUpFlywheel() public {
    IonicFlywheel impl = new IonicFlywheel();
    TransparentUpgradeableProxy proxy = new TransparentUpgradeableProxy(address(impl), address(dpa), "");
    flywheel = IonicFlywheel(address(proxy));
    flywheel.initialize(rewardToken, FlywheelStaticRewards(address(0)), IFlywheelBooster(address(0)), address(this));
    rewards = new FlywheelStaticRewards(IonicFlywheelCore(address(flywheel)), address(this), Authority(address(0)));
    flywheel.setFlywheelRewards(rewards);

    flywheelClaimer = new IonicFlywheelLensRouter(poolDirectory);

    flywheel.addStrategyForRewards(ERC20(address(cErc20)));

    // add flywheel as rewardsDistributor to call flywheelPreBorrowAction / flywheelPreSupplyAction
    require(comptroller._addRewardsDistributor(address(flywheel)) == 0);

    // seed rewards to flywheel
    rewardToken.mint(address(rewards), 100 * 10**rewardDecimal);

    // Start reward distribution at 1 token per second
    rewards.setRewardsInfo(
      ERC20(address(cErc20)),
      FlywheelStaticRewards.RewardsInfo({ rewardsPerSecond: uint224(1 * 10**rewardDecimal), rewardsEndTimestamp: 0 })
    );

    // preparation for a later call
    flywheelsToClaim.push(IonicFlywheelCore(address(flywheel)));
  }

  function _initialize(uint8 _baseDecimal, uint8 _rewardDecimal) internal {
    setUpBaseContracts(_baseDecimal, _rewardDecimal);
    setUpPoolAndMarket();
    setUpFlywheel();
    deposit(1 * 10**_baseDecimal);
    vm.warp(block.timestamp + 1);
  }

  function deposit(uint256 _amount) public {
    underlyingToken.mint(user, _amount);
    vm.startPrank(user);
    underlyingToken.approve(address(cErc20), _amount);
    comptroller.enterMarkets(markets);
    cErc20.mint(_amount);
    vm.stopPrank();
  }

  function _testIntegration() internal {
    uint256 percentFee = flywheel.performanceFee();
    uint224 percent100 = 100e16; //flywheel.ONE();

    // store expected rewards per token (1 token per second over total supply)
    uint256 rewardsPerTokenPlusFee = (1 * 10**rewardDecimal * 1 * 10**baseDecimal) / cErc20.totalSupply();
    uint256 rewardsPerTokenForFee = (rewardsPerTokenPlusFee * percentFee) / percent100;
    uint256 rewardsPerToken = rewardsPerTokenPlusFee - rewardsPerTokenForFee;

    // store expected user rewards (user balance times reward per second over 1 token)
    uint256 userRewards = (rewardsPerToken * cErc20.balanceOf(user)) / (1 * 10**baseDecimal);

    ERC20 asErc20 = ERC20(address(cErc20));
    // accrue rewards and check against expected
    assertEq(flywheel.accrue(asErc20, user), userRewards, "!accrue amount");

    // check market index
    (uint224 index, ) = flywheel.strategyState(asErc20);
    assertEq(index, 10**rewardDecimal + rewardsPerToken, "!index");

    // claim and check user balance
    flywheelClaimer.claimRewardsForMarket(user, asErc20, flywheelsToClaim, asArray(true));
    assertEq(rewardToken.balanceOf(user), userRewards, "!user rewards");

    // mint more tokens by user and rerun test
    deposit(1 * 10**baseDecimal);

    // for next test, advance 10 seconds instead of 1 (multiply expectations by 10)
    vm.warp(block.timestamp + 10);

    uint256 rewardsPerToken2PlusFee = (1 * 10**rewardDecimal * 1 * 10**baseDecimal) / cErc20.totalSupply();
    uint256 rewardsPerToken2ForFee = (rewardsPerToken2PlusFee * percentFee) / percent100;
    uint256 rewardsPerToken2 = rewardsPerToken2PlusFee - rewardsPerToken2ForFee;

    uint256 userRewards2 = (10 * (rewardsPerToken2 * cErc20.balanceOf(user))) / (1 * 10**baseDecimal);

    // accrue all unclaimed rewards and claim them
    flywheelClaimer.claimRewardsForMarket(user, asErc20, flywheelsToClaim, asArray(true));

    emit log_named_uint("userRewards", userRewards);
    emit log_named_uint("userRewards2", userRewards2);
    // user balance should accumulate from both rewards
    assertEq(rewardToken.balanceOf(user), userRewards + userRewards2, "balance mismatch");
  }

  function testIntegrationRewardStandard(uint8 i, uint8 j) public {
    vm.assume(i > 1);
    vm.assume(j > 1);
    vm.assume(i < 19);
    vm.assume(j < 19);

    _initialize(i, j);
    _testIntegration();
  }
}
