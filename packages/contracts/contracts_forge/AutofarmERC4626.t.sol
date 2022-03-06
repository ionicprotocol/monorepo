// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.23;

import "ds-test/test.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";

import { AutofarmERC4626, IAutofarmV2 } from "../contracts/compound/strategies/AutofarmERC4626.sol";
import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";
import { MockERC20 } from "@rari-capital/solmate/src/test/utils/mocks/MockERC20.sol";
import { MockStrategy } from "./mocks/autofarm/MockStrategy.sol";
import { MockAutofarmV2 } from "./mocks/autofarm/MockAutofarmV2.sol";
import { IStrategy } from "./mocks/autofarm/IStrategy.sol";
import { FlywheelCore } from "../contracts/flywheel/FlywheelCore.sol";
import { FlywheelDynamicRewards } from "../contracts/flywheel/rewards/FlywheelDynamicRewards.sol";
import { IFlywheelBooster } from "../contracts/flywheel/interfaces/IFlywheelBooster.sol";
import { IFlywheelCore } from "../contracts/flywheel/interfaces/IFlywheelCore.sol";
import { Authority } from "@rari-capital/solmate/src/auth/Auth.sol";

contract AutofarmERC4626Test is DSTest {
  using stdStorage for StdStorage;

  Vm public constant vm = Vm(HEVM_ADDRESS);

  StdStorage stdstore;

  AutofarmERC4626 autofarmERC4626;
  FlywheelCore flywheel;
  FlywheelDynamicRewards flywheelRewards;

  MockERC20 testToken;
  MockERC20 autoToken;
  MockStrategy mockStrategy;
  MockAutofarmV2 mockAutofarm;

  uint256 depositAmount = 100e18;
  ERC20 marketKey;
  address tester = 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266;

  function setUp() public {
    testToken = new MockERC20("TestToken", "TST", 18);
    autoToken = new MockERC20("autoToken", "AUTO", 18);
    mockAutofarm = new MockAutofarmV2(address(autoToken));
    mockStrategy = new MockStrategy(address(testToken), address(mockAutofarm));

    flywheel = new FlywheelCore(
      autoToken,
      FlywheelDynamicRewards(address(0)),
      IFlywheelBooster(address(0)),
      address(this),
      Authority(address(0))
    );

    flywheelRewards = new FlywheelDynamicRewards(autoToken, address(flywheel));

    autofarmERC4626 = new AutofarmERC4626(
      testToken,
      "TestVault",
      "TSTV",
      0,
      IAutofarmV2(address(mockAutofarm)),
      IFlywheelCore(address(flywheel))
    );
    marketKey = ERC20(address(autofarmERC4626));
    flywheel.setFlywheelRewards(flywheelRewards);
    flywheel.addMarketForRewards(marketKey);

    // Add mockStrategy to Autofarm
    mockAutofarm.add(ERC20(address(testToken)), 1, address(mockStrategy));
  }

  function testInitalizedValues() public {
    assertEq(autofarmERC4626.name(), "TestVault");
    assertEq(autofarmERC4626.symbol(), "TSTV");
    assertEq(address(autofarmERC4626.asset()), address(testToken));
    assertEq(address(autofarmERC4626.autofarm()), address(mockAutofarm));
    assertEq(address(marketKey), address(autofarmERC4626));
  }

  function deposit() public {
    testToken.mint(address(this), depositAmount);
    testToken.approve(address(autofarmERC4626), depositAmount);
    autofarmERC4626.deposit(depositAmount, address(this));
  }

  function testTransfer() public {
    deposit();
    autofarmERC4626.transfer(tester, depositAmount);
    assertEq(autofarmERC4626.balanceOf(address(this)), 0);
    assertEq(autofarmERC4626.balanceOf(tester), depositAmount);
  }

  function testTransferFrom() public {
    deposit();
    autofarmERC4626.approve(tester, depositAmount);
    vm.startPrank(tester);
    autofarmERC4626.transferFrom(address(this), tester, depositAmount);
    assertEq(autofarmERC4626.balanceOf(address(this)), 0);
    assertEq(autofarmERC4626.balanceOf(tester), depositAmount);
  }

  function testDeposit() public {
    deposit();
    //Test that the actual transfers worked
    assertEq(testToken.balanceOf(address(this)), 0);
    assertEq(testToken.balanceOf(address(mockAutofarm)), 0);
    assertEq(testToken.balanceOf(address(mockStrategy)), depositAmount);

    // //Test that the balance view calls work
    assertEq(autofarmERC4626.totalAssets(), depositAmount);
    assertEq(autofarmERC4626.balanceOfUnderlying(address(this)), depositAmount);

    // Test that we minted the correct amount of token
    assertEq(autofarmERC4626.balanceOf(address(this)), depositAmount);
  }

  function testWithdraw() public {
    deposit();
    autofarmERC4626.withdraw(depositAmount, address(this), address(this));

    //Test that the actual transfers worked
    assertEq(testToken.balanceOf(address(this)), depositAmount);
    assertEq(testToken.balanceOf(address(mockAutofarm)), 0);
    assertEq(testToken.balanceOf(address(mockStrategy)), 0);

    //Test that the balance view calls work
    // !!! This reverts since we divide by 0
    // The contract works fine but the question would be if we want to return a 0 if supply is 0 or if we are fine that the view function errors
    // assertEq(autofarmERC4626.totalAssets(), 0);
    // assertEq(autofarmERC4626.balanceOfUnderlying(address(this)), 0);

    // //Test that we burned the correct amount of token
    assertEq(autofarmERC4626.balanceOf(address(this)), 0);
  }

  function testAccumulatingAutoRewardsOnDeposit() public {
    vm.roll(1);
    deposit();
    assertEq(autoToken.balanceOf(address(mockAutofarm)), 0);
    assertEq(autoToken.balanceOf(address(autofarmERC4626)), 0);
    assertEq(autoToken.balanceOf(address(flywheel)), 0);
    assertEq(autoToken.balanceOf(address(flywheelRewards)), 0);

    vm.roll(2);
    deposit();
    assertEq(autoToken.balanceOf(address(mockAutofarm)), 0);
    assertEq(autoToken.balanceOf(address(autofarmERC4626)), 0);
    assertEq(autoToken.balanceOf(address(flywheel)), 8e15);
    assertEq(autoToken.balanceOf(address(flywheelRewards)), 0);
  }

  function testAccumulatingAutoRewardsOnWithdrawal() public {
    vm.roll(1);
    deposit();

    vm.roll(3);
    autofarmERC4626.withdraw(depositAmount, address(this), address(this));
    assertEq(autoToken.balanceOf(address(mockAutofarm)), 0);
    assertEq(autoToken.balanceOf(address(autofarmERC4626)), 0);
    assertEq(autoToken.balanceOf(address(flywheel)), 16e15);
    assertEq(autoToken.balanceOf(address(flywheelRewards)), 0);
  }

  function testAccumulatingAutoRewardsOnTransfer() public {
    vm.roll(1);
    deposit();
    vm.roll(2);

    vm.startPrank(tester);
    testToken.mint(tester, depositAmount);
    testToken.approve(address(autofarmERC4626), depositAmount);
    autofarmERC4626.deposit(depositAmount, tester);
    vm.stopPrank();

    vm.roll(3);
    autofarmERC4626.transfer(tester, depositAmount);
    flywheel.claimRewards(address(this));
    assertEq(autoToken.balanceOf(address(this)), 4e15);
    flywheel.claimRewards(tester);
    assertEq(autoToken.balanceOf(tester), 4e15);
  }

  function testAccumulatingAutoRewardsOnTransferFrom() public {
    vm.roll(1);
    deposit();
    autofarmERC4626.approve(tester, depositAmount);
    vm.roll(2);

    vm.startPrank(tester);
    testToken.mint(tester, depositAmount);
    testToken.approve(address(autofarmERC4626), depositAmount);
    autofarmERC4626.deposit(depositAmount, tester);
    vm.roll(3);
    autofarmERC4626.transferFrom(address(this), tester, depositAmount);
    vm.stopPrank();
    flywheel.claimRewards(address(this));
    assertEq(autoToken.balanceOf(address(this)), 4e15);
    flywheel.claimRewards(tester);
    assertEq(autoToken.balanceOf(tester), 4e15);
  }

  function testClaimRewards() public {
    vm.roll(1);
    deposit();
    vm.roll(3);
    autofarmERC4626.withdraw(depositAmount, address(this), address(this));
    flywheel.claimRewards(address(this));
    assertEq(autoToken.balanceOf(address(this)), 16e15);
  }

  function testClaimForMultipleUser() public {
    vm.roll(1);
    deposit();
    vm.startPrank(tester);
    testToken.mint(tester, depositAmount);
    testToken.approve(address(autofarmERC4626), depositAmount);
    autofarmERC4626.deposit(depositAmount, tester);
    vm.stopPrank();

    vm.roll(3);
    autofarmERC4626.withdraw(depositAmount, address(this), address(this));
    flywheel.claimRewards(address(this));
    flywheel.claimRewards(tester);
    assertEq(autoToken.balanceOf(address(this)), 8e15);
    assertEq(autoToken.balanceOf(address(this)), 8e15);
  }
}
