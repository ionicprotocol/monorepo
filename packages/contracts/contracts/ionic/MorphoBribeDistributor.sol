// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.0;

import { IBribeRewards } from "../veION/interfaces/IBribeRewards.sol";
import { IERC20, SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { OwnableUpgradeable } from "@openzeppelin-contracts-upgradeable/contracts/access/OwnableUpgradeable.sol";

/**
 * @title MorphoBribeDistributor
 * @dev This contract handles the distribution of bribe tokens to the Morpho protocol.
 */
contract MorphoBribeDistributor is OwnableUpgradeable {
  using SafeERC20 for IERC20;

  /// @notice Address of the Morpho market
  address public morphoMarket;
  /// @notice Address of the Morpho bribes contract
  address public morphoBribes;

  event Initialized(address indexed morphoMarket, address indexed morphoBribes);
  event Distributed(address indexed from, uint256 amount);
  event MorphoMarketSet(address indexed newMorphoMarket);
  event MorphoBribesSet(address indexed newMorphoBribes);
  event BribeTokenSet(address indexed newBribeToken);

  /**
   * @dev Modifier to restrict access to only the Morpho market
   */
  modifier onlyMorphoMarket() {
    require(msg.sender == morphoMarket, "Caller is not the Morpho Market");
    _;
  }

  /**
   * @notice Initializes the MorphoBribeDistributor contract
   * @param _morphoMarket Address of the Morpho market
   * @param _morphoBribes Address of the Morpho bribes contract
   */
  function initialize(address _morphoMarket, address _morphoBribes) public initializer {
    __Ownable_init();
    morphoMarket = _morphoMarket;
    morphoBribes = _morphoBribes;
    emit Initialized(_morphoMarket, _morphoBribes);
  }

  /**
   * @notice Distributes bribe tokens to the Morpho bribes contract
   * @param _amount Amount of tokens to distribute
   */
  function distribute(address _rewardToken, uint256 _amount) external onlyMorphoMarket {
    IERC20(_rewardToken).safeTransferFrom(msg.sender, address(this), _amount);
    EIP20Interface(rewardToken).approve(morphoBribes, _amount);
    IBribeRewards(morphoBribes).notifyRewardAmount(_rewardToken, _amount);
    emit Distributed(msg.sender, _amount);
  }

  /**
   * @notice Sets the address of the Morpho market
   * @param _morphoMarket New address of the Morpho market
   */
  function setMorphoMarket(address _morphoMarket) external onlyOwner {
    morphoMarket = _morphoMarket;
    emit MorphoMarketSet(_morphoMarket);
  }

  /**
   * @notice Sets the address of the Morpho bribes contract
   * @param _morphoBribes New address of the Morpho bribes contract
   */
  function setMorphoBribes(address _morphoBribes) external onlyOwner {
    morphoBribes = _morphoBribes;
    emit MorphoBribesSet(_morphoBribes);
  }
}
