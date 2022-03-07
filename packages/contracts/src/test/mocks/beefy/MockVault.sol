// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";
import { IStrategy } from "./IStrategy.sol";

contract MockVault is ERC20 {
  IStrategy public strategy;

  constructor(
    address _strategy,
    string memory _name,
    string memory _symbol
  ) ERC20(_name, _symbol, 18) {
    strategy = IStrategy(_strategy);
  }

  function want() public view returns (ERC20) {
    return strategy.want();
  }

  function balance() public view returns (uint256) {
    return want().balanceOf(address(this)) + IStrategy(strategy).balanceOf();
  }

  function available() public view returns (uint256) {
    return want().balanceOf(address(this));
  }

  /**
   * @dev The entrypoint of funds into the system. People deposit with this function
   * into the vault. The vault is then in charge of sending funds into the strategy.
   */
  function deposit(uint256 _amount) public {
    //Strategy harvests rewards
    //strategy.beforeDeposit();

    uint256 _pool = balance();
    want().transferFrom(msg.sender, address(this), _amount);
    earn();
    uint256 _after = balance();
    _amount = _after - _pool; // Additional check for deflationary tokens
    uint256 shares = 0;
    if (totalSupply == 0) {
      shares = _amount;
    } else {
      shares = (_amount * totalSupply) / _pool;
    }
    _mint(msg.sender, shares);
  }

  /**
   * @dev Function to send funds into the strategy and put them to work. It's primarily called
   * by the vault's deposit() function.
   */
  function earn() public {
    uint256 _bal = available();
    want().transfer(address(strategy), _bal);

    //The Strategy deposits the funds in the actual yield generating contract
    //strategy.deposit();
  }

  /**
   * @dev Function to exit the system. The vault will withdraw the required tokens
   * from the strategy and pay up the token holder. A proportional number of IOU
   * tokens are burned in the process.
   */
  function withdraw(uint256 _shares) public {
    uint256 r = (balance() * _shares) / totalSupply;
    _burn(msg.sender, _shares);

    uint256 b = want().balanceOf(address(this));
    if (b < r) {
      uint256 _withdraw = r - b;
      strategy.withdraw(_withdraw);
      uint256 _after = want().balanceOf(address(this));
      uint256 _diff = _after - b;
      if (_diff < _withdraw) {
        r = b + _diff;
      }
    }

    want().transfer(msg.sender, r);
  }
}
