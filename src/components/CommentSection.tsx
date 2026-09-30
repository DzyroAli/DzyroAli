"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter as useNextRouter } from "next/navigation";
import { addComment, deleteComment } from "@/lib/actions";
import { Link } from "@/i18n/navigation";
import type { Comment } from "@/lib/types";
import { timeAgo } from "@/lib/utils";
import { Avatar } from "./ui/Avatar";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/Field";

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
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={t("commentPlaceholder")}
        rows={3}
        autoFocus={autoFocus}
        maxLength={2000}
        aria-invalid={error ? true : undefined}
      />
      {error && (
        <p role="alert" className="text-xs text-critical">
          {error}
        </p>
      )}
      <Button
        onClick={submit}
        disabled={!content.trim()}
        loading={pending}
        size="sm"
      >
        {t("commentSubmit")}
      </Button>
    </div>
  );
}

function CommentItem({
  comment,
  replies,
  productId,
  canComment,
  canModerate,
}: {
  comment: Comment;
  replies: Comment[];
  productId: string;
  canComment: boolean;
  canModerate: boolean;
}) {
  const t = useTranslations("product");
  const locale = useLocale();
  const router = useNextRouter();
  const [replying, setReplying] = useState(false);
  const [deletePending, startDelete] = useTransition();
  const name = comment.author?.full_name ?? comment.author?.username ?? "?";

  const remove = () =>
    startDelete(async () => {
      await deleteComment(comment.id);
      router.refresh();
    });

  return (
    <div className="flex gap-3">
      <Avatar name={name} username={comment.author?.username} src={comment.author?.avatar_url} size={36} />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2">
          {comment.author ? (
            <Link
              href={`/makers/${comment.author.username}`}
              className="rounded text-sm font-medium text-ink hover:text-brand-ink"
            >
              {name}
            </Link>
          ) : (
            <span className="text-sm font-medium text-ink">{name}</span>
          )}
          {/* Node and browser ICU disagree on uz relative-time output, and the
              value depends on Date.now() anyway — keep the server's text. */}
          <time
            dateTime={comment.created_at}
            suppressHydrationWarning
            className="text-xs text-ink-muted"
          >
            {timeAgo(comment.created_at, locale)}
          </time>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-ink">
          {comment.content}
        </p>
        <div className="mt-1 flex items-center gap-3">
          {canComment && (
            <button
              type="button"
              onClick={() => setReplying((v) => !v)}
              className="rounded text-xs font-medium text-ink-muted hover:text-brand"
            >
              {t("reply")}
            </button>
          )}
          {canModerate && (
            <button
              type="button"
              onClick={remove}
              disabled={deletePending}
              className="rounded text-xs font-medium text-ink-muted hover:text-critical disabled:opacity-50"
            >
              {t("delete")}
            </button>
          )}
        </div>
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
          <div className="mt-4 space-y-4 border-l border-line pl-4">
            {replies.map((r) => (
              <CommentItem
                key={r.id}
                comment={r}
                replies={[]}
                productId={productId}
                canComment={canComment}
                canModerate={canModerate}
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
  canModerate = false,
}: {
  productId: string;
  comments: Comment[];
  canComment: boolean;
  canModerate?: boolean;
}) {
  const t = useTranslations("product");
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (id: string) => comments.filter((c) => c.parent_id === id);

  return (
    <section className="space-y-6">
      <h2 className="text-base font-semibold text-ink">
        {t("comments")}{" "}
        <span className="font-normal text-ink-muted">({comments.length})</span>
      </h2>

      {canComment ? (
        <CommentForm productId={productId} />
      ) : (
        <p className="rounded-xl bg-surface-muted px-4 py-3 text-sm text-ink-muted">
          <Link
            href="/login"
            className="rounded font-medium text-brand-ink underline"
          >
            {t("commentLoginRequired")}
          </Link>
        </p>
      )}

      {topLevel.length === 0 ? (
        <p className="text-sm text-ink-muted">{t("noComments")}</p>
      ) : (
        <div className="space-y-6">
          {topLevel.map((c) => (
            <CommentItem
              key={c.id}
              comment={c}
              replies={repliesOf(c.id)}
              productId={productId}
              canComment={canComment}
              canModerate={canModerate}
            />
          ))}
        </div>
      )}
    </section>
  );
}
