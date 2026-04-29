import React, { useState } from "react";

const GOLD = "#C9972A";
const GOLD_LIGHT = "#F5E6C0";
const GOLD_MID = "#E8C87A";
const CREAM = "#FDF8EE";
const CREAM_DARK = "#F0E6CC";
const BROWN = "#7A5C1E";
const BROWN_DARK = "#4A3510";
const WHITE = "#FFFDF7";

const verses = [
  { ref: "2 Corinthians 12:9", text: "My grace is sufficient for you, for my power is made perfect in weakness." },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles." },
  { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
];

const prayerRequests = [
  { name: "Anonymous", request: "Please pray for my mother's healing. She has been sick for weeks.", time: "2 min ago", prayed: 14 },
  { name: "Marcus T.", request: "Pray for my family to find peace. We are going through a difficult season.", time: "15 min ago", prayed: 8 },
  { name: "Anonymous", request: "Lord I need a job. Please pray I find employment soon.", time: "1 hr ago", prayed: 23 },
  { name: "Sister Joy", request: "Praying for my son to come back to Christ. He has walked away from the faith.", time: "3 hrs ago", prayed: 41 },
];

const visionGoals = [
  { id: 1, title: "Read the entire Bible", progress: 34, icon: "📖" },
  { id: 2, title: "Pray daily for 30 days", progress: 12, streak: 12, icon: "🙏" },
  { id: 3, title: "Memorize 10 scriptures", progress: 40, icon: "✝️" },
  { id: 4, title: "Fast once a week", progress: 60, icon: "⚡" },
];

const salvationSteps = [
  { step: "1", title: "Acknowledge", desc: "Recognize that you have sinned and fallen short of God's glory. (Romans 3:23)" },
  { step: "2", title: "Believe", desc: "Believe that Jesus Christ died for your sins and rose again. (John 3:16)" },
  { step: "3", title: "Confess", desc: "Confess with your mouth that Jesus is Lord. (Romans 10:9)" },
  { step: "4", title: "Receive", desc: "Accept Jesus into your heart as your Lord and Savior. (Revelation 3:20)" },
];

const tabs = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "verse", label: "Verse", icon: "✨" },
  { id: "prayer", label: "Prayer", icon: "🙏" },
  { id: "vision", label: "Vision", icon: "📋" },
  { id: "sermon", label: "Sermon", icon: "📖" },
  { id: "salvation", label: "Jesus", icon: "✝️" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [feeling, setFeeling] = useState("");
  const [verseResult, setVerseResult] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [streak, setStreak] = useState(7);
  const [prayedIds, setPrayedIds] = useState([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [sermonTopic, setSermonTopic] = useState("");
  const [sermonResult, setSermonResult] = useState(null);
  const [loadingSermon, setLoadingSermon] = useState(false);
  const [prayerList, setPrayerList] = useState(prayerRequests);
  const [streakLogged, setStreakLogged] = useState(false);
  const [sinner, setSinner] = useState(false);

  const todayVerse = verses[new Date().getDay() % verses.length];

  const callClaude = async (prompt, systemPrompt) => {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: "user", content: prompt }],
      }),
    });
    const data = await res.json();
    return data.content?.[0]?.text || "";
  };

  const getVerse = async () => {
    if (!feeling.trim()) return;
    setLoadingVerse(true);
    setVerseResult(null);
    try {
      const text = await callClaude(
        `I am feeling: ${feeling}`,
        `You are a compassionate Christian faith companion. When someone shares how they are feeling, respond with:
1. A perfect Bible verse for their situation (book chapter:verse — full verse text)
2. A 2-3 sentence warm reflection on how this verse applies to them
3. A short prayer (3-4 sentences) they can pray right now
Format your response exactly like this:
VERSE: [Book Chapter:Verse] — [full verse text]
REFLECTION: [your reflection]
PRAYER: [the prayer]
Keep everything warm, encouraging, and rooted in God's love.`
      );
      setVerseResult(text);
    } catch (e) {
      setVerseResult("VERSE: Psalm 46:1 — God is our refuge and strength, an ever-present help in trouble.\nREFLECTION: No matter what you are facing, God is with you right now in this very moment.\nPRAYER: Lord, I bring my heart to you. Be my strength and my refuge today. Amen.");
    }
    setLoadingVerse(false);
  };

  const getSermonCompanion = async () => {
    if (!sermonTopic.trim()) return;
    setLoadingSermon(true);
    setSermonResult(null);
    try {
      const text = await callClaude(
        `Sermon topic or passage: ${sermonTopic}`,
        `You are a Bible study companion helping someone go deeper after a sermon. Provide:
1. Three discussion questions about this topic
2. Three related scripture references with one sentence about each
3. A personal reflection prompt for journaling
Format exactly like:
QUESTIONS:
- [question 1]
- [question 2]
- [question 3]
SCRIPTURES:
- [Reference]: [one sentence about it]
- [Reference]: [one sentence about it]
- [Reference]: [one sentence about it]
JOURNAL: [one journaling prompt question]
Keep everything encouraging and spiritually edifying.`
      );
      setSermonResult(text);
    } catch (e) {
      setSermonResult("QUESTIONS:\n- How does this passage speak to your current season of life?\n- What action step is God calling you to take?\n- How can you share this message with someone this week?\nSCRIPTURES:\n- John 15:5: Apart from Jesus we can do nothing.\n- Philippians 4:19: God will supply all your needs.\n- Proverbs 3:5-6: Trust in the Lord with all your heart.\nJOURNAL: What is one thing from this message that God is specifically saying to you today?");
    }
    setLoadingSermon(false);
  };

  const parseVerseResult = (text) => {
    if (!text) return null;
    const lines = text.split("\n").filter(l => l.trim());
    const verse = lines.find(l => l.startsWith("VERSE:"))?.replace("VERSE:", "").trim();
    const reflIdx = lines.findIndex(l => l.startsWith("REFLECTION:"));
    const prayIdx = lines.findIndex(l => l.startsWith("PRAYER:"));
    const reflection = reflIdx >= 0 ? lines.slice(reflIdx).join(" ").replace("REFLECTION:", "").split("PRAYER:")[0].trim() : "";
    const prayer = prayIdx >= 0 ? lines.slice(prayIdx).join(" ").replace("PRAYER:", "").trim() : "";
    return { verse, reflection, prayer };
  };

  const parseSermonResult = (text) => {
    if (!text) return null;
    const qMatch = text.match(/QUESTIONS:([\s\S]*?)SCRIPTURES:/);
    const sMatch = text.match(/SCRIPTURES:([\s\S]*?)JOURNAL:/);
    const jMatch = text.match(/JOURNAL:([\s\S]*)/);
    const questions = qMatch ? qMatch[1].trim().split("\n").filter(l => l.trim().startsWith("-")).map(l => l.replace("-", "").trim()) : [];
    const scriptures = sMatch ? sMatch[1].trim().split("\n").filter(l => l.trim().startsWith("-")).map(l => l.replace("-", "").trim()) : [];
    const journal = jMatch ? jMatch[1].trim() : "";
    return { questions, scriptures, journal };
  };

  const logPrayer = () => {
    if (!streakLogged) { setStreak(s => s + 1); setStreakLogged(true); }
  };

  const prayFor = (i) => {
    if (!prayedIds.includes(i)) {
      setPrayedIds(p => [...p, i]);
      setPrayerList(list => list.map((r, idx) => idx === i ? { ...r, prayed: r.prayed + 1 } : r));
    }
  };

  const submitPrayer = () => {
    if (!newPrayer.trim()) return;
    setPrayerList(l => [{ name: "You", request: newPrayer, time: "Just now", prayed: 0 }, ...l]);
    setNewPrayer("");
  };

  const s = {
    app: { background: CREAM, minHeight: "100vh", fontFamily: "Georgia, serif", paddingBottom: 80 },
    header: { background: `linear-gradient(135deg, ${BROWN_DARK} 0%, ${BROWN} 100%)`, padding: "20px 20px 16px", textAlign: "center" },
    headerTitle: { color: GOLD_MID, fontSize: 26, fontWeight: "bold", margin: 0, letterSpacing: 1 },
    headerSub: { color: GOLD_LIGHT, fontSize: 13, margin: "4px 0 0", opacity: 0.9 },
    nav: { position: "fixed", bottom: 0, left: 0, right: 0, background: BROWN_DARK, display: "flex", borderTop: `2px solid ${GOLD}` },
    navBtn: { flex: 1, padding: "8px 2px 6px", background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2 },
    content: { padding: "16px 16px 0" },
    card: { background: WHITE, borderRadius: 16, padding: "16px", marginBottom: 14, border: `1px solid ${GOLD_LIGHT}` },
    cardGold: { background: `linear-gradient(135deg, ${BROWN_DARK}, ${BROWN})`, borderRadius: 16, padding: "18px", marginBottom: 14 },
    sectionTitle: { fontSize: 18, fontWeight: "bold", color: BROWN_DARK, marginBottom: 12, marginTop: 4 },
    input: { width: "100%", padding: "10px 12px", borderRadius: 10, border: `1.5px solid ${GOLD_MID}`, background: CREAM, fontSize: 14, fontFamily: "Georgia, serif", color: BROWN_DARK, boxSizing: "border-box", outline: "none" },
    btn: { background: `linear-gradient(135deg, ${GOLD}, ${BROWN})`, color: WHITE, border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 14, fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif", width: "100%", marginTop: 8 },
    btnOutline: { background: "none", color: GOLD, border: `1.5px solid ${GOLD}`, borderRadius: 10, padding: "8px 16px", fontSize: 13, cursor: "pointer", fontFamily: "sans-serif" },
    streakBox: { background: `linear-gradient(135deg, ${GOLD}, ${BROWN})`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 14 },
    streakNum: { fontSize: 36, fontWeight: "bold", color: WHITE },
    progressBg: { height: 8, borderRadius: 6, background: GOLD_LIGHT, marginTop: 8, marginBottom: 4 },
    tag: { display: "inline-block", background: GOLD_LIGHT, color: BROWN, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold", marginRight: 6 },
    stepCard: { display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" },
    stepNum: { background: GOLD, color: WHITE, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 15, flexShrink: 0, fontFamily: "sans-serif" },
  };

  const parsed = parseVerseResult(verseResult);
  const parsedSermon = parseSermonResult(sermonResult);

  return (
    <div style={s.app}>
      <div style={s.header}>
        <div style={{ fontSize: 22, marginBottom: 4 }}>✝️</div>
        <h1 style={s.headerTitle}>Grace Daily</h1>
        <p style={s.headerSub}>His Grace is Sufficient — 2 Corinthians 12:9</p>
      </div>

      <div style={s.content}>
        {activeTab === "home" && (
          <div>
            <div style={s.cardGold}>
              <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>Today's Verse</p>
              <p style={{ color: WHITE, fontSize: 15, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 10px" }}>"{todayVerse.text}"</p>
              <p style={{ color: GOLD_MID, fontSize: 13, fontFamily: "sans-serif", margin: 0, fontWeight: "bold" }}>— {todayVerse.ref}</p>
            </div>
            <div style={s.streakBox}>
              <div>
                <div style={s.streakNum}>{streak}</div>
                <div style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif" }}>day streak 🔥</div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: WHITE, fontSize: 13, margin: "0 0 8px", fontFamily: "sans-serif" }}>Keep your prayer streak going!</p>
                <button style={{ ...s.btnOutline, color: WHITE, borderColor: WHITE, fontSize: 12, padding: "6px 14px" }} onClick={logPrayer}>
                  {streakLogged ? "✓ Logged today" : "Log today's prayer"}
                </button>
              </div>
            </div>
            <div style={s.card}>
              <p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 8 }}>Quick Actions</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["✨", "Verse for\nmy mood", "verse"], ["🙏", "Pray with\nothers", "prayer"], ["📋", "My faith\ngoals", "vision"], ["📖", "Sermon\ncompanion", "sermon"]].map(([icon, label, tab]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: CREAM_DARK, border: `1px solid ${GOLD_LIGHT}`, borderRadius: 12, padding: "12px 8px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 20 }}>{icon}</div>
                    <div style={{ fontSize: 11, color: BROWN, fontFamily: "sans-serif", marginTop: 4, whiteSpace: "pre-line", lineHeight: 1.3 }}>{label}</div>
                  </button>
                ))}
              </div>
            </div>
            <div style={s.card}>
              <p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 6 }}>✝️ New to Jesus?</p>
              <p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>Find out who Jesus is and how He can transform your life.</p>
              <button style={s.btn} onClick={() => setActiveTab("salvation")}>Learn About Jesus →</button>
            </div>
          </div>
        )}

        {activeTab === "verse" && (
          <div>
            <p style={s.sectionTitle}>✨ Verse of the Moment</p>
            <div style={s.card}>
              <p style={{ color: BROWN, fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>How are you feeling right now? Tell God — and let His Word speak directly to your heart.</p>
              <textarea style={{ ...s.input, minHeight: 80, resize: "none" }} placeholder="I am feeling anxious about tomorrow..." value={feeling} onChange={e => setFeeling(e.target.value)} />
              <button style={s.btn} onClick={getVerse} disabled={loadingVerse}>{loadingVerse ? "Finding your verse..." : "Find My Verse →"}</button>
            </div>
            {loadingVerse && (
              <div style={{ ...s.card, textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div>
                <p style={{ color: BROWN, fontSize: 14, fontStyle: "italic" }}>Seeking a word from the Lord for you...</p>
              </div>
            )}
            {parsed && (
              <div>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>Your Verse</p>
                  <p style={{ color: WHITE, fontSize: 15, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"{parsed.verse}"</p>
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 6, fontFamily: "sans-serif" }}>Reflection</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{parsed.reflection}</p>
                </div>
                <div style={{ ...s.card, background: GOLD_LIGHT }}>
                  <p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Prayer for You</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{parsed.prayer}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "prayer" && (
          <div>
            <p style={s.sectionTitle}>🙏 Pray With Me</p>
            <div style={s.card}>
              <p style={{ color: BROWN, fontSize: 13, marginBottom: 10 }}>Submit a prayer request or pray for someone else.</p>
              <textarea style={{ ...s.input, minHeight: 70, resize: "none" }} placeholder="Share your prayer request..." value={newPrayer} onChange={e => setNewPrayer(e.target.value)} />
              <button style={s.btn} onClick={submitPrayer}>Submit Prayer Request</button>
            </div>
            <p style={{ color: BROWN, fontSize: 13, fontFamily: "sans-serif", marginBottom: 8, fontWeight: "bold" }}>Community Prayer Wall</p>
            {prayerList.map((r, i) => (
              <div key={i} style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <span style={s.tag}>{r.name}</span>
                  <span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif" }}>{r.time}</span>
                </div>
                <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>{r.request}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ color: BROWN + "99", fontSize: 12, fontFamily: "sans-serif" }}>🙏 {r.prayed} people prayed</span>
                  <button style={{ ...s.btnOutline, padding: "6px 14px", fontSize: 12 }} onClick={() => prayFor(i)}>{prayedIds.includes(i) ? "✓ Prayed" : "Pray for them"}</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "vision" && (
          <div>
            <p style={s.sectionTitle}>📋 Faith Vision Board</p>
            <div style={s.card}>
              <p style={{ color: BROWN, fontSize: 13, lineHeight: 1.5, margin: 0 }}>Set your spiritual goals and track your journey with God. Every step forward is a victory. 🙌</p>
            </div>
            {visionGoals.map(g => (
              <div key={g.id} style={s.card}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{g.icon}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>{g.title}</p>
                    {g.streak && <p style={{ color: GOLD, fontSize: 12, fontFamily: "sans-serif", margin: "2px 0 0" }}>🔥 {g.streak} day streak</p>}
                  </div>
                  <span style={{ color: GOLD, fontSize: 14, fontWeight: "bold", fontFamily: "sans-serif" }}>{g.progress}%</span>
                </div>
                <div style={s.progressBg}>
                  <div style={{ height: 8, borderRadius: 6, background: `linear-gradient(90deg, ${GOLD}, ${BROWN})`, width: `${g.progress}%` }} />
                </div>
              </div>
            ))}
            <div style={{ ...s.card, textAlign: "center", border: `2px dashed ${GOLD_MID}` }}>
              <p style={{ color: BROWN, fontSize: 14, fontStyle: "italic" }}>+ Add a new spiritual goal</p>
            </div>
          </div>
        )}

        {activeTab === "sermon" && (
          <div>
            <p style={s.sectionTitle}>📖 AI Sermon Companion</p>
            <div style={s.card}>
              <p style={{ color: BROWN, fontSize: 14, lineHeight: 1.5, marginBottom: 10 }}>Type your sermon topic or scripture and go deeper in the Word.</p>
              <input style={s.input} placeholder="e.g. Walking by faith, John 15, Forgiveness..." value={sermonTopic} onChange={e => setSermonTopic(e.target.value)} />
              <button style={s.btn} onClick={getSermonCompanion} disabled={loadingSermon}>{loadingSermon ? "Studying the Word..." : "Study Deeper →"}</button>
            </div>
            {loadingSermon && (
              <div style={{ ...s.card, textAlign: "center", padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>📖</div>
                <p style={{ color: BROWN, fontSize: 14, fontStyle: "italic" }}>Opening the scriptures for you...</p>
              </div>
            )}
            {parsedSermon && (
              <div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 10, fontFamily: "sans-serif" }}>Discussion Questions</p>
                  {parsedSermon.questions.map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <div style={{ ...s.stepNum, width: 24, height: 24, fontSize: 12 }}>{i + 1}</div>
                      <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{q}</p>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 10, fontFamily: "sans-serif" }}>Related Scriptures</p>
                  {parsedSermon.scriptures.map((sc, i) => (
                    <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < parsedSermon.scriptures.length - 1 ? `1px solid ${GOLD_LIGHT}` : "none" }}>
                      <p style={{ color: BROWN_DARK, fontSize: 13, lineHeight: 1.5, margin: 0 }}>📌 {sc}</p>
                    </div>
                  ))}
                </div>
                <div style={{ ...s.card, background: GOLD_LIGHT }}>
                  <p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Journal Prompt</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{parsedSermon.journal}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "salvation" && (
          <div>
            <div style={s.cardGold}>
              <p style={{ color: GOLD_MID, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>The Greatest Decision</p>
              <h2 style={{ color: WHITE, fontSize: 22, margin: "0 0 8px" }}>Who is Jesus Christ?</h2>
              <p style={{ color: GOLD_LIGHT, fontSize: 14, lineHeight: 1.6, margin: 0 }}>Jesus is the Son of God, who came to earth to save humanity from sin and give us eternal life. He is the Way, the Truth, and the Life.</p>
            </div>
            <div style={s.card}>
              <p style={{ ...s.sectionTitle, fontSize: 15 }}>How to Accept Jesus</p>
              {salvationSteps.map((st, i) => (
                <div key={i} style={s.stepCard}>
                  <div style={s.stepNum}>{st.step}</div>
                  <div>
                    <p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 4px" }}>{st.title}</p>
                    <p style={{ color: BROWN, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{st.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, background: GOLD_LIGHT }}>
              <p style={{ color: BROWN, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif", marginBottom: 8 }}>The Sinner's Prayer</p>
              <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.8 }}>
                "Lord Jesus, I know that I am a sinner. I believe that You died for my sins and rose from the dead. I repent of my sins and ask You to come into my heart as my Lord and Savior. I give You my life. Amen."
              </p>
              {!sinner ? (
                <button style={s.btn} onClick={() => setSinner(true)}>I Prayed This Prayer 🙏</button>
              ) : (
                <div style={{ textAlign: "center", padding: "10px 0" }}>
                  <div style={{ fontSize: 28 }}>🎉</div>
                  <p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "6px 0 4px" }}>Welcome to the Family of God!</p>
                  <p style={{ color: BROWN, fontSize: 13, lineHeight: 1.5, margin: 0 }}>Heaven is rejoicing right now. You are loved. Start your journey with Grace Daily. ✝️</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <nav style={s.nav}>
        {tabs.map(t => (
          <button key={t.id} style={s.navBtn} onClick={() => setActiveTab(t.id)}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: activeTab === t.id ? GOLD_MID : GOLD_LIGHT + "99", fontFamily: "sans-serif", fontWeight: activeTab === t.id ? "bold" : "normal" }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
