import React, { FunctionComponent, useState } from "react";
import { render } from "react-dom";
import { useSearchParam, createMemo } from "react-use";
import { pick, dot } from "dot-object";
import { Link } from "wouter";
import { Line, Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import "./styles.scss";

export const zero = (num: string) => (parseInt(num) > 9 ? num : `0${num}`);

const changeLastPart = (path: string, last: string) => {
  const key = path.split("/");
  key.pop();
  return `${key.join("/")}/${last}`;
};

const cleanValues = (items: number[], api: string, path: string) => {
  if (["wakatime-time-tracking", "rescuetime-time-tracking"].includes(api)) {
    if (path.includes("/months/"))
      return items.map((val) => parseFloat((val / 3600).toFixed(2)));
  }
  return items.map((val) => parseInt(String(val)));
};
const cleanKeys = (items: string[], api: string, path: string) => {
  if (["wakatime-time-tracking", "rescuetime-time-tracking"].includes(api)) {
    if (path.includes("/months/"))
      return items.map((val) => dayjs(`2020-${zero(val)}-15`).format("MMMM"));
  }
  return items;
};

const App: FunctionComponent<{}> = () => {
  const path = useSearchParam("path");
  const repo = useSearchParam("repo");
  const api = useSearchParam("api");
  const latest = useSearchParam("latest");
  const color = useSearchParam("color") || "#04AAF5";
  const chart = useSearchParam("chart") || "bar";

  const [previous, setPrevious] = useState<string | null>(null);
  const [next, setNext] = useState<string | null>(null);
  const [graphData, setGraphData] = useState<{ [index: number]: number }>({});

  const getApiData = async (repo: string, api: string, path: string) => {
    const key = `${repo}${api}${path}`;
    const cachedValue = window.localStorage.getItem(key);
    if (cachedValue) {
      const val = JSON.parse(cachedValue);
      if (dayjs(val.expiry).isBefore(dayjs())) return val.value;
      else window.localStorage.removeItem(key);
    }
    const response = await fetch(
      `https://raw.githubusercontent.com/${repo}/master/data/${api}/${path}`
    );
    if (!response.ok) throw new Error();
    const json = await response.json();
    window.localStorage.setItem(
      key,
      JSON.stringify({ value: json, expiry: dayjs().add(1, "hour").unix() })
    );
    return json;
  };
  const useMemoApiData = createMemo(getApiData);

  if (!repo || !api) return <h1>No repo or API</h1>;

  if (latest) {
    console.log("loading latest");
    useMemoApiData(repo, api, "api.json")
      .then((json) => {
        const items = pick(latest, json);
        if (Array.isArray(items)) {
          window.location.href = `/?repo=${encodeURIComponent(
            repo
          )}&api=${encodeURIComponent(api)}&path=${encodeURIComponent(
            `summary/${latest}/${items[items.length - 1]}`
          )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
            chart
          )}`;
        } else if (typeof items === "object") {
          const dotted = dot(items);
          const lastKey = Object.keys(dotted).pop();
          if (lastKey) {
            window.location.href = `/?repo=${encodeURIComponent(
              repo
            )}&api=${encodeURIComponent(api)}&path=${encodeURIComponent(
              `summary/${latest.replace(/\./g, "/")}/${lastKey
                .split("[")[0]
                .replace(/\./g, "/")}/${dotted[lastKey]}`
            )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
              chart
            )}`;
          }
        }
      })
      .catch(console.log);
  }

  if (path && path.startsWith("summary/")) {
    useMemoApiData(repo, api, "api.json")
      .then((data) => {
        const key = path.split("summary/")[1].split("/");
        const last = key.pop();
        const items: string[] = pick(key.join("."), data);
        items.forEach((element, index) => {
          if (element === last) {
            if (index > 0) setPrevious(items[index - 1]);
            else setPrevious(null);
            if (index < items.length) setNext(items[index + 1]);
            else setNext(null);
          }
        });
      })
      .catch(console.log);
    useMemoApiData(repo, api, path).then(setGraphData).catch(console.log);
  }

  if (!path) return <h1>No path</h1>;
  console.log(new Date());

  return (
    <div>
      {previous ? (
        <Link
          to={`/?repo=${encodeURIComponent(repo)}&api=${encodeURIComponent(
            api
          )}&path=${encodeURIComponent(
            changeLastPart(path, previous)
          )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
            chart
          )}`}
        >
          Previous: {previous}
        </Link>
      ) : undefined}
      {next ? (
        <Link
          to={`/?repo=${encodeURIComponent(repo)}&api=${encodeURIComponent(
            api
          )}&path=${encodeURIComponent(
            changeLastPart(path, next)
          )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
            chart
          )}`}
        >
          Next: {next}
        </Link>
      ) : undefined}
      {Object.keys(graphData).length ? (
        chart === "line" ? (
          <Line
            data={{
              labels: cleanKeys(Object.keys(graphData), api, path),
              datasets: [
                {
                  data: cleanValues(Object.values(graphData), api, path),
                  backgroundColor: color || undefined,
                },
              ],
            }}
            options={{ legend: { display: false } }}
          />
        ) : (
          <Bar
            data={{
              labels: cleanKeys(Object.keys(graphData), api, path),
              datasets: [
                {
                  data: cleanValues(Object.values(graphData), api, path),
                  backgroundColor: color || undefined,
                },
              ],
            }}
            options={{ legend: { display: false } }}
          />
        )
      ) : undefined}
    </div>
  );
};

render(<App />, document.getElementById("root"));
