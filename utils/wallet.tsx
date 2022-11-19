import React, { useCallback, useContext, useEffect, useState } from "react";
import { clusterApiUrl, Connection, PublicKey } from "@solana/web3.js";
import { useWallet, WalletContextState } from "@solana/wallet-adapter-react";
import { useJupiterApiContext } from "./jupiter";
import { TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { Toast } from "./toast";
import { DefaultApi } from "@jup-ag/api";

const DotWalletContext = React.createContext<{
  connection: Connection;
  address: string;
  balance: number;
  wallet: WalletContextState;
  savableAmount: number;
  transactions: any[];
  tokenMap: TokenInfo | undefined;
  swapRoute: any;
  fetchData: () => Promise<void>;
  getTokenMap: (mint: string) => TokenInfo | undefined;
  loading: boolean;
  api: DefaultApi;
} | null>(null);

export const DotWalletProvider: React.FC<any> = ({ children }) => {
  const wallet = useWallet();
  const connection = new Connection(clusterApiUrl("devnet"));
  const [balance, setBalance] = React.useState(0);
  const [savableAmount, setSavableAmount] = useState(0);
  const [tokenMap, setTokenMap] = useState<TokenInfo | undefined>(undefined);
  const [swapRoute, setSwapRoute] = useState({});
  const [tokenList, setTokenList] = useState<TokenInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  const usdcTokenProgram = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );

  // use jupiter to get token details

  const { api } = useJupiterApiContext();

  const address = `${wallet.publicKey
    ?.toBase58()
    .slice(0, 5)}...${wallet.publicKey?.toBase58().slice(-5)}`;

  useEffect(() => {
    if (tokenMap && wallet.publicKey) {
      connection
        .getTokenAccountsByOwner(wallet.publicKey, {
          programId: usdcTokenProgram,
        })
        .then((accounts) => {
          console.log(accounts);
          const bal = accounts?.value[0]?.account?.lamports;
          // convert balance to USD Coin
          if (bal) {
            setBalance(bal / 10 ** (tokenMap?.decimals || 1));
            // console.log(LAMPORTS_PER_SOL);
          }
        });
    }
  }, [tokenMap, wallet.publicKey]);

  const fetchData = useCallback(async () => {
    if (wallet.publicKey && api) {
      setLoading(true);
      let amountSavable = 0;

      // get transactions for the wallet
      await connection
        .getConfirmedSignaturesForAddress2(wallet.publicKey)
        .then(async (txs) => {
          const txsData = await Promise.all(
            txs.map(async (tx) => {
              const txData = await connection.getParsedTransaction(
                tx.signature
              );

              return txData;
            })
          );

          setTransactions(txsData);

          for (let index = 0; index < txs.length; index++) {
            const tx = txs[index];

            // get transaction details
            await connection.getParsedTransaction(tx.signature).then((tx) => {
              // console.log(tx);
              if (tx?.meta?.postTokenBalances) {
                const amount =
                  // @ts-ignore
                  +tx?.meta?.postTokenBalances[0]?.uiTokenAmount?.amount;
                const sender =
                  tx?.transaction?.message?.accountKeys[0].pubkey.toBase58();

                if (
                  sender !== wallet.publicKey?.toBase58() &&
                  !Number.isNaN(amount)
                ) {
                  amountSavable += amount;
                }
              }
            });
          }
        });

      setSavableAmount(amountSavable);

      const tokens = (await new TokenListProvider().resolve()).getList();
      setTokenList(tokens);

      const outputToken = tokens.find(
        (t) => t.address == "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
      ) as TokenInfo | undefined;
      const inputToken = tokens.find(
        (t) => t.address == "So11111111111111111111111111111111111111112"
      );
      setTokenMap(outputToken);

      if (amountSavable > 0 && inputToken?.address && outputToken?.address) {
        await api
          .v3QuoteGet({
            amount: `${amountSavable}`,
            inputMint: inputToken?.address,
            outputMint: outputToken?.address,
          })
          .then(({ data }) => {
            if (data) {
              setSwapRoute(data[0]);
            }
          });
      }

      setLoading(false);
    } else {
      if (!loading) Toast.send("Wallet not connected", "error");
    }
  }, [wallet.publicKey, api]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getTokenMap = useCallback(
    (mint: string) => {
      return tokenList.find((t) => t.address == mint);
    },
    [tokenList]
  );

  return (
    <DotWalletContext.Provider
      value={{
        connection,
        address,
        balance,
        wallet,
        savableAmount,
        transactions,
        tokenMap,
        swapRoute,
        fetchData,
        getTokenMap,
        loading,
        api,
      }}
    >
      {children}
    </DotWalletContext.Provider>
  );
};

export const useDotWallet = () => {
  const context = useContext(DotWalletContext);

  if (!context) {
    throw new Error("useDotWallet must be used within a DotWalletProvider");
  }

  return context;
};
