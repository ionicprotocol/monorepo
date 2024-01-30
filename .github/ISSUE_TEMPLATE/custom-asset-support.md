---
name: Custom Asset Support
about: Add support for specific asset in a specific chain
title: Support Asset $XXX
labels: ''
assignees: ''
---

<h3> Custom Asset Information: </h3> <br>

_Use the reference below for Asset Information. If not found in the table, please notify Nik via Discord_ <br>
[Link to Notion Custom Asset Table](https://www.notion.so/4627d911ce3c4589aef9f7592650e7b2?v=4b3abb4ebfd44018bcf47496d512b778) <br>

**Symbol**: _<ins> ETH </ins>_ <br>
**Block Explorer URL**: *https://etherscan.io/address/0x0000000000000000000000000000000000000000* <br>
**Chain**: _<ins> Ethereum </ins>_

_Please mark the tasks below, as appropriate. Then link supporting Github items together in the Comments section either using # or the button in the screenshot below:_ <br>
![Screenshot of Github Link Button](https://user-images.githubusercontent.com/103433798/169572470-b7e31053-afab-4225-9816-6403193b86b3.png) <br>

**<ins>Link To Matching Chain Deployment Ticket</ins>:** #_Insert Link Here_ <br>

- [ ] **ChainLink / DIA / Flux Supported** _*OR*_
- [ ] **Requires Custom Oracle** <br>
      &nbsp;&nbsp;&nbsp;- [Link to Custom Oracle Template](https://github.com/Ionic-Protocol/contracts/issues/new?assignees=&labels=&template=custom-oracle.md&title=Custom+Oracle+for+%24XXX)
- [ ] **Requires Custom Liquidator** <br>
      &nbsp;&nbsp;&nbsp;- [Link to Custom Liquidator Template](https://github.com/Ionic-Protocol/contracts/issues/new?assignees=&labels=&template=custom-liquidation-strategy.md&title=Custom+Liquidation+Strategy+for+%24XXX)
- [ ] **ERC-4626 Support** <br>
      &nbsp;&nbsp;&nbsp;&nbsp;- [Link to ERC-4626 Template](https://github.com/Ionic-Protocol/contracts/issues/new?assignees=&labels=&template=erc-4626-strategy.md&title=ERC-4626+Strategy+for+%24XXX)

<h3> Tasks: </h3>

- [ ] Edit the supported assets: https://github.com/Ionic-Protocol/monorepo/tree/development/packages/sdk/src/chainConfig/assets and add the asset to the respective chain

- [ ] Edit deployment script to set up and deploy oracle and liquidator

_IF it is a uniswap-twap oracle supported asset_

- [ ] For Uniswap-supported assets, redeploy the fuse-twap-bot after adding editing the `supported_pairs` variable in the [ops directory](https://github.com/Ionic-Protocol/monorepo/blob/development/ops/main.tf#L28)

_IF requires custom liquidation strategy_

- [ ] Edit the redemption strategies: https://github.com/Ionic-Protocol/monorepo/blob/development/packages/sdk/src/chainConfig/redemptionStrategies.ts
- [ ] Edit the redemption strategy data encoding: https://github.com/Ionic-Protocol/monorepo/blob/development/packages/sdk/src/modules/liquidation/redemptionStrategy.ts#L23
- [ ] Edit the `chainDeploy/<chain>.ts` deploy script to deploy the liquidation strategy, if not already there

_IF it needs/could use a plugin and/or flywheel_

- [ ] Edit the `chainDeploy/<chain>.ts` deploy script to deploy the plugin & their flywheel(s)

### Deployment

After all the items above are complete, proceed with the deployment of the contracts and changes to the deployment script.

If a plugin and/or Flywheel were deployed with this, then, you also need to:

- [ ] Edit the plugin config: https://github.com/Ionic-Protocol/monorepo/blob/development/packages/sdk/src/chainConfig/plugin.ts so that the information about it is made available to the SDK users/FE
