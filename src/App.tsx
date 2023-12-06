import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "./context/AuthContext.tsx";
import { LoginPage } from "./components/LoginPage.tsx";
import { PeriodsContainer } from "./components/PeriodsContainer.tsx";
import { SystemSelect } from "./components/SystemSelect.tsx";
import { Display } from "./components/Display.tsx";
import { useBrowserStorage } from "./hooks/useBrowserStorage.ts";
import { usePrevious } from "./hooks/usePrevious.ts";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import flame from "./assets/flame.png";
import { LoadingSpinner } from "./components/LoadingSpinner.tsx";
import { ActionButtons } from "./components/ActionButtons.tsx";

function App() {
  const { get: loadSystem, set: saveSystem } =
    useBrowserStorage("currentSystem");

  const { token, apiUrl } = useAuthContext();
  const [systems, setSystems] = React.useState<System[]>([]);
  const [currentSystemId, setCurrentSystemId] = useState<string | null>(
    loadSystem() ?? null
  );
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [showProgram, setShowProgram] = React.useState<boolean>(false);

  const getSystems = React.useCallback(
    async function get(): Promise<System[] | void> {
      try {
        const r = await fetch(`${apiUrl}/systems/`);
        if (r.status === 200) {
          return r.json();
        } else {
          r.json().then((err) =>
            toast(err.detail ?? err.error ?? err.message, {
              type: "error",
            })
          );
        }
      } catch (err) {
        toast(err as string, { type: "error" });
      }
    },
    [apiUrl]
  );

  const refreshSystems = React.useCallback(() => {
    getSystems().then((data) => {
      if (!data) return;
      setSystems(data.sort((a, b) => (a.system_id > b.system_id ? 1 : -1)));
    });
  }, [getSystems]);

  useEffect(() => {
    let isActiveRequest = true;
    getSystems().then((data) => {
      if (!isActiveRequest) return;
      if (!data) return;
      setSystems(data.sort((a, b) => (a.system_id > b.system_id ? 1 : -1)));
      setIsLoading(false);
    });

    return () => {
      isActiveRequest = false;
    };
  }, [getSystems]);

  const prevId = usePrevious(currentSystemId);

  useEffect(() => {
    if (prevId != currentSystemId) refreshSystems();
  }, [currentSystemId, prevId, refreshSystems]);

  const currentSystem = useMemo(
    () => systems.find((s) => s.system_id === currentSystemId),
    [systems, currentSystemId]
  );

  return (
    <div className="app-container">
      {token ? (
        isLoading ? (
          <LoadingSpinner show={isLoading} />
        ) : (
          <>
            <h1 className="main-title">
              He
              <img src={flame} alt="flame icon by flaticon" className="flame" />
              t
            </h1>
            <SystemSelect
              persistentSave={saveSystem}
              systems={systems}
              currentSystemId={currentSystemId}
              setCurrentSystemId={setCurrentSystemId}
            />
            {currentSystemId && (
              <>
                <Display
                  key={currentSystemId}
                  currentSystemId={currentSystemId}
                />
                <ActionButtons
                  currentSystem={currentSystem}
                  refreshSystems={refreshSystems}
                />
                {showProgram ? (
                  <>
                    <button
                      onClick={() => setShowProgram(false)}
                      className="btn mt-4"
                    >
                      Hide Program
                    </button>
                    <PeriodsContainer
                      systems={systems}
                      currentSystemId={currentSystemId}
                    />
                  </>
                ) : (
                  <button
                    onClick={() => setShowProgram(true)}
                    className="btn my-4"
                  >
                    Show Program
                  </button>
                )}
              </>
            )}
          </>
        )
      ) : (
        <LoginPage />
      )}
      <ToastContainer newestOnTop={false} />
    </div>
  );
}

export default App;
