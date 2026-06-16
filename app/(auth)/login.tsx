import { useRouter } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  ACCESS_TOKEN_KEY,
  PENDING_NAME_KEY,
  REFRESH_TOKEN_KEY,
  USER_EMAIL_KEY,
  USER_NAME_KEY,
} from "@/auth/session";
import * as storage from "@/auth/secureStorage";
import { API_BASE_URL } from "@/config/runtime";
import { loginSuccess } from "@/features/auth/slice";
import { useMarketingLayout } from "@/hooks/use-responsive-layout";
import { useAppDispatch } from "@/store/hooks";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";
import { LightningBrandMark } from "components/vajra/LightningBrandMark";

type Step = "welcome" | "profile" | "otp";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { pagePad, isCompact, isExpanded } = useMarketingLayout();
  const [step, setStep] = useState<Step>(() =>
    Platform.OS === "web" ? "profile" : "welcome",
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpFocused, setOtpFocused] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedField, setFocusedField] = useState<"name" | "email" | null>(null);
  const otpInputRef = useRef<TextInput>(null);
  const cursorAnim = useRef(new Animated.Value(1)).current;

  const emailValid = useMemo(
    () => email.trim().includes("@") && email.trim().length >= 5,
    [email],
  );
  const nameValid = useMemo(() => name.trim().length >= 2, [name]);
  const otpValid = otp.length === 6;

  const handleOtpChange = (text: string) => {
    const digits = text.replace(/[^0-9]/g, "").slice(0, 6);
    setOtp(digits);
  };

  const startCursorBlink = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(cursorAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(cursorAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      ])
    ).start();
  };

  const sendOtp = async () => {
    setError("");
    if (!API_BASE_URL) {
      setError("Missing API base URL.");
      return;
    }
    if (!nameValid || !emailValid) {
      setError("Enter a valid name and email address.");
      return;
    }
    setIsSubmitting(true);
    try {
      await storage.setItemAsync(PENDING_NAME_KEY, name.trim());
      const response = await fetch(`${API_BASE_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.error ?? "Failed to send OTP.");
      }
      if (typeof payload?.otp === "string" && payload.otp.length > 0) {
        setOtp(payload.otp.replace(/[^0-9]/g, "").slice(0, 6));
      }
      setStep("otp");
      setTimeout(() => otpInputRef.current?.focus(), 100);
    } catch (err) {
      console.error(err);
      const hint =
        err instanceof TypeError &&
        String((err as Error).message).toLowerCase().includes("fetch")
          ? " Check EXPO_PUBLIC_API_BASE_URL in .env and restart Expo. If you see CORS errors on web, set EXPO_PUBLIC_USE_METRO_API_PROXY=true to route through the dev server."
          : "";
      setError(`Unable to send code. Try again. ${err}${hint}`);
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
      setError("Enter the code sent to your email.");
      return;
    }
    setIsSubmitting(true);
    try {
      const normEmail = email.trim().toLowerCase();
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: name.trim(),
          email: normEmail,
          otp: otp.trim(),
        }),
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload?.message ?? payload?.error ?? "Login failed.");
      }
      await storage.setItemAsync(ACCESS_TOKEN_KEY, payload.access_token);
      await storage.setItemAsync(REFRESH_TOKEN_KEY, payload.refresh_token);
      await storage.setItemAsync(USER_NAME_KEY, name.trim());
      await storage.setItemAsync(USER_EMAIL_KEY, normEmail);
      dispatch(loginSuccess());
      router.replace("/(tabs)/qr");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Login failed. Check your code and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = (field: "name" | "email") => [
    styles.input,
    focusedField === field && styles.inputFocused,
  ];

  const handleBack = () => {
    if (step === "otp") {
      setStep("profile");
      setOtp("");
      setError("");
      return;
    }
    if (Platform.OS === "web") {
      router.replace("/(auth)/landing");
    } else {
      setStep("welcome");
    }
  };

  if (step === "welcome") {
    return (
      <SafeAreaView style={styles.modeLoginRoot} edges={["top", "bottom", "left", "right"]}>
        <View
          style={[
            styles.loginColumn,
            styles.loginColumnWelcome,
            { paddingHorizontal: pagePad },
          ]}
        >
          <LightningBrandMark />
          <Text style={styles.brand}>Vajra Volt</Text>
          <Text style={styles.tagline}>CHARGING</Text>

          <Pressable
            style={styles.primaryBtn}
            onPress={() => setStep("profile")}
            disabled={isSubmitting}
          >
            <Text style={styles.primaryBtnText}>Get started</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.modeLoginRoot} edges={["top", "bottom", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.fill}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={[
            styles.flowScroll,
            { paddingHorizontal: pagePad },
            isExpanded && styles.flowScrollExpanded,
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View
            style={[
              styles.loginColumn,
              { paddingHorizontal: 0 },
              isCompact && styles.loginColumnCompact,
              isExpanded && styles.loginColumnExpanded,
            ]}
          >
            <Pressable
              style={styles.backBtn}
              onPress={handleBack}
              accessibilityRole="button"
              accessibilityLabel="Go back"
            >
              <IconSymbol name="arrow.left" size={18} color={V.headingDeep} />
            </Pressable>
          {step === "profile" ? (
            <>
              <Text style={styles.screenTitle}>Get started</Text>
              <Text style={styles.screenSubtitle}>
                Enter your name and email. We will send a verification code.
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  style={inputStyle("name")}
                  onFocus={() => setFocusedField("name")}
                  onBlur={() => setFocusedField(null)}
                  placeholder="Your full name"
                  placeholderTextColor={V.label}
                  autoComplete="name"
                  textContentType="name"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={inputStyle("email")}
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  importantForAutofill="yes"
                  placeholder="you@example.com"
                  placeholderTextColor={V.label}
                />
              </View>
            </>
          ) : (
            <>
              <Text style={styles.screenTitle}>Verify email</Text>
              <Text style={styles.screenSubtitle}>
                Enter the code sent to{" "}
                <Text style={styles.emailHighlight}>
                  {email.trim().toLowerCase()}
                </Text>
                .
              </Text>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>6-digit code</Text>
                <Pressable
                  style={styles.otpRow}
                  onPress={() => otpInputRef.current?.focus()}
                >
                  {/* Hidden input captures all typing and paste */}
                  <TextInput
                    ref={otpInputRef}
                    value={otp}
                    onChangeText={handleOtpChange}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    onFocus={() => { setOtpFocused(true); startCursorBlink(); }}
                    onBlur={() => { setOtpFocused(false); cursorAnim.stopAnimation(); }}
                    style={styles.otpHiddenInput}
                    caretHidden
                  />
                  {[0, 1, 2, 3, 4, 5].map((i) => {
                    const char = otp[i] ?? "";
                    const isActive = otpFocused && i === otp.length && otp.length < 6;
                    return (
                      <View
                        key={i}
                        style={[
                          styles.otpBox,
                          char !== "" && styles.otpBoxFilled,
                          isActive && styles.otpBoxActive,
                        ]}
                      >
                        {char !== "" ? (
                          <Text style={styles.otpDigitText}>{char}</Text>
                        ) : isActive ? (
                          <Animated.View style={[styles.otpCursor, { opacity: cursorAnim }]} />
                        ) : null}
                      </View>
                    );
                  })}
                </Pressable>
              </View>
              <Pressable
                style={{ alignSelf: "stretch" }}
                onPress={() => {
                  setStep("profile");
                  setOtp("");
                  setError("");
                }}
              >
                <Text style={styles.secondaryLink}>{'\u2190'} Change email</Text>
              </Pressable>
            </>
          )}

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {step === "profile" ? (
            <Pressable
              style={[styles.primaryBtn, styles.fullBtn]}
              onPress={sendOtp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={V.card} />
              ) : (
                <Text style={styles.primaryBtnText}>Send code</Text>
              )}
            </Pressable>
          ) : (
            <Pressable
              style={[styles.primaryBtn, styles.fullBtn]}
              onPress={submitOtp}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color={V.card} />
              ) : (
                <Text style={styles.primaryBtnText}>Verify & Continue</Text>
              )}
            </Pressable>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modeLoginRoot: {
    flex: 1,
    backgroundColor: V.card,
  },
  fill: {
    flex: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.pageBg,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    marginBottom: 20,
  },
  loginColumn: {
    flex: 1,
    width: "100%",
    maxWidth: V.loginColumnMax,
    alignSelf: "center",
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "stretch",
  },
  loginColumnCompact: {
    maxWidth: "100%",
  },
  loginColumnExpanded: {
    maxWidth: 440,
  },
  flowScroll: {
    flexGrow: 1,
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 24,
  },
  flowScrollExpanded: {
    paddingTop: 32,
    paddingBottom: 40,
  },
  loginColumnWelcome: {
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "700",
    color: V.headingDeep,
    textAlign: "center",
  },
  tagline: {
    marginTop: 8,
    letterSpacing: 4,
    fontSize: 11,
    fontWeight: "700",
    color: V.labelStrong,
    textAlign: "center",
  },
  screenTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
    marginBottom: 8,
    alignSelf: "stretch",
  },
  screenSubtitle: {
    fontSize: 14,
    color: V.bodySecondary,
    fontWeight: "600",
    marginBottom: 20,
    lineHeight: 20,
    alignSelf: "stretch",
  },
  emailHighlight: {
    fontWeight: "700",
    color: V.heading,
  },
  inputGroup: {
    marginBottom: 16,
    alignSelf: "stretch",
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: V.heading,
    marginBottom: 8,
  },
  input: {
    backgroundColor: V.pageBg,
    borderRadius: V.radiusInput,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: "600",
    color: V.headingDeep,
    borderWidth: 1,
    borderColor: V.borderNavyMedium,
  },
  inputFocused: {
    borderColor: V.focusRing,
    borderWidth: 2,
  },
  otpRow: {
    flexDirection: "row",
    gap: 10,
    alignSelf: "stretch",
  },
  otpHiddenInput: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
  otpBox: {
    flex: 1,
    height: 56,
    backgroundColor: V.pageBg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: V.borderNavyMedium,
    alignItems: "center",
    justifyContent: "center",
  },
  otpBoxFilled: {
    borderColor: V.primary,
    borderWidth: 2,
    backgroundColor: V.tealMuted,
  },
  otpBoxActive: {
    borderColor: V.primary,
    borderWidth: 2,
  },
  otpDigitText: {
    fontSize: 22,
    fontWeight: "700",
    color: V.headingDeep,
  },
  otpCursor: {
    width: 2,
    height: 24,
    borderRadius: 1,
    backgroundColor: V.primary,
  },
  secondaryLink: {
    fontSize: 12,
    fontWeight: "600",
    color: V.bodySecondary,
    marginBottom: 8,
  },
  errorText: {
    color: V.error,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginBottom: 4,
    alignSelf: "stretch",
  },
  primaryBtn: {
    marginTop: 24,
    backgroundColor: V.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: V.radiusPill,
  },
  fullBtn: {
    alignSelf: "stretch",
  },
  primaryBtnText: {
    color: V.card,
    textAlign: "center",
    fontWeight: "700",
    fontSize: 14,
  },
});
