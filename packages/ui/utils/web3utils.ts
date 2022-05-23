// Converts block Number to Unix Timestamp
import { JsonRpcProvider } from '@ethersproject/providers';

export const blockNumberToTimeStamp = async (
  provider: JsonRpcProvider,
  blockNumber?: number
): Promise<number> => {
  if (!blockNumber) return new Date().getTime();
  const { timestamp } = await provider.getBlock(blockNumber);
  return timestamp as number;
};
