import { PublicKey } from "@solana/web3.js";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import {
  Token,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { useAsyncData } from "../utils/fetch-loop";
import tuple from "immutable-tuple";

export const useBalances = (mint: PublicKey) => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fn = async () => {
    if (!connected || !publicKey) return;

    const acc = await Token.getAssociatedTokenAddress(
      ASSOCIATED_TOKEN_PROGRAM_ID,
      TOKEN_PROGRAM_ID,
      mint,
      publicKey
    );

    const info = await connection.getParsedAccountInfo(acc);
    if (!info.value) return 0; // account does not exist
    // @ts-ignore
    return info.value.data.parsed.info.tokenAmount.uiAmount;
  };

  return useAsyncData(
    fn,
    tuple("useBalances", mint.toBase58(), publicKey?.toBase58(), connected)
  );
};
