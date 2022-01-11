import { useConnection } from "@solana/wallet-adapter-react";
import tuple from "immutable-tuple";
import { ECOSYSTEM, Ecosystem } from "@audaces/perps";
import { useAsyncData } from "../utils/fetch-loop";

export const useEcosystem = () => {
  const { connection } = useConnection();
  const fn = async () => {
    const ecosystem = await Ecosystem.retrieve(connection, ECOSYSTEM);
    return ecosystem;
  };

  return useAsyncData(fn, tuple("useEcosystem", ECOSYSTEM.toBase58()));
};
