import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { useGetMeQuery } from "@/profile/profile.api";
import { V } from "@/theme/vajra";
import { IconSymbol } from "components/ui/icon-symbol";

export default function PersonalInfo() {
  const router = useRouter();
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const { data, isLoading, isError, error, refetch } = useGetMeQuery();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!data) return;
    setName(data.full_name ?? "");
    setPhone(data.phone_number ?? "");
    setEmail(data.email ?? "");
    if (data.is_email_verified === false) {
      setShowVerifyPrompt(true);
    }
  }, [data]);

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    Alert.alert(
      "Profile updates",
      "The server does not support editing profile fields yet. Name and email are set when you sign in.",
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backBtn} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={18} color="#0F172A" />
        </Pressable>

        <Text style={styles.title}>My Profile</Text>

        {isError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>Unable to load profile</Text>
            <Text style={styles.errorMessage}>
              {"data" in
              (error as { data?: { error?: string; message?: string } })
                ? ((error as { data?: { error?: string; message?: string } })
                    .data?.error ??
                  (error as { data?: { error?: string; message?: string } })
                    .data?.message ??
                  "Please check your connection and try again.")
                : "Please check your connection and try again."}
            </Text>
            <Pressable style={styles.retryButton} onPress={() => refetch()}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : null}

        <View style={styles.field}>
          <Text style={styles.label}>
            Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={styles.input}
            placeholder={isLoading ? "Loading..." : "Enter your name"}
            placeholderTextColor="#8B97B2"
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Mobile Number <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <View style={styles.countryCode}>
              <Text style={styles.flag}>🇮🇳</Text>
              <Text style={styles.codeText}>+91</Text>
            </View>
            <TextInput
              value={phone}
              editable={false}
              style={[styles.inputInline, styles.inputDisabled]}
              keyboardType="phone-pad"
              placeholderTextColor="#8B97B2"
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Email Address <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.inputRow}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.inputInline}
              placeholder={isLoading ? "Loading..." : "Enter your email"}
              placeholderTextColor="#8B97B2"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {data && !data.is_email_verified ? (
              <Pressable
                style={styles.unverified}
                onPress={() => setShowVerifyPrompt(true)}
              >
                <Text style={styles.unverifiedText}>Unverified</Text>
              </Pressable>
            ) : null}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Home Address</Text>
          <TextInput
            placeholder="Enter your Home address"
            placeholderTextColor="#8B97B2"
            style={[styles.input, styles.textArea]}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save</Text>
        </Pressable>
      </View>

      <Modal
        transparent
        visible={showVerifyPrompt}
        animationType="slide"
        onRequestClose={() => setShowVerifyPrompt(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setShowVerifyPrompt(false)}
        >
          <Pressable style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <IconSymbol name="email" size={22} color="#D11D2E" />
            </View>
            <Text style={styles.modalTitle}>Verify your email address</Text>
            <Text style={styles.modalBody}>
              Check your email and click the link to activate your account.
            </Text>
            <View style={styles.modalActions}>
              <Pressable
                style={styles.modalSecondary}
                onPress={() => setShowVerifyPrompt(false)}
              >
                <Text style={styles.modalSecondaryText}>Skip & do later</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary}>
                <Text style={styles.modalPrimaryText}>Resend the link</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: V.pageBg,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: V.borderNavy,
    backgroundColor: V.card,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: V.headingDeep,
    marginBottom: 18,
  },
  content: {
    paddingHorizontal: V.appPadH,
    paddingTop: 40,
    paddingBottom: 200,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: V.heading,
    marginBottom: 8,
  },
  required: {
    color: V.unavailable,
  },
  input: {
    backgroundColor: V.pageBg,
    borderRadius: V.radiusInput,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: V.borderNavyMedium,
    fontSize: 14,
    fontWeight: "600",
    color: V.headingDeep,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: V.pageBg,
    borderRadius: V.radiusInput,
    borderWidth: 1,
    borderColor: V.borderNavyMedium,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputInline: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: V.headingDeep,
    paddingVertical: 4,
  },
  inputDisabled: {
    color: V.label,
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: V.tealMuted,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 10,
  },
  flag: {
    marginRight: 6,
  },
  codeText: {
    fontSize: 13,
    fontWeight: "700",
    color: V.heading,
  },
  unverified: {
    backgroundColor: V.errorSurface,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  unverifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: V.error,
  },
  textArea: {
    minHeight: 110,
    textAlignVertical: "top",
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 90,
    paddingHorizontal: V.appPadH,
    paddingVertical: 16,
    backgroundColor: V.pageBg,
  },
  saveButton: {
    backgroundColor: V.primary,
    borderRadius: V.radiusPill,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveText: {
    color: V.card,
    fontSize: 14,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: V.errorSurface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: V.errorBorder,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: V.error,
  },
  errorMessage: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: V.error,
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: V.error,
    borderRadius: V.radiusPill,
  },
  retryText: {
    color: V.card,
    fontSize: 12,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: V.card,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: V.tealMuted,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: V.heading,
    textAlign: "center",
  },
  modalBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: V.bodySecondary,
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 18,
  },
  modalSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: V.borderNavy,
    paddingVertical: 12,
    borderRadius: V.radiusPill,
    alignItems: "center",
    marginRight: 10,
  },
  modalSecondaryText: {
    color: V.heading,
    fontSize: 12,
    fontWeight: "700",
  },
  modalPrimary: {
    flex: 1,
    backgroundColor: V.primary,
    paddingVertical: 12,
    borderRadius: V.radiusPill,
    alignItems: "center",
  },
  modalPrimaryText: {
    color: V.card,
    fontSize: 12,
    fontWeight: "700",
  },
});
