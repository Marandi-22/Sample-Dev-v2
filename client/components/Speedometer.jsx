import React from "react";
import { View, Text } from "react-native";
import Svg, { Path, Circle, Line } from "react-native-svg";

const BG   = "#0B0B0B";
const TEXT = "#FFFFFF";
const SUB  = "#9CA3AF";
const ACC  = "#00C8FF";          // unified accent
const WARN = "#FF4D4D";

export default function Speedometer({
  speed = 0,
  savingsPerMonth = 0,
  goalName,
  goalAmount,
  covered = 0,
  etaMonths,
}) {
  /* geometry */
  const s   = Math.max(0, Math.min(1, +speed));
  const deg = s * 180;
  const W   = 300, H = W / 2, cx = W / 2, cy = H, r = W / 2 - 20;
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const a   = (deg - 180) * (Math.PI / 180);
  const px  = cx + r * Math.cos(a), py = cy + r * Math.sin(a);

  const pctLabel = savingsPerMonth <= 0
    ? "Speed: 0% (No Savings)"
    : `Speed: ${(s * 100).toFixed(0)}%`;

  /* mini-map */
  const haveGoal = +goalAmount > 0;
  const prog     = haveGoal ? Math.min(1, Math.max(0, covered / goalAmount)) : 0;
  const barW = W - 8, barH = 24;
  const rocket = "🚀", rSize = 28, rTop = -rSize * 0.55;
  const rLeft  = Math.max(0, Math.min(barW - rSize, prog * barW - rSize / 2));

  return (
    <View style={{ alignItems: "center", backgroundColor: BG, padding: 16, borderRadius: 16 }}>
      {/* gauge */}
      <Svg width={W} height={H + 10} viewBox={`0 0 ${W} ${H + 10}`}>
        <Path d={arc} stroke={ACC} strokeWidth={20} strokeLinecap="round" fill="none" />
        {[...Array(6)].map((_, i) => {
          const ang = (i * 36 - 180) * (Math.PI / 180);
          const x1  = cx + (r - 8) * Math.cos(ang);
          const y1  = cy + (r - 8) * Math.sin(ang);
          const x2  = cx + (r + 8) * Math.cos(ang);
          const y2  = cy + (r + 8) * Math.sin(ang);
          return <Line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={TEXT} strokeWidth={2} />;
        })}
        <Circle cx={px} cy={py} r={10} fill={BG} stroke={ACC} strokeWidth={4} />
      </Svg>

      <Text style={{ color: TEXT, fontWeight: "700", fontSize: 20, marginTop: -32 }}>{pctLabel}</Text>
      <Text style={{ color: SUB, marginTop: 4 }}>
        Monthly savings: ₹{Math.max(0, savingsPerMonth).toLocaleString()}
      </Text>

      {haveGoal && Number.isFinite(etaMonths) ? (
        <Text style={{ color: SUB, marginTop: 2 }}>
          ETA to “{goalName || "Goal"}”: {etaMonths < 0.1 ? "<0.1" : etaMonths.toFixed(1)} mo
        </Text>
      ) : haveGoal ? (
        <Text style={{ color: WARN, marginTop: 2 }}>No ETA — increase savings.</Text>
      ) : null}

      {haveGoal && (
        <View style={{ width: barW, marginTop: 20 }}>
          <Text style={{ color: TEXT, fontWeight: "600" }}>
            {goalName || "Goal"} · ₹{Math.min(covered, goalAmount).toLocaleString()} covered · ₹
            {Math.max(0, goalAmount - covered).toLocaleString()} left
          </Text>
          <View style={{
            marginTop: 8, height: barH, backgroundColor: "#0E0E0E",
            borderColor: "#1F2937", borderWidth: 1, borderRadius: 999, overflow: "visible",
          }}>
            <View style={{ width: `${prog * 100}%`, height: "100%", backgroundColor: ACC }} />
            {/* rocket sits slightly above the bar */}
            <Text style={{
              position: "absolute", left: rLeft, top: rTop, fontSize: rSize,
              textShadowColor: "rgba(0,0,0,0.8)", textShadowRadius: 4,
            }}>{rocket}</Text>
          </View>
        </View>
      )}

      <Text style={{ color: SUB, marginTop: 16, textAlign: "center" }}>
        Higher speed = faster goals. Spends slow you down.
      </Text>
    </View>
  );
}
