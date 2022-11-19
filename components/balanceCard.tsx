import Image from "next/image";
import React, { useEffect } from "react";
import { FaCopy } from "react-icons/fa";
import { useJupiterApiContext } from "utils/jupiter";
import { Toast } from "utils/toast";
import { useDotWallet } from "utils/wallet";

export default function BalanceCard() {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);

    Toast.send(`Copied ${text} to clipboard`);
  };

  const { address, tokenMap, balance, wallet } = useDotWallet();

  return (
    <div>
      <div>
        <div className="balanceName">
          <img src={tokenMap?.logoURI} width={20} height={20} alt="USDC" />
          <p>{tokenMap?.name}</p>
        </div>

        <p>
          {balance} {tokenMap?.symbol}
        </p>

        <div className="flex">
          <p>{wallet?.publicKey ? address : "Not connected"}</p>

          <button
            onClick={() => {
              handleCopy("dd");
            }}
            className="iconButton"
          >
            <FaCopy />
          </button>
        </div>
      </div>
    </div>
  );
}
