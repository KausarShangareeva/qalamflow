export interface Book {
  _id: string;
  userId: string;
  title: string;
  author: string;
  level: "beginner" | "intermediate" | "advanced";
  status: "studying" | "completed";
  pages: number;
  progress: number;
  createdAt: string;
  updatedAt: string;
}

export interface ScheduleItem {
  _id: string;
  userId: string;
  dayOfWeek: string;
  time: string;
  activity: string;
  bookId: { _id: string; title: string; author: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProgressEntry {
  _id: string;
  userId: string;
  bookId: { _id: string; title: string; author: string } | string;
  date: string;
  pagesRead: number;
  timeSpent: number;
  createdAt: string;
}

export interface BookForecast {
  bookId: string;
  title: string;
  percentComplete?: number;
  pagesRemaining: number;
  estimatedDaysLeft: number | null;
  estimatedCompletionDate: string | null;
}

export interface ForecastResponse {
  books: BookForecast[];
}

export interface WeeklyBreakdown {
  weekLabel: string;
  pages: number;
  time: number;
  sessions: number;
}

export interface StudyFrequency {
  daysPerWeek: number;
  source: "schedule" | "history" | "default" | "none";
}

export interface DetailedForecast {
  book: { id: string; title: string; author: string; level: string };
  totalPages: number;
  pagesRead: number;
  pagesRemaining: number;
  activeDays: number;
  calendarDays: number;
  averagePagesPerActiveDay: number;
  averagePagesPerCalendarDay: number;
  averageTimePerSession: number;
  weightedPagesPerDay: number;
  recentPagesPerDay: number;
  effectivePace: number;
  estimatedDaysLeft: number | null;
  estimatedCompletionDate: string | null;
  paceRating: string | null;
  percentComplete: number;
  difficultyMultiplier: number;
  studyFrequency: StudyFrequency;
  paceOverride: { pagesPerDay: number } | null;
  weeklyBreakdown: WeeklyBreakdown[];
  message?: string;
}

export interface WhatIfResponse {
  pagesPerDay: number;
  pagesRemaining: number;
  estimatedDaysLeft: number | null;
  estimatedCompletionDate: string | null;
}
