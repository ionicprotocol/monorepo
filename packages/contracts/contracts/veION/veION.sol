// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import { ERC721Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IveION } from "./IveION.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { console } from "forge-std/console.sol";
import { IStakeStrategy } from "./stake/IStakeStrategy.sol";
import "openzeppelin-contracts-upgradeable/contracts/utils/AddressUpgradeable.sol";

contract veION is Ownable2StepUpgradeable, ERC721Upgradeable, IveION {
  using AddressUpgradeable for address;
  using SafeERC20 for IERC20;

  mapping(address => bool) public s_bridges;
  mapping(address => bool) public s_whitelistedToken;
  mapping(uint256 => mapping(LpTokenType => LockedBalance)) public s_locked; // tokenid => lpType => LockedBalance
  mapping(uint256 => mapping(LpTokenType => int128)) public s_slopeChanges; // timestamp => lpType => slopeChange
  mapping(uint256 => mapping(LpTokenType => GlobalPoint)) public s_pointHistory; // epoch => lpType => GlobalPoint
  mapping(uint256 => mapping(LpTokenType => uint256)) public s_userPointEpoch; // tokenid => lpType => user epoch
  mapping(uint256 => mapping(uint256 => mapping(LpTokenType => UserPoint))) public s_userPointHistory; // tokenid => user epoch => lptype => UserPoint
  mapping(uint256 => bool) public s_voted;
  mapping(uint256 => EscrowType) public s_escrowType;
  mapping(address => LpTokenType) public s_lpType;

  uint256 s_tokenId;
  mapping(LpTokenType => uint256) public s_epoch;
  mapping(LpTokenType => uint256) public s_supply;
  mapping(LpTokenType => uint256) public s_permanentLockBalance;
  mapping(address => bool) public s_canSplit;
  mapping(LpTokenType => IStakeStrategy) public s_stakeStrategy;

  address public s_team;

  uint256 internal constant WEEK = 1 weeks;
  uint256 internal constant MAXTIME = 4 * 365 * 86400;
  int128 internal constant iMAXTIME = 4 * 365 * 86400;
  uint256 internal constant MULTIPLIER = 1 ether;

  modifier onlyBridge() {
    if (!s_bridges[msg.sender]) {
      revert NotMinter();
    }
    _;
  }

  function initialize() public initializer {
    __Ownable2Step_init();
    __ERC721_init("veION", "veION");
  }

  function _depositFor(
    address _tokenAddress,
    uint256 _tokenId,
    uint256 _tokenAmount,
    uint256 _unlockTime,
    LockedBalance memory _oldLocked,
    DepositType _depositType,
    LpTokenType _lpType
  ) internal {
    uint256 supplyBefore = s_supply[_lpType];
    s_supply[_lpType] = supplyBefore + _tokenAmount;

    LockedBalance memory newLocked;
    (
      newLocked.tokenAddress,
      newLocked.amount,
      newLocked.start,
      newLocked.end,
      newLocked.isPermanent,
      newLocked.boost
    ) = (
      _oldLocked.tokenAddress,
      _oldLocked.amount,
      _oldLocked.start,
      _oldLocked.end,
      _oldLocked.isPermanent,
      _oldLocked.boost
    );
    newLocked.tokenAddress = _tokenAddress;
    newLocked.amount += int128(uint128(_tokenAmount));
    if (_unlockTime != 0) {
      if (newLocked.start == 0) newLocked.start = block.timestamp;
      newLocked.end = _unlockTime;
      uint256 totalLockTime = newLocked.end - newLocked.start;
      newLocked.boost = _calculateBoost(totalLockTime);
    }
    s_locked[_tokenId][_lpType] = newLocked;

    _checkpoint(_tokenId, _oldLocked, newLocked, _lpType);

    address _from = _msgSender();
    if (_tokenAmount != 0) {
      IERC20(_tokenAddress).safeTransferFrom(_from, address(this), _tokenAmount);
      (IStakeStrategy _stakeStrategy, bytes memory _stakeData) = _getStakeStrategy(_lpType);
      if (address(_stakeStrategy) != address(0)) {
        _functionDelegateCall(
          address(_stakeStrategy),
          abi.encodeWithSelector(_stakeStrategy.stake.selector, _from, _tokenAmount, _stakeData)
        );
      }
    }

    emit Deposit(_from, _tokenId, _depositType, _tokenAmount, newLocked.end, block.timestamp);
    emit Supply(supplyBefore, s_supply[_lpType]);
  }

  struct CheckpointVars {
    UserPoint uOld;
    UserPoint uNew;
    int128 oldDslope;
    int128 newDslope;
    uint256 _epoch;
  }

  function _checkpoint(
    uint256 _tokenId,
    LockedBalance memory _oldLocked,
    LockedBalance memory _newLocked,
    LpTokenType _lpType
  ) internal {
    CheckpointVars memory vars;
    vars._epoch = s_epoch[_lpType];

    if (_tokenId != 0) {
      vars.uNew.permanent = _newLocked.isPermanent ? uint256(int256(_newLocked.amount)) : 0;

      if (_oldLocked.end > block.timestamp && _oldLocked.amount > 0) {
        vars.uOld.slope = _oldLocked.amount / iMAXTIME;
        vars.uOld.bias = vars.uOld.slope * int128(int256(_oldLocked.end - block.timestamp));
      }
      if (_newLocked.end > block.timestamp && _newLocked.amount > 0) {
        vars.uNew.slope = _newLocked.amount / iMAXTIME;
        vars.uNew.bias = vars.uNew.slope * int128(int256(_newLocked.end - block.timestamp));
      }

      vars.oldDslope = s_slopeChanges[_oldLocked.end][_lpType];
      if (_newLocked.end != 0) {
        if (_newLocked.end == _oldLocked.end) {
          vars.newDslope = vars.oldDslope;
        } else {
          vars.newDslope = s_slopeChanges[_newLocked.end][_lpType];
        }
      }
    }

    GlobalPoint memory lastPoint = GlobalPoint({
      bias: 0,
      slope: 0,
      ts: block.timestamp,
      blk: block.number,
      permanentLockBalance: 0
    });
    if (vars._epoch > 0) {
      lastPoint = s_pointHistory[vars._epoch][_lpType];
    }

    uint256 lastCheckPoint = lastPoint.ts;

    GlobalPoint memory initialLastPoint = GlobalPoint({
      bias: lastPoint.bias,
      slope: lastPoint.slope,
      ts: lastPoint.ts,
      blk: lastPoint.blk,
      permanentLockBalance: lastPoint.permanentLockBalance
    });
    uint256 blockSlope = 0;

    if (block.timestamp > lastPoint.ts) {
      blockSlope = (MULTIPLIER * (block.number - lastPoint.blk)) / (block.timestamp - lastPoint.ts);
    }

    {
      uint256 t_i = (lastCheckPoint / WEEK) * WEEK;
      for (uint256 i = 0; i < 255; ++i) {
        t_i += WEEK;
        int128 d_slope = 0;
        if (t_i > block.timestamp) {
          t_i = block.timestamp;
        } else {
          d_slope = s_slopeChanges[t_i][_lpType];
        }
        lastPoint.bias -= lastPoint.slope * int128(int256(t_i - lastCheckPoint));
        lastPoint.slope += d_slope;
        if (lastPoint.bias < 0) {
          lastPoint.bias = 0;
        }
        if (lastPoint.slope < 0) {
          lastPoint.slope = 0;
        }
        lastCheckPoint = t_i;
        lastPoint.ts = t_i;
        lastPoint.blk = initialLastPoint.blk + (blockSlope * (t_i - initialLastPoint.ts)) / MULTIPLIER;
        vars._epoch += 1;
        if (t_i == block.timestamp) {
          lastPoint.blk = block.number;
          break;
        } else {
          s_pointHistory[vars._epoch][_lpType] = lastPoint;
        }
      }
    }

    if (_tokenId != 0) {
      lastPoint.slope += (vars.uNew.slope - vars.uOld.slope);
      lastPoint.bias += (vars.uNew.bias - vars.uOld.bias);
      if (lastPoint.slope < 0) {
        lastPoint.slope = 0;
      }
      if (lastPoint.bias < 0) {
        lastPoint.bias = 0;
      }
      lastPoint.permanentLockBalance = s_permanentLockBalance[_lpType];
    }

    if (vars._epoch != 1 && s_pointHistory[vars._epoch - 1][_lpType].ts == block.timestamp) {
      // vars._epoch = s_epoch + 1, so we do not increment s_epoch
      s_pointHistory[vars._epoch - 1][_lpType] = lastPoint;
    } else {
      // more than one global point may have been written, so we update s_epoch
      s_epoch[_lpType] = vars._epoch;
      s_pointHistory[vars._epoch][_lpType] = lastPoint;
    }

    if (_tokenId != 0) {
      if (_oldLocked.end > block.timestamp) {
        vars.oldDslope += vars.uOld.slope;
        if (_newLocked.end == _oldLocked.end) {
          vars.oldDslope -= vars.uNew.slope;
        }
        s_slopeChanges[_oldLocked.end][_lpType] = vars.oldDslope;
      }

      if (_newLocked.end > block.timestamp) {
        // update slope if new lock is greater than old lock and is not permanent or if old lock is permanent
        if (_newLocked.end > _oldLocked.end) {
          vars.newDslope -= vars.uNew.slope; // old slope disappeared at this point
          s_slopeChanges[_newLocked.end][_lpType] = vars.newDslope;
        }
        // else: we recorded it already in oldDslope
      }

      // If timestamp of last user point is the same, overwrite the last user point
      // Else record the new user point into history
      // Exclude epoch 0
      vars.uNew.ts = block.timestamp;
      vars.uNew.blk = block.number;
      uint256 userEpoch = s_userPointEpoch[_tokenId][_lpType];
      if (userEpoch != 0 && s_userPointHistory[_tokenId][userEpoch][_lpType].ts == block.timestamp) {
        s_userPointHistory[_tokenId][userEpoch][_lpType] = vars.uNew;
      } else {
        s_userPointEpoch[_tokenId][_lpType] = ++userEpoch;
        s_userPointHistory[_tokenId][userEpoch][_lpType] = vars.uNew;
      }
    }
  }

  function _createLock(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    address _to
  ) internal returns (uint256) {
    uint256 _tokenId = ++s_tokenId;
    uint256 _length = _tokenAddress.length;
    _mint(_to, _tokenId);

    for (uint i = 0; i < _length; i++) {
      LpTokenType _lpType = s_lpType[_tokenAddress[i]];

      uint256 unlockTime = ((block.timestamp + _duration[i]) / WEEK) * WEEK;

      if (_tokenAmount[i] == 0) revert ZeroAmount();
      if (unlockTime <= block.timestamp) revert LockDurationNotInFuture();
      if (unlockTime > block.timestamp + MAXTIME) revert LockDurationTooLong();
      if (!s_whitelistedToken[_tokenAddress[i]]) revert TokenNotWhitelisted();

      _depositFor(
        _tokenAddress[i],
        _tokenId,
        _tokenAmount[i],
        unlockTime,
        s_locked[_tokenId][_lpType],
        DepositType.CREATE_LOCK_TYPE,
        _lpType
      );
    }
    return _tokenId;
  }

  function _calculateBoost(uint256 _duration) internal pure returns (uint256) {
    if (_duration >= 2 * 365 days) {
      return 2e18;
    } else if (_duration >= 1.5 * 365 days) {
      return 1.5e18;
    } else if (_duration >= 365 days) {
      return 1.25e18;
    } else {
      return 1e18;
    }
  }

  function createLockFor(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    address _to
  ) external override returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, _to);
  }

  function createLock(
    address[] calldata _tokenAddress,
    uint256[] calldata _tokenAmount,
    uint256[] calldata _duration
  ) external override returns (uint256) {
    return _createLock(_tokenAddress, _tokenAmount, _duration, msg.sender);
  }

  function _increaseAmountFor(
    address _tokenAddress,
    uint256 _tokenId,
    uint256 _value,
    DepositType _depositType
  ) internal {
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_tokenId][_lpType];

    if (_value == 0) revert ZeroAmount();
    if (oldLocked.amount <= 0) revert NoLockFound();
    if (oldLocked.end <= block.timestamp && !oldLocked.isPermanent) revert LockExpired();

    if (oldLocked.isPermanent) s_permanentLockBalance[_lpType] += _value;
    _depositFor(_tokenAddress, _tokenId, _value, 0, oldLocked, _depositType, _lpType);
  }

  function increaseAmount(address _tokenAddress, uint256 _tokenId, uint256 _tokenAmount) external {
    if (!_isApprovedOrOwner(_msgSender(), _tokenId)) revert NotApprovedOrOwner();
    _increaseAmountFor(_tokenAddress, _tokenId, _tokenAmount, DepositType.INCREASE_LOCK_AMOUNT);
  }

  function increaseUnlockTime(address _tokenAddress, uint256 _tokenId, uint256 _lockDuration) external {
    if (!_isApprovedOrOwner(_msgSender(), _tokenId)) revert NotApprovedOrOwner();

    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_tokenId][_lpType];
    if (oldLocked.isPermanent) revert PermanentLock();
    uint256 unlockTime = ((block.timestamp + _lockDuration) / WEEK) * WEEK; // Locktime is rounded down to weeks

    if (oldLocked.end <= block.timestamp) revert LockExpired();
    if (oldLocked.amount <= 0) revert NoLockFound();
    if (unlockTime <= oldLocked.end) revert LockDurationNotInFuture();
    if (unlockTime > block.timestamp + MAXTIME) revert LockDurationTooLong();

    _depositFor(_tokenAddress, _tokenId, 0, unlockTime, oldLocked, DepositType.INCREASE_UNLOCK_TIME, _lpType);
  }

  function whitelistTokens(address[] memory _tokens, bool[] memory _isWhitelisted) external onlyOwner {
    require(_tokens.length == _isWhitelisted.length, "Unequal Arrays");
    for (uint256 i; i < _tokens.length; i++) s_whitelistedToken[_tokens[i]] = _isWhitelisted[i];
  }

  /**
   * @notice Sets the LP token type for a given token address
   * @param _token Address of the token
   * @param _type LP token type to be set
   */
  function setLpTokenType(address _token, LpTokenType _type) external onlyOwner {
    require(_token != address(0), "Invalid token address");
    s_lpType[_token] = _type;
  }

  /**
   * @notice Sets the strategy for a given LP token type
   * @param _lpType LP token type to set the strategy for
   * @param _strategy Address of the strategy contract
   * @param _strategyData Additional data for the strategy
   */
  function setStakeStrategy(
    LpTokenType _lpType,
    IStakeStrategy _strategy,
    bytes memory _strategyData
  ) external onlyOwner {
    require(address(_strategy) != address(0), "Invalid strategy address");
    s_stakeStrategy[_lpType] = IStakeStrategy(_strategy);
  }

  /**
   * @notice Withdraws underlying assets from the veNFT.
   * If unlock time has not passed, uses a formula to unlock early with penalty.
   * @param _tokenId Token ID.
   */
  function withdraw(address _tokenAddress, uint256 _tokenId) external override {
    address sender = _msgSender();
    if (!_isApprovedOrOwner(sender, _tokenId)) revert NotApprovedOrOwner();
    if (s_voted[_tokenId]) revert AlreadyVoted();
    if (s_escrowType[_tokenId] != EscrowType.NORMAL) revert NotNormalNFT();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLocked = s_locked[_tokenId][_lpType];
    if (oldLocked.isPermanent) revert PermanentLock();
    if (block.timestamp < oldLocked.end) revert LockNotExpired();
    uint256 value = uint256(int256(oldLocked.amount));
    _burn(_tokenId);
    s_locked[_tokenId][_lpType] = LockedBalance(address(0), 0, 0, 0, false, 0);
    uint256 supplyBefore = s_supply[_lpType];
    s_supply[_lpType] = supplyBefore - value;
    _checkpoint(_tokenId, oldLocked, LockedBalance(address(0), 0, 0, 0, false, 0), _lpType);
    IERC20(_tokenAddress).safeTransfer(sender, value);
    emit Withdraw(sender, _tokenId, value, block.timestamp);
    emit Supply(supplyBefore, supplyBefore - value);
  }

  function merge(address _tokenAddress, uint256 _from, uint256 _to) external {
    address sender = _msgSender();
    if (_from == _to) revert SameNFT();
    if (!_isApprovedOrOwner(sender, _from)) revert NotApprovedOrOwner();
    if (!_isApprovedOrOwner(sender, _to)) revert NotApprovedOrOwner();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory oldLockedTo = s_locked[_to][_lpType];
    if (oldLockedTo.end <= block.timestamp && !oldLockedTo.isPermanent) revert LockExpired();

    LockedBalance memory oldLockedFrom = s_locked[_from][_lpType];
    if (oldLockedFrom.isPermanent) revert PermanentLock();
    uint256 end = oldLockedFrom.end >= oldLockedTo.end ? oldLockedFrom.end : oldLockedTo.end;

    _burn(_from);
    s_locked[_from][_lpType] = LockedBalance(address(0), 0, 0, 0, false, 0);
    _checkpoint(_from, oldLockedFrom, LockedBalance(address(0), 0, 0, 0, false, 0), _lpType);

    LockedBalance memory newLockedTo;
    newLockedTo.amount = oldLockedTo.amount + oldLockedFrom.amount;
    newLockedTo.isPermanent = oldLockedTo.isPermanent;
    if (newLockedTo.isPermanent) {
      s_permanentLockBalance[_lpType] += uint256(int256(oldLockedFrom.amount));
    } else {
      newLockedTo.end = end;
    }
    _checkpoint(_to, oldLockedTo, newLockedTo, _lpType);
    s_locked[_to][_lpType] = newLockedTo;
  }

  function split(
    address _tokenAddress,
    uint256 _from,
    uint256 _amount
  ) external returns (uint256 _tokenId1, uint256 _tokenId2) {
    address sender = _msgSender();
    address owner = _ownerOf(_from);
    if (owner == address(0)) revert SplitNoOwner();
    if (!s_canSplit[owner] && !s_canSplit[address(0)]) revert SplitNotAllowed();
    if (!_isApprovedOrOwner(sender, _from)) revert NotApprovedOrOwner();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory newLocked = s_locked[_from][_lpType];
    if (newLocked.end <= block.timestamp && !newLocked.isPermanent) revert LockExpired();
    int128 _splitAmount = int128(int256(_amount));
    if (_splitAmount == 0) revert ZeroAmount();
    if (newLocked.amount <= _splitAmount) revert AmountTooBig();

    _burn(_from);
    s_locked[_from][_lpType] = LockedBalance(address(0), 0, 0, 0, false, 0);
    _checkpoint(_from, newLocked, LockedBalance(address(0), 0, 0, 0, false, 0), _lpType);

    newLocked.amount -= _splitAmount;
    _tokenId1 = _createSplitVE(owner, newLocked, _lpType);

    newLocked.amount = _splitAmount;
    _tokenId2 = _createSplitVE(owner, newLocked, _lpType);
  }

  function _createSplitVE(
    address _to,
    LockedBalance memory _newLocked,
    LpTokenType _lpType
  ) private returns (uint256 _tokenId) {
    _tokenId = ++s_tokenId;
    s_locked[_tokenId][_lpType] = _newLocked;
    _checkpoint(_tokenId, LockedBalance(address(0), 0, 0, 0, false, 0), _newLocked, _lpType);
    _mint(_to, _tokenId);
  }

  function toggleSplit(address _account, bool _bool) external {
    if (_msgSender() != s_team) revert NotTeam();
    s_canSplit[_account] = _bool;
  }

  function lockPermanent(address _tokenAddress, uint256 _tokenId) external {
    address sender = _msgSender();
    if (!_isApprovedOrOwner(sender, _tokenId)) revert NotApprovedOrOwner();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory _newLocked = s_locked[_tokenId][_lpType];
    if (_newLocked.isPermanent) revert PermanentLock();
    if (_newLocked.end <= block.timestamp) revert LockExpired();
    if (_newLocked.amount <= 0) revert NoLockFound();

    uint256 _amount = uint256(int256(_newLocked.amount));
    s_permanentLockBalance[_lpType] += _amount;
    _newLocked.end = 0;
    _newLocked.isPermanent = true;
    _checkpoint(_tokenId, s_locked[_tokenId][_lpType], _newLocked, _lpType);
    s_locked[_tokenId][_lpType] = _newLocked;
  }

  function unlockPermanent(address _tokenAddress, uint256 _tokenId) external {
    address sender = _msgSender();
    if (!_isApprovedOrOwner(sender, _tokenId)) revert NotApprovedOrOwner();
    LpTokenType _lpType = s_lpType[_tokenAddress];
    LockedBalance memory _newLocked = s_locked[_tokenId][_lpType];
    if (!_newLocked.isPermanent) revert NotPermanentLock();

    uint256 _amount = uint256(int256(_newLocked.amount));
    s_permanentLockBalance[_lpType] -= _amount;
    _newLocked.end = ((block.timestamp + MAXTIME) / WEEK) * WEEK;
    _newLocked.isPermanent = false;
    _checkpoint(_tokenId, s_locked[_tokenId][_lpType], _newLocked, _lpType);
    s_locked[_tokenId][_lpType] = _newLocked;
  }
  /**
   * @notice Part of xERC20 standard. Intended to be called by a bridge adapter contract.
   * Mints a token cross-chain, initializing it with a set of params that are preserved cross-chain.
   * @param tokenId Token ID to mint.
   * @param to Address to mint to.
   * @param unlockTime Timestamp of unlock (needs to be preserved across chains).
   */
  function mint(uint256 tokenId, address to, uint256 unlockTime) external override onlyBridge {
    // TODO: Implement function logic
  }

  /**
   * @notice Part of xERC20 standard. Intended to be called by a bridge adapter contract.
   * Burns a token and returns relevant metadata.
   * @param tokenId Token ID to burn.
   * @return to Address which owned the token.
   * @return unlockTime Timestamp of unlock (needs to be preserved across chains).
   */
  function burn(uint256 tokenId) external override onlyBridge returns (address to, uint256 unlockTime) {
    // TODO: Implement function logic
  }

  function getUserLock(uint256 _tokenId, LpTokenType _lpType) external view returns (LockedBalance memory) {
    return s_locked[_tokenId][_lpType];
  }

  function setTeam(address _team) external onlyOwner {
    if (_team == address(0)) revert ZeroAddress();
    s_team = _team;
  }

  function _getStakeStrategy(
    LpTokenType _lpType
  ) internal view returns (IStakeStrategy _stakeStrategy, bytes memory _stakeData) {
    IStakeStrategy strategy = s_stakeStrategy[_lpType];
    return (strategy, "");
  }

  function _functionDelegateCall(address target, bytes memory data) private returns (bytes memory) {
    require(AddressUpgradeable.isContract(target), "Address: delegate call to non-contract");
    (bool success, bytes memory returndata) = target.delegatecall(data);
    return _verifyCallResult(success, returndata, "Address: low-level delegate call failed");
  }

  function _verifyCallResult(
    bool success,
    bytes memory returndata,
    string memory errorMessage
  ) private pure returns (bytes memory) {
    if (success) {
      return returndata;
    } else {
      if (returndata.length > 0) {
        assembly {
          let returndata_size := mload(returndata)
          revert(add(32, returndata), returndata_size)
        }
      } else {
        revert(errorMessage);
      }
    }
  }
}
