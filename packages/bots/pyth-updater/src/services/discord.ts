import { SupportedChains } from '@ionicprotocol/types';
import { MessageBuilder, Webhook } from 'discord-webhook-node';
import { TransactionReceipt } from 'viem';

import config from '../config/service';
import { logger } from '../logger';
import { AssetConfigWithPrice } from '../utils';

export class DiscordService {
  chainId: SupportedChains;

  private errorColor = 0xa83232;
  private infoColor = 0x32a832;

  private hook = new Webhook(config.discordWebhookUrl);

  constructor(chainId: SupportedChains) {
    this.chainId = chainId;
  }

  private create() {
    return new MessageBuilder().addField(
      'Chain',
      `Chain ID: ${SupportedChains[this.chainId]}`,
      true,
    );
  }

  private async send(embed: MessageBuilder) {
    if (config.environment === 'production') {
      await this.hook.send(embed);
    } else {
      logger.debug(`Would have sent alert to discord: ${JSON.stringify(embed)}`);
    }
  }

  public async sendPriceUpdateFailure(assetConfigsToUpdate: AssetConfigWithPrice[], msg: string) {
    const embed = this.create()
      .setTitle(`${assetConfigsToUpdate.length} updates(s) failed`)
      .addField('IDs', assetConfigsToUpdate.map((a) => a.priceId).join(', '), true)
      .addField(
        'Last Prices',
        assetConfigsToUpdate
          .map((a) => (a.lastPrice ? a.lastPrice!.price.toString() : ''))
          .join(', '),
        true,
      )
      .addField(
        'Current Prices',
        assetConfigsToUpdate
          .map((a) => (a.currentPrice ? a.currentPrice!.price.toString() : ''))
          .join(', '),
        true,
      )
      // Max limit of embed size
      .setDescription(`${msg.slice(0, 2000)}... (truncated, check AWS Logs) @everyone`)
      .setTimestamp()
      .setColor(this.errorColor);
    await this.send(embed);
  }

  public async sendPriceUpdateSuccess(
    assetConfigsToUpdate: AssetConfigWithPrice[],
    tx: TransactionReceipt,
  ) {
    const embed = this.create()
      .setTitle(`price update succeeded for ${assetConfigsToUpdate.length} priceIds`)
      .setDescription(`Tx Hash: ${tx.transactionHash}`)
      .setTimestamp()
      .setColor(this.infoColor);
    await this.send(embed);
  }
}
