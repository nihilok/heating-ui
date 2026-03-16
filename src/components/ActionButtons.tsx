import { AlarmClockPlus, Rocket, X } from "lucide-react";
import { useAuthContext } from "../context/useAuthContext.ts";
import { flashMessage } from "../utils.ts";

interface Props {
  currentSystem?: System;
  refreshSystems: () => void;
}

export function ActionButtons({ currentSystem, refreshSystems }: Props) {
  const { apiUrl, token, logout } = useAuthContext();

  function addOneHourToCurrentTime() {
    const date = new Date();
    date.setHours(date.getHours() + 1);
    return Math.floor(date.getTime() / 1000);
  }

  function add10MinsToCurrentTime() {
    const date = new Date();
    date.setMinutes(date.getMinutes() + 10);
    return Math.floor(date.getTime() / 1000);
  }

  async function performAction(
    endpoint: string,
    successMessage: string,
    body?: object,
  ) {
    if (!currentSystem) return;
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = await fetch(
        `${apiUrl}/${endpoint}/${currentSystem.system_id}/`,
        {
          method: "POST",
          headers,
          body: body ? JSON.stringify(body) : undefined,
        },
      );

      if (response.status === 401) {
        logout();
        flashMessage("You have been logged out", "error");
        return;
      }

      if (!response.ok) {
        const detail = await response
          .json()
          .then((data: { detail?: string }) => data.detail)
          .catch(() => undefined);
        flashMessage(detail || `Request failed (${response.status})`, "error");
        return;
      }

      refreshSystems();
      flashMessage(successMessage, "success");
    } catch {
      flashMessage("Could not reach the server", "error");
    }
  }

  const advanceActive = !!currentSystem?.advance;
  const boostActive = !!currentSystem?.boost;
  const anyActive = advanceActive || boostActive;

  const advanceDisabled = advanceActive || !!currentSystem?.is_within_period;
  const boostDisabled = boostActive;

  return (
    <div className="flex items-start gap-6">
      {/* Advance */}
      <button
        type="button"
        disabled={advanceDisabled}
        onClick={() =>
          performAction("advance", "Advanced for 1 hour", {
            end_time: addOneHourToCurrentTime(),
          })
        }
        className="group flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all ${
            advanceActive
              ? "border-amber-400 bg-amber-50 text-amber-500 shadow-lg shadow-amber-200/60"
              : advanceDisabled
                ? "border-slate-100 bg-slate-50 text-slate-200"
                : "border-slate-200 bg-white text-slate-400 group-hover:border-amber-300 group-hover:text-amber-400"
          }`}
        >
          <AlarmClockPlus className="h-6 w-6" />
        </div>
        <span
          className={`text-xs font-medium ${
            advanceActive
              ? "text-amber-500"
              : advanceDisabled
                ? "text-slate-300"
                : "text-slate-400"
          }`}
        >
          +1h
        </span>
      </button>

      {/* Boost */}
      <button
        type="button"
        disabled={boostDisabled}
        onClick={() =>
          performAction("boost", "Boost enabled for 10 minutes", {
            end_time: add10MinsToCurrentTime(),
          })
        }
        className="group flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
      >
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-full border-2 transition-all ${
            boostActive
              ? "border-blue-400 bg-blue-50 text-blue-500 shadow-lg shadow-blue-200/60"
              : "border-slate-200 bg-white text-slate-400 group-hover:border-blue-300 group-hover:text-blue-400"
          }`}
        >
          <Rocket className="h-6 w-6" />
        </div>
        <span
          className={`text-xs font-medium ${
            boostActive ? "text-blue-500" : "text-slate-400"
          }`}
        >
          Boost
        </span>
      </button>

      {/* Cancel — only shown when something is active */}
      {anyActive && (
        <button
          type="button"
          onClick={() => performAction("cancel_all", "Override cancelled")}
          className="group flex flex-col items-center gap-1.5"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-rose-200 bg-white text-rose-400 transition-all group-hover:border-rose-400 group-hover:bg-rose-50 group-hover:text-rose-500">
            <X className="h-6 w-6" />
          </div>
          <span className="text-xs font-medium text-rose-400">Cancel</span>
        </button>
      )}
    </div>
  );
}
