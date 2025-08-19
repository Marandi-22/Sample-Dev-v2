import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  Button,
  Avatar,
  Snackbar,
  ProgressBar,
  Chip,
  IconButton,
  Paragraph,
  Title,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";

/* ───────────────────────────────
   Unlimited Phishing-Mail Challenge
   ─────────────────────────────── */
const STORAGE_KEY = "@phish_challenge_state_v2";

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid = () => Math.random().toString(36).slice(2, 9);

const SENDERS = [
  { name: "Bank of India", domain: "bankofindia.co" },
  { name: "Axis Bank", domain: "axis-bank.com" },
  { name: "FlipKart", domain: "flipkart-offer.shop" },
  { name: "Zoho HR", domain: "zohohr.com" },
  { name: "LinkedIn", domain: "linkedin-security.com" },
  { name: "Paytm", domain: "paytm.co" },
  { name: "Gov Tax Dept", domain: "incometax.gov.in" },
  { name: "College Admin", domain: "college.edu" },
];

const SUBJECTS = [
  "Update your account information",
  "Important: Your account will be suspended",
  "Claim your cashback now!",
  "New login from unknown device",
  "You have a pending refund",
  "Verify your identity for payroll",
  "Your parcel is on hold",
  "Congratulations! You won",
];

const BODIES = [
  "Dear user, we noticed suspicious activity. Please login immediately: ",
  "Your parcel could not be delivered. Confirm address now: ",
  "You are eligible for cashback of ₹5000. Click to claim: ",
  "We need to verify your KYC to process salary. Submit details: ",
  "Someone tried to login from a new device. Reset now: ",
];

const FLAG_TEMPLATES = [
  "Sender domain mismatch",
  "Urgent tone",
  "Spelling/grammar errors",
  "Suspicious link",
  "Generic greeting",
  "Attachment request",
  "Unsolicited prize",
];

// ---------- Mail generator ----------
function generateMail() {
  const sender = rand(SENDERS);
  const subject = rand(SUBJECTS);
  const bodyIntro = rand(BODIES);
  const isPhish = Math.random() < 0.65;

  const safeLinks = [
    "https://www.bankofindia.com/login",
    "https://secure.flipkart.com/order",
  ];
  const phishLinks = [
    `http://${sender.domain}/secure-login`,
    `https://${sender.domain}.verify-user.net`,
    `https://tinyurl.com/${uid()}`,
    `http://login.${sender.domain}.com`,
  ];
  const link = isPhish ? rand(phishLinks) : rand(safeLinks);

  const flags = [];
  if (isPhish) {
    const count = 1 + Math.floor(Math.random() * 3);
    while (flags.length < count) {
      const f = rand(FLAG_TEMPLATES);
      if (!flags.includes(f)) flags.push(f);
    }
  }

  const displayEmail = `${sender.name
    .toLowerCase()
    .replace(/\s+/g, "")}@${sender.domain}`;

  return {
    id: uid(),
    fromName: sender.name,
    fromEmail: displayEmail,
    subject,
    snippet: bodyIntro + link,
    body: `${bodyIntro}${link}\n\nRegards,\n${sender.name}`,
    link,
    flags,
    isPhish,
  };
}

// ---------- Main component ----------
export default function PhishBuster() {
  const [inbox, setInbox] = useState([]);
  const [openedMail, setOpenedMail] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [snack, setSnack] = useState({ visible: false, text: "" });
  const [progress, setProgress] = useState(0);
  const [badge, setBadge] = useState(null);
  const [disabledIds, setDisabledIds] = useState(new Set());

  /* ─── initial load ─── */
  useEffect(() => {
    loadMore();
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const { score: s = 0, streak: st = 0 } = JSON.parse(raw);
          setScore(s);
          setStreak(st);
        }
      } catch (e) {
        console.warn("Storage load error", e);
      }
    })();
  }, []);

  /* ─── save & mission progress ─── */
  useEffect(() => {
    const missionGoal = 5;
    setProgress(Math.min(1, score / (missionGoal * 10)));

    if (score >= 50 && !badge) setBadge("Scam Sniper");

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ score, streak }),
    ).catch(() => {});
  }, [score, streak, badge]);

  const loadMore = () =>
    setInbox((prev) => [...prev, ...Array.from({ length: 10 }, generateMail)]);

  const handleAction = (mail, action) => {
    if (disabledIds.has(mail.id)) return;

    setDisabledIds((s) => new Set(s).add(mail.id));

    const correct =
      (mail.isPhish && action === "report") ||
      (!mail.isPhish && action === "safe");

    const delta = correct
      ? mail.isPhish
        ? 10 + mail.flags.length * 2
        : 5
      : mail.isPhish
      ? -8
      : -3;

    setScore((s) => Math.max(0, s + delta));
    setStreak(correct ? (st) => st + 1 : 0);

    const feedback = correct
      ? `✅ Correct! ${
          mail.isPhish ? "Phishing mail." : "Safe mail."
        } +${Math.abs(delta)}`
      : `❌ Oops! ${
          mail.isPhish ? "That was phishing." : "That was actually safe."
        } -${Math.abs(delta)}`;

    setSnack({ visible: true, text: feedback });
    if (openedMail?.id === mail.id) setOpenedMail(null);
  };

  /* ─── UI helpers ─── */
  const renderMailItem = ({ item }) => {
    const initials = item.fromName
      .split(" ")
      .map((s) => s[0])
      .join("");
    const acted = disabledIds.has(item.id);

    return (
      <Card style={styles.card}>
        <TouchableOpacity
          onPress={() => setOpenedMail(item)}
          disabled={acted}
        >
          <Card.Title
            title={item.fromName}
            subtitle={item.fromEmail}
            left={(props) => (
              <Avatar.Text {...props} label={initials} size={40} />
            )}
            right={(props) => (
              <IconButton
                {...props}
                icon="chevron-right"
                onPress={() => setOpenedMail(item)}
              />
            )}
          />
          <Card.Content>
            <Paragraph numberOfLines={1}>{item.subject}</Paragraph>
          </Card.Content>
        </TouchableOpacity>

        <Card.Actions>
          <Button
            onPress={() => handleAction(item, "report")}
            disabled={acted}
          >
            Report
          </Button>
          <Button
            onPress={() => handleAction(item, "safe")}
            disabled={acted}
          >
            Safe
          </Button>
        </Card.Actions>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* header */}
      <View style={styles.headerRow}>
        <Title>Phishing Mail Challenge</Title>
        <View style={{ flexDirection: "row", marginTop: 4 }}>
          <Chip icon="star">Score {score}</Chip>
          <Chip style={{ marginLeft: 8 }}>Streak {streak}</Chip>
        </View>
      </View>

      {/* mission */}
      <View style={styles.missionBox}>
        <Text>Daily Mission: Catch 5 scams</Text>
        <ProgressBar progress={progress} style={{ marginTop: 8 }} />
      </View>

      {/* feed */}
      <FlatList
        data={inbox}
        keyExtractor={(i) => i.id}
        renderItem={renderMailItem}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        contentContainerStyle={{ padding: 12, paddingBottom: 120 }}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
      />

      {/* opened mail modal */}
      {openedMail && (
        <Card style={styles.openedCard}>
          <Card.Title
            title={openedMail.subject}
            subtitle={`${openedMail.fromName} • ${openedMail.fromEmail}`}
          />
          <Card.Content>
            <Paragraph>{openedMail.body}</Paragraph>

            <View style={{ marginTop: 8 }}>
              {openedMail.flags.length ? (
                openedMail.flags.map((f, idx) => (
                  <Chip key={idx} style={{ marginVertical: 2 }}>
                    {f}
                  </Chip>
                ))
              ) : (
                <Text>No obvious flags</Text>
              )}
            </View>

            <TouchableOpacity onPress={() => Alert.alert("Simulated link")}>
              <Text
                style={{ textDecorationLine: "underline", marginTop: 8 }}
              >
                {openedMail.link}
              </Text>
            </TouchableOpacity>
          </Card.Content>

          <Card.Actions>
            <Button onPress={() => handleAction(openedMail, "report")}>
              Report
            </Button>
            <Button onPress={() => handleAction(openedMail, "safe")}>
              Safe
            </Button>
            <Button onPress={() => setOpenedMail(null)}>Close</Button>
          </Card.Actions>
        </Card>
      )}

      {/* snackbar & badge */}
      <Snackbar
        visible={snack.visible}
        onDismiss={() => setSnack((s) => ({ ...s, visible: false }))}
      >
        {snack.text}
      </Snackbar>

      {badge && (
        <View style={styles.badgeBox}>
          <Chip icon="shield-check">{badge}</Chip>
        </View>
      )}
    </SafeAreaView>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  headerRow: { padding: 12, alignItems: "flex-start" },
  missionBox: {
    marginHorizontal: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#2222a3ff",
    elevation: 2,
  },
  card: { borderRadius: 12, elevation: 1 },
  openedCard: {
    margin: 12,
    borderRadius: 12,
    elevation: 6,
    marginBottom: 80, // stay above tab-bar
  },
  badgeBox: { position: "absolute", right: 12, bottom: 12 },
});
