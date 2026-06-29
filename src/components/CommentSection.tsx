"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter as useNextRouter } from "next/navigation";
import { addComment } from "@/lib/actions";
import { Link } from "@/i18n/navigation";
import type { Comment } from "@/lib/types";
import { cn, gradientFor, initials, timeAgo } from "@/lib/utils";

function Avatar({ name }: { name: string }) {
  return (
    <span
      className={cn(
        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold text-white",
        gradientFor(name)
      )}
    >
      {initials(name)}
    </span>
  );
}

function CommentForm({
  productId,
  parentId,
  onDone,
  autoFocus,
}: {
  productId: string;
  parentId?: string | null;
  onDone?: () => void;
  autoFocus?: boolean;
}) {
  const t = useTranslations("product");
  const tErr = useTranslations("errors");
  const router = useNextRouter();
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit() {
    if (!content.trim()) return;
    startTransition(async () => {
      const result = await addComment(productId, content, parentId);
      if (result.error) {
        setError(
          tErr(
            result.error === "demoMode"
              ? "demoMode"
              : result.error === "banned"
                ? "banned"
                : "generic"
          )
        );
        return;
      }
      setContent("");
      setError(null);
      onDone?.();
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("commentPlaceholder")}
        rows={3}
        autoFocus={autoFocus}
        maxLength={2000}
        className="w-full rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition-colors focus:border-teal-500"
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <button
        type="button"
        onClick={submit}
        disabled={pending || !content.trim()}
        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {t("commentSubmit")}
      </button>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  productId,
  canComment,
}: {
  comment: Comment;
  replies: Comment[];
  productId: string;
  canComment: boolean;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const [replying, setReplying] = useState(false);
  const name = comment.author?.full_name ?? comment.author?.username ?? "?";

  return (
    <div className="flex gap-3">
      <Avatar name={name} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          {comment.author ? (
            <Link
              href={`/makers/${comment.author.username}`}
              className="text-sm font-semibold text-slate-900 hover:text-teal-700"
            >
              {name}
            </Link>
          ) : (
            <span className="text-sm font-semibold text-slate-900">{name}</span>
          )}
          <span className="text-xs text-slate-400">
            {timeAgo(comment.created_at, locale)}
          </span>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {comment.content}
        </p>
        {canComment && (
          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="mt-1 text-xs font-medium text-slate-400 hover:text-teal-600"
          >
            {t("reply")}
          </button>
        )}
        {replying && (
          <div className="mt-3">
            <CommentForm
              productId={productId}
              parentId={comment.id}
              autoFocus
              onDone={() => setReplying(false)}
            />
          </div>
        )}
        {replies.length > 0 && (
          <div className="mt-4 space-y-4 border-l-2 border-slate-100 pl-4">
            {replies.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                replies={[]}
                productId={productId}
                canComment={canComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function CommentSection({
  productId,
  comments,
  canComment,
}: {
  productId: string;
  comments: Comment[];
  canComment: boolean;
}) {
  const t = useTranslations("product");
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_id === id);

  return (
    <section className="space-y-6">
      <h2 className="text-lg font-bold text-slate-900">
        {t("comments")}{" "}
        <span className="font-normal text-slate-400">({comments.length})</span>
      </h2>

      {canComment ? (
        <CommentForm productId={productId} />
      ) : (
        <p className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
          <Link href="/login" className="font-semibold text-teal-700 underline">
            {t("commentLoginRequired")}
          </Link>
        </p>
      )}

      {topLevel.length === 0 ? (
        <p className="text-sm text-slate-500">{t("noComments")}</p>
      ) : (
        <div className="space-y-6">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesOf(c.id)}
              productId={productId}
              canComment={canComment}
            />
          ))}
        </div>
      )}
    </section>
  );
}
