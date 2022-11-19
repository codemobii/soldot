import React, { useState } from "react";
import { useDotWallet } from "utils/wallet";

export default function TransactionCard() {
  const { transactions, getTokenMap } = useDotWallet();

  // console.log(transactions);

  return (
    <div>
      <div>
        <p>Transactions</p>
      </div>

      <div>
        {transactions?.map((transaction) => {
          const tokenMap = getTokenMap(
            transaction?.transaction?.message?.instructions[0]?.parsed?.info
              ?.mint
          );

          return (
            <div>
              <img
                src={tokenMap?.logoURI}
                width={20}
                height={20}
                alt={tokenMap?.name}
              />
              <p>
                {transaction?.transaction?.signatures[0].slice(0, 5)}...
                {transaction?.transaction?.signatures[0].slice(-5)}
              </p>
              <p>
                {new Date(transaction?.blockTime * 1000).toLocaleDateString(
                  "en-US"
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
