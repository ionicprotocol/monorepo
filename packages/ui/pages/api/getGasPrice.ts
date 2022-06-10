// import cors from 'cors';
import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const resp = await axios.get('https://gasprice.poa.network');
    res.status(200).json(resp.data);
  } catch (e) {
    console.error('Error in getting gasPrice from https://gasprice.poa.network');
    res.status(400).json({ err: e });
  }
};

export default handler;
