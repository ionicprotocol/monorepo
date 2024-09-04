// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;
import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
import "../config/BaseTest.t.sol";
import "../../veION/veION.sol";
import "../../veION/IveION.sol";

contract VotingEscrowNFTTest is BaseTest {
  veION ve;
  MockERC20 modeVelodrome5050IonMode;
  MockERC20 modeBalancer8020IonEth;
  MockERC20 baseAerodrome5050IonWstEth;
  MockERC20 baseBalancer8020IonEth;
  MockERC20 optimismVelodrome5050IonOp;
  MockERC20 optimismBalancer8020IonEth;

  function afterForkSetUp() internal override {
    super.afterForkSetUp();
    ve = new veION();
    ve.initialize();
    modeVelodrome5050IonMode = new MockERC20("Mode_Velodrome_5050_ION_MODE", "MV5050", 18);
    modeBalancer8020IonEth = new MockERC20("Mode_Balancer_8020_ION_ETH", "MB8020", 18);
    baseAerodrome5050IonWstEth = new MockERC20("Base_Aerodrome_5050_ION_wstETH", "BA5050", 18);
    baseBalancer8020IonEth = new MockERC20("Base_Balancer_8020_ION_ETH", "BB8020", 18);
    optimismVelodrome5050IonOp = new MockERC20("Optimism_Velodrome_5050_ION_OP", "OV5050", 18);
    optimismBalancer8020IonEth = new MockERC20("Optimism_Balancer_8020_ION_ETH", "OB8020", 18);

    address[] memory whitelistedTokens = new address[](6);
    bool[] memory isWhitelistedTokens = new bool[](6);
    whitelistedTokens[0] = address(modeVelodrome5050IonMode);
    whitelistedTokens[1] = address(modeBalancer8020IonEth);
    whitelistedTokens[2] = address(baseAerodrome5050IonWstEth);
    whitelistedTokens[3] = address(baseBalancer8020IonEth);
    whitelistedTokens[4] = address(optimismVelodrome5050IonOp);
    whitelistedTokens[5] = address(optimismBalancer8020IonEth);
    for (uint i = 0; i < 6; i++) {
      isWhitelistedTokens[i] = true;
    }
    ve.whitelistTokens(whitelistedTokens, isWhitelistedTokens);

    ve.setLpTokenType(address(modeVelodrome5050IonMode), IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);
    ve.setLpTokenType(address(modeBalancer8020IonEth), IveION.LpTokenType.Mode_Balancer_8020_ION_ETH);
    ve.setLpTokenType(address(baseAerodrome5050IonWstEth), IveION.LpTokenType.Base_Aerodrome_5050_ION_wstETH);
    ve.setLpTokenType(address(baseBalancer8020IonEth), IveION.LpTokenType.Base_Balancer_8020_ION_ETH);
    ve.setLpTokenType(address(optimismVelodrome5050IonOp), IveION.LpTokenType.Optimism_Velodrome_5050_ION_OP);
    ve.setLpTokenType(address(optimismBalancer8020IonEth), IveION.LpTokenType.Optimism_Balancer_8020_ION_ETH);
  }

  struct TestVars {
    address user;
    uint256 amount;
    address[] tokenAddresses;
    uint256[] tokenAmounts;
    uint256[] durations;
    uint256 tokenId;
    uint256 userBalanceAfterLock;
    uint256 veIONBalance;
    address lb_tokenAddress;
    int128 lb_amount;
    uint256 lb_end;
    bool lb_isPermanent;
    uint256 totalSupply;
    uint256 votingPower;
    uint256 currentEpoch;
    uint256 userEpoch;
    int128 userBias;
    int128 userSlope;
    uint256 userTs;
    uint256 userBlk;
    uint256 userPermanent;
    int128 globalBias;
    int128 globalSlope;
    uint256 globalTs;
    uint256 globalBlk;
    uint256 globalPermanentLockBalance;
  }

  function testCreateLockVE() public fork(MODE_MAINNET) {
    TestVars memory vars;

    // Create a user
    vars.user = address(0x1234);

    // Mint ModeVelodrome tokens to the user
    vars.amount = 1000 * 10 ** 18; // 1000 tokens
    modeVelodrome5050IonMode.mint(vars.user, vars.amount);

    // Approve veION contract to spend user's tokens
    vm.prank(vars.user);
    modeVelodrome5050IonMode.approve(address(ve), vars.amount);

    // Prepare parameters for createLock
    vars.tokenAddresses = new address[](1);
    vars.tokenAddresses[0] = address(modeVelodrome5050IonMode);

    vars.tokenAmounts = new uint256[](1);
    vars.tokenAmounts[0] = vars.amount;

    vars.durations = new uint256[](1);
    vars.durations[0] = 52 weeks; // 1 year

    // Create lock for the user
    vm.prank(vars.user);
    vars.tokenId = ve.createLock(vars.tokenAddresses, vars.tokenAmounts, vars.durations);

    // Assert the lock was created successfully
    assertEq(ve.ownerOf(vars.tokenId), vars.user, "Lock should be created for the user");

    // Display relevant state changes after creating a lock

    // Display token balance of user after lock
    vars.userBalanceAfterLock = modeVelodrome5050IonMode.balanceOf(vars.user);
    console.log("User's token balance after lock:", vars.userBalanceAfterLock);

    // Display token balance of veION contract
    vars.veIONBalance = modeVelodrome5050IonMode.balanceOf(address(ve));
    console.log("veION contract token balance:", vars.veIONBalance);

    IveION.LockedBalance memory locked = ve.getUserLock(vars.tokenId, IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE);

    emit log_named_address("Token address", locked.tokenAddress);
    emit log_named_uint("Amount", uint256(int256(locked.amount)));
    emit log_named_uint("End time", locked.end);
    emit log("--------------------");

    // // Display locked balance for the user's NFT
    // (vars.lb_tokenAddress, vars.lb_amount, vars.lb_end, vars.lb_isPermanent) = ve._locked(
    //   vars.tokenId,
    //   uint256(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE)
    // );
    // console.log("Locked balance amount:", uint256(int256(vars.lb_amount)));
    // console.log("Locked balance end time:", vars.lb_end);

    // // Display total supply
    // vars.totalSupply = ve.supply();
    // console.log("Total supply:", vars.totalSupply);

    // // Display user's voting power
    // vars.votingPower = ve.balanceOf(vars.user);
    // console.log("User's voting power:", vars.votingPower);

    // // Display global epoch
    // vars.currentEpoch = ve.epoch();
    // console.log("Current global epoch:", vars.currentEpoch);

    // // Display user's point history
    // vars.userEpoch = ve.userPointEpoch(vars.tokenId, uint256(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE));
    // (vars.userBias, vars.userSlope, vars.userTs, vars.userBlk, vars.userPermanent) = ve._userPointHistory(
    //   vars.tokenId,
    //   vars.userEpoch
    // );
    // console.log("User's latest point - bias:", uint256(int256(vars.userBias)));
    // console.log("User's latest point - slope:", uint256(int256(vars.userSlope)));
    // console.log("User's latest point - ts:", vars.userTs);

    // // Display global point history
    // (vars.globalBias, vars.globalSlope, vars.globalTs, vars.globalBlk, vars.globalPermanentLockBalance) = ve
    //   ._pointHistory(vars.currentEpoch, uint256(IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE));
    // console.log("Global latest point - bias:", uint256(int256(vars.globalBias)));
    // console.log("Global latest point - slope:", uint256(int256(vars.globalSlope)));
    // console.log("Global latest point - ts:", vars.globalTs);
  }
}
