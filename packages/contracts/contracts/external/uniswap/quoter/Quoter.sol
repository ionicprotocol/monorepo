// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;
pragma experimental ABIEncoderV2;

import "../IUniswapV3Factory.sol";
import "./interfaces/IQuoter.sol";
import "./UniswapV3Quoter.sol";

contract Quoter is IQuoter, UniswapV3Quoter {
  IUniswapV3Factory internal uniV3Factory; // TODO should it be immutable?

  constructor(address _uniV3Factory) {
    uniV3Factory = IUniswapV3Factory(_uniV3Factory);
  }

  // This should be equal to quoteExactInputSingle(_fromToken, _toToken, _poolFee, _amount, 0)
  // todo: add price limit
  function estimateMaxSwapUniswapV3(
    address _fromToken,
    address _toToken,
    uint256 _amount,
    uint24 _poolFee
  ) public view override returns (uint256) {
    address pool = uniV3Factory.getPool(_fromToken, _toToken, _poolFee);

    return _estimateOutputSingle(_toToken, _fromToken, _amount, pool);
  }

  // This should be equal to quoteExactOutputSingle(_fromToken, _toToken, _poolFee, _amount, 0)
  // todo: add price limit
  function estimateMinSwapUniswapV3(
    address _fromToken,
    address _toToken,
    uint256 _amount,
    uint24 _poolFee
  ) public view override returns (uint256) {
    address pool = uniV3Factory.getPool(_fromToken, _toToken, _poolFee);

    return _estimateInputSingle(_fromToken, _toToken, _amount, pool);
  }

  // todo: add price limit
  function _estimateOutputSingle(
    address _fromToken,
    address _toToken,
    uint256 _amount,
    address _pool
  ) internal view returns (uint256 amountOut) {
    bool zeroForOne = _fromToken > _toToken;
    // todo: price limit?
    (int256 amount0, int256 amount1) = quoteSwap(
      _pool,
      int256(_amount),
      zeroForOne ? (TickMath.MIN_SQRT_RATIO + 1) : (TickMath.MAX_SQRT_RATIO - 1),
      zeroForOne
    );
    if (zeroForOne) amountOut = amount1 > 0 ? uint256(amount1) : uint256(-amount1);
    else amountOut = amount0 > 0 ? uint256(amount0) : uint256(-amount0);
  }

  // todo: add price limit
  function _estimateInputSingle(
    address _fromToken,
    address _toToken,
    uint256 _amount,
    address _pool
  ) internal view returns (uint256 amountOut) {
    bool zeroForOne = _fromToken < _toToken;
    // todo: price limit?
    (int256 amount0, int256 amount1) = quoteSwap(
      _pool,
      -int256(_amount),
      zeroForOne ? (TickMath.MIN_SQRT_RATIO + 1) : (TickMath.MAX_SQRT_RATIO - 1),
      zeroForOne
    );
    if (zeroForOne) amountOut = amount0 > 0 ? uint256(amount0) : uint256(-amount0);
    else amountOut = amount1 > 0 ? uint256(amount1) : uint256(-amount1);
  }

  function doesPoolExist(address _token0, address _token1) external view returns (bool) {
    // try 0.05%
    address pool = uniV3Factory.getPool(_token0, _token1, 500);
    if (pool != address(0)) return true;

    // try 0.3%
    pool = uniV3Factory.getPool(_token0, _token1, 3000);
    if (pool != address(0)) return true;

    // try 1%
    pool = uniV3Factory.getPool(_token0, _token1, 10000);
    if (pool != address(0)) return true;
    else return false;
  }
}
