# Contracts

Main repository for Ionic Protocol's contracts

## Structure

```text
 ┌── README.md                        <- The top-level README
 ├── .github/workflows                <- CICD pipeline definition
 ├── .vscode                          <- IDE configs
 │
 ├── out                              <- (forge-generated, git ignored)
 │    ├── *.sol/*.json                <- All the built contracts
 │    └──  ...
 │
 ├── lib                              <- git submodules with forge-based dependencies
 │    ├── flywheel-v2                 <- Tribe flywheel contracts
 │    ├── fuse-flywheel               <- Fuse flywheel contracts
 │    ├── oz-contracts-upgradeable    <- OpenZeppelin deps
 │    └──  ...                        <- other deps
 │
 ├── contracts                        <- All of our contracts
 │    ├── test                        <- Forge-based tests
 │    ├── compound                    <- Compound interfaces
 │    ├── external                    <- External contracts we require
 │    ├── oracles                     <- Oracle contracts
 │    ├── utils                       <- Utility contracts
 │    └──  ...                        <- Main Fuse contracts
 │
 ├── foundry.toml                     <- forge configs
 ├── remappings.txt                   <- forge remappings
 └── package.json                     <- npm deps
```

## Dev Workflow

### 1. Install dependencies: npm & [foundry](https://github.com/foundry-rs/foundry/) (forge + cast)

Forge dependencies

```text
>>> curl -L https://foundry.paradigm.xyz | bash
>>> foundryup
# ensure forge and cast are available in your $PATH
# install submodule libraries via forge
>>> forge install
```

NPM dependencies

```text
>>> npm install
```

### 2. Build the contracts

```shell
>>> forge build
```

### 3. Run the tests for a specific chain id

```shell
# export the relevant env variables, or set them in an .env file
>>> export TEST_RUN_CHAINID=1
>>> export  ETHEREUM_MAINNET_RPC_URL=https://rpc.ankr.com/eth
>>> export ETHEREUM_MAINNET_ARCHIVE_RPC_URL=https://rpc.ankr.com/eth
```

Run the entire test suite

```shell
>>> forge test --no-match-contract 'Abstract|BeefyERC4626Test|DotDotERC4626Test|ArrakisERC4626Test|JarvisERC4626Test|CurveERC4626Test|EllipsisERC4626Test|HelioERC4626Test|WombatERC4626Test|AaveV3ERC4626Test'
```

Check the [CI.yaml](https://github.com/Ionic-Protocol/contracts/blob/development/.github/workflows/pull-request-build-and-test.yml) file to see what chains we run the tests against

### 4. Lint

```shell
>>> npm run prettier
```
