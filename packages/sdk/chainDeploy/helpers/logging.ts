import { promises as fs } from "fs";

export const logTransaction = (description: string, data: string) => {
  console.log(`Transaction: ${description}`);
  console.log(`Data: ${data}`);
};

const transactions: any[] = [];

export const addTransaction = (tx: any) => {
  transactions.push(tx);
};

export const writeTransactionsToFile = async () => {
  const batch = {
    version: "1.0",
    chainId: "34443",
    createdAt: Math.floor(Date.now() / 1000),
    meta: {
      name: "Transactions Batch",
      description: "",
      txBuilderVersion: "1.16.5",
      createdFromSafeAddress: "0x8Fba84867Ba458E7c6E2c024D2DE3d0b5C3ea1C2",
      createdFromOwnerAddress: "",
      checksum: "0x"
    },
    transactions
  };

  const filePath = "./transactions.json";
  await fs.writeFile(filePath, JSON.stringify(batch, null, 2));
  console.log(`Transactions written to ${filePath}`);
};
