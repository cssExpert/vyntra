"use client";

import { MessageCircle } from "lucide-react";
import { useComments, type PublicComment } from "@/lib/themes/useComments";
import { useCommentSubmit } from "@/lib/themes/useCommentSubmit";
import { ContactRecaptchaScript } from "@/lib/themes/useContactFormSubmit";

function countComments(comments: PublicComment[]): number {
  return comments.reduce((total, c) => total + 1 + countComments(c.replies), 0);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}

interface CommentsSectionProps {
  orgId: string | undefined;
  resourceId: string | undefined;
  accentColor?: string;
  className?: string;
}

/**
 * Theme-agnostic comments section for a storefront resource (blog post
 * today). Callers must gate rendering on the resource's own allowComments
 * flag (already clamped against the global Settings toggle server-side) —
 * this component doesn't re-check that, it just lists/accepts comments.
 */
export function CommentsSection({ orgId, resourceId, accentColor = "#2563eb", className = "" }: CommentsSectionProps) {
  const { comments, loading, refresh } = useComments(orgId, "blog", resourceId);
  const {
    values,
    setField,
    replyTo,
    setReplyTo,
    submitting,
    submitted,
    error,
    handleSubmit,
    reset,
    captchaActive,
    recaptchaSiteKey,
  } = useCommentSubmit(orgId, "blog", resourceId, refresh);

  const total = countComments(comments);

  return (
    <div className={`border-t border-gray-100 dark:border-gray-800 pt-8 mt-8 ${className}`}>
      <ContactRecaptchaScript active={captchaActive} siteKey={recaptchaSiteKey} onReady={() => {}} />

      <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-gray-100 mb-6">
        <MessageCircle className="w-5 h-5" style={{ color: accentColor }} />
        {total > 0 ? `${total} Comment${total === 1 ? "" : "s"}` : "Comments"}
      </h2>

      {!loading && comments.length > 0 && (
        <ul className="space-y-6 mb-8">
          {comments.map((comment) => (
            <li key={comment.id}>
              <CommentItem comment={comment} accentColor={accentColor} onReply={() => setReplyTo(comment.id)} />
              {comment.replies.length > 0 && (
                <ul className="mt-4 ml-6 sm:ml-10 space-y-4 border-l border-gray-100 dark:border-gray-800 pl-4 sm:pl-6">
                  {comment.replies.map((reply) => (
                    <li key={reply.id}>
                      <CommentItem comment={reply} accentColor={accentColor} />
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}

      {!loading && comments.length === 0 && (
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">Be the first to comment.</p>
      )}

      {submitted ? (
        <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5 p-5 text-sm">
          <p className="font-semibold text-gray-800 dark:text-gray-100">Thanks for your comment!</p>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            It&apos;s awaiting approval and will appear here once reviewed.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-3 text-xs font-semibold"
            style={{ color: accentColor }}
          >
            Leave another comment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {replyTo && (
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
              <span>Replying to a comment</span>
              <button type="button" onClick={() => setReplyTo(null)} className="font-semibold hover:underline">
                Cancel
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Your name"
              value={values.authorName}
              onChange={(e) => setField("authorName", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
            <input
              type="email"
              placeholder="Your email"
              value={values.authorEmail}
              onChange={(e) => setField("authorEmail", e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2"
              style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
            />
          </div>
          <textarea
            placeholder="Write a comment…"
            rows={4}
            value={values.body}
            onChange={(e) => setField("body", e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-transparent text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 outline-none focus:ring-2 resize-none"
            style={{ "--tw-ring-color": accentColor } as React.CSSProperties}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold text-white disabled:opacity-60 transition-opacity"
            style={{ backgroundColor: accentColor }}
          >
            {submitting ? "Posting…" : replyTo ? "Post Reply" : "Post Comment"}
          </button>
        </form>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  accentColor,
  onReply,
}: {
  comment: PublicComment;
  accentColor: string;
  onReply?: () => void;
}) {
  return (
    <div className="flex gap-3">
      <div
        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-xs font-bold text-white"
        style={{ backgroundColor: accentColor }}
      >
        {(comment.authorName || "?").charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {comment.authorName || "Anonymous"}
          </span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 leading-relaxed whitespace-pre-line">
          {comment.body}
        </p>
        {onReply && (
          <button
            type="button"
            onClick={onReply}
            className="mt-1.5 text-xs font-semibold hover:underline"
            style={{ color: accentColor }}
          >
            Reply
          </button>
        )}
      </div>
    </div>
  );
}
