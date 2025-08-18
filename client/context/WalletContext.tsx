// client/context/WalletContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BAL_KEY     = "@wallet_balance_v1";
const START_RUPEE = 5000;          // ← change the “welcome” money here

interface WalletCtx {
  balance : number;
  deposit : (amt: number) => Promise<void>;
  withdraw: (amt: number) => Promise<boolean>;
}

const Ctx = createContext<WalletCtx | null>(null);
export const useWallet = () => useContext(Ctx)!;

export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [balance, setBalance] = useState<number>(0);

  /* ---------- load (or seed) on first mount ---------- */
  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(BAL_KEY);

      if (raw === null) {
        // no previous wallet → seed with starting cash
        await AsyncStorage.setItem(BAL_KEY, String(START_RUPEE));
        setBalance(START_RUPEE);
      } else {
        setBalance(Number(raw));
      }
    })();
  }, []);

  /* ---------- helpers ---------- */
  const save = async (val: number) => {
    setBalance(val);
    await AsyncStorage.setItem(BAL_KEY, String(val));
  };

  const deposit = async (amt: number) => save(balance + amt);

  const withdraw = async (amt: number) => {
    if (amt > balance) return false;
    await save(balance - amt);
    return true;
  };

  return (
    <Ctx.Provider value={{ balance, deposit, withdraw }}>
      {children}
    </Ctx.Provider>
  );
};
