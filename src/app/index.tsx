import React, { FunctionComponent } from "react";
import { render } from "react-dom";
import "./styles.scss";
import { Route } from "wouter";

const App: FunctionComponent<{}> = () => (
  <div>
    <Route path="/">
      <h1>App</h1>
    </Route>
  </div>
);

render(<App />, document.getElementById("root"));
