import "@testing-library/jest-dom";
import { fireEvent, getByText, render, screen } from "@testing-library/react";
import React, { useEffect, useState } from "react";
import { TransformClass } from "./transformClass";
import { createPortal } from "react-dom";

test("渲染portal组件", () => {
  function SimpleComponent() {
    return (
      <div>
        <div>SimpleComponent</div>
      </div>
    );
  }
  const { container } = render(
    <TransformClass>
      {createPortal(<SimpleComponent />, document.body)}
    </TransformClass>
  );

  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();

  const element = screen.getByText(/SimpleComponent/i);

  expect(element).toBeInTheDocument();
});

test("测试portal组件的渲染次数", () => {
  const onChildInit = jest.fn();
  const onChildRender = jest.fn();
  function ChildComponent() {
    useEffect(() => {
      onChildInit();
    }, []);
    onChildRender();
    return null;
  }
  function Continer() {
    const [c, setC] = useState(0);
    return (
      <>
        <button onClick={() => setC((c) => c + 1)}>add</button>
        {createPortal(<ChildComponent />, document.body)}
      </>
    );
  }
  const { container } = render(
    <TransformClass>
      <Continer />
    </TransformClass>
  );

  expect(onChildInit.mock.calls).toHaveLength(1);
  expect(onChildRender.mock.calls).toHaveLength(1);

  fireEvent(
    getByText(container, "add"),
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  expect(onChildInit.mock.calls).toHaveLength(1);
  expect(onChildRender.mock.calls).toHaveLength(2);
});
