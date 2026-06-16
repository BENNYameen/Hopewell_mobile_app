import { Alert, Platform } from "react-native";

/** One-button alert — `Alert.alert` is unreliable on web. */
export function showAlert(title: string, message: string): void {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    window.alert(message ? `${title}\n\n${message}` : title);
    return;
  }
  Alert.alert(title, message);
}

/**
 * Cross-platform confirm — `Alert.alert` is a no-op on web, so use `window.confirm` there.
 */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = "OK",
): Promise<boolean> {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const text = message ? `${title}\n\n${message}` : title;
    return Promise.resolve(window.confirm(text));
  }

  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
        {
          text: confirmLabel,
          style: "destructive",
          onPress: () => resolve(true),
        },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
