import React, { useContext, useEffect, useMemo, useState } from "react";
import { Configuration, DefaultApi } from "@jup-ag/api";
import { TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { CHAIN_ID } from "./constants";

type RouteMap = Map<string, string[]>;

interface JupiterApiContext {
  api: DefaultApi;
  loaded: boolean;
  tokenMap: Map<string, TokenInfo>;
  routeMap: RouteMap;
}

const JupiterApiContext = React.createContext<JupiterApiContext | null>(null);

export const JupiterApiProvider: React.FC<any> = ({ children }) => {
  const [tokenMap, setTokenMap] = useState<Map<string, TokenInfo>>(new Map());
  const [routeMap, setRouteMap] = useState<RouteMap>(new Map());
  const [loaded, setLoaded] = useState(false);
  const api = useMemo(() => {
    const config = new Configuration({ basePath: "https://quote-api.jup.ag" });
    return new DefaultApi(config);
  }, []);
  useEffect(() => {
    (async () => {
      const [tokens, indexedRouteMapResult] = await Promise.all([
        new TokenListProvider().resolve(),
        api.v3IndexedRouteMapGet(),
      ]);
      const tokenList = tokens.filterByChainId(CHAIN_ID).getList();

      const { indexedRouteMap = {}, mintKeys = [] } = indexedRouteMapResult;

      const routeMap = Object.keys(indexedRouteMap).reduce((routeMap, key) => {
        routeMap.set(
          mintKeys[Number(key)],
          indexedRouteMap[key].map((index) => mintKeys[index])
        );
        return routeMap;
      }, new Map<string, string[]>());

      // const usdc

      setTokenMap(
        tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map())
      );

      setRouteMap(routeMap);
      setLoaded(true);
    })();
  }, []);

  return (
    <JupiterApiContext.Provider value={{ api, routeMap, tokenMap, loaded }}>
      {children}
    </JupiterApiContext.Provider>
  );
};

export const useJupiterApiContext = () => {
  const context = useContext(JupiterApiContext);

  if (!context) {
    throw new Error(
      "useJupiterApiContext must be used within a JupiterApiProvider"
    );
  }

  return context;
};
