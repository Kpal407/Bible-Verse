export interface Verse {
  id: string;
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  iconFamily: "Ionicons" | "MaterialCommunityIcons" | "Feather" | "MaterialIcons";
  gradient: [string, string];
  verses: Verse[];
}

const categories: Category[] = [
  {
    id: "daily-devotional",
    name: "Daily Devotional",
    description: "Start your day with God's word",
    icon: "sunny-outline",
    iconFamily: "Ionicons",
    gradient: ["#D4A95A", "#C8954C"],
    verses: [
      { id: "dd1", reference: "Psalm 118:24", text: "This is the day that the Lord has made; let us rejoice and be glad in it.", book: "Psalms", chapter: 118, verse: "24" },
      { id: "dd2", reference: "Lamentations 3:22-23", text: "The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.", book: "Lamentations", chapter: 3, verse: "22-23" },
      { id: "dd3", reference: "Proverbs 3:5-6", text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.", book: "Proverbs", chapter: 3, verse: "5-6" },
      { id: "dd4", reference: "Psalm 19:14", text: "Let the words of my mouth and the meditation of my heart be acceptable in your sight, O Lord, my rock and my redeemer.", book: "Psalms", chapter: 19, verse: "14" },
      { id: "dd5", reference: "Joshua 1:9", text: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.", book: "Joshua", chapter: 1, verse: "9" },
      { id: "dd6", reference: "Philippians 4:13", text: "I can do all things through him who strengthens me.", book: "Philippians", chapter: 4, verse: "13" },
      { id: "dd7", reference: "Romans 8:28", text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.", book: "Romans", chapter: 8, verse: "28" },
      { id: "dd8", reference: "Isaiah 40:31", text: "But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.", book: "Isaiah", chapter: 40, verse: "31" },
      { id: "dd9", reference: "Matthew 6:33", text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you.", book: "Matthew", chapter: 6, verse: "33" },
      { id: "dd10", reference: "Psalm 46:10", text: "Be still, and know that I am God. I will be exalted among the nations, I will be exalted in the earth!", book: "Psalms", chapter: 46, verse: "10" },
    ],
  },
  {
    id: "loss-grief",
    name: "Loss & Grief",
    description: "Comfort in times of sorrow",
    icon: "heart-outline",
    iconFamily: "Ionicons",
    gradient: ["#6B7FA3", "#4A5F82"],
    verses: [
      { id: "lg1", reference: "Psalm 34:18", text: "The Lord is near to the brokenhearted and saves the crushed in spirit.", book: "Psalms", chapter: 34, verse: "18" },
      { id: "lg2", reference: "Revelation 21:4", text: "He will wipe away every tear from their eyes, and death shall be no more, neither shall there be mourning, nor crying, nor pain anymore, for the former things have passed away.", book: "Revelation", chapter: 21, verse: "4" },
      { id: "lg3", reference: "Matthew 5:4", text: "Blessed are those who mourn, for they shall be comforted.", book: "Matthew", chapter: 5, verse: "4" },
      { id: "lg4", reference: "Psalm 147:3", text: "He heals the brokenhearted and binds up their wounds.", book: "Psalms", chapter: 147, verse: "3" },
      { id: "lg5", reference: "John 14:27", text: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.", book: "John", chapter: 14, verse: "27" },
      { id: "lg6", reference: "2 Corinthians 1:3-4", text: "Blessed be the God and Father of our Lord Jesus Christ, the Father of mercies and God of all comfort, who comforts us in all our affliction.", book: "2 Corinthians", chapter: 1, verse: "3-4" },
      { id: "lg7", reference: "Romans 8:38-39", text: "For I am sure that neither death nor life, nor angels nor rulers, nor things present nor things to come, nor powers, nor height nor depth, nor anything else in all creation, will be able to separate us from the love of God in Christ Jesus our Lord.", book: "Romans", chapter: 8, verse: "38-39" },
      { id: "lg8", reference: "1 Thessalonians 4:13-14", text: "But we do not want you to be uninformed, brothers, about those who are asleep, that you may not grieve as others do who have no hope. For since we believe that Jesus died and rose again, even so, through Jesus, God will bring with him those who have fallen asleep.", book: "1 Thessalonians", chapter: 4, verse: "13-14" },
    ],
  },
  {
    id: "personal-strength",
    name: "Personal Strength",
    description: "Finding courage and resilience",
    icon: "shield-checkmark-outline",
    iconFamily: "Ionicons",
    gradient: ["#5B8A72", "#3D6B54"],
    verses: [
      { id: "ps1", reference: "Isaiah 41:10", text: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.", book: "Isaiah", chapter: 41, verse: "10" },
      { id: "ps2", reference: "Philippians 4:13", text: "I can do all things through him who strengthens me.", book: "Philippians", chapter: 4, verse: "13" },
      { id: "ps3", reference: "Deuteronomy 31:6", text: "Be strong and courageous. Do not fear or be in dread of them, for it is the Lord your God who goes with you. He will not leave you or forsake you.", book: "Deuteronomy", chapter: 31, verse: "6" },
      { id: "ps4", reference: "2 Timothy 1:7", text: "For God gave us a spirit not of fear but of power and love and self-control.", book: "2 Timothy", chapter: 1, verse: "7" },
      { id: "ps5", reference: "Psalm 27:1", text: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?", book: "Psalms", chapter: 27, verse: "1" },
      { id: "ps6", reference: "Ephesians 6:10", text: "Finally, be strong in the Lord and in the strength of his might.", book: "Ephesians", chapter: 6, verse: "10" },
      { id: "ps7", reference: "Psalm 46:1", text: "God is our refuge and strength, a very present help in trouble.", book: "Psalms", chapter: 46, verse: "1" },
      { id: "ps8", reference: "Nehemiah 8:10", text: "Do not be grieved, for the joy of the Lord is your strength.", book: "Nehemiah", chapter: 8, verse: "10" },
    ],
  },
  {
    id: "illness-healing",
    name: "Illness & Healing",
    description: "Hope during health struggles",
    icon: "leaf-outline",
    iconFamily: "Ionicons",
    gradient: ["#7AADBA", "#5A8D9A"],
    verses: [
      { id: "ih1", reference: "Jeremiah 17:14", text: "Heal me, O Lord, and I shall be healed; save me, and I shall be saved, for you are my praise.", book: "Jeremiah", chapter: 17, verse: "14" },
      { id: "ih2", reference: "Psalm 103:2-3", text: "Bless the Lord, O my soul, and forget not all his benefits, who forgives all your iniquity, who heals all your diseases.", book: "Psalms", chapter: 103, verse: "2-3" },
      { id: "ih3", reference: "James 5:15", text: "And the prayer of faith will save the one who is sick, and the Lord will raise him up. And if he has committed sins, he will be forgiven.", book: "James", chapter: 5, verse: "15" },
      { id: "ih4", reference: "Isaiah 53:5", text: "But he was pierced for our transgressions; he was crushed for our iniquities; upon him was the chastisement that brought us peace, and with his wounds we are healed.", book: "Isaiah", chapter: 53, verse: "5" },
      { id: "ih5", reference: "Psalm 41:3", text: "The Lord sustains him on his sickbed; in his illness you restore him to full health.", book: "Psalms", chapter: 41, verse: "3" },
      { id: "ih6", reference: "3 John 1:2", text: "Beloved, I pray that all may go well with you and that you may be in good health, as it goes well with your soul.", book: "3 John", chapter: 1, verse: "2" },
      { id: "ih7", reference: "Exodus 23:25", text: "You shall serve the Lord your God, and he will bless your bread and your water, and I will take sickness away from among you.", book: "Exodus", chapter: 23, verse: "25" },
    ],
  },
  {
    id: "divorce-separation",
    name: "Divorce & Separation",
    description: "Peace through difficult seasons",
    icon: "hand-left-outline",
    iconFamily: "Ionicons",
    gradient: ["#9B7DB8", "#7D5FA0"],
    verses: [
      { id: "ds1", reference: "Psalm 34:17-18", text: "When the righteous cry for help, the Lord hears and delivers them out of all their troubles. The Lord is near to the brokenhearted and saves the crushed in spirit.", book: "Psalms", chapter: 34, verse: "17-18" },
      { id: "ds2", reference: "Jeremiah 29:11", text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.", book: "Jeremiah", chapter: 29, verse: "11" },
      { id: "ds3", reference: "Isaiah 43:18-19", text: "Remember not the former things, nor consider the things of old. Behold, I am doing a new thing; now it springs forth, do you not perceive it? I will make a way in the wilderness and rivers in the desert.", book: "Isaiah", chapter: 43, verse: "18-19" },
      { id: "ds4", reference: "Psalm 55:22", text: "Cast your burden on the Lord, and he will sustain you; he will never permit the righteous to be moved.", book: "Psalms", chapter: 55, verse: "22" },
      { id: "ds5", reference: "2 Corinthians 5:17", text: "Therefore, if anyone is in Christ, he is a new creation. The old has passed away; behold, the new has come.", book: "2 Corinthians", chapter: 5, verse: "17" },
      { id: "ds6", reference: "Psalm 73:26", text: "My flesh and my heart may fail, but God is the strength of my heart and my portion forever.", book: "Psalms", chapter: 73, verse: "26" },
    ],
  },
  {
    id: "helping-others",
    name: "Helping Others",
    description: "Serving with a generous spirit",
    icon: "people-outline",
    iconFamily: "Ionicons",
    gradient: ["#E8A87C", "#D4845A"],
    verses: [
      { id: "ho1", reference: "Galatians 6:2", text: "Bear one another's burdens, and so fulfill the law of Christ.", book: "Galatians", chapter: 6, verse: "2" },
      { id: "ho2", reference: "Hebrews 13:16", text: "Do not neglect to do good and to share what you have, for such sacrifices are pleasing to God.", book: "Hebrews", chapter: 13, verse: "16" },
      { id: "ho3", reference: "Matthew 25:40", text: "And the King will answer them, 'Truly, I say to you, as you did it to one of the least of these my brothers, you did it to me.'", book: "Matthew", chapter: 25, verse: "40" },
      { id: "ho4", reference: "Proverbs 19:17", text: "Whoever is generous to the poor lends to the Lord, and he will repay him for his deed.", book: "Proverbs", chapter: 19, verse: "17" },
      { id: "ho5", reference: "1 Peter 4:10", text: "As each has received a gift, use it to serve one another, as good stewards of God's varied grace.", book: "1 Peter", chapter: 4, verse: "10" },
      { id: "ho6", reference: "Acts 20:35", text: "In all things I have shown you that by working hard in this way we must help the weak and remember the words of the Lord Jesus, how he himself said, 'It is more blessed to give than to receive.'", book: "Acts", chapter: 20, verse: "35" },
      { id: "ho7", reference: "James 2:15-16", text: "If a brother or sister is poorly clothed and lacking in daily food, and one of you says to them, 'Go in peace, be warmed and filled,' without giving them the things needed for the body, what good is that?", book: "James", chapter: 2, verse: "15-16" },
    ],
  },
  {
    id: "giving",
    name: "Giving & Generosity",
    description: "The joy of a generous heart",
    icon: "gift-outline",
    iconFamily: "Ionicons",
    gradient: ["#C97B63", "#A85D47"],
    verses: [
      { id: "gv1", reference: "2 Corinthians 9:7", text: "Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver.", book: "2 Corinthians", chapter: 9, verse: "7" },
      { id: "gv2", reference: "Proverbs 11:25", text: "Whoever brings blessing will be enriched, and one who waters will himself be watered.", book: "Proverbs", chapter: 11, verse: "25" },
      { id: "gv3", reference: "Luke 6:38", text: "Give, and it will be given to you. Good measure, pressed down, shaken together, running over, will be put into your lap. For with the measure you use it will be measured back to you.", book: "Luke", chapter: 6, verse: "38" },
      { id: "gv4", reference: "Malachi 3:10", text: "Bring the full tithe into the storehouse, that there may be food in my house. And thereby put me to the test, says the Lord of hosts, if I will not open the windows of heaven for you and pour down for you a blessing until there is no more need.", book: "Malachi", chapter: 3, verse: "10" },
      { id: "gv5", reference: "Matthew 6:3-4", text: "But when you give to the needy, do not let your left hand know what your right hand is doing, so that your giving may be in secret. And your Father who sees in secret will reward you.", book: "Matthew", chapter: 6, verse: "3-4" },
      { id: "gv6", reference: "1 Timothy 6:18-19", text: "They are to do good, to be rich in good works, to be generous and ready to share, thus storing up treasure for themselves as a good foundation for the future, so that they may take hold of that which is truly life.", book: "1 Timothy", chapter: 6, verse: "18-19" },
    ],
  },
  {
    id: "anxiety-worry",
    name: "Anxiety & Worry",
    description: "Finding peace in uncertain times",
    icon: "cloud-outline",
    iconFamily: "Ionicons",
    gradient: ["#8DAEC2", "#6B8EA5"],
    verses: [
      { id: "aw1", reference: "Philippians 4:6-7", text: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God. And the peace of God, which surpasses all understanding, will guard your hearts and your minds in Christ Jesus.", book: "Philippians", chapter: 4, verse: "6-7" },
      { id: "aw2", reference: "1 Peter 5:7", text: "Casting all your anxieties on him, because he cares for you.", book: "1 Peter", chapter: 5, verse: "7" },
      { id: "aw3", reference: "Matthew 6:34", text: "Therefore do not be anxious about tomorrow, for tomorrow will be anxious for itself. Sufficient for the day is its own trouble.", book: "Matthew", chapter: 6, verse: "34" },
      { id: "aw4", reference: "Psalm 94:19", text: "When the cares of my heart are many, your consolations cheer my soul.", book: "Psalms", chapter: 94, verse: "19" },
      { id: "aw5", reference: "Isaiah 41:13", text: "For I, the Lord your God, hold your right hand; it is I who say to you, 'Fear not, I am the one who helps you.'", book: "Isaiah", chapter: 41, verse: "13" },
      { id: "aw6", reference: "John 16:33", text: "I have said these things to you, that in me you may have peace. In the world you will have tribulation. But take heart; I have overcome the world.", book: "John", chapter: 16, verse: "33" },
      { id: "aw7", reference: "Psalm 23:4", text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me.", book: "Psalms", chapter: 23, verse: "4" },
    ],
  },
  {
    id: "forgiveness",
    name: "Forgiveness",
    description: "Grace to forgive and be forgiven",
    icon: "infinite-outline",
    iconFamily: "Ionicons",
    gradient: ["#B5838D", "#9A6A74"],
    verses: [
      { id: "fg1", reference: "Colossians 3:13", text: "Bearing with one another and, if one has a complaint against another, forgiving each other; as the Lord has forgiven you, so you also must forgive.", book: "Colossians", chapter: 3, verse: "13" },
      { id: "fg2", reference: "Ephesians 4:32", text: "Be kind to one another, tenderhearted, forgiving one another, as God in Christ forgave you.", book: "Ephesians", chapter: 4, verse: "32" },
      { id: "fg3", reference: "Matthew 6:14-15", text: "For if you forgive others their trespasses, your heavenly Father will also forgive you, but if you do not forgive others their trespasses, neither will your Father forgive your trespasses.", book: "Matthew", chapter: 6, verse: "14-15" },
      { id: "fg4", reference: "1 John 1:9", text: "If we confess our sins, he is faithful and just to forgive us our sins and to cleanse us from all unrighteousness.", book: "1 John", chapter: 1, verse: "9" },
      { id: "fg5", reference: "Luke 6:37", text: "Judge not, and you will not be judged; condemn not, and you will not be condemned; forgive, and you will be forgiven.", book: "Luke", chapter: 6, verse: "37" },
      { id: "fg6", reference: "Psalm 103:12", text: "As far as the east is from the west, so far does he remove our transgressions from us.", book: "Psalms", chapter: 103, verse: "12" },
    ],
  },
  {
    id: "gratitude",
    name: "Gratitude & Praise",
    description: "A thankful heart before God",
    icon: "musical-notes-outline",
    iconFamily: "Ionicons",
    gradient: ["#D4A95A", "#B89040"],
    verses: [
      { id: "gr1", reference: "1 Thessalonians 5:18", text: "Give thanks in all circumstances; for this is the will of God in Christ Jesus for you.", book: "1 Thessalonians", chapter: 5, verse: "18" },
      { id: "gr2", reference: "Psalm 100:4", text: "Enter his gates with thanksgiving, and his courts with praise! Give thanks to him; bless his name!", book: "Psalms", chapter: 100, verse: "4" },
      { id: "gr3", reference: "Colossians 3:17", text: "And whatever you do, in word or deed, do everything in the name of the Lord Jesus, giving thanks to God the Father through him.", book: "Colossians", chapter: 3, verse: "17" },
      { id: "gr4", reference: "Psalm 107:1", text: "Oh give thanks to the Lord, for he is good, for his steadfast love endures forever!", book: "Psalms", chapter: 107, verse: "1" },
      { id: "gr5", reference: "James 1:17", text: "Every good gift and every perfect gift is from above, coming down from the Father of lights, with whom there is no variation or shadow due to change.", book: "James", chapter: 1, verse: "17" },
      { id: "gr6", reference: "Philippians 4:8", text: "Finally, brothers, whatever is true, whatever is honorable, whatever is just, whatever is pure, whatever is lovely, whatever is commendable, if there is any excellence, if there is anything worthy of praise, think about these things.", book: "Philippians", chapter: 4, verse: "8" },
    ],
  },
];

export function getAllCategories(): Category[] {
  return categories;
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function getVerseOfTheDay(): { verse: Verse; category: Category } {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000
  );

  const allVerses: { verse: Verse; category: Category }[] = [];
  categories.forEach((cat) => {
    cat.verses.forEach((v) => {
      allVerses.push({ verse: v, category: cat });
    });
  });

  const index = dayOfYear % allVerses.length;
  return allVerses[index];
}

export function getRandomVerseFromCategory(categoryId: string): Verse | undefined {
  const category = getCategoryById(categoryId);
  if (!category || category.verses.length === 0) return undefined;
  const randomIndex = Math.floor(Math.random() * category.verses.length);
  return category.verses[randomIndex];
}
