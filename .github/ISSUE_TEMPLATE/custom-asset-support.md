---
name: Custom Asset Support
about: Add support for specific asset in a specific chain
title: Support Asset $XXX
labels: ''
assignees: ''

---

We'd like to support yet another custom asset

**Symbol**: ETH
**Block Explorer URL**:  https://etherscan.io/address/0x0000000000000000000000000000000000000000
**Chain**: Ethereum

- [ ] **ChainLink Supported**
- [ ] **Requires Custom Oracle** 
- [ ] **Requires Custom Liquidator**

### External Tasks
- [ ] **ERC 4626 Support**
  - Link to ERC4626 ticket: N/A
- [ ] **Custom Oracle**
  - Link to Custom Oracle Task: N/A
- [ ] **Custom Liquidator**
  - Link to Custom Liquidator Task: N/A

### Tasks

- [ ] Edit the supported assets:  https://github.com/Midas-Protocol/monorepo/tree/development/packages/sdk/src/chainConfig/assets and add the asset to the respective chain

- [ ] Edit deployment script to set up and deploy oracle and liquidator

*IF it is a uniswap-twap oracle supported asset*
- [ ] For Uniswap-supported assets, redeploy the fuse-twap-bot after adding editing the `supported_pairs` variable in the [ops directory](https://github.com/Midas-Protocol/monorepo/blob/development/ops/main.tf#L28)

*IF requires custom liquidation strategy*
- [ ] Edit the redemption strategies: https://github.com/Midas-Protocol/monorepo/blob/development/packages/sdk/src/chainConfig/redemptionStrategies.ts
- [ ] Edit the redemption strategy data encoding: https://github.com/Midas-Protocol/monorepo/blob/development/packages/sdk/src/modules/liquidation/redemptionStrategy.ts#L23
- [ ] Edit the `chainDeploy/<chain>.ts` deploy script to deploy the liquidation strategy, if not already there

*IF it needs/could use a plugin and/or flywheel*
- [ ] Edit the `chainDeploy/<chain>.ts` deploy script to deploy the plugin & their flywheel(s)

### Deployment

After all the items above are complete, proceed with the deployment of the contracts and changes to the deployment script. 

If a plugin and/or Flywheel were deployed with this, then, you also need to:
- [ ] Edit the plugin config: https://github.com/Midas-Protocol/monorepo/blob/development/packages/sdk/src/chainConfig/plugin.ts so that the information about it is made available to the SDK users/FE
