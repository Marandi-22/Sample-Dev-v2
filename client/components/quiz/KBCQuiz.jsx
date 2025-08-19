// client/components/quiz/KBCQuiz.jsx
// Portrait-first KBC quiz: stacked layout, compact ladder, smooth result sheet.
// deps: expo-screen-orientation, expo-linear-gradient, react-native-paper, @react-native-async-storage/async-storage

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  BackHandler,
  Animated,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text,
  Card,
  Chip,
  IconButton,
  ProgressBar,
  Button,
  useTheme,
  Portal,
  Divider,
  Badge,
} from "react-native-paper";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ScreenOrientation from "expo-screen-orientation";
import { LinearGradient } from "expo-linear-gradient";

/* -------------------- CONFIG -------------------- */

const STORAGE_KEY = "@kbc_quiz_portrait_v1";

// Merge all banks into one main question bank
const BANK = [

  {
    q: "What should you do if someone asks for your UPI PIN?",
    choices: ["Share if it's a friend", "Never share it", "Type it in WhatsApp", "Send via SMS"],
    answer: 1,
    hint: "UPI PIN is like your ATM PIN – never share.",
  },
  {
    q: "Which of these is safe to share publicly?",
    choices: ["Aadhaar number", "Bank account number for receiving money", "Debit card CVV", "UPI PIN"],
    answer: 1,
    hint: "Account number alone cannot withdraw funds.",
  },
  {
    q: "A genuine bank SMS will usually come from?",
    choices: ["Random mobile number", "Bank’s official sender ID", "WhatsApp forward", "Telegram group"],
    answer: 1,
    hint: "Banks use verified IDs (e.g., HDFCBK, ICICIB).",
  },
  {
    q: "Your debit card CVV is located…",
    choices: ["On card front", "On card back", "In bank SMS", "In ATM receipt"],
    answer: 1,
    hint: "CVV is the 3-digit code on the card’s back.",
  },
  {
    q: "If you get a call claiming ‘lottery prize’, what should you do?",
    choices: ["Pay fee to claim", "Ignore/report", "Share PAN details", "Send OTP"],
    answer: 1,
    hint: "Genuine lotteries don’t ask for upfront money.",
  },
  {
    q: "Which payment method is safest for online shopping?",
    choices: ["Sharing debit card photo", "Using virtual card/UPI", "Sending CVV on WhatsApp", "Cash transfer to unknown account"],
    answer: 1,
    hint: "Virtual/UPI reduces exposure of your main card.",
  },
  {
    q: "‘Smishing’ refers to fraud via…",
    choices: ["ATM", "SMS", "Cheque", "Bank branch"],
    answer: 1,
    hint: "Smishing = SMS + Phishing.",
  },
  {
    q: "To verify a loan offer, you should…",
    choices: ["Trust any SMS", "Check RBI/official website", "Click WhatsApp link", "Call unknown number"],
    answer: 1,
    hint: "Always verify with official sources.",
  },
  {
    q: "What’s the safest way to update your bank KYC?",
    choices: ["Through official bank branch/app", "Via random SMS link", "Over WhatsApp", "By giving OTP to caller"],
    answer: 0,
    hint: "Only update KYC directly with your bank.",
  },
  {
    q: "An OTP should be shared with…",
    choices: ["Only trusted family", "Bank staff on call", "No one", "Telegram support"],
    answer: 2,
    hint: "OTP is only for you – not even banks need it.",
  },
  {
    q: "What does UPI stand for?",
    choices: ["Unified Payment Interface", "Universal PIN Identifier", "User Payment Input", "Unique Payment Invoice"],
    answer: 0,
    hint: "UPI = Unified Payment Interface.",
  },
  {
    q: "Which is a sign of phishing email?",
    choices: ["Spelling mistakes", "Urgent threats", "Suspicious links", "All of the above"],
    answer: 3,
    hint: "Phishing mails often combine these tricks.",
  },
  {
    q: "If you accidentally sent money to the wrong UPI ID, what’s the first step?",
    choices: ["Ask stranger for refund", "Complain to bank immediately", "Send OTP to reverse", "Ignore it"],
    answer: 1,
    hint: "Only your bank can officially raise a reversal request.",
  },
  {
    q: "Which is safer: public Wi-Fi or mobile data for banking?",
    choices: ["Public Wi-Fi", "Mobile data", "Both same", "Bluetooth tether"],
    answer: 1,
    hint: "Public Wi-Fi is risky for sensitive info.",
  },
  {
    q: "Your bank never asks for…",
    choices: ["OTP", "UPI PIN", "Netbanking password", "All of these"],
    answer: 3,
    hint: "No bank will call/email asking for these.",
  },
  {
    q: "Which is a financial goal?",
    choices: ["Buying a bike", "Vacation", "Saving emergency fund", "All of these"],
    answer: 3,
    hint: "Goals include purchases, savings, and security.",
  },
  {
    q: "A pyramid scheme usually promises…",
    choices: ["High returns quickly", "Steady safe returns", "Government bonds", "Bank FD rates"],
    answer: 0,
    hint: "Pyramids lure with ‘guaranteed high’ profits.",
  },
  {
    q: "How can you spot a fake UPI app?",
    choices: ["Low downloads & bad reviews", "Strange developer name", "Not listed by NPCI", "All of these"],
    answer: 3,
    hint: "Always install verified apps from known sources.",
  },
  {
    q: "Which document is most sensitive?",
    choices: ["PAN card", "ATM PIN", "Aadhaar linked with mobile", "All of these"],
    answer: 3,
    hint: "All are sensitive and must be protected.",
  },
  {
    q: "What is phishing?",
    choices: ["Fishing with net", "Stealing info by tricking user", "Hacking ATM", "UPI glitch"],
    answer: 1,
    hint: "Phishing tricks people into giving credentials.",
  },
  {
    q: "Which practice improves savings?",
    choices: ["Impulse shopping", "Tracking expenses", "Ignoring budgets", "Buying lottery tickets"],
    answer: 1,
    hint: "Budgeting and tracking help you save.",
  },
  {
    q: "Which one is a safe financial habit?",
    choices: ["Sharing card photo", "Checking credit report yearly", "Saving passwords in SMS", "Clicking on free-money links"],
    answer: 1,
    hint: "Checking credit report keeps fraud in check.",
  },
  {
    q: "If you lose your debit card, first step?",
    choices: ["Post on social media", "Ignore", "Block card via bank immediately", "Give PIN to friend"],
    answer: 2,
    hint: "Blocking card prevents misuse.",
  },
  {
    q: "Why should you enable SMS/email alerts?",
    choices: ["For latest offers", "To monitor transactions instantly", "To avoid spam", "For cashback"],
    answer: 1,
    hint: "Alerts help detect fraud quickly.",
  },
  {
    q: "Who regulates banks in India?",
    choices: ["SEBI", "IRDAI", "RBI", "NPCI"],
    answer: 2,
    hint: "Reserve Bank of India (RBI) regulates banks.",
  },
// ];

// const BANK = EASY_BANK.map((q, i) => ({
//   ...q,
//   id: (i + 1).toString(),
//   // add id for easier tracking
//   choices: q.choices.map((c, j) => ({ text: c, id: j })),
//   // convert choices to objects with id
//   answer: q.answer >= 0 ? q.choices[q.answer].id : null, // convert answer to id
// }));

// const MEDIUM_BANK = [
  {
    q: "You receive an email from 'support@icici-bank-login.com' asking to reset your password. Best action?",
    choices: ["Click and reset quickly", "Forward to bank fraud team", "Enter details to be safe", "Ignore and delete"],
    answer: 1,
    hint: "Report suspicious mails to your bank’s fraud team.",
  },
  {
    q: "What does 'two-factor authentication' mean?",
    choices: ["Two passwords", "PIN + OTP or biometric", "Two UPI apps", "Sharing login with 2 people"],
    answer: 1,
    hint: "2FA = Something you know + something you own.",
  },
  {
    q: "A message says: 'Update KYC or account blocked today!' This is likely…",
    choices: ["True warning", "Phishing attempt", "Government notice", "Bank survey"],
    answer: 1,
    hint: "Urgent threats are classic scam tactics.",
  },
  {
    q: "Why is it risky to use the same password for all sites?",
    choices: ["Easy to remember", "One breach exposes all accounts", "Faster login", "Stronger security"],
    answer: 1,
    hint: "Reuse means one hacked site = all hacked.",
  },
  {
    q: "You are promised 'double your money in 2 weeks'. This is…",
    choices: ["Smart investing", "Ponzi/pyramid scam", "Government bond", "Bank FD scheme"],
    answer: 1,
    hint: "High, quick returns = scam.",
  },
  {
    q: "Your phone shows ‘SIM card registration failed’. What should you suspect?",
    choices: ["SIM swap fraud", "Bank KYC", "Normal signal loss", "Expired ATM card"],
    answer: 0,
    hint: "SIM swap allows fraudsters to hijack OTPs.",
  },
  {
    q: "To securely dispose old bank statements, you should…",
    choices: ["Throw in dustbin", "Shred or burn them", "Save on WhatsApp", "Give to kabadiwala"],
    answer: 1,
    hint: "Sensitive data must be destroyed.",
  },
  {
    q: "If a caller pressures you to act immediately, it’s usually…",
    choices: ["Fraud tactic", "Genuine urgency", "Bank policy", "Safe request"],
    answer: 0,
    hint: "Scammers create artificial urgency.",
  },
  {
    q: "What does CIBIL score represent?",
    choices: ["Income level", "Job history", "Creditworthiness", "PAN number"],
    answer: 2,
    hint: "CIBIL score = how responsibly you use credit.",
  },
  {
    q: "Why should you enable 'transaction limits' on UPI?",
    choices: ["To block account", "To cap losses if hacked", "To avoid KYC", "To increase cashback"],
    answer: 1,
    hint: "Limits reduce fraud damage.",
  },
  {
    q: "QR codes from strangers may be dangerous because…",
    choices: ["They look weird", "They can trigger payments instead of receipts", "They give discounts", "They block SIM"],
    answer: 1,
    hint: "A QR can debit instead of credit if misused.",
  },
  {
    q: "Which is a safe investment option?",
    choices: ["Ponzi scheme", "Unregistered chit fund", "Government bonds", "Lottery tickets"],
    answer: 2,
    hint: "Government bonds are regulated and safe.",
  },
  {
    q: "A job portal demands ₹2000 registration fee. Best action?",
    choices: ["Pay and secure job", "Refuse and verify company", "Share Aadhaar first", "Give UPI PIN"],
    answer: 1,
    hint: "Jobs don’t require fees; verify employer.",
  },
  {
    q: "Why should you regularly update your banking app?",
    choices: ["For more ads", "To get new offers", "To patch security bugs", "To reduce storage"],
    answer: 2,
    hint: "Updates fix vulnerabilities.",
  },
  {
    q: "Which is a red flag in online shopping?",
    choices: ["Too-good-to-be-true prices", "No return/refund policy", "No HTTPS lock icon", "All of these"],
    answer: 3,
    hint: "All indicate possible fraud store.",
  },
  {
    q: "A fraudster tricks you into installing a 'screen sharing app'. Risk?",
    choices: ["Better video calls", "They see and control your phone", "Free recharge", "Bank approves faster"],
    answer: 1,
    hint: "Remote access = total compromise.",
  },
  {
    q: "Which insurance is mandatory for vehicle owners in India?",
    choices: ["Life insurance", "Third-party motor insurance", "Health insurance", "Travel insurance"],
    answer: 1,
    hint: "Motor Vehicles Act mandates third-party insurance.",
  },
  {
    q: "Why is it unsafe to keep passwords in plain text notes?",
    choices: ["Notes may sync to cloud/hackers", "Takes more storage", "Slows phone", "Banks don’t allow notes"],
    answer: 0,
    hint: "Use password managers, not plain notes.",
  },
  {
    q: "Which authority handles securities market fraud in India?",
    choices: ["RBI", "IRDAI", "SEBI", "NPCI"],
    answer: 2,
    hint: "SEBI = Securities and Exchange Board of India.",
  },
  {
    q: "What should you do if your UPI app shows unauthorized transaction?",
    choices: ["Call scammer", "Block account & report to bank/NPCI", "Share PIN to reverse", "Ignore it"],
    answer: 1,
    hint: "Report immediately to bank & NPCI helpline.",
  },
  {
    q: "Which of these is an investment scam keyword?",
    choices: ["Guaranteed returns", "Quick double", "Risk-free profit", "All of these"],
    answer: 3,
    hint: "Scammers lure with impossible guarantees.",
  },
  {
    q: "What is safer: credit card or debit card for online purchases?",
    choices: ["Debit card", "Credit card (better fraud protection)", "Both same", "Cash only"],
    answer: 1,
    hint: "Credit cards often provide fraud dispute rights.",
  },
  {
    q: "Fake loan apps often ask for…",
    choices: ["Excess permissions", "Contacts & photos", "Bank OTPs", "All of these"],
    answer: 3,
    hint: "Data harvesting + OTP fraud = scam app.",
  },
  {
    q: "Why should you avoid using public computers for banking?",
    choices: ["Slow internet", "Malware/spyware risk", "No keyboard", "No SMS OTP"],
    answer: 1,
    hint: "Keyloggers can steal your data.",
  },
  {
    q: "The safest way to download financial apps is…",
    choices: ["From SMS links", "From verified app stores", "From Telegram group", "Through APK from stranger"],
    answer: 1,
    hint: "Only use Google Play/Apple App Store official versions.",
  },
// ];

// const BANK = MEDIUM_BANK.map((q, i) => ({
//   ...q,
//   id: (i + 1).toString(),
//   // add id for easier tracking
//   choices: q.choices.map((c, j) => ({ text: c, id: j })),
//   // convert choices to objects with id
//   answer: q.answer >= 0 ? q.choices[q.answer].id : null, // convert answer to id
// }));

// const HARD_BANK = [
  {
    q: "A fraudster uses your Aadhaar + PAN to open a loan in your name. First action?",
    choices: ["Ignore it", "Dispute with credit bureau & report to police", "Pay loan to avoid issues", "Call scammer"],
    answer: 1,
    hint: "Report identity theft to police + credit bureau immediately.",
  },
  {
    q: "You see HTTPS + padlock on a scam website. What does this mean?",
    choices: ["Site is 100% safe", "Only data transmission is encrypted", "It is RBI approved", "No fraud possible"],
    answer: 1,
    hint: "HTTPS ≠ safe site. It just means encryption.",
  },
  {
    q: "Which RBI initiative lets you raise complaints about digital fraud?",
    choices: ["RBI Complaint Redressal Portal", "NPCI WhatsApp", "SEBI SCORES", "IRDAI Portal"],
    answer: 0,
    hint: "RBI has online CMS for banking complaints.",
  },
  {
    q: "What is 'account takeover fraud'?",
    choices: ["Opening fake accounts", "Scammer hijacks your login credentials", "Creating joint account", "Bank error"],
    answer: 1,
    hint: "Fraudsters gain full control of your account.",
  },
  {
    q: "Why are prepaid gift cards popular among scammers?",
    choices: ["Hard to trace", "Easily sold for cash", "Instant to transfer", "All of these"],
    answer: 3,
    hint: "Gift cards are anonymous & irreversible.",
  },
  {
    q: "Which investment is most at risk of pump-and-dump scam?",
    choices: ["Large-cap stock", "Government bond", "Small-cap penny stock", "Fixed deposit"],
    answer: 2,
    hint: "Penny stocks are easy to manipulate.",
  },
  {
    q: "SIM swap attacks help criminals to…",
    choices: ["Steal OTPs", "Hijack calls/SMS", "Access banking apps", "All of these"],
    answer: 3,
    hint: "SIM swap = full telecom-level takeover.",
  },
  {
    q: "Which of these is a sign of deepfake financial scam?",
    choices: ["Fake CEO video asking fund transfer", "Altered KYC selfies", "AI voice mimicking family", "All of these"],
    answer: 3,
    hint: "Deepfake tech is used for financial frauds too.",
  },
  {
    q: "An app asks for 'Accessibility Services' permission. Why dangerous?",
    choices: ["Consumes battery", "Allows screen reading & input injection", "Slows device", "Disables OTPs"],
    answer: 1,
    hint: "It lets apps spy on everything you do.",
  },
  {
    q: "You invested in a 'high-return crypto scheme' abroad. It vanishes. What’s this called?",
    choices: ["Phishing", "Rug pull", "SIM fraud", "Loan scam"],
    answer: 1,
    hint: "Crypto rug pulls drain investors suddenly.",
  },
  {
    q: "How does 'vishing' fraud usually occur?",
    choices: ["Voice call asking sensitive info", "ATM tampering", "Video phishing", "Social media ad"],
    answer: 0,
    hint: "Vishing = voice + phishing.",
  },
  {
    q: "Under Indian law, who regulates digital wallets?",
    choices: ["RBI", "SEBI", "IRDAI", "Finance Ministry"],
    answer: 0,
    hint: "RBI regulates prepaid wallets like Paytm/PhonePe.",
  },
  {
    q: "Why are public charging stations risky for phones?",
    choices: ["Free electricity scam", "Juice jacking can steal data", "Battery damage", "Low speed"],
    answer: 1,
    hint: "Hackers can inject malware via USB.",
  },
  {
    q: "What’s a mule account in money laundering?",
    choices: ["Animal account", "Account used to route illegal funds", "Low balance account", "Bank test account"],
    answer: 1,
    hint: "Mule accounts disguise illicit transactions.",
  },
  {
    q: "A fake IPO is being circulated on WhatsApp. Best step?",
    choices: ["Invest quickly", "Check SEBI website for approval", "Trust admin", "Forward to friends"],
    answer: 1,
    hint: "SEBI lists all genuine IPOs.",
  },
  {
    q: "Why is downloading modded banking apps risky?",
    choices: ["Extra features", "They may contain trojans", "Better cashback", "No KYC needed"],
    answer: 1,
    hint: "Modified APKs are easy malware carriers.",
  },
  {
    q: "What is 'friendly fraud' in cards?",
    choices: ["Friend steals card", "Customer disputes genuine purchase", "Bank error refund", "ATM malfunction"],
    answer: 1,
    hint: "Also called 'chargeback fraud'.",
  },
  {
    q: "Which law in India addresses cyber fraud?",
    choices: ["Income Tax Act", "IT Act 2000", "Companies Act", "Consumer Act"],
    answer: 1,
    hint: "Information Technology Act governs cybercrime.",
  },
  {
    q: "Why are Ponzi schemes unsustainable?",
    choices: ["Depend on endless new investors", "Government bans them", "They lack RBI approval", "Returns too low"],
    answer: 0,
    hint: "Ponzi = pay old investors with new money.",
  },
  {
    q: "What is 'card skimming'?",
    choices: ["ATM cleaning", "Cloning card data via hidden device", "Saving card in wallet app", "Bank encryption"],
    answer: 1,
    hint: "Skimmers steal card info during swipe.",
  },
  {
    q: "How do fraudsters exploit 'Buy Now, Pay Later' (BNPL)?",
    choices: ["Open fake accounts", "Max out limit then vanish", "Identity theft misuse", "All of these"],
    answer: 3,
    hint: "BNPL fraud uses synthetic identities and theft.",
  },
  {
    q: "Which authority handles cross-border scam cases in India?",
    choices: ["SEBI", "RBI", "Interpol + CBI + CERT-In", "NPCI"],
    answer: 2,
    hint: "CERT-In + CBI coordinate cybercrime internationally.",
  },
  {
    q: "Why are fake investment Telegram groups dangerous?",
    choices: ["Pump-and-dump traps", "False tips", "Impersonated experts", "All of these"],
    answer: 3,
    hint: "Scammers exploit social proof & FOMO.",
  },
  {
    q: "What’s the safest way to verify RBI circulars?",
    choices: ["Social media forwards", "WhatsApp PDFs", "Direct RBI official website", "Bank agent call"],
    answer: 2,
    hint: "Always check rbi.org.in.",
  },
  {
    q: "If fraudsters threaten you with 'police case unless you pay', what should you do?",
    choices: ["Pay quickly", "Ignore & report to cyber cell", "Give Aadhaar", "Share UPI PIN"],
    answer: 1,
    hint: "This is an extortion scam, not real police.",
  },
];

// const BANK = HARD_BANK.map((q, i) => ({
//   ...q,
//   id: (i + 1).toString(),
//   // add id for easier tracking
//   choices: q.choices.map((c, j) => ({ text: c, id: j })),
//   // convert choices to objects with id
//   answer: q.answer >= 0 ? q.choices[q.answer].id : null, // convert answer to id
// }));

/* FLIP bank: alternative financial-literacy questions used when user 'flips' the question */
const FLIP_BANK = [
  {
    q: "If a website asks for your OTP to 'unlock' money, you should…",
    choices: ["Share OTP - it's secure", "Enter OTP in site field", "Never share OTP with sites or people", "Text OTP to bank"],
    answer: 2,
    hint: "OTP is for you alone; banks won't ask you to share it.",
  },
  {
    q: "Which credential is safe to share publicly?",
    choices: ["Passport number", "Bank account password", "IFSC code for receiving funds", "Full PAN number"],
    answer: 2,
    hint: "IFSC is used for credit transfers and is not secret.",
  },
  {
    q: "A loan app offers instant approval but asks for your Aadhaar & banking OTP. This is likely…",
    choices: ["A trusted service", "A privacy-first lender", "A scam / data-harvester", "A government program"],
    answer: 2,
    hint: "Legitimate lenders won't require OTP sharing for approval.",
  },
  {
    q: "Which action reduces risk of card fraud?",
    choices: ["Save card on many sites", "Use CVV in public chats", "Use virtual/one-time card numbers for web purchases", "Share card photo for verification"],
    answer: 2,
    hint: "Virtual cards limit exposure when shopping online.",
  },
  {
    q: "An unknown caller claims to be from RBI and asks for bank login details. You should…",
    choices: ["Give details to be safe", "Ask caller to email proof and verify independently", "Call back using number on your bank’s website", "Both 2 and 3"],
    answer: 3,
    hint: "Always verify via official channels (bank website number); RBI won't ask for login details.",
  },
];

const LADDER = [
  "₹1,000","₹2,000","₹3,000","₹5,000","₹10,000",
  "₹20,000","₹40,000","₹80,000","₹1,60,000","₹3,20,000"
];
// Milestones after Q5 and Q10 (0-indexed indices 4 and 9)
const MILESTONES = new Set([4, 9]);

/* -------------------- COMPONENT -------------------- */

export default function KBCQuiz({ onExit }) {
  const theme = useTheme();
  const ACCENT = theme?.colors?.primary || "#FF9900";
  const TEXT = theme?.colors?.onSurface || "#F3F4F6";

  // gameplay state
  const [idx, setIdx] = useState(0);
  const [locked, setLocked] = useState(false);
  const [picked, setPicked] = useState(null);
  const [seconds, setSeconds] = useState(45);
  const [fiftyUsed, setFiftyUsed] = useState(false);
  const [audienceUsed, setAudienceUsed] = useState(false);
  const [flipUsed, setFlipUsed] = useState(false); // replaced phone lifeline with flip
  const [hiddenOptions, setHiddenOptions] = useState([]);
  const [audiencePoll, setAudiencePoll] = useState(null);
  const [bestSafe, setBestSafe] = useState(0);

  // track which questions have been flipped (map of index -> true)
  const [flippedMap, setFlippedMap] = useState({});

  // sheet animations
  const resultOpen = useRef(false);
  const resultY = useRef(new Animated.Value(400)).current;  // bottom sheet
  const dimOpacity = useRef(new Animated.Value(0)).current; // backdrop
  const timerRef = useRef(null);

  // select question: if flipped for this index, take FLIP_BANK else original BANK
  const q = flippedMap[idx] ? FLIP_BANK[idx] : BANK[idx];
  const correctIdx = q?.answer ?? null;

  /* -------- Orientation: lock PORTRAIT on mount -------- */
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT_UP
        );
      } catch {}
    })();
    return () => {
      if (!active) return;
      (async () => {
        try {
          // return to default (allow device setting) when leaving quiz
          await ScreenOrientation.lockAsync(
            ScreenOrientation.OrientationLock.DEFAULT
          );
        } catch {}
      })();
    };
  }, []);

  /* -------- Restore & persist progress -------- */
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (typeof s.idx === "number") setIdx(Math.min(s.idx, BANK.length - 1));
          if (typeof s.bestSafe === "number") setBestSafe(s.bestSafe);
          // restore flippedMap & lifelines if present (best-effort)
          if (s.flippedMap) setFlippedMap(s.flippedMap);
          if (s.flipUsed) setFlipUsed(s.flipUsed);
          if (s.fiftyUsed) setFiftyUsed(s.fiftyUsed);
          if (s.audienceUsed) setAudienceUsed(s.audienceUsed);
        }
      } catch {}
    })();
  }, []);
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ idx, bestSafe, flippedMap, flipUsed, fiftyUsed, audienceUsed })
        );
      } catch {}
    })();
  }, [idx, bestSafe, flippedMap, flipUsed, fiftyUsed, audienceUsed]);

  /* -------- Android back button: close sheet > exit -------- */
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (resultOpen.current) { closeResult(); return true; }
      onExit?.();
      return true;
    });
    return () => sub.remove();
  }, [onExit]);

  /* -------- Per-question setup -------- */
  useEffect(() => {
    setLocked(false);
    setPicked(null);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setSeconds(45);
  }, [idx]);

  /* -------- Timer -------- */
  useEffect(() => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSeconds((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          if (picked === null) handlePick(-1); // timeout
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [idx, picked]);

  const prizeNow = LADDER[Math.min(idx, LADDER.length - 1)];
  const safePrize = bestSafe > 0 ? LADDER[bestSafe - 1] : "₹0";

  /* -------- Lifelines -------- */
  const use5050 = () => {
    if (fiftyUsed || locked) return;
    const wrongs = [0,1,2,3].filter(i => i !== correctIdx);
    shuffleInPlace(wrongs);
    setHiddenOptions([wrongs[0], wrongs[1]]);
    setFiftyUsed(true);
  };
  const useAudience = () => {
    if (audienceUsed || locked) return;
    setAudiencePoll(calcAudiencePoll(correctIdx));
    setAudienceUsed(true);
  };
  /* Flip lifeline: replace current question with an alternative financial-literacy question */
  const useFlip = () => {
    if (flipUsed || locked) return;
    // mark flipped
    setFlippedMap(prev => ({ ...(prev || {}), [idx]: true }));
    setFlipUsed(true);
    // clear temporary UI so player sees fresh question
    setPicked(null);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setSeconds(45);
  };

  /* -------- Answer flow -------- */
  const handlePick = (i) => {
    if (locked) return;
    setPicked(i);
    setLocked(true);
    const ok = i === correctIdx;
    if (ok && MILESTONES.has(idx)) setBestSafe(idx + 1);
    setTimeout(() => openResult(ok), 420);
  };

  /* -------- Result Sheet -------- */
  const openResult = () => {
    resultOpen.current = true;
    Animated.parallel([
      Animated.timing(resultY, { toValue: 0, duration: 240, useNativeDriver: true }),
      Animated.timing(dimOpacity, { toValue: 0.35, duration: 240, useNativeDriver: true }),
    ]).start();
  };
  const closeResult = () => {
    resultOpen.current = false;
    Animated.parallel([
      Animated.timing(resultY, { toValue: 400, duration: 220, useNativeDriver: true }),
      Animated.timing(dimOpacity, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  };
  const goNextOrEnd = () => {
    closeResult();
    if (idx === BANK.length - 1 || picked !== correctIdx) return;
    setIdx((v) => v + 1);
  };
  const resetGame = () => {
    closeResult();
    setIdx(0);
    setBestSafe(0);
    setFiftyUsed(false);
    setAudienceUsed(false);
    setFlipUsed(false);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setFlippedMap({});
    setPicked(null);
    setLocked(false);
    setSeconds(45);
  };

  const canShow = (i) => !hiddenOptions.includes(i);
  const activeIsMilestone = MILESTONES.has(idx);

  return (
    <View style={{ flex: 1 }}>
      <NeonBG />

      <SafeAreaView style={styles.root} edges={["top", "left", "right"]}>
        {/* HEADER */}
        <View style={styles.headerRow}>
          <IconButton icon="close" onPress={onExit} />
          <View style={{ flex: 1, paddingHorizontal: 8 }}>
            <ProgressBar progress={seconds/45} color={ACCENT} />
            <View style={styles.headerMeta}>
              <Text style={styles.muted}>{seconds}s</Text>
              <View style={styles.metaChips}>
                <Chip compact style={styles.metaChip} textStyle={{ color: TEXT }}>
                  {prizeNow}
                </Chip>
                <Chip compact style={styles.metaChip} textStyle={{ color: TEXT }}>
                  Safe: {safePrize}
                </Chip>
              </View>
            </View>
          </View>
        </View>

        {/* CONTENT SCROLL (portrait stack) */}
        <ScrollView
          contentContainerStyle={styles.scrollBody}
          showsVerticalScrollIndicator={false}
        >
          {/* LADDER (compact grid, portrait-friendly) - MOVED TO TOP */}
          <Card style={styles.ladderCard}>
            <View style={styles.ladderHeader}>
              <Text style={{ fontWeight: "800" }}>Money Ladder</Text>
            </View>
            <Divider style={{ opacity: 0.08 }} />
            <View style={styles.ladderGrid}>
              {LADDER.map((p, i) => ({ p, i }))
                .reverse()
                .map(({ p, i }) => {
                  const active = i === idx;
                  const milestone = MILESTONES.has(i);
                  return (
                    <View key={i} style={styles.ladderItem}>
                      <Text style={[styles.ladderNo, styles.muted]}>
                        {i + 1 < 10 ? `0${i + 1}` : i + 1}
                      </Text>
                      <Text
                        style={[
                          styles.ladderAmt,
                          {
                            fontWeight: active ? "800" : "600",
                            color: active ? TEXT : (milestone ? ACCENT : "#A3A3A3"),
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {p}
                      </Text>
                      {active ? (
                        <Ionicons name="ellipse" size={6} color={ACCENT} style={{ marginLeft: 6 }} />
                      ) : null}
                    </View>
                  );
                })}
            </View>
          </Card>

          {/* QUESTION */}
          <Card style={styles.question}>
            <Card.Content>
              <Text variant="titleMedium" style={styles.qText}>
                {q?.q}
              </Text>
              {activeIsMilestone ? (
                <View style={styles.milestoneRow}>
                  <Badge size={18} style={{ backgroundColor: ACCENT }}>Milestone</Badge>
                  <Text style={[styles.muted, { marginLeft: 8 }]}>
                    Guaranteed if you clear this!
                  </Text>
                </View>
              ) : null}
            </Card.Content>
          </Card>

          {/* OPTIONS (2x2 grid that scales nicely in portrait) */}
          <View style={styles.optionsGrid}>
            {[0,1,2,3].map((i) => {
              if (!canShow(i)) return <View key={i} style={styles.optCell} />;
              const isPicked = picked === i;
              const isCorrect = locked && i === correctIdx;
              const bg = isCorrect
                ? "rgba(34,197,94,0.16)"
                : isPicked
                ? "rgba(255,153,0,0.16)"
                : "rgba(255,255,255,0.04)";
              const border = isCorrect
                ? "#22c55e"
                : isPicked
                ? ACCENT
                : "rgba(255,255,255,0.08)";
              return (
                <View key={i} style={styles.optCell}>
                  <TouchableOpacity
                    activeOpacity={0.92}
                    onPress={() => handlePick(i)}
                    disabled={locked}
                    style={{ flex: 1 }}
                    accessibilityRole="button"
                    accessibilityState={{ disabled: locked }}
                  >
                    <LinearGradient
                      colors={["rgba(255,255,255,0.05)","rgba(255,255,255,0.02)"]}
                      start={{x:0,y:0}} end={{x:1,y:1}}
                      style={[styles.optPill, { backgroundColor: bg, borderColor: border }]}
                    >
                      <Text style={styles.optLetter}>{String.fromCharCode(65+i)}</Text>
                      <Text style={styles.optText}>{q?.choices[i]}</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* LIFELINES */}
          <View style={styles.toolsRow}>
            <Life label="50:50" icon="close-circle-outline" onPress={use5050} disabled={fiftyUsed || locked} accent={ACCENT} />
            <Life label="Audience" icon="people-outline" onPress={useAudience} disabled={audienceUsed || locked} accent={ACCENT} />
            {/* Replaced Phone with Flip lifeline (changes the current question) */}
            <Life label="Flip" icon="swap-horizontal-outline" onPress={useFlip} disabled={flipUsed || locked} accent={ACCENT} />
          </View>

          {/* Audience / Hint panel */}
          {audiencePoll && !audiencePoll.hintOnly ? (
            <Card style={styles.panel}>
              <Card.Title title="Audience Poll" titleStyle={{ color: TEXT }} />
              <Card.Content>
                {[0,1,2,3].map((i) => (
                  <View key={i} style={{ marginBottom: 6 }}>
                    <Text style={{ color: TEXT, marginBottom: 4 }}>
                      {String.fromCharCode(65+i)} — {audiencePoll[i]}%
                    </Text>
                    <ProgressBar progress={audiencePoll[i]/100} color={ACCENT} />
                  </View>
                ))}
              </Card.Content>
            </Card>
          ) : audiencePoll?.hintOnly ? (
            <Card style={styles.panel}>
              <Card.Title title="Phone-a-Friend" titleStyle={{ color: TEXT }} />
              <Card.Content>
                <Text style={{ color: TEXT }}>{audiencePoll.text}</Text>
              </Card.Content>
            </Card>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      {/* DIM BACKDROP */}
      <Portal>
        <Animated.View
          pointerEvents={resultOpen.current ? "auto" : "none"}
          style={[styles.dim, { opacity: dimOpacity }]}
        />
      </Portal>

      {/* RESULT SHEET */}
      <Portal>
        <Animated.View style={[styles.resultSheet, { transform: [{ translateY: resultY }] }]}>
          <View style={styles.resultGrip} />
          <Text style={{ fontWeight: "800", fontSize: 18, marginBottom: 6 }}>
            {picked === correctIdx
              ? (idx === BANK.length - 1 ? "Champion!" : "Correct ✅")
              : picked === -1
              ? "Time's up ⏰"
              : "Incorrect ❌"}
          </Text>
          <Text style={{ opacity: 0.8, marginBottom: 12 }}>
            Guaranteed winnings: <Text style={{ fontWeight: "bold" }}>{bestSafe > 0 ? LADDER[bestSafe - 1] : "₹0"}</Text>
          </Text>

          <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
            {picked === correctIdx && idx < BANK.length - 1 ? (
              <>
                <Button mode="contained" onPress={goNextOrEnd}>Next Question</Button>
                <Button mode="outlined" onPress={resetGame}>Restart</Button>
                <Button onPress={onExit}>Exit</Button>
              </>
            ) : (
              <>
                <Button mode="contained" onPress={resetGame}>Retry</Button>
                <Button mode="outlined" onPress={onExit}>Exit</Button>
              </>
            )}
          </View>
          <Button onPress={closeResult} style={{ marginTop: 8 }}>Close</Button>
        </Animated.View>
      </Portal>
    </View>
  );
}

/* -------------------- UI bits -------------------- */

function NeonBG() {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(a, { toValue: 1, duration: 6000, useNativeDriver: false }),
        Animated.timing(a, { toValue: 0, duration: 6000, useNativeDriver: false }),
      ])
    ).start();
  }, [a]);
  const left = a.interpolate({ inputRange: [0,1], outputRange: ["-10%", "5%"] });
  const top = a.interpolate({ inputRange: [0,1], outputRange: ["-12%", "-6%"] });
  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={["#0a0a0a", "#090909"]} style={StyleSheet.absoluteFill} />
      <Animated.View style={{ position: "absolute", width: 280, height: 280, borderRadius: 220, left, top, opacity: 0.55 }}>
        <LinearGradient colors={["#FF990033", "#FF990000"]} style={{ flex: 1, borderRadius: 220 }} />
      </Animated.View>
      <View style={{ position: "absolute", width: 320, height: 320, borderRadius: 260, right: -60, bottom: -40, opacity: 0.6 }}>
        <LinearGradient colors={["#6b21a855", "#6b21a800"]} style={{ flex: 1, borderRadius: 260 }} />
      </View>
    </View>
  );
}

function Life({ icon, label, disabled, onPress, accent }) {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}>
      <LinearGradient
        colors={disabled ? ["#1a1a1a", "#151515"] : ["#1d1d1d", "#141414"]}
        start={{x:0,y:0}} end={{x:1,y:1}}
        style={[styles.lifeBtn, { borderColor: disabled ? "#333" : accent, opacity: disabled ? 0.55 : 1 }]}
      >
        <Ionicons name={icon} size={18} color={disabled ? "#777" : accent} />
        <Text style={{ color: "#E5E7EB", marginLeft: 6, fontWeight: "700" }}>{label}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

/* -------------------- helpers -------------------- */
function shuffleInPlace(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
}
function calcAudiencePoll(correct) {
  const base = [0,0,0,0];
  let remaining = 100;
  const correctPct = rand(45, 70);
  base[correct] = correctPct; remaining -= correctPct;
  const others = [0,1,2,3].filter(i => i !== correct);
  shuffleInPlace(others);
  const a = rand(10, Math.min(40, remaining)); remaining -= a;
  const b = rand(5, Math.min(30, remaining)); remaining -= b;
  const c = remaining;
  base[others[0]] = a; base[others[1]] = b; base[others[2]] = c;
  return base;
}
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

/* -------------------- styles -------------------- */
const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 12, paddingTop: 6 },
  muted: { color: "#A3A3A3" },

  headerRow: { flexDirection: "row", alignItems: "center" },
  headerMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 2 },
  metaChips: { flexDirection: "row", gap: 6, alignItems: "center" },
  metaChip: { backgroundColor: "rgba(20,20,20,0.6)" },

  scrollBody: { paddingBottom: 24 },

  question: {
    marginTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,20,20,0.45)",
  },
  qText: { color: "#fff", textAlign: "center", lineHeight: 24 },
  milestoneRow: { flexDirection: "row", alignItems: "center", marginTop: 8, justifyContent: "center" },

  optionsGrid: {
    marginTop: 12,
    gap: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  optCell: { width: "48.5%", minHeight: 76 },
  optPill: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  optLetter: { width: 22, textAlign: "center", color: "#A3A3A3", fontWeight: "800", marginRight: 8 },
  optText: { color: "#F3F4F6", fontWeight: "600", flexShrink: 1 },

  toolsRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10, justifyContent: "center" },

  panel: {
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,20,20,0.45)",
  },

  ladderCard: {
    marginTop: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    backgroundColor: "rgba(20,20,20,0.55)",
    overflow: "hidden",
  },
  ladderHeader: { paddingHorizontal: 12, paddingVertical: 10 },
  ladderGrid: {
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    columnGap: 10,
    rowGap: 8,
  },
  ladderItem: {
    width: "47.5%", // 2-column grid
    flexDirection: "row",
    alignItems: "center",
  },
  ladderNo: { width: 32, textAlign: "right" },
  ladderAmt: { marginLeft: 8 },

  lifeBtn: { flexDirection: "row", alignItems: "center", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1 },

  // dim backdrop
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: "black" },

  // result sheet (bottom)
  resultSheet: {
    position: "absolute",
    left: 0, right: 0, bottom: 0,
    padding: 16,
    backgroundColor: "#101014",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  resultGrip: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.2)",
    marginBottom: 12,
  },
});