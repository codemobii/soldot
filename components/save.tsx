import { Transaction } from "@solana/web3.js";
import React from "react";
import { useDotWallet } from "utils/wallet";

export default function Save() {
  const { savableAmount, swapRoute, tokenMap, wallet, api, connection } =
    useDotWallet();

  console.log(swapRoute);

  return (
    <div>
      {tokenMap?.decimals && (
        <p>Savable Amount {savableAmount / 10 ** tokenMap?.decimals}</p>
      )}

      <button
        type="button"
        onClick={async () => {
          try {
            if (wallet.publicKey && wallet.signAllTransactions) {
              const { swapTransaction, setupTransaction, cleanupTransaction } =
                await api.v3SwapPost({
                  body: {
                    route: swapRoute,
                    userPublicKey: wallet.publicKey.toBase58(),
                  },
                });
              const transactions = (
                [setupTransaction, swapTransaction, cleanupTransaction].filter(
                  Boolean
                ) as string[]
              ).map((tx) => {
                console.log("tx", tx);
                return Transaction.from(Buffer.from(tx, "base64"));
              });

              await wallet.signAllTransactions(transactions);
              for (let transaction of transactions) {
                // get transaction object from serialized transaction

                // perform the swap
                const txid = await connection.sendRawTransaction(
                  transaction.serialize()
                );

                await connection.confirmTransaction(txid);
                console.log(`https://solscan.io/tx/${txid}`);
              }
            }
          } catch (e) {
            console.log(e);
          }
        }}
      >
        Save
      </button>
    </div>
  );
}
