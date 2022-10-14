import { arbitrum, bsc, chapel, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
import { ChainConfig } from "@midas-capital/types";

import { ChainLinkFeedHeartbeat } from "./oracle/scorers/chainlink/types";

export const heartbeatToSeconds: Record<ChainLinkFeedHeartbeat, number> = {
  "27s": 27,
  "30s": 27,
  "1m": 60,
  "5m": 60 * 5,
  "10m": 60 * 10,
  "15m": 60 * 15,
  "20m": 60 * 20,
  "6h": 6 * 60 * 60,
  "24h": 24 * 60 * 60,
};

export const chainIdToConfig: { [chainId: number]: ChainConfig } = {
  [bsc.chainId]: bsc,
  [arbitrum.chainId]: arbitrum,
  [polygon.chainId]: polygon,
  [moonbeam.chainId]: moonbeam,
  [neondevnet.chainId]: neondevnet,
  [chapel.chainId]: chapel,
  [ganache.chainId]: ganache,
};

/* Strategy Risk Enums */

export enum StrategyComplexity {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
}

export enum StrategyTimeInMarket {
  NEW = "NEW",
  EXPERIMENTAL = "EXPERIMENTAL",
  BATTLE_TESTED = "BATTLE_TESTED",
}

export enum AssetRiskIL {
  NONE = "NONE",
  LOW = "LOW",
  HIGH = "HIGH",
}

export enum AssetRiskLiquidity {
  LOW = "LOW",
  HIGH = "HIGH",
}

export enum AssetRiskMktCap {
  LARGE = "LARGE",
  MEDIUM = "MEDIUM",
  SMALL = "SMALL",
  MICRO = "MICRO",
}

export enum AssetRiskSupply {
  CENTRALIZED = "CENTRALIZED",
  DECENTRALIZED = "DECENTRALIZED",
}

export enum PlatformRiskReputation {
  ESTABLISHED = "ESTABLISHED",
  NEW = "NEW",
}

export enum PlatformRiskAudit {
  AUDIT = "AUDIT",
  NO_AUDIT = "NO_AUDIT",
}

export enum PlatformRiskContractsVerified {
  CONTRACTS_VERIFIED = "CONTRACTS_VERIFIED",
  CONTRACTS_UNVERIFIED = "NO_CONTRACTS_UNVERIFIED",
}

export enum PlatformRiskAdminWithTimelock {
  ADMIN_WITH_TIMELOCK = "ADMIN_WITH_TIMELOCK",
  ADMIN_WITHOUT_TIMELOCK = "ADMIN_WITHOUT_TIMELOCK",
}
