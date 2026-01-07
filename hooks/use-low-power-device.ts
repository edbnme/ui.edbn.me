"use client";

import { useSyncExternalStore, useCallback } from "react";

/**
 * Hook to detect if the device is in a low-power state
 *
 * Checks Battery API and hardware concurrency to determine if
 * animations should be reduced for performance reasons.
 *
 * @returns Object with power state information
 *
 * @example
 * ```tsx
 * function AnimatedComponent() {
 *   const { isLowPower, shouldReduceAnimations } = useLowPowerDevice();
 *
 *   return (
 *     <motion.div
 *       animate={{ scale: shouldReduceAnimations ? 1 : 1.1 }}
 *     />
 *   );
 * }
 * ```
 */

type BatteryManager = {
  charging: boolean;
  level: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
};

type NavigatorWithBattery = Navigator & {
  getBattery?: () => Promise<BatteryManager>;
};

export type LowPowerState = {
  /** Whether the device is considered low-power */
  isLowPower: boolean;
  /** Whether animations should be reduced */
  shouldReduceAnimations: boolean;
  /** Battery level (0-1) if available */
  batteryLevel: number | null;
  /** Whether the device is charging */
  isCharging: boolean | null;
  /** Number of logical CPU cores */
  hardwareConcurrency: number;
};

// Battery state cache
let batteryManager: BatteryManager | null = null;
let batteryPromise: Promise<BatteryManager | null> | null = null;

// Get battery manager (cached)
async function getBatteryManager(): Promise<BatteryManager | null> {
  if (batteryManager) return batteryManager;
  if (batteryPromise) return batteryPromise;

  if (typeof navigator === "undefined") return null;

  const nav = navigator as NavigatorWithBattery;
  if (!nav.getBattery) return null;

  batteryPromise = nav.getBattery().catch(() => null);
  batteryManager = await batteryPromise;
  return batteryManager;
}

// Initialize battery manager on module load
if (typeof window !== "undefined") {
  getBatteryManager();
}

// Server snapshot - defined once at module level to avoid re-creation
const serverSnapshot: LowPowerState = {
  isLowPower: false,
  shouldReduceAnimations: false,
  batteryLevel: null,
  isCharging: null,
  hardwareConcurrency: 4,
};

// Cache the current snapshot to avoid unnecessary re-renders
let cachedSnapshot: LowPowerState = serverSnapshot;

// Function to get current snapshot (called outside of React)
function getCurrentSnapshot(): LowPowerState {
  if (typeof window === "undefined") {
    return serverSnapshot;
  }

  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const isLowEndDevice = hardwareConcurrency <= 4;

  // Check battery if available
  let batteryLevel: number | null = null;
  let isCharging: boolean | null = null;
  let isLowBattery = false;

  if (batteryManager) {
    batteryLevel = batteryManager.level;
    isCharging = batteryManager.charging;
    // Consider low battery if below 20% and not charging
    isLowBattery = batteryLevel < 0.2 && !isCharging;
  }

  const isLowPower = isLowEndDevice || isLowBattery;
  const shouldReduceAnimations = isLowPower;

  // Only create new object if values actually changed
  const newSnapshot = {
    isLowPower,
    shouldReduceAnimations,
    batteryLevel,
    isCharging,
    hardwareConcurrency,
  };

  // Compare with cached snapshot
  if (
    cachedSnapshot.isLowPower === newSnapshot.isLowPower &&
    cachedSnapshot.shouldReduceAnimations ===
      newSnapshot.shouldReduceAnimations &&
    cachedSnapshot.batteryLevel === newSnapshot.batteryLevel &&
    cachedSnapshot.isCharging === newSnapshot.isCharging &&
    cachedSnapshot.hardwareConcurrency === newSnapshot.hardwareConcurrency
  ) {
    return cachedSnapshot;
  }

  cachedSnapshot = newSnapshot;
  return cachedSnapshot;
}

export function useLowPowerDevice(): LowPowerState {
  const getSnapshot = () => getCurrentSnapshot();

  const getServerSnapshot = () => serverSnapshot;

  const subscribe = useCallback((callback: () => void) => {
    if (typeof window === "undefined") return () => {};

    // Subscribe to battery events if available
    getBatteryManager().then((battery) => {
      if (battery) {
        battery.addEventListener("chargingchange", callback);
        battery.addEventListener("levelchange", callback);
      }
    });

    // Clean up
    return () => {
      if (batteryManager) {
        batteryManager.removeEventListener("chargingchange", callback);
        batteryManager.removeEventListener("levelchange", callback);
      }
    };
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default useLowPowerDevice;
