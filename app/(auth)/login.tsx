import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  ACCESS_TOKEN_KEY,
  PENDING_NAME_KEY,
  REFRESH_TOKEN_KEY,
  USER_NAME_KEY,
  USER_PHONE_KEY,
} from "@/auth/session";
import { API_BASE_URL } from "@/config/runtime";
import { loginSuccess } from "@/features/auth/slice";
import { useAppDispatch } from "@/store/hooks";
import { IconSymbol } from "components/ui/icon-symbol";

type Step = "welcome" | "profile" | "otp";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [step, setStep] = useState<Step>("welcome");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const phoneValid = useMemo(() => phone.trim().length >= 10, [phone]);
  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const otpValid = useMemo(() => otp.trim().length >= 4, [otp]);

  const sendOtp = async () => {
    setError("");
    if (!API_BASE_URL) {
      setError("Missing API base URL.");
      return;
    }
    if (!nameValid || !phoneValid) {
      setError("Enter a valid name and phone number.");
      return;
    }
    setIsSubmitting(true);
    try {
      await SecureStore.setItemAsync(PENDING_NAME_KEY, name.trim());
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: phone.trim() }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload?.message ?? "Failed to send OTP.");
      }
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError(`Unable to send OTP. Try again. ${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitOtp = async () => {
    setError("");
    if (!API_BASE_URL) {
      setError("Missing API base URL.");
      return;
    }
    if (!otpValid) {
      setError("Enter the OTP sent to your phone.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          phone_number: phone.trim(),
          otp: otp.trim(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? "Login failed.");
      }
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, payload.access_token);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, payload.refresh_token);
      await SecureStore.setItemAsync(USER_NAME_KEY, name.trim());
      await SecureStore.setItemAsync(USER_PHONE_KEY, phone.trim());
      dispatch(loginSuccess());
      router.replace("/(tabs)/map");
    } catch (err) {
      setError(`${err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === "welcome") {
    return (
      <View style={styles.container}>
        <View style={styles.logoWrap}>
          <View style={styles.logoRing} />
          <View style={styles.logoDot} />
          <IconSymbol name="bolt.fill" size={44} color="#22B9C4" />
        </View>
        <Text style={styles.brand}>Vajra Volt</Text>
        <Text style={styles.tagline}>CHARGING</Text>

        <Pressable
          style={styles.button}
          onPress={() => setStep("profile")}
          disabled={isSubmitting}
        >
          <Text style={styles.buttonText}>Get started</Text>
        </Pressable>
      </View>
    );
  }

  if (step === "profile") {
    return (
      <View style={styles.container}>
        <Text style={styles.screenTitle}>Get started</Text>
        <Text style={styles.screenSubtitle}>
          Enter your name and phone number to continue.
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Name</Text>
          <TextInput value={name} onChangeText={setName} style={styles.input} />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Mobile number</Text>
          <TextInput
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
            keyboardType="phone-pad"
          />
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Pressable
          style={[styles.button, styles.fullButton]}
          onPress={sendOtp}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Send OTP</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.screenTitle}>Verify OTP</Text>
      <Text style={styles.screenSubtitle}>Enter the code sent to {phone}.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>OTP</Text>
        <TextInput
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          keyboardType="number-pad"
        />
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        style={[styles.button, styles.fullButton]}
        onPress={submitOtp}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Verify & Continue</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#FFFFFF",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 10,
  },
  screenSubtitle: {
    fontSize: 14,
    color: "#6C7CA6",
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
  },
  logoWrap: {
    width: 140,
    height: 140,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  logoRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: "rgba(34, 185, 196, 0.35)",
  },
  logoDot: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#22B9C4",
    right: 16,
    top: 40,
  },
  brand: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
  },
  tagline: {
    marginTop: 6,
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: "700",
    color: "#7B8AB0",
  },
  button: {
    marginTop: 36,
    backgroundColor: "#21B3A7",
    paddingVertical: 12,
    paddingHorizontal: 26,
    borderRadius: 999,
  },
  fullButton: {
    alignSelf: "stretch",
    marginTop: 12,
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
  inputGroup: {
    alignSelf: "stretch",
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A2850",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F3F6FB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.2)",
  },
  errorText: {
    color: "#E11D2E",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
});
