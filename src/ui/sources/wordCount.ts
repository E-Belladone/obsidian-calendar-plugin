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

// In the upstream plugin this file produced one filled dot per N words of
// the note. The local fork replaces that with prefix-driven coloring: each
// non-task bullet whose first char after "- " is a Rose Pine code becomes
// a filled dot of the matching color. Lines without a prefix do not emit
// a dot. The wordCount filename and exports are preserved so the source
// registry in view.ts stays untouched.

const BULLET_PREFIX_COLORS = buildPrefixTable("- ");

export async function getBulletColors(note: TFile): Promise<string[]> {
  if (!note) {
    return [];
  }
  const fileContents = await window.app.vault.cachedRead(note);
  const lines = stripFrontmatter(fileContents).split("\n");
  const colors: string[] = [];
  for (const line of lines) {
    if (!line.startsWith("- ") || isTaskLine(line)) continue;
    const color = colorForLine(line, BULLET_PREFIX_COLORS);
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
  const colors = await getBulletColors(dailyNote);
  return colors.map((color) => ({
    color,
    isFilled: true,
  }));
}

export const wordCountSource: ICalendarSource = {
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
