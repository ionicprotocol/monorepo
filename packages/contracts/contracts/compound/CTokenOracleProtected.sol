// SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.22;

import { CErc20Storage } from "./CTokenInterfaces.sol";
import { IHypernativeOracle } from "../external/hypernative/interfaces/IHypernativeOracle.sol";

contract CTokenOracleProtected is CErc20Storage {
  error InteractionNotAllowed();

  modifier onlyOracleApproved() {
    address oracleAddress = ap.getAddress("HYPERNATIVE_ORACLE");
    if (oracleAddress == address(0)) {
      _;
      return;
    }
    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    if (oracle.isBlacklistedContext(msg.sender, tx.origin) || !oracle.isTimeExceeded(msg.sender)) {
      revert InteractionNotAllowed();
    }
    _;
  }

  modifier onlyOracleApprovedAllowEOA() {
    address oracleAddress = ap.getAddress("HYPERNATIVE_ORACLE");
    if (oracleAddress == address(0)) {
      _;
      return;
    }

    IHypernativeOracle oracle = IHypernativeOracle(oracleAddress);
    if (oracle.isBlacklistedAccount(msg.sender) || msg.sender != tx.origin) {
      revert InteractionNotAllowed();
    }
    _;
  }
}
