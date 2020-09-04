import React, { FunctionComponent, useState } from "react";
import { render } from "react-dom";
import "./styles.scss";
import { useSearchParam, createMemo } from "react-use";
import { pick } from "dot-object";
import { Link } from "wouter";

const changeLastPart = (path: string, last: string) => {
  const key = path.split("/");
  key.pop();
  return `${key.join("/")}/${last}`;
};

const App: FunctionComponent<{}> = () => {
  const path = useSearchParam("path");
  const repo = useSearchParam("repo");
  const api = useSearchParam("api");
  const latest = useSearchParam("latest");

  const [previous, setPrevious] = useState<string>();
  const [next, setNext] = useState<string>();
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
        const last = key.pop();
        const items: string[] = pick(key.join("."), data);
        items.forEach((element, index) => {
          if (element === last) {
            if (index > 0) setPrevious(items[index - 1]);
            if (index < items.length) setNext(items[index + 1]);
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
      <h1>{path ?? "No path"}</h1>
      {previous ? (
        <Link
          to={`/?repo=${encodeURIComponent(repo)}&api=${encodeURIComponent(
            api
          )}&path=${encodeURIComponent(changeLastPart(path, previous))}`}
        >
          Previous: {previous}
        </Link>
      ) : undefined}
      {next ? (
        <Link
          to={`/?repo=${encodeURIComponent(repo)}&api=${encodeURIComponent(
            api
          )}&path=${encodeURIComponent(changeLastPart(path, next))}`}
        >
          Next: {next}
        </Link>
      ) : undefined}
      <p>{JSON.stringify(graphData)}</p>
    </div>
  );
};

render(<App />, document.getElementById("root"));
