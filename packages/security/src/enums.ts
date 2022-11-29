import { arbitrum, bsc, chapel, evmos, fantom, ganache, moonbeam, neondevnet, polygon } from "@midas-capital/chains";
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
  [fantom.chainId]: fantom,
  [evmos.chainId]: evmos,
};

/* Strategy Risk Enums */

export const STRATEGY_HELP = {
  complexity: {
    LOW: {
      title: "Low complexity strategy",
      explanation:
        "Low complexity strategies have few, if any, moving parts and their code is easy to read and debug. There is a direct correlation between code complexity and implicit risk. A simple strategy effectively mitigates implementation risks.",
    },
    MEDIUM: {
      title: "Beefy strategy is of medium complexity",
      explanation:
        "Medium complexity strategies interact with two or more audited and well-known smart contracts. Its code is still easy to read, test and debug. It mitigates most implementation risks by keeping things simple, however the interactions between 2 or more systems add a layer of complexity.",
    },
    HIGH: {
      title: "Beefy strategy is complex",
      explanation:
        "High complexity strategies interact with one or more well-known smart contracts. These advanced strategies present branching paths of execution. In some cases multiple smart contracts are required to implement the full strategy.",
    },
  },
  timeInMarket: {
    BATTLE_TESTED: {
      title: "Beefy strategy is battle tested",
      explanation:
        "The more time a particular strategy is running, the more likely that any potential bugs it had have been found, and fixed. This strategy has been exposed to attacks and usage for some time already, with little to no changes. This makes it sturdier.",
    },
    NEW: {
      title: "Strategy has been running for less than a month",
      explanation:
        "The more time a particular strategy is running, the more likely that any potential bugs it has have been found, and fixed. This strategy is a modification or iteration of a previous strategy. It hasn't been battle tested as much as others.",
    },
    EXPERIMENTAL: {
      title: "The strategy has some features which are new",
      explanation:
        "The more time a particular strategy is running, the more likely that any potential bugs it had have been found, and fixed. This strategy is brand new and has at least one experimental feature. Use it carefully at your own discretion.",
    },
  },
  riskIL: {
    NONE: {
      title: "Very low or zero projected IL",
      explanation:
        "The asset in this vault has very little or even no expected impermanent loss. This might be because you are staking a single asset, or because the assets in the LP are tightly correlated like USDC-USDT or WBTC-renBTC.",
    },
    LOW: {
      title: "Low projected IL",
      explanation:
        "When you are providing liquidity into a token pair, for example ETH-BNB, there is a risk that those assets decouple in price. BNB could drop considerably in relation to ETH. You would lose some funds as a result, compared to just holding ETH and BNB on their own. The assets in this vault have some risks of impermanent loss.",
    },
    HIGH: {
      title: "High projected IL",
      explanation:
        "When you are providing liquidity into a token pair, for example ETH-BNB, there is a risk that those assets decouple in price. BNB could drop considerably in relation to ETH. You would lose some funds as a result, compared to just holding ETH and BNB on their own. The assets in this vault have a high or very high risk of impermanent loss.",
    },
  },
  liquidity: {
    HIGH: {
      title: "High trade liquidity",
      explanation:
        "How liquid an asset is affects how risky it is to hold it. Liquid assets are traded in many places and with good volume. The asset held by this vault has high liquidity. This means that you can exchange your earnings easily in plenty of places.",
    },
    LOW: {
      title: "Low trade liquidity",
      explanation:
        "How liquid an asset is affects how risky it is to hold it. Liquid assets are traded in many places and with good volume. The asset held by this vault has low liquidity. This means that it isn't as easy to swap and you might incur high slippage when doing so.",
    },
  },
  mktCap: {
    LARGE: {
      title: "High market cap, low volatility asset",
      explanation:
        "The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a large market cap. This means it's potentially a highly safe asset to hold. The asset has a high potential to stick around and grow over time.",
    },
    MEDIUM: {
      title: "Medium market cap, medium volatility asset",
      explanation:
        "The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a medium market cap. This means it's potentially a safe asset to hold. The asset has potential to stick around and grow over time.",
    },
    SMALL: {
      title: "Small market cap, high volatility asset",
      explanation:
        "The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a small market cap. This means it's potentially a risky asset to hold. The asset has low potential to stick around and grow over time.",
    },
    MICRO: {
      title: "Micro market cap, Extreme volatility asset",
      explanation:
        "The market capitalization of the crypto asset directly affects how risky it is to hold it. Usually a small market cap implies high volatility and low liquidity. The asset held by this vault has a micro market cap. This means it's potentially a highly risky asset to hold. The asset has low potential to stick around.",
    },
  },
  supplyCentralised: {
    CENTRALIZED: {
      title: "Few very powerful whales",
      explanation:
        "When the supply is concentrated in a few hands, they can greatly affect the price by selling. Whales can manipulate the price of the coin. The more people that have a vested interest over a coin, the better and more organic the price action is.",
    },
    DECENTRALIZED: {
      title: "Supply split across many holders",
      explanation:
        "The supply is concentrated is spread across many users instead of being concentrated in the hands of a few whales, which makes it so that price manipulations are less likely to occur. The more people that have a vested interest over a coin, the better and more organic the price action is.",
    },
  },
  reputation: {
    ESTABLISHED: {
      title: "The platform has a known track record",
      explanation:
        "When taking part in a farm, it can be helpful to know the amount of time that the platform has been around and the degree of its reputation. The longer the track record, the more investment the team and community have behind a project. This vault farms a project that has been around for many months.",
    },
    NEW: {
      title: "Platform is new with little track record",
      explanation:
        "When taking part in a farm, it can be helpful to know the amount of time that the platform has been around and the degree of its reputation. The longer the track record, the more investment the team and community have behind a project. This vault farms a new project, with less than a few months out in the open.",
    },
  },
  audit: {
    AUDIT: {
      title: "The platform has an audit from at least one trusted auditor",
      explanation: "Audits are reviews of code by a group of third party developers.",
    },
    NO_AUDIT: {
      title: "The platform has never been audited by third-party trusted auditors",
      explanation: "Audits are reviews of code by a group of third party developers.",
    },
  },
  contractsVerified: {
    CONTRACTS_VERIFIED: {
      title: "All relevant contracts are publicly verified",
      explanation:
        "Code running in a particular contract is not public by default. Block explorers let developers verify the code behind a particular contract. This is a good practice because it lets other developers audit that the code does what it’s supposed to. All the third party contracts that this vault uses are verified. This makes it less risky.",
    },
    CONTRACTS_UNVERIFIED: {
      title: "Some contracts are not verified",
      explanation:
        "Code running in a particular contract is not public by default. Block explorers let developers verify the code behind a particular contract. This is a good practice because it lets other developers audit that the code does what it’s supposed to. Some of the third party contracts that this vault uses are not verified. This means that there are certain things that the Beefy devs have not been able to inspect.",
    },
  },
  adminWithTimelock: {
    ADMIN_WITH_TIMELOCK: {
      title: "Dangerous functions are behind a timelock",
      explanation:
        "Sometimes the contract owner or admin can execute certain functions that could put user funds in jeopardy. The best thing is to avoid these altogether. If they must be present, it’s important to keep them behind a timelock to give proper warning before using them. This contract has certain dangerous admin functions, but they are at least behind a meaningful Timelock.",
    },
    ADMIN_WITHOUT_TIMELOCK: {
      title: "Dangerous functions are without a timelock",
      explanation:
        "Sometimes the contract owner or admin can execute certain functions that could put user funds in jeopardy. The best thing is to avoid these altogether. If they must be present, it’s important to keep them behind a timelock to give proper warning before using them. This contract has certain dangerous admin functions, and there is no time lock present. They can be executed at a moment's notice.",
    },
  },
};
