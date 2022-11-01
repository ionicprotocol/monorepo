import { SupportedAsset, SupportedChains } from "@midas-capital/types";
import { MessageBuilder, Webhook } from "discord-webhook-node";
import { logger } from "ethers";

import { getConfig } from "../config";
import { OracleFailure, PriceFeedInvalidity } from "../types";

export class DiscordService {
  asset: SupportedAsset;
  chainId: SupportedChains;

  private errorColor = 0xa83232;
  // @ts-ignore
  private warningColor = 0xfcdb03;
  // @ts-ignore
  private infoColor = 0x32a832;

  private hook = new Webhook(getConfig().discordWebhookUrl);

  constructor(asset: SupportedAsset, chainId: SupportedChains) {
    this.asset = asset;
    this.chainId = chainId;
  }

  private create() {
    return new MessageBuilder()
      .addField("Asset", `${this.asset.symbol}:  ${this.asset.underlying}`, true)
      .addField("Chain", `Chain ID: ${SupportedChains[this.chainId]}`, true);
  }

  private async send(embed: MessageBuilder) {
    if (getConfig().environment === "production") {
      this.hook.send(embed);
    } else {
      logger.debug(`Would have sent alert to discord: ${JSON.stringify(embed)}`);
    }
  }

  public async sendInvalidFeedAlert(feedValidity: PriceFeedInvalidity) {
    const embed = this.create()
      .setTitle(feedValidity.invalidReason)
      .setDescription(feedValidity.message)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }

  public async sendMpoFailureAlert(description: string) {
    const embed = this.create()
      .setTitle(OracleFailure.MPO_FAILURE)
      .setDescription(description)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }
  public async sendOracleFailurePriceAlert() {}
}
