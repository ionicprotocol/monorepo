import { Handler } from '@netlify/functions';
import { updateFlyWheelData, updatePluginsData } from '../controllers';

const handler: Handler = async (event, context) => {
  await updatePluginsData();
  await updateFlyWheelData();

  return {
    statusCode: 200,
    body: JSON.stringify({ message: 'done' }),
  };
};

export { handler };
