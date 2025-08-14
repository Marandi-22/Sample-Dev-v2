// client/app/(tabs)/lifeline.jsx
import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  TextInput,
  Button,
  Card,
  Chip,
  Divider,
  ProgressBar,
  IconButton,
} from "react-native-paper";

const BG = "#000000";
const CARD_BG = "#111111";
const TEXT = "#FFFFFF";
const MUTED = "#9CA3AF";
const ORANGE = "#FF9900";

const NCRP_URL = "https://cybercrime.gov.in";
const CHAKSHU_URL = "https://sancharsaathi.gov.in/sfc";
const CYBERDOST_X = "https://twitter.com/Cyberdost";
const NPCI_UPI_X = "https://twitter.com/UPI_NPCI";

const BANKS = {
  SBI: { phones: ["18001234", "18002100", "1800112211", "18004253800"], official: "https://sbi.co.in/web/customer-care/contact-us", email: "" },
  "Axis Bank": { phones: ["18604195555", "18605005555", "18001035577"], official: "https://www.axisbank.com/fraud-awareness/phishing-alert", email: "report.phishing@axisbank.com" },
  "HDFC Bank": { phones: [], official: "https://www.hdfcbank.com/personal/need-help/contact-us", email: "" },
  "ICICI Bank": { phones: ["18001080"], official: "https://www.icicibank.com/contact-us", email: "customer.care@icicibank.com" },
};

const canOpen = async (url) =>
  (await Linking.canOpenURL(url))
    ? Linking.openURL(url)
    : Alert.alert("Unavailable", "Cannot open: " + url);
const tel = (num) => canOpen(`tel:${num}`);
const web = (url) => canOpen(url);
const mailto = (to, subject, body) =>
  canOpen(`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

const buildEmail = ({ name, bank, upi, last4, txnId, amount, when, notes }) => {
  const subject = `URGENT: Unauthorized Transaction ${txnId ? `- ${txnId}` : ""}`;
  const lines = [
    "Dear Bank Support,",
    "",
    `I am reporting an unauthorized transaction${when ? ` on ${when}` : ""}${amount ? ` of ₹${amount}` : ""}${upi ? ` via UPI (${upi})` : ""}.`,
    `Transaction ID: ${txnId || "-"}`,
    `Account (last 4): ${last4 || "-"}`,
    `Name: ${name || "-"}`,
    "",
    "Please:",
    "1) Block/pause my account/UPI immediately to prevent further loss",
    "2) Initiate dispute/chargeback as per RBI/NPCI guidelines",
    "3) Provide a written acknowledgement and case ID",
    "",
    "I have contacted 1930 and/or filed on the NCRP portal.",
    notes ? `Details: ${notes}` : "",
    "",
    "Regards,",
    name || "-",
  ];
  return { subject, body: lines.join("\n") };
};

export default function Lifeline() {
  const [step, setStep] = useState(0);
  const [lostMoney, setLostMoney] = useState("");
  const [when, setWhen] = useState("");
  const [rail, setRail] = useState("");
  const [bank, setBank] = useState("");

  const [name, setName] = useState("");
  const [upi, setUpi] = useState("");
  const [txnId, setTxnId] = useState("");
  const [amount, setAmount] = useState("");
  const [last4, setLast4] = useState("");
  const [notes, setNotes] = useState("");

  const selectedBank = BANKS[bank] || null;
  const emailDraft = useMemo(
    () => buildEmail({ name, bank, upi, last4, txnId, amount, when, notes }),
    [name, bank, upi, last4, txnId, amount, when, notes]
  );

  const totalSteps = 4;
  const progress = step / totalSteps;

  const showImmediateFreeze =
    lostMoney === "yes" || lostMoney === "unsure" || when === "now" || when === "1-3d";
  const upiFlow = rail === "UPI";

  const startSurvey = () => setStep(1);
  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const actCall1930 = async () => tel("1930");
  const actOpenNCRP = async () => web(NCRP_URL);
  const actOpenChakshu = async () => web(CHAKSHU_URL);
  const actCyberdost = async () => web(CYBERDOST_X);
  const actNPCI = async () => web(NPCI_UPI_X);
  const actCallBank = async () => {
    const num = selectedBank?.phones?.[0];
    if (!num) return Alert.alert("Bank helpline", "Open the official page to get the current helpline.");
    return tel(num);
  };
  const actOpenBankOfficial = async () => {
    if (!selectedBank?.official) return Alert.alert("Official page", "Pick a listed bank or search your bank contact page.");
    return web(selectedBank.official);
  };
  const actEmailBank = async () => {
    const to = selectedBank?.email;
    if (!to) return Alert.alert("Email not available", "This bank does not publish a generic fraud mailbox. Use the official page.");
    const { subject, body } = emailDraft;
    return mailto(to, subject, body);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 120 }}>
        <Card style={s.card}>
          <Card.Content>
            <View style={s.rowBetween}>
              <Text variant="headlineSmall" style={s.title}>Lifeline - Guided Steps</Text>
              {/* MaterialCommunityIcons name */}
              <IconButton icon="lifebuoy" size={18} iconColor={MUTED} />
            </View>
            <Text style={s.muted}>Answer a few quick questions. We will line up what to do, in order.</Text>
            <ProgressBar progress={progress} style={{ marginTop: 10 }} />
          </Card.Content>
        </Card>

        {step === 0 && (
          <Card style={s.card}>
            <Card.Content>
              <Text style={s.section}>First, breathe.</Text>
              <Text style={s.muted}>If money just left your account, speed matters. This guide gets you to the right place fast.</Text>
              <Button mode="contained" onPress={startSurvey} style={{ marginTop: 10 }}>Start</Button>
            </Card.Content>
          </Card>
        )}

        {step === 1 && (
          <Card style={s.card}>
            <Card.Content>
              <Text style={s.section}>Did money leave your account?</Text>
              <View style={s.wrap}>
                {["yes", "no", "unsure"].map((v) => (
                  <Chip key={v} selected={lostMoney === v} onPress={() => setLostMoney(v)} mode={lostMoney === v ? "flat" : "outlined"} style={s.chip}>
                    {v === "yes" ? "Yes" : v === "no" ? "No" : "Not sure"}
                  </Chip>
                ))}
              </View>
              <View style={s.navRow}>
                <Button mode="text" onPress={back}>Back</Button>
                <Button mode="contained" disabled={!lostMoney} onPress={next}>Next</Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {step === 2 && (
          <Card style={s.card}>
            <Card.Content>
              <Text style={s.section}>When did it happen?</Text>
              <View style={s.wrap}>
                {[
                  { k: "now", label: "Within 24h" },
                  { k: "1-3d", label: "1-3 days ago" },
                  { k: ">3d", label: "More than 3 days" },
                ].map((o) => (
                  <Chip key={o.k} selected={when === o.k} onPress={() => setWhen(o.k)} mode={when === o.k ? "flat" : "outlined"} style={s.chip}>
                    {o.label}
                  </Chip>
                ))}
              </View>
              <View style={s.navRow}>
                <Button mode="text" onPress={back}>Back</Button>
                <Button mode="contained" disabled={!when} onPress={next}>Next</Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {step === 3 && (
          <Card style={s.card}>
            <Card.Content>
              <Text style={s.section}>Which payment method?</Text>
              <View style={s.wrap}>
                {["UPI", "Card/Netbanking", "Wallet", "Other"].map((v) => (
                  <Chip key={v} selected={rail === v} onPress={() => setRail(v)} mode={rail === v ? "flat" : "outlined"} style={s.chip}>
                    {v}
                  </Chip>
                ))}
              </View>

              <Divider style={s.divider} />
              <Text style={s.muted}>Optional details (helpful for email):</Text>
              {rail === "UPI" && (
                <TextInput label="Your UPI ID" value={upi} onChangeText={setUpi} autoCapitalize="none" style={s.input} />
              )}
              <View style={s.row}>
                <TextInput label="Txn ID" value={txnId} onChangeText={setTxnId} style={s.input} />
                <TextInput label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" style={s.input} />
              </View>

              <View style={s.navRow}>
                <Button mode="text" onPress={back}>Back</Button>
                <Button mode="contained" disabled={!rail} onPress={next}>Next</Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {step === 4 && (
          <Card style={s.card}>
            <Card.Content>
              <Text style={s.section}>Your bank</Text>
              <View style={s.wrap}>
                {Object.keys(BANKS).map((bk) => (
                  <Chip key={bk} selected={bank === bk} onPress={() => setBank(bk)} mode={bank === bk ? "flat" : "outlined"} style={s.chip}>
                    {bk}
                  </Chip>
                ))}
                <Chip selected={bank === "Other"} onPress={() => setBank("Other")} mode={bank === "Other" ? "flat" : "outlined"} style={s.chip}>
                  Other / Not listed
                </Chip>
              </View>

              <Divider style={s.divider} />
              <View style={s.row}>
                <TextInput label="Your name" value={name} onChangeText={setName} style={s.input} />
                <TextInput label="Account last 4" value={last4} onChangeText={setLast4} keyboardType="number-pad" style={s.input} />
              </View>
              <TextInput label="Short notes (what happened)" value={notes} onChangeText={setNotes} multiline style={[s.input, { backgroundColor: "#0f0f0f" }]} />

              <View style={s.navRow}>
                <Button mode="text" onPress={back}>Back</Button>
                <Button mode="contained" onPress={() => setStep(5)}>See my action plan</Button>
              </View>
            </Card.Content>
          </Card>
        )}

        {step >= 5 && (
          <>
            <Card style={s.card}>
              <Card.Content>
                <Text variant="titleMedium" style={s.section}>1) Freeze the money flow</Text>
                <View style={s.wrap}>
                  <Chip mode="flat" style={[s.cta, showImmediateFreeze && { borderColor: ORANGE, borderWidth: 1 }]} onPress={actCall1930}>
                    Call 1930 (Cybercrime)
                  </Chip>
                  <Chip mode="outlined" style={s.cta} onPress={actOpenNCRP}>
                    Open NCRP portal
                  </Chip>
                </View>
                <Text style={s.muted}>
                  {showImmediateFreeze
                    ? "Do this first. The sooner you report, the better the chance to pause or trace funds."
                    : "If no money left your account, still file a report to flag the attempt."}
                </Text>
              </Card.Content>
            </Card>

            <Card style={s.card}>
              <Card.Content>
                <Text variant="titleMedium" style={s.section}>2) Contact your bank</Text>
                {bank ? (
                  <>
                    <View style={s.wrap}>
                      <Chip mode="outlined" style={s.cta} onPress={actCallBank}>Call helpline</Chip>
                      <Chip mode="outlined" style={s.cta} onPress={actOpenBankOfficial}>Open official page</Chip>
                      <Chip mode="outlined" style={s.cta} onPress={actEmailBank}>Email (prefilled)</Chip>
                    </View>
                    <Divider style={s.divider} />
                    <Text style={s.muted}>Email preview</Text>
                    <Text style={s.preview}>{emailDraft.subject}</Text>
                    <Text style={s.preview}>{emailDraft.body}</Text>
                  </>
                ) : (
                  <>
                    <Text style={s.muted}>Pick your bank above to show the right contacts.</Text>
                    <View style={s.wrap}>
                      <Chip mode="outlined" style={s.cta} onPress={actOpenNCRP}>Report via NCRP</Chip>
                    </View>
                  </>
                )}
              </Card.Content>
            </Card>

            <Card style={s.card}>
              <Card.Content>
                <Text variant="titleMedium" style={s.section}>3) Extra signal and safety</Text>
                <View style={s.wrap}>
                  <Chip mode="outlined" style={s.cta} onPress={actOpenChakshu}>Report suspicious SMS/calls (Chakshu)</Chip>
                  <Chip mode="outlined" style={s.cta} onPress={actCyberdost}>Follow @Cyberdost</Chip>
                  {upiFlow && <Chip mode="outlined" style={s.cta} onPress={actNPCI}>NPCI UPI help/updates</Chip>}
                </View>
                <Text style={s.muted}>Use Chakshu for spam or fraud communications. For money loss, 1930/NCRP plus your bank are primary.</Text>
              </Card.Content>
            </Card>

            <View style={{ marginTop: 8, alignItems: "center" }}>
              <Button mode="text" onPress={() => setStep(0)}>Start over</Button>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  card: { backgroundColor: CARD_BG, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: "#1F2937" },
  title: { color: TEXT, fontWeight: "800" },
  section: { color: TEXT, fontWeight: "700", marginBottom: 6 },
  muted: { color: MUTED },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  navRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  wrap: { flexDirection: "row", flexWrap: "wrap", marginTop: 6 },
  chip: { backgroundColor: BG, borderColor: "#1F2937", marginRight: 8, marginBottom: 8 },
  input: { flex: 1, backgroundColor: "#0B0B0B", marginTop: 8 },
  row: { flexDirection: "row", marginTop: 8, columnGap: 12 },
  cta: { backgroundColor: "#141414" },
  divider: { backgroundColor: "#232323", marginVertical: 10 },
  preview: { color: MUTED, fontSize: 12, marginTop: 4 },
});
