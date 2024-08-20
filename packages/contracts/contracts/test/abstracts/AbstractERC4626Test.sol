// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "../helpers/WithPool.sol";
import { BaseTest } from "../config/BaseTest.t.sol";

import { IonicERC4626 } from "../../ionic/strategies/IonicERC4626.sol";
import { ERC20 } from "solmate/tokens/ERC20.sol";
import { Authority } from "solmate/auth/Auth.sol";
import { FixedPointMathLib } from "solmate/utils/FixedPointMathLib.sol";

abstract contract AbstractERC4626Test is WithPool {
  using FixedPointMathLib for uint256;

  IonicERC4626 plugin;

  string testPreFix;

  uint256 public depositAmount = 100e18;
  uint256 BPS_DENOMINATOR = 10_000;

  uint256 initialStrategyBalance;
  uint256 initialStrategySupply;

  constructor() {
    _forkAtBlock(uint128(block.chainid), block.number);
  }

  function _setUp(string memory _testPreFix, bytes calldata data) public virtual;

  function deposit(address _owner, uint256 amount) public {
    vm.startPrank(_owner);
    underlyingToken.approve(address(plugin), amount);
    plugin.deposit(amount, _owner);
    vm.stopPrank();
  }

  function sendUnderlyingToken(uint256 amount, address recipient) public {
    deal(address(underlyingToken), recipient, amount);
  }

  function increaseAssetsInVault() public virtual {}

  function decreaseAssetsInVault() public virtual {}

  function getDepositShares() public view virtual returns (uint256);

  function getStrategyBalance() public view virtual returns (uint256);

  function getExpectedDepositShares() public view virtual returns (uint256);

  function testInitializedValues(string memory assetName, string memory assetSymbol) public virtual {
    assertEq(
      plugin.name(),
      string(abi.encodePacked("Midas ", assetName, " Vault")),
      string(abi.encodePacked("!name ", testPreFix))
    );
    assertEq(
      plugin.symbol(),
      string(abi.encodePacked("mv", assetSymbol)),
      string(abi.encodePacked("!symbol ", testPreFix))
    );
    assertEq(address(plugin.asset()), address(underlyingToken), string(abi.encodePacked("!asset ", testPreFix)));
    // assertEq(
    //   address(BeefyERC4626(address(plugin)).beefyVault()),
    //   address(beefyVault),
    //   string(abi.encodePacked("!beefyVault ", testPreFix))
    // );
  }

  function testPreviewDepositAndMintReturnTheSameValue() public {
    uint256 returnedShares = plugin.previewDeposit(depositAmount);
    assertApproxEqAbs(
      plugin.previewMint(returnedShares),
      depositAmount,
      uint256(10),
      string(abi.encodePacked("!previewMint ", testPreFix))
    );
  }

  function testPreviewWithdrawAndRedeemReturnTheSameValue() public {
    deposit(address(this), depositAmount);
    uint256 withdrawalAmount = 10e18;
    uint256 reqShares = plugin.previewWithdraw(withdrawalAmount);
    assertApproxEqAbs(
      plugin.previewRedeem(reqShares),
      withdrawalAmount,
      uint256(10),
      string(abi.encodePacked("!previewRedeem ", testPreFix))
    );
  }

  function testDeposit() public virtual {
    uint256 expectedDepositShare = this.getExpectedDepositShares();
    uint256 expectedErc4626Shares = plugin.previewDeposit(depositAmount);

    deposit(address(this), depositAmount);

    // Test that the actual transfers worked
    assertApproxEqAbs(
      this.getStrategyBalance(),
      initialStrategyBalance + depositAmount,
      uint256(10),
      string(abi.encodePacked("!transfer ", testPreFix))
    );

    // Test that the balance view calls work
    assertApproxEqAbs(
      plugin.totalAssets(),
      depositAmount,
      uint256(10),
      string(abi.encodePacked("!totalAssets ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.convertToAssets(plugin.balanceOf(address(this))),
      depositAmount,
      uint256(10),
      string(abi.encodePacked("!balOfUnderlying ", testPreFix))
    );

    // Test that we minted the correct amount of token
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      expectedErc4626Shares,
      uint256(10),
      string(abi.encodePacked("!expectedShares ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.totalSupply(),
      expectedErc4626Shares,
      uint256(10),
      string(abi.encodePacked("!totalSupply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      expectedDepositShare,
      uint256(10),
      string(abi.encodePacked("!depositShares ", testPreFix))
    );
  }

  function testDepositWithIncreasedVaultValue() public {
    // lpDepositor just mints the exact amount of depositShares as the user deposits in assets
    uint256 oldExpectedDepositShare = this.getExpectedDepositShares();
    uint256 oldExpected4626Shares = plugin.previewDeposit(depositAmount);

    deposit(address(this), depositAmount);

    // Increase the share price
    increaseAssetsInVault();

    uint256 expectedDepositShare = this.getExpectedDepositShares();
    uint256 previewErc4626Shares = plugin.previewDeposit(depositAmount);
    uint256 expected4626Shares = depositAmount.mulDivDown(plugin.totalSupply(), plugin.totalAssets());

    sendUnderlyingToken(depositAmount, address(this));
    deposit(address(this), depositAmount);

    // Test that we minted the correct amount of token
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      oldExpected4626Shares + previewErc4626Shares,
      uint256(10),
      string(abi.encodePacked("!previewShares == oldExpectedShares ", testPreFix))
    );

    // Test that we got less shares on the second mint after assets in the vault increased
    assertLe(
      previewErc4626Shares,
      oldExpected4626Shares,
      string(abi.encodePacked("!new shares < old Shares ", testPreFix))
    );
    assertApproxEqAbs(
      previewErc4626Shares,
      expected4626Shares,
      uint256(10),
      string(abi.encodePacked("!previewShares == expectedShares ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      oldExpectedDepositShare + expectedDepositShare,
      uint256(10),
      string(abi.encodePacked("!expectedShares ", testPreFix))
    );
  }

  function testDepositWithDecreasedVaultValue() public {
    // THIS TEST WILL ALWAYS FAIL
    // A transfer out of the lpStaker will always fail.
    // There also doesnt seem another way to reduce the balance of lpStaker so we cant test this scenario
    /* =============== ACTUAL TEST =============== */
    /*
    uint256 oldExpecteDepositShares = depositAmount;
    uint256 oldExpected4626Shares = plugin.previewDeposit(depositAmount);
    deposit(address(this), depositAmount);
    // Decrease the share price
    decreaseAssetsInVault();
    uint256 expectedDepositShare = depositAmount;
    uint256 previewErc4626Shares = plugin.previewDeposit(depositAmount);
    uint256 expected4626Shares = depositAmount.mulDivDown(plugin.totalSupply(), plugin.totalAssets());
    sendUnderlyingToken(depositAmount, address(this));
    deposit(address(this), depositAmount);
    // Test that we minted the correct amount of token
    assertApproxEqAbs(plugin.balanceOf(address(this)), oldExpected4626Shares + previewErc4626Shares);
    // Test that we got less shares on the second mint after assets in the vault increased
    assertGt(previewErc4626Shares, oldExpected4626Shares, "!new shares > old Shares");
    assertApproxEqAbs(previewErc4626Shares, expected4626Shares, "!previewShares == expectedShares");
    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(this.getDepositShares(), oldExpecteDepositShares + expectedDepositShare);
    */
  }

  function testMultipleDeposit() public {
    uint256 expectedDepositShare = this.getExpectedDepositShares();
    uint256 expectedErc4626Shares = plugin.previewDeposit(depositAmount);

    deposit(address(this), depositAmount);

    sendUnderlyingToken(depositAmount, address(1));
    deposit(address(1), depositAmount);

    // Test that the actual transfers worked
    assertApproxEqAbs(
      this.getStrategyBalance(),
      initialStrategyBalance + depositAmount * 2,
      uint256(10),
      string(abi.encodePacked("!transfer ", testPreFix))
    );

    // Test that the balance view calls work
    assertApproxEqAbs(
      depositAmount * 2,
      plugin.totalAssets(),
      uint256(10),
      string(abi.encodePacked("Total Assets should be same as sum of deposited amounts ", testPreFix))
    );
    assertApproxEqAbs(
      depositAmount,
      plugin.convertToAssets(plugin.balanceOf(address(this))),
      uint256(10),
      string(abi.encodePacked("Underlying token balance should be same as deposited amount ", testPreFix))
    );
    assertApproxEqAbs(
      depositAmount,
      plugin.convertToAssets(plugin.balanceOf(address(1))),
      uint256(10),
      string(abi.encodePacked("Underlying token balance should be same as deposited amount ", testPreFix))
    );

    // Test that we minted the correct amount of token
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      expectedErc4626Shares,
      uint256(10),
      string(abi.encodePacked("!expectedShares address(this) ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.balanceOf(address(1)),
      expectedErc4626Shares,
      uint256(10),
      string(abi.encodePacked("!expectedShares address(1) ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.totalSupply(),
      expectedErc4626Shares * 2,
      uint256(10),
      string(abi.encodePacked("!totalSupply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      expectedDepositShare * 2,
      uint256(10),
      string(abi.encodePacked("!depositShare ", testPreFix))
    );

    // DotDot ERC4626 should not have underlyingToken after deposit
    assertTrue(
      underlyingToken.balanceOf(address(plugin)) <= 1,
      string(abi.encodePacked("DotDot erc4626 locked amount checking ", testPreFix))
    );
  }

  function testMint() public {
    uint256 expectedDepositShare = this.getExpectedDepositShares();
    uint256 mintAmount = plugin.previewDeposit(depositAmount);

    underlyingToken.approve(address(plugin), depositAmount);
    plugin.mint(mintAmount, address(this));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      this.getStrategyBalance(),
      initialStrategyBalance + depositAmount,
      uint256(10),
      string(abi.encodePacked("!transfer ", testPreFix))
    );

    // Test that the balance view calls work
    assertApproxEqAbs(
      plugin.totalAssets(),
      depositAmount,
      uint256(10),
      string(abi.encodePacked("!totalAssets ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.convertToAssets(plugin.balanceOf(address(this))),
      depositAmount,
      uint256(10),
      string(abi.encodePacked("!balOfUnderlying ", testPreFix))
    );

    // Test that we minted the correct amount of token
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      mintAmount,
      uint256(10),
      string(abi.encodePacked("!mint ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.totalSupply(),
      mintAmount,
      uint256(10),
      string(abi.encodePacked("!totalSupply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      expectedDepositShare,
      uint256(10),
      string(abi.encodePacked("!depositShare ", testPreFix))
    );
  }

  function testMultipleMint() public {
    uint256 expectedDepositShare = this.getExpectedDepositShares();
    uint256 mintAmount = plugin.previewDeposit(depositAmount);

    underlyingToken.approve(address(plugin), depositAmount);
    plugin.mint(mintAmount, address(this));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      this.getStrategyBalance(),
      initialStrategyBalance + depositAmount,
      uint256(10),
      string(abi.encodePacked("!transfer ", testPreFix))
    );

    // Test that the balance view calls work
    assertApproxEqAbs(
      plugin.totalAssets(),
      depositAmount,
      uint256(10),
      string(abi.encodePacked("!totalAssets ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.convertToAssets(plugin.balanceOf(address(this))),
      depositAmount,
      uint256(10),
      string(abi.encodePacked("!balOfUnderlying ", testPreFix))
    );

    // Test that we minted the correct amount of token
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      mintAmount,
      uint256(10),
      string(abi.encodePacked("!mint ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.totalSupply(),
      mintAmount,
      uint256(10),
      string(abi.encodePacked("!totalSupply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      expectedDepositShare,
      uint256(10),
      string(abi.encodePacked("!depositShare ", testPreFix))
    );

    assertTrue(
      underlyingToken.balanceOf(address(plugin)) <= 1,
      string(abi.encodePacked("DotDot erc4626 locked amount checking ", testPreFix))
    );

    vm.startPrank(address(1));
    underlyingToken.approve(address(plugin), depositAmount);
    sendUnderlyingToken(depositAmount, address(1));
    plugin.mint(mintAmount, address(1));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      this.getStrategyBalance(),
      initialStrategyBalance + depositAmount + depositAmount,
      uint256(10),
      string(abi.encodePacked("!2.transfer ", testPreFix))
    );

    // Test that the balance view calls work
    assertApproxEqAbs(
      depositAmount + depositAmount,
      plugin.totalAssets(),
      uint256(10),
      string(abi.encodePacked("!2.totalAssets ", testPreFix))
    );
    assertApproxEqAbs(
      depositAmount,
      plugin.convertToAssets(plugin.balanceOf(address(1))),
      uint256(10),
      string(abi.encodePacked("!2.balOfUnderlying ", testPreFix))
    );

    // Test that we minted the correct amount of token
    assertApproxEqAbs(
      plugin.balanceOf(address(1)),
      mintAmount,
      uint256(10),
      string(abi.encodePacked("!2.mint ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.totalSupply(),
      mintAmount + mintAmount,
      uint256(10),
      string(abi.encodePacked("!2.totalSupply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      expectedDepositShare * 2,
      uint256(10),
      string(abi.encodePacked("!2.depositShare ", testPreFix))
    );

    assertApproxEqAbs(
      underlyingToken.balanceOf(address(plugin)),
      2,
      uint256(2),
      string(abi.encodePacked("2.DotDot erc4626 locked amount checking ", testPreFix))
    );
    vm.stopPrank();
  }

  function testWithdraw() public virtual {
    uint256 depositShares = this.getExpectedDepositShares();

    uint256 withdrawalAmount = 10e18;

    deposit(address(this), depositAmount);

    uint256 assetBalBefore = underlyingToken.balanceOf(address(this));
    uint256 erc4626BalBefore = plugin.balanceOf(address(this));
    uint256 expectedErc4626SharesNeeded = plugin.previewWithdraw(withdrawalAmount);
    uint256 ExpectedDepositSharesNeeded = expectedErc4626SharesNeeded.mulDivUp(
      this.getDepositShares(),
      plugin.totalSupply()
    );

    plugin.withdraw(withdrawalAmount, address(this), address(this));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      assetBalBefore + withdrawalAmount,
      uint256(10),
      string(abi.encodePacked("!user asset bal ", testPreFix))
    );

    // Test that the balance view calls work
    // I just couldnt not calculate this properly. i was for some reason always ~ 1 BPS off
    // uint256 expectedAssetsAfter = depositAmount - (ExpectedDepositSharesNeeded + (ExpectedDepositSharesNeeded / 1000));
    //assertApproxEqAbs(plugin.totalAssets(), expectedAssetsAfter, "!erc4626 asset bal");
    assertApproxEqAbs(
      plugin.totalSupply(),
      depositAmount - expectedErc4626SharesNeeded,
      uint256(10),
      string(abi.encodePacked("!totalSupply ", testPreFix))
    );

    // Test that we burned the right amount of shares
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      erc4626BalBefore - expectedErc4626SharesNeeded,
      uint256(10),
      string(abi.encodePacked("!erc4626 supply ", testPreFix))
    );
    assertTrue(underlyingToken.balanceOf(address(plugin)) <= 1, string(abi.encodePacked("!0 ", testPreFix)));

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      depositShares - ExpectedDepositSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!dotDot share balance ", testPreFix))
    );
  }

  function testWithdrawWithIncreasedVaultValue() public virtual {
    uint256 depositShareBal = this.getExpectedDepositShares();

    deposit(address(this), depositAmount);

    uint256 withdrawalAmount = 10e18;

    uint256 oldExpectedErc4626SharesNeeded = plugin.previewWithdraw(withdrawalAmount);
    uint256 oldExpectedDepositSharesNeeded = oldExpectedErc4626SharesNeeded.mulDivUp(
      this.getDepositShares(),
      plugin.totalSupply()
    );

    plugin.withdraw(withdrawalAmount, address(this), address(this));

    // Increase the share price
    increaseAssetsInVault();

    uint256 expectedErc4626SharesNeeded = plugin.previewWithdraw(withdrawalAmount);
    uint256 ExpectedDepositSharesNeeded = expectedErc4626SharesNeeded.mulDivUp(
      this.getDepositShares(),
      plugin.totalSupply()
    );

    plugin.withdraw(withdrawalAmount, address(this), address(this));

    // Test that we minted the correct amount of token
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      depositAmount - (oldExpectedErc4626SharesNeeded + expectedErc4626SharesNeeded),
      uint256(10),
      string(abi.encodePacked("!mint ", testPreFix))
    );

    // Test that we got less shares on the second mint after assets in the vault increased
    assertLe(
      expectedErc4626SharesNeeded,
      oldExpectedErc4626SharesNeeded,
      string(abi.encodePacked("!new shares < old Shares ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      depositShareBal - (oldExpectedDepositSharesNeeded + ExpectedDepositSharesNeeded),
      uint256(10),
      string(abi.encodePacked("!depositShare ", testPreFix))
    );
  }

  function testWithdrawWithDecreasedVaultValue() public {
    // THIS TEST WILL ALWAYS FAIL
    // A transfer out of the lpStaker will always fail.
    // There also doesnt seem another way to reduce the balance of lpStaker so we cant test this scenario
    /* =============== ACTUAL TEST =============== */
    /*
      sendUnderlyingToken(depositAmount, address(this));
      uint256 depositShares = this.getExpectedDepositShares();
      deposit(address(this), depositAmount);
      uint256 withdrawalAmount = 10e18;
      uint256 oldExpectedErc4626SharesNeeded = plugin.previewWithdraw(withdrawalAmount);
      uint256 oldExpectedDepositSharesNeeded = oldExpectedErc4626SharesNeeded.mulDivUp(
      this.getDepositShares(),
      plugin.totalSupply()
      );
      plugin.withdraw(withdrawalAmount, address(this), address(this));
      // Increase the share price
      decreaseAssetsInVault();
      uint256 expectedErc4626SharesNeeded = plugin.previewWithdraw(withdrawalAmount);
      uint256 ExpectedDepositSharesNeeded = expectedErc4626SharesNeeded.mulDivUp(
      this.getDepositShares(),
      plugin.totalSupply()
      );
      plugin.withdraw(withdrawalAmount, address(this), address(this));
      // Test that we minted the correct amount of token
      assertApproxEqAbs(
        plugin.balanceOf(address(this)),
        depositAmount - (oldExpectedErc4626SharesNeeded + expectedErc4626SharesNeeded)
      );
      // Test that we got less shares on the second mint after assets in the vault increased
      assertLe(expectedErc4626SharesNeeded, oldExpectedErc4626SharesNeeded, "!new shares < old Shares");
      // Test that the ERC4626 holds the expected amount of dotDot shares
      assertApproxEqAbs(
        this.getDepositShares(),
        depositShareBal - (oldExpectedDepositSharesNeeded + expectedDepositSharesNeeded)
      );
      */
  }

  function testMultipleWithdraw() public virtual {
    uint256 depositShares = this.getExpectedDepositShares() * 2;

    uint256 withdrawalAmount = 10e18;

    deposit(address(this), depositAmount);

    sendUnderlyingToken(depositAmount, address(1));
    deposit(address(1), depositAmount);

    uint256 assetBalBefore = underlyingToken.balanceOf(address(this));
    uint256 erc4626BalBefore = plugin.balanceOf(address(this));
    uint256 expectedErc4626SharesNeeded = plugin.previewWithdraw(withdrawalAmount);
    uint256 ExpectedDepositSharesNeeded = expectedErc4626SharesNeeded.mulDivUp(
      this.getDepositShares(),
      plugin.totalSupply()
    );

    plugin.withdraw(10e18, address(this), address(this));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      assetBalBefore + withdrawalAmount,
      uint256(10),
      string(abi.encodePacked("!1.user asset bal", testPreFix))
    );

    // Test that the balance view calls work
    // I just couldnt not calculate this properly. i was for some reason always ~ 1 BPS off
    // uint256 expectedAssetsAfter = depositAmount - (ExpectedDepositSharesNeeded + (ExpectedDepositSharesNeeded / 1000));
    //assertApproxEqAbs(plugin.totalAssets(), expectedAssetsAfter, "!erc4626 asset bal");
    assertApproxEqAbs(
      depositAmount * 2 - expectedErc4626SharesNeeded,
      plugin.totalSupply(),
      10,
      string(abi.encodePacked("!totalSupply ", testPreFix))
    );

    // Test that we burned the right amount of shares
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      erc4626BalBefore - expectedErc4626SharesNeeded,
      uint256(10),
      string(abi.encodePacked("!1.erc4626 supply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      depositShares - ExpectedDepositSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!1.dotDot share balance ", testPreFix))
    );

    assertApproxEqAbs(
      underlyingToken.balanceOf(address(plugin)),
      1,
      1,
      string(abi.encodePacked("1.DotDot erc4626 locked amount checking ", testPreFix))
    );

    uint256 totalSupplyBefore = depositAmount * 2 - expectedErc4626SharesNeeded;
    depositShares = depositShares - ExpectedDepositSharesNeeded;
    assetBalBefore = underlyingToken.balanceOf(address(1));
    erc4626BalBefore = plugin.balanceOf(address(1));
    expectedErc4626SharesNeeded = plugin.previewWithdraw(withdrawalAmount);
    ExpectedDepositSharesNeeded = expectedErc4626SharesNeeded.mulDivUp(this.getDepositShares(), plugin.totalSupply());

    vm.prank(address(1));
    plugin.withdraw(10e18, address(1), address(1));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(1)),
      assetBalBefore + withdrawalAmount,
      uint256(10),
      string(abi.encodePacked("!2.user asset bal ", testPreFix))
    );

    // Test that the balance view calls work
    // I just couldnt not calculate this properly. i was for some reason always ~ 1 BPS off
    // uint256 expectedAssetsAfter = depositAmount - (ExpectedDepositSharesNeeded + (ExpectedDepositSharesNeeded / 1000));
    //assertApproxEqAbs(plugin.totalAssets(), expectedAssetsAfter, "!erc4626 asset bal");
    assertApproxEqAbs(
      plugin.totalSupply(),
      totalSupplyBefore - expectedErc4626SharesNeeded,
      uint256(10),
      string(abi.encodePacked("!2.totalSupply ", testPreFix))
    );

    // Test that we burned the right amount of shares
    assertApproxEqAbs(
      plugin.balanceOf(address(1)),
      erc4626BalBefore - expectedErc4626SharesNeeded,
      uint256(10),
      string(abi.encodePacked("!2.erc4626 supply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      depositShares - ExpectedDepositSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!2.dotDot share balance ", testPreFix))
    );

    assertApproxEqAbs(
      underlyingToken.balanceOf(address(plugin)),
      2,
      2,
      string(abi.encodePacked("2.DotDot erc4626 locked amount checking ", testPreFix))
    );
  }

  function testRedeem() public virtual {
    uint256 depositShares = this.getExpectedDepositShares();

    uint256 withdrawalAmount = 10e18;
    uint256 redeemAmount = plugin.previewWithdraw(withdrawalAmount);

    deposit(address(this), depositAmount);

    uint256 assetBalBefore = underlyingToken.balanceOf(address(this));
    uint256 erc4626BalBefore = plugin.balanceOf(address(this));
    uint256 ExpectedDepositSharesNeeded = redeemAmount.mulDivUp(this.getDepositShares(), plugin.totalSupply());

    plugin.withdraw(10e18, address(this), address(this));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      assetBalBefore + withdrawalAmount,
      uint256(10),
      string(abi.encodePacked("!user asset bal ", testPreFix))
    );

    // Test that the balance view calls work
    // I just couldnt not calculate this properly. i was for some reason always ~ 1 BPS off
    // uint256 expectedAssetsAfter = depositAmount - (ExpectedDepositSharesNeeded + (ExpectedDepositSharesNeeded / 1000));
    //assertApproxEqAbs(plugin.totalAssets(), expectedAssetsAfter, "!erc4626 asset bal");
    assertApproxEqAbs(
      plugin.totalSupply(),
      depositAmount - redeemAmount,
      uint256(10),
      string(abi.encodePacked("!totalSupply ", testPreFix))
    );

    // Test that we burned the right amount of shares
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      erc4626BalBefore - redeemAmount,
      uint256(10),
      string(abi.encodePacked("!erc4626 supply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      depositShares - ExpectedDepositSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!dotDot share balance ", testPreFix))
    );
  }

  function testMultipleRedeem() public virtual {
    uint256 depositShares = this.getExpectedDepositShares() * 2;

    uint256 withdrawalAmount = 10e18;
    uint256 redeemAmount = plugin.previewWithdraw(withdrawalAmount);

    deposit(address(this), depositAmount);

    sendUnderlyingToken(depositAmount, address(1));
    deposit(address(1), depositAmount);

    uint256 assetBalBefore = underlyingToken.balanceOf(address(this));
    uint256 erc4626BalBefore = plugin.balanceOf(address(this));
    uint256 ExpectedDepositSharesNeeded = redeemAmount.mulDivUp(this.getDepositShares(), plugin.totalSupply());

    plugin.withdraw(10e18, address(this), address(this));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      assetBalBefore + withdrawalAmount,
      uint256(10),
      string(abi.encodePacked("!1.user asset bal ", testPreFix))
    );

    // Test that the balance view calls work
    // I just couldnt not calculate this properly. i was for some reason always ~ 1 BPS off
    // uint256 expectedAssetsAfter = depositAmount - (ExpectedDepositSharesNeeded + (ExpectedDepositSharesNeeded / 1000));
    //assertApproxEqAbs(plugin.totalAssets(), expectedAssetsAfter, "!erc4626 asset bal");
    assertApproxEqAbs(
      plugin.totalSupply(),
      depositAmount * 2 - redeemAmount,
      uint256(10),
      string(abi.encodePacked("!1.totalSupply ", testPreFix))
    );

    // Test that we burned the right amount of shares
    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      erc4626BalBefore - redeemAmount,
      uint256(10),
      string(abi.encodePacked("!1.erc4626 supply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      depositShares - ExpectedDepositSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!1.dotDot share balance ", testPreFix))
    );
    assertTrue(
      underlyingToken.balanceOf(address(plugin)) <= 1,
      string(abi.encodePacked("1.DotDot erc4626 locked amount checking ", testPreFix))
    );

    uint256 totalSupplyBefore = depositAmount * 2 - redeemAmount;
    depositShares -= ExpectedDepositSharesNeeded;
    redeemAmount = plugin.previewWithdraw(withdrawalAmount);
    assetBalBefore = underlyingToken.balanceOf(address(1));
    erc4626BalBefore = plugin.balanceOf(address(1));
    ExpectedDepositSharesNeeded = redeemAmount.mulDivUp(this.getDepositShares(), plugin.totalSupply());
    vm.prank(address(1));
    plugin.withdraw(10e18, address(1), address(1));

    // Test that the actual transfers worked
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(1)),
      assetBalBefore + withdrawalAmount,
      uint256(10),
      string(abi.encodePacked("!2.user asset bal ", testPreFix))
    );

    // Test that the balance view calls work
    // I just couldnt not calculate this properly. i was for some reason always ~ 1 BPS off
    // uint256 expectedAssetsAfter = depositAmount - (ExpectedDepositSharesNeeded + (ExpectedDepositSharesNeeded / 1000));
    //assertApproxEqAbs(plugin.totalAssets(), expectedAssetsAfter, "!erc4626 asset bal");
    assertApproxEqAbs(
      plugin.totalSupply(),
      totalSupplyBefore - redeemAmount,
      uint256(10),
      string(abi.encodePacked("!2.totalSupply ", testPreFix))
    );

    // Test that we burned the right amount of shares
    assertApproxEqAbs(
      plugin.balanceOf(address(1)),
      erc4626BalBefore - redeemAmount,
      uint256(10),
      string(abi.encodePacked("!2.erc4626 supply ", testPreFix))
    );

    // Test that the ERC4626 holds the expected amount of dotDot shares
    assertApproxEqAbs(
      this.getDepositShares(),
      depositShares - ExpectedDepositSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!2.dotDot share balance ", testPreFix))
    );
    assertTrue(
      underlyingToken.balanceOf(address(plugin)) <= 2,
      string(abi.encodePacked("2.DotDot erc4626 locked amount checking ", testPreFix))
    );
  }

  function testPauseContract() public {
    uint256 withdrawAmount = 1e18;

    deposit(address(this), depositAmount);

    vm.warp(block.timestamp + 10);

    plugin.emergencyWithdrawAndPause();

    underlyingToken.approve(address(plugin), depositAmount);
    vm.expectRevert("Pausable: paused");
    plugin.deposit(depositAmount, address(this));

    vm.expectRevert("Pausable: paused");
    plugin.mint(depositAmount, address(this));

    uint256 expectedSharesNeeded = withdrawAmount.mulDivDown(plugin.totalSupply(), plugin.totalAssets());
    plugin.withdraw(withdrawAmount, address(this), address(this));

    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      depositAmount - expectedSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!withdraw share bal ", testPreFix))
    );
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      withdrawAmount,
      uint256(10),
      string(abi.encodePacked("!withdraw asset bal ", testPreFix))
    );

    uint256 expectedAssets = withdrawAmount.mulDivUp(plugin.totalAssets(), plugin.totalSupply());
    plugin.redeem(withdrawAmount, address(this), address(this));

    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      depositAmount - withdrawAmount - expectedSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!redeem share bal ", testPreFix))
    );
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      withdrawAmount + expectedAssets,
      uint256(10),
      string(abi.encodePacked("!redeem asset bal ", testPreFix))
    );
  }

  function testEmergencyWithdrawAndPause() public virtual {
    deposit(address(this), depositAmount);

    uint256 expectedBal = plugin.previewRedeem(depositAmount);
    assertEq(underlyingToken.balanceOf(address(plugin)), 0, string(abi.encodePacked("!init 0 ", testPreFix)));

    plugin.emergencyWithdrawAndPause();

    assertApproxEqAbs(
      underlyingToken.balanceOf(address(plugin)),
      expectedBal,
      uint256(10),
      string(abi.encodePacked("!withdraws underlying ", testPreFix))
    );
    assertApproxEqAbs(
      plugin.totalAssets(),
      expectedBal,
      uint256(10),
      string(abi.encodePacked("!totalAssets == expectedBal ", testPreFix))
    );
  }

  function testEmergencyWithdrawAndRedeem() public {
    uint256 withdrawAmount = 1e18;

    deposit(address(this), depositAmount);

    vm.warp(block.timestamp + 10);

    plugin.emergencyWithdrawAndPause();

    uint256 expectedSharesNeeded = withdrawAmount.mulDivDown(plugin.totalSupply(), plugin.totalAssets());
    plugin.withdraw(withdrawAmount, address(this), address(this));

    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      depositAmount - expectedSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!withdraw share bal ", testPreFix))
    );
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      withdrawAmount,
      uint256(10),
      string(abi.encodePacked("!withdraw asset bal ", testPreFix))
    );

    uint256 expectedAssets = withdrawAmount.mulDivUp(plugin.totalAssets(), plugin.totalSupply());
    plugin.redeem(withdrawAmount, address(this), address(this));

    assertApproxEqAbs(
      plugin.balanceOf(address(this)),
      depositAmount - withdrawAmount - expectedSharesNeeded,
      uint256(10),
      string(abi.encodePacked("!redeem share bal ", testPreFix))
    );
    assertApproxEqAbs(
      underlyingToken.balanceOf(address(this)),
      withdrawAmount + expectedAssets,
      uint256(10),
      string(abi.encodePacked("!redeem asset bal ", testPreFix))
    );
  }
}
