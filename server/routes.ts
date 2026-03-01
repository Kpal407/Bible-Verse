import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";

const BIBLE_BOOKS = new Set([
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel",
  "1 Kings", "2 Kings", "1 Chronicles", "2 Chronicles",
  "Ezra", "Nehemiah", "Esther", "Job", "Psalms", "Psalm",
  "Proverbs", "Ecclesiastes", "Song of Solomon", "Song of Songs",
  "Isaiah", "Jeremiah", "Lamentations", "Ezekiel", "Daniel",
  "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts",
  "Romans", "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians",
  "Philippians", "Colossians", "1 Thessalonians", "2 Thessalonians",
  "1 Timothy", "2 Timothy", "Titus", "Philemon", "Hebrews",
  "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John",
  "Jude", "Revelation",
]);

const aiAvailable = !!(
  process.env.AI_INTEGRATIONS_OPENAI_API_KEY &&
  process.env.AI_INTEGRATIONS_OPENAI_BASE_URL
);

let openai: OpenAI | null = null;
if (aiAvailable) {
  openai = new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
  console.log("OpenAI integration configured for verse generation");
} else {
  console.warn("OpenAI integration not configured — AI verse generation disabled");
}

const categoryTopics: Record<string, string> = {
  "daily-devotional": "daily devotion, general encouragement, starting the day with God, walking with the Lord",
  "loss-grief": "loss, grief, death of a loved one, mourning, bereavement, comfort in sorrow",
  "personal-strength": "personal strength, courage, resilience, overcoming adversity, inner fortitude through God",
  "illness-healing": "illness, healing, sickness, health struggles, recovery, God's healing power",
  "divorce-separation": "divorce, separation, broken relationships, moving forward after a marriage ends, peace in difficult seasons",
  "helping-others": "helping others, service, compassion, caring for the needy, charity, loving your neighbor",
  "giving": "giving, generosity, tithing, sharing blessings, cheerful giving, stewardship",
  "anxiety": "anxiety, worry, fear, stress, trusting God in uncertain times, finding peace",
  "forgiveness": "forgiveness, reconciliation, letting go of bitterness, mercy, pardoning others",
  "gratitude": "gratitude, thankfulness, praise, counting blessings, thanksgiving to God",
};

interface GeneratedVerse {
  reference: string;
  text: string;
  book: string;
  chapter: number;
  verse: string;
}

function isValidBibleReference(v: GeneratedVerse): boolean {
  if (!v.reference || !v.text || !v.book) return false;
  if (v.text.length < 10) return false;
  const normalizedBook = v.book === "Psalm" ? "Psalms" : v.book;
  if (!BIBLE_BOOKS.has(v.book) && !BIBLE_BOOKS.has(normalizedBook)) return false;
  if (!v.chapter || v.chapter < 1 || v.chapter > 150) return false;
  if (!/^\d+(-\d+)?$/.test(v.verse)) return false;
  return true;
}

async function generateVersesForCategory(
  categoryId: string,
  count: number = 20,
  excludeReferences: string[] = []
): Promise<GeneratedVerse[]> {
  if (!openai) return [];

  const topic = categoryTopics[categoryId];
  if (!topic) return [];

  const excludeList =
    excludeReferences.length > 0
      ? `\n\nDo NOT include any of these verses (already shown to the user): ${excludeReferences.join(", ")}`
      : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: 4000,
    temperature: 1.0,
    messages: [
      {
        role: "system",
        content: `You are a Bible scholar. Return ONLY a valid JSON array of Bible verses. Each verse must be a real, verbatim scripture from the King James Version (KJV) of the Bible. Every reference must be accurate — do not fabricate or paraphrase. Include verses from both Old and New Testament when relevant.

Return exactly this JSON structure (no markdown, no explanation, just the array):
[{"reference":"Book Chapter:Verse","text":"exact KJV scripture text","book":"Book Name","chapter":1,"verse":"1"}]

For verse ranges like "1-3", use the range string in the verse field. The text must contain the complete passage for that range.`,
      },
      {
        role: "user",
        content: `Give me ${count} real Bible verses (King James Version) related to: ${topic}. Choose diverse verses from different books of the Bible. Include lesser-known verses, not just the most popular ones.${excludeList}`,
      },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim() || "[]";

  try {
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) {
      return parsed
        .map((v: any) => ({
          reference: String(v.reference || ""),
          text: String(v.text || ""),
          book: String(v.book || ""),
          chapter: Number(v.chapter) || 1,
          verse: String(v.verse || "1"),
        }))
        .filter(isValidBibleReference);
    }
  } catch (e) {
    console.error("Failed to parse AI verse response:", e);
  }

  return [];
}

const chapterCache = new Map<string, { verses: any[]; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60;

async function fetchKJVChapter(book: string, chapter: number): Promise<any[]> {
  const cacheKey = `${book}:${chapter}`;
  const cached = chapterCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.verses;
  }

  const query = encodeURIComponent(`${book} ${chapter}`);
  const response = await fetch(`https://bible-api.com/${query}?translation=kjv`);

  if (!response.ok) {
    throw new Error(`Bible API returned ${response.status}`);
  }

  const data = await response.json() as any;

  if (!data.verses || !Array.isArray(data.verses)) {
    throw new Error("Invalid response from Bible API");
  }

  const verses = data.verses.map((v: any) => ({
    verse: v.verse,
    text: v.text?.trim() || "",
  }));

  chapterCache.set(cacheKey, { verses, timestamp: Date.now() });
  return verses;
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/verses/:categoryId", async (req, res) => {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const exclude = req.query.exclude
        ? (req.query.exclude as string).split(",")
        : [];

      if (!categoryTopics[categoryId]) {
        return res.status(404).json({ error: "Category not found" });
      }

      if (!openai) {
        return res.json({ verses: [], page, available: false });
      }

      const verses = await generateVersesForCategory(categoryId, 20, exclude);

      const versesWithIds = verses.map((v, i) => ({
        ...v,
        id: `ai-${categoryId}-${page}-${i}-${Date.now().toString(36)}`,
      }));

      res.json({ verses: versesWithIds, page, available: true });
    } catch (error) {
      console.error("Error generating verses:", error);
      res.status(500).json({ error: "Failed to generate verses" });
    }
  });

  app.get("/api/bible/:book/:chapter", async (req, res) => {
    try {
      const { book, chapter } = req.params;
      const chapterNum = parseInt(chapter);

      if (!chapterNum || chapterNum < 1) {
        return res.status(400).json({ error: "Invalid chapter number" });
      }

      const verses = await fetchKJVChapter(decodeURIComponent(book), chapterNum);
      res.json({ book: decodeURIComponent(book), chapter: chapterNum, verses });
    } catch (error: any) {
      console.error("Error fetching Bible chapter:", error.message);
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
