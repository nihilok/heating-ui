function titleCase(s: string) {
  return s
    .split(" ")
    .map(
      (w) => `${w.substring(0, 1).toUpperCase()}${w.substring(1).toLowerCase()}`
    )
    .join(" ");
}

export function SystemSelect(props: {
  persistentSave: (s: string) => void;
  systems: System[];
  currentSystemId: string | null;
  setCurrentSystemId: (
    value: ((prevState: string | null) => string | null) | string | null
  ) => void;
}) {
  return (
    <div>
      {props.systems.map((s) => (
        <button
          key={s.system_id}
          className={`btn system-select-button ${
            props.currentSystemId === s.system_id ? "selected-system" : ""
          }`}
          onClick={() => {
            props.persistentSave(s.system_id);
            props.setCurrentSystemId(s.system_id);
          }}
        >
          {titleCase(s.system_id)}
        </button>
      ))}
    </div>
  );
}
