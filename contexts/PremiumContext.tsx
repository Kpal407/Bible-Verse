import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { Platform } from "react-native";
import Purchases, { PurchasesOfferings, PurchasesPackage, CustomerInfo } from "react-native-purchases";

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";
const FREE_AI_LOADS = 2;

export type PurchaseErrorType =
  | "cancelled"
  | "network"
  | "payment_declined"
  | "product_unavailable"
  | "purchase_not_allowed"
  | "receipt_error"
  | "unknown";

export interface PurchaseResult {
  success: boolean;
  error?: PurchaseErrorType;
}

interface PremiumContextValue {
  isPremium: boolean;
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<PurchaseResult>;
  canLoadMoreAI: (currentLoads: number) => boolean;
  remainingFreeLoads: (currentLoads: number) => number;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

function mapRevenueCatError(e: any): PurchaseErrorType {
  if (e?.userCancelled) return "cancelled";

  const code = String(e?.code || "").toUpperCase();
  const message = String(e?.message || "").toLowerCase();

  if (code.includes("NETWORK") || message.includes("network")) return "network";
  if (code.includes("PURCHASE_CANCELLED") || code.includes("STORE_PROBLEM")) return "cancelled";
  if (code.includes("PURCHASE_NOT_ALLOWED") || code.includes("PAYMENT_PENDING")) return "purchase_not_allowed";
  if (code.includes("PRODUCT_NOT_AVAILABLE")) return "product_unavailable";
  if (code.includes("RECEIPT") || code.includes("INVALID_RECEIPT") || code.includes("MISSING_RECEIPT")) return "receipt_error";

  return "unknown";
}

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initRevenueCat();
  }, []);

  useEffect(() => {
    if (!initialized) return;

    let cleanup: (() => void) | undefined;
    try {
      const result = Purchases.addCustomerInfoUpdateListener((customerInfo) => {
        checkPremiumStatus(customerInfo);
      }) as unknown;

      if (result && typeof (result as any).remove === "function") {
        cleanup = () => (result as any).remove();
      } else if (typeof result === "function") {
        cleanup = result as () => void;
      }
    } catch (e) {
      if (__DEV__) console.log("Could not add customer info listener:", e);
    }

    return () => {
      if (cleanup) cleanup();
    };
  }, [initialized]);

  const initRevenueCat = async () => {
    if (!REVENUECAT_API_KEY) {
      setIsLoading(false);
      return;
    }

    try {
      if (Platform.OS === "android") {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      } else {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      }
      setInitialized(true);

      const customerInfo = await Purchases.getCustomerInfo();
      checkPremiumStatus(customerInfo);

      try {
        const offeringsResult = await Purchases.getOfferings();
        setOfferings(offeringsResult);
      } catch (e) {
        if (__DEV__) console.log("Could not fetch offerings:", e);
      }
    } catch (e) {
      if (__DEV__) console.log("RevenueCat init error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const checkPremiumStatus = (customerInfo: CustomerInfo) => {
    const hasActive =
      customerInfo.entitlements.active["premium"] !== undefined ||
      customerInfo.entitlements.active["pro"] !== undefined;
    setIsPremium(hasActive);
  };

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
    if (!initialized) return { success: false, error: "unknown" };
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      checkPremiumStatus(customerInfo);
      const success =
        customerInfo.entitlements.active["premium"] !== undefined ||
        customerInfo.entitlements.active["pro"] !== undefined;
      return { success };
    } catch (e: any) {
      const errorType = mapRevenueCatError(e);
      if (__DEV__) console.log("Purchase error:", e);
      return { success: false, error: errorType };
    }
  }, [initialized]);

  const restorePurchases = useCallback(async (): Promise<PurchaseResult> => {
    if (!initialized) return { success: false, error: "unknown" };
    try {
      const customerInfo = await Purchases.restorePurchases();
      checkPremiumStatus(customerInfo);
      const success =
        customerInfo.entitlements.active["premium"] !== undefined ||
        customerInfo.entitlements.active["pro"] !== undefined;
      return { success };
    } catch (e: any) {
      const errorType = mapRevenueCatError(e);
      if (__DEV__) console.log("Restore error:", e);
      return { success: false, error: errorType };
    }
  }, [initialized]);

  const canLoadMoreAI = useCallback((currentLoads: number) => {
    if (isPremium) return true;
    return currentLoads < FREE_AI_LOADS;
  }, [isPremium]);

  const remainingFreeLoads = useCallback((currentLoads: number) => {
    if (isPremium) return Infinity;
    return Math.max(0, FREE_AI_LOADS - currentLoads);
  }, [isPremium]);

  const value = useMemo(
    () => ({
      isPremium,
      isLoading,
      offerings,
      purchasePackage,
      restorePurchases,
      canLoadMoreAI,
      remainingFreeLoads,
    }),
    [isPremium, isLoading, offerings, purchasePackage, restorePurchases, canLoadMoreAI, remainingFreeLoads]
  );

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error("usePremium must be used within a PremiumProvider");
  }
  return context;
}
