import { SupportedChains } from "@midas-capital/types";
import { MessageBuilder, Webhook } from "discord-webhook-node";

import { logger } from "..";
import { baseConfig } from "../config/variables";
import { ErrorKind, LiquidityInvalidity, TAssetConfig, VerificationErrorCache } from "../types";

export class DiscordService {
  chainId: SupportedChains;

  private errorColor = 0xa83232;
  // @ts-ignore
  private warningColor = 0xfcdb03;
  // @ts-ignore
  private infoColor = 0x32a832;

  private hook: Webhook;

  messageCache: {
    [ErrorKind.verification]: VerificationErrorCache;
  };
  alertFunction: {
    [ErrorKind.verification]: (asset: TAssetConfig, error: LiquidityInvalidity) => Promise<void>;
  };

  constructor(chainId: SupportedChains) {
    this.chainId = chainId;
    this.hook = new Webhook(baseConfig.discordWebhookUrl);
    this.messageCache = {
      [ErrorKind.verification]: [],
    };
    this.alertFunction = {
      [ErrorKind.verification]: this.invalidFeedError.bind(this),
    };
  }

  async sendErrorNotification(error: LiquidityInvalidity, asset: TAssetConfig) {
    const lastMessageSentIndex = this.messageCache[ErrorKind.verification].findIndex(
      (a) => a.error.message === error.message && a.asset.identifier === asset.identifier
    );
    if (lastMessageSentIndex !== -1) {
      const lastMessageSent = this.messageCache[ErrorKind.verification][lastMessageSentIndex];
      const { timestamp } = lastMessageSent;

      const now = Date.now();
      if (now - timestamp > 1000 * 60 * 60) {
        await this.alertFunction[ErrorKind.verification](asset, error);
        this.messageCache[ErrorKind.verification][lastMessageSentIndex].timestamp = now;
      }
    } else {
      await this.alertFunction[ErrorKind.verification](asset, error);
      this.messageCache[ErrorKind.verification].push({ asset, error, timestamp: Date.now() });
    }
  }

  private create(asset: TAssetConfig) {
    return new MessageBuilder()
      .addField("Identifier", `${asset.identifier}`, true)
      .addField("Chain", `Chain ID: ${SupportedChains[this.chainId]}`, true);
  }

  private async send(embed: MessageBuilder) {
    if (baseConfig.environment === "production") {
      await this.hook.send(embed);
    } else {
      logger.debug(`Would have sent alert to discord: ${JSON.stringify(embed)}`);
    }
  }

  public async invalidFeedError(asset: TAssetConfig, error: LiquidityInvalidity) {
    const embed = this.create(asset)
      .setTitle(`${error.invalidReason}`)
      .setDescription(`@everyone ${error.message}`)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }
}
