import axios from 'axios';
import { environment } from '../config';

export const functionsAlert = async (title: string, description: string) => {
  try {
    console.error(title, description);
    if (environment.functionsAlertWebHookUrl.startsWith('https:')) {
      await axios.post(environment.functionsAlertWebHookUrl, {
        username: 'Functions Notifier',
        embeds: [
          {
            title,
            description,
          },
        ],
      });
    }
  } catch (e) {
    console.error(e);
  }
};
