# monorepo

## Installation

### Dependencies
- Node [`16.x`](https://nodejs.org/en/download/)
- Yarn (preinstalled with Node 16)
- [Foundry](https://book.getfoundry.sh/getting-started/installation.html)

From fresh clone:
- `yarn`
- `yarn workspace @midas-capital/sdk forge install`
- `yarn workspace @midas-capital/sdk build`

## Tips
Run _everything_ from the top level. 

If you want to add packages to modules, you can do so like:
- `yarn workspace @midas-capital/sdk add ethers`

To run `forge` commands inside the `sdk` package, run:
- `yarn workspace @midas-capital/sdk forge install <SOME_DEP>`
- `yarn workspace @midas-capital/sdk forge build`
- etc