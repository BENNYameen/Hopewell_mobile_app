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

import { useGetMeQuery, useUpdateProfileMutation } from "@/profile/profile.api";
import { IconSymbol } from "components/ui/icon-symbol";

export default function PersonalInfo() {
  const router = useRouter();
  const [showVerifyPrompt, setShowVerifyPrompt] = useState(false);
  const { data, isLoading, isError, error, refetch } = useGetMeQuery();
  const [updateProfile, { isLoading: isSaving }] = useUpdateProfileMutation();
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

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Validation", "Name is required.");
      return;
    }
    try {
      await updateProfile({ full_name: name.trim(), email: email.trim() }).unwrap();
      Alert.alert("Saved", "Your profile has been updated.");
    } catch {
      Alert.alert("Error", "Failed to save profile. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={18} color="#0F172A" />
          <Text style={styles.backText}>Back</Text>
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
        <Pressable
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isSaving}
        >
          <Text style={styles.saveText}>{isSaving ? "Saving..." : "Save"}</Text>
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
    backgroundColor: "#F3F6FB",
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  backText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#1A2850",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 18,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 200,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A2850",
    marginBottom: 8,
  },
  required: {
    color: "#E0586A",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.15)",
    fontSize: 14,
    color: "#0F172A",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  inputInline: {
    flex: 1,
    fontSize: 14,
    color: "#0F172A",
    paddingVertical: 4,
  },
  inputDisabled: {
    color: "#8B97B2",
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EEF2FA",
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
    color: "#1A2850",
  },
  unverified: {
    backgroundColor: "#FFECEE",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 8,
  },
  unverifiedText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#D11D2E",
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#F3F6FB",
  },
  saveButton: {
    backgroundColor: "#E11D2E",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "700",
  },
  errorBox: {
    backgroundColor: "#FFECEE",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F5B6BE",
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#C81D2C",
  },
  errorMessage: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#A82734",
  },
  retryButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#E11D2E",
    borderRadius: 999,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 20,
  },
  modalIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FFECEE",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A2850",
    textAlign: "center",
  },
  modalBody: {
    marginTop: 8,
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7CA6",
    textAlign: "center",
  },
  modalActions: {
    flexDirection: "row",
    marginTop: 18,
  },
  modalSecondary: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E11D2E",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    marginRight: 10,
  },
  modalSecondaryText: {
    color: "#E11D2E",
    fontSize: 12,
    fontWeight: "700",
  },
  modalPrimary: {
    flex: 1,
    backgroundColor: "#E11D2E",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  modalPrimaryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
