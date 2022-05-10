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
    "@midas-capital/some-other-package": "workspace:*"
  }
}
- `yarn` from top-level to update dependencies/symlinks.
```
