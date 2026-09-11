// Only an internal, single-slash path is a safe post-login redirect target.
// Rejects protocol-relative ("//evil.com"), absolute ("https://evil.com"),
// non-path ("javascript:...") and backslash-disguised ("/\evil.com") values.
export function safeNextPath(next: string | null | undefined): string {
  if (!next) return "/";
  if (!next.startsWith("/")) return "/";
  if (next.startsWith("//")) return "/";
  if (next.includes("\\")) return "/";
  return next;
}
