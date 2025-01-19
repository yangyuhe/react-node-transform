import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ReactNodeTransform } from "@react-node-transform/core";
import { SimpleComponent } from "./components/SimpleComponent";
// import { describe, expect, test } from "@jest/globals";

test("渲染普通react组件", () => {
  render(
    <ReactNodeTransform>
      <SimpleComponent />
    </ReactNodeTransform>
  );

  const element = screen.getByText(/SimpleComponent/i);

  expect(element).toBeInTheDocument();
});
