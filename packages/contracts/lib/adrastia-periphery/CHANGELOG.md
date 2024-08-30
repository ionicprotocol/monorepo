# Changelog

## v4.0.0
### Dependencies
- Upgrade adrastia-core to v4.0.0.

### Accumulators
- Add AccumulatorConfig: A base contract for managing the configuration of an accumulator.
  - All accumulators now extend this contract.
- Update the role hierarchy:
  - ADMIN
    - CONFIG_ADMIN
    - UPDATER_ADMIN
      - ORACLE_UPDATER
- Add ManagedOffchainPriceAccumulator and ManagedOffchainLiquidityAccumulator.
- Add managed interest rate accumulators for Compound v2, Compound III, Aave v2, and Aave v3.
- Add managed price and liquidity accumulators for Balancer v2.
- Add managed price and liquidity accumulators for Algebra DEX.

### Bounties
- Add PriceManipulationBounty: A contract for setting up and claiming bounties against price manipulation.


### Oracles
- Add ManagedPeriodicPriceAccumulationOracle.
- Add IOracleAggregatorTokenConfig and OracleAggregatorTokenConfig: These config contracts allow config admins to update oracle aggregator configurations.
- Add ManagedCurrentAggregatorOracle.
- Add the ability to pause updates to the aggregators.
- Add ManagedMedianFilteringOracle.
- Add ManagedPriceVolatilityOracle.

### Rates (Prudentia)
- Add RateController and related contracts: A contract that periodically computes and stores rates for tokens.
- Add ManualRateComputer: A contract that computes rates based on manual input by an authorized rate configurator.

### Compatibility
- Add AdrastiaPoweredPriceOracle: A contract that adapts an IPriceOracle implementation to be used with AggregatorV3Interface.

## v3.0.0
- Upgrade adrastia-core to v3.0.0

## v2.0.0
- Upgrade adrastia-core to v2.0.0

## v1.0.0
- Upgrade pythia-core from v1.0.0-rc.11 to v1.0.0

## v1.0.0-rc.8
- Upgrade pythia-core from v1.0.0-rc.10 to v1.0.0-rc.11

## v1.0.0-rc.7
- Upgrade pythia-core from v1.0.0-rc.9 to v1.0.0-rc.10
- Upgrade solc from v0.8.11 to v0.8.13