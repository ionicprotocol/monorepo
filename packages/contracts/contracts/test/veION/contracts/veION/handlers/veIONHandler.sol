// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;
// import { CommonBase } from "forge-std/Base.sol";
// import { StdCheats } from "forge-std/StdCheats.sol";
// import { StdUtils } from "forge-std/StdUtils.sol";
// import { MockERC20 } from "solmate/test/utils/mocks/MockERC20.sol";
// import "../../../../../veION/veION.sol";
// import "../../../../../veION/interfaces/IveION.sol";

// contract veIONHandler is CommonBase, StdCheats, StdUtils {
//   uint256 constant MAXTIME = 2 * 365 * 86400;

//   address user;

//   veION ve;
//   IveION.LpTokenType veloLpType;
//   IveION.LpTokenType balancerLpType;
//   MockERC20 modeVelodrome5050IonMode;
//   MockERC20 modeBalancer8020IonEth;

//   address[] public actors;
//   address internal currentActor;

//   modifier useActor(uint256 actorIndexSeed) {
//     currentActor = actors[bound(actorIndexSeed, 0, actors.length - 1)];
//     vm.startPrank(currentActor);
//     _;
//     vm.stopPrank();
//   }

//   constructor(
//     address _veIONAddress,
//     IveION.LpTokenType _veloLpType,
//     MockERC20 _modeVelodrome5050IonMode,
//     address _user,
//     address[] memory _actors
//   ) {
//     ve = veION(_veIONAddress);
//     veloLpType = _veloLpType;
//     modeVelodrome5050IonMode = _modeVelodrome5050IonMode;
//     user = _user;
//     actors = _actors;
//   }

//   function createLockFor(
//     uint256 _amount,
//     uint256 _duration,
//     uint256 _actorIndexSeed,
//     uint256 _actorToIndexSeed
//   ) external useActor(_actorIndexSeed) {
//     _amount = bound(_amount, ve.s_minimumLockAmount(veloLpType), type(uint256).max);
//     _duration = bound(_duration, ve.s_minimumLockDuration(), MAXTIME);

//     IveION.LpTokenType[] memory lpTypes = new IveION.LpTokenType[](1);
//     uint256[] memory tokenAmounts = new uint256[](1);
//     uint256[] memory durations = new uint256[](1);
//     bool[] memory stakeUnderlying = new bool[](1);
//     lpTypes[0] = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;
//     tokenAmounts[0] = _amount;
//     durations[0] = _duration;
//     stakeUnderlying[0] = false;
//     address toActor = actors[bound(_actorToIndexSeed, 0, actors.length - 1)];

//     modeVelodrome5050IonMode.mint(currentActor, _amount);
//     modeVelodrome5050IonMode.approve(address(ve), _amount);
//     ve.createLockFor(lpTypes, tokenAmounts, durations, stakeUnderlying, toActor);
//   }

//   function createLock(uint256 _amount, uint256 _duration, uint256 _actorIndexSeed) external useActor(_actorIndexSeed) {
//     _amount = bound(_amount, ve.s_minimumLockAmount(veloLpType), type(uint256).max);
//     _duration = bound(_duration, ve.s_minimumLockDuration(), MAXTIME);

//     IveION.LpTokenType[] memory lpTypes = new IveION.LpTokenType[](1);
//     uint256[] memory tokenAmounts = new uint256[](1);
//     uint256[] memory durations = new uint256[](1);
//     bool[] memory stakeUnderlying = new bool[](1);
//     lpTypes[0] = IveION.LpTokenType.Mode_Velodrome_5050_ION_MODE;
//     tokenAmounts[0] = _amount;
//     durations[0] = _duration;
//     stakeUnderlying[0] = false;

//     modeVelodrome5050IonMode.mint(currentActor, _amount);
//     modeVelodrome5050IonMode.approve(address(ve), _amount);
//     ve.createLock(lpTypes, tokenAmounts, durations, stakeUnderlying);
//   }

//   function increaseAmount(uint256 _amount, uint256 _randomSeed) external useActor(_randomSeed) {
//     _amount = bound(_amount, 0, type(uint256).max);

//     uint256[] memory ownedTokenIds = ve.getOwnedTokenIds(currentActor);
//     uint256 tokenIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % ownedTokenIds.length;
//     uint256 _tokenId = ownedTokenIds[tokenIndex];

//     address[] memory assetsLocked = ve.getAssetsLocked(_tokenId);
//     uint256 assetsIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % assetsLocked.length;
//     address _tokenAddress = assetsLocked[assetsIndex];

//     uint256 _tokenAmount = _amount;
//     bool _stakeUnderlying = false;

//     modeVelodrome5050IonMode.mint(currentActor, _amount);
//     modeVelodrome5050IonMode.approve(address(ve), _amount);
//     ve.increaseAmount(_tokenAddress, _tokenId, _tokenAmount, _stakeUnderlying);
//   }

//   function increaseUnlockTime(uint256 _lockDuration, uint256 _randomSeed) external {
//     _lockDuration = bound(_lockDuration, ve.s_minimumLockDuration(), MAXTIME);

//     uint256[] memory ownedTokenIds = ve.getOwnedTokenIds(currentActor);
//     uint256 tokenIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % ownedTokenIds.length;
//     uint256 _tokenId = ownedTokenIds[tokenIndex];

//     address[] memory assetsLocked = ve.getAssetsLocked(_tokenId);
//     uint256 assetsIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % assetsLocked.length;
//     address _tokenAddress = assetsLocked[assetsIndex];

//     ve.increaseUnlockTime(_tokenAddress, _tokenId, _lockDuration);
//   }

//   function withdraw(uint256 _randomSeed) external {
//     uint256[] memory ownedTokenIds = ve.getOwnedTokenIds(currentActor);
//     uint256 tokenIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % ownedTokenIds.length;
//     uint256 _tokenId = ownedTokenIds[tokenIndex];

//     address[] memory assetsLocked = ve.getAssetsLocked(_tokenId);
//     uint256 assetsIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % assetsLocked.length;
//     address _tokenAddress = assetsLocked[assetsIndex];

//     ve.withdraw(_tokenAddress, _tokenId);
//   }

//   function merge(uint256 _randomSeed) external {
//     uint256[] memory ownedTokenIds = ve.getOwnedTokenIds(currentActor);

//     uint256 firstTokenIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % ownedTokenIds.length;
//     uint256 secondTokenIndex = (firstTokenIndex + 1) % ownedTokenIds.length;

//     uint256 _from = ownedTokenIds[firstTokenIndex];
//     uint256 _to = ownedTokenIds[secondTokenIndex];

//     ve.merge(_from, _to);
//   }

//   function split(uint256 _splitAmount, uint256 _randomSeed) external {
//     uint256[] memory ownedTokenIds = ve.getOwnedTokenIds(currentActor);
//     uint256 tokenIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % ownedTokenIds.length;
//     uint256 _tokenId = ownedTokenIds[tokenIndex];

//     address[] memory assetsLocked = ve.getAssetsLocked(_tokenId);
//     uint256 assetsIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % assetsLocked.length;
//     address _tokenAddress = assetsLocked[assetsIndex];

//     ve.split(_tokenAddress, _tokenId, _splitAmount);
//   }

//   function delegate(uint256 _randomSeed) external {
//     uint256[] memory ownedTokenIds = ve.getOwnedTokenIds(currentActor);
//     uint256 tokenIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % ownedTokenIds.length;
//     uint256 fromTokenId = ownedTokenIds[tokenIndex];

//     address[] memory assetsLocked = ve.getAssetsLocked(fromTokenId);
//     uint256 assetsIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % assetsLocked.length;
//     address lpToken = assetsLocked[assetsIndex];

//     uint256 totalSupply = ve.s_tokenId();
//     uint256 toTokenId;
//     bool validToken = false;

//     while (!validToken) {
//       toTokenId = uint256(keccak256(abi.encodePacked(_randomSeed, block.timestamp))) % totalSupply;
//       if (ve.ownerOf(toTokenId) != address(0)) {
//         validToken = true;
//       } else {
//         _randomSeed++;
//       }
//     }

//     IveION.LockedBalance memory lock = ve.getUserLock(fromTokenId, ve.s_addressToLpType(lpToken));
//     uint256 amount = uint256(keccak256(abi.encodePacked(_randomSeed, block.timestamp))) % lock.amount;
//     ve.delegate(fromTokenId, toTokenId, lpToken, amount);
//   }

//   function removeDelegator(uint256 _randomSeed) external {
//     // uint256[] memory ownedTokenIds = ve.getOwnedTokenIds(currentActor);
//     // uint256 tokenIndex = uint256(keccak256(abi.encodePacked(_randomSeed))) % ownedTokenIds.length;
//     // uint256 toTokenId = ownedTokenIds[tokenIndex];
//     // uint256[] memory delegators = ve.getDelegators(toTokenId, lpToken);
//     // uint256 randomIndex = uint256(keccak256(abi.encodePacked(block.timestamp, block.difficulty))) % delegators.length;
//     // uint256[] memory selectedDelegator = new uint256[](1);
//     // selectedDelegator[0] = delegators[randomIndex];
//     // ve.removeDelegators(fromTokenIds, toTokenId, lpToken, amounts);
//   }

//   function removeDelegatee(
//     uint256 fromTokenId,
//     uint256[] memory toTokenIds,
//     address lpToken,
//     uint256[] memory amounts
//   ) external {}
// }
