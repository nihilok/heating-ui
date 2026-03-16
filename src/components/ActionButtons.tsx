import { useAuthContext } from "../context/AuthContext.tsx";
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
    body?: object
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
        }
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
    } catch (_err) {
      flashMessage("Could not reach the server", "error");
    }
  }

  function advance() {
    performAction("advance", "Advanced for 1 hour", {
      end_time: addOneHourToCurrentTime(),
    });
  }

  function boost() {
    performAction("boost", "Boost enabled for 10 minutes", {
      end_time: add10MinsToCurrentTime(),
    });
  }

  function cancel() {
    performAction("cancel_all", "Override cancelled");
  }

  return (
    <div className="action-buttons">
      <button
        onClick={advance}
        className="btn"
        disabled={!!currentSystem?.advance || currentSystem?.is_within_period}
      >
        Advance (1hr)
      </button>
      <button onClick={boost} disabled={!!currentSystem?.boost} className="btn">
        Boost (10m)
      </button>
      {(!!currentSystem?.advance || !!currentSystem?.boost) && (
        <button onClick={cancel} type="reset" className="btn">
          Cancel
        </button>
      )}
    </div>
  );
}
