import { useWallet } from "@solana/wallet-adapter-react";
import {
  WalletModalContext,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import React from "react";
import { useContext } from "react";
import Button from "./button";

export default function WalletButton() {
  const wallet = useWallet();

  const connect = useContext(WalletModalContext);

  return wallet.connected ? null : (
    <Button
      onClick={() => {
        connect.setVisible(true);
      }}
    >
      Connect
    </Button>
  );
}
