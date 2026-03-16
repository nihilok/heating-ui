import GaugeComponent from "react-gauge-component";
import { useAuthContext } from "../context/useAuthContext.ts";
import React, { useEffect } from "react";
import { useBrowserStorage } from "../hooks/useBrowserStorage.ts";
import { LoadingSpinner } from "./LoadingSpinner.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card.tsx";

const MIN_TEMP = 16;

const MAX_TEMP = 26;

const TOTAL = MAX_TEMP - MIN_TEMP;

const SMALL_AREA = Math.floor(TOTAL / 10);
const MEDIUM_AREA = Math.floor(TOTAL / 3);
const REQUEST_TIMEOUT_MS = 5000;

export function Display(props: {
  currentSystemId: string | null;
  currentSystem: System;
}) {
  const { get: loadTemp, set: saveTemp } = useBrowserStorage(
    `temperature:${props.currentSystemId}`,
  );
  const { get: loadTarget, set: saveTarget } = useBrowserStorage(
    `target:${props.currentSystemId}`,
  );
  const { get: loadRelay, set: saveRelay } = useBrowserStorage(
    `relay:${props.currentSystemId}`,
  );

  const { apiUrl } = useAuthContext();
  const [temperature, setTemperature] = React.useState<
    number | string | null | undefined
  >(loadTemp());
  const [target, setTarget] = React.useState<number | undefined>(loadTarget());
  const [relayOn, setRelayOn] = React.useState<boolean>(loadRelay() ?? false);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const fetchWithTimeout = React.useCallback(async (url: string) => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      return await fetch(url, { signal: controller.signal });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }, []);

  const getTemp = React.useCallback(
    async function (): Promise<{ temperature?: number }> {
      try {
        const res = await fetchWithTimeout(
          `${apiUrl}/temperature/${props.currentSystemId}/`,
        );
        if (res.status === 200) return res.json();
      } catch {
        return {};
      }
      return {};
    },
    [apiUrl, fetchWithTimeout, props.currentSystemId],
  );

  const getTarget = React.useCallback(
    async function (): Promise<{
      current_target?: number;
      relay_on?: boolean;
    }> {
      try {
        const res = await fetchWithTimeout(`${apiUrl}/target/${props.currentSystemId}/`);
        if (res.status === 200) return res.json();
      } catch {
        return {};
      }
      return {};
    },
    [apiUrl, fetchWithTimeout, props.currentSystemId],
  );

  useEffect(() => {
    let isActive = true;

    async function temperatureFunc() {
      const [tempData, targetData] = await Promise.all([getTemp(), getTarget()]);
      if (!isActive) {
        return;
      }
      saveTemp(tempData.temperature);
      setTemperature(tempData.temperature);
      saveTarget(targetData.current_target);
      saveRelay(targetData.relay_on);
      setTarget(targetData.current_target);
      setRelayOn(targetData.relay_on ?? false);
      setIsLoading(false);
    }

    void temperatureFunc();
    const interval = setInterval(temperatureFunc, 3000);
    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [getTarget, getTemp, saveTemp, saveTarget, saveRelay]);

  useEffect(() => {
    setIsLoading(true);
  }, [props.currentSystemId]);

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <CardTitle>Current Temperature</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mx-auto w-full max-w-sm">
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
          value={
            parseInt(temperature as string)
              ? (temperature as number)
              : (MAX_TEMP - MIN_TEMP) / 2
          }
          minValue={MIN_TEMP}
          maxValue={MAX_TEMP}
        />
        </div>
        <p className="mt-2 text-center text-lg font-medium">
          {target && target <= MAX_TEMP
            ? `Target: ${target}˚C`
            : target
              ? "BOOST"
              : ""}
          {!props.currentSystem.program && " (Paused)"}
        </p>
      </CardContent>
      <LoadingSpinner show={isLoading} sm={true} pos={"top-right"} />
    </Card>
  );
}
