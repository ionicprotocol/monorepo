import { encodeFunctionData } from "viem"; // Adjust the import path according to your project structure
import { promises as fs } from "fs";

interface PrepareAndLogTransactionParams {
  contractInstance: any; // Replace `any` with the correct contract type if available
  functionName: string;
  args: any[];
  description: string;
  inputs: {
    internalType: string;
    name: string;
    type: string;
  }[];
}

export const logTransaction = (description: string, data: string) => {
  console.log(`Transaction: ${description}`);
  console.log(`Data: ${data}`);
};

const transactions: any[] = [];

export const addTransaction = async (tx: any) => {
  transactions.push(tx);
  await writeSingleTransactionToFile(tx);
};

const writeSingleTransactionToFile = async (tx: any) => {
  const filePath = "./transactions.json";
  try {
    let batch;
    try {
      const fileContent = await fs.readFile(filePath, "utf8");
      batch = JSON.parse(fileContent);
    } catch (error) {
      if ((error as any).code === "ENOENT" || (error as any).message === "Unexpected end of JSON input") {
        batch = {
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
          transactions: []
        };
      } else {
        throw error;
      }
    }

    batch.transactions.push(tx);

    await fs.writeFile(filePath, JSON.stringify(batch, null, 2));
    console.log(`Transaction added and written to ${filePath}`);
  } catch (error) {
    console.error(`Failed to write transaction to ${filePath}`, error);
  }
};

export const prepareAndLogTransaction = async ({
  contractInstance,
  functionName,
  args,
  description,
  inputs
}: PrepareAndLogTransactionParams) => {
  const data = encodeFunctionData({
    abi: contractInstance.abi,
    functionName,
    args
  });

  await addTransaction({
    to: contractInstance.address,
    value: "0",
    data,
    contractMethod: {
      inputs,
      name: functionName,
      payable: false
    },
    contractInputsValues: args.reduce((acc: any, arg: any, index: number) => {
      acc[inputs[index].name] = arg;
      return acc;
    }, {})
  });

  logTransaction(description, data);
};
