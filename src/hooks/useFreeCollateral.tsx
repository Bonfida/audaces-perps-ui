import { UserAccount, Ecosystem, getOraclePrice } from "@audaces/perps";
import { Connection } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useAsyncData } from "../utils/fetch-loop";
import tuple from "immutable-tuple";

export const computeFreeCollateral = async (
  connection: Connection,
  userAccount: UserAccount | null | undefined,
  ecosystem: Ecosystem | null | undefined
) => {
  if (!userAccount || !ecosystem) return;
  let freeCollateral = userAccount.header.credit.toNumber();

  for (let om of userAccount.openMarkets) {
    const size = om.baseAmount.toNumber();
    const side = Math.sign(size);
    if (size === 0) continue;
    const market = ecosystem.markets[om.ecosystemIndex];
    const { price } = await getOraclePrice(connection, market.oracle);
    if (!price) {
      console.log(`No oracle price`);
      continue;
    }

    freeCollateral += price * size * side;
  }
  return freeCollateral / Math.pow(10, 6);
};

export const useFreeCollateral = (
  userAccount: UserAccount | null | undefined,
  ecosystem: Ecosystem | null | undefined
) => {
  const { connection } = useConnection();
  const fn = async () => {
    try {
      return await computeFreeCollateral(connection, userAccount, ecosystem);
    } catch (err) {
      console.log(err);
    }
  };
  return useAsyncData(
    fn,
    tuple("useFreeCollateral", !!userAccount, !!ecosystem)
  );
};
