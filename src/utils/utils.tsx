import { useCallback, useEffect, useMemo, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { MAINNET_ENDPOINT } from "./connection";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import words from "fun-word-list";

export const BONFIDA_API_URL = "https://serum-api.bonfida.com/";

export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const FIDA_MINT = "EchesyfXePKdLtoiZSL8pBe8Myagyy8ZRqsACNCFGnvp";

export const BNB_ADDRESS = new PublicKey(
  "4qZA7RixzEgQ53cc6ittMeUtkaXgCnjZYkP8L1nxFD25"
);

export const NUMBER_REGEX = /^[0-9]*\.*[0-9]*$/;

export function isValidPublicKey(key: string | null | undefined) {
  if (!key) {
    return false;
  }
  try {
    new PublicKey(key);
    return true;
  } catch {
    return false;
  }
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const percentFormat = new Intl.NumberFormat(undefined, {
  style: "percent",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function floorToDecimal(
  value: number,
  decimals: number | undefined | null
) {
  return decimals ? Math.floor(value * 10 ** decimals) / 10 ** decimals : value;
}

export function roundToDecimal(
  value: number | null | undefined,
  decimals: number | undefined | null
) {
  if (!value) {
    return null;
  }
  return decimals ? Math.round(value * 10 ** decimals) / 10 ** decimals : value;
}

export function getDecimalCount(value): number {
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes(".")
  )
    return value.toString().split(".")[1].length || 0;
  if (
    !isNaN(value) &&
    Math.floor(value) !== value &&
    value.toString().includes("e")
  )
    return parseInt(value.toString().split("e-")[1] || "0");
  return 0;
}

export function divideBnToNumber(numerator: BN, denominator: BN): number {
  const quotient = numerator.div(denominator).toNumber();
  const rem = numerator.umod(denominator);
  const gcd = rem.gcd(denominator);
  return quotient + rem.div(gcd).toNumber() / denominator.div(gcd).toNumber();
}

export function getTokenMultiplierFromDecimals(decimals: number): BN {
  return new BN(10).pow(new BN(decimals));
}

const localStorageListeners = {};

export function useLocalStorageStringState(
  key: string,
  defaultState: string | null = null
): [string | null, (newState: string | null) => void] {
  const state = localStorage.getItem(key) || defaultState;

  const [, notify] = useState(key + "\n" + state);

  useEffect(() => {
    if (!localStorageListeners[key]) {
      localStorageListeners[key] = [];
    }
    localStorageListeners[key].push(notify);
    return () => {
      localStorageListeners[key] = localStorageListeners[key].filter(
        (listener) => listener !== notify
      );
      if (localStorageListeners[key].length === 0) {
        delete localStorageListeners[key];
      }
    };
  }, [key]);

  const setState = useCallback<(newState: string | null) => void>(
    (newState) => {
      const changed = state !== newState;
      if (!changed) {
        return;
      }

      if (newState === null) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, newState);
      }
      localStorageListeners[key]?.forEach((listener) =>
        listener(key + "\n" + newState)
      );
    },
    [state, key]
  );

  return [state, setState];
}

export function useLocalStorageState<T = any>(
  key: string,
  defaultState: T | null = null
): [T, (newState: T) => void] {
  let [stringState, setStringState] = useLocalStorageStringState(
    key,
    JSON.stringify(defaultState)
  );
  return [
    useMemo(() => stringState && JSON.parse(stringState), [stringState]),
    (newState) => setStringState(JSON.stringify(newState)),
  ];
}

export function useEffectAfterTimeout(effect, timeout) {
  useEffect(() => {
    const handle = setTimeout(effect, timeout);
    return () => clearTimeout(handle);
  });
}

export function useListener(emitter, eventName) {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    const listener = () => forceUpdate((i) => i + 1);
    emitter.on(eventName, listener);
    return () => emitter.removeListener(eventName, listener);
  }, [emitter, eventName]);
}

export function abbreviateAddress(address: PublicKey | undefined, size = 4) {
  if (!address) {
    return null;
  }
  const base58 = address.toBase58();
  return base58.slice(0, size) + "…" + base58.slice(-size);
}

export function isEqual(obj1, obj2, keys) {
  if (!keys && Object.keys(obj1).length !== Object.keys(obj2).length) {
    return false;
  }
  keys = keys || Object.keys(obj1);
  for (const k of keys) {
    if (obj1[k] !== obj2[k]) {
      // shallow comparison
      return false;
    }
  }
  return true;
}

export function flatten(obj, { prefix = "", restrictTo }) {
  let restrict = restrictTo;
  if (restrict) {
    restrict = restrict.filter((k) => obj.hasOwnProperty(k));
  }
  const result = {};
  (function recurse(obj, current, keys) {
    (keys || Object.keys(obj)).forEach((key) => {
      const value = obj[key];
      const newKey = current ? current + "." + key : key; // joined key with dot
      if (value && typeof value === "object") {
        // @ts-ignore
        recurse(value, newKey); // nested object
      } else {
        result[newKey] = value;
      }
    });
  })(obj, prefix, restrict);
  return result;
}

export async function apiPost(url: string, body: any, headers: any) {
  try {
    let response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(body),
      headers: headers,
    });
    if (!response.ok) {
      throw new Error(`Error apiPost - status ${response.status}`);
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.warn(err);
    throw new Error(`Error apiPost - err ${err}`);
  }
}

export async function apiGet(path) {
  try {
    let response = await fetch(path);
    if (!response.ok) {
      return [];
    }
    let json = await response.json();
    return json;
  } catch (err) {
    console.log(err);
    return [];
  }
}

export const formatPercentage = (value) => {
  return `${value > 0 ? "+" : ""}${(
    Math.round(value * 1e4) / 1e2
  ).toString()}%`;
};

export const formatUsd = (value) => {
  if (value < 1e3) {
    return "$" + (Math.round(value * 1e2) / 1e2).toString();
  }
  if (1e3 <= value && value < 1e6) {
    return "$" + (Math.round((value / 1e3) * 1e2) / 1e2).toString() + "K";
  }
  if (1e6 <= value && value < 1e9) {
    return "$" + (Math.round((value / 1e6) * 1e2) / 1e2).toString() + "M";
  }
  if (1e9 <= value) {
    return "$" + (Math.round((value / 1e9) * 1e2) / 1e2).toString() + "B";
  }
};

export const getVariationsFromMarket = async (
  market: string
): Promise<string> => {
  const result = await apiGet(
    `https://serum-api.bonfida.com/variations/${market}`
  );
  if (!result.success || !result.data) {
    throw new Error("Error getting price variation");
  }
  return result.data;
};

export const getVolumeFromMarket = async (
  market: string
): Promise<string | undefined> => {
  const result = await apiGet(
    `https://serum-api.bonfida.com/volumes/${market}`
  );
  if (!result.success || !result.data) {
    throw new Error("Error getting volumes");
  }
  return formatUsd(result.data[0].volumeUsd);
};

export function format(value, precision) {
  return Math.round(value * precision) / precision;
}

export const numberWithCommas = (x) => {
  return x.toLocaleString();
};

export const rpcRequest = async (method: string, params: any) => {
  try {
    let response = await fetch(MAINNET_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: method,
        params: params,
      }),
    });
    if (!response.ok) {
      return [];
    }
    if (response.status !== 200 || !response.ok) {
      throw new Error(`Error rpcRequest `);
    }
    let json = await response.json();
    return json.result;
  } catch (err) {
    console.error(err);
    throw new Error(`Error rpcRequest = ${err}`);
  }
};

export const formatSeconds = (sec: number): string => {
  let min;
  let s;
  let hour;
  let day;
  switch (true) {
    case sec < 60:
      return `${sec} s`;
    case sec < 60 * 60:
      min = Math.floor(sec / 60);
      s = sec % 60;
      return `${min} min ${s} s`;
    case sec < 24 * 60 * 60:
      hour = Math.floor(sec / (60 * 60));
      min = sec % (60 * 60);
      return `${hour} h ${min} min`;
    default:
      day = Math.floor(sec / (24 * 60 * 60));
      hour = sec % (24 * 60 * 60);
      return `${day} day ${hour}h`;
  }
};

export const abbreviateString = (
  s: string | null | undefined,
  size: number = 7
) => {
  if (!s) {
    return "";
  }
  return s.slice(0, size) + "…" + s.slice(-size);
};

export const getProgramAccounts = async (pubkey: PublicKey) => {
  const params = [
    TOKEN_PROGRAM_ID.toBase58(),
    {
      encoding: "jsonParsed",
      filters: [
        {
          dataSize: 165,
        },
        {
          memcmp: {
            offset: 32,
            bytes: pubkey?.toBase58(),
          },
        },
      ],
    },
  ];
  const result = await rpcRequest("getProgramAccounts", params);
  return result;
};

export const checkTextFieldNumberInput = (e) => {
  const trim = e.target.value.trim();
  if (trim === "") {
    return { value: null, valid: true };
  }
  const result = trim.match(NUMBER_REGEX);
  if (!result) {
    return { value: null, valid: false };
  }
  const parsed = parseFloat(trim);
  const valid = !(isNaN(parsed) || parsed < 0 || !isFinite(parsed));
  return { value: valid ? trim : null, valid: valid };
};

export const hashStringToInteger = (s: string) => {
  let hash = 0,
    i,
    chr;
  for (i = 0; i < s.length; i++) {
    chr = s.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

export const getLeaderBoardName = (address: string) => {
  const hashed = hashStringToInteger(address).toString();
  // words.nouns.length === 1015
  return (
    words.nouns[parseInt(hashed.slice(1, 4)) % 1015][0] +
    "-" +
    words.nouns[parseInt(hashed.slice(2, 5)) % 1015][0] +
    "-" +
    words.nouns[parseInt(hashed.slice(3, 6)) % 1015][0]
  )
    .split(" ")
    .join("-");
};

interface WindowSize {
  width: number;
  height: number;
}

export const useWindowSize = (): WindowSize => {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handler = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set size at the first client-side load
    handler();

    window.addEventListener("resize", handler);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener("resize", handler);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return windowSize;
};

export const useSmallScreen = (breakpoint: string = "sm") => {
  const { width } = useWindowSize();
  switch (breakpoint) {
    case "xs":
      return width < 600;
    case "sm":
      return width < 960;
    case "md":
      return width < 1280;
    case "lg":
      return width < 1920;
    default:
      return width < 960;
  }
};
