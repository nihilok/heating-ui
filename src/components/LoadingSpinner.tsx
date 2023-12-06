import "./loading.css";

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
    <div className={pos === "top-right" ? "loading-spinner-absolute" : ""}>
      <div className={`lds-ring ${sm ? "loading-sm" : ""}`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  ) : null;
}
