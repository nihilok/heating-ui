import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import * as React from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import { useBrowserStorage } from "../hooks/useBrowserStorage.ts";
import "./login-form.css";

const ENABLE_REGISTRATIONS = false;

function PasswordInput(props: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  hasError: boolean;
  label: string;
  name: string;
  id: string;
}) {
  const [showPassword, setShowPassword] = React.useState<boolean>(false);

  return (
    <div className="form-control">
      <label htmlFor={props.id} className="input-label">
        {props.label}
      </label>
      <input
        id={props.id}
        type={showPassword ? "text" : "password"}
        onChange={props.onChange}
        className={props.hasError ? "error" : undefined}
        name={props.name}
        aria-invalid={props.hasError}
        required
      />
      <button
        type="button"
        className="password-toggle"
        aria-label={showPassword ? "Hide password" : "Show password"}
        onClick={() => setShowPassword(!showPassword)}
      >
        <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
      </button>
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
  const resetPasswordMismatch: React.ChangeEventHandler<HTMLInputElement> = () =>
    setPasswordMismatch(false);

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
        className="login-form"
      >
        <div className="form-control">
          <label htmlFor="username" className="input-label">
            Username
          </label>
          <input id="username" name="username" type="text" required />
        </div>
        <PasswordInput
          onChange={resetPasswordMismatch}
          hasError={passwordMismatch && isSignUp}
          label="Password"
          name="password"
          id="password"
        />
        {isSignUp && (
          <PasswordInput
            onChange={resetPasswordMismatch}
            hasError={passwordMismatch}
            label="Confirm password"
            name="confirm"
            id="confirm-password"
          />
        )}
        {passwordMismatch && isSignUp && (
          <p role="alert" className="error my-2">
            Passwords do not match
          </p>
        )}
        <input
          type="submit"
          value={isSignUp ? "Submit" : "Login"}
          className="btn"
        />
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
