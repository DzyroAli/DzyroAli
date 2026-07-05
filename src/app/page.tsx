"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createProject, type Project, type SlideFormat } from "@/lib/types";
import { listProjects, deleteProject, saveProject } from "@/lib/storage";
import { useTelegram } from "@/components/TelegramProvider";
import { BottomNav } from "@/components/BottomNav";
import { SlidePreview } from "@/components/SlidePreview";

export default function HomePage() {
  const t = useTranslations();
  const router = useRouter();
  const { ready, cloudStorage, haptic } = useTelegram();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [showNew, setShowNew] = useState(false);

  useEffect(() => {
    if (!ready) return;
    listProjects().then(setProjects);
  }, [ready]);

  async function handleCreate(format: SlideFormat) {
    haptic("medium");
    const project = createProject(t("newProject.untitled"), format);
    await saveProject(project);
    router.push(`/editor/${project.id}`);
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("home.deleteConfirm"))) return;
    haptic("medium");
    await deleteProject(id);
    setProjects((prev) => prev?.filter((p) => p.id !== id) ?? null);
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-bold">{t("home.title")}</h1>
      <p className="mt-1 text-sm text-tg-hint">{t("home.subtitle")}</p>

      {ready && !cloudStorage && (
        <p className="mt-3 rounded-xl bg-tg-bg-secondary px-3 py-2 text-xs text-tg-hint">
          {t("home.guestBanner")}
        </p>
      )}

      <button
        onClick={() => {
          haptic("light");
          setShowNew(true);
        }}
        className="mt-4 w-full rounded-2xl bg-tg-button py-3.5 text-base font-semibold text-tg-button-text active:opacity-80"
      >
        + {t("home.newProject")}
      </button>

      {projects === null ? (
        <p className="mt-10 text-center text-sm text-tg-hint">{t("common.loading")}</p>
      ) : projects.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="text-5xl">🖼</div>
          <p className="mt-3 font-medium">{t("home.empty")}</p>
          <p className="mt-1 text-sm text-tg-hint">{t("home.emptyHint")}</p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3">
          {projects.map((p) => (
            <div key={p.id} className="overflow-hidden rounded-2xl bg-tg-bg-secondary">
              <button onClick={() => router.push(`/editor/${p.id}`)} className="block w-full">
                <SlidePreview slide={p.slides[0]} format={p.format} width={164} className="mx-auto w-full" />
              </button>
              <div className="flex items-center justify-between gap-1 px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-tg-hint">{t("home.slides", { count: p.slides.length })}</p>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  aria-label={t("common.delete")}
                  className="shrink-0 p-1 text-tg-hint active:opacity-60"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showNew && (
        <NewProjectSheet
          onClose={() => setShowNew(false)}
          onCreate={handleCreate}
          onTemplates={() => router.push("/templates")}
        />
      )}

      <BottomNav />
    </main>
  );
}

function NewProjectSheet({
  onClose,
  onCreate,
  onTemplates,
}: {
  onClose: () => void;
  onCreate: (format: SlideFormat) => void;
  onTemplates: () => void;
}) {
  const t = useTranslations("newProject");
  const [format, setFormat] = useState<SlideFormat>("1080x1350");

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50" onClick={onClose}>
      <div
        className="w-full rounded-t-3xl bg-tg-bg p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-tg-hint/40" />
        <h2 className="font-display text-lg font-bold">{t("title")}</h2>

        <p className="mt-4 text-sm font-medium text-tg-hint">{t("format")}</p>
        <div className="mt-2 flex gap-2">
          {(
            [
              ["1080x1080", t("formatSquare"), "aspect-square"],
              ["1080x1350", t("formatPortrait"), "aspect-[4/5]"],
            ] as const
          ).map(([f, label, aspect]) => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`flex flex-1 flex-col items-center gap-2 rounded-2xl border-2 p-3 ${
                format === f ? "border-tg-link" : "border-transparent bg-tg-bg-secondary"
              }`}
            >
              <span className={`${aspect} w-10 rounded-md bg-tg-hint/30`} />
              <span className="text-xs font-medium">{label}</span>
              <span className="text-[10px] text-tg-hint">{f.replace("x", " × ")}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onCreate(format)}
          className="mt-5 w-full rounded-2xl bg-tg-button py-3.5 font-semibold text-tg-button-text active:opacity-80"
        >
          {t("blank")}
        </button>
        <button
          onClick={onTemplates}
          className="mt-2 w-full rounded-2xl bg-tg-bg-secondary py-3.5 font-semibold active:opacity-80"
        >
          ✨ {t("fromTemplate")}
        </button>
      </div>
    </div>
  );
}
