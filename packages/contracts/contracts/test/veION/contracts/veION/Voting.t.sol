// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract Voting is veIONTest {
  address user;
  LockInfo lockInput;

  function setUp() public {
    _setUp();
    user = address(0x1234);
    lockInput = _createLockInternal(user);
  }

  function test_voting_VotingCanBeSet() public {
    address voter = address(this);
    IveION(ve).setVoter(voter);
    uint256 tokenId = lockInput.tokenId;

    vm.prank(voter);
    IveION(ve).voting(tokenId, true);

    bool isVoted = IveION(ve).s_voted(tokenId);
    assertTrue(isVoted, "Token should be marked as voted");

    vm.prank(voter);
    IveION(ve).voting(tokenId, false);

    isVoted = IveION(ve).s_voted(tokenId);
    assertFalse(isVoted, "Token should not be marked as voted");
  }
}
