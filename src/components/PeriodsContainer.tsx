import { PeriodForm } from "./PeriodForm.tsx";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuthContext } from "../context/AuthContext.tsx";
import { usePrevious } from "../hooks/usePrevious.ts";
import { toast } from "react-toastify";
import {
  arePeriodArrsEqual,
  arePeriodsEqual,
  DEFAULT_DAYS,
  sortPeriods,
} from "../utils.ts";

interface PeriodsContainerProps {
  systems: System[];
  currentSystemId: string | null;
  refreshSystems: () => void;
}

export const PeriodsContainer: React.FC<PeriodsContainerProps> = ({
  systems,
  currentSystemId,
  refreshSystems,
}) => {
  const [periods, setPeriods] = React.useState<Period[]>([]);
  const [hasChanged, setHasChanged] = useState(true);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const { apiUrl, token, logout } = useAuthContext();

  const updatePeriods = useCallback(() => {
    setIsLoading(true);
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    fetch(`${apiUrl}/periods/${currentSystemId}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({ periods }),
    }).then((response) => {
      if (response.status === 401) {
        logout();
      }
      setIsLoading(false);
      refreshSystems();
      toast("Program updated", {
        type: "success",
        autoClose: 1250,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme:
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light",
      });
    });
  }, [apiUrl, currentSystemId, logout, periods, refreshSystems, token]);

  function newPeriod() {
    if (hasChanged) {
      setHasChanged(false);
      setPeriods((prev) =>
        [
          {
            start: 0,
            end: 23.98,
            target: 21,
            days: DEFAULT_DAYS,
            id: uuidv4(),
          },
          ...prev,
        ].sort(sortPeriods)
      );
    }
  }

  const previousPeriods = usePrevious(periods);

  const [updateLock, setUpdateLock] = React.useState<boolean>(false);

  const updatePeriod = React.useCallback(
    (id: string, period: Period) => {
      const newPeriods: Period[] = [...periods];
      const periodIds = periods.map((p) => p.id);
      const newIdx = periodIds.indexOf(id);
      const newPeriod = newPeriods[newIdx];
      if (!arePeriodsEqual(newPeriod, period) && !updateLock) {
        newPeriods[newIdx] = period;
        setPeriods(newPeriods.sort(sortPeriods));
        setHasChanged(true);
      }
    },
    [periods, updateLock]
  );

  useEffect(() => {
    setUpdateLock(true);
    const system = systems.find((s) => s.system_id === currentSystemId);
    if (!system) return;
    const newPeriods = [...system.periods].sort(sortPeriods);
    setPeriods(newPeriods);
  }, [currentSystemId, systems]);

  useEffect(() => {
    if (updateLock) {
      setUpdateLock(false);
      return;
    }
    if (!isLoading && !arePeriodArrsEqual(previousPeriods, periods)) {
      updatePeriods();
    }
  }, [updateLock, updatePeriods, isLoading, previousPeriods, periods]);

  function onRemovePeriod(id: string) {
    setPeriods(periods.filter((p) => p.id !== id));
    setHasChanged(true);
  }

  return (
    <div className="periods-container">
      <div className="new-period-button">
        <button onClick={newPeriod} disabled={!hasChanged} className="btn">
          + Add Period
        </button>
      </div>
      {periods.map((p, i) => (
        <div key={p.id}>
          <PeriodForm
            {...p}
            onSubmit={(period: Period) => {
              updatePeriod(p.id as string, period);
            }}
            onRemove={() => onRemovePeriod(p.id)}
          />
          {i < periods.length - 1 && <hr />}
        </div>
      ))}
    </div>
  );
};
