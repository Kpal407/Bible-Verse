export interface BibleBook {
  name: string;
  abbreviation: string;
  chapters: number;
  testament: "old" | "new";
}

export const bibleBooks: BibleBook[] = [
  { name: "Genesis", abbreviation: "Gen", chapters: 50, testament: "old" },
  { name: "Exodus", abbreviation: "Exod", chapters: 40, testament: "old" },
  { name: "Leviticus", abbreviation: "Lev", chapters: 27, testament: "old" },
  { name: "Numbers", abbreviation: "Num", chapters: 36, testament: "old" },
  { name: "Deuteronomy", abbreviation: "Deut", chapters: 34, testament: "old" },
  { name: "Joshua", abbreviation: "Josh", chapters: 24, testament: "old" },
  { name: "Judges", abbreviation: "Judg", chapters: 21, testament: "old" },
  { name: "Ruth", abbreviation: "Ruth", chapters: 4, testament: "old" },
  { name: "1 Samuel", abbreviation: "1Sam", chapters: 31, testament: "old" },
  { name: "2 Samuel", abbreviation: "2Sam", chapters: 24, testament: "old" },
  { name: "1 Kings", abbreviation: "1Kgs", chapters: 22, testament: "old" },
  { name: "2 Kings", abbreviation: "2Kgs", chapters: 25, testament: "old" },
  { name: "1 Chronicles", abbreviation: "1Chr", chapters: 29, testament: "old" },
  { name: "2 Chronicles", abbreviation: "2Chr", chapters: 36, testament: "old" },
  { name: "Ezra", abbreviation: "Ezra", chapters: 10, testament: "old" },
  { name: "Nehemiah", abbreviation: "Neh", chapters: 13, testament: "old" },
  { name: "Esther", abbreviation: "Esth", chapters: 10, testament: "old" },
  { name: "Job", abbreviation: "Job", chapters: 42, testament: "old" },
  { name: "Psalms", abbreviation: "Ps", chapters: 150, testament: "old" },
  { name: "Proverbs", abbreviation: "Prov", chapters: 31, testament: "old" },
  { name: "Ecclesiastes", abbreviation: "Eccl", chapters: 12, testament: "old" },
  { name: "Song of Solomon", abbreviation: "Song", chapters: 8, testament: "old" },
  { name: "Isaiah", abbreviation: "Isa", chapters: 66, testament: "old" },
  { name: "Jeremiah", abbreviation: "Jer", chapters: 52, testament: "old" },
  { name: "Lamentations", abbreviation: "Lam", chapters: 5, testament: "old" },
  { name: "Ezekiel", abbreviation: "Ezek", chapters: 48, testament: "old" },
  { name: "Daniel", abbreviation: "Dan", chapters: 12, testament: "old" },
  { name: "Hosea", abbreviation: "Hos", chapters: 14, testament: "old" },
  { name: "Joel", abbreviation: "Joel", chapters: 3, testament: "old" },
  { name: "Amos", abbreviation: "Amos", chapters: 9, testament: "old" },
  { name: "Obadiah", abbreviation: "Obad", chapters: 1, testament: "old" },
  { name: "Jonah", abbreviation: "Jonah", chapters: 4, testament: "old" },
  { name: "Micah", abbreviation: "Mic", chapters: 7, testament: "old" },
  { name: "Nahum", abbreviation: "Nah", chapters: 3, testament: "old" },
  { name: "Habakkuk", abbreviation: "Hab", chapters: 3, testament: "old" },
  { name: "Zephaniah", abbreviation: "Zeph", chapters: 3, testament: "old" },
  { name: "Haggai", abbreviation: "Hag", chapters: 2, testament: "old" },
  { name: "Zechariah", abbreviation: "Zech", chapters: 14, testament: "old" },
  { name: "Malachi", abbreviation: "Mal", chapters: 4, testament: "old" },
  { name: "Matthew", abbreviation: "Matt", chapters: 28, testament: "new" },
  { name: "Mark", abbreviation: "Mark", chapters: 16, testament: "new" },
  { name: "Luke", abbreviation: "Luke", chapters: 24, testament: "new" },
  { name: "John", abbreviation: "John", chapters: 21, testament: "new" },
  { name: "Acts", abbreviation: "Acts", chapters: 28, testament: "new" },
  { name: "Romans", abbreviation: "Rom", chapters: 16, testament: "new" },
  { name: "1 Corinthians", abbreviation: "1Cor", chapters: 16, testament: "new" },
  { name: "2 Corinthians", abbreviation: "2Cor", chapters: 13, testament: "new" },
  { name: "Galatians", abbreviation: "Gal", chapters: 6, testament: "new" },
  { name: "Ephesians", abbreviation: "Eph", chapters: 6, testament: "new" },
  { name: "Philippians", abbreviation: "Phil", chapters: 4, testament: "new" },
  { name: "Colossians", abbreviation: "Col", chapters: 4, testament: "new" },
  { name: "1 Thessalonians", abbreviation: "1Thess", chapters: 5, testament: "new" },
  { name: "2 Thessalonians", abbreviation: "2Thess", chapters: 3, testament: "new" },
  { name: "1 Timothy", abbreviation: "1Tim", chapters: 6, testament: "new" },
  { name: "2 Timothy", abbreviation: "2Tim", chapters: 4, testament: "new" },
  { name: "Titus", abbreviation: "Titus", chapters: 3, testament: "new" },
  { name: "Philemon", abbreviation: "Phlm", chapters: 1, testament: "new" },
  { name: "Hebrews", abbreviation: "Heb", chapters: 13, testament: "new" },
  { name: "James", abbreviation: "Jas", chapters: 5, testament: "new" },
  { name: "1 Peter", abbreviation: "1Pet", chapters: 5, testament: "new" },
  { name: "2 Peter", abbreviation: "2Pet", chapters: 3, testament: "new" },
  { name: "1 John", abbreviation: "1John", chapters: 5, testament: "new" },
  { name: "2 John", abbreviation: "2John", chapters: 1, testament: "new" },
  { name: "3 John", abbreviation: "3John", chapters: 1, testament: "new" },
  { name: "Jude", abbreviation: "Jude", chapters: 1, testament: "new" },
  { name: "Revelation", abbreviation: "Rev", chapters: 22, testament: "new" },
];

export function getBookByName(name: string): BibleBook | undefined {
  return bibleBooks.find(
    (b) => b.name.toLowerCase() === name.toLowerCase() || b.abbreviation.toLowerCase() === name.toLowerCase()
  );
}

export function getOldTestamentBooks(): BibleBook[] {
  return bibleBooks.filter((b) => b.testament === "old");
}

export function getNewTestamentBooks(): BibleBook[] {
  return bibleBooks.filter((b) => b.testament === "new");
}
