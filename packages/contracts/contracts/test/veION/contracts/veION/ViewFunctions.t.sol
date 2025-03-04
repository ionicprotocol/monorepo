// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
import "../../Utils.sol";

contract ViewFunctions is veIONTest {
  function setUp() public {
    _setUp();
  }

  function test_getUserLock() public {
    uint256 tokenId = 1;
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    IveIONStructsEnumsErrorsEvents.LockedBalance memory lock = IveION(ve).getUserLock(tokenId, lpType);
    assertEq(lock.amount, 0, "Initial lock amount should be zero");
  }

  function test_getOwnedTokenIds() public {
    address owner = address(this);
    uint256[] memory tokenIds = IveION(ve).getOwnedTokenIds(owner);
    assertEq(tokenIds.length, 0, "Owner should initially have no token IDs");
  }

  function test_getTotalEthValueOfTokens() public {
    address owner = address(this);
    address[] memory mockLpTokens = new address[](2);
    mockLpTokens[0] = address(0x987);
    mockLpTokens[1] = address(0x765);

    address voter = address(0x321);
    IveION(ve).setVoter(voter);

    vm.mockCall(address(voter), abi.encodeWithSelector(IVoter.getAllLpRewardTokens.selector), abi.encode(mockLpTokens));

    address mockMasterPriceOracle = address(0x653);
    vm.mockCall(
      address(ap),
      abi.encodeWithSelector(IAddressesProvider.getAddress.selector, "MasterPriceOracle"),
      abi.encode(mockMasterPriceOracle)
    );

    vm.mockCall(
      address(mockMasterPriceOracle),
      abi.encodeWithSelector(IMasterPriceOracle.price.selector, mockLpTokens[0]),
      abi.encode(10e18)
    );
    vm.mockCall(
      address(mockMasterPriceOracle),
      abi.encodeWithSelector(IMasterPriceOracle.price.selector, mockLpTokens[1]),
      abi.encode(5e18)
    );

    uint256 totalValue = IveION(ve).getTotalEthValueOfTokens(owner);

    assertEq(totalValue, 0, "Initial total ETH value should be zero");
  }

  function test_getAssetsLocked() public {
    uint256 tokenId = 1;
    address[] memory assets = IveION(ve).getAssetsLocked(tokenId);
    assertEq(assets.length, 0, "Initially, no assets should be locked");
  }

  function test_getDelegatees() public {
    uint256 tokenId = 1;
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    uint256[] memory delegatees = IveION(ve).getDelegatees(tokenId, lpType);
    assertEq(delegatees.length, 0, "Initially, there should be no delegatees");
  }

  function test_getDelegators() public {
    uint256 tokenId = 1;
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    uint256[] memory delegators = IveION(ve).getDelegators(tokenId, lpType);
    assertEq(delegators.length, 0, "Initially, there should be no delegators");
  }

  function test_getUserPoint() public {
    uint256 tokenId = 1;
    IveIONStructsEnumsErrorsEvents.LpTokenType lpType = IveIONStructsEnumsErrorsEvents.LpTokenType(1);
    uint256 epoch = 0;
    IveIONStructsEnumsErrorsEvents.UserPoint memory userPoint = IveION(ve).getUserPoint(tokenId, lpType, epoch);
    assertEq(userPoint.bias, 0, "Initial user point bias should be zero");
  }
}
