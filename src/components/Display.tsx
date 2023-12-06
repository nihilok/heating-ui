import GaugeComponent from "react-gauge-component";
import { useAuthContext } from "../context/AuthContext.tsx";
import React, { useEffect } from "react";
import "./display.css";
import { useBrowserStorage } from "../hooks/useBrowserStorage.ts";
import { LoadingSpinner } from "./LoadingSpinner.tsx";

const MIN_TEMP = 16;

const MAX_TEMP = 26;

const TOTAL = MAX_TEMP - MIN_TEMP;

const SMALL_AREA = Math.floor(TOTAL / 10);
const MEDIUM_AREA = Math.floor(TOTAL / 3);

export function Display(props: { currentSystemId: string | null }) {
  const { get: loadTemp, set: saveTemp } = useBrowserStorage(
    `temperature:${props.currentSystemId}`
  );
  const { get: loadTarget, set: saveTarget } = useBrowserStorage(
    `target:${props.currentSystemId}`
  );
  const { get: loadRelay, set: saveRelay } = useBrowserStorage(
    `relay:${props.currentSystemId}`
  );

  const { apiUrl } = useAuthContext();
  const [temperature, setTemperature] = React.useState<number | undefined>(
    loadTemp()
  );
  const [target, setTarget] = React.useState<number | undefined>(loadTarget());
  const [relayOn, setRelayOn] = React.useState<boolean>(loadRelay() ?? false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const getTemp = React.useCallback(
    async function (): Promise<{ temperature?: number }> {
      const res = await fetch(
        `${apiUrl}/temperature/${props.currentSystemId}/`
      );
      if (res.status === 200) return res.json();
      return {};
    },
    [apiUrl, props.currentSystemId]
  );

  const getTarget = React.useCallback(
    async function (): Promise<{
      current_target?: number;
      relay_on?: boolean;
    }> {
      const res = await fetch(`${apiUrl}/target/${props.currentSystemId}/`);
      if (res.status === 200) return res.json();
      return {};
    },
    [apiUrl, props.currentSystemId]
  );

  useEffect(() => {
    let isActive = true;
    function temperatureFunc() {
      getTemp().then((data) => {
        if (isActive) {
          saveTemp(data.temperature);
          setTemperature(data.temperature);
        }
      });
      getTarget()
        .then((data) => {
          if (isActive) {
            console.log(data);
            saveTarget(data.current_target);
            saveRelay(data.relay_on);
            setTarget(data.current_target);
            setRelayOn(data.relay_on ?? false);
          }
        })
        .finally(() => {
          if (isActive) setIsLoading(false);
        });
    }
    temperatureFunc();
    const interval = setInterval(temperatureFunc, 3000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [isLoading, getTarget, getTemp, saveTemp, saveTarget, saveRelay]);

  useEffect(() => {
    setIsLoading(true);
  }, [props.currentSystemId]);

  return (
    <>
      <div className="fixed-width">
        <GaugeComponent
          type="semicircle"
          arc={{
            width: 0.2,
            padding: 0.015,
            cornerRadius: 4,
            subArcs: [
              {
                limit: MIN_TEMP + SMALL_AREA,
                color: "#535bf2",
              },
              {
                limit: MIN_TEMP + MEDIUM_AREA,
                color: "#19f5d4",
              },
              {
                limit: MAX_TEMP - MEDIUM_AREA,
                color: "#5BE12C",
              },
              {
                limit: MAX_TEMP - SMALL_AREA,
                color: "#F5CD19",
              },
              {
                color: "#EA4228",
              },
            ],
          }}
          pointer={{
            color: relayOn ? "#EA4228" : "#737373",
            length: 0.9,
            width: 15,
            elastic: true,
            animate: false,
          }}
          labels={{
            valueLabel: { formatTextValue: (value) => value + "ºC" },
            tickLabels: {
              hideMinMax: true,
            },
          }}
          value={temperature || (MAX_TEMP - MIN_TEMP) / 2}
          minValue={MIN_TEMP}
          maxValue={MAX_TEMP}
        />
      </div>
      <p className="mb-4">
        {target && target <= MAX_TEMP
          ? `Target: ${target}˚C`
          : target
          ? "BOOST"
          : ""}
      </p>
      <LoadingSpinner show={isLoading} sm={true} pos={"top-right"} />
    </>
  );
}
