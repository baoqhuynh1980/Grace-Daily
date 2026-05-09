import React, { useState, useEffect } from "react";
import { auth, db } from "./firebase";
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

const sermonCategories = [
  { id: 1, category: "Core Christian Life", icon: "✝️", topics: ["Faith","Grace","Forgiveness","Prayer","Love","Salvation","Holy Spirit","Worship","Purpose","Healing","Obedience","Repentance","Holiness","Humility","Wisdom","Trusting God","Walking with God","Spiritual Growth","Surrender","Righteousness"] },
  { id: 2, category: "Emotional & Life Struggles", icon: "💔", topics: ["Fear","Anxiety","Depression","Stress","Loneliness","Doubt","Anger","Worry","Brokenness","Grief","Addiction","Temptation","Spiritual Warfare","Overcoming Sin","Burnout","Waiting on God","Feeling Lost","Identity in Christ"] },
  { id: 3, category: "Encouragement & Motivation", icon: "⚡", topics: ["God's Promises","Hope","Strength","Courage","Peace","Joy","God's Timing","Perseverance","Victory","Breakthrough","Blessings","Renewing Your Mind","Trust During Trials","Walking by Faith","God's Plan for Your Life"] },
  { id: 4, category: "Relationships & Family", icon: "👨‍👩‍👧", topics: ["Marriage","Parenting","Friendship","Loving Others","Serving Others","Conflict Resolution","Biblical Leadership","Manhood","Womanhood","Family Restoration","Dating God's Way","Forgiving Others"] },
  { id: 5, category: "Deep Biblical Topics", icon: "📖", topics: ["The Gospel","The Cross","The Resurrection","Heaven","Hell","The Armor of God","Fruits of the Spirit","Spiritual Gifts","End Times","Baptism","Communion","Discipleship","Fasting","The Kingdom of God","Sin and Redemption"] },
  { id: 6, category: "Practical Daily Living", icon: "🌅", topics: ["Morning Devotions","Daily Encouragement","How to Pray","Hearing God's Voice","Studying the Bible","Building Discipline","Living with Purpose","God in Hard Times","Handling Temptation","Daily Faith Habits"] },
  { id: 7, category: "Series Style Topics", icon: "🔥", topics: ["When God Feels Silent","Faith Over Fear","The Battle in Your Mind","God Still Heals","Waiting Season","Called for More","Jesus Changes Everything","The Power of Prayer","Chains Broken","From Broken to Blessed","Storms Don't Last Forever","God Is Still Working"] }
];

const sermonContent = {
  "Faith": { mainMessage: "Faith is the foundation of everything in the Christian life. It is not blind belief but confident trust in a God who has proven Himself faithful time and time again. Hebrews 11:1 tells us that faith is the substance of things hoped for and the evidence of things not yet seen. Faith moves mountains, opens doors, and connects us to the supernatural power of God.", keyTakeaways: ["Faith requires action — it is not just believing but stepping out in trust.", "Your faith grows when it is tested — every trial is an opportunity to trust God more.", "Faith speaks to your circumstances rather than letting your circumstances speak to you."], scriptures: ["Hebrews 11:1 — Faith is the substance of things hoped for the evidence of things not seen.", "Matthew 17:20 — Even faith as small as a mustard seed can move mountains.", "Romans 10:17 — Faith comes by hearing and hearing by the Word of God."], discussionQuestions: ["What area of your life requires the most faith right now?", "How has God proven Himself faithful in your past that can strengthen your faith today?", "What is one step of faith God is calling you to take this week?"], prayer: "Father in the name of Jesus Christ strengthen my faith today. Help me to trust you completely even when I cannot see the full picture. I choose to walk by faith and not by sight. In the name of Jesus Christ. Amen.", journal: "Write about a time God came through for you when you stepped out in faith. How does that testimony strengthen your faith for what you are facing today?" },
  "Grace": { mainMessage: "Grace is the unmerited favor of God — His love and blessing extended to us not because of what we have done but because of who He is. Ephesians 2:8-9 reminds us that we are saved by grace through faith and not of ourselves. Grace is not a license to sin but the power to live differently. It is God meeting us exactly where we are and loving us too much to leave us there.", keyTakeaways: ["Grace is not earned — you cannot work for what God freely gives.", "Grace empowers you to live holy — it gives you both forgiveness and the power to change.", "Extend to others the same grace God has extended to you."], scriptures: ["Ephesians 2:8-9 — For by grace you have been saved through faith, not of yourselves.", "2 Corinthians 12:9 — My grace is sufficient for you, for my power is made perfect in weakness.", "Romans 5:20 — Where sin increased, grace increased all the more."], discussionQuestions: ["How does understanding God's grace change the way you view yourself?", "Is there an area of your life where you are trying to earn God's favor instead of receiving His grace?", "How can you extend grace to someone in your life this week?"], prayer: "Father in the name of Jesus Christ thank you for your grace that covers every mistake and every failure. Help me to receive your grace fully and to extend that same grace to others. In the name of Jesus Christ. Amen.", journal: "Reflect on a moment when you experienced God's grace in a powerful way. How did that moment change you?" },
  "Forgiveness": { mainMessage: "Forgiveness is at the heart of the Gospel. God forgave us of everything through Jesus Christ and calls us to extend that same forgiveness to others. Unforgiveness is a prison that keeps us bound while the person who hurt us walks free. When we forgive we are not excusing what was done — we are releasing ourselves from the burden of bitterness and trusting God to handle justice.", keyTakeaways: ["Forgiveness is a choice, not a feeling — you choose to forgive before the feelings follow.", "Unforgiveness hurts you more than the person who wronged you.", "Forgiveness does not always mean reconciliation — you can forgive someone and still have healthy boundaries."], scriptures: ["Ephesians 4:32 — Be kind to one another, tenderhearted, forgiving one another as God in Christ forgave you.", "Matthew 6:14-15 — If you forgive others their trespasses, your heavenly Father will also forgive you.", "Colossians 3:13 — Bear with each other and forgive one another if any of you has a grievance against someone."], discussionQuestions: ["Is there someone in your life you need to forgive but have been struggling to let go?", "How does remembering how much God has forgiven you help you forgive others?", "What does healthy forgiveness look like in a situation where trust has been broken?"], prayer: "Father in the name of Jesus Christ I choose to forgive those who have hurt me. I release every offense and bitterness to you. Heal my heart and fill the space left by unforgiveness with your peace and love. In the name of Jesus Christ. Amen.", journal: "Who do you need to forgive? Write a letter to that person that you will never send — express everything you feel and then write the words I choose to forgive you at the end." },
  "Prayer": { mainMessage: "Prayer is simply talking to God. It is not a religious ritual but a relationship. God desires to hear from you every day — your joys, your fears, your questions, your praise. Matthew 6 shows us that Jesus taught His disciples to pray not as a performance but as a genuine conversation with the Father. Prayer changes things and it changes us.", keyTakeaways: ["Prayer is a conversation not a monologue — learn to listen as much as you speak.", "Consistency in prayer builds intimacy with God — make it a daily habit.", "Pray with faith and expectation — believe that God hears and answers."], scriptures: ["Philippians 4:6-7 — Do not be anxious about anything but in everything by prayer present your requests to God.", "Matthew 7:7-8 — Ask and it will be given to you, seek and you will find, knock and the door will be opened.", "1 Thessalonians 5:17 — Pray without ceasing."], discussionQuestions: ["What does your current prayer life look like and what would you like it to look like?", "What has been your most powerful answered prayer?", "What is one thing you have been afraid to bring to God in prayer?"], prayer: "Father in the name of Jesus Christ teach me to pray. Help me to come to you daily with an open and honest heart. I believe that you hear me and that you answer prayer. In the name of Jesus Christ. Amen.", journal: "Write out a prayer to God about something you have never prayed about before. Be completely honest with Him." },
  "Love": { mainMessage: "God is love. Everything He does flows from His love for us. 1 Corinthians 13 gives us the most complete picture of what love truly looks like — patient, kind, not self-seeking. As followers of Jesus we are called to love God with everything we have and to love others the way Christ loved us. Love is not just a feeling — it is a decision and an action.", keyTakeaways: ["Love is an action not just an emotion — it shows up even when it is difficult.", "You can only truly love others when you first receive God's love for yourself.", "The world will know we are Christians by our love for one another."], scriptures: ["1 Corinthians 13:4-7 — Love is patient, love is kind, it does not envy or boast.", "John 3:16 — For God so loved the world that He gave His one and only Son.", "1 John 4:19 — We love because He first loved us."], discussionQuestions: ["What does it look like to love someone who is difficult to love?", "How has experiencing God's love changed the way you love others?", "In what relationship do you need to show more love this week?"], prayer: "Father in the name of Jesus Christ fill me with your love today. Help me to love others the way you love me — unconditionally and sacrificially. Let your love flow through me to everyone I encounter. In the name of Jesus Christ. Amen.", journal: "Think of someone who is hard to love in your life. Write about how God sees that person and how you can show them love this week." },
  "Salvation": { mainMessage: "Salvation is the greatest gift ever given. God loved us so much that He sent His Son Jesus Christ to die for our sins so that we could be reconciled to Him. Salvation is not about being good enough — none of us are. It is about accepting what Jesus already did on the cross. When we confess with our mouth that Jesus is Lord and believe in our heart that God raised Him from the dead we are saved.", keyTakeaways: ["Salvation is a gift — you cannot earn it, you can only receive it.", "Salvation is the beginning of your journey not the end — it leads to a life of following Jesus.", "Every person needs salvation — share the Gospel boldly with those around you."], scriptures: ["Romans 10:9 — If you confess with your mouth Jesus is Lord and believe in your heart God raised Him from the dead you will be saved.", "John 3:16 — For God so loved the world that He gave His one and only Son.", "Acts 4:12 — Salvation is found in no one else, for there is no other name under heaven by which we must be saved."], discussionQuestions: ["Do you remember the moment you gave your life to Jesus? What was that like?", "How has your life changed since receiving salvation?", "Who in your life needs to hear the message of salvation?"], prayer: "Father in the name of Jesus Christ thank you for the gift of salvation. Thank you that Jesus died for my sins and rose again so that I could have eternal life. Help me to never take this gift for granted and to share it with everyone I can. In the name of Jesus Christ. Amen.", journal: "Write about your salvation story. When did you first encounter Jesus and how has your life been different since that moment?" },
  "Fear": { mainMessage: "Fear is one of the most common human experiences and one of the enemy's most powerful weapons. But God's Word tells us repeatedly — do not be afraid. 2 Timothy 1:7 reminds us that God has not given us a spirit of fear but of power, love and a sound mind. Fear loses its grip when we fix our eyes on the One who is greater than anything we face.", keyTakeaways: ["Fear is a spirit that must be resisted in the name of Jesus.", "The antidote to fear is not courage alone but a deep trust in God's presence and power.", "What you feed grows — stop feeding your fears and start feeding your faith."], scriptures: ["2 Timothy 1:7 — For God has not given us a spirit of fear but of power love and a sound mind.", "Isaiah 41:10 — Fear not for I am with you, be not dismayed for I am your God.", "Psalm 27:1 — The Lord is my light and my salvation — whom shall I fear?"], discussionQuestions: ["What fear has been controlling your life the most recently?", "How does knowing God is with you change how you face your fears?", "What would you do differently if you were not afraid?"], prayer: "Father in the name of Jesus Christ I reject the spirit of fear right now. You have given me power, love and a sound mind. I will not be afraid because you are with me. Replace my fear with unshakeable faith. In the name of Jesus Christ. Amen.", journal: "Name your biggest fear. Then write out every truth from God's Word that directly contradicts that fear." },
  "Anxiety": { mainMessage: "Anxiety is the result of trying to carry tomorrow's burdens with today's strength. God never designed us to carry the weight of worry. Philippians 4:6-7 gives us the prescription for anxiety — bring everything to God in prayer with thanksgiving, and His peace that surpasses all understanding will guard your heart and mind.", keyTakeaways: ["Anxiety is a signal to pray not a sentence to suffer.", "You cannot control everything but you can trust the One who controls all things.", "Cast your anxiety on God daily — it is a discipline that must be practiced consistently."], scriptures: ["Philippians 4:6-7 — Do not be anxious about anything but in everything by prayer present your requests to God.", "1 Peter 5:7 — Cast all your anxiety on Him because He cares for you.", "Matthew 6:34 — Do not worry about tomorrow for tomorrow will worry about itself."], discussionQuestions: ["What triggers your anxiety the most and how have you been dealing with it?", "What does it look like practically to cast your anxiety on God?", "How would your life look different if you truly trusted God with everything you are anxious about?"], prayer: "Father in the name of Jesus Christ I bring every anxious thought to you right now. I choose to trust you with everything I cannot control. Fill me with your peace that passes all understanding. In the name of Jesus Christ. Amen.", journal: "List every worry that is on your mind right now. Next to each one write a truth from God's Word that speaks directly to that worry. Then pray over that list." },
  "Hope": { mainMessage: "Hope in God is an anchor for the soul. It is not wishful thinking — it is confident expectation based on God's promises and His proven faithfulness. Romans 15:13 tells us that God is the God of hope who fills us with all joy and peace as we trust in Him. No matter what you are going through right now God has not run out of options for your life.", keyTakeaways: ["Hope is rooted in God's character not your circumstances.", "Hope deferred makes the heart sick — stay connected to God's promises daily.", "You are never without hope because you are never without God."], scriptures: ["Romans 15:13 — May the God of hope fill you with all joy and peace as you trust in Him.", "Jeremiah 29:11 — For I know the plans I have for you, plans to give you hope and a future.", "Lamentations 3:22-23 — His mercies are new every morning, great is His faithfulness."], discussionQuestions: ["Where have you lost hope recently and what would it look like to get it back?", "What promise from God's Word gives you the most hope for your current situation?", "How can you be a source of hope for someone else this week?"], prayer: "Father in the name of Jesus Christ restore my hope today. Help me to fix my eyes on your promises rather than my problems. Fill me with your joy and peace as I trust in you. In the name of Jesus Christ. Amen.", journal: "Write about a season when all hope seemed lost but God came through. Let that testimony become fuel for the hope you need today." },
  "Marriage": { mainMessage: "Marriage is God's design and it is a powerful picture of Christ's relationship with the Church. Ephesians 5 calls husbands to love their wives as Christ loved the Church and wives to respect their husbands. A godly marriage requires both partners to put God at the center and to choose love as a daily decision not just a feeling.", keyTakeaways: ["A strong marriage requires three — you, your spouse and God at the center.", "Love in marriage is a covenant commitment not a conditional feeling.", "Invest in your marriage daily — small consistent deposits build a strong relationship over time."], scriptures: ["Ephesians 5:25 — Husbands love your wives just as Christ loved the church and gave himself up for her.", "Genesis 2:24 — A man shall leave his father and mother and be united to his wife.", "Ecclesiastes 4:12 — A cord of three strands is not quickly broken."], discussionQuestions: ["What does it look like to put God at the center of your marriage practically?", "What is one thing you can do this week to strengthen your marriage?", "How does understanding Christ's love for the Church change how you view love in marriage?"], prayer: "Father in the name of Jesus Christ I bring my marriage to you. Strengthen our bond, heal what is broken, and help us to love each other the way you love us. Be the center of our home. In the name of Jesus Christ. Amen.", journal: "Write about what you love most about your spouse and one specific way you will show them love and appreciation this week." },
  "The Gospel": { mainMessage: "The Gospel is the greatest news the world has ever heard. God created us for relationship with Him, sin separated us from Him, but Jesus Christ came to restore that relationship through His death and resurrection. The Gospel is not just the entry point to Christianity — it is the power that transforms us every single day.", keyTakeaways: ["The Gospel is the power of God for salvation to everyone who believes.", "We are saved by grace through faith in Jesus Christ alone — nothing can be added to what He already did.", "The Gospel compels us to go and tell others — every believer is a witness."], scriptures: ["Romans 1:16 — For I am not ashamed of the gospel, because it is the power of God that brings salvation.", "1 Corinthians 15:3-4 — Christ died for our sins, was buried and was raised on the third day.", "John 14:6 — Jesus answered I am the way the truth and the life, no one comes to the Father except through me."], discussionQuestions: ["How would you explain the Gospel to someone who has never heard it?", "How does the Gospel continue to transform your daily life beyond the moment of salvation?", "Who in your life needs to hear the Gospel and how can you share it with them?"], prayer: "Father in the name of Jesus Christ thank you for the Gospel. Thank you that Jesus paid the price I could never pay. Help me to never lose my wonder at what you did for me and to share this good news boldly. In the name of Jesus Christ. Amen.", journal: "Write out the Gospel in your own words as if you were explaining it to someone for the very first time." },
  "Spiritual Warfare": { mainMessage: "Every believer is in a spiritual battle whether they know it or not. The enemy comes to steal kill and destroy but Jesus came that we might have life and have it abundantly. Ephesians 6 calls us to put on the full armor of God so that we can stand against the schemes of the devil. The battle is real but the victory has already been won through Jesus Christ.", keyTakeaways: ["Your battle is not against people but against spiritual forces — pray accordingly.", "Put on the full armor of God daily — it is not automatic, it is a deliberate act.", "The enemy has already been defeated — you are enforcing a victory that Christ already won."], scriptures: ["Ephesians 6:11 — Put on the full armor of God so that you can take your stand against the devil's schemes.", "1 Peter 5:8 — Be sober-minded, be watchful, your adversary the devil prowls around like a roaring lion.", "James 4:7 — Submit yourselves to God, resist the devil, and he will flee from you."], discussionQuestions: ["What area of your life do you feel is under spiritual attack right now?", "How consistent are you in putting on the armor of God daily?", "What does it look like practically to resist the devil in your everyday life?"], prayer: "Father in the name of Jesus Christ I put on the full armor of God right now. I stand against every attack of the enemy. Greater is He that is in me than he that is in the world. I declare victory through the blood of Jesus Christ. In the name of Jesus Christ. Amen.", journal: "Identify one area of your life where you sense spiritual attack. Write out a battle plan using specific scriptures as your weapons." },
  "God's Timing": { mainMessage: "One of the hardest things about the Christian life is waiting on God's timing. We live in a microwave world but God often works in a crockpot way. Ecclesiastes 3:1 tells us there is a time for everything and a season for every activity under heaven. God is never late and He is never early — He is always right on time.", keyTakeaways: ["Waiting on God is not wasted time — He is preparing you in the process.", "God's delays are not God's denials — trust His timing even when it doesn't make sense.", "Use your waiting season to grow deeper in your faith and your relationship with God."], scriptures: ["Ecclesiastes 3:1 — There is a time for everything and a season for every activity under the heavens.", "Isaiah 40:31 — Those who wait on the Lord will renew their strength.", "Habakkuk 2:3 — For the vision awaits an appointed time — if it seems slow wait for it, it will surely come."], discussionQuestions: ["What are you currently waiting on God for and how are you handling the wait?", "Can you look back and see a time when God's timing was perfect even though it felt slow?", "What is God trying to develop in you during this waiting season?"], prayer: "Father in the name of Jesus Christ I trust your timing even when I do not understand it. Help me to wait with patience and faith knowing that you are working all things together for my good. In the name of Jesus Christ. Amen.", journal: "Write about what you are waiting on God for right now. Then write out what God might be trying to build in you through the waiting." },
  "Identity in Christ": { mainMessage: "Who you are is not defined by what you have done, what others say about you, or what you have been through. Your true identity is found in who God says you are. In Christ you are loved, chosen, redeemed, forgiven, and called. When you know who you are in Christ the enemy loses his power to define you with lies.", keyTakeaways: ["Your identity is rooted in whose you are not what you do.", "Replace the lies you believe about yourself with what God's Word says about you.", "Living from your identity in Christ rather than for it changes everything."], scriptures: ["2 Corinthians 5:17 — If anyone is in Christ the new creation has come, the old has gone the new is here.", "Ephesians 1:4-5 — He chose us in Him before the creation of the world to be holy and blameless.", "1 Peter 2:9 — You are a chosen people, a royal priesthood, a holy nation, God's special possession."], discussionQuestions: ["What lies have you believed about yourself that contradict what God says about you?", "How would your daily life change if you fully believed what God says about your identity?", "What is one truth about your identity in Christ you need to declare over yourself today?"], prayer: "Father in the name of Jesus Christ I declare who I am in you today. I am loved, chosen, redeemed and called. I reject every lie the enemy has told me about myself and I choose to believe what your Word says about me. In the name of Jesus Christ. Amen.", journal: "Make a list of 10 things God says about you in His Word. Read them out loud every morning this week." },
  "Fasting": { mainMessage: "Fasting is one of the most powerful spiritual disciplines available to believers. When we fast we deny the flesh and say to God that knowing Him and hearing from Him is more important than physical comfort. Jesus said when you fast — not if — indicating that fasting should be a regular part of the believer's life. Fasting combined with prayer moves mountains.", keyTakeaways: ["Start small — a meal fast is a powerful starting point for those new to fasting.", "Fasting is not about impressing God — it is about drawing closer to Him.", "Replace the time you would spend eating with prayer and reading God's Word."], scriptures: ["Matthew 6:16-17 — When you fast do not look somber as the hypocrites do.", "Isaiah 58:6 — Is not this the kind of fasting I have chosen — to loose the chains of injustice.", "Acts 13:2-3 — While they were worshiping the Lord and fasting the Holy Spirit said set apart for me Barnabas and Saul."], discussionQuestions: ["Have you ever fasted before and what was your experience?", "What breakthrough are you believing God for that might require fasting and prayer?", "What type of fast feels right for where you are in your faith journey right now?"], prayer: "Father in the name of Jesus Christ as I fast I draw closer to you. I deny my flesh and declare that you are more important than anything this world offers. Speak to me clearly during this time of fasting and prayer. In the name of Jesus Christ. Amen.", journal: "Write about something you are believing God for. Commit to a specific fast and write out exactly what you are trusting God to do." },
  "The Armor of God": { mainMessage: "The Armor of God in Ephesians 6 is not decorative — it is essential equipment for every believer in spiritual battle. Each piece of armor serves a specific purpose: the belt of truth, breastplate of righteousness, shoes of peace, shield of faith, helmet of salvation and sword of the Spirit. When we put on the full armor daily we are equipped to stand firm against every attack of the enemy.", keyTakeaways: ["The armor of God is put on through prayer, declaration and living in God's Word.", "Every piece of armor is essential — you cannot leave any of it off.", "The only offensive weapon is the sword of the Spirit which is the Word of God — know your Bible."], scriptures: ["Ephesians 6:11 — Put on the full armor of God so that you can take your stand against the devil's schemes.", "Ephesians 6:17 — Take the helmet of salvation and the sword of the Spirit which is the Word of God.", "Romans 13:12 — Put on the armor of light."], discussionQuestions: ["Which piece of the armor of God do you feel weakest in right now?", "How do you practically put on the armor of God each morning?", "How does knowing your weapons change the way you approach spiritual battles?"], prayer: "Father in the name of Jesus Christ I put on the full armor of God right now. I gird myself with truth, I put on righteousness, I take up the shield of faith and the sword of your Word. I am equipped and I am ready. In the name of Jesus Christ. Amen.", journal: "Go through each piece of the armor of God. For each one write down what it means practically in your daily life and how you will apply it today." },
  "How to Pray": { mainMessage: "Many people want to pray but do not know where to start. Jesus gave us a model in Matthew 6 — the Lord's Prayer — that covers every element of powerful prayer: worship, surrender, petition, confession and spiritual protection. Prayer does not require fancy words or a perfect life. It simply requires an honest heart and a willingness to come to God just as you are.", keyTakeaways: ["Start with praise and worship — acknowledge who God is before you bring your requests.", "Be specific in your prayers — God honors specific faith.", "End with surrender — your will not mine be done."], scriptures: ["Matthew 6:9-13 — Our Father in heaven hallowed be your name your kingdom come your will be done.", "Jeremiah 33:3 — Call to me and I will answer you and tell you great and unsearchable things.", "James 5:16 — The prayer of a righteous person is powerful and effective."], discussionQuestions: ["What has been the biggest obstacle to your prayer life?", "How does praying the Lord's Prayer as a model change the way you approach God?", "What is one specific thing you want to start praying about consistently?"], prayer: "Father in the name of Jesus Christ teach me to pray. I want to come to you daily with an open heart. Help me to be consistent, specific and expectant in my prayers. In the name of Jesus Christ. Amen.", journal: "Write out your own version of the Lord's Prayer — personalized to your life, your circumstances and your relationship with God." },
  "When God Feels Silent": { mainMessage: "Every believer goes through seasons where God feels distant or silent. The prayers seem to bounce off the ceiling. The heavens feel like brass. But silence is not absence. God is always with you even when you cannot feel Him. These desert seasons are often where the deepest spiritual growth happens.", keyTakeaways: ["God's silence is not His absence — He is always present even when you cannot feel Him.", "Keep showing up — consistency in seeking God even when it feels dry is a mark of mature faith.", "These seasons always end — your breakthrough is on the other side of your faithfulness."], scriptures: ["Psalm 22:1-2 — My God my God why have you forsaken me, yet you are the Holy One.", "Isaiah 45:15 — Truly you are a God who hides himself, O God and Savior of Israel.", "Hebrews 13:5 — Never will I leave you, never will I forsake you."], discussionQuestions: ["Have you ever gone through a season where God felt silent and what did you do?", "How do you maintain your faith when you cannot feel God's presence?", "What has God taught you during seasons of silence that you could not have learned any other way?"], prayer: "Father in the name of Jesus Christ even in this season of silence I choose to trust you. I know you are present even when I cannot feel you. I will keep seeking you until the breakthrough comes. In the name of Jesus Christ. Amen.", journal: "Write a raw honest letter to God about how you feel in this silent season. Tell Him everything. Then write out what you believe to be true about Him regardless of what you feel." },
  "Faith Over Fear": { mainMessage: "Fear and faith cannot occupy the same space. When fear rises, faith must rise higher. Every time God called someone to do something great in the Bible fear was present. Joshua was told to be strong and courageous not because danger was not real but because God's presence was more real. Faith over fear is a daily choice to trust God above every threat, uncertainty and impossibility.", keyTakeaways: ["Acknowledge your fear but do not give it authority over your decisions.", "Faith is not the absence of fear — it is moving forward in spite of it.", "Speak the Word of God out loud over your fear — faith comes by hearing."], scriptures: ["Joshua 1:9 — Be strong and courageous, do not be afraid for the Lord your God will be with you.", "Psalm 56:3 — When I am afraid I put my trust in you.", "Isaiah 41:10 — Fear not for I am with you, be not dismayed for I am your God."], discussionQuestions: ["What fear is trying to stop you from moving forward right now?", "What would you do differently this week if fear was not a factor?", "How do you practically choose faith over fear in everyday decisions?"], prayer: "Father in the name of Jesus Christ I choose faith over fear today. I will not let fear make my decisions. I trust you completely and I move forward knowing you are with me. In the name of Jesus Christ. Amen.", journal: "Name the fear that has been controlling you the most. Write out a declaration of faith that directly confronts that fear with God's Word." },
  "Jesus Changes Everything": { mainMessage: "An encounter with Jesus Christ changes everything. It changed fishermen into world changers, prostitutes into worshippers, murderers into apostles and broken people into new creations. Jesus does not just improve your life — He transforms it from the inside out. 2 Corinthians 5:17 says if anyone is in Christ the new creation has come — the old is gone the new is here.", keyTakeaways: ["Jesus does not just fix broken things — He makes all things new.", "Your past does not define you — your encounter with Jesus does.", "The same power that raised Christ from the dead lives in every believer."], scriptures: ["2 Corinthians 5:17 — If anyone is in Christ the new creation has come, the old has gone the new is here.", "John 10:10 — I have come that they may have life and have it to the full.", "Galatians 2:20 — I have been crucified with Christ and I no longer live but Christ lives in me."], discussionQuestions: ["How has your encounter with Jesus specifically changed your life?", "What area of your life still needs to be fully surrendered to Jesus?", "Who in your life needs to know that Jesus changes everything?"], prayer: "Father in the name of Jesus Christ thank you that Jesus changed everything for me. I give every area of my life to you completely. Have your way in me and transform me from the inside out. In the name of Jesus Christ. Amen.", journal: "Write your before and after story. Who were you before Jesus and who are you now? Let that testimony remind you of His power and share it with someone." }
};

const getSermonContent = (topic) => {
  if (sermonContent[topic]) return sermonContent[topic];
  return {
    mainMessage: `${topic} is a powerful and important subject in the Christian faith. God's Word has much to say about this topic and studying it will deepen your relationship with Him and transform the way you live.`,
    keyTakeaways: [`Seek God's wisdom on ${topic} through prayer and His Word.`, `Apply what you learn about ${topic} to your everyday life.`, `Share what God is teaching you about ${topic} with others.`],
    scriptures: ["Proverbs 3:5-6 — Trust in the Lord with all your heart and lean not on your own understanding.", "Psalm 119:105 — Your word is a lamp to my feet and a light to my path.", "James 1:5 — If any of you lacks wisdom let him ask God who gives generously to all."],
    discussionQuestions: [`What does God's Word say about ${topic}?`, `How does ${topic} apply to your current season of life?`, `What is one action step you can take this week based on what you are learning about ${topic}?`],
    prayer: `Father in the name of Jesus Christ give me wisdom and understanding about ${topic}. Let your Word guide me and transform me as I study this topic. In the name of Jesus Christ. Amen.`,
    journal: `Write about what God is showing you about ${topic}. What is one thing you want to apply to your life this week?`
  };
};

const emotionVerses = {
  anxious: { keywords: ["anxious","anxiety","worried","worry","nervous","stress","stressed","overwhelmed","panic"], verses: ["philippians 4:6","isaiah 41:10","matthew 6:34","1 peter 5:7","john 14:27","psalm 34:4","2 timothy 1:7","psalm 23:4","romans 15:13","psalm 94:19"], reflection: "God sees every worry you carry right now. He doesn't want you to face this alone. Cast every anxiety on Him because He cares deeply for you.", prayer: "Father in the name of Jesus Christ I bring every worry and anxiety to you right now. I choose to trust you above my circumstances. Fill me with your peace that surpasses all understanding. In the name of Jesus Christ. Amen." },
  sad: { keywords: ["sad","sadness","depressed","depression","unhappy","miserable","hopeless","down","discouraged","heartbroken"], verses: ["psalm 34:18","matthew 5:4","revelation 21:4","psalm 147:3","isaiah 61:3","2 corinthians 1:3","john 16:22","psalm 30:5","romans 8:18","isaiah 43:2"], reflection: "God is close to the brokenhearted. Your sadness is not hidden from Him. He sees every tear and He is right there with you in this moment.", prayer: "Father in the name of Jesus Christ I come to you with a heavy heart. Lift me up from this sadness and remind me that your joy comes in the morning. In the name of Jesus Christ. Amen." },
  grateful: { keywords: ["grateful","thankful","blessed","happy","joyful","joy","praise","amazing","good","wonderful"], verses: ["psalm 100:4","1 thessalonians 5:18","psalm 107:1","philippians 4:4","james 1:17","psalm 136:1","ephesians 5:20","psalm 118:24","colossians 3:17","psalm 9:1"], reflection: "A grateful heart is a powerful heart. When we count our blessings and thank God for His goodness it opens the door for even more of His grace in our lives.", prayer: "Father in the name of Jesus Christ thank you for your goodness and mercy in my life. I praise you for every blessing both big and small. In the name of Jesus Christ. Amen." },
  lonely: { keywords: ["lonely","alone","abandoned","isolated","forgotten","unloved","rejected","left out","no one"], verses: ["deuteronomy 31:6","psalm 139:7","hebrews 13:5","matthew 28:20","isaiah 43:4","psalm 68:6","john 14:18","zephaniah 3:17","romans 8:38","psalm 27:10"], reflection: "You are never truly alone. God is always with you. Even in your loneliest moment His presence surrounds you.", prayer: "Father in the name of Jesus Christ remind me right now that I am never alone. Fill the empty spaces in my heart with your love and your peace. In the name of Jesus Christ. Amen." },
  angry: { keywords: ["angry","anger","mad","furious","frustrated","rage","upset","bitter","resentful","annoyed"], verses: ["ephesians 4:26","james 1:19","proverbs 15:1","psalm 37:8","romans 12:19","colossians 3:8","proverbs 29:11","matthew 5:22","ecclesiastes 7:9","psalm 4:4"], reflection: "God understands your anger. He asks you to bring it to Him rather than let it control you.", prayer: "Father in the name of Jesus Christ I give you my anger right now. Help me to respond with grace and wisdom rather than react in anger. In the name of Jesus Christ. Amen." },
  lost: { keywords: ["lost","confused","don't know","unsure","unclear","wandering","no direction","uncertain","mixed up"], verses: ["proverbs 3:5","psalm 32:8","isaiah 30:21","john 10:27","psalm 119:105","jeremiah 29:11","proverbs 16:9","isaiah 42:16","psalm 25:4","romans 8:14"], reflection: "Even when you feel lost God always knows exactly where you are. He is faithful to guide you step by step.", prayer: "Father in the name of Jesus Christ I need your guidance right now. Show me the path you have for me. In the name of Jesus Christ. Amen." },
  hopeful: { keywords: ["hopeful","hope","expectant","believing","trusting","faith","optimistic","looking forward"], verses: ["romans 15:13","jeremiah 29:11","hebrews 11:1","lamentations 3:22","psalm 31:24","isaiah 40:31","romans 8:28","psalm 62:5","micah 7:7","habakkuk 2:3"], reflection: "Hope in God is never wasted. He is faithful to fulfill every promise He has made.", prayer: "Father in the name of Jesus Christ fill me with your hope today. I know that you are faithful and your plans for me are good. In the name of Jesus Christ. Amen." },
  tempted: { keywords: ["tempted","temptation","struggling","addicted","addiction","can't stop","weak","failing","giving in","sin"], verses: ["1 corinthians 10:13","james 4:7","hebrews 4:15","galatians 5:16","romans 6:14","psalm 119:11","matthew 26:41","2 peter 2:9","ephesians 6:11","1 john 4:4"], reflection: "Every person faces temptation. But God always provides a way out. Through Christ you have the power to overcome.", prayer: "Father in the name of Jesus Christ I need your strength right now. Give me the power to resist temptation and walk in freedom. In the name of Jesus Christ. Amen." },
  grieving: { keywords: ["grieving","grief","loss","death","mourning","miss","missing","died","passed away","hurting"], verses: ["psalm 34:18","revelation 21:4","matthew 5:4","2 corinthians 1:3","isaiah 61:1","john 11:35","romans 8:28","psalm 23:4","1 thessalonians 4:13","psalm 147:3"], reflection: "God sees your grief and He weeps with you. He is the God of all comfort and He will carry you through this season of loss.", prayer: "Father in the name of Jesus Christ comfort me in this time of grief. Hold me close and remind me that you are near to the brokenhearted. In the name of Jesus Christ. Amen." },
  surrendering: { keywords: ["surrender","surrendering","let go","giving up","giving it to God","release","submit","yield","trust God"], verses: ["matthew 11:28","proverbs 3:5","romans 12:1","galatians 2:20","psalm 46:10","luke 22:42","1 peter 5:6","james 4:7","matthew 16:24","john 12:24"], reflection: "Surrendering to God is not giving up — it is the greatest act of faith.", prayer: "Father in the name of Jesus Christ I surrender everything to you right now. Have your way in me Lord. In the name of Jesus Christ. Amen." },
  direction: { keywords: ["direction","purpose","calling","what to do","next step","guidance","path","decision","choose","which way"], verses: ["proverbs 16:3","psalm 37:23","isaiah 30:21","jeremiah 29:11","psalm 32:8","proverbs 3:6","romans 8:14","james 1:5","psalm 25:9","isaiah 48:17"], reflection: "God has a specific plan and purpose for your life. When you seek His direction He is faithful to guide you.", prayer: "Father in the name of Jesus Christ I need your direction for my life. Show me clearly the path you have prepared for me. In the name of Jesus Christ. Amen." },
  tired: { keywords: ["tired","exhausted","weary","worn out","burnt out","drained","no energy","fatigued","rest"], verses: ["matthew 11:28","isaiah 40:31","psalm 23:2","mark 6:31","2 corinthians 12:9","galatians 6:9","psalm 127:2","exodus 33:14","isaiah 41:10","hebrews 12:3"], reflection: "God sees your weariness and He invites you to come to Him for rest. True rest is found in His presence.", prayer: "Father in the name of Jesus Christ I am tired and I need your rest. Restore my strength and renew my spirit. In the name of Jesus Christ. Amen." },
  fearful: { keywords: ["fearful","fear","scared","afraid","terrified","frightened","dread","phobia"], verses: ["2 timothy 1:7","psalm 27:1","isaiah 41:10","john 14:27","psalm 56:3","deuteronomy 31:6","romans 8:15","1 john 4:18","psalm 34:4","hebrews 13:6"], reflection: "Fear is real but God is greater than every fear you face. You can face anything with God by your side.", prayer: "Father in the name of Jesus Christ I reject the spirit of fear right now. You have given me a spirit of power love and a sound mind. In the name of Jesus Christ. Amen." },
  doubting: { keywords: ["doubt","doubting","weak faith","don't believe","questioning","not sure","wavering","struggling to believe"], verses: ["mark 9:24","hebrews 11:1","james 1:6","romans 10:17","matthew 14:31","john 20:27","jude 1:22","2 corinthians 5:7","psalm 73:26","luke 17:5"], reflection: "Even the disciples had moments of doubt. Bring your doubts honestly to God. He is not offended by your questions.", prayer: "Father in the name of Jesus Christ I bring my doubts to you honestly right now. Help my unbelief and strengthen my faith. In the name of Jesus Christ. Amen." },
  peace: { keywords: ["peace","calm","quiet","still","tranquil","settled","serenity"], verses: ["john 14:27","philippians 4:7","isaiah 26:3","psalm 46:10","numbers 6:26","romans 5:1","colossians 3:15","psalm 29:11","2 thessalonians 3:16","isaiah 32:17"], reflection: "The peace of God is available to you right now. It is not dependent on your circumstances.", prayer: "Father in the name of Jesus Christ fill me with your perfect peace right now. Guard my heart and my mind. In the name of Jesus Christ. Amen." },
  financial: { keywords: ["financial","money","broke","debt","bills","poor","struggling financially","no money","paycheck","provision"], verses: ["philippians 4:19","matthew 6:33","psalm 23:1","luke 12:24","2 corinthians 9:8","proverbs 3:9","malachi 3:10","psalm 37:25","isaiah 58:11","deuteronomy 8:18"], reflection: "God is your provider and He knows every financial need you have.", prayer: "Father in the name of Jesus Christ I trust you as my provider. I release my worry about money and trust that you will provide everything I need. In the name of Jesus Christ. Amen." },
  strength: { keywords: ["strength","strong","power","courage","bold","brave","overcome","victory","conquer","persevere"], verses: ["philippians 4:13","isaiah 40:29","psalm 46:1","2 corinthians 12:9","ephesians 6:10","joshua 1:9","psalm 18:32","isaiah 41:10","habakkuk 3:19","1 chronicles 16:11"], reflection: "God is your strength when you are weak. His power is made perfect in your weakness.", prayer: "Father in the name of Jesus Christ be my strength today. Fill me with your power and help me to overcome every obstacle. In the name of Jesus Christ. Amen." },
  worship: { keywords: ["worship","praise","glorify","honor","adore","magnify","exalt","hallelujah","thanksgiving"], verses: ["psalm 100:1","john 4:24","psalm 150:6","hebrews 13:15","revelation 4:11","psalm 95:6","isaiah 6:3","psalm 29:2","1 chronicles 29:11","psalm 34:1"], reflection: "God is worthy of all praise and worship. When we worship Him our perspective shifts from our problems to His greatness.", prayer: "Father in the name of Jesus Christ I worship you today. You are worthy of all praise honor and glory. Receive my worship today Lord. In the name of Jesus Christ. Amen." },
  unworthy: { keywords: ["unworthy","worthless","not good enough","failure","useless","nobody","don't deserve","inadequate"], verses: ["psalm 139:14","ephesians 2:10","romans 5:8","john 3:16","isaiah 43:4","1 peter 2:9","zephaniah 3:17","romans 8:37","galatians 3:26","1 john 3:1"], reflection: "You are not defined by your failures. God loved you so much that He sent His Son to die for you.", prayer: "Father in the name of Jesus Christ remind me of my worth in your eyes. Help me to see myself the way you see me. In the name of Jesus Christ. Amen." },
  addiction: { keywords: ["addiction","addicted","substance","alcohol","drugs","pornography","gambling","can't quit","bondage","chains"], verses: ["1 corinthians 10:13","john 8:36","galatians 5:1","romans 6:14","2 corinthians 5:17","philippians 4:13","romans 8:1","1 john 1:9","luke 4:18","psalm 107:14"], reflection: "Jesus came to set the captives free. No addiction is too powerful for God.", prayer: "Father in the name of Jesus Christ set me free from this addiction by the power of your Holy Spirit. In the name of Jesus Christ. Amen." },
  relationships: { keywords: ["relationship","marriage","husband","wife","family","friend","conflict","broken","divorce","partner"], verses: ["1 corinthians 13:4","colossians 3:13","ephesians 4:32","proverbs 17:17","matthew 18:20","romans 12:18","1 peter 4:8","ecclesiastes 4:9","john 15:13","psalm 133:1"], reflection: "God cares deeply about your relationships. He is the author of love and He can heal and restore what is broken.", prayer: "Father in the name of Jesus Christ I bring this relationship to you. Heal what is broken and help me to love the way you love. In the name of Jesus Christ. Amen." },
  forgiveness: { keywords: ["forgiveness","forgive","guilty","shame","regret","mistake","failed","messed up","repent"], verses: ["1 john 1:9","psalm 103:12","isaiah 43:25","romans 8:1","micah 7:19","ephesians 1:7","acts 3:19","hebrews 8:12","luke 15:20","psalm 32:5"], reflection: "God's forgiveness is complete and total. You do not have to carry guilt and shame any longer.", prayer: "Father in the name of Jesus Christ I confess my sins and receive your complete forgiveness. Thank you that there is no condemnation in Christ Jesus. In the name of Jesus Christ. Amen." }
};

const getEmotionCategory = (feeling) => {
  const lowerFeeling = feeling.toLowerCase();
  for (const [category, data] of Object.entries(emotionVerses)) {
    if (data.keywords.some(keyword => lowerFeeling.includes(keyword))) return { category, ...data };
  }
  return { category: "general", verses: ["psalm 46:1","john 3:16","romans 8:28","philippians 4:13","isaiah 41:10"], reflection: "Whatever you are going through right now God sees you and He cares deeply for you. Bring everything to Him and trust that He is working all things together for your good.", prayer: "Father in the name of Jesus Christ I come to you right now with everything on my heart. I trust you completely with my life. In the name of Jesus Christ. Amen." };
};

const fetchVerse = async (verseRef) => {
  try {
    const response = await fetch(`https://bible-api.com/${encodeURIComponent(verseRef)}?translation=kjv`);
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
  { id: "verse", label: "Verse", icon: "✨" },
  { id: "prayer", label: "Prayer", icon: "🙏" },
  { id: "vision", label: "Vision", icon: "📋" },
  { id: "sermon", label: "Sermon", icon: "📖" },
  { id: "salvation", label: "Jesus", icon: "✝️" },
];

const goalIcons = ["📖","🙏","✝️","⚡","❤️","🌟","🕊️","🔥","💪","🌿","🎯","👑"];

const getMilestone = (progress) => {
  if (progress >= 100) return { label: "Champion! 🏆", color: "#FFD700", bg: "#FFF8DC" };
  if (progress >= 75) return { label: "Gold 🥇", color: "#C9972A", bg: "#FDF8EE" };
  if (progress >= 50) return { label: "Silver 🥈", color: "#7A7A7A", bg: "#F5F5F5" };
  if (progress >= 25) return { label: "Bronze 🥉", color: "#CD7F32", bg: "#FFF5EE" };
  return null;
};

// ─── AUTH SCREEN ─────────────────────────────────────────────────────────────
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
        await createUserWithEmailAndPassword(auth, email.trim(), password);
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
// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(undefined);
  const [showAuth, setShowAuth] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const [feeling, setFeeling] = useState("");
  const [verseResult, setVerseResult] = useState(null);
  const [loadingVerse, setLoadingVerse] = useState(false);
  const [streak, setStreak] = useState(7);
  const [prayedIds, setPrayedIds] = useState([]);
  const [newPrayer, setNewPrayer] = useState("");
  const [prayerList, setPrayerList] = useState([]);
  const [prayerLoading, setPrayerLoading] = useState(true);
  const [streakLogged, setStreakLogged] = useState(false);
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

  // Vision Board State
  const [visionGoals, setVisionGoals] = useState([]);
  const [visionLoading, setVisionLoading] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalIcon, setNewGoalIcon] = useState("🎯");
  const [editingGoal, setEditingGoal] = useState(null);
  const [celebration, setCelebration] = useState(null);

  // ─── FIREBASE AUTH ────────────────────────────────────────────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return () => unsubscribe();
  }, []);

  // ─── LOAD PRAYER WALL ─────────────────────────────────────────────────────
  useEffect(() => {
    const q = query(collection(db, "prayerWall"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPrayerList(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setPrayerLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // ─── LOAD JOURNAL ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) { setJournalEntries([]); return; }
    setJournalLoading(true);
    const q = query(collection(db, "journals", user.uid, "entries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJournalEntries(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setJournalLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // ─── LOAD VISION GOALS ────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setVisionGoals([
        { id: "1", title: "Read the entire Bible", progress: 34, icon: "📖" },
        { id: "2", title: "Pray daily for 30 days", progress: 12, icon: "🙏" },
        { id: "3", title: "Memorize 10 scriptures", progress: 40, icon: "✝️" },
        { id: "4", title: "Fast once a week", progress: 60, icon: "⚡" },
      ]);
      setVisionLoading(false);
      return;
    }
    setVisionLoading(true);
    const q = query(collection(db, "visionGoals", user.uid, "goals"), orderBy("createdAt", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goals = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      if (goals.length === 0) {
        const defaults = [
          { title: "Read the entire Bible", progress: 0, icon: "📖", createdAt: new Date() },
          { title: "Pray daily for 30 days", progress: 0, icon: "🙏", createdAt: new Date() },
          { title: "Memorize 10 scriptures", progress: 0, icon: "✝️", createdAt: new Date() },
          { title: "Fast once a week", progress: 0, icon: "⚡", createdAt: new Date() },
        ];
        defaults.forEach(g => addDoc(collection(db, "visionGoals", user.uid, "goals"), g));
      } else {
        setVisionGoals(goals);
      }
      setVisionLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  const todayVerse = dailyVerses[new Date().getDay() % dailyVerses.length];

  const getVerse = async () => {
    if (!feeling.trim()) return;
    setLoadingVerse(true);
    setVerseResult(null);
    try {
      const emotion = getEmotionCategory(feeling);
      const fetchedVerses = [];
      for (const ref of emotion.verses) {
        const verseData = await fetchVerse(ref);
        if (verseData) fetchedVerses.push(`${verseData.reference} — ${verseData.text}`);
      }
      setVerseResult({ verses: fetchedVerses.length > 0 ? fetchedVerses : emotion.verses, reflection: emotion.reflection, prayer: emotion.prayer });
    } catch {
      setVerseResult({ verses: ["Psalm 46:1 — God is our refuge and strength, an ever-present help in trouble."], reflection: "Whatever you are facing today God is your refuge and strength.", prayer: "Father in the name of Jesus Christ be my refuge and strength today. In the name of Jesus Christ. Amen." });
    }
    setLoadingVerse(false);
  };

  const openTopic = (topic) => { setSelectedTopic(topic); setTopicContent(getSermonContent(topic)); };
  const filteredCategories = sermonSearch.trim() ? sermonCategories.map(cat => ({ ...cat, topics: cat.topics.filter(t => t.toLowerCase().includes(sermonSearch.toLowerCase())) })).filter(cat => cat.topics.length > 0) : sermonCategories;
  const logPrayer = () => { if (!streakLogged) { setStreak(s => s + 1); setStreakLogged(true); } };

  const submitPrayer = async () => {
    if (!newPrayer.trim()) return;
    try {
      await addDoc(collection(db, "prayerWall"), { name: user ? user.email.split("@")[0] : "Guest", request: newPrayer.trim(), time: "Just now", prayed: 0, createdAt: new Date() });
      setNewPrayer("");
    } catch (err) { console.error(err); }
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
    try {
      await addDoc(collection(db, "journals", user.uid, "entries"), { title: journalTitle || "My Prayer", text: journalEntry.trim(), date, createdAt: new Date() });
      setJournalTitle(""); setJournalEntry("");
    } catch (err) { console.error(err); }
  };

  const submitTestimony = () => {
    if (!testimony.trim()) return;
    setTestimonies(prev => [{ text: testimony, time: "Just now" }, ...prev]);
    setTestimony("");
  };

  // ─── VISION BOARD FUNCTIONS ───────────────────────────────────────────────
  const addGoal = async () => {
    if (!newGoalTitle.trim()) return;
    if (!user) { setShowAuth(true); return; }
    try {
      await addDoc(collection(db, "visionGoals", user.uid, "goals"), { title: newGoalTitle.trim(), icon: newGoalIcon, progress: 0, createdAt: new Date() });
      setNewGoalTitle(""); setNewGoalIcon("🎯"); setShowAddGoal(false);
    } catch (err) { console.error(err); }
  };

  const updateProgress = async (goalId, newProgress) => {
    const clamped = Math.min(100, Math.max(0, newProgress));
    const prev = visionGoals.find(g => g.id === goalId);
    if (prev && prev.progress < 100 && clamped === 100) {
      setCelebration(goalId);
      setTimeout(() => setCelebration(null), 4000);
    }
    if (user) {
      try { await updateDoc(doc(db, "visionGoals", user.uid, "goals", goalId), { progress: clamped }); } catch (err) { console.error(err); }
    } else {
      setVisionGoals(goals => goals.map(g => g.id === goalId ? { ...g, progress: clamped } : g));
    }
  };

  const deleteGoal = async (goalId) => {
    if (user) {
      try { await deleteDoc(doc(db, "visionGoals", user.uid, "goals", goalId)); } catch (err) { console.error(err); }
    } else {
      setVisionGoals(goals => goals.filter(g => g.id !== goalId));
    }
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
    return (
      <div style={{ ...s.app, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>✝️</div>
        <p style={{ color: BROWN, fontStyle: "italic" }}>Loading Grace Daily...</p>
      </div>
    );
  }

  if (showAuth) return <AuthScreen onAuthSuccess={() => setShowAuth(false)} />;

  return (
    <div style={s.app}>
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

        {/* HOME */}
        {activeTab === "home" && (
          <div>
            <div style={s.cardGold}>
              <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>Today's Verse</p>
              <p style={{ color: WHITE, fontSize: 15, fontStyle: "italic", lineHeight: 1.7, margin: "0 0 10px" }}>"{todayVerse.text}"</p>
              <p style={{ color: GOLD_MID, fontSize: 13, fontFamily: "sans-serif", margin: 0, fontWeight: "bold" }}>— {todayVerse.ref}</p>
            </div>
            <div style={s.streakBox}>
              <div>
                <div style={{ fontSize: 36, fontWeight: "bold", color: WHITE }}>{streak}</div>
                <div style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif" }}>day streak 🔥</div>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: WHITE, fontSize: 13, margin: "0 0 8px", fontFamily: "sans-serif" }}>Keep your prayer streak going!</p>
                <button style={{ ...s.btnOutline, color: WHITE, borderColor: WHITE, fontSize: 12, padding: "6px 14px" }} onClick={logPrayer}>{streakLogged ? "✓ Logged today" : "Log today's prayer"}</button>
              </div>
            </div>
            {!user && (
              <div style={{ ...s.card, border: `2px solid ${GOLD_MID}`, background: GOLD_LIGHT }}>
                <p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 6px" }}>✝️ Save Your Progress</p>
                <p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px", lineHeight: 1.5 }}>Create a free account to save your prayer streak, journal entries, vision goals, and more.</p>
                <button style={s.btn} onClick={() => setShowAuth(true)}>Create Free Account →</button>
              </div>
            )}
            <div style={s.card}>
              <p style={{ ...s.sectionTitle, fontSize: 15, marginBottom: 8 }}>Quick Actions</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {[["✨","Verse for\nmy mood","verse"],["🙏","Pray with\nothers","prayer"],["📋","My faith\ngoals","vision"],["📖","Sermon\ntopics","sermon"]].map(([icon, label, tab]) => (
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

        {/* VERSE */}
        {activeTab === "verse" && (
          <div>
            <p style={s.sectionTitle}>✨ Verse of the Moment</p>
            <div style={s.card}>
              <p style={{ color: BROWN, fontSize: 14, marginBottom: 10, lineHeight: 1.5 }}>How are you feeling right now? Tell God — and let His Word speak directly to your heart.</p>
              <textarea style={{ ...s.input, minHeight: 80, resize: "none" }} placeholder="I am feeling anxious about tomorrow..." value={feeling} onChange={e => setFeeling(e.target.value)} />
              <button style={s.btn} onClick={getVerse} disabled={loadingVerse}>{loadingVerse ? "Finding your verse..." : "Find My Verse →"}</button>
            </div>
            {loadingVerse && (<div style={{ ...s.card, textAlign: "center", padding: 24 }}><div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div><p style={{ color: BROWN, fontSize: 14, fontStyle: "italic" }}>Seeking a word from the Lord for you...</p></div>)}
            {verseResult && (
              <div>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 8px", letterSpacing: 1, textTransform: "uppercase" }}>Scriptures for You</p>
                  {verseResult.verses.map((v, i) => (
                    <div key={i} style={{ borderBottom: i < verseResult.verses.length - 1 ? `1px solid ${GOLD}44` : "none", paddingBottom: i < verseResult.verses.length - 1 ? 12 : 0, marginBottom: i < verseResult.verses.length - 1 ? 12 : 0 }}>
                      <p style={{ color: WHITE, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"{v}"</p>
                    </div>
                  ))}
                </div>
                <div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 6, fontFamily: "sans-serif" }}>Reflection</p><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{verseResult.reflection}</p></div>
                <div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>Prayer for You</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{verseResult.prayer}</p></div>
              </div>
            )}
          </div>
        )}

        {/* PRAYER */}
        {activeTab === "prayer" && (
          <div>
            <p style={s.sectionTitle}>🙏 Prayer</p>
            <div style={{ display: "flex", background: WHITE, borderRadius: 12, padding: 4, marginBottom: 16, border: `1px solid ${GOLD_LIGHT}` }}>
              {[["how","🙏 How to Pray"],["wall","👥 Wall"],["journal","📓 Journal"],["answered","✅ Answered"]].map(([id, label]) => (
                <button key={id} onClick={() => setPrayerTab(id)} style={{ flex: 1, padding: "8px 2px", border: "none", borderRadius: 10, background: prayerTab === id ? `linear-gradient(135deg, ${GOLD}, ${BROWN})` : "none", color: prayerTab === id ? WHITE : BROWN, fontSize: 10, fontFamily: "sans-serif", fontWeight: prayerTab === id ? "bold" : "normal", cursor: "pointer", lineHeight: 1.3 }}>
                  {label}
                </button>
              ))}
            </div>

            {prayerTab === "how" && (
              <div>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>The Lord's Prayer</p>
                  <h2 style={{ color: WHITE, fontSize: 18, margin: "0 0 8px" }}>Matthew 6:9-13</h2>
                  <p style={{ color: GOLD_LIGHT, fontSize: 13, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>"Our Father in heaven, hallowed be your name, your kingdom come, your will be done, on earth as it is in heaven. Give us today our daily bread. And forgive us our debts, as we also have forgiven our debtors. And lead us not into temptation, but deliver us from the evil one."</p>
                </div>
                {[
                  { phrase: "Our Father in heaven", section: "ADORATION", icon: "👑", explanation: "Begin by acknowledging who God is — your Father, your Creator, the One who loves you unconditionally. Start every prayer with worship before requests. Simply say: Father, I love you. You are holy and worthy of all praise." },
                  { phrase: "Your kingdom come, your will be done", section: "SURRENDER", icon: "🙌", explanation: "This is where you surrender your plans to God's plans. You are saying: God, I trust you more than I trust myself. Have your way in my life today. This is one of the most powerful things you can pray." },
                  { phrase: "Give us today our daily bread", section: "PETITION", icon: "🙏", explanation: "Bring your needs to God — provision, health, relationships, finances, direction. God invites you to ask specifically. He is your Father and He delights in providing for His children. Be bold and be specific." },
                  { phrase: "Forgive us our debts as we forgive others", section: "CONFESSION", icon: "💛", explanation: "Confession keeps communication open between you and God. Be honest about where you have fallen short. Then choose to forgive anyone who has wronged you — releasing them is what frees you." },
                  { phrase: "Lead us not into temptation", section: "PROTECTION", icon: "🛡️", explanation: "Ask God for protection over your mind, your family, your home and your future. Declare His protection over your life. The enemy is real but God is greater than anything you face." },
                ].map((item, i) => (
                  <div key={i} style={s.card}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{item.icon}</span>
                      <div>
                        <p style={{ color: GOLD, fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold", letterSpacing: 1, margin: 0 }}>{item.section}</p>
                        <p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "2px 0 0", fontStyle: "italic" }}>"{item.phrase}"</p>
                      </div>
                    </div>
                    <p style={{ color: BROWN, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{item.explanation}</p>
                  </div>
                ))}
                <div style={{ ...s.card, background: GOLD_LIGHT }}>
                  <p style={{ color: BROWN, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif", marginBottom: 8 }}>🙏 Pray This Now</p>
                  <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.8, margin: 0 }}>"Father in the name of Jesus Christ I come to you right now. You are holy and worthy of all praise. I surrender my plans to your perfect will. I bring my needs before you and trust you to provide. I confess my sins and I choose to forgive those who have wronged me. Protect my mind, my family and my future. Your kingdom come, your will be done in my life today. In the name of Jesus Christ. Amen."</p>
                </div>
              </div>
            )}

            {prayerTab === "wall" && (
              <div>
                <div style={s.card}>
                  <p style={{ color: BROWN, fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>Share your prayer request with the community. You are not alone. 🙏</p>
                  <textarea style={{ ...s.input, minHeight: 70, resize: "none" }} placeholder="Share your prayer request..." value={newPrayer} onChange={e => setNewPrayer(e.target.value)} />
                  <button style={s.btn} onClick={submitPrayer}>Submit Prayer Request</button>
                </div>
                <p style={{ color: BROWN, fontSize: 13, fontFamily: "sans-serif", marginBottom: 8, fontWeight: "bold" }}>Community Prayer Wall</p>
                {prayerLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading prayers... 🙏</p></div>}
                {!prayerLoading && prayerList.length === 0 && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Be the first to share a prayer request. 🙏</p></div>}
                {prayerList.map((r) => (
                  <div key={r.id} style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                      <span style={s.tag}>{r.name}</span>
                      <span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif" }}>{r.time}</span>
                    </div>
                    <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: "0 0 10px" }}>{r.request}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ color: BROWN + "99", fontSize: 12, fontFamily: "sans-serif" }}>🙏 {r.prayed} people prayed</span>
                      <button style={{ ...s.btnOutline, padding: "6px 14px", fontSize: 12 }} onClick={() => prayFor(r.id)}>{prayedIds.includes(r.id) ? "✓ Prayed" : "Pray for them"}</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {prayerTab === "journal" && (
              <div>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Your Private Space</p>
                  <h2 style={{ color: WHITE, fontSize: 18, margin: "0 0 6px" }}>📓 Prayer Journal</h2>
                  <p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0 }}>Write your prayers to God. This is between you and Him.</p>
                </div>
                {!user && (
                  <div style={{ ...s.card, background: GOLD_LIGHT, border: `2px solid ${GOLD_MID}` }}>
                    <p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 6px" }}>🔒 Sign In to Use Your Journal</p>
                    <p style={{ color: BROWN, fontSize: 13, margin: "0 0 10px" }}>Create a free account to save your private prayer journal forever.</p>
                    <button style={s.btn} onClick={() => setShowAuth(true)}>Sign In or Create Account →</button>
                  </div>
                )}
                {user && (
                  <div style={s.card}>
                    <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>New Prayer Entry</p>
                    <input style={{ ...s.input, marginBottom: 10 }} placeholder="Title — e.g. Trusting God with my finances" value={journalTitle} onChange={e => setJournalTitle(e.target.value)} />
                    <textarea style={{ ...s.input, minHeight: 100, resize: "none" }} placeholder="Write your prayer here... be completely honest with God about everything on your heart." value={journalEntry} onChange={e => setJournalEntry(e.target.value)} />
                    <button style={s.btn} onClick={submitJournal}>Save Prayer Entry</button>
                  </div>
                )}
                {journalLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading your journal... 🙏</p></div>}
                {!journalLoading && journalEntries.length === 0 && user && (
                  <div style={{ ...s.card, textAlign: "center", padding: 28 }}>
                    <div style={{ fontSize: 32, marginBottom: 10 }}>📓</div>
                    <p style={{ color: BROWN, fontSize: 14, fontStyle: "italic", lineHeight: 1.6, margin: 0 }}>Your prayer journal is empty. Write your first prayer to God today. He is listening.</p>
                  </div>
                )}
                {journalEntries.map((entry) => (
                  <div key={entry.id} style={s.card}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                      <p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>{entry.title}</p>
                      <span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif", flexShrink: 0, marginLeft: 8 }}>{entry.date}</span>
                    </div>
                    <p style={{ color: BROWN, fontSize: 13, lineHeight: 1.7, margin: 0, fontStyle: "italic" }}>{entry.text}</p>
                  </div>
                ))}
              </div>
            )}

            {prayerTab === "answered" && (
              <div>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>God is Faithful</p>
                  <h2 style={{ color: WHITE, fontSize: 18, margin: "0 0 6px" }}>✅ Answered Prayers</h2>
                  <p style={{ color: GOLD_LIGHT, fontSize: 13, margin: 0 }}>Share how God answered your prayer and encourage the whole community.</p>
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>Share Your Testimony</p>
                  <textarea style={{ ...s.input, minHeight: 80, resize: "none" }} placeholder="How did God answer your prayer? Share your testimony..." value={testimony} onChange={e => setTestimony(e.target.value)} />
                  <button style={s.btn} onClick={submitTestimony}>Share Testimony 🙌</button>
                </div>
                {testimonies.map((t, i) => (
                  <div key={i} style={{ ...s.card, border: `1.5px solid ${GOLD_MID}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ ...s.tag, background: GOLD, color: WHITE }}>✅ God Answered</span>
                      <span style={{ color: BROWN + "99", fontSize: 11, fontFamily: "sans-serif" }}>{t.time}</span>
                    </div>
                    <p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{t.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* VISION BOARD */}
        {activeTab === "vision" && (
          <div>
            <p style={s.sectionTitle}>📋 Faith Vision Board</p>

            <div style={s.card}>
              <p style={{ color: BROWN, fontSize: 13, lineHeight: 1.5, margin: 0 }}>Track your spiritual goals and celebrate every milestone. God sees every step of faith you take! 🙌</p>
            </div>

            {visionLoading && <div style={{ ...s.card, textAlign: "center", padding: 24 }}><p style={{ color: BROWN, fontStyle: "italic" }}>Loading your goals... 🙏</p></div>}

            {visionGoals.map(g => {
              const milestone = getMilestone(g.progress);
              const isCelebrating = celebration === g.id;
              return (
                <div key={g.id} style={{ ...s.card, border: isCelebrating ? `2px solid ${GOLD}` : `1px solid ${GOLD_LIGHT}`, background: isCelebrating ? "#FFFDF0" : WHITE }}>
                  {isCelebrating && (
                    <div style={{ textAlign: "center", padding: "10px 0 14px", borderBottom: `1px solid ${GOLD_LIGHT}`, marginBottom: 14 }}>
                      <div style={{ fontSize: 32 }}>🎉🏆🎉</div>
                      <p style={{ color: GOLD, fontSize: 15, fontWeight: "bold", margin: "6px 0 2px", fontFamily: "sans-serif" }}>GOAL COMPLETE!</p>
                      <p style={{ color: BROWN, fontSize: 13, margin: 0 }}>You did it! To God be the glory! 🙌</p>
                    </div>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 26 }}>{g.icon}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: 0 }}>{g.title}</p>
                      {milestone && (
                        <span style={{ display: "inline-block", background: milestone.bg, color: milestone.color, borderRadius: 20, padding: "2px 10px", fontSize: 11, fontFamily: "sans-serif", fontWeight: "bold", marginTop: 4 }}>
                          {milestone.label}
                        </span>
                      )}
                    </div>
                    <span style={{ color: GOLD, fontSize: 16, fontWeight: "bold", fontFamily: "sans-serif" }}>{g.progress}%</span>
                  </div>

                  <div style={s.progressBg}>
                    <div style={{ height: 10, borderRadius: 6, background: g.progress >= 100 ? "#FFD700" : `linear-gradient(90deg, ${GOLD}, ${BROWN})`, width: `${g.progress}%`, transition: "width 0.3s ease" }} />
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                    <span style={{ color: BROWN, fontSize: 11, fontFamily: "sans-serif", flexShrink: 0 }}>0%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={g.progress}
                      onChange={e => updateProgress(g.id, parseInt(e.target.value))}
                      style={{ flex: 1, accentColor: GOLD, cursor: "pointer" }}
                    />
                    <span style={{ color: BROWN, fontSize: 11, fontFamily: "sans-serif", flexShrink: 0 }}>100%</span>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => updateProgress(g.id, Math.max(0, g.progress - 5))} style={{ ...s.btnSmall, flex: 1, textAlign: "center" }}>-5%</button>
                    <button onClick={() => updateProgress(g.id, Math.min(100, g.progress + 5))} style={{ ...s.btnSmall, flex: 1, textAlign: "center", background: GOLD_LIGHT }}>+5%</button>
                    <button onClick={() => updateProgress(g.id, Math.min(100, g.progress + 10))} style={{ ...s.btnSmall, flex: 1, textAlign: "center", background: GOLD_LIGHT }}>+10%</button>
                    <button onClick={() => deleteGoal(g.id)} style={{ ...s.btnSmall, color: "#cc0000", borderColor: "#ffcccc", background: "#fff5f5" }}>🗑️</button>
                  </div>
                </div>
              );
            })}

            {!showAddGoal ? (
              <button style={{ ...s.card, textAlign: "center", border: `2px dashed ${GOLD_MID}`, background: "none", cursor: "pointer", width: "100%", padding: 16 }} onClick={() => setShowAddGoal(true)}>
                <p style={{ color: GOLD, fontSize: 15, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>+ Add a New Faith Goal</p>
              </button>
            ) : (
              <div style={s.card}>
                <p style={{ color: GOLD, fontSize: 14, fontWeight: "bold", marginBottom: 12, fontFamily: "sans-serif" }}>New Faith Goal</p>
                <input style={{ ...s.input, marginBottom: 10 }} placeholder="e.g. Read the entire Bible" value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} />
                <p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", marginBottom: 8 }}>Choose an icon:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {goalIcons.map(icon => (
                    <button key={icon} onClick={() => setNewGoalIcon(icon)} style={{ fontSize: 22, background: newGoalIcon === icon ? GOLD_LIGHT : "none", border: newGoalIcon === icon ? `2px solid ${GOLD}` : `1px solid ${GOLD_LIGHT}`, borderRadius: 10, padding: "6px 8px", cursor: "pointer" }}>
                      {icon}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button style={{ ...s.btn, flex: 1, marginTop: 0 }} onClick={addGoal}>Add Goal</button>
                  <button style={{ ...s.btnOutline, flex: 1 }} onClick={() => setShowAddGoal(false)}>Cancel</button>
                </div>
              </div>
            )}

            <div style={{ ...s.card, background: GOLD_LIGHT, marginTop: 4 }}>
              <p style={{ color: BROWN_DARK, fontSize: 13, fontWeight: "bold", margin: "0 0 6px" }}>🏆 Milestone Badges</p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {[["25%","Bronze 🥉","#CD7F32"],["50%","Silver 🥈","#7A7A7A"],["75%","Gold 🥇","#C9972A"],["100%","Champion 🏆","#FFD700"]].map(([pct, label, color]) => (
                  <div key={pct} style={{ background: WHITE, borderRadius: 10, padding: "6px 12px", border: `1px solid ${GOLD_LIGHT}` }}>
                    <p style={{ color, fontSize: 12, fontWeight: "bold", margin: 0, fontFamily: "sans-serif" }}>{pct} — {label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SERMON */}
        {activeTab === "sermon" && (
          <div>
            {selectedTopic && topicContent ? (
              <div>
                <button style={s.backBtn} onClick={() => { setSelectedTopic(null); setTopicContent(null); }}>← Back to Topics</button>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Sermon Companion</p>
                  <h2 style={{ color: WHITE, fontSize: 20, margin: 0 }}>{selectedTopic}</h2>
                </div>
                <div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>📝 Main Message</p><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.7, margin: 0 }}>{topicContent.mainMessage}</p></div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>🔑 Key Takeaways</p>
                  {topicContent.keyTakeaways.map((t, i) => (<div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}><div style={{ ...s.stepNum, width: 24, height: 24, fontSize: 12 }}>{i + 1}</div><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{t}</p></div>))}
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>📖 Related Scriptures</p>
                  {topicContent.scriptures.map((sc, i) => (<div key={i} style={{ marginBottom: 8, paddingBottom: 8, borderBottom: i < topicContent.scriptures.length - 1 ? `1px solid ${GOLD_LIGHT}` : "none" }}><p style={{ color: BROWN_DARK, fontSize: 13, lineHeight: 1.5, margin: 0 }}>📌 {sc}</p></div>))}
                </div>
                <div style={s.card}>
                  <p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>❓ Discussion Questions</p>
                  {topicContent.discussionQuestions.map((q, i) => (<div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "flex-start" }}><div style={{ ...s.stepNum, width: 24, height: 24, fontSize: 12 }}>{i + 1}</div><p style={{ color: BROWN_DARK, fontSize: 14, lineHeight: 1.6, margin: 0, flex: 1 }}>{q}</p></div>))}
                </div>
                <div style={{ ...s.card, background: GOLD_LIGHT }}><p style={{ color: BROWN, fontSize: 12, fontFamily: "sans-serif", fontWeight: "bold", marginBottom: 6, letterSpacing: 1, textTransform: "uppercase" }}>🙏 Application Prayer</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{topicContent.prayer}</p></div>
                <div style={s.card}><p style={{ color: GOLD, fontSize: 13, fontWeight: "bold", marginBottom: 8, fontFamily: "sans-serif" }}>✍️ Journal Prompt</p><p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.7, margin: 0 }}>{topicContent.journal}</p></div>
                <button style={{ ...s.btn, marginBottom: 16 }} onClick={() => { setSelectedTopic(null); setTopicContent(null); }}>← Back to Topics</button>
              </div>
            ) : selectedCategory ? (
              <div>
                <button style={s.backBtn} onClick={() => setSelectedCategory(null)}>← All Categories</button>
                <div style={s.cardGold}>
                  <p style={{ color: GOLD_LIGHT, fontSize: 11, fontFamily: "sans-serif", margin: "0 0 6px", letterSpacing: 1, textTransform: "uppercase" }}>Category</p>
                  <h2 style={{ color: WHITE, fontSize: 20, margin: 0 }}>{selectedCategory.icon} {selectedCategory.category}</h2>
                </div>
                <div style={s.card}>
                  <p style={{ color: BROWN, fontSize: 13, marginBottom: 12, fontFamily: "sans-serif" }}>Select a topic to go deeper:</p>
                  <div style={{ display: "flex", flexWrap: "wrap" }}>{selectedCategory.topics.map(topic => (<button key={topic} style={s.btnSmall} onClick={() => openTopic(topic)}>{topic}</button>))}</div>
                </div>
              </div>
            ) : (
              <div>
                <p style={s.sectionTitle}>📖 Sermon Companion</p>
                <div style={s.card}>
                  <p style={{ color: BROWN, fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>Search any topic or browse by category to go deeper in God's Word.</p>
                  <input style={s.input} placeholder="Search topics — Faith, Fear, Marriage..." value={sermonSearch} onChange={e => setSermonSearch(e.target.value)} />
                </div>
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

        {/* SALVATION */}
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
                  <div><p style={{ color: BROWN_DARK, fontSize: 14, fontWeight: "bold", margin: "0 0 4px" }}>{st.title}</p><p style={{ color: BROWN, fontSize: 13, lineHeight: 1.6, margin: 0 }}>{st.desc}</p></div>
                </div>
              ))}
            </div>
            <div style={{ ...s.card, background: GOLD_LIGHT }}>
              <p style={{ color: BROWN, fontSize: 13, fontWeight: "bold", fontFamily: "sans-serif", marginBottom: 8 }}>Receive Salvation</p>
              <p style={{ color: BROWN_DARK, fontSize: 14, fontStyle: "italic", lineHeight: 1.8 }}>"Father in the name of Jesus Christ I confess with my mouth that Jesus is Lord and I believe in my heart that God raised Him from the dead. I repent of my sins and I receive Jesus Christ as my Lord and Savior. I commit to deny myself pick up my cross daily and follow Him. In the name of Jesus Christ. Amen."</p>
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
          <button key={t.id} style={s.navBtn} onClick={() => { setActiveTab(t.id); setSelectedTopic(null); setTopicContent(null); setSelectedCategory(null); }}>
            <span style={{ fontSize: 18 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: activeTab === t.id ? GOLD_MID : GOLD_LIGHT + "99", fontFamily: "sans-serif", fontWeight: activeTab === t.id ? "bold" : "normal" }}>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
