export interface LiturgicalEvent {
  id: string;
  date: Date;
  nameKey: string;
  descKey: string;
  icon: string;
  color: string;
  gradient: [string, string];
  moveable: boolean;
}

export interface LiturgicalSeason {
  id: string;
  nameKey: string;
  startDate: Date;
  endDate: Date;
  color: string;
  gradient: [string, string];
}

function computeEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getAdventStart(year: number): Date {
  const christmas = new Date(year, 11, 25);
  const christmasDay = christmas.getDay();
  const daysBack = christmasDay === 0 ? 28 : 21 + christmasDay;
  return addDays(christmas, -daysBack);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}

function getFixedEvents(year: number): LiturgicalEvent[] {
  return [
    {
      id: "christmas",
      date: new Date(year, 11, 25),
      nameKey: "calendar.christmas.name",
      descKey: "calendar.christmas.desc",
      icon: "star",
      color: "#C8102E",
      gradient: ["#C8102E", "#8B0000"],
      moveable: false,
    },
    {
      id: "epiphany",
      date: new Date(year, 0, 6),
      nameKey: "calendar.epiphany.name",
      descKey: "calendar.epiphany.desc",
      icon: "sunny",
      color: "#DAA520",
      gradient: ["#DAA520", "#B8860B"],
      moveable: false,
    },
    {
      id: "allSaints",
      date: new Date(year, 10, 1),
      nameKey: "calendar.allSaints.name",
      descKey: "calendar.allSaints.desc",
      icon: "people",
      color: "#FFD700",
      gradient: ["#FFD700", "#DAA520"],
      moveable: false,
    },
    {
      id: "immaculateConception",
      date: new Date(year, 11, 8),
      nameKey: "calendar.immaculateConception.name",
      descKey: "calendar.immaculateConception.desc",
      icon: "flower",
      color: "#4169E1",
      gradient: ["#7B9FE8", "#4169E1"],
      moveable: false,
    },
    {
      id: "annunciation",
      date: new Date(year, 2, 25),
      nameKey: "calendar.annunciation.name",
      descKey: "calendar.annunciation.desc",
      icon: "rose",
      color: "#E8E8E8",
      gradient: ["#F5F5F5", "#DCDCDC"],
      moveable: false,
    },
    {
      id: "presentation",
      date: new Date(year, 1, 2),
      nameKey: "calendar.presentation.name",
      descKey: "calendar.presentation.desc",
      icon: "flame",
      color: "#FFD700",
      gradient: ["#FFF8DC", "#FFD700"],
      moveable: false,
    },
    {
      id: "assumption",
      date: new Date(year, 7, 15),
      nameKey: "calendar.assumption.name",
      descKey: "calendar.assumption.desc",
      icon: "cloud",
      color: "#4169E1",
      gradient: ["#87CEEB", "#4169E1"],
      moveable: false,
    },
    {
      id: "transfiguration",
      date: new Date(year, 7, 6),
      nameKey: "calendar.transfiguration.name",
      descKey: "calendar.transfiguration.desc",
      icon: "flash",
      color: "#FFD700",
      gradient: ["#FFFACD", "#FFD700"],
      moveable: false,
    },
    {
      id: "holyCross",
      date: new Date(year, 8, 14),
      nameKey: "calendar.holyCross.name",
      descKey: "calendar.holyCross.desc",
      icon: "add",
      color: "#8B0000",
      gradient: ["#CD5C5C", "#8B0000"],
      moveable: false,
    },
    {
      id: "allSouls",
      date: new Date(year, 10, 2),
      nameKey: "calendar.allSouls.name",
      descKey: "calendar.allSouls.desc",
      icon: "heart",
      color: "#4B0082",
      gradient: ["#7B68EE", "#4B0082"],
      moveable: false,
    },
    {
      id: "stJoseph",
      date: new Date(year, 2, 19),
      nameKey: "calendar.stJoseph.name",
      descKey: "calendar.stJoseph.desc",
      icon: "construct",
      color: "#F5F5DC",
      gradient: ["#FFFFF0", "#F5F5DC"],
      moveable: false,
    },
    {
      id: "birthJohnBaptist",
      date: new Date(year, 5, 24),
      nameKey: "calendar.birthJohnBaptist.name",
      descKey: "calendar.birthJohnBaptist.desc",
      icon: "water",
      color: "#228B22",
      gradient: ["#90EE90", "#228B22"],
      moveable: false,
    },
    {
      id: "stsPeterPaul",
      date: new Date(year, 5, 29),
      nameKey: "calendar.stsPeterPaul.name",
      descKey: "calendar.stsPeterPaul.desc",
      icon: "key",
      color: "#C8102E",
      gradient: ["#FF6347", "#C8102E"],
      moveable: false,
    },
  ];
}

function getMoveableEvents(year: number): LiturgicalEvent[] {
  const easter = computeEaster(year);

  return [
    {
      id: "ashWednesday",
      date: addDays(easter, -46),
      nameKey: "calendar.ashWednesday.name",
      descKey: "calendar.ashWednesday.desc",
      icon: "ellipse",
      color: "#808080",
      gradient: ["#A9A9A9", "#696969"],
      moveable: true,
    },
    {
      id: "palmSunday",
      date: addDays(easter, -7),
      nameKey: "calendar.palmSunday.name",
      descKey: "calendar.palmSunday.desc",
      icon: "leaf",
      color: "#228B22",
      gradient: ["#90EE90", "#228B22"],
      moveable: true,
    },
    {
      id: "holyThursday",
      date: addDays(easter, -3),
      nameKey: "calendar.holyThursday.name",
      descKey: "calendar.holyThursday.desc",
      icon: "restaurant",
      color: "#E8E8E8",
      gradient: ["#F5F5F5", "#DCDCDC"],
      moveable: true,
    },
    {
      id: "goodFriday",
      date: addDays(easter, -2),
      nameKey: "calendar.goodFriday.name",
      descKey: "calendar.goodFriday.desc",
      icon: "add-circle",
      color: "#8B0000",
      gradient: ["#CD5C5C", "#8B0000"],
      moveable: true,
    },
    {
      id: "holySaturday",
      date: addDays(easter, -1),
      nameKey: "calendar.holySaturday.name",
      descKey: "calendar.holySaturday.desc",
      icon: "moon",
      color: "#4B0082",
      gradient: ["#7B68EE", "#4B0082"],
      moveable: true,
    },
    {
      id: "easter",
      date: easter,
      nameKey: "calendar.easter.name",
      descKey: "calendar.easter.desc",
      icon: "sunny",
      color: "#FFD700",
      gradient: ["#FFFACD", "#FFD700"],
      moveable: true,
    },
    {
      id: "divineMercy",
      date: addDays(easter, 7),
      nameKey: "calendar.divineMercy.name",
      descKey: "calendar.divineMercy.desc",
      icon: "heart-circle",
      color: "#E8E8E8",
      gradient: ["#FFE4E1", "#FFB6C1"],
      moveable: true,
    },
    {
      id: "ascension",
      date: addDays(easter, 39),
      nameKey: "calendar.ascension.name",
      descKey: "calendar.ascension.desc",
      icon: "arrow-up-circle",
      color: "#E8E8E8",
      gradient: ["#F0F8FF", "#87CEEB"],
      moveable: true,
    },
    {
      id: "pentecost",
      date: addDays(easter, 49),
      nameKey: "calendar.pentecost.name",
      descKey: "calendar.pentecost.desc",
      icon: "flame",
      color: "#C8102E",
      gradient: ["#FF4500", "#C8102E"],
      moveable: true,
    },
    {
      id: "trinitySunday",
      date: addDays(easter, 56),
      nameKey: "calendar.trinitySunday.name",
      descKey: "calendar.trinitySunday.desc",
      icon: "triangle",
      color: "#E8E8E8",
      gradient: ["#F5F5F5", "#DAA520"],
      moveable: true,
    },
    {
      id: "corpusChristi",
      date: addDays(easter, 60),
      nameKey: "calendar.corpusChristi.name",
      descKey: "calendar.corpusChristi.desc",
      icon: "nutrition",
      color: "#FFD700",
      gradient: ["#FFF8DC", "#DAA520"],
      moveable: true,
    },
    {
      id: "sacredHeart",
      date: addDays(easter, 68),
      nameKey: "calendar.sacredHeart.name",
      descKey: "calendar.sacredHeart.desc",
      icon: "heart",
      color: "#C8102E",
      gradient: ["#FF6347", "#C8102E"],
      moveable: true,
    },
  ];
}

export function getEasterDate(year: number): Date {
  return computeEaster(year);
}

export function getEventsForYear(year: number): LiturgicalEvent[] {
  const fixed = getFixedEvents(year);
  const moveable = getMoveableEvents(year);
  const all = [...fixed, ...moveable];
  all.sort((a, b) => a.date.getTime() - b.date.getTime());
  return all;
}

export function getUpcomingEvents(count: number = 5): LiturgicalEvent[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();

  const thisYearEvents = getEventsForYear(year);
  const nextYearEvents = getEventsForYear(year + 1);
  const allEvents = [...thisYearEvents, ...nextYearEvents];

  const upcoming = allEvents.filter(e => e.date.getTime() >= today.getTime());
  return upcoming.slice(0, count);
}

export function getTodayEvent(): LiturgicalEvent | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const events = getEventsForYear(today.getFullYear());
  return events.find(e => isSameDay(e.date, today)) ?? null;
}

export function getSeasonsForYear(year: number): LiturgicalSeason[] {
  const easter = computeEaster(year);
  const adventStart = getAdventStart(year);
  const prevAdventStart = getAdventStart(year - 1);

  const christmasPrev = new Date(year - 1, 11, 25);
  const epiphany = new Date(year, 0, 6);
  const baptismOfLord = (() => {
    const jan6 = new Date(year, 0, 6);
    const day = jan6.getDay();
    return day === 0 ? addDays(jan6, 7) : addDays(jan6, 7 - day);
  })();

  const ashWednesday = addDays(easter, -46);
  const pentecost = addDays(easter, 49);

  const seasons: LiturgicalSeason[] = [
    {
      id: "christmasSeason",
      nameKey: "calendar.season.christmas",
      startDate: christmasPrev > prevAdventStart ? christmasPrev : new Date(year, 0, 1),
      endDate: addDays(baptismOfLord, -1),
      color: "#FFD700",
      gradient: ["#FFF8DC", "#FFD700"],
    },
    {
      id: "ordinaryTime1",
      nameKey: "calendar.season.ordinaryTime",
      startDate: baptismOfLord,
      endDate: addDays(ashWednesday, -1),
      color: "#228B22",
      gradient: ["#90EE90", "#228B22"],
    },
    {
      id: "lent",
      nameKey: "calendar.season.lent",
      startDate: ashWednesday,
      endDate: addDays(easter, -1),
      color: "#4B0082",
      gradient: ["#7B68EE", "#4B0082"],
    },
    {
      id: "easterSeason",
      nameKey: "calendar.season.easter",
      startDate: easter,
      endDate: pentecost,
      color: "#FFD700",
      gradient: ["#FFFACD", "#FFD700"],
    },
    {
      id: "ordinaryTime2",
      nameKey: "calendar.season.ordinaryTime",
      startDate: addDays(pentecost, 1),
      endDate: addDays(adventStart, -1),
      color: "#228B22",
      gradient: ["#90EE90", "#228B22"],
    },
    {
      id: "advent",
      nameKey: "calendar.season.advent",
      startDate: adventStart,
      endDate: new Date(year, 11, 24),
      color: "#4B0082",
      gradient: ["#9370DB", "#4B0082"],
    },
    {
      id: "christmasSeasonEnd",
      nameKey: "calendar.season.christmas",
      startDate: new Date(year, 11, 25),
      endDate: new Date(year, 11, 31),
      color: "#FFD700",
      gradient: ["#FFF8DC", "#FFD700"],
    },
  ];

  return seasons;
}

export function getCurrentSeason(): LiturgicalSeason | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const year = today.getFullYear();
  const seasons = getSeasonsForYear(year);

  for (const season of seasons) {
    const start = new Date(season.startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(season.endDate);
    end.setHours(23, 59, 59, 999);
    if (today >= start && today <= end) {
      return season;
    }
  }
  return null;
}
