[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
# Fuse by Rari Capital: Uniswap V2 TWAP Bot

This repository contains the JavaScript source code for the Fuse Uniswap V2 TWAP Bot. See [here for the Fuse dApp](https://github.com/Rari-Capital/fuse-dapp), [here for the Fuse SDK](https://github.com/Rari-Capital/fuse-sdk), or [here for the Fuse contracts](https://github.com/Rari-Capital/fuse-contracts).

## How it works

This bot updates on-chain price data for Fuse pools via [TWAPs of Uniswap V2 (and SushiSwap) pairs](https://uniswap.org/docs/v2/core-concepts/oracles/) 
based in ETH. If you are using prices for which others are not reliably posting TWAPs, you will need to run a bot and a 
redundancy bot; if others are reliably posting TWAPs, simply run your own redundancy bot for additional security. Note 
that the more often you update the oracle and the more assets you do so for, the ETH you will spend on gas fees. 
However, also note that infrequent updates to an asset's price could leave room for attackers to profit via arbitrage 
at the expense of your users.

## Deploying the bot

### Heroku

You can run this bot on Heroku on their free tier using the Deploy to Heroku button. Upon clicking it,
you'll be prompted to enter the bot name and the region where it'll be running. You'll also be required to pass
a few variables required by the bot. Namely:

1. `ETHEREUM_ADMIN_ACCOUNT`: Ethereum account that will post the prices to the oracle
2. `ETHEREUM_ADMIN_PRIVATE_KEY`: Private key of the account that will post the prices to the oracle
3. `SUPPORTED_PAIRS`: The pairs your bot should support. The format of this variable should be:
```text
'0x97c4adc5d28a86f9470c70dd91dc6cc2f20d2d4d|0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48,0x088ee5007c98a9677165d78dd2109ae4a3d04d0c|0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' 
```
These are for instance, the FRAX/USDC Uniswap address pairs, and the YFI/ETH SushiSwap pairs. 
4. `WEB3_HTTP_PROVIDER_URL`: Your node provider URL. Infura or otherwise
5. `ROOT_PRICE_ORACLE_CONTRACT_ADDRESS`: the root oracle address, defaults to Rari's [deployed mainnet oracle address](https://etherscan.io/address/0xf1860b3714f0163838cf9ee3adc287507824ebdb)

**NOTE**: make sure the Ethereum account has sufficient funds to make its transactions!

Then, click on "Deploy App".

All going smoothly, your app should be deployed. If you're using Heroku's free tier, you'll have to assign a Dyno to
the app. On your [heroku dashboard](https://dashboard.heroku.com/apps/), click on your app -> Resources -> Edit Button![Edit button](./assets/scale.png)
and flip the switch on. Your bot should be now running!

Alternatively, if you have the heroku cli installed, run:

```shell
>>> heroku login -i 
...
>>> heroku ps:scale worker=1 -a <app name>
```

The logs of the bot can be accessed via the UI: Heroku Dashboard -> App -> More Button -> View Logs or with the CLI command:

```shell
>>> heroku logs <app name>
```

### DIY

Nothing prevents you from running the bot on your own infra (AWS, local server or otherwise). You probably know what you're 
doing in this case, but we've also added some tooling to make development easier:

1. Fill in the `development.env` or `production.env` env files with the parameters described in the above section
2. Build the Docker image:
```shell
>>> ENV=development make build  # or ENV=production make build, to use the production.env file
```

3. Run the docker image
```shell
>>> ENV=development make run  # or ENV=production make run, to run the production bot
```
### With plain js (no Docker)



1. Install `fuse-twap-bot` dependencies
```shell
>>> npm i -g pm2
>>> npm i
```
2. Export env variables described above

```shell
>>> export ETHEREUM_ADMIN_ACCOUNT="..."
...
```

3. Run the bot in the background 

```shell
>>> pm2 start ecosystem.config.js  # development
>>> pm2 start ecosystem.config.js --env production  # production
```

4. Stop, check status and logs

```shell
>>> pm2 list  # check process status 
>>> pm2 stop ecosystem.config.js  # stop the bot
>>> cat ~/.pm2/logs  # check the logs
```

## License

See `LICENSE`.

## Credits

Fuse's dApp is developed by [David Lucid](https://github.com/davidlucid) of Rari Capital. 
Find out more about Rari Capital at [rari.capital](https://rari.capital).
