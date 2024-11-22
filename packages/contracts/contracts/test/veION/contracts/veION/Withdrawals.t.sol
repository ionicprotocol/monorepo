// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";
import "../../harness/veIONHarness.sol";

contract Withdrawals is veIONTest {
  address user;
  LockInfo lockInput;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);

    modeVelodrome5050IonMode.mint(address(0x1241), 20_000_000 ether);
    vm.prank(user);
    ve.withdraw(lockInput.tokenAddress, lockInput.tokenId);
  }

  function test_withdrawProtocolFees_SuccessfulWithdrawal() public {
    address recipient = address(0x5678);
    address tokenAddress = lockInput.tokenAddress;
    uint256 initialRecipientBalance = IERC20(tokenAddress).balanceOf(recipient);
    uint256 initialProtocolFees = ve.s_protocolFees(ve.s_lpType(tokenAddress));

    ve.withdrawProtocolFees(tokenAddress, recipient);

    uint256 protocolFees = ve.s_protocolFees(ve.s_lpType(tokenAddress));
    assertEq(protocolFees, 0, "Protocol fees should be zero after withdrawal");

    uint256 finalRecipientBalance = IERC20(tokenAddress).balanceOf(recipient);
    assertEq(
      finalRecipientBalance,
      initialRecipientBalance + initialProtocolFees,
      "Recipient should receive the protocol fees"
    );
  }

  function test_withdrawProtocolFees_NotOwner() public {
    address recipient = address(0x5678);
    address tokenAddress = lockInput.tokenAddress;

    vm.prank(user);
    vm.expectRevert("Ownable: caller is not the owner");
    ve.withdrawProtocolFees(tokenAddress, recipient);
  }

  function test_withdrawDistributedFees_SuccessfulWithdrawal() public {
    address recipient = address(0x5678);
    address tokenAddress = lockInput.tokenAddress;
    uint256 initialRecipientBalance = IERC20(tokenAddress).balanceOf(recipient);
    uint256 initialDistributedFees = ve.s_distributedFees(ve.s_lpType(tokenAddress));

    ve.withdrawDistributedFees(tokenAddress, recipient);

    uint256 distributedFees = ve.s_distributedFees(ve.s_lpType(tokenAddress));
    assertEq(distributedFees, 0, "Distributed fees should be zero after withdrawal");

    uint256 finalRecipientBalance = IERC20(tokenAddress).balanceOf(recipient);
    assertEq(
      finalRecipientBalance,
      initialRecipientBalance + initialDistributedFees,
      "Recipient should receive the distributed fees"
    );
  }

  function test_withdrawDistributedFees_NotOwner() public {
    address recipient = address(0x5678);
    address tokenAddress = lockInput.tokenAddress;

    vm.prank(user);
    vm.expectRevert("Ownable: caller is not the owner");
    ve.withdrawDistributedFees(tokenAddress, recipient);
  }
}
