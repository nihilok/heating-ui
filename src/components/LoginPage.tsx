import * as React from "react";
import { useAuthContext } from "../context/useAuthContext.ts";
import { useBrowserStorage } from "../hooks/useBrowserStorage.ts";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";

const ENABLE_REGISTRATIONS = false;

function PasswordInput(props: {
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  hasError: boolean;
  label: string;
  name: string;
  id: string;
}) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id}>{props.label}</Label>
      <div className="relative">
        <Input
          id={props.id}
          type={showPassword ? "text" : "password"}
          onChange={props.onChange}
          className={props.hasError ? "border-rose-500 focus-visible:ring-rose-300" : ""}
          name={props.name}
          aria-invalid={props.hasError}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-700"
          aria-label={showPassword ? "Hide password" : "Show password"}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export function LoginPage() {
  const { get: loadIsSignedUp, set: saveIsSignUp } = useBrowserStorage("isSignUp");
  const [isSignUp, setIsSignUp] = React.useState<boolean>(
    loadIsSignedUp() ?? ENABLE_REGISTRATIONS,
  );
  const [passwordMismatch, setPasswordMismatch] = React.useState<boolean>(false);
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
      if (isSignUp) {
        register(username, password).then((response) =>
          response.status === 200 ? onSetSignUp(false) : onSetSignUp(true),
        );
      } else {
        login(username, password);
      }
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Create an account" : "Welcome back"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Sign up to configure your heating systems." : "Log in to continue."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" type="text" required />
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
              <p role="alert" className="text-sm text-rose-600">
                Passwords do not match
              </p>
            )}
            <Button type="submit" className="w-full">
              {isSignUp ? "Submit" : "Login"}
            </Button>
          </form>
          {ENABLE_REGISTRATIONS && (
            <div className="mt-4 text-sm">
              {isSignUp ? (
                <button
                  type="button"
                  className="text-slate-600 underline"
                  onClick={() => onSetSignUp(false)}
                >
                  Already have an account?
                </button>
              ) : (
                <button
                  type="button"
                  className="text-slate-600 underline"
                  onClick={() => onSetSignUp(true)}
                >
                  Don&apos;t have an account yet?
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
