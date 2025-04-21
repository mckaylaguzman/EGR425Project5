// utils/cloud.ts
export const sendFeedbackToCloud = async (feedback: string) => {
    try {
      const res = await fetch("https://your-cloud-function-url.run.app", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          feedback,
          timestamp: new Date().toISOString(),
        }),
      });
  
      if (!res.ok) {
        console.warn("❗️Cloud response error:", res.status);
      } else {
        console.log("✅ Feedback sent to GCP");
      }
    } catch (err) {
      console.error("❌ Failed to send to cloud:", err);
    }
  };
  