import * as React from "react";
import { useBrowserStorage } from "../hooks/useBrowserStorage.ts";

const AUTH_URL = window.location.origin;
const API_URL = `${AUTH_URL}/api/v3`;

type Token = string | null;
type LoginFn<T> = (username: string, password: string) => Promise<T>;

interface AuthContext {
  token: Token;
  login: LoginFn<void>;
  register: LoginFn<Response>;
  logout: () => void;
  apiUrl: typeof API_URL;
}

const AuthContext = React.createContext({} as AuthContext);

export function AuthContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    get: getToken,
    set: saveToken,
    clear,
  } = useBrowserStorage("loginToken");

  const [token, setToken] = React.useState<Token>(getToken());

  const headers = new Headers({ "Content-Type": "application/json" });

  const handleSuccess = (token: string) => {
    saveToken(token);
    setToken(token);
  };

  const handleFailure = (responseJSON: { detail: string }) => {
    console.log(responseJSON.detail);
  };

  const handleResponse = (response: Response) => {
    if (response.status === 200) {
      response.json().then((data) => {
        handleSuccess(data.access_token);
      });
    } else {
      response.json().then((data) => handleFailure(data));
    }
  };

  const login: LoginFn<void> = (username, password) => {
    const formData = new FormData();
    formData.append("username", username);
    formData.append("password", password);
    return fetch(`${AUTH_URL}/token/`, {
      method: "POST",
      body: formData,
    }).then(handleResponse);
  };

  const register: LoginFn<Response> = (username, password) => {
    return fetch(`${AUTH_URL}/register/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ username, password }),
    });
  };

  const logout = () => {
    setToken(null);
    clear();
  };

  return (
    <AuthContext.Provider
      value={{ token, login, logout, register, apiUrl: API_URL }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  return React.useContext(AuthContext);
}
