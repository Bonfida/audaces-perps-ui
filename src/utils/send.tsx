import { notify } from "./notifications";
import {
  Connection,
  PublicKey,
  TransactionInstruction,
  Transaction,
} from "@solana/web3.js";
import { SendTransactionOptions } from "@solana/wallet-adapter-base";

export const sendTx = async (
  connection: Connection,
  feePayer: PublicKey,
  instructions: TransactionInstruction[],
  sendTransaction: (
    tx: Transaction,
    connection: Connection,
    options?: SendTransactionOptions
  ) => Promise<string>,
  options?: SendTransactionOptions
) => {
  notify({ message: "Sending transaction..." });
  const tx = new Transaction().add(...instructions);
  tx.recentBlockhash = (await connection.getRecentBlockhash()).blockhash;
  tx.feePayer = feePayer;
  const signature = await sendTransaction(tx, connection, options);
  await connection.confirmTransaction(signature, "confirmed");
  notify({
    message: "Transaction confirmed",
    txid: signature,
    variant: "success",
  });
};
