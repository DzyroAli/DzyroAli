"use client";

import type { Project } from "./types";

// ── Project storage ─────────────────────────────────────────────────────
// Primary: Next.js API routes backed by Supabase (keyed to telegram_id via
// the session cookie). Fallback: localStorage — used when the app runs
// outside Telegram, Supabase is not configured, or the network fails.

const LS_KEY = "slaydchibot.projects";
let cloudAvailable: boolean | null = null;

function readLocal(): Project[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeLocal(projects: Project[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(projects));
  } catch {
    // quota exceeded — drop oldest projects until it fits
    const sorted = [...projects].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    while (sorted.length > 1) {
      sorted.pop();
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(sorted));
        return;
      } catch {
        /* keep shrinking */
      }
    }
  }
}

async function api<T>(path: string, init?: RequestInit): Promise<T | null> {
  if (cloudAvailable === false) return null;
  try {
    const res = await fetch(path, { ...init, headers: { "Content-Type": "application/json" } });
    if (res.status === 501 || res.status === 401) {
      cloudAvailable = false;
      return null;
    }
    if (!res.ok) return null;
    cloudAvailable = true;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function listProjects(): Promise<Project[]> {
  const remote = await api<{ projects: Project[] }>("/api/projects");
  if (remote) return remote.projects;
  return readLocal().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function getProject(id: string): Promise<Project | null> {
  const remote = await api<{ project: Project }>(`/api/projects/${id}`);
  if (remote) return remote.project;
  return readLocal().find((p) => p.id === id) ?? null;
}

export async function saveProject(project: Project): Promise<void> {
  project.updatedAt = new Date().toISOString();
  // Always mirror locally so work is never lost inside the WebView.
  const local = readLocal().filter((p) => p.id !== project.id);
  local.unshift(project);
  writeLocal(local);

  await api("/api/projects", { method: "POST", body: JSON.stringify(project) });
}

export async function deleteProject(id: string): Promise<void> {
  writeLocal(readLocal().filter((p) => p.id !== id));
  await api(`/api/projects/${id}`, { method: "DELETE" });
}
