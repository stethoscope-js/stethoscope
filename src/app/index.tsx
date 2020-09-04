import React, { FunctionComponent } from "react";
import { render } from "react-dom";
import "./styles.scss";
import { useLocation } from "wouter";

const App: FunctionComponent<{}> = () => {
  const [location] = useLocation();
  console.log(location);

  return (
    <div>
      <h1>App</h1>
    </div>
  );
};

render(<App />, document.getElementById("root"));
