import React, { FunctionComponent, useState } from "react";
import { render } from "react-dom";
import { useSearchParam, createMemo } from "react-use";
import { pick, dot } from "dot-object";
import { Link } from "wouter";
import { Line, Bar } from "react-chartjs-2";
import dayjs from "dayjs";
import "./styles.scss";

const subDirectories = [
  "rescuetime-time-tracking",
  "oura-activity",
  "oura-sleep",
];

const categoryColors: { [index: string]: string } = {
  "Software Development": "#00429d",
  Business: "#474291",
  "Design & Composition": "#654285",
  "Communication & Scheduling": "#7b4379",
  Utilities: "#8e436d",
  "Reference & Learning": "#9f4360",
  Uncategorized: "#af4354",
  "News & Opinion": "#be4347",
  "Social Networking": "#cc423a",
  Entertainment: "#da422b",
  Shopping: "#e84118",
};

const itemNames: { [index: string]: string } = {
  weeks: "Week",
  days: "Month",
  months: "Year",
};

const getItemName = (name: string) => itemNames[name] ?? name;

export const zero = (num: string) =>
  parseInt(num) > 9 ? parseInt(num) : `0${num}`;

const changeLastPart = (path: string, last: string) => {
  const key = path.split("/");
  key.pop();
  return `${key.join("/")}/${last}`;
};

const cleanValues = (items: number[], api: string, path: string) => {
  // if (path.includes("/months/") || path.includes("/days/") || path.includes("/weeks/"))
  return items.map((val) => parseFloat((val / 3600).toFixed(2)));
  // return items.map((val) => parseInt(String(val)));
};
const cleanKeys = (items: string[], api: string, path: string) => {
  if (path.includes("/months/"))
    return items.map((val) => dayjs(`2020-${zero(val)}-15`).format("MMMM"));
  if (path.includes("/weeks/"))
    return items.map((val) => dayjs(val).format("dddd, MMM D"));
  return items;
};
const cleanTitle = (text?: string, path?: string) => {
  if (!text) return "";
  text = text.replace(".json", "");
  if (path?.includes("/days/"))
    text = dayjs(`${path.split("/days/")[1].split("/")[0]}-${text}-10`).format(
      "MMMM YYYY"
    );
  if (path?.includes("/weeks/"))
    return `Week ${text}, ${path.split("/weeks/")[1].split("/")[0]}`;
  return text;
};

const getDatasets = (
  graphData: { [index: number]: number | { [index: string]: number } },
  api: string,
  path: string,
  color: string
) => {
  let allValuesAreNumbers = true;
  Object.values(graphData).forEach((value) => {
    if (typeof value === "object") allValuesAreNumbers = false;
  });
  let total: any = {};
  Object.keys(graphData).forEach((key0) => {
    const value = (graphData as any)[key0];
    if (typeof value === "object") {
      Object.keys(value).forEach((key) => {
        total[key] = total[key] ?? [];
        total[key].push(value[key] ?? 0);
      });
    }
  });
  Object.keys(total).forEach(
    (key) => (total[key] = cleanValues(total[key], api, path))
  );
  if (!allValuesAreNumbers)
    return Object.keys(total)
      .sort(
        (a, b) =>
          Object.keys(categoryColors).indexOf(a) -
          Object.keys(categoryColors).indexOf(b)
      )
      .map((key) => ({
        label: key,
        data: total[key],
        borderWidth: 1,
        borderColor: "#fff",
        backgroundColor: categoryColors[key] ?? color,
      }));
  return [
    {
      data: cleanValues(Object.values(graphData) as number[], api, path),
      backgroundColor: color || undefined,
    },
  ];
};

const App: FunctionComponent<{}> = () => {
  const path = useSearchParam("path");
  const repo = useSearchParam("repo");
  const api = useSearchParam("api");
  const latest = useSearchParam("latest");
  const color = useSearchParam("color") || "#04AAF5";
  const chart = useSearchParam("chart") || "bar";

  const [previous, setPrevious] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [next, setNext] = useState<string | null>(null);
  const [latestOptions, setLastestOptions] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<{
    [index: number]: number | { [index: string]: number };
  }>({});

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
          window.location.href = `./?repo=${encodeURIComponent(
            repo
          )}&api=${encodeURIComponent(api)}&path=${encodeURIComponent(
            `summary/${latest.replace(/\./g, "/")}/${items[items.length - 1]}`
          )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
            chart
          )}`;
        } else if (typeof items === "object") {
          const dotted = dot(items);
          const lastKey = Object.keys(dotted).pop();
          if (lastKey) {
            window.location.href = `./?repo=${encodeURIComponent(
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
      .catch(() => setError(true));
  } else if (path && path.startsWith("summary/")) {
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
        if (subDirectories.includes(api)) {
          if (
            JSON.stringify(latestOptions) !==
            JSON.stringify(
              Object.keys(data[path.split("summary/")[1].split("/")[0]])
            )
          )
            setLastestOptions(
              Object.keys(data[path.split("summary/")[1].split("/")[0]])
            );
        } else if (
          JSON.stringify(latestOptions) !== JSON.stringify(Object.keys(data))
        )
          setLastestOptions(Object.keys(data));
      })
      .catch(() => setError(true));
    useMemoApiData(repo, api, path)
      .then(setGraphData)
      .catch(() => setError(true));
  }

  if (error)
    return (
      <div className="error">
        <svg
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          x="0px"
          y="0px"
          viewBox="0 0 100 100"
          enableBackground="new 0 0 100 100"
        >
          <path d="M94,78.2L55.9,14.4c-2.7-4.5-9.2-4.9-12-0.5L6.1,78.1C3.1,82.8,6.5,90,12.1,90h75.8 C93.4,90,96.8,82.9,94,78.2z M49.8,79.2c-2.7,0-4.9-2.2-4.9-4.9s2.2-4.9,4.9-4.9c2.7,0,4.9,2.2,4.9,4.9S52.5,79.2,49.8,79.2z  M55,61.2c0,2.7-2.3,4.9-5,4.9s-5-2.2-5-4.9V35.6c0-2.7,2.3-4.9,5-4.9s5,2.2,5,4.9V61.2z"></path>
        </svg>
        <p>We were unable to load this data.</p>
      </div>
    );

  if (!path)
    return (
      <div className="loading">
        <svg
          className="spin"
          height="300px"
          width="300px"
          fill="#000000"
          xmlns="http://www.w3.org/2000/svg"
          version="1.1"
          x="0px"
          y="0px"
          viewBox="0 0 44 44"
          enableBackground="new 0 0 44 44"
          aria-label="Loading"
        >
          <g>
            <path d="M40.687,20.738h-0.231l-5.859,0.014l-0.284,0.004c-0.899,0.071-1.609,0.826-1.607,1.745c0,0.966,0.783,1.747,1.749,1.751 h6.275c0.902-0.079,1.61-0.836,1.608-1.758C42.336,21.56,41.609,20.795,40.687,20.738z M32.197,15.295l0.004-0.004l4.212-4.203 l0.222-0.226c0.582-0.689,0.543-1.727-0.107-2.377c-0.661-0.658-1.718-0.686-2.412-0.075l-0.161,0.164l-4.133,4.15l-0.198,0.2 c-0.585,0.687-0.554,1.719,0.097,2.37C30.404,15.977,31.513,15.977,32.197,15.295z M22.504,2.684 c-0.936,0-1.703,0.729-1.761,1.648l0.001,0.232l0.017,5.851v0.283c0.075,0.901,0.83,1.609,1.748,1.609 c0.968,0,1.752-0.783,1.752-1.748v-0.008l0.003-5.944V4.29C24.184,3.388,23.425,2.684,22.504,2.684z M15.291,12.807l-4.206-4.203 l-0.226-0.225c-0.692-0.579-1.729-0.544-2.38,0.107c-0.662,0.661-0.687,1.72-0.077,2.409l0.163,0.164l4.155,4.125l0.201,0.2 c0.69,0.586,1.725,0.551,2.374-0.096c0.685-0.687,0.685-1.791,0.002-2.474L15.291,12.807z M10.693,24.233 c0.902-0.07,1.611-0.825,1.611-1.744c-0.002-0.969-0.784-1.748-1.75-1.751H4.277c-0.901,0.079-1.608,0.836-1.606,1.755 c0,0.937,0.728,1.7,1.65,1.758h0.231l5.859-0.019H10.693z M12.81,29.692l-0.005,0.007l-4.21,4.204l-0.223,0.222 c-0.58,0.692-0.544,1.729,0.107,2.377c0.663,0.66,1.718,0.688,2.412,0.079l0.163-0.165l4.132-4.15l0.199-0.199 c0.585-0.688,0.553-1.724-0.097-2.371C14.601,29.013,13.495,29.013,12.81,29.692z M24.245,34.293 c-0.072-0.9-0.829-1.609-1.747-1.609c-0.969,0-1.752,0.783-1.752,1.748v0.007l-0.003,5.945l0.001,0.317 c0.08,0.898,0.837,1.605,1.76,1.605c0.936,0,1.7-0.73,1.76-1.648v-0.232l-0.019-5.851V34.293z M36.442,33.932l-4.156-4.125 l-0.199-0.2c-0.689-0.586-1.725-0.554-2.375,0.097c-0.684,0.683-0.685,1.79-0.001,2.474l0.006,0.007l4.205,4.204l0.226,0.22 c0.694,0.583,1.73,0.547,2.38-0.103c0.662-0.664,0.687-1.719,0.079-2.41L36.442,33.932z"></path>
          </g>
        </svg>
      </div>
    );

  const labels = cleanKeys(Object.keys(graphData), api, path);
  const datasets = getDatasets(graphData, api, path, color);

  return (
    <div>
      <nav>
        <div>
          {previous ? (
            <Link
              to={`./?repo=${encodeURIComponent(repo)}&api=${encodeURIComponent(
                api
              )}&path=${encodeURIComponent(
                changeLastPart(path, previous)
              )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
                chart
              )}`}
            >
              &larr; {cleanTitle(previous.replace(".json", ""), path)}
            </Link>
          ) : undefined}
        </div>
        <div>{cleanTitle(path.split("/").pop(), path)}</div>
        <div>
          {next ? (
            <Link
              to={`./?repo=${encodeURIComponent(repo)}&api=${encodeURIComponent(
                api
              )}&path=${encodeURIComponent(
                changeLastPart(path, next)
              )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
                chart
              )}`}
            >
              {cleanTitle(next, path)} &rarr;
            </Link>
          ) : undefined}
        </div>
      </nav>
      {Object.keys(graphData).length ? (
        chart === "line" ? (
          <Line
            data={{
              labels,
              datasets,
            }}
            options={{
              legend: { display: false },
              scales: {
                xAxes: [
                  {
                    stacked: true,
                    gridLines: { display: false },
                  },
                ],
                yAxes: [
                  {
                    stacked: true,
                    ticks: {
                      callback: (label) => `${label} hours`,
                    },
                  },
                ],
              },
            }}
          />
        ) : (
          <Bar
            data={{
              labels,
              datasets,
            }}
            options={{
              legend: { display: false },
              scales: {
                xAxes: [
                  {
                    stacked: true,
                    gridLines: { display: false },
                  },
                ],
                yAxes: [
                  {
                    stacked: true,
                    ticks: {
                      callback: (label) => `${label} hours`,
                    },
                  },
                ],
              },
            }}
          />
        )
      ) : undefined}
      <nav>
        {latestOptions
          .filter((item) => !item.endsWith("years"))
          .sort(
            (a, b) =>
              Object.keys(itemNames).indexOf(a) -
              Object.keys(itemNames).indexOf(b)
          )
          .map((item) => (
            <Link
              className={
                subDirectories.includes(api)
                  ? path.split("summary/")[1].split("/")[1] === item
                    ? "active"
                    : ""
                  : path.split("summary/")[1].split("/")[0] === item
                  ? "active"
                  : ""
              }
              key={item}
              to={`./?repo=${encodeURIComponent(repo)}&api=${encodeURIComponent(
                api
              )}&latest=${encodeURIComponent(
                subDirectories.includes(api)
                  ? `${path.split("summary/")[1].split("/")[0]}.${item}`
                  : item
              )}&color=${encodeURIComponent(color)}&chart=${encodeURIComponent(
                chart
              )}`}
            >
              {getItemName(item)}
            </Link>
          ))}
      </nav>
    </div>
  );
};

render(<App />, document.getElementById("root"));
