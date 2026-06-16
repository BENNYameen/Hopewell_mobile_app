import { useCallback, useMemo, useState, type ReactElement } from "react";
import { RefreshControl, type RefreshControlProps } from "react-native";

import { useVajraColors } from "@/hooks/use-vajra-colors";

type RefetchTask = () => unknown | Promise<unknown>;

export function usePullToRefresh(
  refetch: RefetchTask | RefetchTask[],
  isFetching = false,
): {
  refreshing: boolean;
  refreshControl: ReactElement<RefreshControlProps>;
  onRefresh: () => Promise<void>;
} {
  const colors = useVajraColors();
  const [localRefreshing, setLocalRefreshing] = useState(false);
  const refreshing = isFetching || localRefreshing;

  const onRefresh = useCallback(async () => {
    const tasks = Array.isArray(refetch) ? refetch : [refetch];
    setLocalRefreshing(true);
    try {
      await Promise.all(tasks.map((task) => Promise.resolve(task())));
    } finally {
      setLocalRefreshing(false);
    }
  }, [refetch]);

  const refreshControl = useMemo(
    () => (
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={colors.primary}
        colors={[colors.primary]}
        progressBackgroundColor="#FFFFFF"
      />
    ),
    [colors.primary, onRefresh, refreshing],
  );

  return { refreshing, refreshControl, onRefresh };
}
