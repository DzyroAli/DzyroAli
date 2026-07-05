"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { getTemplates, instantiateTemplate, type TemplateCategory } from "@/lib/templates";
import { createProject } from "@/lib/types";
import { saveProject } from "@/lib/storage";
import { useTelegram } from "@/components/TelegramProvider";
import { BottomNav } from "@/components/BottomNav";
import { SlidePreview } from "@/components/SlidePreview";

const categories: TemplateCategory[] = ["business", "sale", "education", "quote"];

export default function TemplatesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { haptic } = useTelegram();
  const [category, setCategory] = useState<TemplateCategory>("business");
  const [creating, setCreating] = useState<string | null>(null);
  const templates = useMemo(() => getTemplates(), []);

  async function applyTemplate(id: string) {
    const template = templates.find((tpl) => tpl.id === id);
    if (!template || creating) return;
    haptic("medium");
    setCreating(id);
    const project = createProject(t("newProject.untitled"), template.format, instantiateTemplate(template));
    await saveProject(project);
    router.push(`/editor/${project.id}`);
  }

  return (
    <main className="mx-auto max-w-md px-4 pb-24 pt-6">
      <h1 className="font-display text-2xl font-bold">{t("templates.title")}</h1>
      <p className="mt-1 text-sm text-tg-hint">{t("templates.subtitle")}</p>

      <div className="scrollbar-none -mx-4 mt-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => {
              haptic("light");
              setCategory(c);
            }}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium ${
              category === c ? "bg-tg-button text-tg-button-text" : "bg-tg-bg-secondary"
            }`}
          >
            {t(`templates.categories.${c}`)}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {templates
          .filter((tpl) => tpl.category === category)
          .map((tpl) => (
            <button
              key={tpl.id}
              onClick={() => applyTemplate(tpl.id)}
              disabled={creating !== null}
              className={`overflow-hidden rounded-2xl bg-tg-bg-secondary text-left active:opacity-80 ${
                creating === tpl.id ? "opacity-60" : ""
              }`}
            >
              <SlidePreview slide={tpl.slides[0]} format={tpl.format} width={164} className="w-full" />
              <div className="px-3 py-2">
                <p className="text-xs text-tg-hint">
                  {t("templates.slides", { count: tpl.slides.length })} · {tpl.format.replace("x", "×")}
                </p>
                <p className="mt-0.5 text-sm font-semibold text-tg-link">
                  {creating === tpl.id ? t("common.loading") : t("templates.use")}
                </p>
              </div>
            </button>
          ))}
      </div>

      <BottomNav />
    </main>
  );
}
