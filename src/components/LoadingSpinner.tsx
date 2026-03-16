export function LoadingSpinner({
  show,
  sm,
  pos,
}: {
  show: boolean;
  sm?: boolean;
  pos?: "top-right";
}) {
  return show ? (
    <div className={pos === "top-right" ? "absolute right-4 top-4" : ""}>
      <div
        className={`animate-spin rounded-full border-slate-400 border-t-transparent ${
          sm ? "h-6 w-6 border-2" : "h-10 w-10 border-4"
        } border-solid`}
        aria-label="Loading"
      />
    </div>
  ) : null;
}
