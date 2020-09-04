import React, { FunctionComponent } from "react";
import { render } from "react-dom";
import "./styles.scss";
import { useLocation } from "wouter";
import { useSearchParam } from "react-use";

const App: FunctionComponent<{}> = () => {
  const [location] = useLocation();
  const repo = useSearchParam("repo");
  const api = useSearchParam("api");
  const latest = useSearchParam("latest");

  if (latest) {
    console.log("loading latest");
    fetch(
      `https://raw.githubusercontent.com/${repo}/master/data/${api}/api.json`
    )
      .then((response) => {
        if (!response.ok) throw new Error();
        return response.json();
      })
      .then((json) => {
        console.log("got json", json);
      })
      .catch((error) => console.log);
  }

  console.log(location);

  return (
    <div>
      <h1>App</h1>
    </div>
  );
};

render(<App />, document.getElementById("root"));
