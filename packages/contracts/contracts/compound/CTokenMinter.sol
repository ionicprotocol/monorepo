// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "./CToken.sol";
import "openzeppelin-contracts-upgradeable/contracts/proxy/utils/Initializable.sol";
import "openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";

contract CTokenMinter is Initializable, OwnableUpgradeable {
  ICErc20 public collateralMarket;
  uint256 public startTime;
  uint256 public endTime;

  modifier onlyDuringMintWindow() {
    require(block.timestamp >= startTime && block.timestamp <= endTime, "Minting not allowed at this time");
    _;
  }

  function initialize(address _cTokenAddress, uint256 _startTime, uint256 _endTime) public initializer {
    require(_startTime < _endTime, "Invalid time window");
    __Ownable_init();
    collateralMarket = ICErc20(_cTokenAddress);
    startTime = _startTime;
    endTime = _endTime;
  }

  function mint(uint256 mintAmount) external onlyDuringMintWindow {
    collateralMarket.mint(mintAmount);
  }

  function setMintWindow(uint256 _newStartTime, uint256 _newEndTime) external onlyOwner {
    require(_newStartTime < _newEndTime, "Invalid time window");
    startTime = _newStartTime;
    endTime = _newEndTime;
  }
}
