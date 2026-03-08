import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, useRef, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { apiRequest } from "@/lib/query-client";
import { bibleBooks } from "@/data/bible-books";

const STORAGE_PREFIX = "kjv_book_";
const DOWNLOAD_STATUS_KEY = "kjv_download_status";

interface VerseData {
  verse: number;
  text: string;
}

interface ChapterData {
  verses: VerseData[];
}

interface BookData {
  [chapter: string]: ChapterData;
}

interface DownloadStatus {
  completedBooks: string[];
  totalVerses: number;
  downloadedAt?: string;
  complete: boolean;
}

interface BibleStorageContextValue {
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadProgress: number;
  downloadedBooks: number;
  totalBooks: number;
  currentBook: string;
  startDownload: () => Promise<void>;
  cancelDownload: () => void;
  deleteDownload: () => Promise<void>;
  getOfflineChapter: (book: string, chapter: number) => Promise<VerseData[] | null>;
  totalVerses: number;
  hasPartialDownload: boolean;
}

const BibleStorageContext = createContext<BibleStorageContextValue | null>(null);

export function BibleStorageProvider({ children }: { children: ReactNode }) {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [hasPartialDownload, setHasPartialDownload] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedBooks, setDownloadedBooks] = useState(0);
  const [currentBook, setCurrentBook] = useState("");
  const [totalVerses, setTotalVerses] = useState(0);
  const cancelRef = useRef(false);
  const mountedRef = useRef(true);

  const totalBooks = bibleBooks.length;
  const downloadProgress = totalBooks > 0 ? downloadedBooks / totalBooks : 0;

  useEffect(() => {
    mountedRef.current = true;
    checkDownloadStatus();
    return () => {
      mountedRef.current = false;
      cancelRef.current = true;
    };
  }, []);

  const checkDownloadStatus = async () => {
    try {
      const statusJson = await AsyncStorage.getItem(DOWNLOAD_STATUS_KEY);
      if (statusJson) {
        const status: DownloadStatus = JSON.parse(statusJson);
        if (status.complete && status.completedBooks.length === totalBooks) {
          setIsDownloaded(true);
          setDownloadedBooks(totalBooks);
          setTotalVerses(status.totalVerses);
        } else if (status.completedBooks.length > 0) {
          setHasPartialDownload(true);
          setDownloadedBooks(status.completedBooks.length);
          setTotalVerses(status.totalVerses);
        }
      }
    } catch (e) {}
  };

  const startDownload = useCallback(async () => {
    if (isDownloading) return;
    if (!mountedRef.current) return;

    setIsDownloading(true);
    cancelRef.current = false;

    let existingStatus: DownloadStatus = { completedBooks: [], totalVerses: 0, complete: false };
    try {
      const statusJson = await AsyncStorage.getItem(DOWNLOAD_STATUS_KEY);
      if (statusJson) {
        existingStatus = JSON.parse(statusJson);
      }
    } catch (e) {}

    const completedSet = new Set(existingStatus.completedBooks);
    let verseCount = existingStatus.totalVerses;

    if (mountedRef.current) {
      setDownloadedBooks(completedSet.size);
    }

    for (let i = 0; i < bibleBooks.length; i++) {
      if (cancelRef.current || !mountedRef.current) break;

      const book = bibleBooks[i];

      if (completedSet.has(book.name)) continue;

      if (mountedRef.current) setCurrentBook(book.name);

      try {
        const bookData: BookData = {};
        let bookVerseCount = 0;

        for (let ch = 1; ch <= book.chapters; ch++) {
          if (cancelRef.current || !mountedRef.current) break;

          try {
            const res = await apiRequest("GET", `/api/bible/${encodeURIComponent(book.name)}/${ch}`);
            const data = await res.json();
            if (data.verses) {
              bookData[ch.toString()] = { verses: data.verses };
              bookVerseCount += data.verses.length;
            }
          } catch (e) {
            bookData[ch.toString()] = { verses: [] };
          }

          await new Promise((r) => setTimeout(r, 50));
        }

        if (cancelRef.current || !mountedRef.current) break;

        await AsyncStorage.setItem(STORAGE_PREFIX + book.name, JSON.stringify(bookData));
        completedSet.add(book.name);
        verseCount += bookVerseCount;

        const isComplete = completedSet.size === totalBooks;
        const status: DownloadStatus = {
          completedBooks: Array.from(completedSet),
          totalVerses: verseCount,
          complete: isComplete,
          downloadedAt: isComplete ? new Date().toISOString() : undefined,
        };
        await AsyncStorage.setItem(DOWNLOAD_STATUS_KEY, JSON.stringify(status));

        if (mountedRef.current) {
          setDownloadedBooks(completedSet.size);
          setTotalVerses(verseCount);
          setHasPartialDownload(true);

          if (isComplete) {
            setIsDownloaded(true);
            setHasPartialDownload(false);
          }
        }
      } catch (e) {
        console.log(`Error downloading ${book.name}:`, e);
      }
    }

    if (mountedRef.current) {
      setIsDownloading(false);
      setCurrentBook("");
    }
  }, [isDownloading, totalBooks]);

  const cancelDownload = useCallback(() => {
    cancelRef.current = true;
  }, []);

  const deleteDownload = useCallback(async () => {
    cancelRef.current = true;
    const keys = bibleBooks.map((b) => STORAGE_PREFIX + b.name);
    keys.push(DOWNLOAD_STATUS_KEY);
    await AsyncStorage.multiRemove(keys);
    if (mountedRef.current) {
      setIsDownloaded(false);
      setHasPartialDownload(false);
      setDownloadedBooks(0);
      setTotalVerses(0);
    }
  }, []);

  const getOfflineChapter = useCallback(async (book: string, chapter: number): Promise<VerseData[] | null> => {
    try {
      const bookJson = await AsyncStorage.getItem(STORAGE_PREFIX + book);
      if (!bookJson) return null;
      const bookData: BookData = JSON.parse(bookJson);
      const chapterData = bookData[chapter.toString()];
      if (!chapterData || !chapterData.verses || chapterData.verses.length === 0) return null;
      return chapterData.verses;
    } catch (e) {
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      isDownloaded,
      isDownloading,
      downloadProgress,
      downloadedBooks,
      totalBooks,
      currentBook,
      startDownload,
      cancelDownload,
      deleteDownload,
      getOfflineChapter,
      totalVerses,
      hasPartialDownload,
    }),
    [isDownloaded, isDownloading, downloadProgress, downloadedBooks, totalBooks, currentBook, startDownload, cancelDownload, deleteDownload, getOfflineChapter, totalVerses, hasPartialDownload]
  );

  return (
    <BibleStorageContext.Provider value={value}>
      {children}
    </BibleStorageContext.Provider>
  );
}

export function useBibleStorage() {
  const context = useContext(BibleStorageContext);
  if (!context) {
    throw new Error("useBibleStorage must be used within a BibleStorageProvider");
  }
  return context;
}
