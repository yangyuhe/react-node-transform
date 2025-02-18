import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React, { ReactElement } from "react";
import { TransformClass } from "./transformClass";
import { ReactNodeTransform, SymbolNext, SymbolStop } from "../dist";

function SimpleComponent() {
  return (
    <div>
      <div>SimpleComponent</div>
    </div>
  );
}

function Simple2Component() {
  return (
    <div>
      <div>Simple2Component</div>
    </div>
  );
}

function Stop(props: { children }) {
  const { children } = props;
  return children;
}

test("测试stop功能", () => {
  const { container } = render(
    <ReactNodeTransform
      middleware={(node) => {
        if ((node as ReactElement)?.type === Stop) return [null, SymbolStop];
        return [node, SymbolNext];
      }}
    >
      <Simple2Component />
      <Stop>
        <SimpleComponent />
      </Stop>
    </ReactNodeTransform>
  );

  const simple2 = screen.getByText(/Simple2Component/i);

  expect(simple2).toBeInTheDocument();

  const simple = screen.queryByText(/SimpleComponent/i);
  expect(simple).toBeNull();
});
