import { Pause, Play } from "lucide-react";
import { useAuthContext } from "../context/useAuthContext.ts";
import { flashMessage } from "../utils.ts";

export function PauseButton({
  currentSystem,
  refreshSystems,
}: {
  currentSystem: System;
  refreshSystems: () => void;
}) {
  const { apiUrl, token, logout } = useAuthContext();
  const programRunning = !!currentSystem.program;

  const pauseResume = () => {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    fetch(
      `${apiUrl}/program/${currentSystem.system_id}/${programRunning ? "off" : "on"}/`,
      { method: "POST", headers },
    )
      .then((response) => {
        if (response.status === 401) {
          logout();
          return;
        }
        if (!response.ok) {
          flashMessage(`Could not ${programRunning ? "pause" : "resume"} program`, "error");
          return;
        }
        flashMessage(`Program ${programRunning ? "paused" : "resumed"}`, "success");
        refreshSystems();
      })
      .catch(() => {
        flashMessage("Could not reach the server", "error");
      });
  };

  return (
    <button
      type="button"
      onClick={pauseResume}
      className="group flex flex-col items-center gap-1.5"
    >
      <div
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all ${
          programRunning
            ? "border-slate-200 bg-white text-slate-400 group-hover:border-amber-300 group-hover:text-amber-400"
            : "border-emerald-400 bg-emerald-50 text-emerald-500 shadow-lg shadow-emerald-200/60"
        }`}
      >
        {programRunning ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
      </div>
      <span
        className={`text-xs font-medium ${
          programRunning ? "text-slate-400" : "text-emerald-500"
        }`}
      >
        {programRunning ? "Pause" : "Resume"}
      </span>
    </button>
  );
}
