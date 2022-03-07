// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";
import { IStrategy } from "./IStrategy.sol";
import { MockERC20 } from "@rari-capital/solmate/src/test/utils/mocks/MockERC20.sol";

contract MockAutofarmV2 {
  struct UserInfo {
    uint256 shares; // How many LP tokens the user has provided.
    uint256 rewardDebt; // Reward debt. See explanation below.
  }

  struct PoolInfo {
    ERC20 want; // Address of the want token.
    uint256 allocPoint; // How many allocation points assigned to this pool. AUTO to distribute per block.
    uint256 lastRewardBlock; // Last block number that AUTO distribution occurs.
    uint256 accAUTOPerShare; // Accumulated AUTO per share, times 1e12. See below.
    address strat; // Strategy address that will auto compound want tokens
  }

  PoolInfo[] public poolInfo; // Info of each pool.
  mapping(uint256 => mapping(address => UserInfo)) public userInfo; // Info of each user that stakes LP tokens.
  uint256 public totalAllocPoint; // Total allocation points. Must be the sum of all allocation points in all pools.
  uint256 public AUTOMaxSupply = 80000e18;
  uint256 public AUTOPerBlock = 8000000000000000; // AUTO tokens created per block
  uint256 public startBlock = 3888888; //https://bscscan.com/block/countdown/3888888

  address public AUTO;

  constructor(address _AUTO) {
    AUTO = _AUTO;
  }

  function poolLength() external view returns (uint256) {
    return poolInfo.length;
  }

  function add(
    ERC20 _want,
    uint256 _allocPoint,
    address _strat
  ) public {
    totalAllocPoint = _allocPoint;
    poolInfo.push(
      PoolInfo({
        want: _want,
        allocPoint: _allocPoint,
        lastRewardBlock: block.number,
        accAUTOPerShare: 0,
        strat: _strat
      })
    );
  }

  // Return reward multiplier over the given _from to _to block.
  function getMultiplier(uint256 _from, uint256 _to) public view returns (uint256) {
    if (ERC20(AUTO).totalSupply() >= AUTOMaxSupply) {
      return 0;
    }

    return _to - _from;
  }

  // Update reward variables of the given pool to be up-to-date.
  function updatePool(uint256 _pid) public {
    PoolInfo storage pool = poolInfo[_pid];
    if (block.number <= pool.lastRewardBlock) {
      return;
    }
    uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
    if (sharesTotal == 0) {
      pool.lastRewardBlock = block.number;
      return;
    }
    uint256 multiplier = getMultiplier(pool.lastRewardBlock, block.number);
    if (multiplier <= 0) {
      return;
    }
    uint256 AUTOReward = (multiplier * AUTOPerBlock * pool.allocPoint) / totalAllocPoint;

    MockERC20(AUTO).mint(address(this), AUTOReward);

    pool.accAUTOPerShare = pool.accAUTOPerShare + ((AUTOReward * 1e12) / sharesTotal);
    pool.lastRewardBlock = block.number;
  }

  function stakedWantTokens(uint256 _pid, address _user) external view returns (uint256) {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][_user];

    uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
    uint256 wantLockedTotal = IStrategy(poolInfo[_pid].strat).wantLockedTotal();
    if (sharesTotal == 0) {
      return 0;
    }
    return (user.shares * wantLockedTotal) / sharesTotal;
  }

  // Want tokens moved from user -> AUTOFarm (AUTO allocation) -> Strat (compounding)
  function deposit(uint256 _pid, uint256 _wantAmt) public {
    updatePool(_pid);
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];

    if (user.shares > 0) {
      uint256 pending = ((user.shares * pool.accAUTOPerShare) / 1e12) - user.rewardDebt;
      if (pending > 0) {
        ERC20(AUTO).transfer(address(msg.sender), pending);
      }
    }
    if (_wantAmt > 0) {
      ERC20(pool.want).transferFrom(address(msg.sender), address(this), _wantAmt);

      ERC20(pool.want).approve(pool.strat, _wantAmt);
      uint256 sharesAdded = IStrategy(pool.strat).deposit(msg.sender, _wantAmt);
      user.shares = user.shares + sharesAdded;
    }
    user.rewardDebt = (user.shares * pool.accAUTOPerShare) / 1e12;
  }

  function withdraw(uint256 _pid, uint256 _wantAmt) public {
    updatePool(_pid);
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];

    uint256 wantLockedTotal = IStrategy(poolInfo[_pid].strat).wantLockedTotal();
    uint256 sharesTotal = IStrategy(poolInfo[_pid].strat).sharesTotal();

    require(user.shares > 0, "user.shares is 0");
    require(sharesTotal > 0, "sharesTotal is 0");

    // Withdraw pending AUTO
    uint256 pending = ((user.shares * pool.accAUTOPerShare) / 1e12) - user.rewardDebt;
    if (pending > 0) {
      ERC20(AUTO).transfer(address(msg.sender), pending);
    }

    // Withdraw want tokens
    uint256 amount = (user.shares * wantLockedTotal) / sharesTotal;
    if (_wantAmt > amount) {
      _wantAmt = amount;
    }
    if (_wantAmt > 0) {
      uint256 sharesRemoved = IStrategy(poolInfo[_pid].strat).withdraw(msg.sender, _wantAmt);

      if (sharesRemoved > user.shares) {
        user.shares = 0;
      } else {
        user.shares = user.shares - sharesRemoved;
      }

      uint256 wantBal = ERC20(pool.want).balanceOf(address(this));
      if (wantBal < _wantAmt) {
        _wantAmt = wantBal;
      }
      pool.want.transfer(address(msg.sender), _wantAmt);
    }
    user.rewardDebt = (user.shares * pool.accAUTOPerShare) / 1e12;
  }
}
