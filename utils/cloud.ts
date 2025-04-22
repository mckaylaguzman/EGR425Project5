// utils/cloud.ts

const GCP_FEEDBACK_URL = "https://submit-feedback-237338544492.us-west2.run.app";

export const sendFeedbackToCloud = async (feedback: string, sessionId?: string) => {
  try {
    const res = await fetch(GCP_FEEDBACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionId: sessionId || "test-session-123", // Optional dynamic ID
        feedback,
        timestamp: new Date().toISOString(),
      }),
    });

    if (!res.ok) {
      console.warn("Cloud response error:", res.status);
    } else {
      console.log("✅ Feedback sent to GCP");
    }
  } catch (err) {
    console.error("❌ Failed to send to cloud:", err);
    console.log("🌐 URL used:", GCP_FEEDBACK_URL);
  }
};
