import { flashMessage } from "../utils.ts";
import { useAuthContext } from "../context/useAuthContext.ts";
import { Button } from "./ui/button.tsx";

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
    <Button onClick={reboot} variant="outline">
      Reboot
    </Button>
  );
}
