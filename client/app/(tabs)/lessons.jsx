// client/app/lessons.jsx
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { ScrollView, StyleSheet, View, Linking, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import {
  Text, TextInput, Button, Card, Chip, Divider, Dialog, Portal, Paragraph, ProgressBar,
} from "react-native-paper";

// (Keep your components if you like them; they appear after the emergency tools)
import FraudCategoryList from "../../components/FraudCategoryList";
import SearchBar from "../../components/SearchBar";
import ActionSteps from "../../components/ActionSteps";
import EmergencyContacts from "../../components/EmergencyContacts";
import FraudHistory from "../../components/FraudHistory";
import TipsSection from "../../components/TipsSection";

const colors = {
  bg: "#000",
  text: "#fff",
  muted: "#9CA3AF",
  card: "#111",
  accent: "#FF9900",
};

// ---------- verified resources ----------
const NCRP_URL = "https://cybercrime.gov.in";                 // MHA/I4C portal
const CHAKSHU_URL = "https://sancharsaathi.gov.in/sfc";       // DoT Chakshu (suspicious comms)
const CYBERDOST_X = "https://twitter.com/Cyberdost";          // MHA awareness handle
const NPCI_UPI_X = "https://twitter.com/UPI_NPCI";            // NPCI UPI handle

// Bank directory (official pages + helplines; email only where bank lists it publicly)
const BANKS = {
  "SBI": {
    phones: ["18001234", "18002100", "1800112211", "18004253800"],
    official: "https://sbi.co.in/web/customer-care/contact-us", // verify numbers here
    email: "", // SBI doesn’t list a generic fraud email publicly—send via portal/official page
  },
  "Axis Bank": {
    phones: ["18604195555", "18605005555", "18001035577"],
    official: "https://www.axisbank.com/fraud-awareness/phishing-alert",
    email: "report.phishing@axisbank.com", // official phishing mailbox
  },
  "HDFC Bank": {
    phones: [], // use official page for context & escalation routes
    official: "https://www.hdfcbank.com/personal/need-help/contact-us",
    email: "",  // not publishing a generic fraud email; use page
  },
  "ICICI Bank": {
    phones: ["18001080"],
    official: "https://www.icicibank.com/contact-us",
    email: "customer.care@icicibank.com", // contact mailbox from official page
  },
};

const EMERGENCY_SEC_KEY = "@fw_emergency_profile_v2";
const OPTIN_KEY = "@fw_emergency_optin";

// ---------- helpers ----------
const canOpen = async (url) => (await Linking.canOpenURL(url)) ? Linking.openURL(url) : Alert.alert("Unavailable", "Cannot open: " + url);
const tel = (num) => canOpen(`tel:${num}`);
const web = (url) => canOpen(url);
const mailto = (to, subject, body) => canOpen(`mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);

const buildEmail = ({ name, bank, upi, last4, txnId, amount, when, notes }) => {
  const subject = `URGENT: Unauthorized Transaction ${txnId ? `– ${txnId}` : ""}`;
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
    "I have also contacted the 1930 cybercrime helpline and/or filed on the NCRP portal.",
    notes ? `\nDetails: ${notes}` : "",
    "",
    "Regards,",
    name || "-",
  ];
  return { subject, body: lines.join("\n") };
};

// ---------- component ----------
export default function LessonsEmergency() {
  // Panic-friendly state (minimal)
  const [bank, setBank] = useState("");         // user picks bank
  const [upi, setUpi] = useState("");           // optional
  const [txnId, setTxnId] = useState("");       // optional
  const [amount, setAmount] = useState("");     // optional
  const [when, setWhen] = useState("");         // optional (defaults to now in UI)
  const [last4, setLast4] = useState("");       // optional
  const [name, setName] = useState("");         // optional, for email signoff
  const [notes, setNotes] = useState("");       // optional
  const [remember, setRemember] = useState(false); // opt-in encrypted save
  const [confirmEmailOpen, setConfirmEmailOpen] = useState(false);

  // Progress: 0..1 across the 3 main actions (call 1930, open NCRP, contact bank)
  const [didCall1930, setDidCall1930] = useState(false);
  const [didOpenNCRP, setDidOpenNCRP] = useState(false);
  const [didContactBank, setDidContactBank] = useState(false);
  const progress = useMemo(() => {
    const steps = [didCall1930, didOpenNCRP, didContactBank].filter(Boolean).length;
    return steps / 3;
  }, [didCall1930, didOpenNCRP, didContactBank]);

  // Load opt-in + profile (encrypted) ONLY if opted in
  useEffect(() => {
    (async () => {
      const optIn = await SecureStore.getItemAsync(OPTIN_KEY);
      if (optIn === "true") {
        setRemember(true);
        const raw = await SecureStore.getItemAsync(EMERGENCY_SEC_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          setBank(d.bank || ""); setUpi(d.upi || ""); setTxnId(d.txnId || "");
          setAmount(d.amount || ""); setWhen(d.when || ""); setLast4(d.last4 || "");
          setName(d.name || ""); setNotes(d.notes || "");
        }
      }
    })();
  }, []);

  // Fraud history (kept from your old flow)
  const [selectedFraud, setSelectedFraud] = useState(null);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    AsyncStorage.getItem("fraudHistory").then((stored) => {
      if (stored) setHistory(JSON.parse(stored));
    });
  }, []);
  useEffect(() => {
    if (!selectedFraud) return;
    setHistory((prev) => {
      const newHistory = [selectedFraud, ...prev.filter((h) => h !== selectedFraud)].slice(0, 10);
      AsyncStorage.setItem("fraudHistory", JSON.stringify(newHistory));
      return newHistory;
    });
  }, [selectedFraud]);

  const selectedBank = BANKS[bank] || null;
  const emailTarget = selectedBank?.email || ""; // we only send if bank lists a mailbox
  const emailDraft = useMemo(
    () => buildEmail({ name, bank, upi, last4, txnId, amount, when, notes }),
    [name, bank, upi, last4, txnId, amount, when, notes]
  );

  const saveEncrypted = useCallback(async () => {
    if (!remember) {
      Alert.alert("Not saved", "Toggle “Remember on this device (encrypted)” to save.");
      return;
    }
    const payload = { bank, upi, txnId, amount, when, last4, name, notes };
    await SecureStore.setItemAsync(EMERGENCY_SEC_KEY, JSON.stringify(payload), {
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
    await SecureStore.setItemAsync(OPTIN_KEY, "true");
    Alert.alert("Saved", "Encrypted on this device.");
  }, [remember, bank, upi, txnId, amount, when, last4, name, notes]);

  const wipeEncrypted = useCallback(async () => {
    await SecureStore.deleteItemAsync(EMERGENCY_SEC_KEY);
    await SecureStore.deleteItemAsync(OPTIN_KEY);
    setRemember(false);
    Alert.alert("Erased", "All emergency data removed from this device.");
  }, []);

  // Actions
  const actCall1930 = async () => {
    await tel("1930");
    setDidCall1930(true);
  };
  const actOpenNCRP = async () => {
    await web(NCRP_URL);
    setDidOpenNCRP(true);
  };
  const actCallBank = async () => {
    const num = selectedBank?.phones?.[0];
    if (!num) return Alert.alert("Bank helpline", "Open your bank’s official page to get the current helpline.");
    await tel(num);
    setDidContactBank(true);
  };
  const actOpenBankOfficial = async () => {
    if (!selectedBank?.official) return Alert.alert("Official page", "Pick a listed bank or search your bank’s contact page.");
    await web(selectedBank.official);
    setDidContactBank(true);
  };
  const actEmailBank = () => {
    if (!emailTarget) {
      return Alert.alert("Email not available", "This bank does not publish a generic fraud mailbox. Use the official page.");
    }
    setConfirmEmailOpen(true);
  };
  const confirmSendEmail = async () => {
    setConfirmEmailOpen(false);
    await mailto(emailTarget, emailDraft.subject, emailDraft.body);
    setDidContactBank(true);
  };

  // calming header copy
  const Header = (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="headlineSmall" style={styles.title}>You’re not alone. We’ll do this step by step.</Text>
        <Text style={styles.muted}>Take a breath. Follow the steps below. You can come back to this screen anytime.</Text>
        <ProgressBar progress={progress} style={{ marginTop: 8 }} />
      </Card.Content>
    </Card>
  );

  // Step 1 — 1930
  const Step1 = (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.section}>Step 1 — Stop the loss</Text>
        <View style={styles.rowWrap}>
          <Chip mode="flat" style={styles.cta} onPress={actCall1930}>Call 1930 (Cybercrime)</Chip>
          <Chip mode="outlined" style={styles.cta} onPress={actOpenNCRP}>Open NCRP portal</Chip>
        </View>
        <Text style={styles.muted}>1930 and the NCRP portal help freeze fraudulent fund flows fast.</Text>
      </Card.Content>
    </Card>
  );

  // Step 2 — Your bank
  const Step2 = (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.section}>Step 2 — Contact your bank</Text>

        <View style={styles.rowWrap}>
          {Object.keys(BANKS).map((bk) => (
            <Chip
              key={bk}
              mode={bank === bk ? "flat" : "outlined"}
              selected={bank === bk}
              onPress={() => setBank(bk)}
              style={{ marginRight: 8, marginBottom: 8 }}
            >
              {bk}
            </Chip>
          ))}
        </View>

        <View style={styles.rowWrap}>
          <Chip mode="outlined" style={styles.cta} onPress={actCallBank}>Call helpline</Chip>
          <Chip mode="outlined" style={styles.cta} onPress={actOpenBankOfficial}>Open official page</Chip>
          <Chip mode="outlined" style={styles.cta} onPress={actEmailBank}>Email (prefilled)</Chip>
        </View>

        <Divider style={{ marginVertical: 8, backgroundColor: "#222" }} />

        <Text style={styles.muted}>Optional fields (for the email). They are **not saved** unless you turn on “Remember on this device”.</Text>
        <View style={styles.row}>
          <TextInput label="Your name" value={name} onChangeText={setName} style={styles.input} />
          <TextInput label="UPI ID" value={upi} onChangeText={setUpi} autoCapitalize="none" style={styles.input} />
        </View>
        <View style={styles.row}>
          <TextInput label="Txn ID" value={txnId} onChangeText={setTxnId} autoCapitalize="none" style={styles.input} />
          <TextInput label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" style={styles.input} />
        </View>
        <View style={styles.row}>
          <TextInput label="When (e.g. 13 Aug 2025, 14:32)" value={when} onChangeText={setWhen} style={styles.input} />
          <TextInput label="Account last 4" value={last4} onChangeText={setLast4} keyboardType="number-pad" style={styles.input} />
        </View>
        <TextInput label="Short notes (what happened)" value={notes} onChangeText={setNotes} multiline style={[styles.input, { backgroundColor: "#0f0f0f" }]} />

        <View style={[styles.row, { marginTop: 8, alignItems: "center" }]}>
          <Chip
            icon={remember ? "lock" : "lock-open-variant"}
            mode={remember ? "flat" : "outlined"}
            onPress={async () => {
              const next = !remember;
              setRemember(next);
              if (!next) {
                await SecureStore.deleteItemAsync(EMERGENCY_SEC_KEY);
                await SecureStore.deleteItemAsync(OPTIN_KEY);
                Alert.alert("Erased", "Emergency data removed from this device.");
              } else {
                Alert.alert("Note", "Data saves encrypted only when you tap Save.");
              }
            }}
          >
            {remember ? "Remember on this device (encrypted)" : "Do not store data"}
          </Chip>
          <View style={{ width: 12 }} />
          <Button mode="outlined" onPress={saveEncrypted}>Save</Button>
        </View>

        <Divider style={{ marginTop: 8, backgroundColor: "#222" }} />
        <Text style={[styles.muted, { marginTop: 8 }]}>Email preview</Text>
        <Text style={styles.preview}>{emailDraft.subject}</Text>
        <Text style={styles.preview}>{emailDraft.body}</Text>
      </Card.Content>
    </Card>
  );

  // Step 3 — Stay safe / spread signal
  const Step3 = (
    <Card style={styles.card}>
      <Card.Content>
        <Text variant="titleMedium" style={styles.section}>Step 3 — Extra actions</Text>
        <View style={styles.rowWrap}>
          <Chip mode="outlined" style={styles.cta} onPress={() => web(CHAKSHU_URL)}>Report suspicious SMS/calls (Chakshu)</Chip>
          <Chip mode="outlined" style={styles.cta} onPress={() => web(CYBERDOST_X)}>Follow @Cyberdost (updates)</Chip>
          <Chip mode="outlined" style={styles.cta} onPress={() => web(NPCI_UPI_X)}>NPCI UPI support/updates</Chip>
        </View>
        <Text style={styles.muted}>Chakshu is for suspicious communications (spam/fraud calls/SMS). For money loss, use 1930/NCRP first.</Text>
      </Card.Content>
    </Card>
  );

  // Your original exploration tools below (optional)
  const [fraudActionsData] = useState({
    "Phishing Scam": {
      immediate: [
        { label: "Change Passwords", description: "Update bank/email passwords now.", action: () => Alert.alert("Tip", "Open your bank app / password manager.") },
      ],
      shortTerm: [{ label: "Report to Cyber Cell", description: "File complaint online.", action: () => web(NCRP_URL) }],
      longTerm: [{ label: "Monitor Accounts", description: "Watch for unusual activity.", action: () => Alert.alert("Tip", "Enable SMS + email alerts.") }],
    },
    "UPI Fraud": {
      immediate: [
        { label: "Pause UPI", description: "Temporarily disable UPI in your app.", action: () => Alert.alert("Tip", "Open UPI app → Settings → Temporarily disable UPI.") },
      ],
      shortTerm: [{ label: "Report to NPCI", description: "Raise dispute in your UPI app.", action: () => web("https://www.npci.org.in/what-we-do/upi/dispute-redressal-mechanism") }],
      longTerm: [{ label: "File Police Complaint", description: "Visit nearest station with evidence.", action: () => web(NCRP_URL) }],
    },
  });

  const handleSearch = (text) => {
    const names = Object.keys(fraudActionsData);
    const found = names.find((n) => n.toLowerCase() === text.toLowerCase());
    if (found) setSelectedFraud(found);
    else Alert.alert("Not found", "No data for this fraud type.");
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 16 }}>
        {Header}
        {Step1}
        {Step2}
        {Step3}

        {/* Optional: your previous discovery UI */}
        <SearchBar onSearch={handleSearch} />
        <FraudCategoryList onSelect={setSelectedFraud} />
        <FraudHistory history={history} onSelect={setSelectedFraud} />

        {selectedFraud ? (
          <View style={{ marginVertical: 16 }}>
            <Text variant="titleLarge" style={{ color: colors.text, textAlign: "center", marginBottom: 8 }}>
              {selectedFraud}
            </Text>
            <ActionSteps steps={fraudActionsData[selectedFraud]} />
          </View>
        ) : null}

        <EmergencyContacts />
        <TipsSection />
      </ScrollView>

      {/* confirm email compose (never auto-sends) */}
      <Portal>
        <Dialog visible={confirmEmailOpen} onDismiss={() => setConfirmEmailOpen(false)}>
          <Dialog.Title>Compose email?</Dialog.Title>
          <Dialog.Content>
            <Paragraph>This opens your email app with a prefilled draft. Review and press Send yourself.</Paragraph>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setConfirmEmailOpen(false)}>Cancel</Button>
            <Button onPress={confirmSendEmail}>Open Mail</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, marginTop: 12 },
  title: { color: colors.text, marginBottom: 6 },
  section: { color: colors.text, marginBottom: 8 },
  muted: { color: colors.muted },

  row: { flexDirection: "row", gap: 12, marginTop: 8 },
  rowWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 4 },

  input: { flex: 1, backgroundColor: "#0f0f0f" },
  cta: { backgroundColor: "#1a1a1a" },
  preview: { color: colors.muted, fontSize: 12, marginTop: 4 },
});
