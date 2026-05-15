import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import WebView from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview";

import { USER_EMAIL_KEY, USER_NAME_KEY } from "@/auth/session";
import { getItemAsync } from "@/auth/secureStorage";
import { api } from "@/api/api";
import { useGetMeQuery } from "@/profile/profile.api";
import { useAppDispatch } from "@/store/hooks";
import { useInitiateTopupMutation } from "@/wallet/wallet.api";
import { IconSymbol } from "components/ui/icon-symbol";

function buildRazorpayHtml(options: object): string {
  const opts = JSON.stringify(options);
  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>html,body{margin:0;padding:0;background:#fff;}</style>
</head>
<body>
<script src="https://checkout.razorpay.com/v1/checkout.js"><\/script>
<script>
  window.onload = function() {
    var options = ${opts};
    options.handler = function(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'success',data:response}));
    };
    options.modal = { ondismiss: function() {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'dismiss'}));
    }};
    var rzp = new Razorpay(options);
    rzp.on('payment.failed', function(response) {
      window.ReactNativeWebView.postMessage(JSON.stringify({type:'error',data:response.error}));
    });
    rzp.open();
  };
<\/script>
</body>
</html>`;
}

export default function AddMoney() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data: me } = useGetMeQuery();
  const [amount, setAmount] = useState("500");
  const [paymentError, setPaymentError] = useState("");
  const [validationError, setValidationError] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "success" | "failure" | null
  >(null);
  const [checkoutHtml, setCheckoutHtml] = useState<string | null>(null);
  const [initiateTopup, { isLoading, error }] = useInitiateTopupMutation();

  const submitTopup = async () => {
    setPaymentError("");
    setValidationError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value < 100 || value > 10000) {
      setValidationError("Amount must be between ₹100 and ₹10,000.");
      return;
    }
    try {
      const order = await initiateTopup({ amount: value }).unwrap();

      if (!order.order_id || !order.key) {
        setPaymentError("Failed to create order. Please try again.");
        return;
      }

      const userName =
        me?.full_name ?? (await getItemAsync(USER_NAME_KEY)) ?? "Vajra Volt";
      const storedEmail = await getItemAsync(USER_EMAIL_KEY);
      const userContact =
        me?.phone_number?.trim() || storedEmail || "";

      setCheckoutHtml(
        buildRazorpayHtml({
          key: order.key,
          amount: order.amount,
          currency: order.currency,
          name: "Vajra Volt",
          description: "Wallet top-up",
          order_id: order.order_id,
          prefill: {
            name: userName,
            contact: userContact,
          },
          theme: { color: "#21B3A7" },
        }),
      );
    } catch (err) {
      setPaymentError(`Payment failed: ${err}`);
    }
  };

  const handleWebViewMessage = (event: { nativeEvent: { data: string } }) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data) as {
        type: string;
        data?: Record<string, unknown>;
      };
      setCheckoutHtml(null);
      if (msg.type === "success") {
        dispatch(
          api.util.invalidateTags(["WalletBalance", "WalletTransactions"]),
        );
        setPaymentStatus("success");
      } else if (msg.type === "error") {
        const errData = msg.data as { description?: string } | undefined;
        setPaymentError(
          `Payment failed: ${errData?.description ?? "Unknown error"}`,
        );
        setPaymentStatus("failure");
      }
    } catch {
      setCheckoutHtml(null);
    }
  };

  const handleNavRequest = (request: WebViewNavigation): boolean => {
    const { url } = request;
    if (
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("about:")
    ) {
      Linking.openURL(url).catch(() => {});
      return false;
    }
    return true;
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.backRow} onPress={() => router.back()}>
        <IconSymbol name="arrow.left" size={18} color="#0F172A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>
      <Text style={styles.title}>Add money</Text>
      <Text style={styles.body}>Top up your wallet balance here.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Amount (INR)</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="number-pad"
          style={styles.input}
        />
        <Text style={styles.hint}>Min ₹100, Max ₹10,000</Text>
      </View>

      {validationError ? (
        <Text style={styles.errorText}>{validationError}</Text>
      ) : null}
      {error ? (
        <Text style={styles.errorText}>
          {"data" in (error as { data?: { error?: string; message?: string } })
            ? ((error as { data?: { error?: string; message?: string } }).data
                ?.error ??
              (error as { data?: { error?: string; message?: string } }).data
                ?.message ??
              "Please check your connection and try again.")
            : "Please check your connection and try again."}
        </Text>
      ) : null}

      <Pressable
        style={styles.primaryButton}
        onPress={submitTopup}
        disabled={isLoading}
      >
        <Text style={styles.primaryText}>
          {isLoading ? "Creating..." : "Proceed to pay"}
        </Text>
      </Pressable>

      <Modal
        visible={checkoutHtml !== null}
        animationType="slide"
        onRequestClose={() => setCheckoutHtml(null)}
      >
        <WebView
          source={{
            html: checkoutHtml ?? "",
            baseUrl: "https://checkout.razorpay.com",
          }}
          onMessage={handleWebViewMessage}
          onShouldStartLoadWithRequest={handleNavRequest}
          javaScriptEnabled
          domStorageEnabled
          style={styles.webview}
        />
      </Modal>

      <Modal
        transparent
        visible={paymentStatus === "success"}
        animationType="fade"
        onRequestClose={() => setPaymentStatus(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPaymentStatus(null)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Payment successful</Text>
            <Text style={styles.modalBody}>
              Your wallet will update shortly.
            </Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => {
                setPaymentStatus(null);
                router.replace("/profile/wallet");
              }}
            >
              <Text style={styles.modalButtonText}>Go to Wallet</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        transparent
        visible={paymentStatus === "failure"}
        animationType="fade"
        onRequestClose={() => setPaymentStatus(null)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setPaymentStatus(null)}
        >
          <Pressable style={styles.modalCard}>
            <Text style={styles.modalTitle}>Payment failed</Text>
            <Text style={styles.modalBody}>{paymentError}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setPaymentStatus(null)}
            >
              <Text style={styles.modalButtonText}>Try again</Text>
            </Pressable>
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
    paddingHorizontal: 16,
    paddingTop: 40,
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
    fontSize: 22,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  body: {
    fontSize: 14,
    color: "#6C7CA6",
    fontWeight: "600",
  },
  inputGroup: {
    marginTop: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "700",
    color: "#1A2850",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0F172A",
    borderWidth: 1,
    borderColor: "rgba(40, 92, 153, 0.2)",
  },
  hint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "600",
    color: "#8B97B2",
  },
  errorText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: "600",
    color: "#C81D2C",
  },
  primaryButton: {
    marginTop: 18,
    backgroundColor: "#21B3A7",
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  primaryText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  webview: {
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#13233D",
  },
  modalBody: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: "600",
    color: "#6C7CA6",
  },
  modalButton: {
    marginTop: 16,
    backgroundColor: "#21B3A7",
    paddingVertical: 10,
    borderRadius: 999,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});
