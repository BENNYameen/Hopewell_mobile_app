/**
 * Copy of Vajra web `HowToChargePage.tsx` step/tab content — single source for mobile.
 */

export type GuideTabId = "web" | "mobile" | "qr" | "rfid";

export type GuideStep = { title: string; description: string };

export type HowToChargeTab = {
  id: GuideTabId;
  label: string;
  emoji: string;
  steps: GuideStep[];
  tip: string;
};

const WEB_APP_STEPS: GuideStep[] = [
  {
    title: "Log in to Vajra Volt Web",
    description:
      "Open app.vajravolt.in in your browser and sign in with your email OTP.",
  },
  {
    title: 'Go to "Charge"',
    description:
      'Tap the QR / Charge tab in the bottom navigation or sidebar.',
  },
  {
    title: "Enter the Charger ID",
    description:
      "Type the charger ID printed on the station (e.g. VJR-001) into the input field and tap Verify.",
  },
  {
    title: "Confirm and Start",
    description:
      'Review the charger details and tap "Start Charging". Your session begins immediately.',
  },
  {
    title: "Monitor the session",
    description:
      "The dashboard shows live energy (kWh), cost (₹), and duration. You can also switch to your mobile app — it will pick up the same session.",
  },
  {
    title: "Stop charging",
    description:
      'Tap "Stop Charging" in the active session banner. The session closes and a summary is saved to your history.',
  },
];

const MOBILE_APP_STEPS: GuideStep[] = [
  {
    title: "Download Vajra Volt",
    description:
      "Install the Vajra Volt app from the Play Store or App Store and sign in with your email OTP.",
  },
  {
    title: 'Tap "Charge"',
    description: 'Hit the QR icon in the bottom tab bar to open the charging screen.',
  },
  {
    title: "Scan or enter the Charger ID",
    description:
      "Point your camera at the QR code on the charging station. The app reads the charger ID automatically.",
  },
  {
    title: "Verify the charger",
    description:
      "The app checks that the charger is online. A green tick means it is ready.",
  },
  {
    title: "Start the session",
    description:
      'Tap "Start Charging". Energy starts flowing and a live card appears on your home screen.',
  },
  {
    title: "Stop and review",
    description:
      'Tap "Stop" on the active session card. You will see your energy usage, cost, and duration in the session history.',
  },
];

const QR_STEPS: GuideStep[] = [
  {
    title: "Locate the QR code",
    description:
      "Every Vajra charging point has a unique QR code sticker on the unit, typically near the connector port.",
  },
  {
    title: "Open the Vajra Volt app or web",
    description:
      "Open the Vajra Volt mobile app or web app in your browser. Make sure you are logged in.",
  },
  {
    title: 'Tap "Charge" → Scan',
    description:
      'On the Charge screen, tap the camera/scan button and point your device at the QR code.',
  },
  {
    title: "Auto-fill and verify",
    description:
      "The charger ID is filled in automatically. The app confirms the charger is available.",
  },
  {
    title: "Start the session",
    description:
      'Tap "Start Charging". No manual ID entry needed — it is all from the QR scan.',
  },
  {
    title: "Unplug when done",
    description:
      "Stop the session from the app, then safely unplug your vehicle. Receipt appears in your session history.",
  },
];

const RFID_STEPS: GuideStep[] = [
  {
    title: "Get your Vajra RFID key",
    description:
      "Collect your RFID card or key fob from the Vajra Volt team. It is linked to your registered email account.",
  },
  {
    title: "Plug in your vehicle",
    description:
      "Connect the charging cable to your EV first, before tapping the RFID key.",
  },
  {
    title: "Tap the RFID key on the reader",
    description:
      "Hold your RFID card within 2 cm of the reader panel on the charger. A beep and green LED confirm the tap.",
  },
  {
    title: "Charging starts automatically",
    description:
      "The charger authenticates with Vajra's OCPP backend and begins the session. No phone needed at this step.",
  },
  {
    title: "Monitor on app (optional)",
    description:
      "Open the Vajra Volt app or web dashboard anytime to see live energy and cost for the RFID-started session.",
  },
  {
    title: "Stop: tap RFID again",
    description:
      "Tap the RFID key on the reader a second time to stop the session, or stop it remotely from the app.",
  },
];

export const HOW_TO_CHARGE_TABS: HowToChargeTab[] = [
  {
    id: "web",
    label: "Web App",
    emoji: "💻",
    steps: WEB_APP_STEPS,
    tip: "The web app and mobile app share the same session — start on one device and monitor from the other in real time.",
  },
  {
    id: "mobile",
    label: "Mobile App",
    emoji: "📱",
    steps: MOBILE_APP_STEPS,
    tip: "Your mobile session appears instantly on the web dashboard. Both clients stay in sync via WebSocket.",
  },
  {
    id: "qr",
    label: "QR Code",
    emoji: "⬛",
    steps: QR_STEPS,
    tip: "QR scanning works in both the mobile app and web browser (if your device has a camera). No typing required.",
  },
  {
    id: "rfid",
    label: "RFID Key",
    emoji: "🔑",
    steps: RFID_STEPS,
    tip: "RFID sessions are tracked the same as app sessions — view history, cost, and energy in your Vajra Volt dashboard.",
  },
];
