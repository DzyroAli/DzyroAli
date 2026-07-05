"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";

// The editor (Fabric.js + JSZip ≈ 300KB) is loaded lazily and only on the
// client — critical for 3G users who just browse projects/templates.
const Editor = dynamic(() => import("@/components/editor/Editor"), {
  ssr: false,
  loading: () => <EditorLoading />,
});

function EditorLoading() {
  const t = useTranslations("common");
  return (
    <div className="flex min-h-screen items-center justify-center text-sm text-tg-hint">
      {t("loading")}
    </div>
  );
}

export default function EditorPage({ params }: { params: { id: string } }) {
  return <Editor projectId={params.id} />;
}
