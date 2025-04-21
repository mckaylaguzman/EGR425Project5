import React from "react";
import { SafeAreaView, StyleSheet, StatusBar, View, Text } from "react-native";
import FeedbackButton from "./components/FeedbackButton";
import { sendFeedbackToM5 } from "./bluetooth";
import { sendFeedbackToCloud } from "./utils/cloud";

export default function App() {
  const handleFeedback = async (type: string) => {
    try {
      await sendFeedbackToM5(type);
      await sendFeedbackToCloud(type);
      console.log(`✅ Sent: ${type}`);
    } catch (error) {
      console.error("❌ Failed to send feedback:", error);
    }
  };  

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Presenter Feedback</Text>
      <FeedbackButton label="Slow Down" color="#F4A261" onPress={() => handleFeedback("SLOW")} />
      <FeedbackButton label="Pause" color="#E76F51" onPress={() => handleFeedback("PAUSE")} />
      <FeedbackButton label="Speed Up" color="#2A9D8F" onPress={() => handleFeedback("FAST")} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#264653",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: StatusBar.currentHeight,
  },
  title: {
    fontSize: 24,
    color: "#fff",
    marginBottom: 40,
  },
});
