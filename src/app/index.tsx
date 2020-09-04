import React from "react";
import { render } from "react-dom";
import "./styles.scss";

const Application: React.FunctionComponent<{}> = () => <h1>Application</h1>;

render(<Application />, document.getElementById("root"));
