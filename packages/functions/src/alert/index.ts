import axios from 'axios';
import { config } from '../config';

function hexToDecimal(hex: string) {
  return parseInt(hex.replace('#', ''), 16);
}

export const functonsAlert = async (title: string, description: string) => {
  try {
    await axios.post(
      config.functionsAlertWebHookUrl,
      {
        username: 'Functions Notifier',
        embeds: [
          {
            title: title,
            description: description,
            color: hexToDecimal('#ff0000'),
          },
        ],
      }
    );
  } catch (e) {
    console.log(e);
  }
};
