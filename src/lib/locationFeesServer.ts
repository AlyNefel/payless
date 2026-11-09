import connectDB from "@/lib/db";
import AgencySetting from "@/models/AgencySetting";
import { DEFAULT_ZONES, type ZoneFeeConfig } from "./locationFees";

export async function getLocationFeeConfig(): Promise<{
  enabled: boolean;
  zones: ZoneFeeConfig[];
  differentLocationFee: number;
}> {
  try {
    await connectDB();
    const setting = await AgencySetting.findOne({ key: "deliveryAndCollectionFees" }).lean();
    if (setting && setting.value && typeof setting.value === "object") {
      const val = setting.value as any;
      return {
        enabled: val.enabled !== false,
        zones: Array.isArray(val.zones) && val.zones.length > 0 ? val.zones : DEFAULT_ZONES,
        differentLocationFee: Number(val.differentLocationFee ?? 50),
      };
    }
  } catch (err) {
    console.warn("Could not load deliveryAndCollectionFees from DB:", err);
  }

  return {
    enabled: true,
    zones: DEFAULT_ZONES,
    differentLocationFee: 50,
  };
}

