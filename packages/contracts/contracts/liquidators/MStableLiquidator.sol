// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "openzeppelin-contracts-upgradeable/contracts/token/ERC20/IERC20Upgradeable.sol";

import "../external/mstable/IMasset.sol";
import "../external/mstable/ISavingsContractV2.sol";

import "./IRedemptionStrategy.sol";

/**
 * @title MStableLiquidator
 * @notice Redeems mUSD, imUSD, mBTC, and imBTC for underlying tokens for use as a step in a liquidation.
 * @author David Lucid <david@rari.capital> (https://github.com/davidlucid)
 */
contract MStableLiquidator is IRedemptionStrategy {
  /**
   * @dev mStable imUSD ERC20 token contract object.
   */
  IMasset public constant MUSD = IMasset(0xe2f2a5C287993345a840Db3B0845fbC70f5935a5);

  /**
   * @dev mStable mUSD ERC20 token contract object.
   */
  ISavingsContractV2 public constant IMUSD = ISavingsContractV2(0x30647a72Dc82d7Fbb1123EA74716aB8A317Eac19);

  /**
   * @dev mStable mBTC ERC20 token contract object.
   */
  IMasset public constant MBTC = IMasset(0x945Facb997494CC2570096c74b5F66A3507330a1);

  /**
   * @dev mStable imBTC ERC20 token contract object.
   */
  ISavingsContractV2 public constant IMBTC = ISavingsContractV2(0x17d8CBB6Bce8cEE970a4027d1198F6700A7a6c24);

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
    // Get output token
    if (strategyData.length > 0) (outputToken) = abi.decode(strategyData, (IERC20Upgradeable));

    // TODO: Choose asset to redeem dynamically
    if (address(inputToken) == address(MUSD)) {
      // Redeem mUSD for USDC
      if (address(outputToken) == address(0))
        outputToken = IERC20Upgradeable(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48); // Output USDC by default
      outputAmount = MUSD.redeem(address(outputToken), inputAmount, 1, address(this));
    } else if (address(inputToken) == address(IMUSD)) {
      // Redeem imUSD for mUSD
      uint256 mAssetReturned = IMUSD.redeemCredits(inputAmount);
      require(mAssetReturned > 0, "Error calling redeem on mStable savings contract: no mUSD returned.");

      // Redeem mUSD for USDC
      if (address(outputToken) == address(0))
        outputToken = IERC20Upgradeable(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48); // Output USDC by default
      outputAmount = MUSD.redeem(address(outputToken), mAssetReturned, 1, address(this));
    } else if (address(inputToken) == address(MBTC)) {
      // Redeem mUSD for USDC
      if (address(outputToken) == address(0))
        outputToken = IERC20Upgradeable(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599); // Output WBTC by default
      outputAmount = MBTC.redeem(address(outputToken), inputAmount, 1, address(this));
    } else if (address(inputToken) == address(IMBTC)) {
      // Redeem imUSD for mUSD
      uint256 mAssetReturned = IMBTC.redeemCredits(inputAmount);
      require(mAssetReturned > 0, "Error calling redeem on mStable savings contract: no mUSD returned.");

      // Redeem mUSD for USDC
      if (address(outputToken) == address(0))
        outputToken = IERC20Upgradeable(0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599); // Output WBTC by default
      outputAmount = MBTC.redeem(address(outputToken), mAssetReturned, 1, address(this));
    }
  }

  function name() public pure returns (string memory) {
    return "MStableLiquidator";
  }
}
