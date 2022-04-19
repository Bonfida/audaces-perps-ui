import { PublicKey } from "@solana/web3.js";

export interface IMarket {
  address: PublicKey;
  ecosystem: PublicKey;
  name: string;
}

export const markets: IMarket[] = [
  {
    ecosystem: new PublicKey("CvLNxPSEkEzNZbzqfS1jPnTwWdHfQZDngMkVmMa8hUbh"),
    address: new PublicKey("H37WDqiVKkbf1MDoyEn7SHtDuMXoyyUtTbZHT9gjs97q"),
    name: "BTC/USD",
  },
];
