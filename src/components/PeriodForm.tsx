import * as React from "react";
import { useEffect, useRef } from "react";
import "./new-periods-form.css";

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

export function PeriodForm(props: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [start, setStart] = React.useState<string>(decimalToTime(props.start));
  const [end, setEnd] = React.useState<string>(decimalToTime(props.end));
  const [temperature, setTemperature] = React.useState<number>(props.target);
  const [monday, setMonday] = React.useState<boolean>(props.days.monday);
  const [tuesday, setTuesday] = React.useState<boolean>(props.days.tuesday);
  const [wednesday, setWednesday] = React.useState<boolean>(
    props.days.wednesday
  );
  const [thursday, setThursday] = React.useState<boolean>(props.days.thursday);
  const [friday, setFriday] = React.useState<boolean>(props.days.friday);
  const [saturday, setSaturday] = React.useState<boolean>(props.days.saturday);
  const [sunday, setSunday] = React.useState<boolean>(props.days.sunday);

  const newPeriod = React.useMemo(
    () => ({
      id: props.id,
      start: timeToDecimal(start),
      end: timeToDecimal(end),
      target: temperature,
      days: {
        monday,
        tuesday,
        wednesday,
        thursday,
        friday,
        saturday,
        sunday,
      },
    }),
    [
      props.id,
      start,
      end,
      temperature,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
    ]
  );

  const handleSubmit: React.FormEventHandler = (event) => {
    event.preventDefault();
    submit();
  };

  const onBlur: React.FocusEventHandler = () => {
    submit();
  };

  const submit = React.useCallback(() => {
    props.onSubmit(newPeriod);
  }, [props, newPeriod]);

  const [tempTemperature, setTempTemperature] =
    React.useState<number>(temperature);

  const [shouldUpdate, setShouldUpdate] = React.useState<boolean>(false);

  useEffect(() => {
    if (shouldUpdate) {
      submit();
      setShouldUpdate(false);
    }
  }, [shouldUpdate, submit]);

  return (
    <form
      onSubmit={handleSubmit}
      ref={formRef}
      className="flash-in my-4 period-form"
    >
      <button className="close-icon" onClick={props.onRemove} type="button">
        X
      </button>
      <div className="flex gap-3 justify-center items-center my-3">
        <label className="form-label">
          <div>From: </div>
          <input
            className="form-input"
            name="start-time"
            placeholder="Start time"
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value)}
            onBlur={onBlur}
            required={true}
          />
        </label>
        <label className="form-label">
          <div>To: </div>
          <input
            className="form-input"
            name="end-time"
            placeholder="Start time"
            type="time"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
            onBlur={onBlur}
            required={true}
          />
        </label>
      </div>
      <div className="flex gap-1 justify-center items-center">
        <label
          className={`dotw-label ${monday ? "is-checked" : ""}`}
          data-display-text="Monday"
        >
          <input
            type="checkbox"
            className="dotw-checkbox"
            name="monday"
            checked={monday}
            onChange={(e) => {
              setMonday(e.target.checked);
              setShouldUpdate(true);
            }}
          />
        </label>
        <label
          className={`dotw-label ${tuesday ? "is-checked" : ""}`}
          data-display-text="Tuesday"
        >
          <input
            type="checkbox"
            className="dotw-checkbox"
            name="tuesday"
            checked={tuesday}
            onChange={(e) => {
              setTuesday(e.target.checked);
              setShouldUpdate(true);
            }}
          />
        </label>
        <label
          className={`dotw-label ${wednesday ? "is-checked" : ""}`}
          data-display-text="Wednesday"
        >
          <input
            type="checkbox"
            className="dotw-checkbox"
            name="wednesday"
            checked={wednesday}
            onChange={(e) => {
              setWednesday(e.target.checked);
              setShouldUpdate(true);
            }}
          />
        </label>
        <label
          className={`dotw-label ${thursday ? "is-checked" : ""}`}
          data-display-text="Thursday"
        >
          <input
            type="checkbox"
            className="dotw-checkbox"
            name="thursday"
            checked={thursday}
            onChange={(e) => {
              setThursday(e.target.checked);
              setShouldUpdate(true);
            }}
          />
        </label>
        <label
          className={`dotw-label ${friday ? "is-checked" : ""}`}
          data-display-text="Friday"
        >
          <input
            type="checkbox"
            className="dotw-checkbox"
            name="friday"
            checked={friday}
            onChange={(e) => {
              setFriday(e.target.checked);
              setShouldUpdate(true);
            }}
          />
        </label>
        <label
          className={`dotw-label ${saturday ? "is-checked" : ""}`}
          data-display-text="Saturday"
        >
          <input
            type="checkbox"
            className="dotw-checkbox"
            name="saturday"
            checked={saturday}
            onChange={(e) => {
              setSaturday(e.target.checked);
              setShouldUpdate(true);
            }}
          />
        </label>
        <label
          className={`dotw-label ${sunday ? "is-checked" : ""}`}
          data-display-text="Sunday"
        >
          <input
            type="checkbox"
            className="dotw-checkbox"
            name="sunday"
            checked={sunday}
            onChange={(e) => {
              setSunday(e.target.checked);
              setShouldUpdate(true);
            }}
          />
        </label>
      </div>
      <label className="flex items-center justify-center gap-3 my-2">
        Temp:{" "}
        <input
          type="range"
          min={MIN_TEMP}
          max={MAX_TEMP}
          value={tempTemperature}
          step={1}
          onChange={(e) => setTempTemperature(parseInt(e.target.value))}
          onMouseUp={(e) => {
            setTemperature(parseInt(e.currentTarget.value));
          }}
          onTouchEnd={(e) => {
            setTemperature(parseInt(e.currentTarget.value));
          }}
        />
        <div style={{ width: "4ch", textAlign: "right" }} onBlur={onBlur}>
          {tempTemperature}˚C
        </div>
      </label>
      <div className="flex justify-center my-3 hidden">
        <input type="submit" value="Save" />
      </div>
    </form>
  );
}
