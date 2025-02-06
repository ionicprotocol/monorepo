[![Netlify Status](https://api.netlify.com/api/v1/badges/4e389938-790e-4adb-bfc9-0e3d47dafd64/deploy-status)](https://app.netlify.com/sites/ionicprotocol-dapp/deploys)

# monorepo

## Installation

### Clone

Make sure you clone submodules together

`git clone --recurse-submodules`

If you already pulled using just `git clone`, you can use below command to update submodules.

`git submodule update --init --recursive`

### Dependencies

- Node [`22.x`](https://nodejs.org/en/download/)
- Yarn (preinstalled with Node 22)
- [Foundry](https://book.getfoundry.sh/getting-started/installation.html)

From fresh clone:

- `yarn`
- `yarn workspace @ionicprotocol/contracts hardhat compile`
- `yarn workspace @ionicprotocol/sdk build`

## Running the UI

After installing the dependencies, run:

- `yarn dev:ui`

Now load the UI at `http://localhost:3000`.

## Tips

Run _everything_ from the top level.

Ask for **.env** file from the team and add it under packages/sdk

If you want to add packages to modules, you can do so like:

- `yarn workspace @ionicprotocol/sdk add viem`

To run `forge` commands inside the `contracts` package, run:

- `yarn workspace @ionicprotocol/contracts forge install <SOME_DEP>`
- `yarn workspace @ionicprotocol/contracts forge build`
- etc

## Adding a Package

- Copy source into `packages/my-new-package`.
- Add reference to root `tsconfig.json`:

```json
{
  ...
  "references": [
    ...
    {
      "path": "./packages/my-new-package"
    }
  ]
}
```

- Add workspace-level dependencies to `package.json` inside the package:

```json
{
  ...
  "dependencies": {
    ...
    "@ionicprotocol/some-other-package": "workspace:*"
  }
}
- `yarn` from top-level to update dependencies/symlinks.
```