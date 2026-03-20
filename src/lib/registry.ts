import { execSync } from "child_process";
import type { HeidiSession } from "./types";

const SERVERS_KEY = "HKCU\\SOFTWARE\\HeidiSQL\\Servers";

interface RegistryValues {
  [key: string]: { type: string; value: string };
}

function parseRegistryBlock(
  block: string,
): { path: string; values: RegistryValues } | null {
  const lines = block.split("\n").map((l) => l.trimEnd());
  const pathLine = lines.find((l) => l.startsWith("HKEY_"));
  if (!pathLine) return null;

  const values: RegistryValues = {};
  for (const line of lines) {
    const match = line.match(/^\s{4}(\S+)\s+(REG_\S+)\s+(.*)/);
    if (match) {
      values[match[1]] = { type: match[2], value: match[3].trim() };
    }
  }

  return { path: pathLine.trim(), values };
}

function isFolder(values: RegistryValues): boolean {
  return values["Folder"]?.value === "0x1";
}

function isSession(values: RegistryValues): boolean {
  return "Host" in values;
}

function extractSession(
  path: string,
  values: RegistryValues,
  serversPrefix: string,
): HeidiSession | null {
  if (!isSession(values)) return null;

  const relativePath = path.substring(serversPrefix.length + 1);
  const parts = relativePath.split("\\");
  const name = parts[parts.length - 1];
  const folder = parts.length > 1 ? parts.slice(0, -1).join("\\") : undefined;

  return {
    name,
    folder,
    registryPath: relativePath,
    host: values["Host"]?.value ?? "",
    port: values["Port"]?.value ?? "3306",
    user: values["User"]?.value ?? "",
    netType: parseInt(values["NetType"]?.value ?? "0", 16),
    lastConnect: values["LastConnect"]?.value || undefined,
    comment: values["Comment"]?.value || undefined,
    password: values["Password"]?.value || undefined,
  };
}

export function readAllSessions(): HeidiSession[] {
  const output = execSync(`chcp 65001 >nul && reg query "${SERVERS_KEY}" /s`, {
    encoding: "utf-8",
    maxBuffer: 1024 * 1024,
  });

  const serversPrefix = "HKEY_CURRENT_USER\\SOFTWARE\\HeidiSQL\\Servers";
  const blocks = output.split(/\r?\n\r?\n/).filter(Boolean);
  const sessions: HeidiSession[] = [];

  for (const block of blocks) {
    const parsed = parseRegistryBlock(block);
    if (!parsed) continue;
    if (parsed.path === serversPrefix) continue;
    if (isFolder(parsed.values)) continue;

    const session = extractSession(parsed.path, parsed.values, serversPrefix);
    if (session) sessions.push(session);
  }

  return sessions.sort((a, b) => {
    const folderCmp = (a.folder ?? "").localeCompare(b.folder ?? "");
    if (folderCmp !== 0) return folderCmp;
    return a.name.localeCompare(b.name);
  });
}
