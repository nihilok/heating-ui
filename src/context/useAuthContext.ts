import * as React from "react";
import { AuthContext } from "./AuthContext.tsx";

export function useAuthContext() {
  return React.useContext(AuthContext);
}
