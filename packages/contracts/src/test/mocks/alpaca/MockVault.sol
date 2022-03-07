// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";

contract MockVault is ERC20 {
  address public token;

  uint256 public vaultDebtShare;
  uint256 public vaultDebtVal;
  uint256 public lastAccrueTime;
  uint256 public reservePool;

  constructor(
    address _token,
    string memory _name,
    string memory _symbol,
    uint8 _decimals
  ) ERC20(_name, _symbol, _decimals) {
    token = _token;
  }

  /// @dev Return the total token entitled to the token holders. Be careful of unaccrued interests.
  function totalToken() public view returns (uint256) {
    return (ERC20(token).balanceOf(address(this)) + vaultDebtVal) - reservePool;
  }

  function deposit(uint256 amountToken) external payable transferTokenToVault(amountToken) accrue(amountToken) {
    _deposit(amountToken);
  }

  function _deposit(uint256 amountToken) internal {
    uint256 total = totalToken() - amountToken;
    uint256 share = total == 0 ? amountToken : (amountToken * totalSupply) / total;
    _mint(msg.sender, share);
    require(totalSupply > 1e17, "no tiny shares");
  }

  /// @dev Withdraw token from the lending and burning ibToken.
  function withdraw(uint256 share) external accrue(0) {
    uint256 amount = (share * totalToken()) / totalSupply;
    _burn(msg.sender, share);
    _safeUnwrap(msg.sender, amount);
    require(totalSupply > 1e17, "no tiny shares");
  }

  /// @dev Get token from msg.sender
  modifier transferTokenToVault(uint256 value) {
    if (msg.value != 0) {
      // require(token == config.getWrappedNativeAddr(), "baseToken is not wNative");
      // require(value == msg.value, "value != msg.value");
      // IWETH(config.getWrappedNativeAddr()).deposit{value: msg.value}();
    } else {
      ERC20(token).transferFrom(msg.sender, address(this), value);
    }
    _;
  }

  /// @dev Add more debt to the bank debt pool.
  modifier accrue(uint256 value) {
    // if (now > lastAccrueTime) {
    //   uint256 interest = pendingInterest(value);
    //   uint256 toReserve = interest.mul(config.getReservePoolBps()).div(10000);
    //   reservePool = reservePool.add(toReserve);
    //   vaultDebtVal = vaultDebtVal.add(interest);
    //   lastAccrueTime = now;
    // }
    _;
  }

  /// @dev Transfer to "to". Automatically unwrap if BTOKEN is WBNB
  /// @param to The address of the receiver
  /// @param amount The amount to be withdrawn
  function _safeUnwrap(address to, uint256 amount) internal {
    // if (token == config.getWrappedNativeAddr()) {
    //   SafeToken.safeTransfer(token, config.getWNativeRelayer(), amount);
    //   IWNativeRelayer(uint160(config.getWNativeRelayer())).withdraw(amount);
    //   SafeToken.safeTransferETH(to, amount);
    // } else {
    ERC20(token).transfer(to, amount);
  }
}
