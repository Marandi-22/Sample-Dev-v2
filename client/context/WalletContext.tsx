// client/context/WalletContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---------------- persistent keys & starting values ---------------- */
const RUPEE_KEY    = "@wallet_rupee_v1";
const TYC_KEY      = "@wallet_tycoon_v1";

const START_RUPEE  = 5_000;   // welcome money in ₹
const START_TYCASH = 0;       // Tycoon-cash starts at zero

/* ---------------- interface ---------------- */
interface WalletCtx {
  // canonical fields
  rupees      : number;
  tyCash      : number;
  depositRs   : (amt: number) => Promise<void>;
  withdrawRs  : (amt: number) => Promise<boolean>;
  depositTy   : (amt: number) => Promise<void>;
  withdrawTy  : (amt: number) => Promise<boolean>;
  convertTyToRs: (tyAmt: number) => Promise<boolean>;

  // convenience aliases used by games
  balance     : number;                        // = rupees
  deposit     : (amt: number) => Promise<void>;       // = depositRs
  withdraw    : (amt: number) => Promise<boolean>;    // = withdrawRs

  // ready flag so UI can wait before reading numbers
  loading     : boolean;
}

/* ---------------- context helpers ---------------- */
const Ctx = createContext<WalletCtx | null>(null);
export const useWallet = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useWallet must be used within WalletProvider");
  return v;
};

/* ---------------- component provider ---------------- */
export const WalletProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rupees , setRupees ] = useState<number>(0);
  const [tyCash , setTyCash ] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  /* ---------- load or seed both balances once ---------- */
  useEffect(() => {
    (async () => {
      try {
        const entries = await AsyncStorage.multiGet([RUPEE_KEY, TYC_KEY]);
        const map: Record<string,string|null> = Object.fromEntries(entries || []);

        if (map[RUPEE_KEY] == null) await AsyncStorage.setItem(RUPEE_KEY, String(START_RUPEE));
        if (map[TYC_KEY]   == null) await AsyncStorage.setItem(TYC_KEY  , String(START_TYCASH));

        setRupees(Number(map[RUPEE_KEY] ?? START_RUPEE) || 0);
        setTyCash(Number(map[TYC_KEY]   ?? START_TYCASH) || 0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ---------- generic saver helpers ---------- */
  const saveRs = async (val: number) => {
    setRupees(val);
    await AsyncStorage.setItem(RUPEE_KEY, String(val));
  };
  const saveTy = async (val: number) => {
    setTyCash(val);
    await AsyncStorage.setItem(TYC_KEY, String(val));
  };

  /* ---------- public API ---------- */
  const depositRs  = async (amt: number) => saveRs(rupees + (amt || 0));
  const withdrawRs = async (amt: number) => {
    if ((amt || 0) > rupees) return false;
    await saveRs(rupees - (amt || 0));
    return true;
  };

  const depositTy  = async (amt: number) => saveTy(tyCash + (amt || 0));
  const withdrawTy = async (amt: number) => {
    if ((amt || 0) > tyCash) return false;
    await saveTy(tyCash - (amt || 0));
    return true;
  };

  /* convert Ty-cash → Rupees at a fixed 10 Ty → 1 ₹ */
  const RATE = 10;
  const convertTyToRs = async (tyAmt: number) => {
    if ((tyAmt || 0) > tyCash) return false;
    const rs = Math.floor((tyAmt || 0) / RATE);
    if (rs <= 0) return false;
    await saveTy(tyCash - (tyAmt || 0));
    await saveRs(rupees + rs);
    return true;
  };

  /* ---------- aliases used by mini-games ---------- */
  const balance  = rupees;
  const deposit  = depositRs;
  const withdraw = withdrawRs;

  return (
    <Ctx.Provider
      value={{
        rupees, tyCash,
        depositRs, withdrawRs, depositTy, withdrawTy, convertTyToRs,
        balance, deposit, withdraw,
        loading,
      }}
    >
      {children}
    </Ctx.Provider>
  );
};
