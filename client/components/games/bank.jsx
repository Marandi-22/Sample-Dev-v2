// client/app/(tabs)/bank.jsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Animated,
  Easing,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  Chip,
  Button,
  TextInput,
  Divider,
  IconButton,
  Snackbar,
} from "react-native-paper";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useWallet } from "../../context/WalletContext";

/* palette */
const BG = "#000000",
  CARD = "#111111",
  TEXT = "#FFFFFF",
  SUB = "#9CA3AF",
  ACC = "#00C8FF",
  BORDER = "#1F2937",
  WARN = "#EF4444";

/* storage (bank only) */
const STORE_KEY = "@bank_data_v1";
const readStore = async () => {
  const raw = await AsyncStorage.getItem(STORE_KEY);
  return raw ? JSON.parse(raw) : { bank: 0, fds: [], txns: [] };
};
const writeStore = async (patch) => {
  const cur = await readStore();
  const next = { ...cur, ...patch };
  await AsyncStorage.setItem(STORE_KEY, JSON.stringify(next));
  return next;
};

/* FD presets */
const RATES = [
  { label: "3 mo", months: 3, rate: 5 },
  { label: "8 mo", months: 8, rate: 6.5 },
  { label: "1 yr", months: 12, rate: 7.5 },
  { label: "2 yr", months: 24, rate: 8.5 },
  { label: "3 yr", months: 36, rate: 9.5 },
];
const fdId = () => `fd_${Date.now()}`;

/* ─────────────────────────────────────────── */
export default function Banking() {
  /* shared wallet ctx */
  const { balance: wallet, deposit, withdraw } = useWallet();

  /* bank data */
  const [bankData, setBankData] = useState({ bank: 0, fds: [], txns: [] });
  const loadBank = useCallback(async () => setBankData(await readStore()), []);
  useEffect(() => {
    loadBank();
  }, [loadBank]);

  /* UI state */
  const [tab, setTab] = useState("Overview");
  const [toast, setToast] = useState("");

  /* header coin spin */
  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
        easing: Easing.linear,
      })
    ).start();
  }, [spin]);

  const totalWorth =
    wallet + bankData.bank + bankData.fds.reduce((s, f) => s + f.amount, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* neon header */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.header}>NeoBank&nbsp;X</Text>
          <Animated.Text
            style={[
              styles.coin,
              {
                transform: [
                  {
                    rotate: spin.interpolate({
                      inputRange: [0, 1],
                      outputRange: ["0deg", "360deg"],
                    }),
                  },
                  { scale: 0.9 },
                ],
              },
            ]}
          >
            🪙
          </Animated.Text>
        </View>

        {/* summary tiles */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <Tile label="Wallet" value={wallet} />
          <Tile label="Bank" value={bankData.bank} />
          <Tile label="Total" value={totalWorth} color="#16a34a" />
        </View>

        {/* chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginBottom: 12 }}
        >
          {["Overview", "Banking", "Fixed Deposits", "History"].map((t) => (
            <Chip
              key={t}
              selected={tab === t}
              style={chip}
              selectedColor={ACC}
              onPress={() => setTab(t)}
              mode="outlined"
            >
              {t}
            </Chip>
          ))}
        </ScrollView>

        {tab === "Overview" && <OverviewPane data={{ wallet, ...bankData }} />}

        {tab === "Banking" && (
          <BankPane
            wallet={wallet}
            bank={bankData.bank}
            onUpdate={async (dWallet, dBank) => {
              /* returns ok boolean */
              if (dWallet < 0) {
                const ok = await withdraw(-dWallet);
                if (!ok) return false;
              } else if (dWallet > 0) await deposit(dWallet);

              const next = await writeStore({ bank: dBank });
              setBankData(next);
              return true;
            }}
            onToast={setToast}
          />
        )}

        {tab === "Fixed Deposits" && (
          <FdPane
            wallet={wallet}
            data={bankData}
            onWalletChange={async (delta) => {
              if (delta < 0) {
                const ok = await withdraw(-delta);
                return ok;
              }
              await deposit(delta);
              return true;
            }}
            onBankChange={async (patch) => {
              const next = await writeStore(patch);
              setBankData(next);
            }}
            onToast={setToast}
          />
        )}

        {tab === "History" && <HistoryPane txns={bankData.txns} />}
      </ScrollView>

      <Snackbar
        visible={!!toast}
        onDismiss={() => setToast("")}
        duration={1800}
        style={{ backgroundColor: "#0F0F0F" }}
      >
        <Text style={{ color: TEXT }}>{toast}</Text>
      </Snackbar>
    </SafeAreaView>
  );
}

/* ── COMPONENTS ─────────────────────────────────────── */
function Tile({ label, value, color = ACC }) {
  return (
    <Card style={[styles.tile, { borderColor: color }]}>
      <LinearGradient
        colors={[`${color}44`, `${color}11`]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <Card.Content>
        <Text style={[styles.tileLabel, { color }]}>{label}</Text>
        <Text style={styles.tileValue}>₹{value.toLocaleString()}</Text>
      </Card.Content>
    </Card>
  );
}

function OverviewPane({ data }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.h}>Account Summary</Text>
        <Row label="Wallet Cash" val={data.wallet} />
        <Row label="Bank Savings" val={data.bank} />
        <Row label="Fixed Deposits" val={`${data.fds.length} active`} />
        <Divider style={div} />
        <Row
          label="Total Worth"
          val={data.wallet + data.bank + data.fds.reduce((s, f) => s + f.amount, 0)}
          bold
        />
      </Card.Content>
    </Card>
  );
}

/* deposit / withdraw */
function BankPane({ wallet, bank, onUpdate, onToast }) {
  const [mode, setMode] = useState("Deposit");
  const [amt, setAmt] = useState("");
  const quick = [500, 1000, 5000, 10000];

  async function act() {
    const n = +amt;
    if (!n) return;

    if (mode === "Deposit") {
      if (n > wallet) return onToast("Not enough in wallet");
      const ok = await onUpdate(-n, bank + n);
      ok && onToast("Deposited!");
    } else {
      if (n > bank) return onToast("Not enough in bank");
      const ok = await onUpdate(+n, bank - n);
      ok && onToast("Withdrawn!");
    }
    setAmt("");
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.h}>Bank Counter</Text>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          {["Deposit", "Withdraw"].map((m) => (
            <Button
              key={m}
              mode={mode === m ? "contained" : "outlined"}
              buttonColor={mode === m ? ACC : undefined}
              textColor={mode === m ? "#000" : ACC}
              onPress={() => setMode(m)}
            >
              {m}
            </Button>
          ))}
        </View>
        <Row label="Wallet Cash" val={wallet} />
        <Row label="Bank Balance" val={bank} mb={12} />
        <TextInput
          label="Amount (₹)"
          value={amt}
          onChangeText={setAmt}
          keyboardType="numeric"
          mode="outlined"
          style={input}
          outlineStyle={oStyle}
          activeOutlineColor={ACC}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
          {quick.map((q) => (
            <Chip
              key={q}
              onPress={() => setAmt(String(q))}
              style={chip}
              selectedColor={ACC}
              mode="outlined"
            >
              ₹{q}
            </Chip>
          ))}
        </View>
        <Button
          mode="contained"
          buttonColor={ACC}
          textColor="#000"
          style={{ marginTop: 14 }}
          onPress={act}
        >
          {mode} Rupees
        </Button>
      </Card.Content>
    </Card>
  );
}

/* FD pane with animated bar */
function FdPane({ wallet, data, onWalletChange, onBankChange, onToast }) {
  const [amount, setAmount] = useState("");
  const [plan, setPlan] = useState(RATES[0]);

  /* animated bar */
  const barW = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const pct = Math.min(1, Math.max(0, (+amount || 0) / (wallet || 1)));
    Animated.spring(barW, {
      toValue: pct,
      useNativeDriver: false,
      stiffness: 120,
      damping: 14,
    }).start();
  }, [amount, wallet, barW]);

  const interest = (+amount || 0) * plan.rate * plan.months / 1200;
  const maturity = (+amount || 0) + interest;

  async function createFD() {
    const n = +amount;
    if (!n || n > wallet) return onToast("Invalid amount");

    const ok = await onWalletChange(-n);
    if (!ok) return;

    const mat = new Date();
    mat.setMonth(mat.getMonth() + plan.months);

    const fd = {
      id: fdId(),
      amount: n,
      rate: plan.rate,
      months: plan.months,
      created: Date.now(),
      maturity: mat.getTime(),
    };

    const next = {
      fds: [fd, ...data.fds],
      txns: [
        { id: `t_${Date.now()}`, change: -n, reason: "FD create", ts: Date.now() },
        ...data.txns,
      ].slice(0, 200),
    };
    await onBankChange(next);
    setAmount("");
    onToast("FD created!");
  }

  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.h}>New Fixed Deposit</Text>

        <TextInput
          label="Amount (₹)"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          mode="outlined"
          style={input}
          outlineStyle={oStyle}
          activeOutlineColor={ACC}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={{ marginVertical: 8 }}
        >
          {RATES.map((o) => (
            <Chip
              key={o.label}
              selected={plan.label === o.label}
              onPress={() => setPlan(o)}
              style={chip}
              selectedColor={ACC}
              mode="outlined"
            >
              {o.label} · {o.rate}%
            </Chip>
          ))}
        </ScrollView>

        {!!amount && (
          <Card style={{ backgroundColor: "#101010", borderColor: BORDER, borderWidth: 1 }}>
            <Card.Content>
              <Row label="Principal" val={+amount} />
              <Row label="Rate" text={`${plan.rate}% p.a.`} />
              <Row label="Duration" text={`${plan.months} months`} />
              <Row label="Interest" val={interest} positive />
              <Row label="Maturity" val={maturity} bold />
              <View style={barWrap}>
                <Animated.View
                  style={[
                    barFill,
                    {
                      width: barW.interpolate({
                        inputRange: [0, 1],
                        outputRange: ["0%", "100%"],
                      }),
                    },
                  ]}
                />
              </View>
            </Card.Content>
          </Card>
        )}

        <Button
          mode="contained"
          buttonColor={ACC}
          textColor="#000"
          style={{ marginTop: 12 }}
          onPress={createFD}
          disabled={!amount}
        >
          Create FD
        </Button>

        {data.fds.length > 0 && (
          <>
            <Divider style={div} />
            <Text style={styles.h}>Your FDs ({data.fds.length})</Text>
            {data.fds.map((fd) => (
              <Card
                key={fd.id}
                style={{
                  backgroundColor: "#101010",
                  borderColor: BORDER,
                  borderWidth: 1,
                  marginTop: 8,
                }}
              >
                <Card.Content>
                  <Row label="Principal" val={fd.amount} />
                  <Row label="Rate" text={`${fd.rate}%`} />
                  <Row label="Ends" text={new Date(fd.maturity).toLocaleDateString()} />
                </Card.Content>
              </Card>
            ))}
          </>
        )}
      </Card.Content>
    </Card>
  );
}

/* history pane */
function HistoryPane({ txns }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.h}>Recent Transactions</Text>
        {!txns.length && <Text style={{ color: SUB }}>No transactions yet.</Text>}
        {txns.slice(0, 50).map((t) => (
          <View
            key={t.id}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 6,
            }}
          >
            <Text style={{ color: SUB }}>
              {new Date(t.ts).toLocaleDateString()} – {t.reason}
            </Text>
            <Text
              style={{
                color: t.change >= 0 ? "#16a34a" : WARN,
                fontWeight: "600",
              }}
            >
              {t.change >= 0 ? "+" : ""}
              ₹{Math.abs(t.change).toLocaleString()}
            </Text>
          </View>
        ))}
      </Card.Content>
    </Card>
  );
}

/* util row */
function Row({ label, val, text, bold = false, mb = 4, positive = false }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: mb }}>
      <Text style={[{ color: SUB }, bold && { color: TEXT, fontWeight: "700" }]}>{label}</Text>
      {val !== undefined ? (
        <Text
          style={[
            { color: bold ? TEXT : SUB, fontWeight: bold ? "700" : "400" },
            positive && { color: "#16a34a" },
          ]}
        >
          ₹{val.toLocaleString()}
        </Text>
      ) : (
        <Text style={{ color: SUB }}>{text}</Text>
      )}
    </View>
  );
}

/* styles */
const styles = StyleSheet.create({
  header: { color: ACC, fontSize: 24, fontWeight: "900", letterSpacing: 0.5 },
  coin: { fontSize: 54, position: "absolute", right: -24, top: -8 },

  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 14,
  },
  h: { color: TEXT, fontWeight: "700", fontSize: 18, marginBottom: 6 },

  tile: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    overflow: "hidden",
  },
  tileLabel: { fontSize: 12, fontWeight: "700" },
  tileValue: { color: TEXT, fontSize: 24, fontWeight: "800", marginTop: 4 },
});

/* small constants */
const chip = {
  marginRight: 6,
  backgroundColor: "#121212AA",
  borderColor: BORDER,
};
const input = { backgroundColor: "#0B0B0B", color: TEXT, marginTop: 8 };
const oStyle = { borderColor: BORDER };
const div = { backgroundColor: BORDER, marginVertical: 8 };
const barWrap = {
  height: 6,
  backgroundColor: "#222",
  borderRadius: 3,
  overflow: "hidden",
  marginTop: 8,
};
const barFill = { height: "100%", backgroundColor: ACC };
