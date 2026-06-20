import { Purchases } from "@revenuecat/purchases-capacitor";

// RevenueCat public iOS SDK key (safe to ship inside the app)
const REVENUECAT_IOS_KEY = "appl_PMMVPTRQpzWmypIEisIWYlmbyUK";
const ENTITLEMENT_ID = "premium";

// True only inside the real native app (not the Safari / web version)
const isNative = () => {
  try {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  } catch (e) {
    return false;
  }
};
export const isNativeApp = isNative;

let configured = false;

// Call once when the app starts. Does nothing on the web.
export const initRevenueCat = async () => {
  if (!isNative() || configured) return;
  try {
    await Purchases.configure({ apiKey: REVENUECAT_IOS_KEY });
    configured = true;
  } catch (e) {
    console.error("RevenueCat configure error:", e);
  }
};

// Link RevenueCat to the signed-in Firebase user (call when they log in).
export const loginRevenueCat = async (uid) => {
  if (!isNative() || !uid) return;
  try {
    await Purchases.logIn({ appUserID: uid });
  } catch (e) {
    console.error("RevenueCat login error:", e);
  }
};

const hasPremium = (customerInfo) => {
  return !!(
    customerInfo &&
    customerInfo.entitlements &&
    customerInfo.entitlements.active &&
    customerInfo.entitlements.active[ENTITLEMENT_ID]
  );
};

// Returns true if the user currently has premium access.
export const checkPremium = async () => {
  if (!isNative()) return false;
  try {
    const { customerInfo } = await Purchases.getCustomerInfo();
    return hasPremium(customerInfo);
  } catch (e) {
    console.error("RevenueCat checkPremium error:", e);
    return false;
  }
};

// Starts Apple's purchase flow for the monthly subscription (with the 7-day
// free trial Apple already has set up). Returns { premium, cancelled, error }.
export const purchasePremium = async () => {
  if (!isNative()) return { premium: false, cancelled: false, error: "not-native" };
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings && offerings.current;
    const pkg = current && (current.monthly || (current.availablePackages && current.availablePackages[0]));
    if (!pkg) return { premium: false, cancelled: false, error: "no-package" };
    const { customerInfo } = await Purchases.purchasePackage({ aPackage: pkg });
    return { premium: hasPremium(customerInfo), cancelled: false, error: null };
  } catch (e) {
    if (e && (e.userCancelled === true || e.code === "1")) {
      return { premium: false, cancelled: true, error: null };
    }
    console.error("RevenueCat purchase error:", e);
    return { premium: false, cancelled: false, error: (e && e.message) || "purchase-failed" };
  }
};

// Restores a previous purchase. Returns true if premium after restoring.
export const restorePremium = async () => {
  if (!isNative()) return false;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    return hasPremium(customerInfo);
  } catch (e) {
    console.error("RevenueCat restore error:", e);
    return false;
  }
};

// Calls cb(true/false) whenever the user's premium status changes.
export const addPremiumListener = (cb) => {
  if (!isNative()) return;
  try {
    Purchases.addCustomerInfoUpdateListener((customerInfo) => {
      cb(hasPremium(customerInfo));
    });
  } catch (e) {
    console.error("RevenueCat listener error:", e);
  }
};

// Opens Apple's "Manage Subscription" screen.
export const openManageSubscriptions = () => {
  try {
    window.open("itms-apps://apps.apple.com/account/subscriptions", "_system");
  } catch (e) {
    window.location.href = "https://apps.apple.com/account/subscriptions";
  }
};
