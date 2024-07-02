import { EncodedLiquidationTx, ErroredPool, LiquidatablePool } from "@ionicprotocol/sdk/src/modules/liquidation/utils";
import { SupportedChains } from "@ionicprotocol/types";
import { MessageBuilder, Webhook } from "discord-webhook-node";
import { TransactionReceipt } from "viem";

import config from "../config";
import { logger } from "../logger";

export class DiscordService {
  lastSentMessages: {
    erroredPools: { pools: Array<ErroredPool>; timestamp: number };
    liquidations: { tx: EncodedLiquidationTx[] | null; timestamp: number };
  };
  chainId: SupportedChains;

  private errorColor = 0xa83232;
  private warningColor = 0xfcdb03;
  private infoColor = 0x32a832;

  private hook = new Webhook(config.discordWebhookUrl);

  constructor(chainId: SupportedChains) {
    this.chainId = chainId;
    this.lastSentMessages = {
      erroredPools: { pools: [], timestamp: 0 },
      liquidations: { tx: null, timestamp: 0 },
    };
  }

  private create() {
    return new MessageBuilder().addField("Chain", `Chain ID: ${SupportedChains[this.chainId]}`, true);
  }

  private async send(embed: MessageBuilder) {
    if (config.environment === "production") {
      await this.hook.send(embed);
    } else {
      logger.debug(`Would have sent alert to discord: ${JSON.stringify(embed)}`);
    }
  }

  public async sendLiquidationFailure(liquidations: LiquidatablePool, msg: string) {
    const { comptroller, liquidations: currentLiquidations } = liquidations;
    const { liquidations: previousLiquidations } = this.lastSentMessages;

    const encodedCurrentLiquidation = JSON.stringify(currentLiquidations);
    const encodedPreviousLiquidation = JSON.stringify(previousLiquidations.tx);

    const lastSentMessages = this.lastSentMessages.liquidations.timestamp;

    if (previousLiquidations.tx === null || encodedPreviousLiquidation !== encodedCurrentLiquidation) {
      if (Date.now() - lastSentMessages > 1000 * 60 * 15 || lastSentMessages === 0) {
        const embed = this.create()
          .setTitle(`${currentLiquidations.length} liquidation(s) failed for comptroller: ${comptroller}`)
          .addField("Method", currentLiquidations[0].method, true)
          .addField("Value", currentLiquidations[0].value.toString(), true)
          .addField("Args", JSON.stringify(currentLiquidations[0].args), false)
          // Max limit of embed size
          .setDescription(`${msg.slice(0, 2000)}... (truncated, check AWS Logs) @everyone`)
          .setTimestamp()
          .setColor(this.errorColor);
        await this.send(embed);
        this.lastSentMessages.liquidations = { tx: liquidations.liquidations, timestamp: Date.now() };
      }
    }
  }
  public async sendLiquidationFetchingFailure(erroredPools: Array<ErroredPool>, msg: string) {
    const erroredComptrollers = erroredPools
      .map((pool) => pool.comptroller)
      .sort()
      .join(",");
    const previouslyErroredComptrollers = this.lastSentMessages.erroredPools.pools
      .map((pool) => pool.comptroller)
      .sort()
      .join(",");
    const lastSentMessages = this.lastSentMessages.erroredPools.timestamp;

    if (previouslyErroredComptrollers === null || previouslyErroredComptrollers !== erroredComptrollers) {
      if (Date.now() - this.lastSentMessages.erroredPools.timestamp > 1000 * 60 * 30 || lastSentMessages === 0) {
        const embed = this.create()
          .setTitle("Liquidation fetching failed for pools")
          .setDescription(msg)
          .setTimestamp()
          .setColor(this.warningColor);
        await this.send(embed);
        this.lastSentMessages.erroredPools = { pools: erroredPools, timestamp: Date.now() };
      } else {
        logger.debug("Not sending errored pools alert, already sent one in the last 30 minutes");
      }
    }
  }
  public async sendLiquidationSuccess(txs: Array<TransactionReceipt>, msg: string) {
    const embed = this.create()
      .setTitle(`${txs.length} liquidation(s) succeded`)
      .setDescription(msg)
      .setTimestamp()
      .setColor(this.infoColor);
    await this.send(embed);
  }
}
