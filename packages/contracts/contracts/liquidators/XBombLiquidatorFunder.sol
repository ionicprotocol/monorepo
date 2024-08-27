// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../external/bomb/IXBomb.sol";
import "./IRedemptionStrategy.sol";
import "./IFundsConversionStrategy.sol";
import { MasterPriceOracle } from "../oracles/MasterPriceOracle.sol";

/**
 * @title XBombLiquidatorFunder
 * @notice Exchanges seized xBOMB collateral for underlying BOMB tokens for use as a step in a liquidation.
 * @author Veliko Minkov <veliko@midascapital.xyz>
 */
contract XBombLiquidatorFunder is IFundsConversionStrategy {
  /**
   * @notice Redeems xBOMB for the underlying BOMB reward tokens.
   * @param inputToken The input wrapped token to be redeemed for an underlying token.
   * @param inputAmount The amount of the input wrapped token to be redeemed for an underlying token.
   * @param strategyData The ABI-encoded data to be used in the redemption strategy logic.
   * @return outputToken The underlying ERC20 token outputted.
   * @return outputAmount The quantity of underlying tokens outputted.
   */
  function redeem(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  function convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) external override returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    return _convert(inputToken, inputAmount, strategyData);
  }

  function _convert(
    IERC20Upgradeable inputToken,
    uint256 inputAmount,
    bytes memory strategyData
  ) internal returns (IERC20Upgradeable outputToken, uint256 outputAmount) {
    (address inputTokenAddress, address xbomb, IERC20Upgradeable bomb, IERC20Upgradeable _outputToken) = abi.decode(
      strategyData,
      (address, address, IERC20Upgradeable, IERC20Upgradeable)
    );
    if (inputTokenAddress == xbomb) {
      // burns the xBOMB and returns the underlying BOMB to the liquidator
      inputToken.approve(address(xbomb), inputAmount);
      IXBomb(xbomb).leave(inputAmount);

      outputToken = _outputToken;
      outputAmount = outputToken.balanceOf(address(this));
    } else if (inputTokenAddress == address(bomb)) {
      // mints xBOMB
      inputToken.approve(address(xbomb), inputAmount);
      IXBomb(xbomb).enter(inputAmount);

      outputToken = _outputToken;
      outputAmount = outputToken.balanceOf(address(this));
    } else {
      revert("unknown input token");
    }
  }

  /**
   * @dev Estimates the needed input amount of the input token for the conversion to return the desired output amount.
   * @param outputAmount the desired output amount
   * @param strategyData the input token
   */
  function estimateInputAmount(uint256 outputAmount, bytes memory strategyData)
    external
    view
    returns (IERC20Upgradeable, uint256)
  {
    (address inputTokenAddress, address xbomb, IERC20Upgradeable bomb, ) = abi.decode(
      strategyData,
      (address, address, IERC20Upgradeable, IERC20Upgradeable)
    );
    if (inputTokenAddress == xbomb) {
      // what amount of staked/xbomb equals the desired output amount of bomb?
      return (IERC20Upgradeable(inputTokenAddress), IXBomb(xbomb).toSTAKED(outputAmount));
    } else if (inputTokenAddress == address(bomb)) {
      // what amount of reward/bomb equals the desired output amount of xbomb?
      return (IERC20Upgradeable(inputTokenAddress), IXBomb(xbomb).toREWARD(outputAmount));
    } else {
      revert("unknown input token");
    }
  }

  function name() public pure returns (string memory) {
    return "XBombLiquidatorFunder";
  }
}

contract XBombSwap {
  IERC20Upgradeable public testingBomb;
  IERC20Upgradeable public testingStable;
  MasterPriceOracle public oracle;

  constructor(
    IERC20Upgradeable _testingBomb,
    IERC20Upgradeable _testingStable,
    MasterPriceOracle _oracle
  ) {
    testingBomb = _testingBomb;
    testingStable = _testingStable;
    oracle = _oracle;
  }

  function leave(uint256 _share) external {
    testingBomb.transferFrom(msg.sender, address(this), _share);
    testingStable.transfer(msg.sender, toREWARD(_share));
  }

  function enter(uint256 _amount) external {
    testingStable.transferFrom(msg.sender, address(this), _amount);
    testingBomb.transfer(msg.sender, toSTAKED(_amount));
  }

  function getExchangeRate() external view returns (uint256) {
    return 1e18;
  }

  function toREWARD(uint256 stakedAmount) public view returns (uint256) {
    uint256 bombPrice = oracle.price(address(testingBomb));
    uint256 stablePrice = oracle.price(address(testingStable));
    return (stakedAmount * bombPrice) / stablePrice;
  }

  function toSTAKED(uint256 rewardAmount) public view returns (uint256) {
    uint256 bombPrice = oracle.price(address(testingBomb));
    uint256 stablePrice = oracle.price(address(testingStable));
    return (rewardAmount * stablePrice) / bombPrice;
  }
}
