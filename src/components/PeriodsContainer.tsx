import { PeriodForm } from "./PeriodForm.tsx";
import React, { useCallback, useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useAuthContext } from "../context/AuthContext.tsx";
import { usePrevious } from "../hooks/usePrevious.ts";
import { toast } from "react-toastify";

interface PeriodsContainerProps {
  systems: System[];
  currentSystemId: string | null;
}

const DEFAULT_DAYS = {
  monday: true,
  tuesday: true,
  wednesday: true,
  thursday: true,
  friday: true,
  saturday: true,
  sunday: true,
};

function sortPeriods(a: Period, b: Period) {
  return a.start > b.start
    ? 1
    : a.start === b.start
    ? a.end < b.end
      ? 1
      : a.id > b.id
      ? 1
      : -1
    : -1;
}

function arePeriodsEqual(p1: Period, p2: Period): boolean {
  return (
    p1.id === p2.id &&
    p1.start === p2.start &&
    p1.end === p2.end &&
    p1.target === p2.target &&
    // compare days object property
    p1.days.monday === p2.days.monday &&
    p1.days.tuesday === p2.days.tuesday &&
    p1.days.wednesday === p2.days.wednesday &&
    p1.days.thursday === p2.days.thursday &&
    p1.days.friday === p2.days.friday &&
    p1.days.saturday === p2.days.saturday &&
    p1.days.sunday === p2.days.sunday
  );
}

function arePeriodArrsEqual(
  arr1: Period[] | undefined,
  arr2: Period[]
): boolean {
  if (arr1 === undefined) return true;
  if (arr1.length !== arr2.length) return false;

  for (const p1 of arr1) {
    if (!arr2.some((p2) => arePeriodsEqual(p1, p2))) {
      return false;
    }
  }

  return true;
}

export const PeriodsContainer: React.FC<PeriodsContainerProps> = ({
  systems,
  currentSystemId,
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
    });
  }, [apiUrl, currentSystemId, logout, periods, token]);

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
      toast("Program updated", {
        type: "success",
        autoClose: 1250,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
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
