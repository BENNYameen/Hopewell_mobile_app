/** Active session statuses — matches Vajra web `src/types/api.ts`. */
export const ACTIVE_STATUSES = new Set([
  "pending",
  "starting",
  "charging",
  "stopping",
]);

export function isSessionLive(status: string): boolean {
  return ACTIVE_STATUSES.has(status);
}

export function sessionStatusLabel(status: string): string {
  if (status === "charging") return "Charging";
  if (status === "starting") return "Starting";
  if (status === "stopping") return "Stopping";
  if (status === "pending") return "Pending";
  if (status === "completed") return "Completed";
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Charging";
}
