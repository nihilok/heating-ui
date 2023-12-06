import { useAuthContext } from "../context/AuthContext.tsx";

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

  function advance() {
    if (!currentSystem) return;
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    fetch(`${apiUrl}/advance/${currentSystem.system_id}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ end_time: addOneHourToCurrentTime() }),
    }).then((response) => {
      if (response.status === 401) {
        logout();
      }
      refreshSystems();
    });
  }

  function boost() {
    if (!currentSystem) return;
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    fetch(`${apiUrl}/boost/${currentSystem.system_id}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ end_time: add10MinsToCurrentTime() }),
    }).then((response) => {
      if (response.status === 401) {
        logout();
      }
      refreshSystems();
    });
  }

  function cancel() {
    if (!currentSystem) return;
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    fetch(`${apiUrl}/cancel_all/${currentSystem.system_id}/`, {
      method: "POST",
      headers,
    }).then((response) => {
      if (response.status === 401) {
        logout();
      }
      refreshSystems();
    });
  }

  console.log(currentSystem);

  return (
    <div className="action-buttons">
      <button
        onClick={advance}
        disabled={!!currentSystem?.advance || currentSystem?.is_within_period}
      >
        Advance (1hr)
      </button>
      <button onClick={boost} disabled={!!currentSystem?.boost}>
        Boost (10m)
      </button>
      {(!!currentSystem?.advance || !!currentSystem?.boost) && (
        <button onClick={cancel} type="reset">
          Cancel
        </button>
      )}
    </div>
  );
}
