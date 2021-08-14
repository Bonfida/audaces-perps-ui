import { useWallet } from "./wallet";
import { getProgramAccounts, USDC_MINT, useLocalStorageState } from "./utils";
import { useAsyncData } from "./fetch-loop";
import tuple from "immutable-tuple";
import { useConnection } from "./connection";
import {
  findAssociatedTokenAddress,
  getUserAccountsForOwner,
  MarketState,
} from "@audaces/perps";
import { PublicKey } from "@solana/web3.js";
import { useMarket } from "./market";
import { getOraclePrice } from "@audaces/perps";
import { getOpenPositions } from "@audaces/perps";
import {
  getTwitterRegistry,
  getHashedName,
  getNameAccountKey,
  NameRegistryState,
} from "@bonfida/spl-name-service";

let ALLOW_REF_LINKS = process.env.REACT_APP_ALLOW_REF_LINKS;
ALLOW_REF_LINKS = ALLOW_REF_LINKS ? JSON.parse(ALLOW_REF_LINKS) : false;

// Address of the SOL TLD
export const SOL_TLD_AUTHORITY = new PublicKey(
  "58PwtjSDuFHuUkYjH9BYnnQKHfwo9reZhC2zMJv9JPkx"
);

export const REFERRAL_FEES_ADDRESS = !!process.env
  .REACT_APP_REFERRAL_FEES_ADDRESS
  ? new PublicKey(process.env.REACT_APP_REFERRAL_FEES_ADDRESS)
  : undefined;

export const getInputKey = async (input: string) => {
  let hashed_input_name = await getHashedName(input);
  let inputDomainKey = await getNameAccountKey(
    hashed_input_name,
    undefined,
    SOL_TLD_AUTHORITY
  );
  return { inputDomainKey: inputDomainKey, hashedInputName: hashed_input_name };
};

export const useQuoteAccountFromRefCode = (refCode: string | undefined) => {
  const connection = useConnection();
  const get = async () => {
    if (!refCode || !ALLOW_REF_LINKS) return REFERRAL_FEES_ADDRESS;
    try {
      let usdcAddress: PublicKey | undefined;
      let nameRegistryState: NameRegistryState;
      if (refCode.includes(".sol")) {
        const { inputDomainKey } = await getInputKey(
          refCode.replace(".sol", "")
        );
        nameRegistryState = await NameRegistryState.retrieve(
          connection,
          inputDomainKey
        );
      } else {
        nameRegistryState = await getTwitterRegistry(
          connection,
          refCode.replace("@", "")
        );
      }
      usdcAddress = await findAssociatedTokenAddress(
        nameRegistryState.owner,
        USDC_MINT
      );
      console.log(`Ref account is ${usdcAddress.toBase58()}`);
      const accountInfo = await connection.getParsedAccountInfo(usdcAddress);
      if (!accountInfo.value?.data) {
        console.log(`Ref account not initialized`);
        return REFERRAL_FEES_ADDRESS;
      } // Account does not exist
      return usdcAddress;
    } catch (err) {
      console.warn(`Error getting refcode ${err}`);
      return REFERRAL_FEES_ADDRESS;
    }
  };
  return useAsyncData(get, tuple("useQuoteAccountFromRefCode", refCode), {
    refreshInterval: 10 * 60_000,
  });
};

export const useReferrer = (): PublicKey | undefined => {
  const [refCode] = useLocalStorageState("referralCode");
  const [refAccount] = useQuoteAccountFromRefCode(refCode);
  return refAccount || undefined;
};

export const useOpenPositions = () => {
  const connection = useConnection();
  const { wallet, connected } = useWallet();
  const get = async () => {
    if (!connected || !wallet) {
      return null;
    }
    const result = await getOpenPositions(connection, wallet.publicKey);
    return result;
  };
  return useAsyncData(get, tuple("useOpenPositions", connected), {
    refreshInterval: 2_000,
  });
};

export const useAvailableCollateral = () => {
  const connection = useConnection();
  const { wallet } = useWallet();
  const get = async () => {
    if (!wallet) {
      return {
        collateralAddress: null,
        amount: null,
        uiAmount: null,
        decimals: null,
      };
    }
    const collateralAddress = await findAssociatedTokenAddress(
      wallet?.publicKey,
      USDC_MINT
    );
    const collateralAccountInfo = await connection.getParsedAccountInfo(
      collateralAddress
    );
    return {
      collateralAddress: collateralAddress,
      amount:
        // @ts-ignore
        collateralAccountInfo.value?.data?.parsed?.info?.tokenAmount?.amount,
      uiAmount:
        // @ts-ignore
        collateralAccountInfo.value?.data?.parsed?.info?.tokenAmount.uiAmount,
      decimals:
        // @ts-ignore
        collateralAccountInfo.value?.data?.parsed?.info?.tokenAmount?.decimals,
    };
  };
  return useAsyncData(
    get,
    tuple("useAvailableCollateral", wallet?.publicKey?.toBase58())
  );
};

export const useTokenAccounts = (mint?: string) => {
  const { wallet, connected } = useWallet();
  const getTokenAccounts = async () => {
    if (!connected) {
      return null;
    }
    let accounts = await getProgramAccounts(wallet?.publicKey);
    accounts = accounts?.sort((a, b) => {
      return (
        b.account.data.parsed.info.tokenAmount.uiAmount -
        a.account.data.parsed.info.tokenAmount.uiAmount
      );
    });
    if (mint) {
      return accounts.filter((e) => e.account.data.parsed.info.mint === mint);
    }
    return accounts;
  };

  return useAsyncData(
    getTokenAccounts,
    tuple("getTokenAccounts", wallet, connected)
  );
};

export const findUserAccountsForMint = (tokenAccounts: any, mint: string) => {
  return tokenAccounts
    ?.filter((acc) => acc.account.data.parsed.info.mint === mint)
    ?.map((acc) => acc.pubkey);
};

export const useOraclePrice = (marketAddress: PublicKey | undefined | null) => {
  const connection = useConnection();
  const get = async () => {
    if (!marketAddress) return;
    const marketState = await MarketState.retrieve(connection, marketAddress);
    if (!marketState) {
      return null;
    }
    const result = await getOraclePrice(connection, marketState.oracleAddress);
    return result;
  };
  return useAsyncData(
    get,
    tuple("useOracleAddress", connection, marketAddress?.toBase58())
  );
};

export const useUserData = () => {
  const { wallet, connected } = useWallet();
  const connection = useConnection();
  const { refreshUserAccount } = useMarket();
  const get = async () => {
    if (!connected) {
      return null;
    }
    const userAccounts = await getUserAccountsForOwner(
      connection,
      wallet.publicKey
    );
    return userAccounts;
  };
  return useAsyncData(
    get,
    tuple(
      "useUserData",
      connection,
      wallet?.publicKey?.toBase58(),
      refreshUserAccount
    )
  );
};
