// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { IonicComptroller } from "./compound/ComptrollerInterface.sol";
import { ICErc20 } from "./compound/CTokenInterfaces.sol";
import { Ownable2Step } from "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IPoolDirectory {
  struct Pool {
    string name;
    address creator;
    address comptroller;
    uint256 blockPosted;
    uint256 timestampPosted;
  }

  function getActivePools() external view returns (uint256, Pool[] memory);
}

contract GlobalPauser is Ownable2Step {
  IPoolDirectory public poolDirectory;
  mapping(address => bool) public pauseGuardian;

  modifier onlyPauseGuardian() {
    require(pauseGuardian[msg.sender], "!guardian");
    _;
  }

  constructor(address _poolDirectory) Ownable2Step() {
    poolDirectory = IPoolDirectory(_poolDirectory);
  }

  function setPauseGuardian(address _pauseGuardian, bool _isPauseGuardian) external onlyOwner {
    pauseGuardian[_pauseGuardian] = _isPauseGuardian;
  }

  function pauseAll() external onlyPauseGuardian {
    (, IPoolDirectory.Pool[] memory pools) = poolDirectory.getActivePools();
    for (uint256 i = 0; i < pools.length; i++) {
      ICErc20[] memory markets = IonicComptroller(pools[i].comptroller).getAllMarkets();
      for (uint256 j = 0; j < markets.length; j++) {
        bool isPaused = IonicComptroller(pools[i].comptroller).borrowGuardianPaused(address(markets[j]));
        if (!isPaused) {
          IonicComptroller(pools[i].comptroller)._setBorrowPaused(markets[j], true);
        }

        isPaused = IonicComptroller(pools[i].comptroller).mintGuardianPaused(address(markets[j]));
        if (!isPaused) {
          IonicComptroller(pools[i].comptroller)._setMintPaused(markets[j], true);
        }
      }
    }
  }
}
