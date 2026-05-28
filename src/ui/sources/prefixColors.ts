// Rose Pine palette used to colorize calendar dots based on the leading
// character of a task or bullet line. Both task-prefix (- [ ] X ...) and
// plain-bullet-prefix (- X ...) reuse the same colors; each source file
// builds its own prefix -> color lookup with the appropriate leading token.
// Lines without a recognised prefix do not emit a dot.

export const ROSE_PINE: Record<string, string> = {
  "!": "#eb6f92",
  "&": "#f6c177",
  "$": "#31748f",
  "~": "#c4a7e7",
  "@": "#9ccfd8",
  "%": "#e0def4",
  "?": "#ebbcba",
  "^": "#21202e",
};

export function buildPrefixTable(leadingToken: string): Record<string, string> {
  const table: Record<string, string> = {};
  for (const key of Object.keys(ROSE_PINE)) {
    table[`${leadingToken}${key}`] = ROSE_PINE[key];
  }
  return table;
}

export function colorForLine(
  line: string,
  table: Record<string, string>
): string | null {
  for (const prefix of Object.keys(table)) {
    if (line.startsWith(prefix)) {
      return table[prefix];
    }
  }
  return null;
}

export function stripFrontmatter(content: string): string {
  return content.replace(/^---([\s\S]*?)^---/m, "");
}

export function isTaskLine(line: string): boolean {
  return (
    line.startsWith("- [ ]") ||
    line.startsWith("- [x]") ||
    line.startsWith("- [-]") ||
    line.startsWith("- [>]")
  );
}
