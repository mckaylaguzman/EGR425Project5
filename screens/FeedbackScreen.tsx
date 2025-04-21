// React App: Sends feedback to M5 + logs it to Google Cloud

import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  Easing,
} from "react-native";
import FeedbackButton from "../components/FeedbackButton";
import { sendFeedbackToM5 } from "../bluetooth";

// TODO: Replace this with your deployed feedback log URL
const GCP_FEEDBACK_URL = "https://your-cloud-function-url.run.app";

export default function FeedbackScreen() {
  const [connectionStatus, setConnectionStatus] = useState("Waiting to connect...");
  const [lastPressed, setLastPressed] = useState("");

  // Toast animation for visual feedback
  const toastAnim = useRef(new Animated.Value(0)).current;

  const showToast = () => {
    toastAnim.setValue(0);
    Animated.sequence([
      Animated.timing(toastAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.out(Easing.ease),
      }),
      Animated.delay(1500),
      Animated.timing(toastAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
        easing: Easing.in(Easing.ease),
      }),
    ]).start();
  };

  const handleFeedback = async (type: string) => {
    setConnectionStatus("Sending...");
    setLastPressed(type);

    try {
      await sendFeedbackToM5(type);
      setConnectionStatus("✅ M5 Connected");
      showToast();
      console.log("✅ Sent to M5:", type);
    } catch (e) {
      console.error("❌ Failed to send to M5:", e);
      Alert.alert("BLE Error", "Could not send feedback to M5.");
      setConnectionStatus("❌ Failed to send");
    }

    // TODO: Your Cloud Function receives feedback here
    try {
      const res = await fetch(GCP_FEEDBACK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback: type,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log("GCP Response:", await res.text());
    } catch (e) {
      console.error("❌ Failed to send to GCP:", e);
    }
  };

  const toastTranslate = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <View style={styles.container}>
      <FeedbackButton label="Slow Down" color="#F4A261" onPress={() => handleFeedback("Slow Down")} />
      <FeedbackButton label="Pause" color="#E76F51" onPress={() => handleFeedback("Pause")} />
      <FeedbackButton label="Speed Up" color="#2A9D8F" onPress={() => handleFeedback("Speed Up")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#264653",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 20,
  },
  status: {
    color: "#ddd",
    marginBottom: 10,
    fontSize: 16,
  },
  feedback: {
    color: "#fff",
    marginBottom: 30,
    fontSize: 18,
    fontStyle: "italic",
  },
  toast: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#2A9D8F",
    paddingVertical: 12,
    alignItems: "center",
    zIndex: 999,
  },
  toastText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
