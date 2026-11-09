/**
 * Data Sanitization Module
 * Enforces strict confidentiality by stripping internal fleet management data,
 * vehicle license plates, mileage, colors, and administrative notes from client-facing responses.
 */

export function sanitizeVehicleForClient<T extends Record<string, any>>(vehicle: T): Partial<T> {
  if (!vehicle || typeof vehicle !== "object") return vehicle;

  const sanitized = { ...vehicle };

  // Strip sensitive client-facing vehicle information
  delete sanitized.licensePlate;
  delete sanitized.mileage;
  delete sanitized.lastVidangeMileage;
  delete sanitized.nextVidangeMileage;
  delete sanitized.vidangeInterval;
  delete sanitized.color;
  delete sanitized.vin;
  delete sanitized.garageNotes;
  delete sanitized.maintenanceNotes;
  delete sanitized.technicalInspectionDate;
  delete sanitized.insuranceInfo;

  return sanitized;
}

export function sanitizeBookingForClient<T extends Record<string, any>>(booking: T): Partial<T> {
  if (!booking || typeof booking !== "object") return booking;

  const sanitized: Record<string, any> = { ...booking };

  // Strip internal administrator notes and sensitive audits
  delete sanitized.internalNotes;

  // Sanitize nested vehicle if populated
  if (sanitized.vehicleId && typeof sanitized.vehicleId === "object") {
    sanitized.vehicleId = sanitizeVehicleForClient(sanitized.vehicleId);
  }

  return sanitized as Partial<T>;
}

