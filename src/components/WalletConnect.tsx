import { FC } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletConnect: FC = () => {
  const { connected } = useWallet()

  return (
    <WalletModalProvider>
      { connected ? <WalletDisconnectButton /> : <WalletMultiButton /> }
    </WalletModalProvider>
  );
};

export default WalletConnect;