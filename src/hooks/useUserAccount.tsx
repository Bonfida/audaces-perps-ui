import { UserAccount, AUDACES_ID } from "@audaces/perps";
import { useAsyncData } from "../utils/fetch-loop";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import tuple from "immutable-tuple";

export const useUserAccount = () => {
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();

  const fn = async () => {
    if (!connected || !publicKey) {
      return null;
    }
    const [key] = await UserAccount.findAddress(publicKey, AUDACES_ID);
    return await UserAccount.retrieve(connection, key);
  };

  return useAsyncData(
    fn,
    tuple("useUserAccount", connected, publicKey?.toBase58())
  );
};
