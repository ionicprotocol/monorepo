// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol";

import "../external/synthetix/ISynthetix.sol";
import "../external/synthetix/ISynth.sol";
import "../external/synthetix/Proxy.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title SynthetixSynthLiquidator
 * @notice Exchanges seized Synthetix Synth token collateral for more common Synthetix Synth tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract SynthetixSynthLiquidator is IRedemptionStrategy {
  /**
   * @notice Synthetix SNX token contract.
   */
  ISynthetix public constant SYNTHETIX = ISynthetix(0x97767D7D04Fd0dB0A1a2478DCd4BA85290556B48);

  /**
   * @notice Redeems custom collateral `token` for an underlying token.
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
    // Swap Synth token for other Synth token (and store output as new collateral)
    (outputToken) = abi.decode(strategyData, (IERC20Upgradeable));
    address inputSynthLogic = Proxy(address(inputToken)).target(); // For some reason we have to use the logic contract instead of the proxy contract to get `currencyKey`
    address outputSynthLogic = Proxy(address(outputToken)).target(); // For some reason we have to use the logic contract instead of the proxy contract to get `currencyKey`
    SYNTHETIX.exchange(ISynth(inputSynthLogic).currencyKey(), inputAmount, ISynth(outputSynthLogic).currencyKey());
    outputAmount = outputToken.balanceOf(address(this));
  }
}
