import type { AppDispatch } from "@/store";
import {
  chargingApi,
  type ChargingSession,
} from "@/charging/charging.api";
import type { ChargingUpdate } from "@/charging/charging.socket";

export function syncChargingSessionCaches(
  dispatch: AppDispatch,
  sessionId: string,
  update: ChargingUpdate,
) {
  dispatch(
    chargingApi.util.updateQueryData("getChargingSession", sessionId, (draft) => {
      applyChargingUpdate(draft, update);
    }),
  );

  dispatch(
    chargingApi.util.updateQueryData("getActiveChargingSession", undefined, (draft) => {
      if (!draft || draft.id !== sessionId) {
        return;
      }
      applyChargingUpdate(draft, update);
    }),
  );

  dispatch(
    chargingApi.util.updateQueryData(
      "getChargingSessions",
      { status: "all" },
      (draft) => {
        const index = draft.findIndex((session) => session.id === sessionId);
        if (index < 0) {
          return;
        }
        applyChargingUpdate(draft[index], update);
      },
    ),
  );
}

function applyChargingUpdate(
  draft: Pick<
    ChargingSession,
    | "status"
    | "energy_kwh"
    | "cost"
    | "charging_state"
    | "is_active"
    | "failure_reason"
    | "transaction_id"
    | "transaction_ref"
    | "billed_at"
  >,
  update: ChargingUpdate,
) {
  if (update.status) {
    draft.status = update.status;
  }
  if (update.energy_kwh != null) {
    draft.energy_kwh = update.energy_kwh;
  }
  if (update.cost != null) {
    draft.cost = update.cost;
  }
  if (update.charging_state) {
    draft.charging_state = update.charging_state;
  }
  if (update.is_active != null) {
    draft.is_active = update.is_active;
  }
  if (update.failure_reason) {
    draft.failure_reason = update.failure_reason;
  }
  if (update.transaction_id) {
    draft.transaction_id = update.transaction_id;
  }
  if (update.transaction_ref) {
    draft.transaction_ref = update.transaction_ref;
  }
  if (update.billed_at) {
    draft.billed_at = update.billed_at;
  }
}
