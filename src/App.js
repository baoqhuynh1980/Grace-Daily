import React, { useState } from "react";

const GOLD = "#C9972A";
const GOLD_LIGHT = "#F5E6C0";
const GOLD_MID = "#E8C87A";
const CREAM = "#FDF8EE";
const CREAM_DARK = "#F0E6CC";
const BROWN = "#7A5C1E";
const BROWN_DARK = "#4A3510";
const WHITE = "#FFFDF7";

const emotionVerses = {
  anxious: {
    keywords: ["anxious", "anxiety", "worried", "worry", "nervous", "stress", "stressed", "overwhelmed", "panic"],
    verses: ["philippians 4:6", "isaiah 41:10", "matthew 6:34", "1 peter 5:7", "john 14:27", "psalm 34:4", "2 timothy 1:7", "psalm 23:4", "romans 15:13", "psalm 94:19"],
    reflection: "God sees every worry you carry right now. He doesn't want you to face this alone. Cast every anxiety on Him because He cares deeply for you.",
    prayer: "Father in the name of Jesus Christ I bring every worry and anxiety to you right now. I choose to trust you above my circumstances. Fill me with your peace that surpasses all understanding. In the name of Jesus Christ. Amen."
  },
  sad: {
    keywords: ["sad", "sadness", "depressed", "depression", "unhappy", "miserable", "hopeless", "down", "discouraged", "heartbroken"],
    verses: ["psalm 34:18", "matthew 5:4", "revelation 21:4", "psalm 147:3", "isaiah 61:3", "2 corinthians 1:3", "john 16:22", "psalm 30:5", "romans 8:18", "isaiah 43:2"],
    reflection: "God is close to the brokenhearted. Your sadness is not hidden from Him. He sees every tear and He is right there with you in this moment.",
    prayer: "Father in the name of Jesus Christ I come to you with a heavy heart. Lift me up from this sadness and remind me that your joy comes in the morning. Hold me close in this difficult season. In the name of Jesus Christ. Amen."
  },
  grateful: {
    keywords: ["grateful", "thankful", "blessed", "happy", "joyful", "joy", "praise", "amazing", "good", "wonderful"],
    verses: ["psalm 100:4", "1 thessalonians 5:18", "psalm 107:1", "philippians 4:4", "james 1:17", "psalm 136:1", "ephesians 5:20", "psalm 118:24", "colossians 3:17", "psalm 9:1"],
    reflection: "A grateful heart is a powerful heart. When we count our blessings and thank God for His goodness it opens the door for even more of His grace in our lives.",
    prayer: "Father in the name of Jesus Christ thank you for your goodness and mercy in my life. I praise you for every blessing both big and small. You are a good God and I am grateful for all you have done. In the name of Jesus Christ. Amen."
  },
  lonely: {
    keywords: ["lonely", "alone", "abandoned", "isolated", "forgotten", "unloved", "rejected", "left out", "no one"],
    verses: ["deuteronomy 31:6", "psalm 139:7", "hebrews 13:5", "matthew 28:20", "isaiah 43:4", "psalm 68:6", "john 14:18", "zephaniah 3:17", "romans 8:38", "psalm 27:10"],
    reflection: "You are never truly alone. God is always with you. Even in your loneliest moment His presence surrounds you. You are deeply loved and known by God.",
    prayer: "Father in the name of Jesus Christ remind me right now that I am never alone. Your presence is always with me. Fill the empty spaces in my heart with your love and your peace. In the name of Jesus Christ. Amen."
  },
  angry: {
    keywords: ["angry", "anger", "mad", "furious", "frustrated", "rage", "upset", "bitter", "resentful", "annoyed"],
    verses: ["ephesians 4:26", "james 1:19", "proverbs 15:1", "psalm 37:8", "romans 12:19", "colossians 3:8", "proverbs 29:11", "matthew 5:22", "ecclesiastes 7:9", "psalm 4:4"],
    reflection: "God understands your anger. He asks you to bring it to Him rather than let it control you. Give Him your frustration and let His peace replace it.",
    prayer: "Father in the name of Jesus Christ I give you my anger right now. Help me to respond with grace and wisdom rather than react in anger. Guard my heart and my tongue today. In the name of Jesus Christ. Amen."
  },
  lost: {
    keywords: ["lost", "confused", "don't know", "unsure", "unclear", "wandering", "no direction", "uncertain", "mixed up"],
    verses: ["proverbs 3:5", "psalm 32:8", "isaiah 30:21", "john 10:27", "psalm 119:105", "jeremiah 29:11", "proverbs 16:9", "isaiah 42:16", "psalm 25:4", "romans 8:14"],
    reflection: "Even when you feel lost God always knows exactly where you are. He is faithful to guide you step by step. Trust Him even when you cannot see the full picture.",
    prayer: "Father in the name of Jesus Christ I need your guidance right now. Show me the path you have for me. Help me to trust your direction even when I cannot see the full picture. In the name of Jesus Christ. Amen."
  },
  hopeful: {
    keywords: ["hopeful", "hope", "expectant", "believing", "trusting", "faith", "optimistic", "looking forward"],
    verses: ["romans 15:13", "jeremiah 29:11", "hebrews 11:1", "lamentations 3:22", "psalm 31:24", "isaiah 40:31", "romans 8:28", "psalm 62:5", "micah 7:7", "habakkuk 2:3"],
    reflection: "Hope in God is never wasted. He is faithful to fulfill every promise He has made. Keep your eyes fixed on Him and let your hope be rooted in His Word.",
    prayer: "Father in the name of Jesus Christ fill me with your hope today. Let my faith be strengthened as I trust in your promises. I know that you are faithful and your plans for me are good. In the name of Jesus Christ. Amen."
  },
  tempted: {
    keywords: ["tempted", "temptation", "struggling", "addicted", "addiction", "can't stop", "weak", "failing", "giving in", "sin"],
    verses: ["1 corinthians 10:13", "james 4:7", "hebrews 4:15", "galatians 5:16", "romans 6:14", "psalm 119:11", "matthew 26:41", "2 peter 2:9", "ephesians 6:11", "1 john 4:4"],
    reflection: "Every person faces temptation. But God always provides a way out. You are not alone in this struggle and through Christ you have the power to overcome.",
    prayer: "Father in the name of Jesus Christ I need your strength right now. I cannot overcome this in my own power. Give me the power to resist temptation and walk in freedom. In the name of Jesus Christ. Amen."
  },
  grieving: {
    keywords: ["grieving", "grief", "loss", "death", "mourning", "miss", "missing", "died", "passed away", "hurting"],
    verses: ["psalm 34:18", "revelation 21:4", "matthew 5:4", "2 corinthians 1:3", "isaiah 61:1", "john 11:35", "romans 8:28", "psalm 23:4", "1 thessalonians 4:13", "psalm 147:3"],
    reflection: "God sees your grief and He weeps with you. He is the God of all comfort and He will carry you through this season of loss. Your pain is not invisible to Him.",
    prayer: "Father in the name of Jesus Christ comfort me in this time of grief and loss. Hold me close and remind me that you are near to the brokenhearted. Give me your peace that passes all understanding. In the name of Jesus Christ. Amen."
  },
  surrendering: {
    keywords: ["surrender", "surrendering", "let go", "giving up", "giving it to God", "release", "submit", "yield", "trust God"],
    verses: ["matthew 11:28", "proverbs 3:5", "romans 12:1", "galatians 2:20", "psalm 46:10", "luke 22:42", "1 peter 5:6", "james 4:7", "matthew 16:24", "john 12:24"],
    reflection: "Surrendering to God is not giving up — it is the greatest act of faith. When we release control to God He is able to do far more than we could ever do on our own.",
    prayer: "Father in the name of Jesus Christ I surrender everything to you right now. My plans, my fears, my future. I trust you completely with every area of my life. Have your way in me Lord. In the name of Jesus Christ. Amen."
  },
  direction: {
    keywords: ["direction", "purpose", "calling", "what to do", "next step", "guidance", "path", "decision", "choose", "which way"],
    verses: ["proverbs 16:3", "psalm 37:23", "isaiah 30:21", "jeremiah 29:11", "psalm 32:8", "proverbs 3:6", "romans 8:14", "james 1:5", "psalm 25:9", "isaiah 48:17"],
    reflection: "God has a specific plan and purpose for your life. When you seek His direction He is faithful to guide you. Trust that He will make your path clear one step at a time.",
    prayer: "Father in the name of Jesus Christ I need your direction for my life. Show me clearly the path you have prepared for me. Give me wisdom to make the right decisions and courage to follow where you lead. In the name of Jesus Christ. Amen."
  },
  spiritualwarfare: {
    keywords: ["spiritual warfare", "attack", "enemy", "devil", "satan", "oppressed", "under attack", "darkness", "spiritual battle", "fighting"],
    verses: ["ephesians 6:11", "james 4:7", "1 peter 5:8", "2 corinthians 10:4", "revelation 12:11", "luke 10:19", "romans 8:37", "1 john 4:4", "psalm 91:1", "isaiah 54:17"],
    reflection: "The battle you are facing is real but the victory has already been won through Jesus Christ. Stand firm in your faith and resist the enemy with the Word of God.",
    prayer: "Father in the name of Jesus Christ I stand against every attack of the enemy right now. I put on the full armor of God. Greater is He that is in me than he that is in the world. In the name of Jesus Christ. Amen."
  },
  tired: {
    keywords: ["tired", "exhausted", "weary", "worn out", "burnt out", "drained", "no energy", "fatigued", "rest"],
    verses: ["matthew 11:28", "isaiah 40:31", "psalm 23:2", "mark 6:31", "2 corinthians 12:9", "galatians 6:9", "psalm 127:2", "exodus 33:14", "isaiah 41:10", "hebrews 12:3"],
    reflection: "God sees your weariness and He invites you to come to Him for rest. True rest is found in His presence. He will renew your strength as you wait on Him.",
    prayer: "Father in the name of Jesus Christ I am tired and I need your rest. Restore my strength and renew my spirit. Help me to find rest in your presence and not in the things of this world. In the name of Jesus Christ. Amen."
  },
  fearful: {
    keywords: ["fearful", "fear", "scared", "afraid", "terrified", "frightened", "dread", "panic", "phobia"],
    verses: ["2 timothy 1:7", "psalm 27:1", "isaiah 41:10", "john 14:27", "psalm 56:3", "deuteronomy 31:6", "romans 8:15", "1 john 4:18", "psalm 34:4", "hebrews 13:6"],
    reflection: "Fear is real but God is greater than every fear you face. He has not given you a spirit of fear but of power love and a sound mind. You can face anything with God by your side.",
    prayer: "Father in the name of Jesus Christ I reject the spirit of fear right now. You have given me a spirit of power love and a sound mind. I will not be afraid because you are with me. In the name of Jesus Christ. Amen."
  },
  doubting: {
    keywords: ["doubt", "doubting", "weak faith", "don't believe", "questioning", "not sure", "wavering", "struggling to believe"],
    verses: ["mark 9:24", "hebrews 11:1", "james 1:6", "romans 10:17", "matthew 14:31", "john 20:27", "jude 1:22", "2 corinthians 5:7", "psalm 73:26", "luke 17:5"],
    reflection: "Even the disciples had moments of doubt. Bring your doubts honestly to God. He is not offended by your questions. Faith grows when we are honest with God about our struggles.",
    prayer: "Father in the name of Jesus Christ I bring my doubts to you honestly right now. Help my unbelief. Strengthen my faith and help me to trust you even when I cannot fully understand. In the name of Jesus Christ. Amen."
  },
  peace: {
    keywords: ["peace", "calm", "quiet", "still", "rest", "tranquil", "settled", "serenity"],
    verses: ["john 14:27", "philippians 4:7", "isaiah 26:3", "psalm 46:10", "numbers 6:26", "romans 5:1", "colossians 3:15", "psalm 29:11", "2 thessalonians 3:16", "isaiah 32:17"],
    reflection: "The peace of God is available to you right now. It is not dependent on your circumstances. When you fix your mind on God His perfect peace will guard your heart and mind.",
    prayer: "Father in the name of Jesus Christ fill me with your perfect peace right now. Let your peace that passes all understanding guard my heart and mind. Help me to be still and know that you are God. In the name of Jesus Christ. Amen."
  },
  addiction: {
    keywords: ["addiction", "addicted", "substance", "alcohol", "drugs", "pornography", "gambling", "can't quit", "bondage", "chains"],
    verses: ["1 corinthians 10:13", "john 8:36", "galatians 5:1", "romans 6:14", "2 corinthians 5:17", "philippians 4:13", "romans 8:1", "1 john 1:9", "luke 4:18", "psalm 107:14"],
    reflection: "Jesus came to set the captives free. No addiction is too powerful for God. Through Christ you have been given the power to walk in freedom. You are not defined by your struggle.",
    prayer: "Father in the name of Jesus Christ I need your power to break free from this addiction. I cannot do this alone. Set me free by the power of your Holy Spirit and help me to walk in the freedom you purchased for me. In the name of Jesus Christ. Amen."
  },
  financial: {
    keywords: ["financial", "money", "broke", "debt", "bills", "poor", "struggling financially", "no money", "paycheck", "provision"],
    verses: ["philippians 4:19", "matthew 6:33", "psalm 23:1", "luke 12:24", "2 corinthians 9:8", "proverbs 3:9", "malachi 3:10", "psalm 37:25", "isaiah 58:11", "deuteronomy 8:18"],
    reflection: "God is your provider and He knows every financial need you have. He has promised to supply all your needs according to His riches in glory. Trust Him with your finances.",
    prayer: "Father in the name of Jesus Christ I trust you as my provider. You know every financial need I have right now. I release my worry about money and trust that you will provide everything I need. In the name of Jesus Christ. Amen."
  },
  relationships: {
    keywords: ["relationship", "marriage", "husband", "wife", "family", "friend", "conflict", "broken", "divorce", "partner"],
    verses: ["1 corinthians 13:4", "colossians 3:13", "ephesians 4:32", "proverbs 17:17", "matthew 18:20", "romans 12:18", "1 peter 4:8", "ecclesiastes 4:9", "john 15:13", "psalm 133:1"],
    reflection: "God cares deeply about your relationships. He is the author of love and He can heal and restore what is broken. Bring your relationships to Him and trust Him to work.",
    prayer: "Father in the name of Jesus Christ I bring this relationship to you. Heal what is broken, restore what has been lost and help me to love the way you love. Give me wisdom and grace in this situation. In the name of Jesus Christ. Amen."
  },
  forgiveness: {
    keywords: ["forgiveness", "forgive", "guilty", "shame", "regret", "mistake", "sin", "failed", "messed up", "repent"],
    verses: ["1 john 1:9", "psalm 103:12", "isaiah 43:25", "romans 8:1", "micah 7:19", "ephesians 1:7", "acts 3:19", "hebrews 8:12", "luke 15:20", "psalm 32:5"],
    reflection: "God's forgiveness is complete and total. When you confess and repent He removes your sin as far as the east is from the west. You do not have to carry guilt and shame any longer.",
    prayer: "Father in the name of Jesus Christ I come to you with a repentant heart. I confess my sins and receive your complete forgiveness. Thank you that there is no condemnation for those who are in Christ Jesus. In the name of Jesus Christ. Amen."
  },
  unworthy: {
    keywords: ["unworthy", "worthless", "not good enough", "failure", "useless", "nobody", "don't deserve", "inadequate", "insignificant"],
    verses: ["psalm 139:14", "ephesians 2:10", "romans 5:8", "john 3:16", "isaiah 43:4", "1 peter 2:9", "zephaniah 3:17", "romans 8:37", "galatians 3:26", "1 john 3:1"],
    reflection: "You are not defined by your failures or your feelings of unworthiness. God loved you so much that He sent His Son to die for you. That is how much you are worth to Him.",
    prayer: "Father in the name of Jesus Christ remind me of my worth in your eyes. I am fearfully and wonderfully made. I am your child and I am loved unconditionally. Help me to see myself the way you see me. In the name of Jesus Christ. Amen."
  },
  strength: {
    keywords: ["strength", "strong", "power", "courage", "bold", "brave", "overcome", "victory", "conquer", "persevere"],
    verses: ["philippians 4:13", "isaiah 40:29", "psalm 46:1", "2 corinthians 12:9", "ephesians 6:10", "joshua 1:9", "psalm 18:32", "isaiah 41:10", "habakkuk 3:19", "1 chronicles 16:11"],
    reflection: "God is your strength when you are weak. His power is made perfect in your weakness. You can do all things through Christ who strengthens you. Draw from His strength today.",
    prayer: "Father in the name of Jesus Christ be my strength today. When I am weak you are strong. Fill me with your power and help me to overcome every obstacle in my path. In the name of Jesus Christ. Amen."
  },
  worship: {
    keywords: ["worship", "praise", "glorify", "honor", "adore", "magnify", "exalt", "hallelujah", "thanksgiving"],
    verses: ["psalm 100:1", "john 4:24", "psalm 150:6", "hebrews 13:15", "revelation 4:11", "psalm 95:6", "isaiah 6:3", "psalm 29:2", "1 chronicles 29:11", "psalm 34:1"],
    reflection: "God is worthy of all praise and worship. When we worship Him our perspective shifts from our problems to His greatness. Let everything that has breath praise the Lord.",
    prayer: "Father in the name of Jesus Christ I worship you today. You are worthy of all praise honor and glory. There is no one like you and I am grateful to be called your child. Receive my worship today Lord. In the name of Jesus Christ. Amen."
  }
};

const getEmotionCategory = (feeling) => {
  const lowerFeeling = feeling.toLowerCase();
  for (const [category, data] of Object.entries(emotionVerses)) {
    if (data.keywords.some(keyword => lowerFeeling.includes(keyword))) {
      return { category, ...data };
    }
  }
  return {
    category: "general",
    verses: ["psalm 46:1", "john 3:16", "romans 8:28", "philippians 4:13", "isaiah 41:10"],
    reflection: "Whatever you are going through right now God sees you and He cares deeply for you. Bring everything to Him and trust that He is working all things together for your good.",
    prayer: "Father in the name of Jesus Christ I come to you right now with everything on my heart. You know exactly what I need. I trust you completely with my life. In the name of Jesus Christ. Amen."
  };
};

const fetchVerse = async (verseRef) => {
  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(verseRef)}?translation=kjv`);
    const data = await response.json();
    if (data.text && data.reference) {
      return { text: data.text.trim(), reference: data.reference };
    }
    return null;
  } catch (error) {
    return null;
  }
};

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
  { step: "5", title: "Follow", desc: "Deny yourself, pick up your cross daily and follow Him. (Luke 9:23)" },
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

  const getVerse = async () => {
    if (!feeling.trim()) return;
    setLoadingVerse(true);
    setVerseResult(null);
    try {
      const emotion = getEmotionCategory(feeling);
      const randomVerseRef = emotion.verses[Math.floor(Math.random() * emotion.verses.length)];
      const verseData = await fetchVerse(randomVerseRef);
      setVerseResult({
        verse: verseData ? `${verseData.reference} — ${verseData.text}` : randomVerseRef,
        reflection: emotion.reflection,
        prayer: emotion.prayer
      });
    } catch (e) {
      setVerseResult({
        verse: "Psalm 46:1 — God is our refuge and strength, an ever-present help in trouble.",
        reflection: "Whatever you are facing today God is your refuge and strength. Run to Him.",
        prayer: "Father in the name of Jesus Christ be my refuge and strength today. In the name of Jesus Christ. Amen."
      });
    }
    setLoadingVerse(false);
  };

  const getSermonCompanion = async () => {
    if (!sermonTopic.trim()) return;
    setLoadingSermon(true);
    setSermonResult(null);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are a Bible study companion helping someone go deeper after a sermon. Provide:
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
Keep everything encouraging and spiritually edifying.`,
          messages: [{ role: "user", content: `Sermon topic or passage: ${sermonTopic}` }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "";
      setSermonResult(text);
    } catch (e) {
      setSermonResult("QUESTIONS:\n- How does this passage speak to your current season of life?\n- What action step is God calling you to take?\n- How can you share this message with someone this week?\nSCRIPTURES:\n- John 15:5: Apart from Jesus we can do nothing.\n- Philippians 4:19: God will supply all your needs.\n- Proverbs 3:5-6: Trust in the Lord with all your heart.\nJOURNAL: What is one thing from this message that God is specifically saying to you today?");
    }
    setLoadingSermon(false);
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
            {verseResult && (
              <div>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>Your Verse</p>
                  <p style={{ color: WHITE, fontSize: 15, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"{verseResult.verse}"</p>
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 6, fontFamily: "sans-serif" }}>Reflection</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{verseResult.reflection}</p>
                </div>
                <div style={{ ...s.card, background: GOLD_LIGHT }}>
                  <p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Prayer for You</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{verseResult.prayer}</p>
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
              <p style={{ ...s.sectionTitle, fontSize: 15 }}>How to Receive Salvation</p>
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
              <p style={{ color: BROWN, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif", marginBottom: 8 }}>Receive Salvation</p>
              <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.8 }}>
                "Father in the name of Jesus Christ I confess with my mouth that Jesus is Lord and I believe in my heart that God raised Him from the dead. I repent of my sins and I receive Jesus Christ as my Lord and Savior. I commit to deny myself pick up my cross daily and follow Him. In the name of Jesus Christ. Amen."
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
