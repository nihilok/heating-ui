import * as React from "react";
import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "./ui/button.tsx";
import { Input } from "./ui/input.tsx";
import { Label } from "./ui/label.tsx";

const MAX_TEMP = 26;
const MIN_TEMP = 5;

function timeToDecimal(time: string) {
  const hoursMinutes = time.split(/[.:]/);
  const hours = parseInt(hoursMinutes[0], 10);
  const minutes = hoursMinutes[1] ? parseInt(hoursMinutes[1], 10) : 0;
  return hours + minutes / 60;
}

function decimalToTime(decimalHours: number) {
  const hours = Math.floor(decimalHours);
  const minutes = Math.round((decimalHours - hours) * 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

type Props = Period & {
  onSubmit: (p: Period) => void;
  onRemove: () => void;
};

type DayName =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

const dayOrder: { key: DayName; label: string }[] = [
  { key: "monday", label: "M" },
  { key: "tuesday", label: "T" },
  { key: "wednesday", label: "W" },
  { key: "thursday", label: "T" },
  { key: "friday", label: "F" },
  { key: "saturday", label: "S" },
  { key: "sunday", label: "S" },
];

export function PeriodForm(props: Props) {
  const [start, setStart] = React.useState<string>(decimalToTime(props.start));
  const [end, setEnd] = React.useState<string>(decimalToTime(props.end));
  const [temperature, setTemperature] = React.useState<number>(props.target);
  const [days, setDays] = React.useState<Days>(props.days);
  const [tempTemperature, setTempTemperature] = React.useState<number>(props.target);
  const [shouldUpdate, setShouldUpdate] = React.useState<boolean>(false);

  const newPeriod = React.useMemo(
    () => ({
      id: props.id,
      start: timeToDecimal(start),
      end: timeToDecimal(end),
      target: temperature,
      days,
    }),
    [props.id, start, end, temperature, days],
  );

  const submit = React.useCallback(() => {
    props.onSubmit(newPeriod);
  }, [props, newPeriod]);

  useEffect(() => {
    if (shouldUpdate) {
      submit();
      setShouldUpdate(false);
    }
  }, [shouldUpdate, submit]);

  function onUpdateTemperature(value: string) {
    setTemperature(parseInt(value, 10));
    setShouldUpdate(true);
  }

  function onRemovePeriod() {
    if (window.confirm("Delete this period? This cannot be undone.")) {
      props.onRemove();
    }
  }

  const inputIdPrefix = `period-${props.id}`;

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
      className="space-y-4 rounded-lg border border-slate-200 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-slate-600">Heating window</p>
        <Button
          className="h-8 px-2"
          variant="ghost"
          type="button"
          title="Delete period"
          aria-label="Delete period"
          onClick={onRemovePeriod}
        >
          <Trash2 className="h-4 w-4 text-rose-600" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`${inputIdPrefix}-start-time`}>From</Label>
          <Input
            id={`${inputIdPrefix}-start-time`}
            name="start-time"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            onBlur={submit}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${inputIdPrefix}-end-time`}>To</Label>
          <Input
            id={`${inputIdPrefix}-end-time`}
            name="end-time"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            onBlur={submit}
            required
          />
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-slate-600">Days</legend>
        <div className="grid grid-cols-7 gap-2">
          {dayOrder.map((day, idx) => (
            <button
              key={`${day.key}-${idx}`}
              type="button"
              className={`h-9 w-9 rounded-full border text-xs font-semibold ${
                days[day.key]
                  ? "border-slate-900 bg-slate-900 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
              }`}
              aria-label={day.key}
              aria-pressed={days[day.key]}
              onClick={() => {
                setDays((prev) => ({ ...prev, [day.key]: !prev[day.key] }));
                setShouldUpdate(true);
              }}
            >
              {day.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="space-y-2">
        <Label htmlFor={`${inputIdPrefix}-temperature`}>
          Target temperature: <span className="font-semibold">{tempTemperature}˚C</span>
        </Label>
        <input
          id={`${inputIdPrefix}-temperature`}
          className="w-full accent-slate-900"
          type="range"
          min={MIN_TEMP}
          max={MAX_TEMP}
          value={tempTemperature}
          step={1}
          aria-label="Target temperature"
          aria-valuemin={MIN_TEMP}
          aria-valuemax={MAX_TEMP}
          aria-valuenow={tempTemperature}
          aria-valuetext={`${tempTemperature}˚C`}
          onChange={(e) => setTempTemperature(parseInt(e.target.value, 10))}
          onMouseUp={(e) => onUpdateTemperature(e.currentTarget.value)}
          onTouchEnd={(e) => onUpdateTemperature(e.currentTarget.value)}
        />
      </div>
      <button type="submit" className="hidden">
        Save
      </button>
    </form>
  );
}
