# Contracts

Main repository for Midas Capital's contracts and SDK for interacting with those.

## Structure

```text
 ┌── README.md                        <- The top-level README
 ├── .github/workflows/TestSuite.yaml <- CICD pipeline definition
 ├── .vscode                          <- IDE configs
 │
 │── artifacts                        <- (Auto-generated, git ignored)
 │       └── contracts
 │                  ├── compound      <- Compiled contracts mirroring /contracts
 │                  ├── external
 │                  └──  ...
 │
 ├── contracts                         <- All of our contracts
 │          ├── compound               <- Compound interfaces
 │          ├── external               <- External contracts we require
 │          ├── oracles                <- Oracle contracts
 │          ├── utils                  <- Utility contracts
 │          └──  ...                   <- Main Fuse contracts
 │
 ├── deploy                           <- hardhat deployment scripts
 ├── deployments                      <- hardhat-generated deployment files
 ├── scripts                          <- hardhat scripts
 ├── src                              <- midas-sdk main folder
 ├── deployments.json                 <- generated on "npx hardhat export"
 └── hardhat.config.ts                <- hardhat confing
```

## Dev Workflow

0. Install dependencies

```text
>>> npm install
```

2. To develop against the SDK, artifacts and deployment files must be generated first, as they are used by the SDK:

```text
>>> npx hardhat node
# in another console
>>>> npm run export
```

3. Build the sdk

```text
>>> npm run build
```

4. Run tests

```shell
>>> npx hardhat test

```

### Gotchas

If you're developing against the contracts, and you're getting errors such as

```shell
 Error: Deployment and registration of new Fuse pool failed: Transaction reverted: function returned an unexpected amount of data
```

It is likely because the address of the `FuseFeeDistributor` has changed. Since it is hardcoded into one of the main
contracts that many others inherit from (all the Comptroller stuff), any calls to the old contract address will fail.

Bottom line: whenever you make changes to the `FuseFeeDistributor`, make sure that this contract address is updated in the two
main files that hardcode it:

- `ComptrollerStorage.sol`
- `CTokenInterfaces.sol`

This requires a few-step approach:

1. Make your desired changes to the contracts
2. Deploy them locally and run export
3. Get the new FFD address and replace it where needed (if it all changed -- if its source code changed, so will its bytecode, and thus its deployed contract address)
4. Re run the node / deployment and export / build

Then, your tests should pass (assuming no other failures)

### Running BSC mainnet fork locally

1. Prepare hardhat config

```shell
>>> ts-node prepare-chain bsc
```

**NOTE**: this command is not idempotent, so running it twice will fail. Do not commit the changes to the hh config

2. Run node

```shell
>>> npx hardhat node
```

You can then generate the deployments for bsc (chain id 56)

```shell
>>> npm run export
```

## Running local node + liquidation bot

1. Edit the `liquidation.env` file, add the account and private key from any of the
   signer's accounts

2. Edit desired parameters, if needed

```shell
>>> docker-compose up
```

This will spin up the bot and a local node, and create an unhealthy pool. The bot
will act on it and liquidate it.

3. Further test liquidations:

In another shell:

```shell
>>> npx hardhat pools:create-unhealthy --name "test unhealthy" --network localhost
```

Check the logs from the bot and ensure it is performing the liquidations appropriately.
You can also run the UI and check the "test unhealthy", as it gets liquidated.

## Running Forge tests

1. Install forge (mac, linux)

```
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

2. Initalize forge in the repo

```
forge init --force
```

3.  Build the contracts

```
forge build
```

4. Test away

```
forge test
```
