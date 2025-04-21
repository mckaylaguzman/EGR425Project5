import { BleManager, Characteristic, Device } from "react-native-ble-plx";
import { Buffer } from "buffer";

const SERVICE_UUID = "47b225e3-f89c-4885-8068-f64092c1b643".toLowerCase();
const CHARACTERISTIC_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a5".toLowerCase();
const DEVICE_NAME = "M5 Presenter";

const manager = new BleManager();
let connectedDevice: Device | null = null;
let feedbackCharacteristic: Characteristic | null = null;

export const sendFeedbackToM5 = async (feedback: string) => {
  try {
    if (!connectedDevice || !feedbackCharacteristic) {
      console.log("🔍 Scanning for M5...");
      await new Promise<void>((resolve, reject) => {
        manager.startDeviceScan(null, null, async (error, device) => {
          if (error) {
            manager.stopDeviceScan();
            return reject(error);
          }

          if (device?.name === DEVICE_NAME) {
            console.log("✅ Found device:", device.name);
            manager.stopDeviceScan();

            try {
              const dev = await device.connect();
              await dev.discoverAllServicesAndCharacteristics();
              const services = await dev.services();

              for (const service of services) {
                if (service.uuid.toLowerCase() === SERVICE_UUID) {
                  const characteristics = await service.characteristics();
                  for (const char of characteristics) {
                    if (char.uuid.toLowerCase() === CHARACTERISTIC_UUID) {
                      feedbackCharacteristic = char;
                      connectedDevice = dev;
                      console.log("✅ Connected to correct characteristic");
                      return resolve();
                    }
                  }
                }
              }

              return reject("Characteristic not found");
            } catch (err) {
              return reject(err);
            }
          }
        });

        setTimeout(() => {
          manager.stopDeviceScan();
          reject("Timeout while scanning");
        }, 5000);
      });
    }

    if (!feedbackCharacteristic) throw new Error("Characteristic missing after connection");

    const message = Buffer.from(feedback).toString("base64");
    await feedbackCharacteristic.writeWithResponse(message);
    console.log("✅ Sent:", feedback);
  } catch (err) {
    console.error("❌ Failed to send feedback:", err);
    throw err;
  }
};
