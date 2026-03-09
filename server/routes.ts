import type { Express } from "express";
import { createServer, type Server } from "node:http";
import OpenAI from "openai";
import { getTrackList, streamTrack } from "./ambient-audio";

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
  excludeReferences: string[] = [],
  lang: string = "en"
): Promise<GeneratedVerse[]> {
  if (!openai) return [];

  const topic = categoryTopics[categoryId];
  if (!topic) return [];

  const excludeList =
    excludeReferences.length > 0
      ? `\n\nDo NOT include any of these verses (already shown to the user): ${excludeReferences.join(", ")}`
      : "";

  const isSpanish = lang === "es";
  const translationName = isSpanish ? "Reina Valera 1960 (RVR1960)" : "King James Version (KJV)";
  const translationShort = isSpanish ? "RVR1960" : "KJV";

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    max_completion_tokens: 4000,
    temperature: 1.0,
    messages: [
      {
        role: "system",
        content: `You are a Bible scholar. Return ONLY a valid JSON array of Bible verses. Each verse must be a real, verbatim scripture from the ${translationName} of the Bible. Every reference must be accurate — do not fabricate or paraphrase. Include verses from both Old and New Testament when relevant.${isSpanish ? " All verse text must be in Spanish from the Reina Valera 1960 translation. Book names in the reference and book fields must be in English." : ""}

Return exactly this JSON structure (no markdown, no explanation, just the array):
[{"reference":"Book Chapter:Verse","text":"exact ${translationShort} scripture text","book":"Book Name","chapter":1,"verse":"1"}]

For verse ranges like "1-3", use the range string in the verse field. The text must contain the complete passage for that range.`,
      },
      {
        role: "user",
        content: `Give me ${count} real Bible verses (${translationName}) related to: ${topic}. Choose diverse verses from different books of the Bible. Include lesser-known verses, not just the most popular ones.${excludeList}`,
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

async function fetchBibleChapter(book: string, chapter: number, translation: string = "kjv"): Promise<any[]> {
  const validTranslation = translation === "rvr1960" ? "rvr1960" : "kjv";
  const cacheKey = `${validTranslation}:${book}:${chapter}`;
  const cached = chapterCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.verses;
  }

  const query = encodeURIComponent(`${book} ${chapter}`);
  const response = await fetch(`https://bible-api.com/${query}?translation=${validTranslation}`);

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
  app.get("/download-promo", (_req, res) => {
    res.send(`<!DOCTYPE html>
<html><head><title>Download Promo Images</title>
<style>body{font-family:sans-serif;max-width:600px;margin:40px auto;padding:20px;background:#1a1a2e;color:#fff}
h1{color:#FFA5D9}a{display:block;margin:20px 0;padding:16px 24px;background:#D2319A;color:#fff;
text-decoration:none;border-radius:12px;font-size:18px;text-align:center}a:hover{background:#b02880}</style>
</head><body><h1>Verse Bloom - Promo Images</h1>
<p>Click each link below to download. On the image page, right-click and choose "Save image as..."</p>
<a href="/promo/promo_vatican.png" target="_blank">1. Vatican - St. Peter's Basilica</a>
<a href="/promo/promo_rio.png" target="_blank">2. Rio - Christ the Redeemer</a>
<a href="/promo/promo_jerusalem.png" target="_blank">3. Jerusalem - Holy Sepulchre</a>
<a href="/promo/promo_barcelona.png" target="_blank">4. Barcelona - Sagrada Familia</a>
<h1 style="margin-top:40px">App Screenshots</h1>
<p>Screenshots of each screen in the app:</p>
<a href="/promo/screen_today.png" target="_blank">Today Screen</a>
<a href="/promo/screen_browse.png" target="_blank">Browse Screen</a>
<a href="/promo/screen_calendar.png" target="_blank">Calendar Screen</a>
<a href="/promo/screen_bible.png" target="_blank">Bible Screen</a>
<a href="/promo/screen_paywall.png" target="_blank">Paywall Screen</a>
</body></html>`);
  });

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

      const lang = (req.query.lang as string) || "en";
      const verses = await generateVersesForCategory(categoryId, 20, exclude, lang);

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
      const translation = (req.query.translation as string) || "kjv";

      if (!chapterNum || chapterNum < 1) {
        return res.status(400).json({ error: "Invalid chapter number" });
      }

      const verses = await fetchBibleChapter(decodeURIComponent(book), chapterNum, translation);
      res.json({ book: decodeURIComponent(book), chapter: chapterNum, verses });
    } catch (error: any) {
      console.error("Error fetching Bible chapter:", error.message);
      res.status(500).json({ error: "Failed to fetch chapter" });
    }
  });

  app.get("/api/music/tracks", (_req, res) => {
    res.json({ tracks: getTrackList() });
  });

  app.get("/api/music/stream/:trackId", (req, res) => {
    const { trackId } = req.params;
    const audioBuffer = streamTrack(trackId);

    if (!audioBuffer) {
      return res.status(404).json({ error: "Track not found" });
    }

    const total = audioBuffer.length;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : total - 1;
      const chunkSize = end - start + 1;

      res.status(206);
      res.set({
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": "audio/wav",
        "Cache-Control": "public, max-age=86400",
      });

      res.end(audioBuffer.subarray(start, end + 1));
    } else {
      res.set({
        "Content-Type": "audio/wav",
        "Content-Length": total.toString(),
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=86400",
      });

      res.send(audioBuffer);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
