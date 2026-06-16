import { useCallback, useEffect, useMemo, useRef, useState, type ReactElement } from "react";

import {
  Animated,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type RefreshControlProps,
} from "react-native";



import { IconSymbol } from "components/ui/icon-symbol";

import {
  MAP_SHEET_PEEK_HEIGHT,
  MAP_SHEET_PEEK_WITH_SEARCH,
} from "./map-sheet-constants";

const SNAP_RATIOS = {
  half: 0.45,
  expanded: 0.72,
} as const;



type SnapKey = "peek" | "half" | "expanded";



type MapStationSheetProps = {

  screenHeight: number;

  bottomInset: number;

  /** Renders above the tab row (e.g. Default / Satellite picker). */

  topAccessory?: React.ReactNode;

  header?: React.ReactNode;

  children: React.ReactNode;

  /** Increment to expand the sheet (e.g. when a map marker is tapped). */

  expandSignal?: number;

  onSnapChange?: (snap: SnapKey) => void;

  /** Current sheet height in px (for positioning map controls). */

  onHeightChange?: (height: number) => void;

  refreshControl?: ReactElement<RefreshControlProps>;

};



function clamp(value: number, min: number, max: number) {

  return Math.min(max, Math.max(min, value));

}



function nearestSnap(value: number, snaps: number[]) {

  return snaps.reduce((closest, snap) =>

    Math.abs(snap - value) < Math.abs(closest - value) ? snap : closest,

  );

}



export function MapStationSheet({

  screenHeight,

  bottomInset,

  topAccessory,

  header,

  children,

  expandSignal = 0,

  onSnapChange,

  onHeightChange,

  refreshControl,

}: MapStationSheetProps) {

  const snapHeights = useMemo(() => {

    const peek = topAccessory ? MAP_SHEET_PEEK_WITH_SEARCH : MAP_SHEET_PEEK_HEIGHT;

    const maxHeight = Math.round(screenHeight * SNAP_RATIOS.expanded);

    const half = Math.max(peek + 56, Math.round(screenHeight * SNAP_RATIOS.half));

    const expanded = clamp(maxHeight, half + 40, screenHeight - 72);



    return {

      peek,

      half: Math.min(half, expanded - 20),

      expanded,

      minHeight: peek,

      maxHeight: expanded,

    };

  }, [screenHeight, topAccessory]);



  const snapValues = useMemo(

    () => [snapHeights.peek, snapHeights.half, snapHeights.expanded],

    [snapHeights],

  );



  const sheetHeight = useRef(new Animated.Value(snapHeights.peek)).current;

  const currentHeight = useRef(snapHeights.peek);

  const dragStartHeight = useRef(snapHeights.peek);

  const listOpacity = useRef(new Animated.Value(0)).current;

  const [currentSnap, setCurrentSnap] = useState<SnapKey>("peek");



  const snapKeyForHeight = useCallback(

    (height: number): SnapKey => {

      if (height <= snapHeights.peek + 16) return "peek";

      if (height < snapHeights.half + (snapHeights.expanded - snapHeights.half) / 2) {

        return "half";

      }

      return "expanded";

    },

    [snapHeights],

  );



  const updateListOpacity = useCallback(

    (height: number) => {

      const showList = height > snapHeights.peek + 12;

      Animated.timing(listOpacity, {

        toValue: showList ? 1 : 0,

        duration: 160,

        useNativeDriver: true,

      }).start();

    },

    [listOpacity, snapHeights.peek],

  );



  const snapTo = useCallback(

    (key: SnapKey) => {

      const target = snapHeights[key];

      currentHeight.current = target;

      setCurrentSnap(key);

      updateListOpacity(target);

      onSnapChange?.(key);

      onHeightChange?.(target);

      Animated.spring(sheetHeight, {

        toValue: target,

        useNativeDriver: false,

        damping: 22,

        stiffness: 220,

      }).start();

    },

    [onHeightChange, onSnapChange, sheetHeight, snapHeights, updateListOpacity],

  );



  const snapToNearest = useCallback(

    (value: number, velocityY = 0) => {

      let target = nearestSnap(value, snapValues);



      const midPeekHalf = (snapHeights.peek + snapHeights.half) / 2;

      const midHalfExpanded = (snapHeights.half + snapHeights.expanded) / 2;



      if (velocityY > 0.2) {

        if (value <= midPeekHalf) target = snapHeights.peek;

        else if (value <= midHalfExpanded) target = snapHeights.half;

        else target = snapHeights.half;

      } else if (velocityY < -0.2) {

        if (value >= midHalfExpanded) target = snapHeights.expanded;

        else if (value >= midPeekHalf) target = snapHeights.half;

        else target = snapHeights.half;

      }



      if (value < midPeekHalf - 8) {

        target = snapHeights.peek;

      }



      currentHeight.current = target;

      const snap = snapKeyForHeight(target);

      setCurrentSnap(snap);

      updateListOpacity(target);

      onSnapChange?.(snap);

      onHeightChange?.(target);

      Animated.spring(sheetHeight, {

        toValue: target,

        useNativeDriver: false,

        damping: 22,

        stiffness: 220,

      }).start();

    },

    [

      onHeightChange,

      onSnapChange,

      sheetHeight,

      snapHeights,

      snapKeyForHeight,

      snapValues,

      updateListOpacity,

    ],

  );



  const panResponder = useMemo(

    () =>

      PanResponder.create({

        onStartShouldSetPanResponder: () => true,

        onMoveShouldSetPanResponder: (_, gesture) =>

          Math.abs(gesture.dy) > Math.abs(gesture.dx) && Math.abs(gesture.dy) > 2,

        onPanResponderGrant: () => {

          dragStartHeight.current = currentHeight.current;

          sheetHeight.stopAnimation((value) => {

            dragStartHeight.current = value;

            currentHeight.current = value;

          });

        },

        onPanResponderMove: (_, gesture) => {

          const next = clamp(

            dragStartHeight.current - gesture.dy,

            snapHeights.minHeight,

            snapHeights.maxHeight,

          );

          sheetHeight.setValue(next);

          updateListOpacity(next);

          onHeightChange?.(next);

        },

        onPanResponderRelease: (_, gesture) => {

          const next = clamp(

            dragStartHeight.current - gesture.dy,

            snapHeights.minHeight,

            snapHeights.maxHeight,

          );

          currentHeight.current = next;

          snapToNearest(next, gesture.vy);

        },

        onPanResponderTerminationRequest: () => false,

      }),

    [onHeightChange, sheetHeight, snapHeights, snapToNearest, updateListOpacity],

  );



  const onHandlePress = useCallback(() => {

    const current = currentHeight.current;

    if (current <= snapHeights.peek + 8) {

      snapTo("half");

      return;

    }

    snapTo("peek");

  }, [snapHeights, snapTo]);



  useEffect(() => {

    if (expandSignal <= 0) return;

    snapTo("half");

  }, [expandSignal, snapTo]);



  useEffect(() => {

    const listenerId = sheetHeight.addListener(({ value }) => {

      onHeightChange?.(value);

    });

    return () => {

      sheetHeight.removeListener(listenerId);

    };

  }, [onHeightChange, sheetHeight]);



  useEffect(() => {

    sheetHeight.setValue(snapHeights.peek);

    currentHeight.current = snapHeights.peek;

    setCurrentSnap("peek");

    updateListOpacity(snapHeights.peek);

    onHeightChange?.(snapHeights.peek);

    onSnapChange?.("peek");

  }, [screenHeight, sheetHeight, snapHeights.peek, updateListOpacity, onHeightChange, onSnapChange]);



  const onSheetLayout = useCallback(

    (_event: LayoutChangeEvent) => {

      sheetHeight.setValue(currentHeight.current);

    },

    [sheetHeight],

  );



  const isCollapsed = currentSnap === "peek";



  return (

    <Animated.View

      onLayout={onSheetLayout}

      style={[

        styles.sheet,

        {

          bottom: bottomInset,

          height: sheetHeight,

        },

      ]}

    >

      <View style={styles.dragRow} {...panResponder.panHandlers}>

        <Pressable

          onPress={onHandlePress}

          style={styles.handlePressable}

          accessibilityRole="button"

          accessibilityLabel={isCollapsed ? "Show station list" : "Hide station list"}

        >

          <View style={styles.handle} />

        </Pressable>



        {!isCollapsed ? (

          <Pressable

            onPress={() => snapTo("peek")}

            style={styles.collapseBtn}

            accessibilityRole="button"

            accessibilityLabel="Collapse station list"

            hitSlop={8}

          >

            <IconSymbol name="chevron.down" size={20} color="#6C7CA6" />

          </Pressable>

        ) : null}

      </View>



      {topAccessory ? <View style={styles.topAccessory}>{topAccessory}</View> : null}

      {header ? <View style={styles.header}>{header}</View> : null}



      <Animated.View

        style={[styles.listWrap, { opacity: listOpacity }]}

        pointerEvents={isCollapsed ? "none" : "auto"}

      >

        <ScrollView

          style={styles.list}

          contentContainerStyle={styles.listContent}

          showsVerticalScrollIndicator

          nestedScrollEnabled

          keyboardShouldPersistTaps="handled"

          refreshControl={refreshControl}

        >

          {children}

        </ScrollView>

      </Animated.View>

    </Animated.View>

  );

}



const styles = StyleSheet.create({

  sheet: {

    position: "absolute",

    left: 0,

    right: 0,

    zIndex: 2,

    borderTopLeftRadius: 28,

    borderTopRightRadius: 28,

    backgroundColor: "#FFFFFF",

    overflow: "hidden",

    shadowColor: "#0B2A5E",

    shadowOpacity: 0.18,

    shadowRadius: 20,

    shadowOffset: { width: 0, height: -10 },

    elevation: 16,

    ...(Platform.OS === "web"

      ? ({ boxShadow: "0 -10px 32px rgba(11, 42, 94, 0.18)" } as object)

      : null),

  },

  dragRow: {

    flexDirection: "row",

    alignItems: "center",

    justifyContent: "center",

    minHeight: 36,

    paddingTop: 8,

    paddingBottom: 4,

    paddingHorizontal: 12,

    ...(Platform.OS === "web" ? ({ cursor: "grab", touchAction: "none" } as object) : null),

  },

  handlePressable: {

    flex: 1,

    alignItems: "center",

    paddingVertical: 8,

  },

  handle: {

    width: 48,

    height: 5,

    borderRadius: 999,

    backgroundColor: "rgba(26, 40, 80, 0.22)",

  },

  collapseBtn: {

    position: "absolute",

    right: 12,

    top: 6,

    width: 36,

    height: 36,

    borderRadius: 18,

    alignItems: "center",

    justifyContent: "center",

    backgroundColor: "rgba(243, 246, 251, 0.95)",

    borderWidth: 1,

    borderColor: "rgba(40, 92, 153, 0.12)",

  },

  topAccessory: {
    paddingTop: 2,
    paddingBottom: 6,
    paddingHorizontal: 12,
    width: "100%",
  },

  header: {

    paddingBottom: 2,

  },

  listWrap: {

    flex: 1,

    minHeight: 0,

  },

  list: {

    flex: 1,

  },

  listContent: {

    paddingHorizontal: 16,

    paddingBottom: 24,

  },

});


