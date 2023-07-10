# Ionic Protocol: Oracle Monitoring Solution

This repository contains the codebase for our oracle monitors. The monitors have been designed to ensure
that each price feed is providing at all times an _accurate_ valuation of the asset in question.

You can read more about our Oracle security & philosophy in [our docs](https://docs.midascapital.xyz/security/security-outline/oracle-security)

## Oracle Risk Mitigation

The main risks behind an oracle are manipulation attacks and staleness. At their core, oracles exist to ensure that
users of our platform can:

1. Borrow a "fair" amount against their collaterals, where the fairness is defined by what is widely
   acknowledged as the valuation of the collateral at specific points-in-time
2. Be liquidated on a timely fashion, were their collateral valuation to fall below a certain threshold

These two actions widely depend on the ability of an oracle to provide such "fair" valuation at all times. Further, it must also be the case that
such valuation is checked against a an external data source as an added security mechanism.

## How it works

Specifically, for every asset that is supported in Ionic Protocol we implement a continued monitoring solution that ensures that:

- The latest timestamp of the latest observation is no older than 15 minutes or does not deviate more than the threshold by which an oracle update should be triggered (usually 0.5%)
- The latest observation does not deviate from an alternate data source (possibly not trustless, e.g. Coingecko) by more than X%, where X is determined per asset (stablecoins, for instance, will have a lower threshold than less liquid / smaller cap assets)
- The price change of an asset in the span of X minutes is no larger than Y%, where X and Y are configured per-asset. This is designed to detect price manipulation attacks [WIP]

## Triggered Actions

The bot checks that every asset supported by Ionic Protocol's Fuse pools is up-to-date. Further,

Alerts are emitted in case:

- Oracle prices cannot be fetched
- Oracle prices are stale
- Oracle prices deviate more than X% in a span of Y minutes [WIP]

## Architecture

The bot is a long-running process running in AWS ECS.

The codebase is composed of a set of `verifiers`:

- `FeedVerifier` : ensures that the price feed is not stale
- `PriceVerifier` : ensures that the price returned does not deviate from an alternative price source
- `PriceChangeVerifier` : ensures that prices do not deviate more than X% in a span of Y minutes

Each of these verifiers runs on a set interval, verifying each asset supported by Ionic Protocol:

```
export async function runVerifier(sdk: IonicSdk, service: Services, assetsOverride?: SupportedAsset[]) {
  logger.info(`RUNNING SERVICE: ${service}`);
  const assetsToVerify = assetsOverride ? assetsOverride : assets[service];
  const verifier = new BatchVerifier(sdk, assetsToVerify);
  await verifier.batchVerify(verifiers[service], configs[service]);
}

setInterval(runVerifier, feedVerifierConfig.runInterval, ionicSdk, Services.FeedVerifier);
```

## Build, Deployment & Local Development

**Local Dev**
Export the following environment variables:

```
export DISCORD_WEBHOOK_URL=<> // if you'd like to receive Discord Notifcations
export LOG_LEVEL="debug"
export WEB3_HTTP_PROVIDER_URL="https://polygon-rpc.com/"
export TARGET_CHAIN_ID=137
```

From the `monorepo` top-level folder:

```
>>> yarn
>>> yarn workspace @ionicprotocol/oracles-monitor build
>>> yarn workspace @ionicprotocol/oracles-monitor start

```

**Deployment**
Automated via Terraform -- see `./monorepo/ops/` directory
