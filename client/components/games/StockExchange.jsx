/* Stock-Exchange mini-game  •  Aug 2025
   — teach & play with a sandbox portfolio —                            */

import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Chip,
  Button,
  TextInput,
  Divider,
  IconButton,
  Portal,
  Snackbar,
} from "react-native-paper";
import { useWallet } from "../../context/WalletContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as d3 from "d3-shape";
import Svg, { Path, Circle, Text as SvgText } from "react-native-svg";

/* ─────────────────── fake-market seed ──────────────────── */
const SEED_STOCKS = [
  { sym: "ASTR", name: "AsterTech",   price: 1560.4, cap: 1560.4, pe: 29, growth: -1.1 },
  { sym: "VRC",  name: "VerdeCore",   price:  871.2, cap:  871.2, pe: 18, growth:  2.8 },
  { sym: "SUN",  name: "SunArc",      price:  640.9, cap:  640.9, pe: 12, growth:  6.5 },
  { sym: "NGL",  name: "NextGen Labs",price: 1349.6, cap: 1349.6, pe: 24, growth:  4.2 },
];
const STORE = "@stock_game_v2";

/* ─────────────────── helpers ───────────────────────────── */
function sparkPoints(n = 18, base = 1) {
  let y = base;
  return Array(n).fill(0).map((_, i) => {
    if (i) y *= 1 + (Math.random() - 0.5) * 0.12;
    return { x: i, y };
  });
}

/* ─────────────────── theme ─────────────────────────────── */
const COLORS = {
  bg:    "#0B0B0B",
  card:  "#111111",
  text:  "#FFFFFF",
  sub:   "#94A3B8",
  green: "#14F195",
  blue:  "#2563EB",
  red:   "#F43F5E",
  border:"#202937",
};

/* █████████████████████████████████████████████████████████ */
export default function StockExchange({ onExit }) {
  const { balance, deposit, withdraw } = useWallet();

  /* portfolio state ─ persisted */
  const [data, setData] = useState({ portfolio: {}, stocks: SEED_STOCKS });
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORE);
        if (raw) setData(JSON.parse(raw));
      } catch {/* ignore */ }
    })();
  }, []);

  const save = async (next) => {
    setData(next);
    await AsyncStorage.setItem(STORE, JSON.stringify(next));
  };

  /* “market tick” on first mount: nudge prices */
  useEffect(() => {
    const moved = data.stocks.map((s) => {
      const drift = s.price * (Math.random() - 0.48) * 0.03;
      const np = +(s.price + drift).toFixed(2);
      return { ...s, price: np, growth: +(((np - s.price) / s.price) * 100).toFixed(2) };
    });
    save({ ...data, stocks: moved });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* UI state */
  const [topTab, setTopTab] = useState("Market"); // Market | Portfolio
  const [modal, setModal]   = useState(null);     // {type:'trade'|'chart'|'news', stock}
  const [toast, setToast]   = useState("");

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      {/* header */}
      <View style={styles.header}>
        <Text style={styles.logo}>📈 Stock Exchange</Text>
        <Pressable onPress={onExit}>
          <IconButton icon="close" size={20} iconColor={COLORS.sub} />
        </Pressable>
      </View>

      {/* balance pill */}
      <View style={styles.balancePill}>
        <Text style={{ color: COLORS.sub, fontSize: 12 }}>Balance:</Text>
        <Text style={{ color: COLORS.text, fontWeight: "700", marginLeft: 4 }}>
          ₹{balance.toLocaleString()}
        </Text>
      </View>

      {/* top chips */}
      <View style={{ flexDirection: "row", marginTop: 12, marginHorizontal: 16 }}>
        {["Market", "Portfolio"].map((t) => (
          <Chip
            key={t}
            selected={topTab === t}
            style={chip}
            selectedColor={COLORS.green}
            onPress={() => setTopTab(t)}
            mode="outlined"
          >
            {t}
            {t === "Portfolio" && Object.keys(data.portfolio).length
              ? `  ${Object.keys(data.portfolio).length}`
              : ""}
          </Chip>
        ))}
      </View>

      {/* main scroll */}
      <ScrollView contentContainerStyle={{ paddingBottom: 140 }} showsVerticalScrollIndicator={false}>
        {topTab === "Market" && (
          <MarketTable
            stocks={data.stocks}
            onAction={(type, stock) => setModal({ type, stock })}
          />
        )}

        {topTab === "Portfolio" && (
          <PortfolioView
            portfolio={data.portfolio}
            stocks={data.stocks}
            onAction={(type, stock) => setModal({ type, stock })}
          />
        )}
      </ScrollView>

      {/* modal router */}
      <Portal>
        {modal?.type === "trade" && (
          <TradeModal
            stock={modal.stock}
            owned={data.portfolio[modal.stock.sym]}
            balance={balance}
            onClose={() => setModal(null)}
            onTrade={async (qty, total) => {
              /* qty +ve = buy, –ve = sell */
              if (qty > 0 && total > balance) { setToast("Insufficient balance"); return false; }
              if (qty < 0 && (!data.portfolio[modal.stock.sym] || data.portfolio[modal.stock.sym].qty < -qty)) {
                setToast("You don’t own enough shares"); return false;
              }

              /* wallet */
              if (qty > 0) await withdraw(total);
              else await deposit(-total);

              /* portfolio update */
              const cur = data.portfolio[modal.stock.sym] || { qty: 0, avg: 0 };
              const newQty = cur.qty + qty;
              const newAvg = newQty <= 0 ? 0
                : (cur.avg * cur.qty + modal.stock.price * qty) / newQty;

              const nextPort = { ...data.portfolio };
              if (newQty <= 0) delete nextPort[modal.stock.sym];
              else nextPort[modal.stock.sym] = { qty: newQty, avg: newAvg };

              await save({ ...data, portfolio: nextPort });
              setToast(qty > 0 ? "Shares purchased" : "Shares sold");
              return true;
            }}
          />
        )}

        {modal?.type === "chart" && (
          <ChartModal stock={modal.stock} onClose={() => setModal(null)} />
        )}

        {modal?.type === "news" && (
          <NewsModal stock={modal.stock} onClose={() => setModal(null)} />
        )}
      </Portal>

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast("")}
        duration={1800}
        style={{ backgroundColor: "#0F0F0F" }}
      >
        <Text style={{ color: COLORS.text }}>{toast}</Text>
      </Snackbar>
    </View>
  );
}

/* ──────────────── Market table ─────────────────────── */
function MarketTable({ stocks, onAction }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.section}>Market Overview</Text>
        <Divider style={div} />

        {stocks.map((s) => (
          <View key={s.sym} style={row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sym}>{s.name}</Text>
              <Text style={styles.symSub}>{s.sym}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.price}>₹{s.price.toLocaleString()}</Text>
              <Text style={styles.sub}>per share</Text>
            </View>

            <View style={{ width: 70 }}>
              <Text style={[
                styles.growth,
                { color: s.growth >= 0 ? COLORS.green : COLORS.red },
              ]}>
                {s.growth >= 0 ? "+" : ""}
                {s.growth}%
              </Text>
            </View>

            <View style={btnCol}>
              <Button mode="contained" buttonColor={COLORS.green}
                textColor="#000" onPress={() => onAction("trade", s)}>
                Trade
              </Button>
              <Button mode="contained" buttonColor={COLORS.blue}
                style={{ marginTop: 4 }} onPress={() => onAction("chart", s)}>
                Chart
              </Button>
              <Button mode="outlined" style={{ marginTop: 4 }}
                onPress={() => onAction("news", s)}>
                News
              </Button>
            </View>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

/* ──────────────── Portfolio view ───────────────────── */
function PortfolioView({ portfolio, stocks, onAction }) {
  const rows = Object.entries(portfolio).map(([sym, pos]) => {
    const live = stocks.find((s) => s.sym === sym) || {};
    const value = pos.qty * live.price;
    const plPct = ((live.price - pos.avg) / pos.avg) * 100 || 0;
    return { ...pos, ...live, value, plPct };
  });

  const totVal = rows.reduce((s, r) => s + r.value, 0);
  const totPL  = rows.reduce((s, r) => s + (r.livePrice - r.avg) * r.qty, 0);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.section}>Your Portfolio</Text>
        <Divider style={div} />

        {!rows.length && (
          <Text style={{ color: COLORS.sub }}>No holdings yet – explore the market!</Text>
        )}

        {!!rows.length && rows.map((r) => (
          <View key={r.sym} style={row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.sym}>{r.name}</Text>
              <Text style={styles.symSub}>{r.sym}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.price}>{r.qty} shares</Text>
              <Text style={styles.sub}>Avg ₹{r.avg.toFixed(2)}</Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.price}>₹{r.value.toFixed(2)}</Text>
              <Text style={[
                styles.sub,
                { color: r.plPct >= 0 ? COLORS.green : COLORS.red, fontWeight: "600" },
              ]}>
                {r.plPct >= 0 ? "+" : ""}{r.plPct.toFixed(1)}%
              </Text>
            </View>

            <View style={btnCol}>
              <Button mode="contained" buttonColor={COLORS.green}
                textColor="#000" onPress={() => onAction("trade", r)}>
                Trade
              </Button>
              <Button mode="contained" buttonColor={COLORS.blue}
                style={{ marginTop: 4 }} onPress={() => onAction("chart", r)}>
                Chart
              </Button>
            </View>
          </View>
        ))}

        {!!rows.length && (
          <>
            <Divider style={div} />
            <Text style={styles.price}>Total Value  ₹{totVal.toLocaleString()}</Text>
            <Text style={[
              styles.sub,
              { color: totPL >= 0 ? COLORS.green : COLORS.red, fontWeight: "700" },
            ]}>
              {totPL >= 0 ? "+" : ""}{totPL.toFixed(0)}
            </Text>
          </>
        )}
      </Card.Content>
    </Card>
  );
}

/* ──────────────── Trade modal ──────────────────────── */
function TradeModal({ stock, owned = {}, balance, onTrade, onClose }) {
  const [qty, setQty] = useState("1");
  const cost = (+qty || 0) * stock.price;

  async function handle(side) {
    const delta = side === "buy" ? +qty : -qty;
    if (!delta) return;
    const ok = await onTrade(delta, Math.abs(delta) * stock.price);
    if (ok) onClose();
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalWrap}>
        <Card style={modalCard}>
          <Card.Content>
            <ModalHead title={`Trade ${stock.name} Shares`} onClose={onClose} />

            <Row label="Current Price" val={stock.price} />
            <Row label="Shares Owned"  text={owned.qty || 0} mb={8} />

            <TextInput
              label="Quantity"
              value={qty}
              onChangeText={setQty}
              keyboardType="numeric"
              mode="outlined"
              style={input}
              outlineStyle={oStyle}
              activeOutlineColor={COLORS.green}
            />

            <Row label="Total Cost"    val={cost} />
            <Row label="Remaining Balance" val={balance - (cost)} mb={12} />

            <Button mode="contained" buttonColor={COLORS.green}
              textColor="#000" style={{ marginBottom: 6 }}
              onPress={() => handle("buy")} disabled={cost > balance || !qty}>
              Buy
            </Button>
            <Button mode="outlined" textColor={COLORS.green}
              onPress={() => handle("sell")} disabled={!(owned.qty > 0)}>
              Sell
            </Button>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
}

/* ──────────────── Chart modal (10-month view) ───────── */
function ChartModal({ stock, onClose }) {
  const pts = useMemo(() => {
    let v = stock.price;
    return Array.from({ length: 10 }, (_, i) => {
      if (i) v *= 1 + (Math.random() - 0.55) * 0.18;
      return { x: i, y: v };
    });
  }, [stock.price]);

  const W = Dimensions.get("window").width - 64;
  const H = 180;
  const x = i => (i / 9) * W;
  const [min, max] = [
    Math.min(...pts.map(p => p.y)) * 0.96,
    Math.max(...pts.map(p => p.y)) * 1.04,
  ];
  const y = v => H - ((v - min) / (max - min)) * H;

  const path = useMemo(() => (
    d3.line().x((d, i) => x(i)).y(d => y(d.y)).curve(d3.curveMonotoneX)(pts)
  ), [pts]);

  const months = (() => {
    const list = [];
    const now = new Date();
    for (let i = 9; i >= 0; i--) {
      const d = new Date(now);
      d.setMonth(now.getMonth() - i);
      list.push(d.toLocaleString("default", { month: "short" }));
    }
    return list;
  })();

  const pct = ((pts.at(-1).y - pts[0].y) / pts[0].y) * 100;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalWrap}>
        <Card style={modalCard}>
          <Card.Content>
            <ModalHead title={`${stock.name} – Detailed Analysis`} onClose={onClose} />

            <Svg width={W} height={H + 30} style={{ alignSelf: "center", marginBottom: 12 }}>
              {/* grid */}
              {Array.from({ length: 5 }).map((_, i) => (
                <Path key={i} d={`M0 ${(i + 1) * (H / 6)} H${W}`}
                  stroke="#1e293b" strokeWidth={1} />
              ))}

              {/* line + markers */}
              <Path d={path} stroke={COLORS.blue} strokeWidth={2} fill="none" />
              {pts.map((p, i) => (
                <Circle key={i} cx={x(i)} cy={y(p.y)} r={3} fill={COLORS.blue} />
              ))}

              {/* % badge */}
              <SvgText
                fill={pct >= 0 ? COLORS.green : COLORS.red}
                fontSize="12"
                fontWeight="bold"
                x={W - 34}
                y={y(pts.at(-1).y) - 6}
              >
                {pct >= 0 ? "+" : ""}{pct.toFixed(1)}%
              </SvgText>

              {/* month labels */}
              {months.map((m, i) => (
                <SvgText
                  key={m}
                  fill={COLORS.sub}
                  fontSize="10"
                  x={x(i)}
                  y={H + 14}
                  textAnchor="middle"
                >
                  {m}
                </SvgText>
              ))}
            </Svg>

            <Text style={[styles.sub, { lineHeight: 18 }]}>
              This chart shows simulated monthly closes for learning only.
              Past performance is not indicative of future returns.
            </Text>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
}

/* ──────────────── News modal ───────────────────────── */
function NewsModal({ stock, onClose }) {
  const news = `🔔  ${stock.name} announces expansion into new markets – analysts expect revenue boost.`;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={modalWrap}>
        <Card style={modalCard}>
          <Card.Content>
            <ModalHead title={`${stock.name} – Latest News`} onClose={onClose} />
            <View style={{ backgroundColor: "#1e293b", padding: 12, borderRadius: 8 }}>
              <Text style={{ color: COLORS.blue, marginBottom: 4 }}>{news}</Text>
              <Text style={styles.sub}>
                News can significantly impact stock prices. Keep an eye on developments to make informed investment decisions.
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>
    </Modal>
  );
}

/* ──────────────── small shared bits ────────────────── */
const ModalHead = ({ title, onClose }) => (
  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
    <Text style={styles.section}>{title}</Text>
    <IconButton icon="close" size={18} onPress={onClose} />
  </View>
);

function Row({ label, val, text, mb = 6 }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: mb }}>
      <Text style={styles.sub}>{label}</Text>
      {val !== undefined
        ? <Text style={styles.price}>₹{(+val).toLocaleString()}</Text>
        : <Text style={styles.sub}>{text}</Text>}
    </View>
  );
}

/* ──────────────── style objects ────────────────────── */
const styles = StyleSheet.create({
  header: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 16, paddingBottom: 4,
  },
  logo: { color: COLORS.green, fontSize: 22, fontWeight: "900" },
  balancePill: {
    alignSelf: "flex-end",
    marginRight: 16,
    backgroundColor: "#111",
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginTop: 14,
    marginHorizontal: 16,
  },
  section: { color: COLORS.text, fontWeight: "700", fontSize: 18 },
  sym: { color: COLORS.text, fontWeight: "600" },
  symSub: { color: COLORS.sub, fontSize: 11 },
  price: { color: COLORS.text, fontWeight: "600" },
  sub: { color: COLORS.sub, fontSize: 12 },
  sub12: { color: COLORS.sub, fontSize: 12 },
  growth: { fontWeight: "700" },
});

const row = {
  flexDirection: "row", alignItems: "center", paddingVertical: 10,
};
const btnCol = { width: 90 };
const chip = {
  marginRight: 6, backgroundColor: "#121212AA", borderColor: COLORS.border,
};

const input = { backgroundColor: "#0B0B0B", color: COLORS.text, marginTop: 8 };
const oStyle = { borderColor: COLORS.border };
const div = { backgroundColor: COLORS.border, marginVertical: 8 };

const modalWrap = {
  flex: 1, backgroundColor: "rgba(0,0,0,0.7)",
  alignItems: "center", justifyContent: "center",
};
const modalCard = {
  width: "90%", backgroundColor: COLORS.card,
  borderRadius: 16, borderWidth: 1, borderColor: COLORS.border,
  maxHeight: "90%",
};
