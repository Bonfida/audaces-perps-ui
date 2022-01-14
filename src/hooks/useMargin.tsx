import { UserAccount, Ecosystem, getOraclePrice } from "@audaces/perps";
import { Connection } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { useAsyncData } from "../utils/fetch-loop";
import tuple from "immutable-tuple";

export const computeMargin = async (
  connection: Connection,
  userAccount: UserAccount | null | undefined,
  ecosystem: Ecosystem | null | undefined,
  offset?: number | null
) => {
  if (!userAccount || !ecosystem) return;
  let accountValue = userAccount.header.credit.toNumber();
  if (!!offset) {
    accountValue += offset * Math.pow(10, 6); // Offset without decimals
  }
  let totalNotional = 0;

  for (let om of userAccount.openMarkets) {
    const size = om.baseAmount.toNumber();
    if (size === 0) continue;
    const market = ecosystem.markets[om.ecosystemIndex];
    const { price } = await getOraclePrice(connection, market.oracle);
    if (!price) {
      console.log(`No oracle price`);
      continue;
    }

    totalNotional += Math.abs(price * size);
    accountValue += price * size;
    console.log(size);
  }

  accountValue = Math.max(0, accountValue);

  const margin = accountValue / totalNotional;

  return { margin, accountValue, totalNotional };
};

export const useMargin = (
  userAccount: UserAccount | null | undefined,
  ecosystem: Ecosystem | null | undefined,
  offset?: number | null
) => {
  const { connection } = useConnection();
  const fn = async () => {
    try {
      return await computeMargin(connection, userAccount, ecosystem, offset);
    } catch (err) {
      console.log(err);
    }
  };
  return useAsyncData(
    fn,
    tuple("useMargin", !!userAccount, !!ecosystem, offset)
  );
};