import { useAuthContext } from "../context/AuthContext.tsx";

export function PauseButton({
  currentSystem,
  refreshSystems,
}: {
  currentSystem: System;
  refreshSystems: () => void;
}) {
  const { apiUrl, token, logout } = useAuthContext();

  const pauseResume = () => {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    fetch(
      `${apiUrl}/program/${currentSystem.system_id}/${
        currentSystem.program ? "off" : "on"
      }`,
      {
        method: "POST",
        headers,
      }
    ).then((response) => {
      if (response.status === 401) {
        logout();
        return;
      }
      refreshSystems();
    });
  };

  return (
    <div>
      <button className="btn" onClick={pauseResume}>
        {currentSystem.program ? "Pause" : "Resume"}
      </button>{" "}
    </div>
  );
}
