"use client";

import { Check, Trash2, X } from "lucide-react";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { deleteProduct, setProductStatus } from "@/lib/actions";

const REASON_PRESETS = ["spam", "incomplete", "duplicate", "offtopic"] as const;

/** Approve мгновенно публикует; Reject открывает модалку с причиной. */
export function ModerationButtons({ productId }: { productId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [reason, setReason] = useState("");

  const approve = () =>
    startTransition(async () => {
      await setProductStatus(productId, "approved");
      router.refresh();
    });

  const reject = () =>
    startTransition(async () => {
      await setProductStatus(productId, "rejected", reason);
      setRejectOpen(false);
      setReason("");
      router.refresh();
    });

  const remove = () =>
    startTransition(async () => {
      await deleteProduct(productId);
      setDeleteOpen(false);
      router.refresh();
    });

  return (
    <>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={approve}
          className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-3.5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          <Check size={14} strokeWidth={3} />
          {t("approve")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setRejectOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
        >
          <X size={14} strokeWidth={3} />
          {t("reject")}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => setDeleteOpen(true)}
          aria-label={t("delete")}
          className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-2.5 py-2 text-slate-400 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
        >
          <Trash2 size={14} />
        </button>
      </div>

      {rejectOpen && (
        <div
          className="anim-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setRejectOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="anim-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900">{t("rejectTitle")}</h3>
            <p className="mt-1 text-xs text-slate-500">{t("rejectHint")}</p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {REASON_PRESETS.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setReason(t(`rejectReason_${key}`))}
                  className="rounded-full border border-slate-200 px-2.5 py-1 text-xs text-slate-600 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
                >
                  {t(`rejectReason_${key}`)}
                </button>
              ))}
            </div>

            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              maxLength={500}
              placeholder={t("rejectPlaceholder")}
              className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-rose-400"
            />

            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectOpen(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={reject}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {t("rejectConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteOpen && (
        <div
          className="anim-fade-in fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          onClick={() => setDeleteOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="anim-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-slate-900">{t("deleteTitle")}</h3>
            <p className="mt-1 text-sm text-slate-500">{t("deleteHint")}</p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteOpen(false)}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={remove}
                className="rounded-xl bg-rose-600 px-3.5 py-2 text-xs font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {t("deleteConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
