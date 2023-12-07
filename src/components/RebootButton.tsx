import { flashMessage } from "../utils.ts";
import { useAuthContext } from "../context/AuthContext.tsx";

export function RebootButton() {
  const { apiUrl, token, logout } = useAuthContext();
  function reboot() {
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    fetch(`${apiUrl}/reboot_system/`, {
      method: "POST",
      headers,
    }).then((response) => {
      if (response.status === 401) {
        logout();
        return;
      }
      flashMessage("Rebooting server", "success");
    });
  }

  return (
    <button onClick={reboot} className="btn">
      Reboot
    </button>
  );
}
