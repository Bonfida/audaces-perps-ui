import { PublicKey } from "@solana/web3.js";

export interface IMarket {
  address: PublicKey;
  ecosystem: PublicKey;
  name: string;
}

export const markets: IMarket[] = [
  {
    ecosystem: new PublicKey("2EYdaTCkR7rs34aP7Zuw2sZtWygpCdpdhJrc1A27jbVc"),
    address: new PublicKey("FcqNNpNVp31nBnNybbLDg3mCACVs9MmVAUNM4Hh61snr"),
    name: "BTC/USD",
  },
];
