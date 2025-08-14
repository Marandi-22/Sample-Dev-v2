// client/components/LifeRibbon.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native";
import { Text, Card, IconButton, SegmentedButtons, Button, Chip } from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import Svg, { Line } from "react-native-svg";

const BG = "#000";
const CARD_BG = "#111111";
const TEXT = "#FFFFFF";
const SUBTEXT = "#9CA3AF";
const ORANGE = "#FF9900";

const EVENTS_KEY = "@fw_life_events_v1";
const K = {
  income: "@fw_life_income",
  savings: "@fw_life_savings",
  spendAuto: "@fw_life_spend",
  autopilot: "@fw_life_autopilot",
  goals: "@fw_goals_v1",
};

function monthsToGoal(goalAmount, savings, netMonthly) {
  const remaining = Math.max(0, Number(goalAmount) - Number(savings));
  if (remaining === 0) return 0;
  if (netMonthly <= 0) return Infinity;
  return Math.ceil(remaining / netMonthly);
}
function monthSums(events) {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  const list = (events || []).filter(e => {
    const d = new Date(e.ts || e.date || Date.now());
    return d.getFullYear() === y && d.getMonth() === m;
  });
  const spend = list.filter(e=>e.type==="spend").reduce((s,e)=>s+Number(e.amount||0),0);
  const invest = list.filter(e=>e.type==="invest").reduce((s,e)=>s+Number(e.amount||0),0);
  const credit = list.filter(e=>e.type==="credit").reduce((s,e)=>s+Number(e.amount||0),0);
  return { spend, invest, credit };
}

export default function LifeRibbon() {
  const router = useRouter();

  // ------- baseline + events + goals -------
  const [vals, setVals] = useState({
    income: 0, savings: 0, spendAuto: 0, autopilot: 0,
    goals: [{ id: "g1", name: "Emergency", amount: 50000 }],
    events: [],
  });

  // initial load
  useEffect(() => {
    (async () => {
      const [income, savings, spendAuto, autopilot, goalsRaw, evRaw] = await Promise.all([
        AsyncStorage.getItem(K.income),
        AsyncStorage.getItem(K.savings),
        AsyncStorage.getItem(K.spendAuto),
        AsyncStorage.getItem(K.autopilot),
        AsyncStorage.getItem(K.goals),
        AsyncStorage.getItem(EVENTS_KEY),
      ]);
      let goals = [];
      try { goals = goalsRaw ? JSON.parse(goalsRaw) : []; } catch {}
      if (!Array.isArray(goals) || goals.length === 0) {
        goals = [{ id: "g1", name: "Emergency", amount: 50000 }];
        await AsyncStorage.setItem(K.goals, JSON.stringify(goals));
      }
      let events = [];
      try { events = evRaw ? JSON.parse(evRaw) : []; } catch {}
      setVals({
        income: Number(income || 0),
        savings: Number(savings || 0),
        spendAuto: Number(spendAuto || 0),
        autopilot: Number(autopilot || 0),
        goals,
        events,
      });
    })();
  }, []);

  // light polling so ribbon reacts to changes
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const [evRaw, goalsRaw] = await Promise.all([
          AsyncStorage.getItem(EVENTS_KEY),
          AsyncStorage.getItem(K.goals),
        ]);
        const events = evRaw ? JSON.parse(evRaw) : [];
        const goals = goalsRaw ? JSON.parse(goalsRaw) : [];
        setVals(v => ({ ...v, events: Array.isArray(events)?events:[], goals: Array.isArray(goals)?goals:[] }));
      } catch {}
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const month = useMemo(() => monthSums(vals.events), [vals.events]);
  const netMonthly = Math.max(0, vals.income - vals.spendAuto - month.spend + vals.autopilot + month.invest + month.credit);
  const goalsView = useMemo(() => vals.goals.map(g => ({
    ...g, months: monthsToGoal(g.amount, vals.savings, netMonthly),
  })), [vals.goals, vals.savings, netMonthly]);

  const [selectedId, setSelectedId] = useState(null);
  useEffect(() => { if (!selectedId && goalsView.length) setSelectedId(goalsView[0].id); }, [goalsView, selectedId]);
  const selected = goalsView.find(g => g.id === selectedId) || goalsView[0];

  // ------- timeline controls (hidden by default) -------
  const [showControls, setShowControls] = useState(false);
  const [unit, setUnit] = useState("mo");    // "day" | "wk" | "mo"
  const [speed, setSpeed] = useState("1x");  // "1x" | "4x" | "20x"
  const [follow, setFollow] = useState(true);
  const unitPx = { day: 18, wk: 24, mo: 36 }[unit];
  const unitToMonths = { day: 1/30.437, wk: 1/4.345, mo: 1 }[unit];
  const basePxPerSec = unitPx / 4;
  const mul = { "1x": 1, "4x": 4, "20x": 20 }[speed];
  const pxPerSec = basePxPerSec * mul;

  // ------- scroll world -------
  const scrRef = useRef(null);
  const [worldWidth, setWorldWidth] = useState(4000);
  const [viewW, setViewW] = useState(Dimensions.get("window").width - 32);
  const centerX = viewW / 2;
  const NOW_X = worldWidth / 2;
  const [offsetX, setOffsetX] = useState(Math.max(0, NOW_X - centerX));

  useEffect(() => {
    const to = Math.max(0, NOW_X - centerX);
    setOffsetX(to);
    scrRef.current?.scrollTo({ x: to, animated: false });
  }, [viewW, worldWidth]);

  // autopan
  useEffect(() => {
    if (!follow) return;
    let running = true;
    let last = Date.now();
    const tick = () => {
      if (!running) return;
      const now = Date.now();
      const dt = (now - last) / 1000; last = now;
      const next = Math.min(worldWidth - viewW, Math.max(0, offsetX + pxPerSec * dt));
      setOffsetX(next);
      scrRef.current?.scrollTo({ x: next, animated: false });
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => { running = false; cancelAnimationFrame(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [follow, pxPerSec, worldWidth, viewW, offsetX]);

  const onUserScroll = (e) => { setFollow(false); setOffsetX(e.nativeEvent.contentOffset.x); };
  const goalX = (months) => {
    const units = isFinite(months) ? (months / unitToMonths) : 9999;
    return NOW_X + (units * unitPx);
  };
  const totalUnits = Math.floor(worldWidth / unitPx);

  const fmtETA = (n) => {
    if (!isFinite(n)) return "Unreachable";
    const y = Math.floor(n / 12), m = n % 12;
    if (y <= 0) return `${m} mo`;
    return m === 0 ? `${y} yr` : `${y} yr ${m} mo`;
  };

  const netSign = vals.autopilot + month.invest + month.credit - (vals.spendAuto + month.spend);
  const netColor = netSign > 0 ? ORANGE : netSign < 0 ? "#EF4444" : SUBTEXT;

  // subtle background motion so it never feels dead
  const flow = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    flow.setValue(0);
    Animated.loop(Animated.timing(flow, { toValue: 1, duration: 7000, easing: Easing.linear, useNativeDriver: true })).start();
  }, [flow]);
  const stripeX = flow.interpolate({ inputRange: [0,1], outputRange: [0, -60] });

  return (
    <Card style={styles.card}>
      <Card.Content>
        {/* Header: title + compact actions */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={styles.title}>Life Ribbon</Text>
            <Text style={styles.sub}>You stay centered. Time scrolls. Flags = goals.</Text>
          </View>
          <IconButton icon="cog" size={20} onPress={() => router.push("/onboarding")} iconColor={SUBTEXT} />
          <IconButton icon={showControls ? "tune-vertical" : "tune"} size={20} onPress={() => setShowControls(s=>!s)} iconColor={SUBTEXT} />
        </View>

        {/* Controls (collapsed by default) */}
        {showControls && (
          <View style={styles.controls}>
            <View style={{ flex: 1 }}>
              <Text style={styles.ctrlLabel}>Scale</Text>
              <SegmentedButtons
                value={unit}
                onValueChange={(v)=>{ setUnit(v); setFollow(true); }}
                density="small"
                buttons={[
                  { label: "Days", value: "day" },
                  { label: "Weeks", value: "wk" },
                  { label: "Months", value: "mo" },
                ]}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.ctrlLabel}>Speed</Text>
              <SegmentedButtons
                value={speed}
                onValueChange={(v)=>{ setSpeed(v); setFollow(true); }}
                density="small"
                buttons={[
                  { label: "1×", value: "1x" },
                  { label: "4×", value: "4x" },
                  { label: "20×", value: "20x" },
                ]}
              />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ justifyContent:"flex-end" }}>
              <Button mode={follow ? "contained" : "outlined"} onPress={()=>setFollow((f)=>!f)}>
                {follow ? "Following" : "Free pan"}
              </Button>
            </View>
          </View>
        )}

        {/* Ribbon viewport */}
        <View
          style={[styles.viewport]}
          onLayout={(e) => {
            const w = e.nativeEvent.layout.width;
            setViewW(w);
            setWorldWidth(Math.max(5000, Math.ceil((w / unitPx) + 200) * unitPx));
          }}
        >
          {/* subtle moving bg */}
          <Animated.View style={[styles.bgStripe, { transform: [{ translateX: stripeX }] }]} />

          <Animated.ScrollView
            ref={scrRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ width: worldWidth, height: 130 }}
            onScroll={onUserScroll}
            scrollEventThrottle={16}
          >
            {/* grid */}
            <Svg width={worldWidth} height={130}>
              <Line x1="0" y1="65" x2={worldWidth} y2="65" stroke="#1F2937" strokeWidth="8" />
              {/* minor ticks */}
              {Array.from({ length: totalUnits }).map((_, i) => {
                const x = i * unitPx;
                return <Line key={`m-${i}`} x1={x} y1="56" x2={x} y2="74" stroke="#232323" strokeWidth="2" />;
              })}
              {/* stronger ticks every 12 months / 8 weeks / 14 days */}
              {Array.from({ length: totalUnits }).map((_, i) => {
                const every = unit === "mo" ? 12 : unit === "wk" ? 8 : 14;
                if (i % every !== 0) return null;
                const x = i * unitPx;
                return <Line key={`M-${i}`} x1={x} y1="50" x2={x} y2="80" stroke="#2E2E2E" strokeWidth="3" />;
              })}
            </Svg>

            {/* flags */}
            {goalsView.map((g) => {
              const x = goalX(g.months);
              return (
                <View key={g.id} style={[styles.flagWrap, { left: x - 56, top: 14 }]}>
                  <View style={[styles.flag, g.id === selectedId && { borderColor: ORANGE }]}>
                    <Text style={styles.flagName} numberOfLines={1}>{g.name}</Text>
                    <Text style={styles.flagAmt}>₹ {Number(g.amount||0).toLocaleString()}</Text>
                    <Text style={[styles.flagEta, g.id === selectedId && { color: ORANGE }]}>{fmtETA(g.months)}</Text>
                  </View>
                  <View style={styles.pole}/>
                  <View style={StyleSheet.absoluteFill} onTouchEnd={() => setSelectedId(g.id)} />
                </View>
              );
            })}
          </Animated.ScrollView>

          {/* YOU marker */}
          <View pointerEvents="none" style={[styles.youWrap, { left: centerX - 1 }]}>
            <View style={styles.youBar}/>
            <View style={styles.youTag}><Text style={styles.youText}>YOU</Text></View>
          </View>
        </View>

        {/* compact legend row */}
        <View style={styles.legendRow}>
          <Text style={styles.legend}>
            <Text style={styles.legendStrong}>{selected?.name || "-"}</Text> · ETA {fmtETA(selected?.months ?? Infinity)}
          </Text>
          <Chip compact style={{ backgroundColor:"#131313", borderColor:"#1F2937", borderWidth:1 }}>
            <Text style={{ color: SUBTEXT }}>Net:</Text>{" "}
            <Text style={{ color: netColor, fontWeight: "700" }}>
              ₹{(vals.autopilot + month.invest + month.credit - (vals.spendAuto + month.spend)).toFixed(0)}
            </Text>
          </Chip>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: CARD_BG, borderRadius: 16, borderWidth: 1, borderColor: "#1F2937", marginBottom: 14 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  title: { color: TEXT, fontWeight: "800" },
  sub: { color: SUBTEXT },

  controls: { flexDirection: "row", alignItems: "flex-end", marginTop: 8 },

  viewport: { marginTop: 8, height: 130, borderRadius: 12, overflow: "hidden", backgroundColor: "#0B0B0B", borderWidth: 1, borderColor: "#171717" },
  bgStripe: { position: "absolute", top: 0, bottom: 0, left: -200, right: -200, opacity: 0.12, backgroundColor: "#0F0F0F" },

  flagWrap: { position: "absolute", width: 112, alignItems: "center" },
  flag: { width: 112, backgroundColor: "#0F0F0F", borderWidth: 1, borderColor: "#1F2937", borderRadius: 10, paddingVertical: 6, paddingHorizontal: 8 },
  flagName: { color: TEXT, fontWeight: "700", fontSize: 12 },
  flagAmt: { color: SUBTEXT, fontSize: 11, marginTop: 2 },
  flagEta: { color: SUBTEXT, fontSize: 11, marginTop: 2 },
  pole: { width: 2, height: 32, backgroundColor: "#2A2A2A" },

  youWrap: { position: "absolute", top: 0, bottom: 0, width: 2, alignItems: "center" },
  youBar: { position: "absolute", top: 8, bottom: 8, width: 2, backgroundColor: ORANGE, borderRadius: 2 },
  youTag: { position: "absolute", top: 4, paddingHorizontal: 6, paddingVertical: 2, backgroundColor: "#151515", borderRadius: 6, borderWidth: 1, borderColor: "#1F2937" },
  youText: { color: ORANGE, fontWeight: "800", fontSize: 10 },

  legendRow: { marginTop: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  legend: { color: SUBTEXT },
  legendStrong: { color: TEXT, fontWeight: "700" },
});
