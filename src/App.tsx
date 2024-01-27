import React, { useEffect, useMemo, useState } from "react";
import { useAuthContext } from "./context/AuthContext.tsx";
import { LoginPage } from "./components/LoginPage.tsx";
import { PeriodsContainer } from "./components/PeriodsContainer.tsx";
import { SystemSelect } from "./components/SystemSelect.tsx";
import { Display } from "./components/Display.tsx";
import { useBrowserStorage } from "./hooks/useBrowserStorage.ts";
import { usePrevious } from "./hooks/usePrevious.ts";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import flame from "./assets/flame.png";
import { LoadingSpinner } from "./components/LoadingSpinner.tsx";
import { ActionButtons } from "./components/ActionButtons.tsx";
import { PauseButton } from "./components/PauseButton.tsx";

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


  function flashError(err: any) {
    toast(err.detail ?? err.error ?? err.message ?? "Something went wrong!", {
      type: "error",
    })
  }

  const getSystems = React.useCallback(
    async function get(): Promise<System[] | void> {
      try {
        const r = await fetch(`${apiUrl}/systems/`);
        if (r.status === 200) {
          return r.json();
        } else {
          r.json().then((err) =>
            flashError(err)
          );
        }
      } catch (err) {
        flashError(err)
      }
    },
    [apiUrl]
  );

  const [refreshSystemKey, setRefreshSystemKey] = useState(false);


  const refreshSystems = React.useCallback(() => {
    getSystems().then((data) => {
      if (!data) return;
      setSystems(data.sort((a, b) => (a.system_id > b.system_id ? 1 : -1)));
      setRefreshSystemKey((prev) => !prev);
    }).catch(err => {
      setSystems([])
      flashError(err);
    });
  }, [getSystems]);

  useEffect(() => {
    let isActiveRequest = true;
    getSystems().then((data) => {
      if (!isActiveRequest) return;
      if (!data) return;
      setSystems(data.sort((a, b) => (a.system_id > b.system_id ? 1 : -1)));
      setIsLoading(false);
    }).catch(err => flashError(err));

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
    [systems, currentSystemId, refreshSystemKey]
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
            {currentSystem && (
              <>
                <Display
                  key={currentSystemId}
                  currentSystemId={currentSystemId}
                  currentSystem={currentSystem}
                />
                <ActionButtons
                  currentSystem={currentSystem}
                  refreshSystems={refreshSystems}
                />
                <>
                  <div
                    className={
                      showProgram ? "flex gap-3 mt-3" : "flex gap-3 mt-3 mb-4"
                    }
                  >
                    <button
                      onClick={() => setShowProgram(!showProgram)}
                      className={`btn`}
                    >
                      {showProgram ? "Hide Times" : "Show Times"}
                    </button>
                    {currentSystem && (
                      <PauseButton
                        currentSystem={currentSystem}
                        refreshSystems={refreshSystems}
                      />
                    )}
                  </div>
                  {showProgram && (
                    <PeriodsContainer
                      systems={systems}
                      currentSystemId={currentSystemId}
                      refreshSystems={refreshSystems}
                    />
                  )}
                </>
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
