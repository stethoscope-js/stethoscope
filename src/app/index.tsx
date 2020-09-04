import React, { FunctionComponent, useState } from "react";
import { render } from "react-dom";
import "./styles.scss";
import { useSearchParam, createMemo } from "react-use";
import { pick } from "dot-object";

const App: FunctionComponent<{}> = () => {
  const path = useSearchParam("path");
  const repo = useSearchParam("repo");
  const api = useSearchParam("api");
  const latest = useSearchParam("latest");

  const [paths, setPaths] = useState<string[]>([]);
  const [graphData, setGraphData] = useState<{ [index: number]: number }>({});

  const getApiData = async (repo: string, api: string, path: string) => {
    const response = await fetch(
      `https://raw.githubusercontent.com/${repo}/master/data/${api}/${path}`
    );
    if (!response.ok) throw new Error();
    return response.json();
  };
  const useMemoApiData = createMemo(getApiData);

  if (!repo || !api) return <h1>No repo or API</h1>;

  if (latest) {
    console.log("loading latest");
    useMemoApiData(repo, api, "api.json")
      .then((json) => {
        const items = pick(latest, json);
        if (!Array.isArray(items)) throw new Error();
        window.location.href = `/?repo=${encodeURIComponent(
          repo
        )}&api=${encodeURIComponent(api)}&path=${encodeURIComponent(
          `summary/${latest}/${items[items.length - 1]}`
        )}`;
      })
      .catch(console.log);
  }

  if (path && path.startsWith("summary/")) {
    useMemoApiData(repo, api, "api.json")
      .then((data) => {
        const key = path.split("summary/")[1].split("/");
        key.pop();
        setPaths(pick(key.join("."), data));
      })
      .catch(console.log);
    useMemoApiData(repo, api, path).then(setGraphData).catch(console.log);
  }

  if (!path) return <h1>No path</h1>;
  console.log(new Date());

  return (
    <div>
      <h1>{path ?? "No path"}</h1>
      <p>{JSON.stringify(paths)}</p>
      <p>{JSON.stringify(graphData)}</p>
    </div>
  );
};

render(<App />, document.getElementById("root"));
