import axios from "axios";

const GCP_ENDPOINT = "https://your-cloud-function-url-here"; // Replace with your actual deployed function URL

export const logFeedbackToGCP = async (type: string) => {
  try {
    const res = await axios.post(GCP_ENDPOINT, {
      feedback: type,
      timestamp: new Date().toISOString(),
    });
    console.log("Logged to GCP:", res.status);
  } catch (error) {
    console.error("GCP Log Failed:", (error as any).message);
  }
};
