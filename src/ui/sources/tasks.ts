import type { Moment } from "moment";
import type { TFile } from "obsidian";
import type { ICalendarSource, IDayMetadata, IDot } from "obsidian-calendar-ui";
import { getDailyNote, getWeeklyNote } from "obsidian-daily-notes-interface";
import { get } from "svelte/store";

import { dailyNotes, weeklyNotes } from "../stores";
import {
  buildPrefixTable,
  colorForLine,
  isTaskLine,
  stripFrontmatter,
} from "./prefixColors";

const TASK_PREFIX_COLORS = buildPrefixTable("- [ ] ");

export async function getTaskColors(note: TFile): Promise<string[]> {
  if (!note) {
    return [];
  }
  const { vault } = window.app;
  const fileContents = await vault.cachedRead(note);
  const lines = stripFrontmatter(fileContents).split("\n");
  const colors: string[] = [];
  for (const line of lines) {
    if (!isTaskLine(line)) continue;
    const color = colorForLine(line, TASK_PREFIX_COLORS);
    if (color !== null) {
      colors.push(color);
    }
  }
  return colors;
}

export async function getDotsForDailyNote(
  dailyNote: TFile | null
): Promise<IDot[]> {
  if (!dailyNote) {
    return [];
  }
  const colors = await getTaskColors(dailyNote);
  return colors.map((color) => ({
    className: "task",
    color,
    isFilled: false,
  }));
}

export const tasksSource: ICalendarSource = {
  getDailyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getDailyNote(date, get(dailyNotes));
    const dots = await getDotsForDailyNote(file);
    return {
      dots,
    };
  },

  getWeeklyMetadata: async (date: Moment): Promise<IDayMetadata> => {
    const file = getWeeklyNote(date, get(weeklyNotes));
    const dots = await getDotsForDailyNote(file);

    return {
      dots,
    };
  },
};
