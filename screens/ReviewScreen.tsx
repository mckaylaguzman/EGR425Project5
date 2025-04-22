import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function ReviewScreen({ route, navigation }: any) {
  const { sessionId, summary } = route.params;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.complete}>✅ Presentation Complete</Text>
      <Text style={styles.title}>Presentation Summary</Text>
      <Text style={styles.session}>Session ID: {sessionId}</Text>

      {summary.length > 0 ? (
        summary.map((slide: any, index: number) => {
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
        })
      ) : (
        <Text style={{ color: "#fff", marginTop: 20 }}>No summary data found.</Text>
      )}

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.buttonText}>Back to Feedback</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#264653",
    alignItems: "center",
    padding: 20,
  },
  complete: {
    fontSize: 20,
    color: "#2A9D8F",
    fontWeight: "600",
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    color: "#E9C46A",
    fontWeight: "bold",
    marginBottom: 10,
  },
  session: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 20,
  },
  slideBlock: {
    marginBottom: 20,
    backgroundColor: "#1F2A34",
    padding: 12,
    borderRadius: 8,
    width: "100%",
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
  button: {
    marginTop: 20,
    backgroundColor: "#2A9D8F",
    padding: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
