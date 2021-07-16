import React, {
  useMemo,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { MarketContextValues, PastTrade, FundingPayment } from "./types";
import { PublicKey } from "@solana/web3.js";
import { useAsyncData } from "./fetch-loop";
import { useConnection } from "./connection";
import {
  MarketState,
  UserAccount,
  getUserAccountsForOwner,
} from "@audaces/perps";
import tuple from "immutable-tuple";
import { useWallet } from "./wallet";
import { apiGet, roundToDecimal, useLocalStorageState } from "./utils";

const URL_API_TRADES = "https://serum-api.bonfida.com/perps/trades?market=";
const URL_API_VOLUME = "https://serum-api.bonfida.com/perps/volume?market=";
const URL_API_FUNDING =
  "https://serum-api.bonfida.com/perps/funding-payment?userAddress=";

export const MAX_LEVERAGE = 15;

const MarketContext: React.Context<null | MarketContextValues> =
  React.createContext<null | MarketContextValues>(null);

export const MarketProvider = ({ children }) => {
  const connection = useConnection();
  const [slippage, setSlippage] = useState(0.1);
  const [autoApprove, setAutoApprove] = useLocalStorageState(
    "autoApprove",
    false
  );
  const [market, setMarket] = useState(
    "475P8ZX3NrzyEMJSFHt9KCMjPpWBWGa6oNxkWcwww2BR"
  );
  const [userAccount, setUserAccount] = useState<
    UserAccount | null | undefined
  >(null);
  const { wallet, connected } = useWallet();

  const marketAddress = useMemo(() => new PublicKey(market), [market]);

  const getMarketState = useCallback(async () => {
    const marketState = await MarketState.retrieve(connection, marketAddress);
    return marketState;
  }, [marketAddress, connection]);

  const [marketState, marketStateLoaded] = useAsyncData(
    getMarketState,
    tuple("getMarketState", connection),
    { refreshInterval: 1_000 }
  );
  const [refreshUserAccount, setRefreshUserAccount] = useState(false);

  useEffect(() => {
    const fn = async () => {
      if (!connected) {
        return;
      }
      const userAccounts = await getUserAccountsForOwner(
        connection,
        wallet.publicKey
      );
      const filtered = userAccounts
        ?.filter((u) => u?.market.equals(marketAddress))
        .sort((a, b) => {
          if (a && b) {
            return b?.balance - a?.balance;
          }
          return 0;
        });
      setUserAccount(filtered[0] as UserAccount);
    };
    fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected, market, refreshUserAccount, marketState]);

  return (
    <MarketContext.Provider
      value={{
        marketAddress,
        marketState,
        marketStateLoaded,
        slippage,
        setSlippage,
        setMarket,
        userAccount,
        setUserAccount,
        autoApprove,
        setAutoApprove,
        refreshUserAccount,
        setRefreshUserAccount,
      }}
    >
      {children}
    </MarketContext.Provider>
  );
};

export const useMarket = () => {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("Missing market context");
  }
  return {
    marketAddress: context.marketAddress,
    marketState: context.marketState,
    marketStateLoaded: context.marketStateLoaded,
    slippage: context.slippage,
    setSlippage: context.setSlippage,
    setMarket: context.setMarket,
    userAccount: context.userAccount,
    setUserAccount: context.setUserAccount,
    autoApprove: context.autoApprove,
    setAutoApprove: context.setAutoApprove,
    refreshUserAccount: context.refreshUserAccount,
    setRefreshUserAccount: context.setRefreshUserAccount,
  };
};

export const use24hVolume = () => {
  const { marketAddress } = useMarket();
  const fn = async () => {
    const result = await apiGet(`${URL_API_VOLUME}${marketAddress.toBase58()}`);
    if (!result.success) return 0;
    return roundToDecimal(result?.data?.volume, 2)?.toLocaleString();
  };
  return useAsyncData(fn, "use24hVolume");
};

export const useLastTrades = () => {};

export const useMarkPrice = () => {
  const { marketState } = useMarket();
  if (!marketState?.vQuoteAmount || !marketState?.vCoinAmount) {
    return null;
  }
  return marketState.vQuoteAmount / marketState.vCoinAmount;
};

export const getFundingRate = (marketState: MarketState | null | undefined) => {
  if (!marketState) {
    return null;
  }
  return marketState.getFundingRatioLongShort();
};

export const useUserAccount = () => {
  const { userAccount } = useMarket();
  return userAccount;
};

export const useMarketTrades = (marketAddress: PublicKey) => {
  const fn = async () => {
    const result = await apiGet(`${URL_API_TRADES}${marketAddress.toBase58()}`);
    if (!result.success) {
      throw new Error("Error fetching pas trade");
    }
    const data: PastTrade[] = result.data;
    return data;
  };
  return useAsyncData(fn, tuple("useMarketTrades", marketAddress.toBase58()), {
    refreshInterval: 5_000,
  });
};

export const useUserTrades = (marketAddress: PublicKey) => {
  const { wallet, connected } = useWallet();
  const fn = async () => {
    if (!connected || !wallet.publicKey) return;
    const result = await apiGet(
      `${URL_API_TRADES}${marketAddress.toBase58()}&feePayer=${wallet.publicKey.toBase58()}`
    );
    if (!result.success) {
      throw new Error("Error fetching past trade");
    }
    const data: PastTrade[] = result.data;
    return data;
  };
  return useAsyncData(
    fn,
    tuple("useUserTrades", marketAddress.toBase58(), connected)
  );
};

export const useUserFunding = () => {
  const { userAccount } = useMarket();
  const fn = async () => {
    const result = await apiGet(
      `${URL_API_FUNDING}${userAccount?.address.toBase58()}`
    );
    if (!result.success) {
      throw new Error("Error fetching funding");
    }
    const data: FundingPayment[] = result.data;
    return data;
  };
  return useAsyncData(
    fn,
    tuple("useUserFunding", userAccount?.address?.toBase58())
  );
};

export const getMarketNameFromAddress = (name: string) => {
  switch (name) {
    case "475P8ZX3NrzyEMJSFHt9KCMjPpWBWGa6oNxkWcwww2BR":
      return "BTC/USDC";
    default:
      return "Unknown";
  }
};
