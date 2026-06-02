import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";

import { syncChargingSessionCaches } from "@/charging/chargingCacheSync";
import { useGetActiveChargingSessionQuery } from "@/charging/charging.api";
import { useChargingSocket } from "@/charging/charging.socket";
import {
  mergeLiveSessionMetrics,
  type MergedLiveSession,
} from "@/charging/sessionMetrics";
import { isSessionLive } from "@/charging/sessionStatus";

const ACTIVE_POLL_MS = 15_000;
const LIVE_TICK_MS = 30_000;

type UseLiveChargingSessionOptions = {
  pollingInterval?: number;
  enabled?: boolean;
};

export function useLiveChargingSession(
  options: UseLiveChargingSessionOptions = {},
) {
  const enabled = options.enabled ?? true;
  const pollingInterval = options.pollingInterval ?? ACTIVE_POLL_MS;
  const dispatch = useDispatch();
  const [nowMs, setNowMs] = useState(() => Date.now());

  const {
    data: activeSession,
    refetch,
    isFetching,
    isLoading,
    isError,
  } = useGetActiveChargingSessionQuery(undefined, {
    skip: !enabled,
    pollingInterval: enabled ? pollingInterval : 0,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });

  const isLive = activeSession ? isSessionLive(activeSession.status) : false;
  const { data: wsData, connected: wsConnected } = useChargingSocket(
    enabled && activeSession?.id ? activeSession.id : null,
    enabled && !!activeSession && isLive,
  );

  useEffect(() => {
    if (!enabled || !activeSession?.id || !wsData) {
      return;
    }
    syncChargingSessionCaches(dispatch, activeSession.id, wsData);
  }, [activeSession?.id, dispatch, enabled, wsData]);

  useEffect(() => {
    if (!enabled || !activeSession || !isSessionLive(activeSession.status)) {
      return;
    }

    const timer = setInterval(() => setNowMs(Date.now()), LIVE_TICK_MS);
    return () => clearInterval(timer);
  }, [activeSession, enabled]);

  const live = useMemo<MergedLiveSession | null>(() => {
    if (!activeSession) {
      return null;
    }

    return mergeLiveSessionMetrics(activeSession, wsData, wsConnected, nowMs);
  }, [activeSession, nowMs, wsConnected, wsData]);

  return {
    live,
    activeSession,
    wsData,
    refetch,
    isFetching,
    isLoading,
    isError,
  };
}
