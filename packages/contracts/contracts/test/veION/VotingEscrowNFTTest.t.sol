// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../config/BaseTest.t.sol";
import "../../veION/veION.sol";

contract VotingEscrowNFTTest is BaseTest {
  veION ve;
  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    ve = new veION();
    ve.initialize();
  }

  function testCreateLockVE() public fork(MODE_MAINNET) {
    // Setup
    address user = address(0x1234);
    address[] memory tokenAddresses = new address[](1);
    tokenAddresses[0] = address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE); // Example token address
    uint256[] memory tokenAmounts = new uint256[](1);
    tokenAmounts[0] = 100 ether; // 100 tokens
    uint256[] memory durations = new uint256[](1);
    durations[0] = 4 weeks; // 4 weeks lock duration

    // Mint some tokens to the user
    deal(tokenAddresses[0], user, tokenAmounts[0]);

    // Approve veION contract to spend user's tokens
    vm.startPrank(user);
    IERC20(tokenAddresses[0]).approve(address(ve), tokenAmounts[0]);

    // Create lock
    uint256 tokenId = ve.createLock(tokenAddresses, tokenAmounts, durations);

    // Assertions
    assertEq(ve.ownerOf(tokenId), user, "User should be the owner of the NFT");

    (address lockedToken, int128 amount, uint256 end, bool isPermanent) = ve.locked(tokenId, 0);
    assertEq(lockedToken, tokenAddresses[0], "Locked token address should match");
    assertEq(uint256(int256(amount)), tokenAmounts[0], "Locked amount should match");
    assertEq(end, block.timestamp + durations[0], "Lock end time should be correct");
    assertEq(isPermanent, false, "Lock should not be permanent");

    vm.stopPrank();
  }
}
