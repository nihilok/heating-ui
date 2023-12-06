import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import { useBrowserStorage } from "../hooks/useBrowserStorage.ts";
import "./login-form.css";

const ENABLE_REGISTRATIONS = false;

function PasswordInput(props: {
  onChange: () => void;
  hasError: boolean;
  placeholder?: string;
  name: string;
}) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  return (
    <div className="form-control">
      <input
        type={showPassword ? "text" : "password"}
        onChange={props.onChange}
        className={props.hasError ? "error" : undefined}
        placeholder={props.placeholder}
        name={props.name}
        required
      />
      <FontAwesomeIcon
        icon={showPassword ? faEyeSlash : faEye}
        onClick={() => setShowPassword(!showPassword)}
      />
    </div>
  );
}

export function LoginPage() {
  const { get: loadIsSignedUp, set: saveIsSignUp } =
    useBrowserStorage("isSignUp");
  const [isSignUp, setIsSignUp] = React.useState<boolean>(
    loadIsSignedUp() ?? ENABLE_REGISTRATIONS
  );
  const [passwordMismatch, setPasswordMismatch] =
    React.useState<boolean>(false);
  const resetPasswordMismatch = () => setPasswordMismatch(false);

  const { register, login, token } = useAuthContext();
  const onSetSignUp = (signup: boolean) => {
    saveIsSignUp(signup);
    setIsSignUp(signup);
  };

  if (token) {
    return null;
  }
  const onSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");
    const confirm = formData.get("confirm");
    if (typeof confirm === "string" && password !== confirm) {
      setPasswordMismatch(true);
      return;
    }
    if (typeof username === "string" && typeof password === "string") {
      isSignUp
        ? register(username, password).then((response) =>
            response.status === 200 ? onSetSignUp(false) : onSetSignUp(true)
          )
        : login(username, password);
    }
  };

  return (
    <div className="form-wrapper">
      <h3>{isSignUp ? "Create an account" : "Log In"}</h3>
      <form
        onSubmit={onSubmit}
        data-form-error={"Passwords do not match"}
        className={
          passwordMismatch && isSignUp ? "login-form form-error" : "login-form"
        }
      >
        <div className="form-control">
          <input name="username" type="text" placeholder="Username" required />
        </div>
        <PasswordInput
          onChange={resetPasswordMismatch}
          hasError={passwordMismatch && isSignUp}
          placeholder="Password"
          name="password"
        />
        {isSignUp && (
          <PasswordInput
            onChange={resetPasswordMismatch}
            hasError={passwordMismatch}
            placeholder="Confirm Password"
            name="confirm"
          />
        )}
        <input
          type="submit"
          value={isSignUp ? "Submit" : "Login"}
          className="btn"
        />
        {/*{passwordMismatch && <p className="error">Passwords do not match</p>}*/}
      </form>
      {ENABLE_REGISTRATIONS && (
        <div className="my2">
          {isSignUp ? (
            <a
              href="#"
              onClick={() => {
                saveIsSignUp(false);
                setIsSignUp(false);
              }}
            >
              Already have an account?
            </a>
          ) : (
            <a
              href="#"
              onClick={() => {
                saveIsSignUp(true);
                setIsSignUp(true);
              }}
            >
              Don't have an account yet?
            </a>
          )}
        </div>
      )}
    </div>
  );
}
