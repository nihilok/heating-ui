import { PeriodForm } from "./PeriodForm.tsx";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuthContext } from "../context/useAuthContext.ts";
import { usePrevious } from "../hooks/usePrevious.ts";
import {
  arePeriodArrsEqual,
  arePeriodsEqual,
  DEFAULT_DAYS,
  flashMessage,
  sortPeriods,
} from "../utils.ts";
import { Button } from "./ui/button.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";

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

  const updatePeriods = useCallback(async () => {
    setIsLoading(true);
    const headers = new Headers({
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    });
    try {
      const response = await fetch(`${apiUrl}/periods/${currentSystemId}/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ periods }),
      });

      if (response.status === 401) {
        logout();
        flashMessage("You have been logged out", "error");
        return;
      }

      if (!response.ok) {
        const detail = await response
          .json()
          .then((data: { detail?: string }) => data.detail)
          .catch(() => undefined);
        flashMessage(detail || `Update failed (${response.status})`, "error");
        return;
      }

      refreshSystems();
      flashMessage("Program updated", "success");
    } catch {
      flashMessage("Could not reach the server", "error");
    } finally {
      setIsLoading(false);
    }
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
    <Card id="periods-container">
      <CardHeader className="pb-4">
        <CardTitle>Heating Periods</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-end">
          <Button
            onClick={newPeriod}
            disabled={!hasChanged}
            title={
              hasChanged ? "Add a new period" : "Wait for current changes to save"
            }
          >
            + Add Period
          </Button>
        </div>
      {periods.length === 0 && (
        <p className="my-3 text-center text-sm text-slate-500">
          No periods configured yet. Add one to start scheduling heating.
        </p>
      )}
      <div className="space-y-4">
        {periods.map((p, i) => (
          <div key={p.id}>
            <PeriodForm
              {...p}
              onSubmit={(period: Period) => {
                updatePeriod(p.id as string, period);
              }}
              onRemove={() => onRemovePeriod(p.id)}
            />
            {i < periods.length - 1 && <hr className="mt-4 border-slate-200" />}
          </div>
        ))}
      </div>
      </CardContent>
    </Card>
  );
};
