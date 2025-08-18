// client/components/games/TycoonTycoon.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Image, Pressable } from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  ActivityIndicator,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWallet } from "../../context/WalletContext";

/* ---------- palette ---------- */
const BG = "#000";
const CARD = "#111";
const TEXT = "#fff";
const SUB = "#94A3B8";
const ACCENT = "#00C8FF";
const GOOD = "#16a34a";
const BORDER = "#1f2937";

/* ---------- business data ---------- */
const BUSINESSES = [
  {
    id: "chai",
    name: "Chai Tapri",
    img: require("../../assets/game/businesses/chai-tapri.png"),
    baseCost: 25,
    costMul: 1.07,
    baseIncome: 4,
    baseTime: 1.2, // seconds for 1st cycle at lvl 1
    overseer: "dolly",
  },
  // add your other businesses here if you had them before
];

/* ---------- overseers ---------- */
const OVERSEERS = {
  dolly: {
    name: "Dolly Chai-wala",
    cost: 1_000,
    img: require("../../assets/game/managers/manager-dolly.png"),
  },
  // add the other overseers here if you had them before
};

const STORE = "@tycoon_save_v1";

/* ---------- tiny safe helpers ---------- */
const nz = (v, f = 0) => (Number.isFinite(+v) ? +v : f);
const pos = (v, f = 0) => Math.max(f, nz(v, f));

const fmt = (n) => {
  const x = nz(n, 0);
  if (x < 1_000) return x.toFixed(0);
  if (x < 1_000_000) return (x / 1_000).toFixed(1) + "k";
  if (x < 1_000_000_000) return (x / 1_000_000).toFixed(1) + "m";
  return (x / 1_000_000_000).toFixed(1) + "b";
};
const secFmt = (s) => {
  const x = pos(s, 0);
  return x < 60
    ? `${x.toFixed(1)}s`
    : `${Math.floor(x / 60)}:${String(Math.floor(x % 60)).padStart(2, "0")}`;
};

/* build default state from current BUSINESSES */
const buildEmptyBizState = () => {
  const o = {};
  BUSINESSES.forEach((b) => {
    o[b.id] = { lvl: 0, running: false, timeLeft: 0, total: 0 };
  });
  return o;
};

/* merge old save with defaults (handles schema changes safely) */
function mergeState(saved) {
  const base = { biz: buildEmptyBizState(), overseers: {} };
  if (!saved || typeof saved !== "object") return base;

  const next = { biz: { ...base.biz }, overseers: { ...base.overseers } };
  // merge businesses
  Object.keys(next.biz).forEach((id) => {
    const s = saved.biz?.[id];
    next.biz[id] = {
      lvl: nz(s?.lvl, 0),
      running: !!s?.running && nz(s?.lvl, 0) > 0, // stop running if lvl=0
      timeLeft: pos(s?.timeLeft, 0),
      total: pos(s?.total, 0),
    };
  });
  // merge overseers
  Object.keys(OVERSEERS).forEach((oid) => {
    next.overseers[oid] = !!saved.overseers?.[oid];
  });
  return next;
}

/* =================================================================== */
export default function TycoonTycoon({ onExit }) {
  // wallet
  const { tyCash, depositTy, withdrawTy, loading: walletLoading } = useWallet();

  // seed new players after wallet ready
  useEffect(() => {
    if (!walletLoading && nz(tyCash, 0) <= 0) {
      depositTy(100);
    }
  }, [walletLoading, tyCash, depositTy]);

  // ---------- load / save ----------
  const [state, setState] = useState(() => ({ biz: buildEmptyBizState(), overseers: {} }));
  const [loadingSave, setLoadingSave] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE);
        const parsed = raw ? JSON.parse(raw) : null;
        setState(mergeState(parsed));
      } catch {
        setState({ biz: buildEmptyBizState(), overseers: {} });
      } finally {
        setLoadingSave(false);
      }
    })();
  }, []);

  const saveState = async (next) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      // ignore
    }
  };

  // ---------- game tick ----------
  const last = useRef(Date.now());
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now();
      const dt = (now - last.current) / 1000;
      last.current = now;

      setState((prev) => {
        let changed = false;
        const next = { ...prev, biz: { ...prev.biz } };

        BUSINESSES.forEach((b) => {
          const prevBs = prev.biz[b.id] ?? { lvl: 0, running: false, timeLeft: 0, total: 0 };
          const bs = { ...prevBs };

          // cycle time for current level
          const lvl = nz(bs.lvl, 0);
          const cycle = lvl > 0 ? pos(b.baseTime / Math.pow(b.costMul, lvl), b.baseTime) : b.baseTime;

          // auto-run if overseer hired
          if (lvl > 0 && next.overseers[b.overseer] && !bs.running) {
            bs.running = true;
            bs.timeLeft = cycle;
          }

          // decrement timers
          if (bs.running) {
            bs.timeLeft = pos(bs.timeLeft - dt, 0);
            if (bs.timeLeft <= 0) {
              const payout = lvl * nz(b.baseIncome, 0);
              bs.total = pos(bs.total + payout, 0);
              depositTy(payout);

              if (next.overseers[b.overseer]) {
                bs.timeLeft = cycle; // restart
              } else {
                bs.running = false;
                bs.timeLeft = 0;
              }
            }
            changed = true;
          }
          next.biz[b.id] = bs;
        });

        return changed ? next : prev;
      });
    }, 120); // slightly slower tick to be gentle
    return () => clearInterval(id);
  }, [depositTy]);

  // income preview
  const perSec = useMemo(() => {
    return BUSINESSES.reduce((sum, b) => {
      const bs = state.biz[b.id] ?? { lvl: 0 };
      const lvl = nz(bs.lvl, 0);
      if (!lvl) return sum;
      const cycle = pos(b.baseTime / Math.pow(b.costMul, lvl), b.baseTime);
      const income = lvl * nz(b.baseIncome, 0);
      return sum + income / cycle;
    }, 0);
  }, [state]);

  // UI tab
  const [tab, setTab] = useState("biz");

  // ---------- actions ----------
  const buyBusiness = async (b) => {
    const bs = state.biz[b.id] ?? { lvl: 0 };
    const lvl = nz(bs.lvl, 0);
    const cost = pos(b.baseCost * Math.pow(b.costMul, lvl), b.baseCost);
    const ok = await withdrawTy(cost);
    if (ok) {
      const next = {
        ...state,
        biz: { ...state.biz, [b.id]: { ...bs, lvl: lvl + 1 } },
      };
      saveState(next);
    }
  };

  const startWork = (b) => {
    const bs = state.biz[b.id] ?? { lvl: 0, running: false, timeLeft: 0, total: 0 };
    const lvl = nz(bs.lvl, 0);
    if (!lvl || bs.running) return;
    const cycle = pos(b.baseTime / Math.pow(b.costMul, lvl), b.baseTime);
    saveState({
      ...state,
      biz: {
        ...state.biz,
        [b.id]: { ...bs, running: true, timeLeft: cycle },
      },
    });
  };

  const hire = async (oid) => {
    if (state.overseers[oid]) return;
    const price = nz(OVERSEERS[oid]?.cost, Infinity);
    const ok = await withdrawTy(price);
    if (ok) {
      saveState({ ...state, overseers: { ...state.overseers, [oid]: true } });
    }
  };

  /* ---------- guard while wallet/storage loads ---------- */
  if (walletLoading || loadingSave) {
    return (
      <View style={{ flex: 1, backgroundColor: BG, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ color: SUB, marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  /* ---------- render ---------- */
  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>💸 Business Logic</Text>
        <Pressable onPress={onExit}>
          <IconButton icon="close" iconColor={SUB} size={22} />
        </Pressable>
      </View>

      <View style={styles.balanceRow}>
        <Text style={styles.balanceLabel}>Ty-Cash:</Text>
        <Text style={styles.balanceVal}>{fmt(tyCash)}</Text>
        <Text style={styles.perSec}>  (+{fmt(perSec)}/s)</Text>
      </View>

      {/* big tabs */}
      <View style={{ flexDirection: "row", marginHorizontal: 16, marginBottom: 10 }}>
        <Chip style={chipLg} selected={tab === "biz"} onPress={() => setTab("biz")} selectedColor={ACCENT}>
          Businesses
        </Chip>
        <Chip style={chipLg} selected={tab === "man"} onPress={() => setTab("man")} selectedColor={ACCENT}>
          Overseers
        </Chip>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* ---------- BUSINESSES ---------- */}
        {tab === "biz" &&
          BUSINESSES.map((b) => {
            const bs = state.biz[b.id] ?? { lvl: 0, running: false, timeLeft: 0, total: 0 };
            const lvl = nz(bs.lvl, 0);
            const cycle = lvl > 0 ? pos(b.baseTime / Math.pow(b.costMul, lvl), b.baseTime) : b.baseTime;
            const denom = cycle || 1;
            const progress = bs.running ? 1 - pos(bs.timeLeft, 0) / denom : 0;
            const nextCost = pos(b.baseCost * Math.pow(b.costMul, lvl), b.baseCost);

            return (
              <Card key={b.id} style={styles.card}>
                <Pressable onPress={() => startWork(b)} android_ripple={{ color: "#222" }}>
                  <View style={styles.row}>
                    <Image source={b.img} style={styles.icon72} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bizName}>{b.name}</Text>

                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 2 }}>
                        <Stat label="Lv" val={lvl} />
                        <Stat label="Earn" val={`₹${fmt(lvl * nz(b.baseIncome, 0))}`} />
                        <Stat label="Cost" val={`₹${fmt(nextCost)}`} />
                        <Stat label="Time" val={secFmt(cycle)} />
                      </View>

                      {bs.running && (
                        <ProgressBar
                          progress={Math.min(1, Math.max(0, progress))}
                          color={GOOD}
                          style={{ height: 10, borderRadius: 5, marginTop: 6 }}
                        />
                      )}
                    </View>

                    <Button
                      mode="contained"
                      style={{ width: 84 }}
                      buttonColor={ACCENT}
                      disabled={nextCost > nz(tyCash, 0)}
                      onPress={() => buyBusiness(b)}
                    >
                      Buy{"\n"}₹{fmt(nextCost)}
                    </Button>
                  </View>
                </Pressable>
              </Card>
            );
          })}

        {/* ---------- MANAGERS ---------- */}
        {tab === "man" &&
          BUSINESSES.map((b) => {
            const o = OVERSEERS[b.overseer];
            if (!o) return null;
            const owned = !!state.overseers[b.overseer];
            const price = nz(o.cost, Infinity);
            return (
              <Card key={b.overseer} style={styles.card}>
                <View style={styles.row}>
                  <Image source={o.img} style={styles.managerIcon} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.bizName}>{o.name}</Text>
                    <Text style={styles.sub}>Runs {b.name}</Text>
                  </View>
                  <Button
                    mode={owned ? "outlined" : "contained"}
                    buttonColor={owned ? undefined : GOOD}
                    disabled={owned || price > nz(tyCash, 0)}
                    onPress={() => hire(b.overseer)}
                    style={{ width: 84 }}
                  >
                    {owned ? "Hired" : `Hire\n₹${fmt(price)}`}
                  </Button>
                </View>
              </Card>
            );
          })}
      </ScrollView>
    </View>
  );
}

/* ---------- little stat chip ---------- */
const Stat = ({ label, val }) => (
  <View style={{ backgroundColor: "#222", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
    <Text style={{ color: SUB, fontSize: 10 }}>{label}</Text>
    <Text style={{ color: TEXT, fontWeight: "600", fontSize: 11 }}>{String(val)}</Text>
  </View>
);

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  title: { color: ACCENT, fontSize: 22, fontWeight: "900" },
  balanceRow: { flexDirection: "row", alignItems: "flex-end", paddingHorizontal: 16, marginBottom: 8 },
  balanceLabel: { color: SUB, marginRight: 4 },
  balanceVal: { color: TEXT, fontSize: 24, fontWeight: "800" },
  perSec: { color: GOOD, marginLeft: 8 },
  card: { backgroundColor: CARD, borderRadius: 16, borderWidth: 1, borderColor: BORDER, marginHorizontal: 16, marginBottom: 14, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", padding: 12, gap: 12 },
  icon72: { width: 72, height: 72, borderRadius: 10 },
  managerIcon: { width: 62, height: 62, borderRadius: 31 },
  bizName: { color: TEXT, fontWeight: "700", fontSize: 17 },
  sub: { color: SUB, fontSize: 12 },
});

const chipBase = { marginRight: 10, backgroundColor: "#101010", borderColor: BORDER };
const chipLg = { ...chipBase, height: 42, justifyContent: "center" };
