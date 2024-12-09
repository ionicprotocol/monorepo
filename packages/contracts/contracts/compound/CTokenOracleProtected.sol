// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.22;

import { CErc20Storage } from "./CTokenInterfaces.sol";
import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";

contract CTokenOracleProtected is CErc20Storage {
  error InteractionNotAllowed();
  error CallerIsNotEOA();

  modifier onlyOracleApproved() {
    address oracleAddress = ap.getAddress("HYPERNATIVE_ORACLE");

    if (oracleAddress == address(0)) {
      _;
      return;
    }

    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    oracle.validateForbiddenContextInteraction(tx.origin, msg.sender);
    _;
  }

  modifier onlyOracleApprovedAllowEOA() {
    address oracleAddress = ap.getAddress("HYPERNATIVE_ORACLE");

    if (oracleAddress == address(0)) {
      _;
      return;
    }

    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    oracle.validateBlacklistedAccountInteraction(msg.sender);
    if (tx.origin == msg.sender) {
      _;
      return;
    }

    oracle.validateForbiddenContextInteraction(tx.origin, msg.sender);
    _;
  }

  modifier onlyNotBlacklistedEOA() {
    address oracleAddress = ap.getAddress("HYPERNATIVE_ORACLE");

    if (oracleAddress == address(0)) {
      _;
      return;
    }

    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    if (msg.sender != tx.origin) {
      revert CallerIsNotEOA();
    }
    oracle.validateBlacklistedAccountInteraction(msg.sender);
    _;
  }
}
