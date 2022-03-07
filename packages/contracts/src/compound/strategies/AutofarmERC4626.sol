// SPDX-License-Identifier: AGPL-3.0-only
pragma solidity 0.8.11;

import { ERC20 } from "@rari-capital/solmate/src/tokens/ERC20.sol";
import { ERC4626 } from "../../utils/ERC4626.sol";
import { SafeTransferLib } from "@rari-capital/solmate/src/utils/SafeTransferLib.sol";
import { FixedPointMathLib } from "../../utils/FixedPointMathLib.sol";
import { IFlywheelCore } from "../../flywheel/interfaces/IFlywheelCore.sol";

interface IAutofarmV2 {
  function AUTO() external view returns (address);

  function deposit(uint256 _pid, uint256 _wantAmt) external;

  function withdraw(uint256 _pid, uint256 _wantAmt) external;

  //Returns underlying balance in strategies
  function stakedWantTokens(uint256 _pid, address _user) external view returns (uint256);
}

/**
 * @title Autofarm ERC4626 Contract
 * @notice ERC4626 wrapper for AutofarmV2
 * @author RedVeil
 *
 * Wraps https://github.com/autofarmnetwork/AutofarmV2_CrossChain/blob/master/AutoFarmV2.sol
 *
 */
contract AutofarmERC4626 is ERC4626 {
  using SafeTransferLib for ERC20;
  using FixedPointMathLib for uint256;

  /* ========== STATE VARIABLES ========== */
  uint256 public immutable poolId;
  IAutofarmV2 public immutable autofarm;
  IFlywheelCore public immutable flywheel;

  /* ========== CONSTRUCTOR ========== */

  /**
     @notice Creates a new Vault that accepts a specific underlying token.
     @param _asset The ERC20 compliant token the Vault should accept.
     @param _name The name for the vault token.
     @param _symbol The symbol for the vault token.
     @param _autofarm The autofarm contract.
    */
  constructor(
    ERC20 _asset,
    string memory _name,
    string memory _symbol,
    uint256 _poolId,
    IAutofarmV2 _autofarm,
    IFlywheelCore _flywheel
  ) ERC4626(_asset, _name, _symbol) {
    poolId = _poolId;
    autofarm = _autofarm;
    flywheel = _flywheel;
  }

  /* ========== VIEWS ========== */

  /// @notice Calculates the total amount of underlying tokens the Vault holds.
  /// @return The total amount of underlying tokens the Vault holds.
  function totalAssets() public view override returns (uint256) {
    return autofarm.stakedWantTokens(poolId, address(this));
  }

  /// @notice Calculates the total amount of underlying tokens the user holds.
  /// @return The total amount of underlying tokens the user holds.
  function balanceOfUnderlying(address account) public view returns (uint256) {
    return this.balanceOf(account).mulDivDown(totalAssets(), totalSupply);
  }

  /* ========== MUTATIVE FUNCTIONS ========== */

  function transfer(address to, uint256 amount) public override returns (bool) {
    //Accrue flywheel rewards for sender and receiver
    flywheel.accrue(ERC20(address(this)), msg.sender, to);

    balanceOf[msg.sender] -= amount;

    // Cannot overflow because the sum of all user
    // balances can't exceed the max uint256 value.
    unchecked {
      balanceOf[to] += amount;
    }

    emit Transfer(msg.sender, to, amount);

    return true;
  }

  function transferFrom(
    address from,
    address to,
    uint256 amount
  ) public override returns (bool) {
    //Accrue flywheel rewards for sender and receiver
    flywheel.accrue(ERC20(address(this)), from, to);

    uint256 allowed = allowance[from][msg.sender]; // Saves gas for limited approvals.

    if (allowed != type(uint256).max) allowance[from][msg.sender] = allowed - amount;

    balanceOf[from] -= amount;

    // Cannot overflow because the sum of all user
    // balances can't exceed the max uint256 value.
    unchecked {
      balanceOf[to] += amount;
    }

    emit Transfer(from, to, amount);

    return true;
  }

  /* ========== INTERNAL FUNCTIONS ========== */

  function afterDeposit(uint256 amount, uint256) internal override {
    asset.approve(address(autofarm), amount);
    autofarm.deposit(poolId, amount);
    ERC20 AUTO = ERC20(autofarm.AUTO());
    AUTO.approve(address(flywheel.flywheelRewards()), AUTO.balanceOf(address(this)));
    flywheel.accrue(ERC20(address(this)), msg.sender);
  }

  /// @notice withdraws specified amount of underlying token if possible
  function beforeWithdraw(uint256 amount, uint256) internal override {
    autofarm.withdraw(poolId, amount);
    ERC20 AUTO = ERC20(autofarm.AUTO());
    AUTO.approve(address(flywheel.flywheelRewards()), AUTO.balanceOf(address(this)));
    flywheel.accrue(ERC20(address(this)), msg.sender);
  }
}
