import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { Platform } from "react-native";
import Purchases, { PurchasesOfferings, PurchasesPackage, CustomerInfo } from "react-native-purchases";

const REVENUECAT_API_KEY = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY || "";
const FREE_AI_LOADS = 2;

interface PremiumContextValue {
  isPremium: boolean;
  isLoading: boolean;
  offerings: PurchasesOfferings | null;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  canLoadMoreAI: (currentLoads: number) => boolean;
  remainingFreeLoads: (currentLoads: number) => number;
}

const PremiumContext = createContext<PremiumContextValue | null>(null);

export function PremiumProvider({ children }: { children: ReactNode }) {
  const [isPremium, setIsPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    initRevenueCat();
  }, []);

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
        console.log("Could not fetch offerings:", e);
      }
    } catch (e) {
      console.log("RevenueCat init error:", e);
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

  const purchasePackage = useCallback(async (pkg: PurchasesPackage): Promise<boolean> => {
    if (!initialized) return false;
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      checkPremiumStatus(customerInfo);
      return customerInfo.entitlements.active["premium"] !== undefined ||
        customerInfo.entitlements.active["pro"] !== undefined;
    } catch (e: any) {
      if (e.userCancelled) {
        return false;
      }
      console.log("Purchase error:", e);
      return false;
    }
  }, [initialized]);

  const restorePurchases = useCallback(async (): Promise<boolean> => {
    if (!initialized) return false;
    try {
      const customerInfo = await Purchases.restorePurchases();
      checkPremiumStatus(customerInfo);
      return customerInfo.entitlements.active["premium"] !== undefined ||
        customerInfo.entitlements.active["pro"] !== undefined;
    } catch (e) {
      console.log("Restore error:", e);
      return false;
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
