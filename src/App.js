import React, { useState, useEffect } from "react";
import { auth, db, messaging, requestNotificationPermission, onMessage } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "firebase/auth";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  doc,
  updateDoc,
  increment,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs
} from "firebase/firestore";

const GOLD = "#C9972A";
const GOLD_LIGHT = "#F5E6C0";
const GOLD_MID = "#E8C87A";
const CREAM = "#FDF8EE";
const CREAM_DARK = "#F0E6CC";
const BROWN = "#7A5C1E";
const BROWN_DARK = "#4A3510";
const WHITE = "#FFFDF7";
const TOTAL_CHAPTERS = 1189;
const MEMORY_GOAL = 10;
const STRIPE_LINK = "https://buy.stripe.com/bJe6oG0Pw2Wg1wf9sq8k800";

const getTodayString = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const getYesterdayString = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};

const fastingFoundation = [
  { icon: "🙏", title: "Why God Calls Us to Fast", scripture: "Matthew 6:16-18", content: "Fasting is not a religious ritual — it is a powerful act of surrender. When Jesus taught on fasting He said 'when you fast' not 'if you fast.' He expected His followers to fast. Fasting is how we say to God: knowing You is more important than feeding myself. It shifts our focus from the physical to the spiritual and opens a door for God to move in ways that prayer alone sometimes does not.", key: "Prayer and fasting always go hand in hand. Jesus connected them. The early church connected them. When we fast we are not twisting God's arm — we are positioning ourselves to receive what He already wants to give.", verses: ["Matthew 6:16-18 — When you fast do not look somber as the hypocrites do.", "Isaiah 58:6 — Is not this the kind of fasting I have chosen: to loose the chains of injustice.", "Matthew 17:21 — This kind does not go out except by prayer and fasting."] },
  { icon: "⚡", title: "What Fasting Does for You Spiritually", scripture: "Isaiah 58:6-8", content: "The Bible is clear about what fasting unlocks. Isaiah 58 is one of the most powerful passages on fasting in all of scripture. God says fasting breaks yokes, sets captives free, releases breakthrough and causes His glory to break forth like the dawn. Fasting sharpens your spiritual hearing, breaks the power of addiction and strongholds, deepens your intimacy with God and activates supernatural answers to prayer.", key: "Every time you fast combined with prayer you are engaging in spiritual warfare at the highest level. The enemy fears a believer who fasts and prays because they have access to a dimension of God's power that changes everything.", verses: ["Isaiah 58:6 — To loose the chains of injustice and untie the cords of the yoke.", "Isaiah 58:8 — Then your light will break forth like the dawn.", "Acts 13:2-3 — While fasting and praying the Holy Spirit spoke and said set apart Barnabas and Saul."] },
  { icon: "📖", title: "How to Fast According to Scripture", scripture: "Matthew 6:17-18", content: "Jesus gave us clear instructions on fasting. Fast privately — not to be seen by others. Maintain your appearance so others do not notice. Pray during your fast — fasting without prayer is just dieting. Focus on God during the time you would normally eat. Read His Word. Worship. Pray for specific breakthroughs. End your fast with gratitude and break it gently with light food.", key: "Fasting and prayer always work together. Never fast without prayer. Use every hunger pang as a prompt to pray. When your stomach growls let it remind you to cry out to God. That is how fasting becomes a spiritual weapon.", verses: ["Matthew 6:17-18 — But when you fast put oil on your head and wash your face.", "Nehemiah 1:4 — For some days I mourned and fasted and prayed before the God of heaven.", "Daniel 9:3 — So I turned to the Lord God and pleaded with him in prayer and petition, in fasting."] }
];

const beginnerFastingLevels = [
  { id: "skip_meal", label: "Skip One Meal", icon: "🌱", description: "The first step of fasting. Skip breakfast or lunch and use that time to pray instead. Prayer and fasting go hand in hand — never skip the meal without spending that time with God.", badge: "First Fast 🌱", color: "#4CAF50", bg: "#F1F8E9", count: 1 },
  { id: "half_day", label: "Half Day Fast", icon: "⚡", description: "Fast from morning until noon or noon until evening — about 6 hours. Every hunger pang is a call to prayer. Let your body's need for food drive you to your knees before God.", badge: "Half Day Warrior ⚡", color: GOLD, bg: "#FDF8EE", count: 3 },
  { id: "full_day", label: "Full Day Fast", icon: "🔥", description: "A full 24-hour fast from food. This is a powerful level of consecration. Fast from sundown to sundown or sunrise to sunrise. Drink water and pray consistently. Prayer and fasting at this level breaks chains.", badge: "Full Day Champion 🔥", color: "#FF5722", bg: "#FBE9E7", count: 7 },
];

const advancedFastingLevels = [
  { id: "once_month", label: "Once a Month", icon: "📅", description: "Commit to fasting one full day every month. This is the foundation of a consistent fasting lifestyle. Prayer and fasting once a month establishes a spiritual rhythm that keeps you sensitive to God's voice all month long.", badge: "Monthly Faster 📅", color: BROWN, bg: "#FFF8E1", count: 1 },
  { id: "twice_month", label: "Twice a Month", icon: "💪", description: "Grow into fasting twice a month — once every two weeks. This is a significant commitment that increases your spiritual sensitivity and breakthrough power. Combine every fast with focused prayer and God's Word.", badge: "Dedicated Faster 💪", color: "#7B1FA2", bg: "#F3E5F5", count: 2 },
  { id: "once_week", label: "Once a Week", icon: "⚔️", description: "Weekly fasting is the mark of a mature prayer warrior. Many great men and women of God fasted once a week their entire lives. Prayer and fasting every week keeps the spiritual atmosphere around your life clear and powerful.", badge: "Prayer Warrior ⚔️", color: "#1565C0", bg: "#E3F2FD", count: 4 },
  { id: "extended", label: "Extended Fast", icon: "👑", description: "Set a custom goal — 3 days, 7 days, or the 21-day Daniel Fast. Extended fasting combined with prayer produces the deepest breakthroughs. This level is for those ready to go deeper with God than ever before.", badge: "Daniel Faster 👑", color: "#FFD700", bg: "#FFFFF0", count: 1 },
];

const fastingMilestones = [
  { count: 1, label: "First Fast 🌱", color: "#4CAF50", bg: "#F1F8E9" },
  { count: 3, label: "Growing Faster 🌿", color: "#388E3C", bg: "#E8F5E9" },
  { count: 7, label: "Fasting Warrior ⚔️", color: GOLD, bg: "#FDF8EE" },
  { count: 14, label: "Daniel's Disciple 📖", color: BROWN, bg: "#FFF8E1" },
  { count: 21, label: "21-Day Champion 🔥", color: "#FF5722", bg: "#FBE9E7" },
  { count: 30, label: "Fasting Legend 👑", color: "#FFD700", bg: "#FFFFF0" },
];

const getFastingMilestone = (count) => {
  let current = null;
  for (const m of fastingMilestones) { if (count >= m.count) current = m; }
  return current;
};

const memoryMilestones = [
  { count: 1, label: "First Word 🌱", color: "#4CAF50", bg: "#F1F8E9" },
  { count: 3, label: "Growing Strong 🌿", color: "#388E3C", bg: "#E8F5E9" },
  { count: 5, label: "Scripture Warrior ⚔️", color: GOLD, bg: "#FDF8EE" },
  { count: 10, label: "Word Keeper 📜", color: BROWN, bg: "#FFF8E1" },
  { count: 25, label: "Living Bible 🔥", color: "#FF5722", bg: "#FBE9E7" },
  { count: 50, label: "Champion of the Word 👑", color: "#FFD700", bg: "#FFFFF0" },
];

const getMemoryMilestone = (count) => {
  let current = null;
  for (const m of memoryMilestones) { if (count >= m.count) current = m; }
  return current;
};

const createFillInBlank = (text) => {
  const skip = new Set(['a','an','the','of','in','on','at','to','for','and','or','but','is','are','was','were','be','been','has','have','had','will','would','could','should','may','might','that','this','it','he','she','we','they','his','her','its','our','their','my','your','with','from','by','as','if','so','not','me','him','us','them','you','i','who','which','what','when','where','how','than','then','those','these','there','here','even','only','do','did','does','shall','let','unto','thee','thou','thy','ye']);
  const words = text.split(' ');
  const blankIndices = [];
  let sigCount = 0;
  words.forEach((word, i) => {
    const clean = word.replace(/[.,;:!?'"()]/g, '').toLowerCase();
    if (!skip.has(clean) && clean.length > 2) { sigCount++; if (sigCount % 3 === 0) blankIndices.push(i); }
  });
  if (blankIndices.length < 3) {
    words.forEach((word, i) => {
      if (blankIndices.includes(i)) return;
      const clean = word.replace(/[.,;:!?'"()]/g, '').toLowerCase();
      if (!skip.has(clean) && clean.length > 2 && blankIndices.length < 4) blankIndices.push(i);
    });
    blankIndices.sort((a, b) => a - b);
  }
  return { words, blankIndices };
};

const checkAnswers = (words, blankIndices, userAnswers) => {
  let correct = 0;
  blankIndices.forEach((wi, i) => {
    const orig = words[wi].replace(/[.,;:!?'"()]/g, '').toLowerCase().trim();
    const ans = (userAnswers[i] || '').toLowerCase().trim();
    if (ans === orig) correct++;
  });
  const score = blankIndices.length > 0 ? Math.round((correct / blankIndices.length) * 100) : 0;
  return { correct, total: blankIndices.length, score, passed: score >= 70 };
};

const bibleBooks = [
  { name: "Genesis", chapters: 50, testament: "OT", abbrev: "gen" },
  { name: "Exodus", chapters: 40, testament: "OT", abbrev: "exo" },
  { name: "Leviticus", chapters: 27, testament: "OT", abbrev: "lev" },
  { name: "Numbers", chapters: 36, testament: "OT", abbrev: "num" },
  { name: "Deuteronomy", chapters: 34, testament: "OT", abbrev: "deu" },
  { name: "Joshua", chapters: 24, testament: "OT", abbrev: "jos" },
  { name: "Judges", chapters: 21, testament: "OT", abbrev: "jdg" },
  { name: "Ruth", chapters: 4, testament: "OT", abbrev: "rut" },
  { name: "1 Samuel", chapters: 31, testament: "OT", abbrev: "1sa" },
  { name: "2 Samuel", chapters: 24, testament: "OT", abbrev: "2sa" },
  { name: "1 Kings", chapters: 22, testament: "OT", abbrev: "1ki" },
  { name: "2 Kings", chapters: 25, testament: "OT", abbrev: "2ki" },
  { name: "1 Chronicles", chapters: 29, testament: "OT", abbrev: "1ch" },
  { name: "2 Chronicles", chapters: 36, testament: "OT", abbrev: "2ch" },
  { name: "Ezra", chapters: 10, testament: "OT", abbrev: "ezr" },
  { name: "Nehemiah", chapters: 13, testament: "OT", abbrev: "neh" },
  { name: "Esther", chapters: 10, testament: "OT", abbrev: "est" },
  { name: "Job", chapters: 42, testament: "OT", abbrev: "job" },
  { name: "Psalms", chapters: 150, testament: "OT", abbrev: "psa" },
  { name: "Proverbs", chapters: 31, testament: "OT", abbrev: "pro" },
  { name: "Ecclesiastes", chapters: 12, testament: "OT", abbrev: "ecc" },
  { name: "Song of Solomon", chapters: 8, testament: "OT", abbrev: "sng" },
  { name: "Isaiah", chapters: 66, testament: "OT", abbrev: "isa" },
  { name: "Jeremiah", chapters: 52, testament: "OT", abbrev: "jer" },
  { name: "Lamentations", chapters: 5, testament: "OT", abbrev: "lam" },
  { name: "Ezekiel", chapters: 48, testament: "OT", abbrev: "ezk" },
  { name: "Daniel", chapters: 12, testament: "OT", abbrev: "dan" },
  { name: "Hosea", chapters: 14, testament: "OT", abbrev: "hos" },
  { name: "Joel", chapters: 3, testament: "OT", abbrev: "jol" },
  { name: "Amos", chapters: 9, testament: "OT", abbrev: "amo" },
  { name: "Obadiah", chapters: 1, testament: "OT", abbrev: "oba" },
  { name: "Jonah", chapters: 4, testament: "OT", abbrev: "jon" },
  { name: "Micah", chapters: 7, testament: "OT", abbrev: "mic" },
  { name: "Nahum", chapters: 3, testament: "OT", abbrev: "nam" },
  { name: "Habakkuk", chapters: 3, testament: "OT", abbrev: "hab" },
  { name: "Zephaniah", chapters: 3, testament: "OT", abbrev: "zep" },
  { name: "Haggai", chapters: 2, testament: "OT", abbrev: "hag" },
  { name: "Zechariah", chapters: 14, testament: "OT", abbrev: "zec" },
  { name: "Malachi", chapters: 4, testament: "OT", abbrev: "mal" },
  { name: "Matthew", chapters: 28, testament: "NT", abbrev: "mat" },
  { name: "Mark", chapters: 16, testament: "NT", abbrev: "mrk" },
  { name: "Luke", chapters: 24, testament: "NT", abbrev: "luk" },
  { name: "John", chapters: 21, testament: "NT", abbrev: "jhn" },
  { name: "Acts", chapters: 28, testament: "NT", abbrev: "act" },
  { name: "Romans", chapters: 16, testament: "NT", abbrev: "rom" },
  { name: "1 Corinthians", chapters: 16, testament: "NT", abbrev: "1co" },
  { name: "2 Corinthians", chapters: 13, testament: "NT", abbrev: "2co" },
  { name: "Galatians", chapters: 6, testament: "NT", abbrev: "gal" },
  { name: "Ephesians", chapters: 6, testament: "NT", abbrev: "eph" },
  { name: "Philippians", chapters: 4, testament: "NT", abbrev: "php" },
  { name: "Colossians", chapters: 4, testament: "NT", abbrev: "col" },
  { name: "1 Thessalonians", chapters: 5, testament: "NT", abbrev: "1th" },
  { name: "2 Thessalonians", chapters: 3, testament: "NT", abbrev: "2th" },
  { name: "1 Timothy", chapters: 6, testament: "NT", abbrev: "1ti" },
  { name: "2 Timothy", chapters: 4, testament: "NT", abbrev: "2ti" },
  { name: "Titus", chapters: 3, testament: "NT", abbrev: "tit" },
  { name: "Philemon", chapters: 1, testament: "NT", abbrev: "phm" },
  { name: "Hebrews", chapters: 13, testament: "NT", abbrev: "heb" },
  { name: "James", chapters: 5, testament: "NT", abbrev: "jas" },
  { name: "1 Peter", chapters: 5, testament: "NT", abbrev: "1pe" },
  { name: "2 Peter", chapters: 3, testament: "NT", abbrev: "2pe" },
  { name: "1 John", chapters: 5, testament: "NT", abbrev: "1jn" },
  { name: "2 John", chapters: 1, testament: "NT", abbrev: "2jn" },
  { name: "3 John", chapters: 1, testament: "NT", abbrev: "3jn" },
  { name: "Jude", chapters: 1, testament: "NT", abbrev: "jud" },
  { name: "Revelation", chapters: 22, testament: "NT", abbrev: "rev" },
];

const bibleVersions = [
  { id: "kjv", name: "KJV", full: "King James Version" },
  { id: "web", name: "WEB", full: "World English Bible" },
  { id: "asv", name: "ASV", full: "American Standard Version" },
];

const sermonCategories = [
  { id: 1, category: "Core Christian Life", icon: "✝️", topics: ["Faith","Grace","Forgiveness","Prayer","Love","Salvation","Holy Spirit","Worship","Purpose","Healing","Obedience","Repentance","Holiness","Humility","Wisdom","Trusting God","Walking with God","Spiritual Growth","Surrender","Righteousness"] },
  { id: 2, category: "Emotional & Life Struggles", icon: "💔", topics: ["Fear","Anxiety","Depression","Stress","Loneliness","Doubt","Anger","Worry","Brokenness","Grief","Addiction","Temptation","Spiritual Warfare","Overcoming Sin","Burnout","Waiting on God","Feeling Lost","Identity in Christ"] },
  { id: 3, category: "Encouragement & Motivation", icon: "⚡", topics: ["God's Promises","Hope","Strength","Courage","Peace","Joy","God's Timing","Perseverance","Victory","Breakthrough","Blessings","Renewing Your Mind","Trust During Trials","Walking by Faith","God's Plan for Your Life"] },
  { id: 4, category: "Relationships & Family", icon: "👨‍👩‍👧", topics: ["Marriage","Parenting","Friendship","Loving Others","Serving Others","Conflict Resolution","Biblical Leadership","Manhood","Womanhood","Family Restoration","Dating God's Way","Forgiving Others"] },
  { id: 5, category: "Deep Biblical Topics", icon: "📖", topics: ["The Gospel","The Cross","The Resurrection","Heaven","Hell","The Armor of God","Fruits of the Spirit","Spiritual Gifts","End Times","Baptism","Communion","Discipleship","Fasting","The Kingdom of God","Sin and Redemption"] },
  { id: 6, category: "Practical Daily Living", icon: "🌅", topics: ["Morning Devotions","Daily Encouragement","How to Pray","Hearing God's Voice","Studying the Bible","Building Discipline","Living with Purpose","God in Hard Times","Handling Temptation","Daily Faith Habits"] },
  { id: 7, category: "Series Style Topics", icon: "🔥", topics: ["When God Feels Silent","Faith Over Fear","The Battle in Your Mind","God Still Heals","Waiting Season","Called for More","Jesus Changes Everything","The Power of Prayer","Chains Broken","From Broken to Blessed","Storms Don't Last Forever","God Is Still Working"] }
];

// ✅ UPDATED — Deeper sermon content with real life application
const sermonContent = {
  "Faith": {
    mainMessage: "Faith is the foundation of everything in the Christian life. It is not blind belief — it is confident, active trust in a God who has proven Himself faithful across thousands of years of human history. Faith is what moved Abraham to leave his homeland not knowing where he was going. Faith is what brought the walls of Jericho down. Faith is what caused a teenage shepherd boy named David to walk toward a giant that an entire army had run from. Every miracle in Scripture began with someone choosing to believe God when nothing in the natural world supported that belief.\n\nBut faith is not passive. James 2:26 tells us that faith without works is dead. Real faith moves your feet. It makes you take the first step before the path is fully visible. It causes you to speak to the mountain instead of talking about the mountain. Faith is the currency of the Kingdom — without it, it is impossible to please God. With it, nothing is impossible.\n\nThe enemy's greatest weapon against you is not sickness, not poverty, not opposition — it is unbelief. When he can keep you from trusting God, he can keep you from experiencing God. But every time you choose to believe God's Word over your circumstances, you are engaging in the highest form of spiritual warfare. You are declaring that God is greater than what you see, feel, or fear.",
    keyTakeaways: [
      "Faith requires action — it is not just believing in your heart but stepping out with your feet. Every person in Hebrews 11 acted on what they believed.",
      "Your faith grows when it is tested — do not run from trials. Every difficulty is an invitation to trust God at a deeper level than you ever have before.",
      "Faith speaks to your circumstances rather than letting your circumstances speak to you. David did not say 'look how big Goliath is.' He said 'Who is this uncircumcised Philistine to defy the armies of the living God?'",
      "Feed your faith daily — faith comes by hearing and hearing by the Word of God. What you feed grows. What you starve dies. Feed your faith and starve your doubts.",
      "Confess what you believe out loud — there is power in the spoken word of faith. The tongue has the power of life and death. Speak life over your situation every single day."
    ],
    scriptures: ["Hebrews 11:1 — Faith is the substance of things hoped for the evidence of things not seen.", "Matthew 17:20 — Even faith as small as a mustard seed can move mountains.", "Romans 10:17 — Faith comes by hearing and hearing by the Word of God."],
    discussionQuestions: ["What area of your life requires the most faith right now?", "How has God proven Himself faithful in your past?", "What is one step of faith God is calling you to take this week?", "What are you currently speaking over your situation — doubt or faith?"],
    prayer: "Father in the name of Jesus Christ strengthen my faith today. When I look at my circumstances I choose to look at You instead. You are bigger than every obstacle I face. I declare that I will walk by faith and not by sight. Help me to trust You completely even when I cannot see the full picture. In the name of Jesus Christ. Amen.",
    journal: "Write about a time God came through for you when you stepped out in faith. What did you risk? What did God do? Now write about the step of faith He is calling you to take today.",
    application: "This week — identify one area where fear has stopped you from moving forward. Write down what God's Word says about that situation. Then take one concrete step of faith, no matter how small."
  },
  "Grace": {
    mainMessage: "Grace is the most staggering concept in all of Scripture. It is the unmerited, unearned, undeserved favor of God extended to people who deserve the exact opposite. The word in Greek is 'charis' — it means gift, favor, beauty. Grace is what God offers when what we deserve is judgment. It is the Father running toward the prodigal son while he is still far off. It is Jesus on the cross saying 'Father forgive them for they know not what they do.'\n\nMany people intellectually accept grace but practically live as if they must earn God's approval daily. They wake up feeling guilty about yesterday's failures and spend the day trying to make it up to God through good behavior. This is not grace — this is a works-based relationship masquerading as Christianity. Grace means the slate is wiped clean — completely, permanently, forever — not because of anything you did but because of everything Jesus did.\n\nBut grace is not a license to sin carelessly. Romans 6:1-2 asks 'Shall we go on sinning so that grace may increase? By no means!' True grace — when you actually understand how much it cost Jesus to give it — produces a desire to live holy, not a permission slip to live recklessly. Grace empowers you to live the life you could never live in your own strength.",
    keyTakeaways: [
      "Grace is not earned — you cannot work for what God freely gives. Stop trying to earn what has already been given. Your good days do not impress God and your bad days do not disqualify you.",
      "Grace is greater than your greatest sin — no matter what you have done, where you have been, or what has been done to you, the grace of God is sufficient to cover it completely.",
      "Grace empowers you to live holy — it is not just forgiveness, it is power. The same grace that saves you also trains you to say no to ungodliness and yes to righteousness.",
      "Extend to others the same grace God has extended to you — if you have truly experienced grace you cannot withhold it from others. The measure you use will be measured back to you.",
      "Live in the present tense of grace — His mercies are new every morning. Every single day is a fresh start. Yesterday's failures do not determine today's possibilities."
    ],
    scriptures: ["Ephesians 2:8-9 — For by grace you have been saved through faith.", "2 Corinthians 12:9 — My grace is sufficient for you.", "Romans 5:20 — Where sin increased, grace increased all the more."],
    discussionQuestions: ["How does understanding God's grace change the way you view yourself?", "Is there an area where you are trying to earn God's favor?", "How can you extend grace to someone this week?", "Is there something from your past you have not yet allowed God's grace to cover?"],
    prayer: "Father in the name of Jesus Christ thank you for your grace that covers every mistake, every failure, every sin. I receive it fully today. I stop striving to earn what you have already freely given. Help me to live in the freedom of your grace and extend that same grace to everyone around me. In the name of Jesus Christ. Amen.",
    journal: "Reflect on a moment when you experienced God's grace in a powerful way. What did it feel like to be forgiven for something you felt was unforgivable? Now write a letter to God thanking Him specifically for what His grace has done in your life.",
    application: "This week — identify one person who has wronged you. Make a decision to extend grace to them the way God has extended grace to you. You do not have to tell them. But in your heart, release them."
  },
  "Forgiveness": {
    mainMessage: "Forgiveness is at the very heart of the Gospel. The entire Christian faith is built on the foundation of forgiveness — God forgiving humanity through the sacrifice of Jesus Christ on the cross. And yet forgiveness remains one of the hardest things any human being is asked to do. When someone has deeply wounded you — betrayed your trust, spoken lies about you, abandoned you, abused you — the last thing your flesh wants to do is forgive them.\n\nBut here is what unforgiveness actually does to you. It is like drinking poison and waiting for the other person to die. The person who hurt you has moved on with their life while you remain chained to the pain of what they did. Bitterness is a prison — and the cruel irony is that you are both the prisoner and the jailer. You hold the key to your own freedom and that key is forgiveness.\n\nForgiveness does not mean what they did was okay. It does not mean you pretend it did not happen. It does not mean you automatically trust them again or remove healthy boundaries. Forgiveness means you release them from the debt they owe you and hand the situation entirely over to God. It means you stop rehearsing the offense in your mind and stop letting it define your present. Forgiveness is not primarily for them — it is for you. It is how you walk free.",
    keyTakeaways: [
      "Forgiveness is a choice, not a feeling — you will not feel like forgiving. Do it as an act of your will and the feelings will follow over time. Forgiveness is a decision you make before your emotions cooperate.",
      "Unforgiveness hurts you more than the person who wronged you — it keeps you stuck in the past, opens doors to bitterness and anger, and can literally affect your physical health.",
      "You can forgive someone and still have healthy boundaries — forgiveness does not mean you must restore the relationship to what it was. Wisdom says you can forgive fully while still protecting yourself.",
      "God forgave you an infinite debt — remembering this makes forgiving others possible. Matthew 18 tells the story of a servant forgiven millions who then refused to forgive someone who owed him pennies.",
      "Forgiveness may need to happen repeatedly — Jesus said forgive seventy times seven. Some wounds are so deep that forgiveness is a daily choice you make until healing comes."
    ],
    scriptures: ["Ephesians 4:32 — Be kind to one another, tenderhearted, forgiving one another.", "Matthew 6:14-15 — If you forgive others your heavenly Father will also forgive you.", "Colossians 3:13 — Bear with each other and forgive one another."],
    discussionQuestions: ["Is there someone in your life you need to forgive?", "How does remembering how much God has forgiven you help you forgive others?", "What is the difference between forgiveness and reconciliation?", "What would your life look like if you were completely free from bitterness?"],
    prayer: "Father in the name of Jesus Christ I choose today to forgive those who have hurt me. I release them from the debt I feel they owe me. I hand this pain over to You and trust You to be my defender and my healer. Heal the wound in my heart where the offense lives. Set me free from bitterness and fill that space with Your peace. In the name of Jesus Christ. Amen.",
    journal: "Who do you need to forgive? Write their name. Write specifically what they did. Then write a letter you will never send — expressing everything you feel — and at the end, write the words: I choose to forgive you. I release you. I am free.",
    application: "This week — pray for the person who hurt you every single day. Not for revenge. Pray for their wellbeing. Nothing breaks the power of unforgiveness faster than genuinely praying for the person who wronged you."
  },
  "Prayer": {
    mainMessage: "Prayer is simply talking to God. It is not a religious performance, not a formula, not something reserved for pastors and priests. It is a conversation between a child and their Father. And yet so many believers treat prayer like a vending machine — they put in their request, wait for the result, and feel cheated when the answer does not come on their timeline. This is not the prayer Jesus modeled or the prayer that moves mountains.\n\nTrue prayer is a relationship. It is the ongoing conversation of a life surrendered to God. It includes praise and worship — acknowledging who God is before you bring your requests. It includes confession — being brutally honest about where you have fallen short. It includes intercession — standing in the gap for others. It includes listening — pausing long enough to hear what God wants to say back to you. Most people's prayer life is entirely one-sided. They talk at God rather than with Him.\n\nHere is the most important thing to understand about prayer: God does not answer prayer because you prayed long enough or hard enough. He answers prayer because He is a good Father who loves His children and has promised to respond to faith-filled requests that align with His will. When your prayer life is rooted in His Word and His character, you will begin to see answers that will make you fall on your face in gratitude.",
    keyTakeaways: [
      "Prayer is a conversation — learn to listen as much as you speak. After you have prayed, sit in silence for a few minutes. God speaks through Scripture, through peace, through impressions, and through circumstances.",
      "Consistency in prayer builds intimacy with God — 1 Thessalonians 5:17 says pray without ceasing. This does not mean never stop praying. It means maintain an ongoing attitude of communication with God throughout your entire day.",
      "Pray with faith and expectation — James 1:6 says ask in faith without doubting. Come to God expecting Him to hear you, expecting Him to answer, expecting Him to move.",
      "Pray in alignment with God's Word — the most powerful prayers are saturated with Scripture. When you pray God's Word back to Him you are praying with guaranteed authority.",
      "Do not give up — Luke 18:1-8 tells the parable of the persistent widow. Jesus told this story specifically to teach that we should always pray and not give up. The answer may be coming — do not stop before it arrives."
    ],
    scriptures: ["Philippians 4:6-7 — Do not be anxious about anything but in everything by prayer.", "Matthew 7:7-8 — Ask and it will be given to you.", "1 Thessalonians 5:17 — Pray without ceasing."],
    discussionQuestions: ["What does your current prayer life look like?", "What has been your most powerful answered prayer?", "Is there a prayer you gave up on that you need to pick back up?", "What would it look like to pray without ceasing in your daily life?"],
    prayer: "Father in the name of Jesus Christ teach me to pray. Teach me to hear Your voice. Teach me to come to You not just in crisis but in every ordinary moment of every ordinary day. I want a prayer life that moves mountains and changes atmospheres. Help me to be persistent, faithful, and expectant. In the name of Jesus Christ. Amen.",
    journal: "Write out a prayer to God about something you have never prayed about before. Be completely honest — as honest as you would be if you were talking to your closest friend. Then write down what you believe God might be saying back to you.",
    application: "This week — set a specific time for prayer each day and protect it. Put it in your calendar. Start with just 10 minutes. Use this structure: 2 minutes of praise, 2 minutes of confession, 4 minutes of requests, 2 minutes of listening."
  },
  "Fear": {
    mainMessage: "Fear is one of the enemy's most effective weapons because it feels so real. Fear is not always irrational — sometimes the danger is genuine. But the fear that paralyzes you, the fear that keeps you from moving forward, the fear that steals your sleep and hijacks your thoughts — that fear does not come from God. Second Timothy 1:7 is crystal clear: God has not given us a spirit of fear. That means fear is a spirit, it has a source, and that source is not your Heavenly Father.\n\nFear operates by lying to you about the future. It says 'what if this happens' and 'what if that falls apart' and 'what if you fail' — and it plays those scenarios on a loop in your mind until they feel inevitable. But faith operates the same way, just in the opposite direction. Faith says 'what if God comes through' and 'what if this works out better than I imagined' and 'what if God is already working in this situation.' The battlefield is your mind, and you choose what you allow to play on repeat.\n\nThe antidote to fear is not courage — it is the presence of God. Every time God said 'fear not' in Scripture, He followed it with 'for I am with you.' It is His presence that drives out fear. When you are walking close to God, when you are saturated in His Word, when you are in constant communication with Him — fear loses its grip on you. Not because the danger disappears but because you know the One who is greater than every danger you face.",
    keyTakeaways: [
      "Fear is a spirit that can be resisted — James 4:7 says resist the devil and he will flee from you. Fear is spiritual, which means it must be fought spiritually — with prayer, with the Word, and with the name of Jesus.",
      "The antidote to fear is the presence of God — you cannot manufacture courage on your own. But when you draw near to God, His perfect love casts out fear. Spend time in His presence and watch fear lose its grip.",
      "Stop feeding your fears and start feeding your faith — whatever you meditate on grows. If you replay fearful scenarios all day, fear grows. If you replay God's promises all day, faith grows. You choose what you rehearse.",
      "Face your fears with God — courage is not the absence of fear, it is moving forward in spite of fear. Joshua was afraid too. But God said 'be strong and courageous' — He did not say wait until you stop being afraid.",
      "Speak to your fear — Jesus spoke to the storm. He did not just pray silently. He spoke to it. There is authority in your spoken words. Declare out loud that fear has no place in your life."
    ],
    scriptures: ["2 Timothy 1:7 — God has not given us a spirit of fear but of power.", "Isaiah 41:10 — Fear not for I am with you.", "Psalm 27:1 — The Lord is my light and salvation."],
    discussionQuestions: ["What fear has been controlling your life?", "What would you do differently if you were not afraid?", "What specific promise from God's Word counters your biggest fear?", "How can you cultivate God's presence to push fear out?"],
    prayer: "Father in the name of Jesus Christ I reject the spirit of fear right now. I declare that You have not given me a spirit of fear but of power, love, and a sound mind. I take every fearful thought captive to the obedience of Christ. I fill my mind with Your Word and my heart with Your presence. Fear has no authority over my life. In the name of Jesus Christ. Amen.",
    journal: "Name your biggest fear. Write it down. Then go through the Bible and find every verse that directly contradicts that fear. Write them all down. Read them out loud every morning this week until they are more real to you than the fear.",
    application: "This week — do one thing you have been afraid to do. It does not have to be huge. Start small. Take one step toward the thing fear has been keeping you from. Journal how God meets you in that moment."
  },
  "Fasting": {
    mainMessage: "Fasting is one of the most powerful and most neglected spiritual disciplines in the modern church. Jesus did not say 'if you fast' — He said 'when you fast.' He assumed His followers would fast regularly. The early church fasted. The great men and women of God throughout history — from Moses to Elijah to Daniel to Paul — all practiced fasting as a regular part of their spiritual lives. And yet for many believers today, fasting is something they have never tried or tried once and abandoned.\n\nFasting is not about impressing God with your willpower. It is not a hunger strike to force God's hand. Fasting is how you say to God with your body what you are also saying with your mouth — You matter more to me than my physical comfort. It is the act of denying the flesh so that the spirit can rise. When you stop feeding your natural appetites and redirect that energy toward prayer and seeking God, you position yourself to receive revelation, breakthrough, and answers that simply do not come through prayer alone.\n\nIsaiah 58 is the most comprehensive passage in Scripture on fasting and it is breathtaking. God says the fasting He has chosen will loose the chains of injustice, set the oppressed free, break every yoke, and cause your light to break forth like the dawn. He says your healing will quickly appear, your righteousness will go before you, and the glory of the Lord will be your rear guard. This is what prayer and fasting produces — not just personal blessing but supernatural intervention in impossible situations.",
    keyTakeaways: [
      "Start small and build — a meal fast is a genuine fast. Do not let the perfect be the enemy of the good. Skip one meal this week, use that time to pray, and experience what even a small fast can do.",
      "Prayer and fasting must always go together — fasting without prayer is just dieting. Every moment of hunger is a signal to pray. Let your physical need remind you of your spiritual need for God.",
      "Fasting breaks spiritual chains — Matthew 17:21 says some things only come out through prayer and fasting. There are breakthroughs in your life, your family, your situation that are waiting for a fast.",
      "Fast privately — Jesus was clear that fasting is between you and God. Do not announce it on social media, do not make it obvious to others. Let it be your secret sacrifice to God.",
      "End your fast with gratitude — when you break your fast, thank God for the time you spent together. Eat gently and reflect on what He showed you during the fast."
    ],
    scriptures: ["Matthew 6:16-17 — When you fast do not look somber.", "Isaiah 58:6 — To loose the chains of injustice.", "Acts 13:2-3 — While fasting the Holy Spirit spoke."],
    discussionQuestions: ["Have you ever fasted before? What was your experience?", "What breakthrough in your life requires prayer and fasting?", "What is one practical step you can take this week to begin or grow your fasting practice?", "What chains do you need God to break in your life or your family?"],
    prayer: "Father in the name of Jesus Christ I consecrate this fast to you. I deny my flesh and I choose to seek your face. As I fast and pray I believe you are moving in ways I cannot yet see. Break every chain. Loose every yoke. Let your glory break forth in my life like the dawn. I fast and pray with faith and expectation. In the name of Jesus Christ. Amen.",
    journal: "Write about something you are believing God for that has not yet come to pass. What chains need to be broken? Commit to a specific fast this week — write down when you will start, when you will end, and what you will pray about during that time.",
    application: "This week — commit to one fast. Skip one meal and use that entire time for prayer and reading God's Word. Write down what God shows you during that time. Then commit to making fasting a regular part of your spiritual life."
  },
  "Hope": {
    mainMessage: "Hope is not wishful thinking. Biblical hope is not 'I hope things work out' in the way we might hope for good weather. Biblical hope is a confident expectation based on the character and promises of a God who cannot lie. Hebrews 6:19 says that hope is an anchor for the soul — firm and secure. An anchor does not prevent storms. It does not calm the waves. But it keeps you from being carried away when the storm hits.\n\nThe enemy targets hope because he knows that a person without hope has already been defeated in their mind. When you lose hope you stop praying, stop believing, stop trying. Hopelessness is one of the most spiritually dangerous conditions a believer can find themselves in. That is why the enemy works so hard to steal it — through prolonged waiting, through repeated disappointment, through prayers that seem unanswered.\n\nBut here is the truth about hope in God: it is never wasted. Romans 5:5 says hope does not put us to shame. Every promise God has made will be fulfilled. Every prayer prayed in faith will receive an answer. His timing is not our timing — but His timing is always perfect. The waiting is not wasted. God is always working even when we cannot see it, always faithful even when we cannot feel it, always good even when circumstances say otherwise.",
    keyTakeaways: [
      "Hope is rooted in God's character not your circumstances — your circumstances change daily, God never changes. Anchor your hope in who He is, not in what you see.",
      "You are never without hope because you are never without God — Romans 8:31 says if God is for you who can be against you. As long as God is in the picture, hope is never lost.",
      "Hope requires active feeding — read the promises of God daily. Write them down. Speak them out loud. Hope is not passive, it must be actively cultivated through time in God's Word.",
      "Surround yourself with hope-filled people — Hebrews 10:25 says encourage one another. Find people who will speak life and faith into your situation when you cannot find it yourself.",
      "Lamentations 3 shows us that hope can be recovered — Jeremiah was at rock bottom, saying his strength and hope are gone. Then he remembered God's faithfulness and his hope was restored. Hope can come back."
    ],
    scriptures: ["Romans 15:13 — May the God of hope fill you with joy and peace.", "Jeremiah 29:11 — For I know the plans I have for you.", "Lamentations 3:22-23 — His mercies are new every morning."],
    discussionQuestions: ["Where have you lost hope recently?", "What promise from God's Word gives you the most hope right now?", "Who in your life needs you to be a voice of hope for them this week?", "What would change in your daily life if you truly believed God's plans for you are good?"],
    prayer: "Father in the name of Jesus Christ restore my hope today. Where I have grown weary and started to give up, breathe new life into my spirit. Remind me of your faithfulness in my past so I can trust you with my future. Fill me with the hope that does not disappoint — the hope that is anchored in who You are. In the name of Jesus Christ. Amen.",
    journal: "Write about a season when all hope seemed lost but God came through. Be specific — what did you feel, what happened, how did God show up? Then write a declaration of hope over your current situation based on what you know about God's faithfulness.",
    application: "This week — write Jeremiah 29:11 on a card and put it somewhere you will see it every morning. Before you check your phone, read that verse out loud and let it be the first thing that shapes your mindset for the day."
  },
  "Identity in Christ": {
    mainMessage: "One of the greatest crises in the church today is an identity crisis. Millions of believers have accepted Jesus as Savior but are still living from the identity the world, their past, or the enemy gave them. They still see themselves as failures, as unworthy, as damaged, as defined by what they have done or what has been done to them. And because they live from that false identity, they live far below the life God has prepared for them.\n\nYour identity in Christ is not something you earn or achieve — it is something you receive. The moment you put your faith in Jesus Christ, everything about who you are changed at a fundamental level. Second Corinthians 5:17 says if anyone is in Christ, the new creation has come — the old has gone, the new is here. You are not a sinner trying to be good. You are a saint who sometimes struggles. That is not just motivational language — it is the actual spiritual reality of who you are in God's sight.\n\nThe battle over your identity is fought in your mind. The enemy does not need to make you commit great sin if he can simply keep you from believing who God says you are. Every day he whispers 'you are worthless,' 'you are too broken,' 'you will always be this way,' 'God could never use someone like you.' And every day you have a choice — will you believe the liar or will you believe the One who made you, redeemed you, and called you by name?",
    keyTakeaways: [
      "Your identity is rooted in whose you are not what you do — you are a child of God. That identity does not change based on your performance, your failures, or what others say about you.",
      "Replace every lie with a specific truth from God's Word — when the enemy says 'you are worthless' counter with 1 Peter 2:9 'you are chosen, royal, holy, God's special possession.'",
      "You are already accepted — Ephesians 1:6 says you are accepted in the beloved. Stop striving for acceptance from God or people. You already have it through Christ.",
      "Your past does not define your identity — 2 Corinthians 5:17 says the old has gone. God does not see you through the lens of your worst moments. He sees you through the lens of Christ's righteousness.",
      "Live from your identity not toward it — many people live trying to become who God says they are. But you already are who God says you are. Live from that reality, not toward it."
    ],
    scriptures: ["2 Corinthians 5:17 — If anyone is in Christ the new creation has come.", "Ephesians 1:4-5 — He chose us before the creation of the world.", "1 Peter 2:9 — You are a chosen people, a royal priesthood."],
    discussionQuestions: ["What lies have you believed about yourself?", "What truth about your identity in Christ do you need to declare today?", "How would your daily life look different if you fully believed you were who God says you are?", "Who has spoken a false identity over you that you need to renounce?"],
    prayer: "Father in the name of Jesus Christ I declare who I am in You today. I am loved — chosen before the foundation of the world. I am redeemed — bought with the blood of Jesus. I am called — created for a purpose that only I can fulfill. I renounce every lie the enemy has spoken over me and I declare that I am who Your Word says I am. In the name of Jesus Christ. Amen.",
    journal: "List 10 specific things God says about you in His Word. Look them up, write the full verse, and personalize each one with your own name. Read them out loud every morning this week until they feel more real than the lies you have believed.",
    application: "This week — every time a negative thought comes about who you are, immediately respond out loud with a truth from God's Word. Do not argue with the thought. Replace it. Do this consistently for 7 days and notice what changes."
  },
  "Marriage": {
    mainMessage: "Marriage is God's design — not a human invention, not a social construct, but a divine covenant created by God Himself in the Garden of Eden before sin ever entered the picture. Genesis 2:24 says a man shall leave his father and mother, be united to his wife, and they shall become one flesh. This is God's blueprint — two incomplete people becoming one complete unit, with God at the center of the union.\n\nThe problem is that most marriages are built as a two-legged stool — husband and wife — and when conflict, disappointment, and the weight of life press down on that stool, it tips over. The marriages that last, that thrive, that reflect the beauty God intended, are three-legged stools — husband, wife, and God. Ecclesiastes 4:12 says a cord of three strands is not quickly broken. When God is at the center, when both spouses are pursuing Him individually and together, the marriage has a strength that no conflict can ultimately destroy.\n\nMarriage is also the most powerful picture in all of creation of the relationship between Christ and the Church. Ephesians 5 compares a husband's love for his wife to Christ's love for the Church — a love that is sacrificial, unconditional, and constant. When a marriage reflects this kind of love, it becomes a testimony to the watching world of who God is. Your marriage is not just about you and your spouse — it is a living sermon.",
    keyTakeaways: [
      "A strong marriage requires three — you, your spouse, and God. Make church attendance, prayer together, and pursuing God individually non-negotiable priorities in your marriage.",
      "Love in marriage is a covenant not a feeling — feelings will fluctuate. Covenant does not. On the days you do not feel love, choose love as an act of your will. The feelings often follow the choice.",
      "Pursue your spouse daily — do not take each other for granted. The same intentionality you had when you were dating is required for the rest of your marriage. Pursue, serve, and cherish.",
      "Fight for your marriage not with your spouse — your spouse is not your enemy. The enemy of your marriage is the actual enemy. When conflict arises, pray together before the conflict escalates.",
      "Speak life over your spouse — your words have power. Build your spouse up privately and publicly. Never tear them down to others. Be their greatest encourager and their safest place."
    ],
    scriptures: ["Ephesians 5:25 — Husbands love your wives as Christ loved the church.", "Genesis 2:24 — A man shall be united to his wife.", "Ecclesiastes 4:12 — A cord of three strands is not quickly broken."],
    discussionQuestions: ["What does it look like to put God at the center of your marriage?", "What is one thing you can do this week to strengthen your marriage?", "How can you serve your spouse in a specific way this week?", "What area of your marriage needs the most prayer right now?"],
    prayer: "Father in the name of Jesus Christ I bring my marriage to you. You designed it, you ordained it, and I trust you to sustain it. Help me to love my spouse the way Christ loves the church — sacrificially, consistently, and unconditionally. Protect our marriage from every attack of the enemy. Make our home a place of peace, love, and Your presence. In the name of Jesus Christ. Amen.",
    journal: "Write about what you love most about your spouse. Be specific — list at least 10 things. Then write one way you will intentionally show them love this week that goes beyond what is expected or routine.",
    application: "This week — pray with your spouse every single day, even if it is just 2 minutes before bed. If you are not married, pray for your future spouse or pray for the marriages in your community."
  },
  "Jesus Changes Everything": {
    mainMessage: "There is a before and after in every person who has genuinely encountered Jesus Christ. Not a religious experience, not a church attendance decision, not a cultural Christian identity — but a real, life-altering encounter with the living Son of God. The woman at the well in John 4 came to draw water and left running to tell everyone in town about the man who knew everything about her and loved her anyway. Zacchaeus climbed a tree out of curiosity and came down a completely transformed man who immediately began making restitution for every wrong he had ever done. Paul was on his way to persecute Christians and left that road as the greatest missionary the church has ever known.\n\nJesus does not fix people — He makes them new. Second Corinthians 5:17 does not say the old has improved or the old has been patched up. It says the old has gone. There is a fundamental transformation that happens at the core of a person when they truly surrender their life to Jesus Christ. The things they once loved they now find empty. The things they once had no interest in — prayer, Scripture, worship, serving others — become the desires of their heart.\n\nThis is the miracle of the Gospel. Not just that your sins are forgiven — as magnificent as that is — but that you become a completely new person. A new identity, a new purpose, a new power, a new destiny. Everything changes. And when everything inside you changes, everything around you begins to change too — your relationships, your priorities, your capacity for love, your ability to forgive, your perspective on suffering. Jesus changes everything. Not eventually. Not partially. Everything.",
    keyTakeaways: [
      "Jesus does not just fix broken things — He makes all things new. You are not a repaired version of your old self. You are a new creation. Live from that reality.",
      "Your past does not define you — your encounter with Jesus does. No matter what is in your history — abuse, addiction, failure, shame — the encounter with Jesus Christ rewrites your story.",
      "The change is real but growth takes time — salvation is instant, sanctification is a process. Be patient with yourself. You are being transformed from glory to glory.",
      "Your transformation is someone else's testimony — the changes Jesus makes in your life are not just for you. They are meant to give hope to everyone watching. Your story matters.",
      "You cannot keep this to yourself — once you have been truly transformed by Jesus, the natural response is to want everyone you know to experience the same thing. Let your life be your witness."
    ],
    scriptures: ["2 Corinthians 5:17 — If anyone is in Christ the new creation has come.", "John 10:10 — I have come that they may have life to the full.", "Galatians 2:20 — I have been crucified with Christ."],
    discussionQuestions: ["How has your encounter with Jesus changed your life?", "Who needs to know that Jesus changes everything?", "What is the biggest difference between who you were before Jesus and who you are now?", "Is there an area of your life where you have not yet allowed Jesus to make things new?"],
    prayer: "Father in the name of Jesus Christ thank you that Jesus changed everything for me. I am not who I used to be. I am not what my past says I am. I am a new creation — loved, redeemed, called, and filled with your Spirit. Use my transformed life as a testimony that points people to You. In the name of Jesus Christ. Amen.",
    journal: "Write your before and after story. Who were you before Jesus — what did you believe, how did you live, what drove you? Who are you now? Be as specific and honest as possible. Then ask God who He wants you to share this story with.",
    application: "This week — share your testimony with one person. It does not have to be a formal presentation. Just tell someone what Jesus has done in your life. Your story has power — use it."
  },
  "When God Feels Silent": {
    mainMessage: "Every sincere believer will go through seasons where God feels distant, where heaven seems like brass, where prayers seem to bounce off the ceiling and fall back to the floor unanswered. The mystics of the church called this the dark night of the soul. The Psalms are full of it — David crying out 'My God, my God, why have you forsaken me?' Jeremiah lamenting in such despair he wished he had never been born. Even Jesus on the cross cried out in the language of abandonment. The experience of God's apparent silence is not a sign of spiritual failure — it is a mark of authentic faith.\n\nBut here is the critical distinction you must understand: silence is not absence. When God seems quiet, He has not moved. He has not abandoned you. He has not forgotten you. Isaiah 49:15-16 says even if a mother could forget her nursing child, God will never forget you — He has engraved you on the palm of His hands. The silence you experience is not rejection. Often it is invitation — an invitation to seek Him more deeply, to trust Him more completely, to hold on when holding on is all you can do.\n\nIn the silence, God is doing some of His greatest work. It is in the dark seasons that roots go deep. Trees that grow in environments with plenty of water develop shallow root systems. Trees that must search for water develop deep roots that can withstand any storm. The silent season is not God punishing you or abandoning you — it is God developing in you a depth of faith and trust that the easy seasons never could.",
    keyTakeaways: [
      "God's silence is not His absence — Hebrews 13:5 says He will never leave you or forsake you. His promise does not change based on what you feel. Feelings are real but they are not reliable guides to spiritual truth.",
      "Keep showing up even when you do not feel Him — consistency in the dry season is the mark of mature faith. Keep reading, keep praying, keep worshipping — not because you feel it but because you know who He is.",
      "The silent season has a purpose — God is doing something in the darkness that He could not do in the light. Trust the process even when you cannot see the outcome.",
      "Talk to God about the silence — do not pretend you are fine if you are not. Be honest with God. The Psalms model this — raw, honest, sometimes desperate prayers that always end in trust.",
      "Find others who have been through this season — you are not the first person to feel this way. Church history is full of men and women who walked through darkness and came out with deeper faith. Find their stories."
    ],
    scriptures: ["Psalm 22:1-2 — My God why have you forsaken me.", "Isaiah 45:15 — Truly you are a God who hides himself.", "Hebrews 13:5 — Never will I leave you."],
    discussionQuestions: ["Have you gone through a season where God felt silent?", "How do you maintain faith when you cannot feel God?", "What did you learn about yourself and about God in the silent season?", "How can you support someone who is currently in a dark season?"],
    prayer: "Father in the name of Jesus Christ even in this silence I choose to trust you. I do not understand why You feel distant but I know You have not moved. I hold onto Your Word when I cannot feel Your presence. I trust Your character when I cannot trace Your hand. I will keep showing up and I believe You are working even now in ways I cannot yet see. In the name of Jesus Christ. Amen.",
    journal: "Write an honest letter to God about this silent season. Say everything — the confusion, the hurt, the questions. Hold nothing back. Then on the next page, write every truth you know about God's character that is still true regardless of how you feel. End with a declaration of trust.",
    application: "This week — commit to showing up in prayer every single day regardless of how you feel. Even if all you can say is 'God I don't feel you but I trust you.' That is faith. That is exactly what God is looking for in the silent season."
  }
};

// ✅ NEW — Parse scripture reference from sermon text
const parseVerseRef = (scriptureString) => {
  const refPart = scriptureString.split(" — ")[0].trim();
  const match = refPart.match(/^(.+?)\s+(\d+):(\d+)/);
  if (!match) return null;
  const bookName = match[1].trim();
  const chapter = parseInt(match[2]);
  const verse = parseInt(match[3]);
  return { bookName, chapter, verse };
};

const getSermonContent = (topic) => {
  if (sermonContent[topic]) return sermonContent[topic];
  return { mainMessage: `${topic} is a powerful subject in the Christian faith. God's Word has much to say about this topic and it applies directly to where you are right now. Take time this week to search the Scriptures on this subject and ask God to reveal His truth to you personally.`, keyTakeaways: [`Seek God's wisdom on ${topic} through prayer and His Word.`, `Apply what you learn about ${topic} to your everyday life.`, `Share what God shows you about ${topic} with someone who needs to hear it.`], scriptures: ["Proverbs 3:5-6 — Trust in the Lord with all your heart.", "Psalm 119:105 — Your word is a lamp to my feet.", "James 1:5 — If any of you lacks wisdom let him ask God."], discussionQuestions: [`What does God's Word say about ${topic}?`, `How does ${topic} apply to your current season?`, `What is one practical step you can take this week based on what you've learned?`], prayer: `Father in the name of Jesus Christ give me wisdom about ${topic}. Open my eyes to see what You see about this area of my life. Give me the courage to apply what You show me. In the name of Jesus Christ. Amen.`, journal: `Write about what God is showing you about ${topic}. What will you apply this week? What do you need to surrender to Him in this area?`, application: `This week — spend 15 minutes searching the Scriptures about ${topic}. Write down every verse you find. Then identify one practical application for your daily life.` };
};

const emotionVerses = {
  anxious: { keywords: ["anxious","anxiety","worried","worry","nervous","stress","stressed","overwhelmed","panic"], verses: ["philippians 4:6","isaiah 41:10","matthew 6:34","1 peter 5:7","john 14:27","psalm 34:4","2 timothy 1:7","psalm 23:4","romans 15:13","psalm 94:19"], reflection: "God sees every worry you carry. Cast every anxiety on Him because He cares deeply for you.", prayer: "Father in the name of Jesus Christ I bring every worry to you. Fill me with your peace. In the name of Jesus Christ. Amen." },
  sad: { keywords: ["sad","sadness","depressed","depression","unhappy","miserable","hopeless","down","discouraged","heartbroken"], verses: ["psalm 34:18","matthew 5:4","revelation 21:4","psalm 147:3","isaiah 61:3","2 corinthians 1:3","john 16:22","psalm 30:5","romans 8:18","isaiah 43:2"], reflection: "God is close to the brokenhearted. He sees every tear and is right there with you.", prayer: "Father in the name of Jesus Christ I come to you with a heavy heart. Lift me up. In the name of Jesus Christ. Amen." },
  grateful: { keywords: ["grateful","thankful","blessed","happy","joyful","joy","praise","amazing","good","wonderful"], verses: ["psalm 100:4","1 thessalonians 5:18","psalm 107:1","philippians 4:4","james 1:17","psalm 136:1","ephesians 5:20","psalm 118:24","colossians 3:17","psalm 9:1"], reflection: "A grateful heart is a powerful heart. Counting blessings opens the door for even more grace.", prayer: "Father in the name of Jesus Christ thank you for your goodness and mercy. In the name of Jesus Christ. Amen." },
  lonely: { keywords: ["lonely","alone","abandoned","isolated","forgotten","unloved","rejected","left out","no one"], verses: ["deuteronomy 31:6","psalm 139:7","hebrews 13:5","matthew 28:20","isaiah 43:4","psalm 68:6","john 14:18","zephaniah 3:17","romans 8:38","psalm 27:10"], reflection: "You are never truly alone. Even in your loneliest moment God's presence surrounds you.", prayer: "Father in the name of Jesus Christ remind me I am never alone. Fill my heart with your love. In the name of Jesus Christ. Amen." },
  angry: { keywords: ["angry","anger","mad","furious","frustrated","rage","upset","bitter","resentful","annoyed"], verses: ["ephesians 4:26","james 1:19","proverbs 15:1","psalm 37:8","romans 12:19","colossians 3:8","proverbs 29:11","matthew 5:22","ecclesiastes 7:9","psalm 4:4"], reflection: "God understands your anger. He asks you to bring it to Him rather than let it control you.", prayer: "Father in the name of Jesus Christ I give you my anger. Help me respond with grace and wisdom. In the name of Jesus Christ. Amen." },
  fearful: { keywords: ["fearful","fear","scared","afraid","terrified","frightened","dread","phobia"], verses: ["2 timothy 1:7","psalm 27:1","isaiah 41:10","john 14:27","psalm 56:3","deuteronomy 31:6","romans 8:15","1 john 4:18","psalm 34:4","hebrews 13:6"], reflection: "Fear is real but God is greater than every fear you face.", prayer: "Father in the name of Jesus Christ I reject the spirit of fear. In the name of Jesus Christ. Amen." },
  tired: { keywords: ["tired","exhausted","weary","worn out","burnt out","drained","no energy","fatigued","rest"], verses: ["matthew 11:28","isaiah 40:31","psalm 23:2","mark 6:31","2 corinthians 12:9","galatians 6:9","psalm 127:2","exodus 33:14","isaiah 41:10","hebrews 12:3"], reflection: "God sees your weariness and invites you to come to Him for rest.", prayer: "Father in the name of Jesus Christ I am tired and need your rest. Restore my strength. In the name of Jesus Christ. Amen." },
  hopeful: { keywords: ["hopeful","hope","expectant","believing","trusting","faith","optimistic","looking forward"], verses: ["romans 15:13","jeremiah 29:11","hebrews 11:1","lamentations 3:22","psalm 31:24","isaiah 40:31","romans 8:28","psalm 62:5","micah 7:7","habakkuk 2:3"], reflection: "Hope in God is never wasted. He is faithful to fulfill every promise He has made.", prayer: "Father in the name of Jesus Christ fill me with your hope today. In the name of Jesus Christ. Amen." },
  peace: { keywords: ["peace","calm","quiet","still","tranquil","settled","serenity"], verses: ["john 14:27","philippians 4:7","isaiah 26:3","psalm 46:10","numbers 6:26","romans 5:1","colossians 3:15","psalm 29:11","2 thessalonians 3:16","isaiah 32:17"], reflection: "The peace of God is available to you right now. It is not dependent on your circumstances.", prayer: "Father in the name of Jesus Christ fill me with your perfect peace. In the name of Jesus Christ. Amen." },
  strength: { keywords: ["strength","strong","power","courage","bold","brave","overcome","victory","conquer","persevere"], verses: ["philippians 4:13","isaiah 40:29","psalm 46:1","2 corinthians 12:9","ephesians 6:10","joshua 1:9","psalm 18:32","isaiah 41:10","habakkuk 3:19","1 chronicles 16:11"], reflection: "God is your strength when you are weak. His power is made perfect in weakness.", prayer: "Father in the name of Jesus Christ be my strength today. In the name of Jesus Christ. Amen." },
};

const getEmotionCategory = (feeling) => {
  const lowerFeeling = feeling.toLowerCase();
  for (const [category, data] of Object.entries(emotionVerses)) {
    if (data.keywords.some(keyword => lowerFeeling.includes(keyword))) return { category, ...data };
  }
  return { category: "general", verses: ["psalm 46:1","john 3:16","romans 8:28","philippians 4:13","isaiah 41:10"], reflection: "Whatever you are going through God sees you and cares deeply for you.", prayer: "Father in the name of Jesus Christ I come to you with everything on my heart. I trust you completely. In the name of Jesus Christ. Amen." };
};

const fetchVerse = async (verseRef, version = "kjv") => {
  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(verseRef)}?translation=${version}`);
    const data = await response.json();
    if (data.text && data.reference) return { text: data.text.trim(), reference: data.reference };
    return null;
  } catch { return null; }
};

const dailyVerses = [
  { ref: "2 Corinthians 12:9", text: "My grace is sufficient for you, for my power is made perfect in weakness." },
  { ref: "Jeremiah 29:11", text: "For I know the plans I have for you, plans to prosper you and not to harm you, plans to give you hope and a future." },
  { ref: "Psalm 23:1", text: "The Lord is my shepherd; I shall not want." },
  { ref: "Romans 8:28", text: "And we know that in all things God works for the good of those who love him." },
  { ref: "Philippians 4:13", text: "I can do all things through Christ who strengthens me." },
  { ref: "Isaiah 40:31", text: "But those who hope in the Lord will renew their strength. They will soar on wings like eagles." },
  { ref: "John 3:16", text: "For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life." },
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
  { id: "bible", label: "Bible", icon: "📖" },
  { id: "memory", label: "Memory", icon: "✍️" },
  { id: "verse", label: "Verse", icon: "✨" },
  { id: "prayer", label: "Prayer", icon: "🙏" },
  { id: "vision", label: "Vision", icon: "📋" },
  { id: "sermon", label: "Sermon", icon: "🎙️" },
  { id: "salvation", label: "Jesus", icon: "✝️" },
  { id: "about", label: "About", icon: "💛" },
];

const goalIcons = ["📖","🙏","✝️","⚡","❤️","🌟","🕊️","🔥","💪","🌿","🎯","👑"];

const getMilestone = (progress) => {
  if (progress >= 100) return { label: "Champion! 🏆", color: "#FFD700", bg: "#FFF8DC" };
  if (progress >= 75) return { label: "Gold 🥇", color: "#C9972A", bg: "#FDF8EE" };
  if (progress >= 50) return { label: "Silver 🥈", color: "#7A7A7A", bg: "#F5F5F5" };
  if (progress >= 25) return { label: "Bronze 🥉", color: "#CD7F32", bg: "#FFF5EE" };
  return null;
};

function PremiumGate({ onUpgrade }) {
  return (
    <div style={{ background: `linear-gradient(135deg, ${BROWN_DARK}, ${BROWN})`, borderRadius: 16, padding: 24, margin: "8px 0 14px", border: `2px solid ${GOLD}`, textAlign: "center" }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>👑</div>
      <h3 style={{ color: GOLD_MID, fontSize: 20, fontWeight: "bold", margin: "0 0 8px", fontFamily: "sans-serif" }}>Premium Feature</h3>
      <p style={{ color: GOLD_LIGHT, fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>This feature is included in Grace Daily Premium. Start your 7-day free trial to unlock everything!</p>
      <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "10px 14px", marginBottom: 16 }}>
        <p style={{ color: GOLD_MID, fontSize: 15, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>7 Days FREE — then $4.99/month</p>
        <p style={{ color: GOLD_LIGHT, fontSize: 11, margin: "2px 0 0", fontFamily: "sans-serif" }}>Cancel anytime. No commitment.</p>
      </div>
      {[["✍️","Scripture Memory + Badges"],["📓","Prayer Journal"],["📋","Faith Vision Board"],["⚡","Fasting Tracker"],["🎯","Pop Quiz System"]].map(([icon, f]) => (
        <p key={f} style={{ color: GOLD_LIGHT, fontSize: 12, margin: "0 0 4px", fontFamily: "sans-serif", textAlign: "left" }}>✅ {icon} {f}</p>
      ))}
      <button style={{ background: `linear-gradient(135deg, ${GOLD}, #C9972A)`, color: "#FFFDF7", border: "none", borderRadius: 10, padding: "13px 20px", fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif", width: "100%", marginTop: 14 }} onClick={onUpgrade}>Start 7-Day Free Trial 👑</button>
      <p style={{ color: GOLD_LIGHT, fontSize: 10, textAlign: "center", margin: "8px 0 0", fontFamily: "sans-serif", opacity: 0.7 }}>Powered by Stripe — Secure Payment 🔒</p>
    </div>
  );
}

function AuthScreen({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const s = {
    screen: { background: `linear-gradient(160deg, ${BROWN_DARK} 0%, ${BROWN} 60%, ${GOLD} 100%)`, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px", fontFamily: "Georgia, serif" },
    card: { background: WHITE, borderRadius: 20, padding: "28px 24px", width: "100%", maxWidth: 400, boxShadow: "0 8px 32px rgba(0,0,0,0.3)" },
    title: { color: BROWN_DARK, fontSize: 22, fontWeight: "bold", margin: "0 0 4px", textAlign: "center" },
    subtitle: { color: BROWN, fontSize: 13, textAlign: "center", margin: "0 0 24px" },
    label: { color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", letterSpacing: 0.5, marginBottom: 6, display: "block" },
    input: { width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${GOLD_MID}`, background: CREAM, fontSize: 14, fontFamily: "Georgia, serif", color: BROWN_DARK, boxSizing: "border-box", outline: "none", marginBottom: 14 },
    btn: { background: `linear-gradient(135deg, ${GOLD}, ${BROWN})`, color: WHITE, border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif", width: "100%", marginTop: 4 },
    error: { background: "#FFE8E8", border: "1px solid #FFB3B3", borderRadius: 8, padding: "10px 14px", color: "#8B0000", fontSize: 13, marginBottom: 14, fontFamily: "sans-serif" },
    toggle: { textAlign: "center", marginTop: 18, color: BROWN, fontSize: 13, fontFamily: "sans-serif" },
    toggleBtn: { background: "none", border: "none", color: GOLD, fontWeight: "bold", cursor: "pointer", fontSize: 13, fontFamily: "sans-serif", textDecoration: "underline" },
    dividerLine: { flex: 1, height: 1, background: GOLD_LIGHT },
    guestBtn: { background: "none", border: `1.5px solid ${GOLD_MID}`, color: BROWN, borderRadius: 10, padding: "10px 20px", fontSize: 14, cursor: "pointer", fontFamily: "sans-serif", width: "100%", marginTop: 4 },
  };

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please enter your email and password."); return; }
    if (mode === "signup" && !name.trim()) { setError("Please enter your name."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        await setDoc(doc(db, "users", cred.user.uid), { email: email.trim(), name: name.trim(), createdAt: new Date(), isPremium: false });
      } else {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      }
      onAuthSuccess();
    } catch (err) {
      const msgs = { "auth/email-already-in-use": "An account with this email already exists.", "auth/invalid-email": "Please enter a valid email address.", "auth/wrong-password": "Incorrect password. Please try again.", "auth/user-not-found": "No account found with this email.", "auth/invalid-credential": "Incorrect email or password.", "auth/too-many-requests": "Too many attempts. Please wait a moment.", "auth/network-request-failed": "Network error. Please check your connection." };
      setError(msgs[err.code] || "Something went wrong. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div style={s.screen}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>✝️</div>
        <h1 style={{ color: GOLD_MID, fontSize: 28, fontWeight: "bold", margin: "0 0 4px", letterSpacing: 1 }}>Grace Daily</h1>
        <p style={{ color: GOLD_LIGHT, fontSize: 14, margin: 0, opacity: 0.9, fontStyle: "italic" }}>His Grace is Sufficient — 2 Corinthians 12:9</p>
      </div>
      <div style={s.card}>
        <h2 style={s.title}>{mode === "login" ? "Welcome Back 🙏" : "Join Grace Daily ✝️"}</h2>
        <p style={s.subtitle}>{mode === "login" ? "Sign in to continue your faith journey." : "Create your free account to get started."}</p>
        {error && <div style={s.error}>⚠️ {error}</div>}
        {mode === "signup" && (<div><label style={s.label}>YOUR NAME</label><input style={s.input} type="text" placeholder="Your first name" value={name} onChange={e => setName(e.target.value)} /></div>)}
        <label style={s.label}>EMAIL ADDRESS</label>
        <input style={s.input} type="email" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        <label style={s.label}>PASSWORD</label>
        <input style={s.input} type="password" placeholder={mode === "signup" ? "At least 6 characters" : "Your password"} value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        <button style={s.btn} onClick={handleSubmit} disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Sign In →" : "Create Account →"}</button>
        <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "16px 0" }}>
          <div style={s.dividerLine} /><span style={{ color: BROWN + "88", fontSize: 12, fontFamily: "sans-serif" }}>or</span><div style={s.dividerLine} />
        </div>
        <button style={s.guestBtn} onClick={onAuthSuccess}>Continue as Guest</button>
        <div style={s.toggle}>
          {mode === "login" ? (<span>Don't have an account? <button style={s.toggleBtn} onClick={() => { setMode("signup"); setError(""); }}>Sign Up</button></span>) : (<span>Already have an account? <button style={s.toggleBtn} onClick={() => { setMode("login"); setError(""); }}>Sign In</button></span>)}
        </div>
      </div>
    </div>
  );
}
export default function App() {
  const [user, setUser] = useState(undefined);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [feeling, setFeeling] = useState("");
  const [verseResult, setVerseResult] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [prayedIds, setPrayedIds] = useState([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [prayerList, setPrayerList] = useState([]);
  const [prayerLoading, setPrayerLoading] = useState(true);
  const [sinner, setSinner] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topicContent, setTopicContent] = useState(null);
  const [sermonSearch, setSermonSearch] = useState("");
  const [prayerTab, setPrayerTab] = useState("how");
  const [journalTitle, setJournalTitle] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [journalEntries, setJournalEntries] = useState([]);
  const [journalLoading, setJournalLoading] = useState(false);
  const [testimony, setTestimony] = useState("");
  const [testimonies, setTestimonies] = useState([
    { text: "God healed my mother after 3 months of prayer. The doctors called it a miracle. God is so faithful!", time: "2 days ago" },
    { text: "I prayed for a job for 6 months. Last week I received an offer beyond what I imagined. God's timing is perfect.", time: "1 week ago" },
    { text: "My marriage was falling apart. We prayed together for the first time in years and God restored everything. To God be the glory!", time: "2 weeks ago" },
  ]);

  const [streak, setStreak] = useState(0);
  const [streakLogged, setStreakLogged] = useState(false);
  const [streakLoading, setStreakLoading] = useState(true);
  const [streakCelebration, setStreakCelebration] = useState(false);
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [showNotifBanner, setShowNotifBanner] = useState(true);
  const [isPremium, setIsPremium] = useState(false);

  const [fastingTab, setFastingTab] = useState("foundation");
  const [fastingLog, setFastingLog] = useState([]);
  const [fastingLoading, setFastingLoading] = useState(true);
  const [totalFasts, setTotalFasts] = useState(0);
  const [fastCelebration, setFastCelebration] = useState(null);
  const [showLogFast, setShowLogFast] = useState(false);
  const [selectedFastLevel, setSelectedFastLevel] = useState(null);
  const [fastNote, setFastNote] = useState("");
  const [advancedGoal, setAdvancedGoal] = useState(null);
  const [advancedGoalLoading, setAdvancedGoalLoading] = useState(true);
  const [customFastDays, setCustomFastDays] = useState("3");

  const [visionGoals, setVisionGoals] = useState([]);
  const [visionLoading, setVisionLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalIcon, setNewGoalIcon] = useState("🎯");
  const [celebration, setCelebration] = useState(null);

  const [bibleTestament, setBibleTestament] = useState("NT");
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterText, setChapterText] = useState(null);
  const [bibleLoading, setBibleLoading] = useState(false);
  const [bibleVersion, setBibleVersion] = useState("kjv");
  const [readChapters, setReadChapters] = useState({});
  const [readChaptersLoading, setReadChaptersLoading] = useState(true);
  const [totalRead, setTotalRead] = useState(0);
  const [highlightVerse, setHighlightVerse] = useState(null);

  const [memoryVerses, setMemoryVerses] = useState([]);
  const [memoryLoading, setMemoryLoading] = useState(true);
  const [memoryTab, setMemoryTab] = useState("list");
  const [newVerseRef, setNewVerseRef] = useState("");
  const [newVerseText, setNewVerseText] = useState("");
  const [fetchingVerse, setFetchingVerse] = useState(false);
  const [testingVerse, setTestingVerse] = useState(null);
  const [testAnswers, setTestAnswers] = useState({});
  const [testResult, setTestResult] = useState(null);
  const [totalMemorized, setTotalMemorized] = useState(0);
  const [showPopQuiz, setShowPopQuiz] = useState(false);
  const [quizVerse, setQuizVerse] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [newSticker, setNewSticker] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => { setUser(firebaseUser); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setIsPremium(false); return; }
    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (snap) => {
      if (snap.exists()) { setIsPremium(snap.data().isPremium === true); }
      else { setIsPremium(false); }
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    requestNotificationPermission().then(token => {
      if (token) { setNotifEnabled(true); setShowNotifBanner(false); }
    });
  }, [user]);

  useEffect(() => {
    if (!user) { setStreak(0); setStreakLogged(false); setStreakLoading(false); return; }
    setStreakLoading(true);
    const loadStreak = async () => {
      try {
        const streakDoc = await getDoc(doc(db, "streaks", user.uid));
        if (streakDoc.exists()) {
          const data = streakDoc.data();
          const today = getTodayString();
          const yesterday = getYesterdayString();
          const lastLogged = data.lastLogged || "";
          if (lastLogged === today) { setStreak(data.count || 0); setStreakLogged(true); }
          else if (lastLogged === yesterday) { setStreak(data.count || 0); setStreakLogged(false); }
          else if (lastLogged === "") { setStreak(0); setStreakLogged(false); }
          else { setStreak(0); setStreakLogged(false); await setDoc(doc(db, "streaks", user.uid), { count: 0, lastLogged: "", longestStreak: data.longestStreak || 0 }, { merge: true }); }
        } else { setStreak(0); setStreakLogged(false); }
      } catch (err) { console.error(err); }
      setStreakLoading(false);
    };
    loadStreak();
  }, [user]);

  const logPrayer = async () => {
    if (streakLogged) return;
    if (!user) { setShowAuth(true); return; }
    const today = getTodayString();
    try {
      const streakDoc = await getDoc(doc(db, "streaks", user.uid));
      const data = streakDoc.exists() ? streakDoc.data() : { count: 0, lastLogged: "", longestStreak: 0 };
      const yesterday = getYesterdayString();
      let newCount;
      if (data.lastLogged === yesterday || data.lastLogged === "") { newCount = (data.count || 0) + 1; }
      else if (data.lastLogged === today) { return; }
      else { newCount = 1; }
      const newLongest = Math.max(newCount, data.longestStreak || 0);
      await setDoc(doc(db, "streaks", user.uid), { count: newCount, lastLogged: today, longestStreak: newLongest });
      setStreak(newCount); setStreakLogged(true);
      if ([7, 14, 21, 30, 50, 100].includes(newCount)) { setStreakCelebration(true); setTimeout(() => setStreakCelebration(false), 4000); }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!user) { setFastingLog([]); setTotalFasts(0); setFastingLoading(false); return; }
    setFastingLoading(true);
    const q = query(collection(db, "fasting", user.uid, "logs"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setFastingLog(logs); setTotalFasts(logs.length); setFastingLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) { setAdvancedGoal(null); setAdvancedGoalLoading(false); return; }
    setAdvancedGoalLoading(true);
    const unsubscribe = onSnapshot(doc(db, "fasting", user.uid), (snap) => {
      if (snap.exists()) { setAdvancedGoal(snap.data().advancedGoal || null); }
      else { setAdvancedGoal(null); }
      setAdvancedGoalLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const logFast = async () => {
    if (!selectedFastLevel) return;
    if (!user) { setShowAuth(true); return; }
    try {
      await addDoc(collection(db, "fasting", user.uid, "logs"), { level: selectedFastLevel.id, label: selectedFastLevel.label, note: fastNote.trim(), createdAt: new Date(), date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
      const newTotal = totalFasts + 1;
      const milestone = getFastingMilestone(newTotal);
      if (milestone && (!getFastingMilestone(totalFasts) || getFastingMilestone(totalFasts).count !== milestone.count)) { setFastCelebration(milestone); setTimeout(() => setFastCelebration(null), 5000); }
      setSelectedFastLevel(null); setFastNote(""); setShowLogFast(false);
    } catch (err) { console.error(err); }
  };

  const setAdvancedFastingGoal = async (level) => {
    if (!user) { setShowAuth(true); return; }
    try { await setDoc(doc(db, "fasting", user.uid), { advancedGoal: { id: level.id, label: level.label, icon: level.icon, targetDays: level.id === "extended" ? parseInt(customFastDays) || 3 : level.count, completedFasts: 0 } }, { merge: true }); } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const q = query(collection(db, "prayerWall"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => { setPrayerList(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); setPrayerLoading(false); });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) { setJournalEntries([]); return; }
    setJournalLoading(true);
    const q = query(collection(db, "journals", user.uid, "entries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => { setJournalEntries(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))); setJournalLoading(false); });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) { setVisionGoals([{ id: "1", title: "Read the entire Bible", progress: 0, icon: "📖" }, { id: "2", title: "Pray daily for 30 days", progress: 0, icon: "🙏" }, { id: "3", title: "Memorize 10 scriptures", progress: 0, icon: "✝️" }, { id: "4", title: "Fast once a week", progress: 0, icon: "⚡" }]); setVisionLoading(false); return; }
    setVisionLoading(true);
    const q = query(collection(db, "visionGoals", user.uid, "goals"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (goals.length === 0) { const defaults = [{ title: "Read the entire Bible", progress: 0, icon: "📖", createdAt: new Date() }, { title: "Pray daily for 30 days", progress: 0, icon: "🙏", createdAt: new Date() }, { title: "Memorize 10 scriptures", progress: 0, icon: "✝️", createdAt: new Date() }, { title: "Fast once a week", progress: 0, icon: "⚡", createdAt: new Date() }]; defaults.forEach(g => addDoc(collection(db, "visionGoals", user.uid, "goals"), g)); }
      else { setVisionGoals(goals); }
      setVisionLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) { setReadChapters({}); setTotalRead(0); setReadChaptersLoading(false); return; }
    setReadChaptersLoading(true);
    const unsubscribe = onSnapshot(doc(db, "bibleProgress", user.uid), (snap) => {
      if (snap.exists()) { const chapters = snap.data().chapters || {}; setReadChapters(chapters); setTotalRead(Object.keys(chapters).length); }
      else { setReadChapters({}); setTotalRead(0); }
      setReadChaptersLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) { setMemoryVerses([]); setTotalMemorized(0); setMemoryLoading(false); return; }
    setMemoryLoading(true);
    const q = query(collection(db, "memoryVerses", user.uid, "verses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const verses = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setMemoryVerses(verses); setTotalMemorized(verses.filter(v => v.memorized).length); setMemoryLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user || visionGoals.length === 0) return;
    const bibleGoal = visionGoals.find(g => g.title === "Read the entire Bible");
    if (!bibleGoal) return;
    const newProgress = Math.min(100, Math.round((totalRead / TOTAL_CHAPTERS) * 100));
    if (newProgress !== bibleGoal.progress) updateDoc(doc(db, "visionGoals", user.uid, "goals", bibleGoal.id), { progress: newProgress }).catch(() => {});
  }, [totalRead, user, visionGoals]);

  useEffect(() => {
    if (!user || visionGoals.length === 0) return;
    const memGoal = visionGoals.find(g => g.title === "Memorize 10 scriptures");
    if (!memGoal) return;
    const newProgress = Math.min(100, Math.round((totalMemorized / MEMORY_GOAL) * 100));
    if (newProgress !== memGoal.progress) updateDoc(doc(db, "visionGoals", user.uid, "goals", memGoal.id), { progress: newProgress }).catch(() => {});
  }, [totalMemorized, user, visionGoals]);

  const todayVerse = dailyVerses[new Date().getDay() % dailyVerses.length];
  const bibleProgress = Math.min(100, Math.round((totalRead / TOTAL_CHAPTERS) * 100));

  // ✅ NEW — Navigate to Bible tab and open a specific verse
  const navigateToVerse = (scriptureString) => {
    const parsed = parseVerseRef(scriptureString);
    if (!parsed) return;
    const { bookName, chapter, verse } = parsed;
    const book = bibleBooks.find(b => b.name.toLowerCase() === bookName.toLowerCase() || b.name.toLowerCase().startsWith(bookName.toLowerCase()));
    if (!book) return;
    setSelectedTopic(null);
    setTopicContent(null);
    setSelectedCategory(null);
    setHighlightVerse(verse);
    setSelectedBook(book);
    setSelectedChapter(null);
    setChapterText(null);
    setActiveTab("bible");
    setTimeout(() => { loadChapter(book, chapter, verse); }, 100);
  };

  const getVerse = async () => {
    if (!feeling.trim()) return;
    setLoadingVerse(true); setVerseResult(null);
    try {
      const emotion = getEmotionCategory(feeling);
      const fetchedVerses = [];
      for (const ref of emotion.verses) { const v = await fetchVerse(ref); if (v) fetchedVerses.push(`${v.reference} — ${v.text}`); }
      setVerseResult({ verses: fetchedVerses.length > 0 ? fetchedVerses : emotion.verses, reflection: emotion.reflection, prayer: emotion.prayer });
    } catch { setVerseResult({ verses: ["Psalm 46:1 — God is our refuge and strength, an ever-present help in trouble."], reflection: "Whatever you are facing today God is your refuge and strength.", prayer: "Father in the name of Jesus Christ be my refuge and strength today. In the name of Jesus Christ. Amen." }); }
    setLoadingVerse(false);
  };

  const openTopic = (topic) => { setSelectedTopic(topic); setTopicContent(getSermonContent(topic)); };
  const filteredCategories = sermonSearch.trim() ? sermonCategories.map(cat => ({ ...cat, topics: cat.topics.filter(t => t.toLowerCase().includes(sermonSearch.toLowerCase())) })).filter(cat => cat.topics.length > 0) : sermonCategories;
  const submitPrayer = async () => {
    if (!newPrayer.trim()) return;
    try { await addDoc(collection(db, "prayerWall"), { name: user ? user.email.split("@")[0] : "Guest", request: newPrayer.trim(), time: "Just now", prayed: 0, createdAt: new Date() }); setNewPrayer(""); } catch (err) { console.error(err); }
  };
  const prayFor = async (id) => {
    if (prayedIds.includes(id)) return;
    setPrayedIds(p => [...p, id]);
    try { await updateDoc(doc(db, "prayerWall", id), { prayed: increment(1) }); } catch (err) { console.error(err); }
  };
  const submitJournal = async () => {
    if (!journalEntry.trim()) return;
    if (!user) { setShowAuth(true); return; }
    const date = new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    try { await addDoc(collection(db, "journals", user.uid, "entries"), { title: journalTitle || "My Prayer", text: journalEntry.trim(), date, createdAt: new Date() }); setJournalTitle(""); setJournalEntry(""); } catch (err) { console.error(err); }
  };
  const submitTestimony = () => {
    if (!testimony.trim()) return;
    setTestimonies(prev => [{ text: testimony, time: "Just now" }, ...prev]);
    setTestimony("");
  };
  const addGoal = async () => {
    if (!newGoalTitle.trim()) return;
    if (!user) { setShowAuth(true); return; }
    try { await addDoc(collection(db, "visionGoals", user.uid, "goals"), { title: newGoalTitle.trim(), icon: newGoalIcon, progress: 0, createdAt: new Date() }); setNewGoalTitle(""); setNewGoalIcon("🎯"); setShowAddGoal(false); } catch (err) { console.error(err); }
  };
  const updateProgress = async (goalId, newProgress) => {
    const clamped = Math.min(100, Math.max(0, newProgress));
    const prev = visionGoals.find(g => g.id === goalId);
    if (prev && prev.progress < 100 && clamped === 100) { setCelebration(goalId); setTimeout(() => setCelebration(null), 4000); }
    if (user) { try { await updateDoc(doc(db, "visionGoals", user.uid, "goals", goalId), { progress: clamped }); } catch (err) { console.error(err); } }
    else { setVisionGoals(goals => goals.map(g => g.id === goalId ? { ...g, progress: clamped } : g)); }
  };
  const deleteGoal = async (goalId) => {
    if (user) { try { await deleteDoc(doc(db, "visionGoals", user.uid, "goals", goalId)); } catch (err) { console.error(err); } }
    else { setVisionGoals(goals => goals.filter(g => g.id !== goalId)); }
  };
  const loadChapter = async (book, chapter, verseToHighlight = null) => {
    setSelectedChapter(chapter); setBibleLoading(true); setChapterText(null);
    if (verseToHighlight) setHighlightVerse(verseToHighlight);
    try {
      const ref = `${book.abbrev}+${chapter}`;
      const response = await fetch(`https://bible-api.com/${encodeURIComponent(ref)}?translation=${bibleVersion}`);
      const data = await response.json();
      if (data.verses) setChapterText({ verses: data.verses, reference: data.reference });
      else setChapterText({ error: "Could not load this chapter. Please try again." });
    } catch { setChapterText({ error: "Network error. Please check your connection." }); }
    setBibleLoading(false);
  };
  const markChapterRead = async () => {
    if (!user) { setShowAuth(true); return; }
    const key = `${selectedBook.abbrev}_${selectedChapter}`;
    if (readChapters[key]) return;
    try { const newChapters = { ...readChapters, [key]: true }; await setDoc(doc(db, "bibleProgress", user.uid), { chapters: newChapters }, { merge: true }); } catch (err) { console.error(err); }
  };
  const isChapterRead = (book, chapter) => !!readChapters[`${book.abbrev}_${chapter}`];
  const getBookProgress = (book) => { let read = 0; for (let c = 1; c <= book.chapters; c++) { if (readChapters[`${book.abbrev}_${c}`]) read++; } return read; };
  const fetchAndAddVerse = async () => {
    if (!newVerseRef.trim()) return;
    if (!user) { setShowAuth(true); return; }
    setFetchingVerse(true);
    try {
      const verseData = await fetchVerse(newVerseRef.trim());
      if (verseData) { await addDoc(collection(db, "memoryVerses", user.uid, "verses"), { reference: verseData.reference, text: verseData.text, memorized: false, timesAttempted: 0, createdAt: new Date() }); setNewVerseRef(""); setMemoryTab("list"); }
      else { alert("Could not find that verse. Try a format like 'John 3:16'"); }
    } catch (err) { console.error(err); }
    setFetchingVerse(false);
  };
  const addManualVerse = async () => {
    if (!newVerseRef.trim() || !newVerseText.trim()) return;
    if (!user) { setShowAuth(true); return; }
    try { await addDoc(collection(db, "memoryVerses", user.uid, "verses"), { reference: newVerseRef.trim(), text: newVerseText.trim(), memorized: false, timesAttempted: 0, createdAt: new Date() }); setNewVerseRef(""); setNewVerseText(""); setMemoryTab("list"); } catch (err) { console.error(err); }
  };
  const deleteMemoryVerse = async (verseId) => { try { await deleteDoc(doc(db, "memoryVerses", user.uid, "verses", verseId)); } catch (err) { console.error(err); } };
  const startTest = (verse) => { setTestingVerse(verse); setTestAnswers({}); setTestResult(null); setMemoryTab("test"); };
  const submitTest = async () => {
    if (!testingVerse) return;
    const { words, blankIndices } = createFillInBlank(testingVerse.text);
    const result = checkAnswers(words, blankIndices, testAnswers);
    setTestResult(result);
    try {
      const prevMemorized = testingVerse.memorized;
      const nowMemorized = result.passed;
      await updateDoc(doc(db, "memoryVerses", user.uid, "verses", testingVerse.id), { memorized: nowMemorized, timesAttempted: (testingVerse.timesAttempted || 0) + 1, lastScore: result.score });
      if (!prevMemorized && nowMemorized) {
        const newTotal = totalMemorized + 1;
        setNewSticker(getMemoryMilestone(newTotal));
        setTimeout(() => setNewSticker(null), 5000);
        if (newTotal % 5 === 0) {
          const passedVerses = memoryVerses.filter(v => v.memorized && v.id !== testingVerse.id);
          if (passedVerses.length > 0) { const randomVerse = passedVerses[Math.floor(Math.random() * passedVerses.length)]; setTimeout(() => { setQuizVerse(randomVerse); setQuizAnswers({}); setQuizResult(null); setShowPopQuiz(true); }, 3000); }
        }
      }
    } catch (err) { console.error(err); }
  };
  const submitQuiz = () => {
    if (!quizVerse) return;
    const { words, blankIndices } = createFillInBlank(quizVerse.text);
    const result = checkAnswers(words, blankIndices, quizAnswers);
    setQuizResult(result);
  };
  const handleSignOut = async () => { await signOut(auth); };

  const s = {
    app: { background: CREAM, minHeight: "100vh", fontFamily: "Georgia, serif", paddingBottom: 80 },
    header: { background: `linear-gradient(135deg, ${BROWN_DARK} 0%, ${BROWN} 100%)`, padding: "20px 20px 16px" },
    headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start" },
    headerCenter: { textAlign: "center", flex: 1 },
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
    btnSmall: { background: CREAM_DARK, border: `1px solid ${GOLD_LIGHT}`, borderRadius: 20, padding: "6px 14px", fontSize: 12, color: BROWN, cursor: "pointer", fontFamily: "sans-serif", margin: "4px" },
    streakBox: { background: `linear-gradient(135deg, ${GOLD}, ${BROWN})`, borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, marginBottom: 14 },
    progressBg: { height: 10, borderRadius: 6, background: GOLD_LIGHT, marginTop: 8, marginBottom: 4 },
    tag: { display: "inline-block", background: GOLD_LIGHT, color: BROWN, borderRadius: 20, padding: "3px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold", marginRight: 6 },
    stepCard: { display: "flex", gap: 14, marginBottom: 14, alignItems: "flex-start" },
    stepNum: { background: GOLD, color: WHITE, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold", fontSize: 15, flexShrink: 0, fontFamily: "sans-serif" },
    backBtn: { background: "none", border: "none", color: GOLD, fontSize: 14, cursor: "pointer", fontFamily: "sans-serif", marginBottom: 12, padding: 0, display: "flex", alignItems: "center", gap: 4 },
    signOutBtn: { background: "none", border: `1px solid ${GOLD_LIGHT}`, borderRadius: 8, padding: "4px 10px", color: GOLD_LIGHT, fontSize: 11, cursor: "pointer", fontFamily: "sans-serif" },
    signInBtn: { background: GOLD, border: "none", borderRadius: 8, padding: "4px 10px", color: WHITE, fontSize: 11, cursor: "pointer", fontFamily: "sans-serif", fontWeight: "bold" },
  };

  if (user === undefined) {
    return (<div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}><div style={{ fontSize: 36, marginBottom: 12 }}>✝️</div><p style={{ color: BROWN, fontStyle: "italic" }}>Loading Grace Daily...</p></div>);
  }

  if (showAuth) return <AuthScreen onAuthSuccess={() => setShowAuth(false)} />;

  if (showPopQuiz && quizVerse) {
    const { words, blankIndices } = createFillInBlank(quizVerse.text);
    return (
      <div style={{ ...s.app, background: BROWN_DARK }}>
        <div style={s.content}>
          <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
            <div style={{ fontSize: 36 }}>🎯</div>
            <h2 style={{ color: GOLD_MID, fontSize: 22, margin: "8px 0 4px" }}>Pop Quiz Time!</h2>
            <p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0 }}>Every 5 verses earned — God keeps you sharp! 🔥</p>
          </div>
          <div style={s.cardGold}>
            <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>Fill in the Blanks</p>
            <p style={{ color: GOLD_MID, fontSize: 13, fontWeight: "bold", margin: "0 0 12px", fontFamily: "sans-serif" }}>{quizVerse.reference}</p>
            {!quizResult ? (
              <div>
                <div style={{ lineHeight: 2.2, fontSize: 15, color: WHITE }}>
                  {words.map((word, i) => { const blankIdx = blankIndices.indexOf(i); if (blankIdx !== -1) { return (<span key={i}><input type="text" value={quizAnswers[blankIdx] || ""} onChange={e => setQuizAnswers(prev => ({ ...prev, [blankIdx]: e.target.value }))} style={{ width: 80, padding: "2px 6px", borderRadius: 6, border: `2px solid ${GOLD_MID}`, background: "rgba(255,255,255,0.15)", color: WHITE, fontSize: 14, fontFamily: "Georgia, serif", outline: "none", textAlign: "center" }} />{" "}</span>); } return <span key={i}>{word} </span>; })}
                </div>
                <button style={{ ...s.btn, marginTop: 16 }} onClick={submitQuiz}>Submit Quiz →</button>
              </div>
            ) : (
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{quizResult.passed ? "🎉" : "💪"}</div>
                <p style={{ color: WHITE, fontSize: 18, fontWeight: "bold", margin: "0 0 6px", fontFamily: "sans-serif" }}>{quizResult.score}%</p>
                <p style={{ color: GOLD_LIGHT, fontSize: 14, margin: "0 0 16px" }}>{quizResult.passed ? "Amazing! The Word is in your heart!" : `${quizResult.correct} of ${quizResult.total} correct — keep practicing!`}</p>
                <p style={{ color: GOLD_LIGHT, fontSize: 13, fontStyle: "italic", margin: "0 0 16px", lineHeight: 1.7 }}>{quizVerse.text}</p>
                <button style={s.btn} onClick={() => { setShowPopQuiz(false); setQuizVerse(null); setQuizResult(null); }}>Back to Memory ✝️</button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={s.app}>

      {user && showNotifBanner && !notifEnabled && (
        <div style={{ background: `linear-gradient(135deg, ${BROWN_DARK}, ${BROWN})`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div>
            <p style={{ color: GOLD_MID, fontSize: 13, fontWeight: "bold", margin: "0 0 2px", fontFamily: "sans-serif" }}>🔔 Enable Daily Reminders</p>
            <p style={{ color: GOLD_LIGHT, fontSize: 11, margin: 0, fontFamily: "sans-serif" }}>Get daily prayer, streak and verse reminders!</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={{ background: GOLD, border: "none", borderRadius: 8, padding: "6px 12px", color: WHITE, fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: "bold" }} onClick={() => { requestNotificationPermission().then(token => { if (token) { setNotifEnabled(true); setShowNotifBanner(false); } }); }}>Enable 🔔</button>
            <button style={{ background: "none", border: `1px solid ${GOLD_LIGHT}`, borderRadius: 8, padding: "6px 10px", color: GOLD_LIGHT, fontSize: 11, cursor: "pointer", fontFamily: "sans-serif" }} onClick={() => setShowNotifBanner(false)}>Later</button>
          </div>
        </div>
      )}

      {newSticker && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ background: WHITE, borderRadius: 20, padding: 32, textAlign: "center", margin: 24 }}><div style={{ fontSize: 48, marginBottom: 12 }}>🌟</div><p style={{ color: GOLD, fontSize: 20, fontWeight: "bold", margin: "0 0 8px", fontFamily: "sans-serif" }}>New Badge Earned!</p><p style={{ color: newSticker.color, fontSize: 22, fontWeight: "bold", margin: "0 0 12px", fontFamily: "sans-serif" }}>{newSticker.label}</p><p style={{ color: BROWN, fontSize: 14, margin: "0 0 16px", lineHeight: 1.5 }}>Your word is a lamp to my feet and a light to my path. — Psalm 119:105 🙏</p><button style={s.btn} onClick={() => setNewSticker(null)}>Praise God! 🙌</button></div></div>)}
      {streakCelebration && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ background: WHITE, borderRadius: 20, padding: 32, textAlign: "center", margin: 24 }}><div style={{ fontSize: 48, marginBottom: 12 }}>🔥</div><p style={{ color: GOLD, fontSize: 20, fontWeight: "bold", margin: "0 0 8px", fontFamily: "sans-serif" }}>🎉 {streak} Day Streak!</p><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 8px" }}>You are on fire for God! 🔥</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 16px", lineHeight: 1.5 }}>Those who wait on the Lord shall renew their strength. — Isaiah 40:31</p><button style={s.btn} onClick={() => setStreakCelebration(false)}>Keep Going! ✝️</button></div></div>)}
      {fastCelebration && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ background: WHITE, borderRadius: 20, padding: 32, textAlign: "center", margin: 24 }}><div style={{ fontSize: 48, marginBottom: 12 }}>⚡</div><p style={{ color: GOLD, fontSize: 20, fontWeight: "bold", margin: "0 0 8px", fontFamily: "sans-serif" }}>Fasting Badge Earned!</p><p style={{ color: fastCelebration.color, fontSize: 22, fontWeight: "bold", margin: "0 0 12px", fontFamily: "sans-serif" }}>{fastCelebration.label}</p><p style={{ color: BROWN, fontSize: 14, margin: "0 0 6px", lineHeight: 1.5 }}>Is not this the kind of fasting I have chosen:</p><p style={{ color: BROWN, fontSize: 13, fontStyle: "italic", margin: "0 0 16px" }}>to loose the chains of injustice — Isaiah 58:6 🙏</p><button style={s.btn} onClick={() => setFastCelebration(null)}>To God Be the Glory! 🙌</button></div></div>)}

      <div style={s.header}>
        <div style={s.headerTop}>
          <div style={{ width: 60 }} />
          <div style={s.headerCenter}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>✝️</div>
            <h1 style={s.headerTitle}>Grace Daily</h1>
            <p style={s.headerSub}>His Grace is Sufficient — 2 Corinthians 12:9</p>
          </div>
          <div style={{ width: 60, display: "flex", justifyContent: "flex-end", alignItems: "flex-start", paddingTop: 4 }}>
            {user ? <button style={s.signOutBtn} onClick={handleSignOut}>Sign Out</button> : <button style={s.signInBtn} onClick={() => setShowAuth(true)}>Sign In</button>}
          </div>
        </div>
        {user && <p style={{ color: GOLD_LIGHT, fontSize: 11, textAlign: "center", margin: "8px 0 0", fontFamily: "sans-serif", opacity: 0.8 }}>Welcome back, {user.email.split("@")[0]} 🙏</p>}
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
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 36, fontWeight: "bold", color: WHITE }}>{streakLoading ? "..." : streak}</div>
                <div style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif" }}>day streak 🔥</div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: WHITE, fontSize: 13, margin: "0 0 4px", fontFamily: "sans-serif", fontWeight: "bold" }}>{streakLogged ? "✅ Prayer logged today!" : "Log your prayer to keep your streak!"}</p>
                <p style={{ color: GOLD_LIGHT, fontSize: 11, margin: "0 0 8px", fontFamily: "sans-serif" }}>{!user ? "Sign in to save your streak forever" : streakLogged ? "Come back tomorrow to keep going! 🙏" : "Don't break your streak — pray today!"}</p>
                <button style={{ ...s.btnOutline, color: streakLogged ? GOLD_LIGHT : WHITE, borderColor: streakLogged ? GOLD_LIGHT : WHITE, fontSize: 12, padding: "6px 14px", opacity: streakLogged ? 0.7 : 1 }} onClick={logPrayer} disabled={streakLogged}>{streakLogged ? "✓ Prayed Today" : "🔥 Log Today's Prayer"}</button>
              </div>
            </div>
            {!isPremium && (
              <div style={{ background: `linear-gradient(135deg, ${BROWN_DARK}, ${BROWN})`, borderRadius: 16, padding: 18, marginBottom: 14, border: `2px solid ${GOLD}` }}>
                <p style={{ color: GOLD_MID, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>Unlock Everything 👑</p>
                <h3 style={{ color: WHITE, fontSize: 18, fontWeight: "bold", margin: "0 0 8px" }}>Grace Daily Premium</h3>
                <p style={{ color: GOLD_LIGHT, fontSize: 13, margin: "0 0 10px", lineHeight: 1.6 }}>Scripture Memory • Prayer Journal • Bible Progress • Vision Board • Fasting Tracker • Pop Quiz</p>
                <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 10, padding: "8px 12px", marginBottom: 12 }}>
                  <p style={{ color: GOLD_MID, fontSize: 15, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>7 Days FREE — then $4.99/month</p>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, margin: "2px 0 0", fontFamily: "sans-serif" }}>Cancel anytime. No commitment.</p>
                </div>
                {[["📖","Bible Reading Progress"],["✍️","Scripture Memory + Badges"],["📓","Prayer Journal"],["📋","Faith Vision Board"],["⚡","Fasting Tracker"],["🎯","Pop Quiz System"]].map(([icon, feature]) => (
                  <p key={feature} style={{ color: GOLD_LIGHT, fontSize: 12, margin: "0 0 4px", fontFamily: "sans-serif" }}>✅ {icon} {feature}</p>
                ))}
                <button style={{ background: `linear-gradient(135deg, ${GOLD}, #C9972A)`, color: WHITE, border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 15, fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif", width: "100%", marginTop: 12 }} onClick={() => window.open(STRIPE_LINK, "_blank")}>Start 7-Day Free Trial 👑</button>
                <p style={{ color: GOLD_LIGHT, fontSize: 10, textAlign: "center", margin: "8px 0 0", fontFamily: "sans-serif", opacity: 0.7 }}>Powered by Stripe — Secure Payment 🔒</p>
              </div>
            )}
            {isPremium && (
              <div style={{ background: `linear-gradient(135deg, ${GOLD}, ${BROWN})`, borderRadius: 16, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ fontSize: 28 }}>👑</div>
                <div>
                  <p style={{ color: WHITE, fontSize: 14, fontWeight: "bold", margin: "0 0 2px", fontFamily: "sans-serif" }}>Grace Daily Premium</p>
                  <p style={{ color: GOLD_LIGHT, fontSize: 12, margin: 0, fontFamily: "sans-serif" }}>All features unlocked. To God be the glory! 🙌</p>
                </div>
              </div>
            )}
            {!user && (<div style={{ ...s.card, border: `2px solid ${GOLD_MID}`, background: GOLD_LIGHT }}><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 6px" }}>✝️ Save Your Progress</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>Create a free account to save your streak, Bible reading, memory verses, and more — forever!</p><button style={s.btn} onClick={() => setShowAuth(true)}>Create Free Account →</button></div>)}
            <div style={s.card}>
              <p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 8 }}>Quick Actions</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["📖","Read\nthe Bible","bible"],["✍️","Memorize\nScripture","memory"],["🙏","Pray with\nothers","prayer"],["📋","My faith\ngoals","vision"]].map(([icon, label, tab]) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ background: CREAM_DARK, border: `1px solid ${GOLD_LIGHT}`, borderRadius: 12, padding: "12px 8px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 20 }}>{icon}</div>
                    <div style={{ fontSize: 11, color: BROWN, fontFamily: "sans-serif", marginTop: 4, whiteSpace: "pre-line", lineHeight: 1.3 }}>{label}</div>
                  </button>
                ))}
              </div>
            </div>
            {user && isPremium && (<div style={s.card}><p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 8 }}>📖 Bible Reading Progress</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><p style={{ color: BROWN, fontSize: 13, margin: 0 }}>{totalRead} of {TOTAL_CHAPTERS} chapters read</p><span style={{ color: GOLD, fontSize: 14, fontWeight: "bold", fontFamily: "sans-serif" }}>{bibleProgress}%</span></div><div style={s.progressBg}><div style={{ height: 10, borderRadius: 6, background: `linear-gradient(90deg, ${GOLD}, ${BROWN})`, width: `${bibleProgress}%`, transition: "width 0.3s ease" }} /></div><button style={{ ...s.btn, marginTop: 10 }} onClick={() => setActiveTab("bible")}>Continue Reading →</button></div>)}
            {user && isPremium && (<div style={s.card}><p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 8 }}>✍️ Scripture Memory</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><p style={{ color: BROWN, fontSize: 13, margin: 0 }}>{totalMemorized} of {MEMORY_GOAL} verses memorized</p><span style={{ color: GOLD, fontSize: 14, fontWeight: "bold", fontFamily: "sans-serif" }}>{Math.round((totalMemorized / MEMORY_GOAL) * 100)}%</span></div><div style={s.progressBg}><div style={{ height: 10, borderRadius: 6, background: `linear-gradient(90deg, ${GOLD}, ${BROWN})`, width: `${Math.min(100, Math.round((totalMemorized / MEMORY_GOAL) * 100))}%`, transition: "width 0.3s ease" }} /></div>{getMemoryMilestone(totalMemorized) && <p style={{ color: GOLD, fontSize: 12, fontFamily: "sans-serif", margin: "6px 0 0", fontWeight: "bold" }}>{getMemoryMilestone(totalMemorized).label}</p>}<button style={{ ...s.btn, marginTop: 10 }} onClick={() => setActiveTab("memory")}>Go to Memory →</button></div>)}
            {user && isPremium && totalFasts > 0 && (<div style={s.card}><p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 8 }}>⚡ Fasting Journey</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}><p style={{ color: BROWN, fontSize: 13, margin: 0 }}>{totalFasts} fast{totalFasts !== 1 ? "s" : ""} completed</p>{getFastingMilestone(totalFasts) && <span style={{ color: GOLD, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif" }}>{getFastingMilestone(totalFasts).label}</span>}</div><button style={{ ...s.btn, marginTop: 6 }} onClick={() => { setActiveTab("prayer"); setPrayerTab("fasting"); }}>Go to Fasting →</button></div>)}
            <div style={s.card}><p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 6 }}>✝️ New to Jesus?</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>Find out who Jesus is and how He can transform your life.</p><button style={s.btn} onClick={() => setActiveTab("salvation")}>Learn About Jesus →</button></div>
          </div>
        )}

        {activeTab === "bible" && (
          <div>
            {selectedBook && selectedChapter && (<div><button style={s.backBtn} onClick={() => { setSelectedChapter(null); setChapterText(null); setHighlightVerse(null); }}>← Back to {selectedBook.name}</button><div style={s.cardGold}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}><div><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>{selectedBook.name}</p><h2 style={{ color: WHITE, fontSize: 20, margin: 0 }}>Chapter {selectedChapter}</h2></div><div style={{ display: "flex", gap: 6 }}>{bibleVersions.map(v => (<button key={v.id} onClick={() => { setBibleVersion(v.id); loadChapter(selectedBook, selectedChapter); }} style={{ background: bibleVersion === v.id ? GOLD : "rgba(255,255,255,0.2)", border: "none", borderRadius: 8, padding: "4px 10px", color: WHITE, fontSize: 11, cursor: "pointer", fontFamily: "sans-serif", fontWeight: bibleVersion === v.id ? "bold" : "normal" }}>{v.name}</button>))}</div></div></div>{bibleLoading && <div style={{ ...s.card, textAlign: "center", padding: 32 }}><div style={{ fontSize: 28, marginBottom: 8 }}>📖</div><p style={{ color: BROWN, fontStyle: "italic" }}>Loading chapter...</p></div>}{chapterText && chapterText.error && <div style={s.card}><p style={{ color: BROWN, textAlign: "center" }}>{chapterText.error}</p></div>}{chapterText && chapterText.verses && (<div><div style={s.card}>{highlightVerse && (<div style={{ background: GOLD_LIGHT, borderRadius: 10, padding: "8px 12px", marginBottom: 12, border: `2px solid ${GOLD}` }}><p style={{ color: BROWN, fontSize: 11, fontFamily: "sans-serif", margin: 0 }}>📌 Tapped from Sermon — verse {highlightVerse} highlighted below</p></div>)}{chapterText.verses.map((v, i) => { const isHighlighted = highlightVerse && v.verse === highlightVerse; return (<div key={i} id={`verse-${v.verse}`} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start", background: isHighlighted ? GOLD_LIGHT : "transparent", borderRadius: isHighlighted ? 10 : 0, padding: isHighlighted ? "8px" : 0, border: isHighlighted ? `2px solid ${GOLD}` : "none" }}><span style={{ color: isHighlighted ? BROWN_DARK : GOLD, fontSize: 11, fontWeight: "bold", fontFamily: "sans-serif", minWidth: 20, marginTop: 2 }}>{v.verse}</span><p style={{ color: BROWN_DARK, fontSize: 15, lineHeight: 1.8, margin: 0, flex: 1, fontWeight: isHighlighted ? "bold" : "normal" }}>{v.text}</p></div>); })}</div>{isChapterRead(selectedBook, selectedChapter) ? (<div style={{ ...s.card, background: GOLD_LIGHT, textAlign: "center" }}><p style={{ color: GOLD, fontSize: 15, fontWeight: "bold", margin: "0 0 4px", fontFamily: "sans-serif" }}>✅ Chapter Completed!</p><p style={{ color: BROWN, fontSize: 13, margin: 0 }}>This chapter is marked as read. Keep going! 🔥</p></div>) : (<button style={s.btn} onClick={markChapterRead}>{user ? "✅ Mark as Read" : "Sign in to Track Progress"}</button>)}<div style={{ display: "flex", gap: 8, marginTop: 8 }}>{selectedChapter > 1 && <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => { setHighlightVerse(null); loadChapter(selectedBook, selectedChapter - 1); }}>← Previous</button>}{selectedChapter < selectedBook.chapters && <button style={{ ...s.btn, flex: 1, marginTop: 0 }} onClick={() => { setHighlightVerse(null); loadChapter(selectedBook, selectedChapter + 1); }}>Next Chapter →</button>}</div></div>)}</div>)}
            {selectedBook && !selectedChapter && (<div><button style={s.backBtn} onClick={() => setSelectedBook(null)}>← Back to Books</button><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>{selectedBook.testament === "OT" ? "Old Testament" : "New Testament"}</p><h2 style={{ color: WHITE, fontSize: 20, margin: "0 0 6px" }}>{selectedBook.name}</h2><p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0 }}>{getBookProgress(selectedBook)} of {selectedBook.chapters} chapters read</p></div><div style={s.card}><p style={{ color: BROWN, fontSize: 13, marginBottom: 12, fontFamily: "sans-serif", fontWeight: "bold" }}>Select a Chapter:</p><div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>{Array.from({ length: selectedBook.chapters }, (_, i) => i + 1).map(ch => { const read = isChapterRead(selectedBook, ch); return (<button key={ch} onClick={() => loadChapter(selectedBook, ch)} style={{ background: read ? GOLD : CREAM_DARK, border: read ? `2px solid ${GOLD}` : `1px solid ${GOLD_LIGHT}`, borderRadius: 10, padding: "10px 4px", cursor: "pointer", textAlign: "center", color: read ? WHITE : BROWN_DARK, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif" }}>{read ? "✓" : ch}</button>); })}</div></div></div>)}
            {!selectedBook && (<div><p style={s.sectionTitle}>📖 Bible Reader</p>{user && isPremium && (<div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Your Reading Progress</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><p style={{ color: WHITE, fontSize: 14, margin: 0 }}>{totalRead} of {TOTAL_CHAPTERS} chapters</p><span style={{ color: GOLD_MID, fontSize: 18, fontWeight: "bold", fontFamily: "sans-serif" }}>{bibleProgress}%</span></div><div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.2)", marginBottom: 4 }}><div style={{ height: 8, borderRadius: 6, background: GOLD_MID, width: `${bibleProgress}%`, transition: "width 0.3s ease" }} /></div>{totalRead === 0 && <p style={{ color: GOLD_LIGHT, fontSize: 12, margin: "8px 0 0", fontStyle: "italic" }}>Start reading and mark chapters as complete!</p>}</div>)}{!user && (<div style={{ ...s.card, background: GOLD_LIGHT, border: `2px solid ${GOLD_MID}` }}><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 6px" }}>📖 Track Your Reading</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px" }}>Sign in to track your reading progress!</p><button style={s.btn} onClick={() => setShowAuth(true)}>Sign In to Track Progress →</button></div>)}<div style={s.card}><p style={{ color: BROWN, fontSize: 13, fontWeight: "bold", marginBottom: 10, fontFamily: "sans-serif" }}>Bible Version:</p><div style={{ display: "flex", gap: 8 }}>{bibleVersions.map(v => (<button key={v.id} onClick={() => setBibleVersion(v.id)} style={{ flex: 1, padding: "8px 4px", background: bibleVersion === v.id ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : CREAM_DARK, border: bibleVersion === v.id ? "none" : `1px solid ${GOLD_LIGHT}`, borderRadius: 10, color: bibleVersion === v.id ? WHITE : BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: bibleVersion === v.id ? "bold" : "normal", cursor: "pointer" }}><div style={{ fontWeight: "bold" }}>{v.name}</div><div style={{ fontSize: 10, opacity: 0.8 }}>{v.full}</div></button>))}</div></div><div style={{ display: "flex", background: WHITE, borderRadius: 12, padding: 4, marginBottom: 14, border: `1px solid ${GOLD_LIGHT}` }}>{[["OT","Old Testament"],["NT","New Testament"]].map(([id, label]) => (<button key={id} onClick={() => setBibleTestament(id)} style={{ flex: 1, padding: "10px", border: "none", borderRadius: 10, background: bibleTestament === id ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : "none", color: bibleTestament === id ? WHITE : BROWN, fontSize: 13, fontFamily: "sans-serif", fontWeight: bibleTestament === id ? "bold" : "normal", cursor: "pointer" }}>{label}</button>))}</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>{bibleBooks.filter(b => b.testament === bibleTestament).map(book => { const bookRead = getBookProgress(book); const bookComplete = bookRead === book.chapters; return (<button key={book.name} onClick={() => { setSelectedBook(book); setSelectedChapter(null); setChapterText(null); }} style={{ background: bookComplete ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : WHITE, border: bookComplete ? "none" : `1px solid ${GOLD_LIGHT}`, borderRadius: 14, padding: "14px 12px", cursor: "pointer", textAlign: "left" }}><p style={{ color: bookComplete ? WHITE : BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 4px" }}>{bookComplete ? "✅ " : ""}{book.name}</p><p style={{ color: bookComplete ? GOLD_LIGHT : BROWN + "99", fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px" }}>{book.chapters} chapters</p>{bookRead > 0 && !bookComplete && (<div><div style={{ height: 4, borderRadius: 4, background: GOLD_LIGHT }}><div style={{ height: 4, borderRadius: 4, background: GOLD, width: `${Math.round((bookRead / book.chapters) * 100)}%` }} /></div><p style={{ color: GOLD, fontSize: 10, fontFamily: "sans-serif", margin: "4px 0 0", fontWeight: "bold" }}>{bookRead}/{book.chapters} read</p></div>)}</button>); })}</div></div>)}
          </div>
        )}

        {activeTab === "memory" && (
          <div>
            <p style={s.sectionTitle}>✍️ Scripture Memory</p>
            {!user && (<div style={{ ...s.card, background: GOLD_LIGHT, border: `2px solid ${GOLD_MID}` }}><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 6px" }}>🔒 Sign In to Memorize Scripture</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px" }}>Create a free account to save and track your scripture memory journey!</p><button style={s.btn} onClick={() => setShowAuth(true)}>Sign In or Create Account →</button></div>)}
            {user && !isPremium && <PremiumGate onUpgrade={() => window.open(STRIPE_LINK, "_blank")} />}
            {user && isPremium && (<div><div style={s.cardGold}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>Verses Memorized</p><p style={{ color: WHITE, fontSize: 24, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{totalMemorized} <span style={{ fontSize: 14, opacity: 0.7 }}>/ {MEMORY_GOAL}</span></p></div>{getMemoryMilestone(totalMemorized) && (<div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "8px 14px", textAlign: "center" }}><p style={{ color: GOLD_MID, fontSize: 13, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{getMemoryMilestone(totalMemorized).label}</p></div>)}</div><div style={{ height: 8, borderRadius: 6, background: "rgba(255,255,255,0.2)" }}><div style={{ height: 8, borderRadius: 6, background: GOLD_MID, width: `${Math.min(100, Math.round((totalMemorized / MEMORY_GOAL) * 100))}%`, transition: "width 0.3s ease" }} /></div><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "8px 0 0", fontStyle: "italic" }}>Every 5 verses earned triggers a Pop Quiz! 🎯</p></div>
            <div style={{ display: "flex", background: WHITE, borderRadius: 12, padding: 4, marginBottom: 14, border: `1px solid ${GOLD_LIGHT}` }}>{[["list","📋 My Verses"],["add","➕ Add Verse"],["badges","🏆 Badges"]].map(([id, label]) => (<button key={id} onClick={() => { setMemoryTab(id); setTestingVerse(null); setTestResult(null); }} style={{ flex: 1, padding: "8px 4px", border: "none", borderRadius: 10, background: memoryTab === id ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : "none", color: memoryTab === id ? WHITE : BROWN, fontSize: 11, fontFamily: "sans-serif", fontWeight: memoryTab === id ? "bold" : "normal", cursor: "pointer" }}>{label}</button>))}</div>
            {memoryTab === "list" && (<div>{memoryLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading your verses... 🙏</p></div>}{!memoryLoading && memoryVerses.length === 0 && (<div style={{ ...s.card, textAlign: "center", padding: 32 }}><div style={{ fontSize: 36, marginBottom: 12 }}>📖</div><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 8px" }}>Start Hiding God's Word in Your Heart</p><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>Your word I have hidden in my heart, that I might not sin against you. — Psalm 119:11</p><button style={s.btn} onClick={() => setMemoryTab("add")}>Add Your First Verse →</button></div>)}{memoryVerses.map(verse => (<div key={verse.id} style={{ ...s.card, border: verse.memorized ? `2px solid ${GOLD}` : `1px solid ${GOLD_LIGHT}`, background: verse.memorized ? "#FFFDF0" : WHITE }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}><div style={{ flex: 1 }}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", margin: "0 0 4px", fontFamily: "sans-serif" }}>{verse.reference}</p>{verse.memorized && <span style={{ background: GOLD, color: WHITE, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold" }}>✅ Memorized!</span>}{!verse.memorized && verse.timesAttempted > 0 && <span style={{ background: GOLD_LIGHT, color: BROWN, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontFamily: "sans-serif" }}>Last score: {verse.lastScore}%</span>}</div><button onClick={() => deleteMemoryVerse(verse.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#cc0000", padding: "0 0 0 8px" }}>🗑️</button></div><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: "0 0 12px", fontStyle: "italic" }}>"{verse.text}"</p><button style={{ ...s.btn, marginTop: 0 }} onClick={() => startTest(verse)}>{verse.memorized ? "Practice Again ✍️" : "Take the Test →"}</button></div>))}{memoryVerses.length > 0 && (<button style={{ ...s.card, textAlign: "center", border: `2px dashed ${GOLD_MID}`, background: "none", cursor: "pointer", width: "100%", padding: 16 }} onClick={() => setMemoryTab("add")}><p style={{ color: GOLD, fontSize: 15, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>+ Add Another Verse</p></button>)}</div>)}
            {memoryTab === "add" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Add a Scripture</p><p style={{ color: WHITE, fontSize: 14, margin: 0, lineHeight: 1.6 }}>Choose a verse you want to hide in your heart.</p></div><div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 10, fontFamily: "sans-serif" }}>🔍 Search by Reference</p><input style={{ ...s.input, marginBottom: 10 }} placeholder="e.g. John 3:16 or Philippians 4:13" value={newVerseRef} onChange={e => setNewVerseRef(e.target.value)} onKeyDown={e => e.key === "Enter" && fetchAndAddVerse()} /><button style={s.btn} onClick={fetchAndAddVerse} disabled={fetchingVerse}>{fetchingVerse ? "Fetching verse..." : "Add This Verse →"}</button></div><div style={{ textAlign: "center", margin: "8px 0", color: BROWN, fontSize: 13, fontFamily: "sans-serif" }}>— or type it manually —</div><div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 10, fontFamily: "sans-serif" }}>✍️ Enter Manually</p><input style={{ ...s.input, marginBottom: 10 }} placeholder="Reference — e.g. Romans 8:28" value={newVerseRef} onChange={e => setNewVerseRef(e.target.value)} /><textarea style={{ ...s.input, minHeight: 80, resize: "none", marginBottom: 10 }} placeholder="Type the verse text here..." value={newVerseText} onChange={e => setNewVerseText(e.target.value)} /><button style={s.btn} onClick={addManualVerse}>Save Verse →</button></div><div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 8px" }}>💡 Great Verses to Start With</p>{[["John 3:16","The Gospel in one verse"],["Philippians 4:13","Strength through Christ"],["Jeremiah 29:11","God's plans for you"],["Romans 8:28","All things work together"],["Psalm 23:1","The Lord is my shepherd"],["2 Timothy 1:7","No spirit of fear"]].map(([ref, desc]) => (<button key={ref} onClick={() => { setNewVerseRef(ref); setNewVerseText(""); }} style={{ display: "block", width: "100%", background: "none", border: `1px solid ${GOLD_MID}`, borderRadius: 10, padding: "8px 12px", marginBottom: 8, cursor: "pointer", textAlign: "left" }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 2px", fontFamily: "sans-serif" }}>{ref}</p><p style={{ color: BROWN, fontSize: 11, margin: 0, fontFamily: "sans-serif" }}>{desc}</p></button>))}</div></div>)}
            {memoryTab === "test" && testingVerse && (<div><button style={s.backBtn} onClick={() => { setMemoryTab("list"); setTestingVerse(null); setTestResult(null); }}>← Back to My Verses</button><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>Fill in the Blanks</p><p style={{ color: WHITE, fontSize: 18, fontWeight: "bold", margin: "0 0 4px" }}>{testingVerse.reference}</p><p style={{ color: GOLD_LIGHT, fontSize: 12, margin: 0, fontFamily: "sans-serif" }}>Type the missing words. 70% or more = passed! ✅</p></div>{!testResult ? (<div style={s.card}>{(() => { const { words, blankIndices } = createFillInBlank(testingVerse.text); return (<div><div style={{ lineHeight: 2.4, fontSize: 15, color: BROWN_DARK }}>{words.map((word, i) => { const blankIdx = blankIndices.indexOf(i); if (blankIdx !== -1) { return (<span key={i}><input type="text" value={testAnswers[blankIdx] || ""} onChange={e => setTestAnswers(prev => ({ ...prev, [blankIdx]: e.target.value }))} style={{ width: 90, padding: "2px 8px", borderRadius: 8, border: `2px solid ${GOLD_MID}`, background: CREAM, color: BROWN_DARK, fontSize: 14, fontFamily: "Georgia, serif", outline: "none", textAlign: "center" }} />{" "}</span>); } return <span key={i}>{word} </span>; })}</div><button style={{ ...s.btn, marginTop: 16 }} onClick={submitTest}>Submit My Answer →</button></div>); })()}</div>) : (<div><div style={{ ...s.card, background: testResult.passed ? GOLD_LIGHT : "#FFF5F5", border: `2px solid ${testResult.passed ? GOLD : "#FF8888"}`, textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 8 }}>{testResult.passed ? "🎉" : "💪"}</div><p style={{ color: testResult.passed ? GOLD : "#cc0000", fontSize: 22, fontWeight: "bold", margin: "0 0 6px", fontFamily: "sans-serif" }}>{testResult.score}%</p><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 6px" }}>{testResult.passed ? "Passed! You memorized this verse! ✅" : `${testResult.correct} of ${testResult.total} correct — keep practicing!`}</p></div><div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>The Full Verse</p><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", margin: "0 0 4px", fontFamily: "sans-serif" }}>{testingVerse.reference}</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"{testingVerse.text}"</p></div><div style={{ display: "flex", gap: 8 }}><button style={{ ...s.btn, flex: 1, marginTop: 0 }} onClick={() => { setTestAnswers({}); setTestResult(null); }}>Try Again ✍️</button><button style={{ ...s.btnOutline, flex: 1 }} onClick={() => { setMemoryTab("list"); setTestingVerse(null); setTestResult(null); }}>Back to List</button></div></div>)}</div>)}
            {memoryTab === "badges" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Your Badges</p><p style={{ color: WHITE, fontSize: 14, margin: 0 }}>Every verse you memorize brings you closer to the next milestone! 🏆</p></div>{memoryMilestones.map(m => { const earned = totalMemorized >= m.count; return (<div key={m.count} style={{ ...s.card, background: earned ? m.bg : WHITE, border: earned ? `2px solid ${m.color}` : `1px solid ${GOLD_LIGHT}`, opacity: earned ? 1 : 0.6 }}><div style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ fontSize: 32, filter: earned ? "none" : "grayscale(100%)" }}>{m.label.split(" ").slice(-1)[0]}</div><div style={{ flex: 1 }}><p style={{ color: earned ? m.color : BROWN, fontSize: 15, fontWeight: "bold", margin: "0 0 4px", fontFamily: "sans-serif" }}>{m.label}</p><p style={{ color: BROWN, fontSize: 12, margin: 0, fontFamily: "sans-serif" }}>Memorize {m.count} {m.count === 1 ? "verse" : "verses"}</p></div>{earned ? <span style={{ background: m.color, color: WHITE, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold" }}>Earned! ✅</span> : <span style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif" }}>{m.count - totalMemorized} more</span>}</div></div>); })}<div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 6px" }}>🎯 Pop Quiz System</p><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.6, margin: 0 }}>Every time you earn 5 new verses a surprise Pop Quiz fires! Stay sharp — God's Word never returns void! 🔥</p></div></div>)}
            </div>)}
          </div>
        )}

        {activeTab === "verse" && (<div><p style={s.sectionTitle}>✨ Verse of the Moment</p><div style={s.card}><p style={{ color: BROWN, fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>How are you feeling right now? Tell God — and let His Word speak directly to your heart.</p><textarea style={{ ...s.input, minHeight: 80, resize: "none" }} placeholder="I am feeling anxious about tomorrow..." value={feeling} onChange={e => setFeeling(e.target.value)} /><button style={s.btn} onClick={getVerse} disabled={loadingVerse}>{loadingVerse ? "Finding your verse..." : "Find My Verse →"}</button></div>{loadingVerse && (<div style={{ ...s.card, textAlign: "center", padding: 24 }}><div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div><p style={{ color: BROWN, fontSize: 14, fontStyle: "italic" }}>Seeking a word from the Lord for you...</p></div>)}{verseResult && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>Scriptures for You</p>{verseResult.verses.map((v, i) => (<div key={i} style={{ borderBottom: i < verseResult.verses.length - 1 ? `1px solid ${GOLD}44` : "none", paddingBottom: i < verseResult.verses.length - 1 ? 12 : 0, marginBottom: i < verseResult.verses.length - 1 ? 12 : 0 }}><p style={{ color: WHITE, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"{v}"</p></div>))}</div><div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 6, fontFamily: "sans-serif" }}>Reflection</p><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{verseResult.reflection}</p></div><div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Prayer for You</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{verseResult.prayer}</p></div></div>)}</div>)}

        {activeTab === "prayer" && (
          <div>
            <p style={s.sectionTitle}>🙏 Prayer</p>
            <div style={{ display: "flex", background: WHITE, borderRadius: 12, padding: 4, marginBottom: 16, border: `1px solid ${GOLD_LIGHT}`, overflowX: "auto" }}>
              {[["how","🙏 How"],["wall","👥 Wall"],["journal","📓 Journal"],["answered","✅ Answered"],["fasting","⚡ Fasting"]].map(([id, label]) => (
                <button key={id} onClick={() => setPrayerTab(id)} style={{ flex: 1, minWidth: 60, padding: "8px 4px", border: "none", borderRadius: 10, background: prayerTab === id ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : "none", color: prayerTab === id ? WHITE : BROWN, fontSize: 10, fontFamily: "sans-serif", fontWeight: prayerTab === id ? "bold" : "normal", cursor: "pointer", lineHeight: 1.3, whiteSpace: "nowrap" }}>{label}</button>
              ))}
            </div>
            {prayerTab === "how" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>The Lord's Prayer</p><h2 style={{ color: WHITE, fontSize: 18, margin: "0 0 8px" }}>Matthew 6:9-13</h2><p style={{ color: GOLD_LIGHT, fontSize: 13, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one."</p></div>{[{ phrase: "Our Father in heaven", section: "ADORATION", icon: "👑", explanation: "Begin by acknowledging who God is — your Father, your Creator, the One who loves you unconditionally. Start every prayer with worship before requests." },{ phrase: "Your kingdom come, your will be done", section: "SURRENDER", icon: "🙌", explanation: "Surrender your plans to God's plans. God, I trust you more than I trust myself. Have your way in my life today." },{ phrase: "Give us today our daily bread", section: "PETITION", icon: "🙏", explanation: "Bring your needs to God — provision, health, relationships, finances, direction. Be bold and be specific." },{ phrase: "Forgive us our debts as we forgive others", section: "CONFESSION", icon: "💛", explanation: "Be honest about where you have fallen short. Then choose to forgive anyone who has wronged you." },{ phrase: "Lead us not into temptation", section: "PROTECTION", icon: "🛡️", explanation: "Ask God for protection over your mind, your family, your home and your future." }].map((item, i) => (<div key={i} style={s.card}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}><span style={{ fontSize: 24 }}>{item.icon}</span><div><p style={{ color: GOLD, fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold", letterSpacing: 1, margin: 0 }}>{item.section}</p><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "2px 0 0", fontStyle: "italic" }}>"{item.phrase}"</p></div></div><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{item.explanation}</p></div>))}<div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif", marginBottom: 8 }}>🙏 Pray This Now</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.8, margin: 0 }}>"Father in the name of Jesus Christ I come to you right now. You are holy and worthy of all praise. I surrender my plans to your perfect will. I bring my needs before you and trust you to provide. I confess my sins and I choose to forgive those who have wronged me. Protect my mind, my family and my future. Your kingdom come, your will be done in my life today. In the name of Jesus Christ. Amen."</p></div></div>)}
            {prayerTab === "wall" && (<div><div style={s.card}><p style={{ color: BROWN, fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>Share your prayer request with the community. You are not alone. 🙏</p><textarea style={{ ...s.input, minHeight: 70, resize: "none" }} placeholder="Share your prayer request..." value={newPrayer} onChange={e => setNewPrayer(e.target.value)} /><button style={s.btn} onClick={submitPrayer}>Submit Prayer Request</button></div><p style={{ color: BROWN, fontSize: 13, fontFamily: "sans-serif", marginBottom: 8, fontWeight: "bold" }}>Community Prayer Wall</p>{prayerLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading prayers... 🙏</p></div>}{!prayerLoading && prayerList.length === 0 && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Be the first to share a prayer request. 🙏</p></div>}{prayerList.map((r) => (<div key={r.id} style={s.card}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}><span style={s.tag}>{r.name}</span><span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif" }}>{r.time}</span></div><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>{r.request}</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><span style={{ color: BROWN + "99", fontSize: 12, fontFamily: "sans-serif" }}>🙏 {r.prayed} people prayed</span><button style={{ ...s.btnOutline, padding: "6px 14px", fontSize: 12 }} onClick={() => prayFor(r.id)}>{prayedIds.includes(r.id) ? "✓ Prayed" : "Pray for them"}</button></div></div>))}</div>)}
            {prayerTab === "journal" && (
              <div>
                <div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Your Private Space</p><h2 style={{ color: WHITE, fontSize: 18, margin: "0 0 6px" }}>📓 Prayer Journal</h2><p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0 }}>Write your prayers to God. This is between you and Him.</p></div>
                {!user && (<div style={{ ...s.card, background: GOLD_LIGHT, border: `2px solid ${GOLD_MID}` }}><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 6px" }}>🔒 Sign In to Use Your Journal</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px" }}>Create a free account to save your private prayer journal forever.</p><button style={s.btn} onClick={() => setShowAuth(true)}>Sign In or Create Account →</button></div>)}
                {user && !isPremium && <PremiumGate onUpgrade={() => window.open(STRIPE_LINK, "_blank")} />}
                {user && isPremium && (<div><div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>New Prayer Entry</p><input style={{ ...s.input, marginBottom: 10 }} placeholder="Title — e.g. Trusting God with my finances" value={journalTitle} onChange={e => setJournalTitle(e.target.value)} /><textarea style={{ ...s.input, minHeight: 100, resize: "none" }} placeholder="Write your prayer here..." value={journalEntry} onChange={e => setJournalEntry(e.target.value)} /><button style={s.btn} onClick={submitJournal}>Save Prayer Entry</button></div>{journalLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading your journal... 🙏</p></div>}{!journalLoading && journalEntries.length === 0 && (<div style={{ ...s.card, textAlign: "center", padding: 28 }}><div style={{ fontSize: 32, marginBottom: 10 }}>📓</div><p style={{ color: BROWN, fontSize: 14, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>Your prayer journal is empty. Write your first prayer today. He is listening.</p></div>)}{journalEntries.map((entry) => (<div key={entry.id} style={s.card}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>{entry.title}</p><span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif", flexShrink: 0, marginLeft: 8 }}>{entry.date}</span></div><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{entry.text}</p></div>))}</div>)}
              </div>
            )}
            {prayerTab === "answered" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>God is Faithful</p><h2 style={{ color: WHITE, fontSize: 18, margin: "0 0 6px" }}>✅ Answered Prayers</h2><p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0 }}>Share how God answered your prayer and encourage the whole community.</p></div><div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>Share Your Testimony</p><textarea style={{ ...s.input, minHeight: 80, resize: "none" }} placeholder="How did God answer your prayer?" value={testimony} onChange={e => setTestimony(e.target.value)} /><button style={s.btn} onClick={submitTestimony}>Share Testimony 🙌</button></div>{testimonies.map((t, i) => (<div key={i} style={{ ...s.card, border: `1.5px solid ${GOLD_MID}` }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ ...s.tag, background: GOLD, color: WHITE }}>✅ God Answered</span><span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif" }}>{t.time}</span></div><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{t.text}</p></div>))}</div>)}
            {prayerTab === "fasting" && (
              <div>
                {!isPremium && <PremiumGate onUpgrade={() => window.open(STRIPE_LINK, "_blank")} />}
                {isPremium && (<div>
                <div style={{ display: "flex", background: WHITE, borderRadius: 12, padding: 4, marginBottom: 14, border: `1px solid ${GOLD_LIGHT}` }}>
                  {[["foundation","📖 Foundation"],["beginner","🌱 Beginner"],["advanced","👑 Advanced"],["history","📋 History"]].map(([id, label]) => (
                    <button key={id} onClick={() => setFastingTab(id)} style={{ flex: 1, padding: "8px 2px", border: "none", borderRadius: 10, background: fastingTab === id ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : "none", color: fastingTab === id ? WHITE : BROWN, fontSize: 10, fontFamily: "sans-serif", fontWeight: fastingTab === id ? "bold" : "normal", cursor: "pointer", lineHeight: 1.3 }}>{label}</button>
                  ))}
                </div>
                {fastingTab === "foundation" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Biblical Fasting</p><h2 style={{ color: WHITE, fontSize: 20, margin: "0 0 8px" }}>⚡ The Power of Fasting</h2><p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0, lineHeight: 1.6 }}>Jesus said "when you fast" — not "if you fast." Prayer and fasting always go hand in hand. This is a discipline that changes everything.</p></div>{fastingFoundation.map((section, i) => (<div key={i} style={s.card}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><span style={{ fontSize: 28 }}>{section.icon}</span><div><p style={{ color: GOLD, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", letterSpacing: 1, margin: 0, textTransform: "uppercase" }}>{section.scripture}</p><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "2px 0 0" }}>{section.title}</p></div></div><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: "0 0 10px" }}>{section.content}</p><div style={{ background: GOLD_LIGHT, borderRadius: 10, padding: "10px 12px", marginBottom: 10 }}><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>🔑 Key Truth</p><p style={{ color: BROWN_DARK, fontSize: 13, lineHeight: 1.6, margin: 0, fontStyle: "italic" }}>{section.key}</p></div>{section.verses.map((v, j) => (<p key={j} style={{ color: BROWN, fontSize: 12, lineHeight: 1.5, margin: "0 0 4px", fontFamily: "sans-serif" }}>📌 {v}</p>))}</div>))}<div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 8px" }}>🙏 A Prayer Before You Fast</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.8, margin: 0 }}>"Father in the name of Jesus Christ I consecrate this fast to you. I deny my flesh and choose to seek your face. Speak to me clearly during this time. Break every chain and release every breakthrough you have prepared for me. I fast and pray believing you are faithful. In the name of Jesus Christ. Amen."</p></div></div>)}
                {fastingTab === "beginner" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Start Your Journey</p><h2 style={{ color: WHITE, fontSize: 20, margin: "0 0 8px" }}>🌱 Beginner Fasting Track</h2><p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0, lineHeight: 1.6 }}>Every great faster started with one meal. Start small, stay consistent, and always combine your fast with prayer.</p></div>{user && (<div style={{ ...s.card, background: CREAM_DARK }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><p style={{ color: BROWN, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 4px", letterSpacing: 1, textTransform: "uppercase" }}>Total Fasts Completed</p><p style={{ color: BROWN_DARK, fontSize: 28, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{totalFasts}</p></div>{getFastingMilestone(totalFasts) && (<div style={{ background: getFastingMilestone(totalFasts).bg, border: `2px solid ${getFastingMilestone(totalFasts).color}`, borderRadius: 12, padding: "8px 14px", textAlign: "center" }}><p style={{ color: getFastingMilestone(totalFasts).color, fontSize: 13, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{getFastingMilestone(totalFasts).label}</p></div>)}</div></div>)}{beginnerFastingLevels.map(level => (<div key={level.id} style={{ ...s.card, border: `2px solid ${level.color}22` }}><div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}><span style={{ fontSize: 28 }}>{level.icon}</span><div style={{ flex: 1 }}><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 2px" }}>{level.label}</p><span style={{ background: level.bg, color: level.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold" }}>{level.badge}</span></div></div><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>{level.description}</p><button style={{ ...s.btn, marginTop: 0, background: `linear-gradient(135deg, ${level.color}, ${BROWN_DARK})` }} onClick={() => { setSelectedFastLevel(level); setShowLogFast(true); }}>✅ Log This Fast</button></div>))}{showLogFast && selectedFastLevel && (<div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}><div style={{ background: WHITE, borderRadius: 20, padding: 28, margin: 20, width: "100%", maxWidth: 400 }}><p style={{ color: GOLD, fontSize: 18, fontWeight: "bold", margin: "0 0 8px", fontFamily: "sans-serif" }}>{selectedFastLevel.icon} Log: {selectedFastLevel.label}</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 }}>Did you pray during this fast? 🙏</p><textarea style={{ ...s.input, minHeight: 70, resize: "none", marginBottom: 12 }} placeholder="Optional: What did you pray for? What did God show you?" value={fastNote} onChange={e => setFastNote(e.target.value)} /><button style={s.btn} onClick={logFast}>✅ Complete This Fast!</button><button style={{ ...s.btnOutline, width: "100%", marginTop: 8, textAlign: "center" }} onClick={() => { setShowLogFast(false); setSelectedFastLevel(null); setFastNote(""); }}>Cancel</button></div></div>)}<div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 10px" }}>🏆 Fasting Milestone Badges</p>{fastingMilestones.map(m => { const earned = totalFasts >= m.count; return (<div key={m.count} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, opacity: earned ? 1 : 0.5 }}><div style={{ width: 32, height: 32, borderRadius: "50%", background: earned ? m.color : GOLD_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>{earned ? "✅" : m.count}</div><div style={{ flex: 1 }}><p style={{ color: earned ? m.color : BROWN, fontSize: 13, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{m.label}</p><p style={{ color: BROWN, fontSize: 11, margin: 0, fontFamily: "sans-serif" }}>{m.count} fast{m.count !== 1 ? "s" : ""} completed</p></div>{earned && <span style={{ color: m.color, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold" }}>Earned!</span>}</div>); })}</div></div>)}
                {fastingTab === "advanced" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>For the Committed Faster</p><h2 style={{ color: WHITE, fontSize: 20, margin: "0 0 8px" }}>👑 Advanced Fasting Track</h2><p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0, lineHeight: 1.6 }}>The greatest men and women of God in scripture were people of consistent fasting and prayer.</p></div><div style={{ ...s.card, background: CREAM_DARK }}><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 4px" }}>⚡ Matthew 17:21</p><p style={{ color: BROWN, fontSize: 13, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>"This kind does not go out except by prayer and fasting."</p></div>{user && advancedGoal && (<div style={{ ...s.card, border: `2px solid ${GOLD}` }}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", margin: "0 0 6px", fontFamily: "sans-serif" }}>🎯 Your Current Goal</p><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}><span style={{ fontSize: 24 }}>{advancedGoal.icon}</span><div><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 2px" }}>{advancedGoal.label}</p><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", margin: 0 }}>Target: {advancedGoal.targetDays} {advancedGoal.id === "extended" ? "day" : "time"}s per month</p></div></div><button style={{ ...s.btn, marginTop: 0 }} onClick={() => { setSelectedFastLevel(advancedFastingLevels.find(l => l.id === advancedGoal.id) || advancedFastingLevels[0]); setShowLogFast(true); }}>✅ Log a Fast for This Goal</button></div>)}<p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 10px", fontFamily: "sans-serif" }}>Set Your Advanced Fasting Goal:</p>{advancedFastingLevels.map(level => (<div key={level.id} style={{ ...s.card, border: advancedGoal?.id === level.id ? `2px solid ${GOLD}` : `1px solid ${GOLD_LIGHT}`, background: advancedGoal?.id === level.id ? "#FFFDF0" : WHITE }}><div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}><span style={{ fontSize: 28 }}>{level.icon}</span><div style={{ flex: 1 }}><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 4px" }}>{level.label}</p><span style={{ background: level.bg, color: level.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold" }}>{level.badge}</span></div>{advancedGoal?.id === level.id && <span style={{ color: GOLD, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold" }}>✅ Active</span>}</div><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.7, margin: "0 0 12px" }}>{level.description}</p>{level.id === "extended" && (<div style={{ marginBottom: 10 }}><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", marginBottom: 6 }}>Set your goal (days):</p><div style={{ display: "flex", gap: 8 }}>{["3","7","14","21","40"].map(d => (<button key={d} onClick={() => setCustomFastDays(d)} style={{ flex: 1, padding: "8px 4px", background: customFastDays === d ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : CREAM_DARK, border: customFastDays === d ? "none" : `1px solid ${GOLD_LIGHT}`, borderRadius: 10, color: customFastDays === d ? WHITE : BROWN, fontSize: 13, fontWeight: "bold", cursor: "pointer", fontFamily: "sans-serif" }}>{d}</button>))}</div></div>)}<button style={{ ...s.btn, marginTop: 0, background: `linear-gradient(135deg, ${level.color}, ${BROWN_DARK})` }} onClick={() => setAdvancedFastingGoal(level)}>{advancedGoal?.id === level.id ? "✅ Goal Set!" : "Set This Goal →"}</button></div>))}<div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 8px" }}>📖 The Daniel Fast</p><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.7, margin: "0 0 8px" }}>Daniel fasted and prayed and God gave him wisdom beyond all others in Babylon.</p><p style={{ color: BROWN_DARK, fontSize: 13, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>21 days of vegetables, fruits and water only — combined with daily prayer and God's Word. 🔥</p></div></div>)}
                {fastingTab === "history" && (<div><div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Your Fasting Record</p><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div><p style={{ color: WHITE, fontSize: 28, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{totalFasts}</p><p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0 }}>total fasts completed</p></div>{getFastingMilestone(totalFasts) && (<div style={{ textAlign: "right" }}><p style={{ color: GOLD_MID, fontSize: 14, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{getFastingMilestone(totalFasts).label}</p><p style={{ color: GOLD_LIGHT, fontSize: 11, margin: 0, fontFamily: "sans-serif" }}>Current badge</p></div>)}</div></div>{fastingLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading your fasting history... 🙏</p></div>}{!fastingLoading && fastingLog.length === 0 && (<div style={{ ...s.card, textAlign: "center", padding: 32 }}><div style={{ fontSize: 36, marginBottom: 12 }}>⚡</div><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "0 0 8px" }}>Begin Your Fasting Journey</p><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.6, margin: "0 0 16px" }}>This kind does not go out except by prayer and fasting. — Matthew 17:21</p><button style={s.btn} onClick={() => setFastingTab("beginner")}>Start with Beginner Track →</button></div>)}{fastingLog.map(log => (<div key={log.id} style={s.card}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}><div><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 2px" }}>{log.label}</p><span style={s.tag}>✅ Completed</span></div><span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif" }}>{log.date}</span></div>{log.note && <p style={{ color: BROWN, fontSize: 13, lineHeight: 1.6, margin: "8px 0 0", fontStyle: "italic" }}>🙏 "{log.note}"</p>}</div>))}{fastingLog.length > 0 && (<button style={{ ...s.btn, background: `linear-gradient(135deg, ${GOLD}, ${BROWN})` }} onClick={() => { setSelectedFastLevel(beginnerFastingLevels[0]); setShowLogFast(true); }}>+ Log Another Fast</button>)}</div>)}
                </div>)}
              </div>
            )}
          </div>
        )}

        {activeTab === "vision" && (
          <div>
            <p style={s.sectionTitle}>📋 Faith Vision Board</p>
            {!user && (<div style={{ ...s.card, background: GOLD_LIGHT, border: `2px solid ${GOLD_MID}` }}><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 6px" }}>🔒 Sign In Required</p><p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px" }}>Create a free account to track your faith goals!</p><button style={s.btn} onClick={() => setShowAuth(true)}>Sign In or Create Account →</button></div>)}
            {user && !isPremium && <PremiumGate onUpgrade={() => window.open(STRIPE_LINK, "_blank")} />}
            {user && isPremium && (<div>
            <div style={s.card}><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.5, margin: 0 }}>Track your spiritual goals and celebrate every milestone. God sees every step of faith you take! 🙌</p></div>
            {visionLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading your goals... 🙏</p></div>}
            {visionGoals.map(g => {
              const milestone = getMilestone(g.progress);
              const isCelebrating = celebration === g.id;
              const isBibleGoal = g.title === "Read the entire Bible";
              const isMemoryGoal = g.title === "Memorize 10 scriptures";
              return (
                <div key={g.id} style={{ ...s.card, border: isCelebrating ? `2px solid ${GOLD}` : `1px solid ${GOLD_LIGHT}`, background: isCelebrating ? "#FFFDF0" : WHITE }}>
                  {isCelebrating && (<div style={{ textAlign: "center", padding: "10px 0 14px", borderBottom: `1px solid ${GOLD_LIGHT}`, marginBottom: 14 }}><div style={{ fontSize: 32 }}>🎉🏆🎉</div><p style={{ color: GOLD, fontSize: 15, fontWeight: "bold", margin: "6px 0 2px", fontFamily: "sans-serif" }}>GOAL COMPLETE!</p><p style={{ color: BROWN, fontSize: 13, margin: 0 }}>You did it! To God be the glory! 🙌</p></div>)}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 26 }}>{g.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>{g.title}</p>
                      {isBibleGoal && <p style={{ color: GOLD, fontSize: 11, fontFamily: "sans-serif", margin: "2px 0 0" }}>📖 Auto-tracked — {totalRead} of {TOTAL_CHAPTERS} chapters read</p>}
                      {isMemoryGoal && <p style={{ color: GOLD, fontSize: 11, fontFamily: "sans-serif", margin: "2px 0 0" }}>✍️ Auto-tracked — {totalMemorized} of {MEMORY_GOAL} verses memorized</p>}
                      {milestone && <span style={{ display: "inline-block", background: milestone.bg, color: milestone.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold", marginTop: 4 }}>{milestone.label}</span>}
                    </div>
                    <span style={{ color: GOLD, fontSize: 16, fontWeight: "bold", fontFamily: "sans-serif" }}>{g.progress}%</span>
                  </div>
                  <div style={s.progressBg}><div style={{ height: 10, borderRadius: 6, background: g.progress >= 100 ? "#FFD700" : `linear-gradient(90deg, ${GOLD}, ${BROWN})`, width: `${g.progress}%`, transition: "width 0.3s ease" }} /></div>
                  {!isBibleGoal && !isMemoryGoal && (<div><div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}><span style={{ color: BROWN, fontSize: 11, fontFamily: "sans-serif", flexShrink: 0 }}>0%</span><input type="range" min="0" max="100" value={g.progress} onChange={e => updateProgress(g.id, parseInt(e.target.value))} style={{ flex: 1, accentColor: GOLD, cursor: "pointer" }} /><span style={{ color: BROWN, fontSize: 11, fontFamily: "sans-serif", flexShrink: 0 }}>100%</span></div><div style={{ display: "flex", gap: 8, marginTop: 10 }}><button onClick={() => updateProgress(g.id, Math.max(0, g.progress - 5))} style={{ ...s.btnSmall, flex: 1, textAlign: "center" }}>-5%</button><button onClick={() => updateProgress(g.id, Math.min(100, g.progress + 5))} style={{ ...s.btnSmall, flex: 1, textAlign: "center", background: GOLD_LIGHT }}>+5%</button><button onClick={() => updateProgress(g.id, Math.min(100, g.progress + 10))} style={{ ...s.btnSmall, flex: 1, textAlign: "center", background: GOLD_LIGHT }}>+10%</button><button onClick={() => deleteGoal(g.id)} style={{ ...s.btnSmall, color: "#cc0000", borderColor: "#ffcccc", background: "#fff5f5" }}>🗑️</button></div></div>)}
                  {isBibleGoal && (<div style={{ display: "flex", gap: 8, marginTop: 10 }}><button style={{ ...s.btn, marginTop: 0, flex: 1 }} onClick={() => setActiveTab("bible")}>Open Bible Reader →</button><button onClick={() => deleteGoal(g.id)} style={{ ...s.btnSmall, color: "#cc0000", borderColor: "#ffcccc", background: "#fff5f5" }}>🗑️</button></div>)}
                  {isMemoryGoal && (<div style={{ display: "flex", gap: 8, marginTop: 10 }}><button style={{ ...s.btn, marginTop: 0, flex: 1 }} onClick={() => setActiveTab("memory")}>Open Memory →</button><button onClick={() => deleteGoal(g.id)} style={{ ...s.btnSmall, color: "#cc0000", borderColor: "#ffcccc", background: "#fff5f5" }}>🗑️</button></div>)}
                </div>
              );
            })}
            {!showAddGoal ? (<button style={{ ...s.card, textAlign: "center", border: `2px dashed ${GOLD_MID}`, background: "none", cursor: "pointer", width: "100%", padding: 16 }} onClick={() => setShowAddGoal(true)}><p style={{ color: GOLD, fontSize: 15, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>+ Add a New Faith Goal</p></button>) : (<div style={s.card}><p style={{ color: GOLD, fontSize: 14, fontWeight: "bold", marginBottom: 12, fontFamily: "sans-serif" }}>New Faith Goal</p><input style={{ ...s.input, marginBottom: 10 }} placeholder="e.g. Read the entire Bible" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} /><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", marginBottom: 8 }}>Choose an icon:</p><div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>{goalIcons.map(icon => (<button key={icon} onClick={() => setNewGoalIcon(icon)} style={{ fontSize: 22, background: newGoalIcon === icon ? GOLD_LIGHT : "none", border: newGoalIcon === icon ? `2px solid ${GOLD}` : `1px solid ${GOLD_LIGHT}`, borderRadius: 10, padding: "6px 8px", cursor: "pointer" }}>{icon}</button>))}</div><div style={{ display: "flex", gap: 8 }}><button style={{ ...s.btn, flex: 1, marginTop: 0 }} onClick={addGoal}>Add Goal</button><button style={{ ...s.btnOutline, flex: 1 }} onClick={() => setShowAddGoal(false)}>Cancel</button></div></div>)}
            <div style={{ ...s.card, background: GOLD_LIGHT, marginTop: 4 }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 6px" }}>🏆 Milestone Badges</p><div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{[["25%","Bronze 🥉","#CD7F32"],["50%","Silver 🥈","#7A7A7A"],["75%","Gold 🥇","#C9972A"],["100%","Champion 🏆","#FFD700"]].map(([pct, label, color]) => (<div key={pct} style={{ background: WHITE, borderRadius: 10, padding: "6px 12px", border: `1px solid ${GOLD_LIGHT}` }}><p style={{ color, fontSize: 12, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{pct} — {label}</p></div>))}</div></div>
            </div>)}
          </div>
        )}

        {activeTab === "sermon" && (
          <div>
            {selectedTopic && topicContent ? (
              <div>
                <button style={s.backBtn} onClick={() => { setSelectedTopic(null); setTopicContent(null); }}>← Back to Topics</button>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Sermon Companion</p>
                  <h2 style={{ color: WHITE, fontSize: 20, margin: 0 }}>{selectedTopic}</h2>
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>📝 Main Message</p>
                  {topicContent.mainMessage.split('\n\n').map((paragraph, i) => (
                    <p key={i} style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.8, margin: i < topicContent.mainMessage.split('\n\n').length - 1 ? "0 0 14px" : 0 }}>{paragraph}</p>
                  ))}
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>🔑 Key Takeaways</p>
                  {topicContent.keyTakeaways.map((t, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <div style={{ ...s.stepNum, width: 24, height: 24, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{t}</p>
                    </div>
                  ))}
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 6, fontFamily: "sans-serif" }}>📖 Related Scriptures</p>
                  <p style={{ color: BROWN, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 12px" }}>👇 Tap any verse to open it in the Bible Reader</p>
                  {topicContent.scriptures.map((sc, i) => {
                    const parsed = parseVerseRef(sc);
                    return (
                      <div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < topicContent.scriptures.length - 1 ? `1px solid ${GOLD_LIGHT}` : "none" }}>
                        {parsed ? (
                          <button onClick={() => navigateToVerse(sc)} style={{ background: GOLD_LIGHT, border: `1.5px solid ${GOLD}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 18 }}>📌</span>
                            <div style={{ flex: 1 }}>
                              <p style={{ color: GOLD, fontSize: 12, fontWeight: "bold", margin: "0 0 2px", fontFamily: "sans-serif" }}>{sc.split(" — ")[0]} →</p>
                              <p style={{ color: BROWN_DARK, fontSize: 13, margin: 0, fontStyle: "italic" }}>{sc.split(" — ")[1]}</p>
                            </div>
                            <span style={{ color: GOLD, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold" }}>Read →</span>
                          </button>
                        ) : (
                          <p style={{ color: BROWN_DARK, fontSize: 13, lineHeight: 1.5, margin: 0 }}>📌 {sc}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>❓ Discussion Questions</p>
                  {topicContent.discussionQuestions.map((q, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}>
                      <div style={{ ...s.stepNum, width: 24, height: 24, fontSize: 12, flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{q}</p>
                    </div>
                  ))}
                </div>
                {topicContent.application && (
                  <div style={{ ...s.card, background: CREAM_DARK, border: `2px solid ${GOLD_MID}` }}>
                    <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>🎯 This Week's Application</p>
                    <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{topicContent.application}</p>
                  </div>
                )}
                <div style={{ ...s.card, background: GOLD_LIGHT }}>
                  <p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>🙏 Application Prayer</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{topicContent.prayer}</p>
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>✍️ Journal Prompt</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{topicContent.journal}</p>
                </div>
                <button style={{ ...s.btn, marginBottom: 16 }} onClick={() => { setSelectedTopic(null); setTopicContent(null); }}>← Back to Topics</button>
              </div>
            ) : selectedCategory ? (
              <div>
                <button style={s.backBtn} onClick={() => setSelectedCategory(null)}>← All Categories</button>
                <div style={s.cardGold}><p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Category</p><h2 style={{ color: WHITE, fontSize: 20, margin: 0 }}>{selectedCategory.icon} {selectedCategory.category}</h2></div>
                <div style={s.card}><p style={{ color: BROWN, fontSize: 13, marginBottom: 12, fontFamily: "sans-serif" }}>Select a topic to go deeper:</p><div style={{ display: "flex", flexWrap: "wrap" }}>{selectedCategory.topics.map(topic => (<button key={topic} style={s.btnSmall} onClick={() => openTopic(topic)}>{topic}</button>))}</div></div>
              </div>
            ) : (
              <div>
                <p style={s.sectionTitle}>🎙️ Sermon Companion</p>
                <div style={s.card}><p style={{ color: BROWN, fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>Search any topic or browse by category.</p><input style={s.input} placeholder="Search topics — Faith, Fear, Marriage..." value={sermonSearch} onChange={e => setSermonSearch(e.target.value)} /></div>
                {filteredCategories.map(cat => (
                  <div key={cat.id} style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: 0 }}>{cat.icon} {cat.category}</p>
                      {!sermonSearch && <button style={{ ...s.btnOutline, padding: "4px 12px", fontSize: 12 }} onClick={() => setSelectedCategory(cat)}>See All →</button>}
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {(sermonSearch ? cat.topics : cat.topics.slice(0, 5)).map(topic => (<button key={topic} style={s.btnSmall} onClick={() => openTopic(topic)}>{topic}</button>))}
                      {!sermonSearch && cat.topics.length > 5 && (<button style={{ ...s.btnSmall, color: GOLD, fontWeight: "bold" }} onClick={() => setSelectedCategory(cat)}>+{cat.topics.length - 5} more</button>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "salvation" && (
          <div>
            <div style={s.cardGold}><p style={{ color: GOLD_MID, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>The Greatest Decision</p><h2 style={{ color: WHITE, fontSize: 22, margin: "0 0 8px" }}>Who is Jesus Christ?</h2><p style={{ color: GOLD_LIGHT, fontSize: 14, lineHeight: 1.6, margin: 0 }}>Jesus is the Son of God, who came to earth to save humanity from sin and give us eternal life. He is the Way, the Truth, and the Life.</p></div>
            <div style={s.card}><p style={{ ...s.sectionTitle, fontSize: 15 }}>How to Receive Salvation</p>{salvationSteps.map((st, i) => (<div key={i} style={s.stepCard}><div style={s.stepNum}>{st.step}</div><div><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 4px" }}>{st.title}</p><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{st.desc}</p></div></div>))}</div>
            <div style={{ ...s.card, background: GOLD_LIGHT }}>
              <p style={{ color: BROWN, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif", marginBottom: 8 }}>Receive Salvation</p>
              <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.8 }}>"Father in the name of Jesus Christ I confess with my mouth that Jesus is Lord and I believe in my heart that God raised Him from the dead. I repent of my sins and I receive Jesus Christ as my Lord and Savior. I commit to deny myself pick up my cross daily and follow Him. In the name of Jesus Christ. Amen."</p>
              {!sinner ? (<button style={s.btn} onClick={() => setSinner(true)}>I Prayed This Prayer 🙏</button>) : (<div style={{ textAlign: "center", padding: "10px 0" }}><div style={{ fontSize: 28 }}>🎉</div><p style={{ color: BROWN_DARK, fontSize: 15, fontWeight: "bold", margin: "6px 0 4px" }}>Welcome to the Family of God!</p><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.5, margin: 0 }}>Heaven is rejoicing right now. You are loved. Start your journey with Grace Daily. ✝️</p></div>)}
            </div>
          </div>
        )}

        {activeTab === "about" && (
          <div>
            <div style={s.cardGold}>
              <p style={{ color: GOLD_MID, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Our Story</p>
              <h2 style={{ color: WHITE, fontSize: 22, margin: "0 0 8px" }}>About Grace Daily ✝️</h2>
              <p style={{ color: GOLD_LIGHT, fontSize: 13, lineHeight: 1.7, margin: 0 }}>Built with one purpose — to bring lost sheep back to the Shepherd, Jesus Christ.</p>
            </div>
            <div style={s.card}><p style={{ color: GOLD, fontSize: 14, fontWeight: "bold", margin: "0 0 10px", fontFamily: "sans-serif" }}>🎯 Our Mission</p><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.8, margin: 0 }}>Grace Daily was built with one purpose — to bring lost sheep back to the Shepherd, Jesus Christ. We believe that every person on earth deserves to encounter the living God in a personal, beautiful and life-changing way. This app is our offering to Him.</p></div>
            <div style={s.card}><p style={{ color: GOLD, fontSize: 14, fontWeight: "bold", margin: "0 0 10px", fontFamily: "sans-serif" }}>👨‍👩‍👧 Who We Are</p><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.8, margin: 0 }}>Hi — I am Bao, the founder of Grace Daily and The Bible Story Project. Alongside my beloved wife Tiffany, we have dedicated our lives to spreading the Gospel and making God's Word accessible to everyone. I am not a perfect person. I am simply someone who has been radically transformed by the grace of Jesus Christ and cannot keep that grace to myself. Everything you see in this app was built out of a deep love for God and a burning desire to see lives changed by His Word.</p></div>
            <div style={s.card}><p style={{ color: GOLD, fontSize: 14, fontWeight: "bold", margin: "0 0 10px", fontFamily: "sans-serif" }}>✝️ What We Believe</p><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.8, margin: 0 }}>We believe the Bible is the living Word of God. We believe prayer changes everything. We believe fasting breaks chains. We believe that no matter where you are in life — broken, lost, struggling or searching — Jesus Christ is the answer. He always has been and He always will be.</p></div>
            <div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: GOLD, fontSize: 14, fontWeight: "bold", margin: "0 0 10px", fontFamily: "sans-serif" }}>🙏 Our Heart For You</p><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.8, margin: "0 0 12px" }}>You are not here by accident. God led you to Grace Daily because He wants to meet you right where you are. Whether you are a brand new believer or someone who has walked with God for years — this app was built for you. We pray that every verse, every prayer and every feature draws you closer to the heart of God.</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"For God so loved the world that He gave His one and only Son." — John 3:16 ✝️</p></div>
            <div style={s.card}>
              <p style={{ color: GOLD, fontSize: 14, fontWeight: "bold", margin: "0 0 14px", fontFamily: "sans-serif" }}>🌐 Connect With Us</p>
              {[["🌐","Website","faithdailywalk.com","https://faithdailywalk.com"],["📧","Email","hello@faithdailywalk.com","mailto:hello@faithdailywalk.com"],["▶️","YouTube","The Bible Story Project","https://youtube.com/@baoqhuynh1980"],["📘","Facebook","The Bible Story Project","https://facebook.com/thebiblestoryproject"],["📸","Instagram","@baoqhuynh1980","https://instagram.com/baoqhuynh1980"],["🎵","TikTok","@thebiblestoryproject","https://tiktok.com/@thebiblestoryproject"]].map(([icon, platform, handle, url], i, arr) => (
                <div key={platform} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: i < arr.length - 1 ? 12 : 0, paddingBottom: i < arr.length - 1 ? 12 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${GOLD_LIGHT}` : "none" }}>
                  <span style={{ fontSize: 22 }}>{icon}</span>
                  <div style={{ flex: 1 }}><p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 2px", fontFamily: "sans-serif" }}>{platform}</p><p style={{ color: BROWN, fontSize: 12, margin: 0, fontFamily: "sans-serif" }}>{handle}</p></div>
                  <button style={{ background: `linear-gradient(135deg, ${GOLD}, ${BROWN})`, color: WHITE, border: "none", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", fontFamily: "sans-serif", fontWeight: "bold" }} onClick={() => window.open(url, "_blank")}>Visit →</button>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, background: BROWN_DARK, textAlign: "center", marginBottom: 20 }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✝️</div>
              <p style={{ color: GOLD_MID, fontSize: 15, fontWeight: "bold", margin: "0 0 4px", fontFamily: "sans-serif" }}>Grace Daily</p>
              <p style={{ color: GOLD_LIGHT, fontSize: 12, margin: "0 0 6px", fontFamily: "sans-serif" }}>His Grace is Sufficient — 2 Corinthians 12:9</p>
              <p style={{ color: GOLD_LIGHT, fontSize: 11, margin: 0, fontFamily: "sans-serif", opacity: 0.7 }}>© 2026 Grace Daily · faithdailywalk.com · All Glory to God Yahweh 👑</p>
            </div>
          </div>
        )}

      </div>

      <nav style={s.nav}>
        {tabs.map(t => (
          <button key={t.id} style={s.navBtn} onClick={() => { setActiveTab(t.id); setSelectedTopic(null); setTopicContent(null); setSelectedCategory(null); setSelectedBook(null); setSelectedChapter(null); setChapterText(null); setTestingVerse(null); setTestResult(null); setMemoryTab("list"); setHighlightVerse(null); }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: activeTab === t.id ? GOLD_MID : GOLD_LIGHT + "99", fontFamily: "sans-serif", fontWeight: activeTab === t.id ? "bold" : "normal" }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
