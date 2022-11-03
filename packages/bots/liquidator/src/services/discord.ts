import { TransactionResponse } from "@ethersproject/providers";
import {
  EncodedLiquidationTx,
  ErroredPool,
  LiquidatablePool,
} from "@midas-capital/sdk/dist/cjs/src/modules/liquidation/utils";
import { SupportedAsset, SupportedChains } from "@midas-capital/types";
import { MessageBuilder, Webhook } from "discord-webhook-node";

import { config, logger } from "..";

export class DiscordService {
  lastSentMessages: {
    erroredPools: { pools: Array<ErroredPool>; timestamp: number };
    liquidations: { tx: EncodedLiquidationTx; timestamp: number };
  };
  asset: SupportedAsset;
  chainId: SupportedChains;

  private errorColor = 0xa83232;
  // @ts-ignore
  private warningColor = 0xfcdb03;
  private infoColor = 0x32a832;

  private hook = new Webhook(config.discordWebhookUrl);

  constructor(chainId: SupportedChains) {
    this.chainId = chainId;
  }

  private create() {
    return new MessageBuilder()
      .addField("Asset", `${this.asset.symbol}:  ${this.asset.underlying}`, true)
      .addField("Chain", `Chain ID: ${SupportedChains[this.chainId]}`, true);
  }

  private async send(embed: MessageBuilder) {
    if (config.environment === "production") {
      this.hook.send(embed);
    } else {
      logger.debug(`Would have sent alert to discord: ${JSON.stringify(embed)}`);
    }
  }

  public async sendLiquidationFailure(liquidations: LiquidatablePool, msg: string) {
    const erroredLiquidation = JSON.stringify(liquidations.liquidations);
    const previouslyErroredLiquidation = JSON.stringify(this.lastSentMessages?.liquidations?.tx ?? "");
    const lastSentMessages = this.lastSentMessages?.liquidations?.timestamp;
    if (
      previouslyErroredLiquidation !== null &&
      erroredLiquidation !== previouslyErroredLiquidation &&
      lastSentMessages !== null
    ) {
      if (this.lastSentMessages.erroredPools?.timestamp - Date.now() > 1000 * 60 * 15) {
        const embed = this.create()
          .setTitle(
            `${liquidations.liquidations.length} liquidation(s) failed for comptroller: ${liquidations.comptroller}`
          )
          .setDescription(msg)
          .setTimestamp()
          .setColor(this.errorColor);
        await this.send(embed);
      }
    }
  }
  public async sendLiquidationFetchingFailure(erroredPools: Array<ErroredPool>, msg: string) {
    const erroredComptrollers = erroredPools
      .map((pool) => pool.comptroller)
      .sort()
      .join(",");
    const previouslyErroredComptrollers = this.lastSentMessages?.erroredPools?.pools
      .map((pool) => pool.comptroller)
      .sort()
      .join(",");
    const lastSentMessages = this.lastSentMessages?.erroredPools?.timestamp;

    if (
      previouslyErroredComptrollers !== null &&
      erroredComptrollers !== previouslyErroredComptrollers &&
      lastSentMessages !== null
    ) {
      if (this.lastSentMessages.erroredPools?.timestamp - Date.now() > 1000 * 60 * 30) {
        const embed = this.create()
          .setTitle("Liquidation fetching failed for pools")
          .setDescription(msg)
          .setTimestamp()
          .setColor(this.errorColor);
        await this.send(embed);
        this.lastSentMessages.erroredPools = { pools: erroredPools, timestamp: Date.now() };
      } else {
        logger.debug("Not sending errored pools alert, already sent one in the last 30 minutes");
      }
    }
  }
  public async sendLiquidationSuccess(txs: Array<TransactionResponse>, msg: string) {
    const embed = this.create()
      .setTitle(`${txs.length} liquidation(s) succeded`)
      .setDescription(msg)
      .setTimestamp()
      .setColor(this.infoColor);
    await this.send(embed);
  }
}
