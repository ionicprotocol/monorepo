// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.10;

import { ERC721Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC721/ERC721Upgradeable.sol";
import { Ownable2StepUpgradeable } from "openzeppelin-contracts-upgradeable/contracts/access/Ownable2StepUpgradeable.sol";
import { IveION } from "./IveION.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { console } from "forge-std/console.sol";

contract veION is Ownable2StepUpgradeable, ERC721Upgradeable, IveION {
  using SafeERC20 for IERC20;

  mapping(address => bool) public bridges;
  mapping(address => bool) public whitelistedToken;
  mapping(uint256 => mapping(LpTokenType => LockedBalance)) public _locked;
  mapping(uint256 => mapping(LpTokenType => int128)) public slopeChanges;
  mapping(uint256 => mapping(LpTokenType => GlobalPoint)) public _pointHistory;
  mapping(uint256 => mapping(LpTokenType => uint256)) public userPointEpoch;
  mapping(uint256 => mapping(uint256 => mapping(LpTokenType => UserPoint))) public _userPointHistory;
  mapping(uint256 => bool) public voted;
  mapping(uint256 => EscrowType) public escrowType;
  mapping(address => LpTokenType) public lpType;

  uint256 tokenId;
  uint256 public epoch;
  uint256 public supply;
  uint256 public permanentLockBalance;

  uint256 internal constant WEEK = 1 weeks;
  uint256 internal constant MAXTIME = 4 * 365 * 86400;
  int128 internal constant iMAXTIME = 4 * 365 * 86400;
  uint256 internal constant MULTIPLIER = 1 ether;

  modifier onlyBridge() {
    if (!bridges[msg.sender]) {
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
    uint256 supplyBefore = supply;
    supply = supplyBefore + _tokenAmount;

    LockedBalance memory newLocked;
    (newLocked.tokenAddress, newLocked.amount, newLocked.end, newLocked.isPermanent) = (
      _oldLocked.tokenAddress,
      _oldLocked.amount,
      _oldLocked.end,
      _oldLocked.isPermanent
    );
    newLocked.tokenAddress = _tokenAddress;
    newLocked.amount += int128(uint128(_tokenAmount));
    if (_unlockTime != 0) {
      newLocked.end = _unlockTime;
    }
    _locked[_tokenId][_lpType] = newLocked;

    _checkpoint(_tokenId, _oldLocked, newLocked, _lpType);

    address from = _msgSender();
    if (_tokenAmount != 0) {
      IERC20(_tokenAddress).safeTransferFrom(from, address(this), _tokenAmount);
    }

    emit Deposit(from, _tokenId, _depositType, _tokenAmount, newLocked.end, block.timestamp);
    emit Supply(supplyBefore, supply);
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
    vars._epoch = epoch;

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

      vars.oldDslope = slopeChanges[_oldLocked.end][_lpType];
      if (_newLocked.end != 0) {
        if (_newLocked.end == _oldLocked.end) {
          vars.newDslope = vars.oldDslope;
        } else {
          vars.newDslope = slopeChanges[_newLocked.end][_lpType];
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
      lastPoint = _pointHistory[vars._epoch][_lpType];
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
          d_slope = slopeChanges[t_i][_lpType];
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
          _pointHistory[vars._epoch][_lpType] = lastPoint;
        }
      }
    }

    if (tokenId != 0) {
      lastPoint.slope += (vars.uNew.slope - vars.uOld.slope);
      lastPoint.bias += (vars.uNew.bias - vars.uOld.bias);
      if (lastPoint.slope < 0) {
        lastPoint.slope = 0;
      }
      if (lastPoint.bias < 0) {
        lastPoint.bias = 0;
      }
      lastPoint.permanentLockBalance = permanentLockBalance;
    }

    if (vars._epoch != 1 && _pointHistory[vars._epoch - 1][_lpType].ts == block.timestamp) {
      // vars._epoch = epoch + 1, so we do not increment epoch
      _pointHistory[vars._epoch - 1][_lpType] = lastPoint;
    } else {
      // more than one global point may have been written, so we update epoch
      epoch = vars._epoch;
      _pointHistory[vars._epoch][_lpType] = lastPoint;
    }

    if (tokenId != 0) {
      if (_oldLocked.end > block.timestamp) {
        vars.oldDslope += vars.uOld.slope;
        if (_newLocked.end == _oldLocked.end) {
          vars.oldDslope -= vars.uNew.slope;
        }
        slopeChanges[_oldLocked.end][_lpType] = vars.oldDslope;
      }

      if (_newLocked.end > block.timestamp) {
        // update slope if new lock is greater than old lock and is not permanent or if old lock is permanent
        if (_newLocked.end > _oldLocked.end) {
          vars.newDslope -= vars.uNew.slope; // old slope disappeared at this point
          slopeChanges[_newLocked.end][_lpType] = vars.newDslope;
        }
        // else: we recorded it already in oldDslope
      }

      // If timestamp of last user point is the same, overwrite the last user point
      // Else record the new user point into history
      // Exclude epoch 0
      vars.uNew.ts = block.timestamp;
      vars.uNew.blk = block.number;
      uint256 userEpoch = userPointEpoch[_tokenId][_lpType];
      if (userEpoch != 0 && _userPointHistory[_tokenId][userEpoch][_lpType].ts == block.timestamp) {
        _userPointHistory[_tokenId][userEpoch][_lpType] = vars.uNew;
      } else {
        userPointEpoch[_tokenId][_lpType] = ++userEpoch;
        _userPointHistory[_tokenId][userEpoch][_lpType] = vars.uNew;
      }
    }
  }

  function _createLock(
    address[] memory _tokenAddress,
    uint256[] memory _tokenAmount,
    uint256[] memory _duration,
    address _to
  ) internal returns (uint256) {
    uint256 _tokenId = ++tokenId;
    uint256 _length = _tokenAddress.length;
    _mint(_to, _tokenId);

    for (uint i = 0; i < _length; i++) {
      LpTokenType _lpType = lpType[_tokenAddress[i]];

      uint256 unlockTime = ((block.timestamp + _duration[i]) / WEEK) * WEEK;

      if (_tokenAmount[i] == 0) revert ZeroAmount();
      if (unlockTime <= block.timestamp) revert LockDurationNotInFuture();
      if (unlockTime > block.timestamp + MAXTIME) revert LockDurationTooLong();
      if (!whitelistedToken[_tokenAddress[i]]) revert TokenNotWhitelisted();

      _depositFor(
        _tokenAddress[i],
        _tokenId,
        _tokenAmount[i],
        unlockTime,
        _locked[_tokenId][_lpType],
        DepositType.CREATE_LOCK_TYPE,
        _lpType
      );
    }
    return _tokenId;
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

  function whitelistTokens(address[] memory _tokens, bool[] memory _isWhitelisted) external onlyOwner {
    require(_tokens.length == _isWhitelisted.length, "Unequal Arrays");
    for (uint256 i; i < _tokens.length; i++) whitelistedToken[_tokens[i]] = _isWhitelisted[i];
  }

  /**
   * @notice Sets the LP token type for a given token address
   * @param _token Address of the token
   * @param _type LP token type to be set
   */
  function setLpTokenType(address _token, LpTokenType _type) external onlyOwner {
    require(_token != address(0), "Invalid token address");
    lpType[_token] = _type;
  }

  /**
   * @notice Withdraws underlying assets from the veNFT.
   * If unlock time has not passed, uses a formula to unlock early with penalty.
   * @param _tokenId Token ID.
   */
  function withdraw(uint256 _tokenId) external override {
    // address sender = _msgSender();
    // if (!_isApprovedOrOwner(sender, _tokenId)) revert NotApprovedOrOwner();
    // if (voted[_tokenId]) revert AlreadyVoted();
    // if (escrowType[_tokenId] != EscrowType.NORMAL) revert NotNormalNFT();
    // LockedBalance memory oldLocked = _locked[_tokenId];
    // if (oldLocked.isPermanent) revert PermanentLock();
    // if (block.timestamp < oldLocked.end) revert LockNotExpired();
    // uint256 value = uint256(int256(oldLocked.amount));
    // address _tokenAddress = oldLocked.tokenAddress;
    // _burn(_tokenId);
    // _locked[_tokenId] = LockedBalance(address(0), 0, 0, false);
    // uint256 supplyBefore = supply;
    // supply = supplyBefore - value;
    // _checkpoint(_tokenId, oldLocked, LockedBalance(address(0), 0, 0, false));
    // IERC20(_tokenAddress).safeTransfer(sender, value);
    // emit Withdraw(sender, _tokenId, value, block.timestamp);
    // emit Supply(supplyBefore, supplyBefore - value);
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
    return _locked[_tokenId][_lpType];
  }
}
