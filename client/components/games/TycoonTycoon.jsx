// client/components/games/TycoonTycoon.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet, View, ScrollView, Image } from "react-native";
import {
  Text,
  Card,
  Button,
  IconButton,
  Chip,
  ProgressBar,
  ActivityIndicator,
  Divider,
  Snackbar,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ---------- theme ---------- */
const BG = "#000",
  CARD = "#0F0F10",
  CARD_DARK = "#0C0C0C";
const TEXT = "#fff",
  SUB = "#94A3B8",
  ACCENT = "#00C8FF",
  GOOD = "#16a34a",
  WARN = "#f59e0b",
  BORDER = "#1f2937";

/* ---------- utils ---------- */
const nz = (v, f = 0) => (Number.isFinite(+v) ? +v : f);
const pos = (v, f = 0) => Math.max(f, nz(v, f));
const now = () => Date.now();
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

/* ---------- icons ---------- */
const ICONS = {
  coin: require("../../assets/game/icons/icon-currency.png"),
  insurance: require("../../assets/game/icons/icon-insurance.png"),
  tax: require("../../assets/game/icons/icon-tax-audit.png"),
  happy: require("../../assets/game/icons/icon-happy-hour.png"),
  gst: require("../../assets/game/icons/icon-gst-rebate.png"),
  angel: require("../../assets/game/icons/icon-angel-investor.png"),
};

/* ---------- businesses ---------- */
const BUSINESSES = [
  {
    id: "chai",
    name: "Chai Tapri",
    img: require("../../assets/game/businesses/chai-tapri.png"),
    baseCost: 25,
    costMul: 1.07,
    baseIncome: 4,
    baseTime: 1.2,
    overseer: "zolly",
    requires: null,
  },
  {
    id: "kirana",
    name: "Kirana Grocery",
    img: require("../../assets/game/businesses/kirana-grocery.png"),
    baseCost: 120,
    costMul: 1.08,
    baseIncome: 12,
    baseTime: 1.6,
    overseer: "guddu",
    requires: { id: "chai", qty: 20 },
  },
  {
    id: "auto",
    name: "Auto-Rickshaw Fleet",
    img: require("../../assets/game/businesses/auto-fleet.png"),
    baseCost: 480,
    costMul: 1.09,
    baseIncome: 40,
    baseTime: 2.0,
    overseer: "arjun",
    requires: { id: "kirana", qty: 20 },
  },
  {
    id: "dosa",
    name: "Dosa Cart",
    img: require("../../assets/game/businesses/dosa-cart.png"),
    baseCost: 1_600,
    costMul: 1.10,
    baseIncome: 120,
    baseTime: 2.2,
    overseer: "shreya",
    requires: { id: "auto", qty: 20 },
  },
  {
    id: "dairy",
    name: "Dairy Farm",
    img: require("../../assets/game/businesses/dairy-farm.png"),
    baseCost: 4_500,
    costMul: 1.11,
    baseIncome: 320,
    baseTime: 2.6,
    overseer: "paaji",
    requires: { id: "dosa", qty: 20 },
  },
  {
    id: "cowork",
    name: "Co-Working Hub",
    img: require("../../assets/game/businesses/coworking-hub.png"),
    baseCost: 10_000,
    costMul: 1.12,
    baseIncome: 820,
    baseTime: 3.0,
    overseer: "suraj",
    requires: { id: "dairy", qty: 20 },
  },
  {
    id: "solar",
    name: "Solar Park",
    img: require("../../assets/game/businesses/solar-park.png"),
    baseCost: 24_000,
    costMul: 1.12,
    baseIncome: 1_800,
    baseTime: 3.4,
    overseer: "sangeeta",
    requires: { id: "cowork", qty: 20 },
  },
  {
    id: "bollywood",
    name: "Bollywood Studio",
    img: require("../../assets/game/businesses/bollywood-studio.png"),
    baseCost: 55_000,
    costMul: 1.13,
    baseIncome: 3_900,
    baseTime: 3.8,
    overseer: "dev",
    requires: { id: "solar", qty: 20 },
  },
  {
    id: "metro",
    name: "Inter-City Metro",
    img: require("../../assets/game/businesses/metro.png"),
    baseCost: 120_000,
    costMul: 1.14,
    baseIncome: 8_500,
    baseTime: 4.2,
    overseer: "meena",
    requires: { id: "bollywood", qty: 20 },
  },
  {
    id: "space",
    name: "Space-Tech Launchpad",
    img: require("../../assets/game/businesses/space-launchpad.png"),
    baseCost: 260_000,
    costMul: 1.15,
    baseIncome: 18_000,
    baseTime: 5.0,
    overseer: "kapoor",
    requires: { id: "metro", qty: 20 },
  },
];

/* ---------- manager bios ---------- */
const OVERSEERS = {
  zolly: {
    name: "Zolly Chaiwala",
    img: require("../../assets/game/managers/manager-dolly.png"),
    cost: 1_000,
    bio: "Knows every office’s tea-time. Never misses a rush.",
  },
  guddu: {
    name: "Guddu Grocer",
    img: require("../../assets/game/managers/manager-guddu.png"),
    cost: 3_500,
    bio: "Lives by the ledger. Turnover > hoarding.",
  },
  arjun: {
    name: "Auto Arjun",
    img: require("../../assets/game/managers/manager-arjun.png"),
    cost: 8_000,
    bio: "Optimises routes. Fewer idling, more rides.",
  },
  shreya: {
    name: "Chef Shreya",
    img: require("../../assets/game/managers/manager-shreya.png"),
    cost: 16_000,
    bio: "Upsells chutneys like a pro. Margins rise.",
  },
  paaji: {
    name: "Paaji Parminder",
    img: require("../../assets/game/managers/manager-paaji.png"),
    cost: 28_000,
    bio: "Healthy cows, healthy cashflows.",
  },
  suraj: {
    name: "Startup Suraj",
    img: require("../../assets/game/managers/manager-suraj.png"),
    cost: 45_000,
    bio: "Sells seats, not desks. Loves MRR.",
  },
  sangeeta: {
    name: "Sunny Sangeeta",
    img: require("../../assets/game/managers/manager-sangeeta.png"),
    cost: 75_000,
    bio: "Hunts PPAs and hates downtime.",
  },
  dev: {
    name: "Director Dev",
    img: require("../../assets/game/managers/manager-dev.png"),
    cost: 120_000,
    bio: "Diversifies shoots, avoids flop risk.",
  },
  meena: {
    name: "Metro Meena",
    img: require("../../assets/game/managers/manager-meena.png"),
    cost: 180_000,
    bio: "Peak-hour wizard. Trains = cash.",
  },
  kapoor: {
    name: "Commander Kapoor",
    img: require("../../assets/game/managers/manager-kapoor.png"),
    cost: 260_000,
    bio: "Milestone funding, zero launch delays.",
  },
};

const STORE = "@tycoon_save_v6";

/* ---------- speed milestones ---------- */
const MILESTONES = [
  { qty: 20, cut: 0.1 },
  { qty: 50, cut: 0.2 },
  { qty: 100, cut: 0.35 },
  { qty: 200, cut: 0.5 },
  { qty: 500, cut: 0.7 },
];
const minCycle = 0.25;

const buildEmptyBizState = () => {
  const o = {};
  BUSINESSES.forEach((b) => {
    o[b.id] = { qty: 0, running: false, timeLeft: 0, total: 0 };
  });
  return o;
};
const defaultState = () => ({
  coins: 100,
  prestige: { tokens: 0, mult: 1 },
  biz: buildEmptyBizState(),
  overseers: {},
  mods: { happyUntil: 0, gstUntil: 0, insuranceUntil: 0 },
});

const mergeState = (saved) => {
  const base = defaultState();
  if (!saved || typeof saved !== "object") return base;
  const next = {
    ...base,
    coins: nz(saved.coins, base.coins),
    prestige: {
      tokens: nz(saved.prestige?.tokens, 0),
      mult: nz(saved.prestige?.mult, 1),
    },
    mods: {
      happyUntil: nz(saved.mods?.happyUntil, 0),
      gstUntil: nz(saved.mods?.gstUntil, 0),
      insuranceUntil: nz(saved.mods?.insuranceUntil, 0),
    },
    biz: { ...base.biz },
    overseers: {},
  };

  Object.keys(next.biz).forEach((id) => {
    const s = saved.biz?.[id];
    const qty = nz(s?.qty, nz(s?.lvl, 0));
    next.biz[id] = {
      qty,
      running: !!s?.running && qty > 0,
      timeLeft: pos(s?.timeLeft, 0),
      total: pos(s?.total, 0),
    };
  });
  Object.keys(OVERSEERS).forEach((oid) => {
    next.overseers[oid] = !!saved.overseers?.[oid];
  });
  return next;
};

/* ---------- math ---------- */
const timeFor = (b, qty) => {
  let cut = 0;
  for (const m of MILESTONES) {
    if (qty >= m.qty) cut += m.cut;
  }
  cut = Math.min(cut, 0.85);
  return Math.max(b.baseTime * (1 - cut), minCycle);
};
const multiCost = (baseCost, mul, currentQty, n) => {
  if (n <= 0) return 0;
  if (Math.abs(mul - 1) < 1e-9) return baseCost * n;
  const a = baseCost * Math.pow(mul, currentQty);
  return (a * (Math.pow(mul, n) - 1)) / (mul - 1);
};

/* ---------- education ---------- */
const EDU = {
  chai: [
    "Footfall × speed = sales. Shorter brew time = more orders.",
    "Reinvest early to hit first speed milestone (Qty 20).",
  ],
  kirana: [
    "Inventory turnover beats hoarding. Small margins, high volume.",
    "Keep a cash buffer for wholesale discounts.",
  ],
  auto: [
    "Utilisation is king: keep vehicles moving, not waiting.",
    "Routing reduces dead kilometres → better unit economics.",
  ],
  dosa: [
    "Variable costs (batter, gas) vs price. Add-ons lift margin.",
    "Know your break-even: fixed cost ÷ margin per dosa.",
  ],
  dairy: [
    "Working capital heavy; delays hurt. Insurance shields shocks.",
    "Seasonality matters—plan for lean months.",
  ],
  cowork: [
    "Occupancy rate drives MRR. Sell memberships, not chairs.",
    "Free trials convert if churn is low.",
  ],
  solar: [
    "High CapEx, steady cash via PPAs. Downtime kills yield.",
    "Debt + depreciation affect true ROI.",
  ],
  bollywood: [
    "Hit rate is uncertain. Diversify shoots to smooth cashflow.",
    "Front-load marketing only if unit economics justify.",
  ],
  metro: [
    "Scale economics: more riders, lower cost per trip.",
    "Mind debt service vs farebox revenue.",
  ],
  space: [
    "R&D risk and long cycles → milestone funding is vital.",
    "Insurance reduces tail risks on expensive launches.",
  ],
};

/* =================================================================== */
export default function TycoonTycoon({ onExit }) {
  const [state, setState] = useState(defaultState);
  const [loadingSave, setLoadingSave] = useState(true);
  const [tab, setTab] = useState("biz");
  const [buyN, setBuyN] = useState(1);
  const [tipsOpen, setTipsOpen] = useState({});
  const [toast, setToast] = useState("");
  const last = useRef(Date.now());
  const nextEventAt = useRef(now() + 15000);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE);
        const parsed = raw ? JSON.parse(raw) : null;
        setState(mergeState(parsed));
      } finally {
        setLoadingSave(false);
      }
    })();
  }, []);

  const persist = (next) => {
    setState(next);
    AsyncStorage.setItem(STORE, JSON.stringify(next)).catch(() => {});
  };

  /* ---------- tick + tax audit ---------- */
  useEffect(() => {
    const id = setInterval(() => {
      const t = now();
      const dt = (t - last.current) / 1000; // (dt kept if you want animations later)
      last.current = t;

      setState((prev) => {
        let changed = false,
          payoutTotal = 0;
        const next = { ...prev, biz: { ...prev.biz } };
        const happy = t < prev.mods.happyUntil;
        const revMult = prev.prestige.mult * (happy ? 2 : 1);

        BUSINESSES.forEach((b) => {
          const prevBs =
            prev.biz[b.id] ?? { qty: 0, running: false, timeLeft: 0, total: 0 };
          const bs = { ...prevBs };
          const qty = nz(bs.qty, 0);
          const cycle = qty > 0 ? timeFor(b, qty) : b.baseTime;

          if (qty > 0 && prev.overseers[b.overseer] && !bs.running) {
            bs.running = true;
            bs.timeLeft = cycle;
            changed = true;
          }

          if (bs.running) {
            bs.timeLeft = pos(bs.timeLeft - dt, 0);
            if (bs.timeLeft <= 0) {
              const payout = qty * nz(b.baseIncome, 0) * revMult;
              bs.total = pos(bs.total + payout, 0);
              payoutTotal += payout;

              if (prev.overseers[b.overseer]) bs.timeLeft = cycle;
              else {
                bs.running = false;
                bs.timeLeft = 0;
              }
            }
            changed = true;
          }

          next.biz[b.id] = bs;
        });

        if (payoutTotal > 0) {
          next.coins = pos(prev.coins + payoutTotal, 0);
          changed = true;
        }

        // random audit (skipped while insured)
        const insured = t < prev.mods.insuranceUntil;
        if (t >= nextEventAt.current) {
          nextEventAt.current = t + 20000 + Math.floor(Math.random() * 15000);
          if (!insured) {
            const penalty = Math.floor((changed ? next.coins : prev.coins) * 0.1);
            if (penalty > 0) {
              next.coins = pos((changed ? next.coins : prev.coins) - penalty, 0);
              changed = true;
              setTimeout(
                () =>
                  setToast("🧾 Tax Audit: -10% coins. Insurance prevents this."),
                0
              );
            }
          } else {
            setTimeout(
              () => setToast("🛡️ Tax Audit waived: Insurance active."),
              0
            );
          }
        }

        return changed ? next : prev;
      });
    }, 120);
    return () => clearInterval(id);
  }, []);

  /* ---------- derived ---------- */
  const perSec = useMemo(() => {
    return BUSINESSES.reduce((sum, b) => {
      const bs = state.biz[b.id] ?? { qty: 0 };
      const qty = nz(bs.qty, 0);
      if (!qty) return sum;
      const cycle = timeFor(b, qty);
      const happy = now() < state.mods.happyUntil;
      const mult = state.prestige.mult * (happy ? 2 : 1);
      const income = qty * nz(b.baseIncome, 0) * mult;
      return sum + income / cycle;
    }, 0);
  }, [state]);

  const isUnlocked = (b) =>
    !b.requires || (state.biz[b.requires.id]?.qty || 0) >= (b.requires.qty || 1);

  const nextLocked = useMemo(() => {
    for (const b of BUSINESSES) {
      if (!isUnlocked(b)) {
        const need = b.requires;
        const have = nz(state.biz[need.id]?.qty, 0);
        const missing = Math.max(0, need.qty - have);
        const reqBiz = BUSINESSES.find((x) => x.id === need.id);
        const estCost = Math.ceil(
          multiCost(reqBiz.baseCost, reqBiz.costMul, have, missing)
        );
        return { b, need, have, missing, estCost, reqBiz };
      }
    }
    return null;
  }, [state]);

  /* ---------- spend with GST rebate ---------- */
  const spend = (coins, cost) => {
    const after = coins - cost;
    if (after < 0) return { ok: false, coins };
    let back = 0;
    if (now() < state.mods.gstUntil) {
      back = Math.floor(cost * 0.25);
    }
    return { ok: true, coins: after + back, rebate: back };
  };

  /* ---------- actions ---------- */
  const buyBusiness = (b) => {
    const bs = state.biz[b.id] ?? { qty: 0 };
    const qty = nz(bs.qty, 0);
    const cost = Math.ceil(multiCost(b.baseCost, b.costMul, qty, buyN));
    const s = spend(state.coins, cost);
    if (!s.ok) return;
    const nextQty = qty + buyN;
    const next = {
      ...state,
      coins: s.coins,
      biz: { ...state.biz, [b.id]: { ...bs, qty: nextQty } },
    };
    persist(next);
    if (s.rebate > 0) setToast(`🧾 GST Rebate: +₹${fmt(s.rebate)} back`);
  };
  const startWork = (b) => {
    const bs =
      state.biz[b.id] ?? { qty: 0, running: false, timeLeft: 0, total: 0 };
    const qty = nz(bs.qty, 0);
    if (!qty || bs.running) return;
    const cycle = timeFor(b, qty);
    persist({
      ...state,
      biz: { ...state.biz, [b.id]: { ...bs, running: true, timeLeft: cycle } },
    });
  };
  const hire = (oid) => {
    if (state.overseers[oid]) return;
    const price = nz(OVERSEERS[oid]?.cost, Infinity);
    const s = spend(state.coins, price);
    if (!s.ok) return;
    persist({
      ...state,
      coins: s.coins,
      overseers: { ...state.overseers, [oid]: true },
    });
    if (s.rebate > 0) setToast(`🧾 GST Rebate: +₹${fmt(s.rebate)} back`);
  };
  const activateHappyHour = () => {
    const cost = 500;
    const s = spend(state.coins, cost);
    if (!s.ok) return;
    persist({
      ...state,
      coins: s.coins,
      mods: { ...state.mods, happyUntil: now() + 60000 },
    });
    if (s.rebate > 0) setToast(`🧾 GST Rebate: +₹${fmt(s.rebate)} back`);
  };
  const activateGST = () => {
    const cost = 300;
    const s = spend(state.coins, cost);
    if (!s.ok) return;
    persist({
      ...state,
      coins: s.coins,
      mods: { ...state.mods, gstUntil: now() + 60000 },
    });
    if (s.rebate > 0) setToast(`🧾 GST Rebate: +₹${fmt(s.rebate)} back`);
  };
  const buyInsurance = () => {
    const cost = 800;
    const s = spend(state.coins, cost);
    if (!s.ok) return;
    persist({
      ...state,
      coins: s.coins,
      mods: { ...state.mods, insuranceUntil: now() + 10 * 60 * 1000 },
    });
    if (s.rebate > 0) setToast(`🧾 GST Rebate: +₹${fmt(s.rebate)} back`);
  };
  const prestige = () => {
    const threshold = 250_000;
    if (state.coins < threshold) {
      setToast("👼 Need ₹250k to Prestige. Resets progress, keeps +20%/token.");
      return;
    }
    const tokens = state.prestige.tokens + 1;
    const mult = 1 + 0.2 * tokens;
    persist({
      coins: 100,
      prestige: { tokens, mult },
      biz: buildEmptyBizState(),
      overseers: {},
      mods: { happyUntil: 0, gstUntil: 0, insuranceUntil: 0 },
    });
    setToast("👼 Angel Investor joined: +20% permanent income.");
  };

  /* ---------- timers ---------- */
  const timeLeft = (until) => Math.max(0, Math.ceil((until - now()) / 1000));
  const happyLeft = timeLeft(state.mods.happyUntil);
  const gstLeft = timeLeft(state.mods.gstUntil);
  const insLeft = timeLeft(state.mods.insuranceUntil);

  /* ---------- helper UI pieces ---------- */
  const BoosterBtn = ({ bg, icon, title, sub, onPress }) => (
    <Button
      mode="contained"
      style={styles.boostBtn}
      contentStyle={{ height: 44 }}
      buttonColor={bg}
      uppercase={false}
      onPress={onPress}
    >
      <View style={styles.boostInner}>
        <Image source={icon} style={styles.boostIcon} />
        <View style={{ flex: 1 }}>
          <Text style={styles.boostTitle}>{title}</Text>
          <Text style={styles.boostSub}>{sub}</Text>
        </View>
      </View>
    </Button>
  );

  const BuyCTA = ({ lockedText, canBuy, qty, cost, onPress }) => (
    <Button
      mode="contained"
      style={styles.ctaBuyBtn}
      contentStyle={styles.ctaBuyContent}
      buttonColor={canBuy ? ACCENT : "#2a2a2a"}
      disabled={!canBuy}
      uppercase={false}
      onPress={onPress}
    >
      <View style={styles.ctaRow}>
        <Image source={ICONS.coin} style={{ width: 18, height: 18, marginRight: 8 }} />
        <View>
          <Text style={styles.ctaTitle}>
            {lockedText ? "Locked" : `Buy ×${qty}`}
          </Text>
          <Text style={styles.ctaSub}>
            {lockedText ? lockedText : `₹${fmt(cost)}`}
          </Text>
        </View>
      </View>
    </Button>
  );

  /* ---------- render ---------- */
  if (loadingSave) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: BG,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator />
        <Text style={{ color: SUB, marginTop: 8 }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: BG }}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.title}>💸 Business Logic</Text>
        <IconButton icon="close" iconColor={SUB} size={22} onPress={onExit} />
      </View>

      {/* balance + prestige */}
      <View style={styles.balanceRow}>
        <Image source={ICONS.coin} style={{ width: 20, height: 20, marginRight: 8 }} />
        <Text style={styles.balanceVal}>₹{fmt(state.coins)}</Text>
        <Text style={styles.perSec}> (+₹{fmt(perSec)}/s)</Text>
        {!!state.prestige.tokens && (
          <Text style={{ color: SUB, marginLeft: 10 }}>
            • Prestige x{state.prestige.mult.toFixed(1)}
          </Text>
        )}
        <Button
          mode="outlined"
          compact
          style={{ marginLeft: "auto", borderRadius: 999 }}
          textColor={ACCENT}
          uppercase={false}
          onPress={prestige}
        >
          <Image source={ICONS.angel} style={{ width: 16, height: 16, marginRight: 6 }} />{" "}
          Prestige
        </Button>
      </View>

      {/* boosters */}
      <View style={styles.boostersWrap}>
        <BoosterBtn
          bg={GOOD}
          icon={ICONS.happy}
          title="Happy Hour x2"
          sub={happyLeft ? `${happyLeft}s left` : "₹500 for 60s"}
          onPress={activateHappyHour}
        />
        <BoosterBtn
          bg={WARN}
          icon={ICONS.gst}
          title="GST Rebate 25%"
          sub={gstLeft ? `${gstLeft}s left` : "₹300 for 60s"}
          onPress={activateGST}
        />
        <BoosterBtn
          bg="#0ea5e9"
          icon={ICONS.insurance}
          title="Insurance (All Shops)"
          sub={insLeft ? `${insLeft}s left` : "₹800 for 10m"}
          onPress={buyInsurance}
        />
      </View>

      {/* tabs + buy size */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: 16,
          marginBottom: 10,
        }}
      >
        <Chip
          style={chipLg}
          selected={tab === "biz"}
          onPress={() => setTab("biz")}
          selectedColor={ACCENT}
          mode="outlined"
        >
          Businesses
        </Chip>
        <Chip
          style={chipLg}
          selected={tab === "man"}
          onPress={() => setTab("man")}
          selectedColor={ACCENT}
          mode="outlined"
        >
          Overseers
        </Chip>
        {tab === "biz" && (
          <View style={{ flexDirection: "row", marginLeft: "auto", flexWrap: "wrap" }}>
            {[1, 10, 20, 50, 100].map((n) => (
              <Chip
                key={n}
                selected={buyN === n}
                onPress={() => setBuyN(n)}
                style={chipSm}
                selectedColor={ACCENT}
                mode="outlined"
              >
                ×{n}
              </Chip>
            ))}
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 220 }}>
        {/* Roadmap */}
        {tab === "biz" && nextLocked && (
          <Card style={styles.roadCard}>
            <Text style={styles.roadTitle}>Roadmap</Text>
            <Text style={styles.roadText}>
              Next unlock: <Text style={styles.roadStrong}>{nextLocked.b.name}</Text>
            </Text>
            <Text style={styles.roadText}>
              Requirement: {nextLocked.reqBiz.name} Qty {nextLocked.need.qty} • You:{" "}
              {nextLocked.have}
            </Text>
            <Text style={styles.roadText}>
              Est. coins to reach requirement:{" "}
              <Text style={styles.roadStrong}>₹{fmt(nextLocked.estCost)}</Text>
            </Text>
            <Text style={styles.roadText}>
              First unit price after unlock:{" "}
              <Text style={styles.roadStrong}>₹{fmt(nextLocked.b.baseCost)}</Text>
            </Text>
            <Divider style={{ backgroundColor: BORDER, marginVertical: 10 }} />
            <Text style={styles.eduLine}>
              🎓 Plan spending using geometric-series bulk costs and milestone speed-ups
              (20/50/100…).
            </Text>
          </Card>
        )}

        {/* ---------- BUSINESSES ---------- */}
        {tab === "biz" &&
          BUSINESSES.map((b) => {
            const bs =
              state.biz[b.id] ?? { qty: 0, running: false, timeLeft: 0, total: 0 };
            const qty = nz(bs.qty, 0);
            const cycle = timeFor(b, qty);
            const denom = cycle || 1;
            const progress = bs.running
              ? Math.min(1, Math.max(0, 1 - pos(bs.timeLeft, 0) / denom))
              : 0;
            const bulkCost = Math.ceil(multiCost(b.baseCost, b.costMul, qty, buyN));
            const unlocked = isUnlocked(b);
            const affordable = bulkCost <= nz(state.coins, 0);
            const nextMs = MILESTONES.find((m) => qty < m.qty);
            const nextMsTxt = nextMs
              ? `Next speed-up at ${nextMs.qty} (−${Math.round(nextMs.cut * 100)}% time)`
              : "Max speed-up reached";
            const open = !!tipsOpen[b.id];

            const lockedText =
              !unlocked && b.requires
                ? `${
                    BUSINESSES.find((x) => x.id === b.requires.id)?.name || b.requires.id
                  } Qty ${b.requires.qty}`
                : null;

            return (
              <Card key={b.id} style={styles.cardXl}>
                {/* header row */}
                <View style={styles.topRow}>
                  <Image source={b.img} style={styles.icon120} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.bizName}>{b.name}</Text>
                    <View style={styles.statRow}>
                      <StatBig label="Qty" val={qty} />
                      <StatBig label="Earn" val={`₹${fmt(qty * nz(b.baseIncome, 0))}/cycle`} />
                      <StatBig label="Time" val={secFmt(cycle)} />
                    </View>
                  </View>
                </View>

                {/* progress */}
                {bs.running ? (
                  <ProgressBar
                    progress={progress}
                    color={GOOD}
                    style={{ height: 12, borderRadius: 6, marginTop: 14, backgroundColor: "#0f172a" }}
                  />
                ) : null}

                {/* small actions: Start + Learn */}
                <View style={styles.smallActions}>
                  <Button
                    mode="outlined"
                    style={styles.smallBtn}
                    contentStyle={styles.smallContent}
                    labelStyle={styles.secondaryLabel}
                    disabled={!qty || bs.running}
                    textColor={qty && !bs.running ? GOOD : SUB}
                    uppercase={false}
                    onPress={() => startWork(b)}
                  >
                    {bs.running ? "Running…" : qty ? "Start" : "Buy first"}
                  </Button>

                  <Button
                    mode="outlined"
                    style={styles.smallBtn}
                    contentStyle={styles.smallContent}
                    labelStyle={styles.secondaryLabel}
                    uppercase={false}
                    onPress={() => setTipsOpen((p) => ({ ...p, [b.id]: !p[b.id] }))}
                  >
                    {open ? "Hide" : "Learn"}
                  </Button>
                </View>

                {/* BUY CTA (full-width bottom) */}
                <BuyCTA
                  lockedText={lockedText}
                  canBuy={unlocked && affordable}
                  qty={buyN}
                  cost={bulkCost}
                  onPress={() => buyBusiness(b)}
                />

                {/* tips */}
                {open ? (
                  <View style={{ marginTop: 14 }}>
                    <Divider style={{ backgroundColor: BORDER, marginBottom: 12 }} />
                    {EDU[b.id]?.map((line, idx) => (
                      <Text key={idx} style={styles.tipLine}>
                        • {line}
                      </Text>
                    ))}
                    <Text style={[styles.tipLine, { color: SUB, marginTop: 6 }]}>{nextMsTxt}</Text>
                  </View>
                ) : null}

                {!unlocked && b.requires && (
                  <View style={{ marginTop: 14 }}>
                    <Divider style={{ backgroundColor: BORDER, marginBottom: 8 }} />
                    <Text style={styles.lockHint}>
                      Unlock after{" "}
                      {BUSINESSES.find((x) => x.id === b.requires.id)?.name || b.requires.id}{" "}
                      reaches Qty {b.requires.qty}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}

        {/* ---------- OVERSEERS ---------- */}
        {tab === "man" &&
          BUSINESSES.map((b) => {
            const o = OVERSEERS[b.overseer];
            if (!o) return null;
            const owned = !!state.overseers[b.overseer];
            const price = nz(o.cost, Infinity);
            const qty = nz(state.biz[b.id]?.qty, 0);
            const managerUnlocked = qty >= 1;
            const affordable = price <= nz(state.coins, 0);

            return (
              <Card key={b.overseer} style={styles.cardMgr}>
                <View style={styles.topRowMgr}>
                  <Image source={o.img} style={styles.managerIcon} />
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.bizName}>{o.name}</Text>
                    <Text style={styles.sub}>{o.bio}</Text>
                    <Text style={[styles.sub, { marginTop: 4 }]}>Auto-runs: {b.name}</Text>
                    {owned && <Text style={[styles.sub, { color: GOOD, marginTop: 6 }]}>Active ✓</Text>}
                  </View>
                  <Button
                    mode={owned ? "outlined" : "contained"}
                    style={styles.mgrBtn}
                    contentStyle={styles.mgrContent}
                    buttonColor={!owned && managerUnlocked && affordable ? GOOD : CARD_DARK}
                    textColor={owned ? SUB : "#000"}
                    disabled={!managerUnlocked || owned || !affordable}
                    uppercase={false}
                    onPress={() => hire(b.overseer)}
                  >
                    {owned ? "Hired" : `Hire ₹${fmt(price)}`}
                  </Button>
                </View>
                {!managerUnlocked && (
                  <View style={{ marginTop: 10 }}>
                    <Divider style={{ backgroundColor: BORDER, marginBottom: 8 }} />
                    <Text style={styles.lockHint}>Unlock when {b.name} has Qty ≥ 1</Text>
                  </View>
                )}
              </Card>
            );
          })}
      </ScrollView>

      {/* edu footer */}
      <View style={styles.footerEdu}>
        <Image source={ICONS.tax} style={{ width: 18, height: 18, marginRight: 6 }} />
        <Text style={styles.footerEduText}>
          Random <Text style={styles.bold}>Tax Audit</Text> may deduct 10% coins. Buy{" "}
          <Text style={styles.bold}>Insurance</Text> to cover all shops for 10 minutes.
        </Text>
      </View>

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast("")}
        duration={2200}
        style={{ backgroundColor: "#0b0b0b" }}
      >
        <Text style={{ color: TEXT }}>{toast}</Text>
      </Snackbar>
    </View>
  );
}

/* ---------- stat chips ---------- */
const StatBig = ({ label, val }) => (
  <View
    style={{
      backgroundColor: "#151515",
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
      marginRight: 8,
      marginTop: 6,
    }}
  >
    <Text style={{ color: SUB, fontSize: 11 }}>{label}</Text>
    <Text style={{ color: TEXT, fontWeight: "700", fontSize: 14 }}>{String(val)}</Text>
  </View>
);

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 6,
  },
  title: { color: ACCENT, fontSize: 24, fontWeight: "900" },

  balanceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 10,
    gap: 8,
  },
  balanceVal: { color: TEXT, fontSize: 24, fontWeight: "800" },
  perSec: { color: GOOD, marginLeft: 6 },

  boostersWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  boostBtn: { borderRadius: 14, flexGrow: 1, minWidth: 160 },
  boostInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  boostIcon: { width: 16, height: 16 },
  boostTitle: { color: TEXT, fontWeight: "800", fontSize: 13, lineHeight: 16 },
  boostSub: { color: "#e5e7eb", fontSize: 11, lineHeight: 14 },

  roadCard: {
    backgroundColor: CARD,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 14,
    padding: 14,
  },
  roadTitle: { color: TEXT, fontSize: 16, fontWeight: "800", marginBottom: 6 },
  roadText: { color: SUB, fontSize: 13, marginTop: 2 },
  roadStrong: { color: TEXT, fontWeight: "800" },
  eduLine: { color: TEXT },

  cardXl: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
  },
  topRow: { flexDirection: "row", alignItems: "center" },
  icon120: { width: 120, height: 120, borderRadius: 16, backgroundColor: "#0f0f0f" },
  bizName: { color: TEXT, fontWeight: "800", fontSize: 20 },

  statRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },

  /* NEW: small actions row + big BUY CTA */
  smallActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  smallBtn: { flex: 1, borderRadius: 12, borderColor: BORDER },
  smallContent: { height: 44, justifyContent: "center" },

  ctaBuyBtn: { borderRadius: 14, marginTop: 12 },
  ctaBuyContent: { height: 56, justifyContent: "center" },
  ctaRow: { flexDirection: "row", alignItems: "center", justifyContent: "center" },
  ctaTitle: { color: TEXT, fontWeight: "900", fontSize: 16, textAlign: "center", lineHeight: 18 },
  ctaSub: { color: "#e5e7eb", fontSize: 12, textAlign: "center", marginTop: 2 },

  lockHint: { color: SUB, textAlign: "center" },

  /* managers */
  cardMgr: {
    backgroundColor: CARD,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
  },
  topRowMgr: { flexDirection: "row", alignItems: "center" },
  managerIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: "#0f0f0f" },
  mgrBtn: { borderRadius: 14, width: 150 },
  mgrContent: { height: 52, justifyContent: "center" },

  /* footer education */
  footerEdu: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#0B0B0C",
    borderTopWidth: 1,
    borderTopColor: "#121212",
  },
  footerEduText: { color: SUB, flex: 1 },

  /* minor helpers */
  tipLine: { color: SUB, fontSize: 13 },
  bold: { color: TEXT, fontWeight: "800" },
});

/* ---------- chips ---------- */
const chipBase = {
  marginRight: 10,
  backgroundColor: "#101010",
  borderColor: BORDER,
  borderWidth: 1,
};
const chipLg = { ...chipBase, height: 42, justifyContent: "center", borderRadius: 999, paddingHorizontal: 12 };
const chipSm = {
  ...chipBase,
  height: 36,
  justifyContent: "center",
  borderRadius: 999,
  paddingHorizontal: 10,
  marginLeft: 6,
};
