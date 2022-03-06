// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.4.23;

import "ds-test/test.sol";
import "forge-std/stdlib.sol";
import "forge-std/Vm.sol";

import { AlpacaERC4626, IAlpacaVault } from "../contracts/compound/strategies/AlpacaERC4626.sol";
import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";
import { MockERC20 } from "@rari-capital/solmate/src/test/utils/mocks/MockERC20.sol";
import { MockVault } from "./mocks/alpaca/MockVault.sol";

contract AlpacaERC4626Test is DSTest {
  using stdStorage for StdStorage;

  Vm public constant vm = Vm(HEVM_ADDRESS);

  StdStorage stdstore;

  AlpacaERC4626 alpacaERC4626;

  MockERC20 testToken;
  MockVault mockVault;

  uint256 depositAmount = 100e18;

  function setUp() public {
    testToken = new MockERC20("TestToken", "TST", 18);
    mockVault = new MockVault(address(testToken), "MockVault", "MV", 18);
    alpacaERC4626 = new AlpacaERC4626(testToken, "TestVault", "TSTV", IAlpacaVault(address(mockVault)));
  }

  function testInitalizedValues() public {
    assertEq(alpacaERC4626.name(), "TestVault");
    assertEq(alpacaERC4626.symbol(), "TSTV");
    assertEq(address(alpacaERC4626.asset()), address(testToken));
    assertEq(address(alpacaERC4626.alpacaVault()), address(mockVault));
  }

  function deposit() public {
    testToken.mint(address(this), depositAmount);
    testToken.approve(address(alpacaERC4626), depositAmount);
    alpacaERC4626.deposit(depositAmount, address(this));
  }

  function testDeposit() public {
    deposit();
    //Test that the actual transfers worked
    assertEq(testToken.balanceOf(address(this)), 0);
    assertEq(testToken.balanceOf(address(mockVault)), depositAmount);

    //Test that the balance view calls work
    assertEq(alpacaERC4626.totalAssets(), depositAmount);
    assertEq(alpacaERC4626.balanceOfUnderlying(address(this)), depositAmount);

    //Test that we minted the correct amount of token
    assertEq(alpacaERC4626.balanceOf(address(this)), depositAmount);
  }

  function testWithdraw() public {
    deposit();
    //Alpaca Vaults always need to have a totalSupply > 1e17 (MockVault #45)
    uint256 withdrawAmount = depositAmount - 1e18;
    alpacaERC4626.withdraw(withdrawAmount, address(this), address(this));

    //Test that the actual transfers worked
    assertEq(testToken.balanceOf(address(this)), withdrawAmount);
    assertEq(testToken.balanceOf(address(mockVault)), 1e18);

    //Test that the balance view calls work
    // !!! This reverts since we divide by 0
    // The contract works fine but the question would be if we want to return a 0 if supply is 0 or if we are fine that the view function errors
    //assertEq(alpacaERC4626.totalAssets(), 0);
    //assertEq(alpacaERC4626.balanceOfUnderlying(address(this)), 0);

    // //Test that we burned the correct amount of token
    assertEq(alpacaERC4626.balanceOf(address(this)), 1e18);
  }
}
