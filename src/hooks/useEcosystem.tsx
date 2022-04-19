import { useConnection } from "@solana/wallet-adapter-react";
import tuple from "immutable-tuple";
import { Ecosystem } from "@audaces/perps";
import { useAsyncData } from "../utils/fetch-loop";
import { ECOSYSTEM } from "../contexts/market";

export const useEcosystem = () => {
  const { connection } = useConnection();
  const fn = async () => {
    const ecosystem = await Ecosystem.retrieve(connection, ECOSYSTEM);
    console.log(`Oracle address`, ecosystem.markets[0].oracle.toBase58());
    console.log(`Market address`, ecosystem.markets[0].address.toBase58());
    return ecosystem;
  };

  return useAsyncData(fn, tuple("useEcosystem", ECOSYSTEM.toBase58()));
};
