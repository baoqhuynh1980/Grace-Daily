import io, sys

path = "src/App.js"
with io.open(path, "r", encoding="utf-8") as f:
    s = f.read()

def repl(s, find, replacement, label, expected=1):
    n = s.count(find)
    if n != expected:
        print("EDIT FAILED [%s]: expected %d, found %d" % (label, expected, n))
        sys.exit(1)
    print("OK [%s]: %d match(es)" % (label, n))
    return s.replace(find, replacement)

# 1. Import the RevenueCat helpers
f = 'import { auth, db, messaging, requestNotificationPermission, onMessage } from "./firebase";'
s = repl(s, f, f + '\nimport { initRevenueCat, loginRevenueCat, checkPremium, purchasePremium, restorePremium, addPremiumListener, isNativeApp, openManageSubscriptions } from "./revenuecat";', "import")

# 2. Start RevenueCat + premium listener on app load
f = 'const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => { setUser(firebaseUser); });'
s = repl(s, f, 'initRevenueCat(); addPremiumListener((p) => setIsPremium(p)); ' + f, "init+listener")

# 3a. On native, log in to RevenueCat + check premium when user signs in
f = 'if (!user) { setIsPremium(false); return; }'
s = repl(s, f, f + ' if (isNativeApp()) { loginRevenueCat(user.uid).then(() => checkPremium()).then((p) => { if (p) setIsPremium(true); }); }', "native-login-check")

# 3b. On native, don't let Firestore override RevenueCat premium
f = 'if (snap.exists()) { setIsPremium(snap.data().isPremium === true); setUserName((snap.data().name || "").trim().split(" ")[0]); }'
s = repl(s, f, 'if (snap.exists()) { if (!isNativeApp()) setIsPremium(snap.data().isPremium === true); setUserName((snap.data().name || "").trim().split(" ")[0]); }', "fs-guard-if")
f = 'else { setIsPremium(false); setUserName(""); }'
s = repl(s, f, 'else { if (!isNativeApp()) setIsPremium(false); setUserName(""); }', "fs-guard-else")

# 4. Upgrade button: Apple purchase on iOS, Stripe on web
f = 'const openUpgrade = () => { if (!user) { setShowAuth(true); return; } const params = new URLSearchParams(); params.set("client_reference_id", user.uid); if (user.email) params.set("prefilled_email", user.email); const upgradeUrl = STRIPE_LINK + "?" + params.toString(); const isNativeApp = typeof window !== "undefined" && window.Capacitor && typeof window.Capacitor.isNativePlatform === "function" && window.Capacitor.isNativePlatform(); if (isNativeApp) { window.open(upgradeUrl, "_system"); } else { window.location.href = upgradeUrl; } };'
r = 'const openUpgrade = async () => { if (!user) { setShowAuth(true); return; } if (isNativeApp()) { const res = await purchasePremium(); if (res.premium) { setIsPremium(true); } else if (res.error) { alert("Sorry, the purchase could not be completed. Please try again."); } return; } const params = new URLSearchParams(); params.set("client_reference_id", user.uid); if (user.email) params.set("prefilled_email", user.email); const upgradeUrl = STRIPE_LINK + "?" + params.toString(); window.location.href = upgradeUrl; };'
s = repl(s, f, r, "openUpgrade")

# 5. Manage Subscription -> Apple settings on iOS
f = 'onClick={async () => { setPortalLoading(true); try {'
s = repl(s, f, 'onClick={async () => { if (isNativeApp()) { openManageSubscriptions(); return; } setPortalLoading(true); try {', "manage-sub")

# 6. Hide Stripe wording on iOS (all 3 spots)
POWERED = "Powered by Stripe " + "\u2014" + " Secure Payment " + "\U0001F512"
SECURE = "\U0001F512" + " Secure Payment"
s = repl(s, POWERED, '{isNativeApp() ? "' + SECURE + '" : "' + POWERED + '"}', "stripe-text", 3)

# 7. Restore Purchases button (iOS only)
f = 'Begin Your 7-Day Free Trial</button>'
r = 'Begin Your 7-Day Free Trial</button>{isNativeApp() && (<button onClick={async () => { const ok = await restorePremium(); if (ok) { setIsPremium(true); } else { alert("No previous purchase found to restore."); } }} style={{ background: "none", border: "none", color: GOLD, fontSize: 13, fontFamily: "sans-serif", cursor: "pointer", textDecoration: "underline", display: "block", margin: "12px auto 0", padding: 4 }}>Restore Purchases</button>)}'
s = repl(s, f, r, "restore-button")

with io.open(path, "w", encoding="utf-8") as f2:
    f2.write(s)
print("\nALL EDITS APPLIED SUCCESSFULLY")
