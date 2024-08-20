// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0;

import { Math } from "@openzeppelin/contracts/utils/math/Math.sol";

import { IRateComputer } from "adrastia-periphery/rates/IRateComputer.sol";

import { BaseTest } from "../config/BaseTest.t.sol";

import { PrudentiaInterestRateModel } from "../../ionic/irms/PrudentiaInterestRateModel.sol";

contract MockRateComputer is IRateComputer {
  mapping(address => uint64) public rates;

  function computeRate(address token) external view override returns (uint64) {
    return rates[token];
  }

  function setRate(address token, uint64 rate) public {
    rates[token] = rate;
  }
}

contract PrudentiaIrmTest is BaseTest {
  using Math for uint64;

  MockRateComputer rateComputer;
  address token;
  PrudentiaInterestRateModel irm;
  uint256 blocksPerYear;

  function setUp() public {
    rateComputer = new MockRateComputer();
    token = address(0x1);
    blocksPerYear = 10512000;
    irm = new PrudentiaInterestRateModel(blocksPerYear, token, rateComputer);
  }

  function test_utilizationRate_zeroTotal() public {
    uint256 cash = 0;
    uint256 borrows = 0;
    uint256 reserves = 0;

    assertEq(irm.utilizationRate(cash, borrows, reserves), 0);
  }

  function test_utilizationRate_zero() public {
    uint256 cash = 100;
    uint256 borrows = 0;
    uint256 reserves = 0;

    assertEq(irm.utilizationRate(cash, borrows, reserves), 0);
  }

  function test_utilizationRate_50() public {
    uint256 cash = 100;
    uint256 borrows = 100;
    uint256 reserves = 0;

    assertEq(irm.utilizationRate(cash, borrows, reserves), 5e17);
  }

  function test_utilizationRate_100() public {
    uint256 cash = 0;
    uint256 borrows = 100;
    uint256 reserves = 0;

    assertEq(irm.utilizationRate(cash, borrows, reserves), 1e18);
  }

  function test_getBorrowRate_100_a() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    // These should have no effect
    uint256 cash = 0;
    uint256 borrows = 100;
    uint256 reserves = 0;

    assertEq(irm.getBorrowRate(cash, borrows, reserves), rate.ceilDiv(blocksPerYear));
  }

  function test_getBorrowRate_100_b() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    // These should have no effect
    uint256 cash = 100;
    uint256 borrows = 100;
    uint256 reserves = 0;

    assertEq(irm.getBorrowRate(cash, borrows, reserves), rate.ceilDiv(blocksPerYear));
  }

  function test_getBorrowRate_50() public {
    uint64 rate = 5e17;
    rateComputer.setRate(token, rate);

    // These should have no effect
    uint256 cash = 0;
    uint256 borrows = 0;
    uint256 reserves = 0;

    assertEq(irm.getBorrowRate(cash, borrows, reserves), rate.ceilDiv(blocksPerYear));
  }

  function test_getBorrowRate_1() public {
    uint64 rate = 1e16;
    rateComputer.setRate(token, rate);

    // These should have no effect
    uint256 cash = 0;
    uint256 borrows = 0;
    uint256 reserves = 0;

    assertEq(irm.getBorrowRate(cash, borrows, reserves), rate.ceilDiv(blocksPerYear));
  }

  function test_getBorrowRate_0() public {
    uint64 rate = 0;
    rateComputer.setRate(token, rate);

    // These should have no effect
    uint256 cash = 0;
    uint256 borrows = 0;
    uint256 reserves = 0;

    assertEq(irm.getBorrowRate(cash, borrows, reserves), rate.ceilDiv(blocksPerYear));
  }

  function test_getBorrowRate_1mantissa() public {
    uint64 rate = 1;
    rateComputer.setRate(token, rate);

    // These should have no effect
    uint256 cash = 0;
    uint256 borrows = 0;
    uint256 reserves = 0;

    assertEq(irm.getBorrowRate(cash, borrows, reserves), 1); // Rounds up to 1. We don't want to return 0.
  }

  function test_getSupplyRate_100_100util() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    uint256 cash = 0;
    uint256 borrows = 100;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), rate.ceilDiv(blocksPerYear));
  }

  function test_getSupplyRate_100_50util() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    uint256 cash = 100;
    uint256 borrows = 100;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), rate.ceilDiv(blocksPerYear) / 2);
  }

  function test_getSupplyRate_100_1util() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    uint256 cash = 99;
    uint256 borrows = 1;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), rate.ceilDiv(blocksPerYear) / 100);
  }

  function test_getSupplyRate_100_0util() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    uint256 cash = 100;
    uint256 borrows = 0;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), 0);
  }

  function test_getSupplyRate_0_0util() public {
    uint64 rate = 0;
    rateComputer.setRate(token, rate);

    uint256 cash = 0;
    uint256 borrows = 0;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), 0);
  }

  function test_getSupplyRate_0_100util() public {
    uint64 rate = 0;
    rateComputer.setRate(token, rate);

    uint256 cash = 0;
    uint256 borrows = 100;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), 0);
  }

  function test_getSupplyRate_0_50util() public {
    uint64 rate = 0;
    rateComputer.setRate(token, rate);

    uint256 cash = 50;
    uint256 borrows = 50;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), 0);
  }

  function test_getSupplyRate_0_1util() public {
    uint64 rate = 0;
    rateComputer.setRate(token, rate);

    uint256 cash = 99;
    uint256 borrows = 1;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 0;

    assertEq(irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa), 0);
  }

  function test_getSupplyRate_100_50util_10rf() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    uint256 cash = 100;
    uint256 borrows = 100;
    uint256 reserves = 0;
    uint256 reserveFactorMantissa = 1e17;

    assertEq(
      irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa),
      (uint256(rate.ceilDiv(blocksPerYear) / 2) * (1e18 - reserveFactorMantissa)) / 1e18
    );
  }

  function test_getSupplyRate_100_50util_10rf_10reserves() public {
    uint64 rate = 1e18;
    rateComputer.setRate(token, rate);

    uint256 cash = 100;
    uint256 borrows = 100;
    uint256 reserves = 10;
    cash += reserves;
    uint256 reserveFactorMantissa = 1e17;

    assertEq(
      irm.getSupplyRate(cash, borrows, reserves, reserveFactorMantissa),
      (uint256(rate.ceilDiv(blocksPerYear) / 2) * (1e18 - reserveFactorMantissa)) / 1e18
    );
  }
}
