// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import "../BasePriceOracle.sol";
import { ERC20Upgradeable } from "openzeppelin-contracts-upgradeable/contracts/token/ERC20/ERC20Upgradeable.sol";
import "../../ionic/SafeOwnableUpgradeable.sol";

contract SimplePriceOracle is BasePriceOracle, SafeOwnableUpgradeable {
  mapping(address => uint256) prices;
  event PricePosted(
    address asset,
    uint256 previousPriceMantissa,
    uint256 requestedPriceMantissa,
    uint256 newPriceMantissa
  );

  function initialize() public initializer {
    __SafeOwnable_init(msg.sender);
  }

  function getUnderlyingPrice(ICErc20 cToken) public view override returns (uint256) {
    if (compareStrings(cToken.symbol(), "cETH")) {
      return 1e18;
    } else {
      address underlying = ICErc20(address(cToken)).underlying();
      uint256 oraclePrice = prices[underlying];

      uint256 underlyingDecimals = uint256(ERC20Upgradeable(underlying).decimals());
      return
        underlyingDecimals <= 18
          ? uint256(oraclePrice) * (10**(18 - underlyingDecimals))
          : uint256(oraclePrice) / (10**(underlyingDecimals - 18));
    }
  }

  function setUnderlyingPrice(ICErc20 cToken, uint256 underlyingPriceMantissa) public onlyOwner {
    address asset = ICErc20(address(cToken)).underlying();
    emit PricePosted(asset, prices[asset], underlyingPriceMantissa, underlyingPriceMantissa);
    prices[asset] = underlyingPriceMantissa;
  }

  function setDirectPrice(address asset, uint256 _price) public onlyOwner {
    emit PricePosted(asset, prices[asset], _price, _price);
    prices[asset] = _price;
  }

  function price(address underlying) external view returns (uint256) {
    return prices[address(underlying)];
  }

  // v1 price oracle interface for use as backing of proxy
  function assetPrices(address asset) external view returns (uint256) {
    return prices[asset];
  }

  function compareStrings(string memory a, string memory b) internal pure returns (bool) {
    return (keccak256(abi.encodePacked((a))) == keccak256(abi.encodePacked((b))));
  }
}
