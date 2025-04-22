import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Animated,
  Easing,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import FeedbackButton from "../components/FeedbackButton";
import { sendFeedbackToM5 } from "../bluetooth";
import { useNavigation } from "@react-navigation/native";

const GCP_FEEDBACK_URL = "https://submit-feedback-237338544492.us-west2.run.app";
const GCP_SESSION_URL = "https://start-new-presentation-237338544492.us-west2.run.app";
const GCP_SUMMARY_URL = "https://presentationsummary-237338544492.us-west2.run.app";

export default function FeedbackScreen() {
  const [sessionId, setSessionId] = useState<string>("test-session-123");
  const [connectionStatus, setConnectionStatus] = useState("Waiting to connect...");
  const [lastPressed, setLastPressed] = useState("");
  const [summary, setSummary] = useState<any[]>([]);
  const [feedbackCount, setFeedbackCount] = useState(0);
  const toastAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<any>();

  useEffect(() => {
    const startSession = async () => {
      try {
        const res = await fetch(GCP_SESSION_URL, { method: "POST" });
        const data = await res.json();
        if (data.sessionId) {
          setSessionId(data.sessionId);
          console.log("New session started:", data.sessionId);
        }
      } catch (err) {
        console.error("Failed to start session:", err);
      }
    };
    startSession();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${GCP_SUMMARY_URL}?sessionId=${sessionId}`);
        const data = await res.json();
        if (data?.slides?.length > 0) {
          clearInterval(interval);
          navigation.navigate("Review", {
            sessionId,
            summary: data.slides,
          });
        }
      } catch (err) {
        console.error("Polling summary failed:", err);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [sessionId]);

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

  const fetchSummary = async () => {
    try {
      const res = await fetch(`${GCP_SUMMARY_URL}?sessionId=${sessionId}`);
      const data = await res.json();
      setSummary(data.slides || []);
    } catch (e) {
      console.error("Failed to fetch summary", e);
    }
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

    try {
      await fetch(GCP_FEEDBACK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          feedback: type,
          timestamp: new Date().toISOString(),
        }),
      });
      console.log("✅ Logged to GCP");

      setFeedbackCount((prev) => {
        const updated = prev + 1;
        if (updated >= 3 && summary.length === 0) {
          fetchSummary();
        }
        return updated;
      });

    } catch (e) {
      console.error("❌ GCP Log Error:", e);
    }
  };

  const toastTranslate = toastAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Feedback Panel</Text>
      <Text style={styles.status}>Session ID: {sessionId}</Text>

      <FeedbackButton label="Slow Down" color="#F4A261" onPress={() => handleFeedback("Slow Down")} />
      <FeedbackButton label="Pause" color="#E76F51" onPress={() => handleFeedback("Pause")} />
      <FeedbackButton label="Speed Up" color="#2A9D8F" onPress={() => handleFeedback("Speed Up")} />

      <TouchableOpacity onPress={fetchSummary} style={styles.summaryBtn}>
        <Text style={styles.summaryBtnText}>View Summary</Text>
      </TouchableOpacity>

      {summary.length > 0 && (
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>Presentation Summary</Text>
          {summary.map((slide, index) => {
            const slideMin = Math.floor(slide.slideTime / 1000 / 60);
            const slideSec = Math.floor((slide.slideTime / 1000) % 60);
            const totalMin = Math.floor(slide.totalTime / 1000 / 60);
            const totalSec = Math.floor((slide.totalTime / 1000) % 60);

            return (
              <View key={index} style={styles.slideBlock}>
                <Text style={styles.slideTitle}>Slide {slide.slide}</Text>
                <Text style={styles.slideInfo}>
                  Time: {slideMin}:{slideSec.toString().padStart(2, "0")} | Total: {totalMin}:{totalSec.toString().padStart(2, "0")}
                </Text>
                <Text style={styles.slideFeedback}>Feedback: {slide.feedback}</Text>
              </View>
            );
          })}
        </View>
      )}

      <Animated.View
        style={[
          styles.toast,
          { transform: [{ translateY: toastTranslate }] },
        ]}
      >
        <Text style={styles.toastText}>{lastPressed} sent!</Text>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#264653",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 28,
    color: "white",
    fontWeight: "bold",
    marginBottom: 10,
  },
  status: {
    color: "#ddd",
    marginBottom: 30,
    fontSize: 16,
  },
  summaryBtn: {
    marginTop: 20,
  },
  summaryBtnText: {
    color: "white",
    fontSize: 18,
    textDecorationLine: "underline",
  },
  summarySection: {
    marginTop: 30,
    width: "100%",
  },
  summaryTitle: {
    fontSize: 22,
    color: "#E9C46A",
    marginBottom: 10,
    fontWeight: "bold",
  },
  slideBlock: {
    marginBottom: 20,
    backgroundColor: "#1F2A34",
    padding: 12,
    borderRadius: 8,
  },
  slideTitle: {
    fontSize: 18,
    color: "#F4A261",
  },
  slideInfo: {
    fontSize: 16,
    color: "#E9C46A",
  },
  slideFeedback: {
    fontSize: 16,
    color: "#2A9D8F",
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
