# Fuse by Midas Capital: Oracle Monitor Bot

This repository contains the TypeScript source code for the Fuse Oracle Monitor BOt.

## How it works

This bot checks that every asset supported by Midas Capital's Fuse pools is up-to-date. Further, it checks if
TWAP-based oracles are running on pools with sufficient liquidity.

Alerts are emitted in case:

- Oracle prices cannot be fetched
- Oracle prices are stale
- Oracle prices deviate more than X% in a span of X minutes

### Build & Deployment

Automated via Terraform -- see `./monorepo/ops/` directory
