## Requirements

We are using `npm` and `node 16` make sure to always use these!

## Setting up local environment

Requirements: local hardhat node, up-to-date midas-sdk. For this, follow the steps 2 and 3 in
the [contracts repository](https://github.com/Midas-Protocol/contracts#dev-workflow)

If you want to run locally, you need to make sure to set SDK version as below

```text
.....
sdk:  "file:../contracts"
.....
```

After that, make sure you're using the latest midas-sdk in this repo, by running

```text
>>> npm install
```

## Getting Started

First, run the development server:

```bash
npm run dev
```

## Connecting Metamask

Also make sure to have the hardhat node running, as described in the [contracts repository](https://github.com/Midas-Protocol/contracts#dev-workflow)

To connect with metamask, run the hardhat node with:

```text
>>> npx hardhat node --show-accounts
```

Pick the third account (named "bob"), and use the private key shown to import a new account to MetaMask. You can
then connect your browser to the local hardhat node by adding `localhost:8485`, `chainId 1337` to your
MetaMask networks.

## UI

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Deploy on Vercel

The branches are automatically deployed via vercel like follows:

`development` => https://testnet.midascapital.xyz

`staging` => https://staging.midascapital.xyz/

`main` => https://app.midascapital.xyz/
