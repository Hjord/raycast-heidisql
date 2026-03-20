import { existsSync } from "fs";
import { exec } from "child_process";
import { getPreferenceValues } from "@raycast/api";
import type { HeidiSession } from "./types";

interface Preferences {
  heidisqlPath?: string;
}

export const NET_TYPE_LABELS: Record<number, string> = {
  0: "MySQL/MariaDB",
  1: "MySQL (pipe)",
  2: "MySQL (SSH)",
  3: "MSSQL",
  4: "MSSQL (pipe)",
  5: "MSSQL (SPX/IPX)",
  6: "PostgreSQL",
  7: "SQLite",
  8: "ProxySQL",
  9: "Interbase/Firebird",
  10: "Firebird (embedded)",
};

const DEFAULT_PATHS = [
  "C:\\Program Files\\HeidiSQL\\heidisql.exe",
  "C:\\Program Files (x86)\\HeidiSQL\\heidisql.exe",
];

export function findHeidisqlExe(): string | null {
  const prefs = getPreferenceValues<Preferences>();
  if (prefs.heidisqlPath && existsSync(prefs.heidisqlPath)) {
    return prefs.heidisqlPath;
  }
  for (const p of DEFAULT_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function decryptPassword(encoded: string): string {
  if (!encoded || encoded.length < 2) return "";

  const lastChar = encoded[encoded.length - 1];

  // Unicode format: trailing '0' is the flag, second-to-last char is the salt
  if (lastChar === "0") {
    const inner = encoded.slice(0, -1);
    if (inner.length < 2) return "";
    const salt = parseInt(inner[inner.length - 1], 10);
    if (isNaN(salt)) return "";
    const hex = inner.slice(0, -1);
    let result = "";
    for (let i = 0; i < hex.length; i += 4) {
      let code = parseInt(hex.substring(i, i + 4), 16) - salt;
      if (code < 0) code += 65536;
      result += String.fromCharCode(code);
    }
    return result;
  }

  // ANSI format: last char is the salt
  const salt = parseInt(lastChar, 10);
  if (isNaN(salt) || salt < 1) return "";
  const hex = encoded.slice(0, -1);
  let result = "";
  for (let i = 0; i < hex.length; i += 2) {
    let code = parseInt(hex.substring(i, i + 2), 16) - salt;
    if (code < 0) code += 255;
    result += String.fromCharCode(code);
  }
  return result;
}

export function openSession(session: HeidiSession, exePath: string): void {
  exec(`"${exePath}" -d="${session.registryPath}"`);
}
