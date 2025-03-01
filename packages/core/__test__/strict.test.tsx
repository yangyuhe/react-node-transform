import "@testing-library/jest-dom";
import { fireEvent, getByText, render, screen } from "@testing-library/react";
import React, { StrictMode, useEffect, useState } from "react";
import { TransformClass } from "./transformClass";

test("渲染strict组件", () => {
  function SimpleComponent() {
    return (
      <div>
        <div>SimpleComponent</div>
      </div>
    );
  }

  const { container } = render(
    <TransformClass>
      <StrictMode>
        <SimpleComponent />
      </StrictMode>
    </TransformClass>
  );

  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();

  const element = screen.getByText(/SimpleComponent/i);

  expect(element).toBeInTheDocument();
});

test("测试strict组件的渲染次数", () => {
  const onChildInit = jest.fn();
  const onChange = jest.fn((x) => x);
  const onChildRender = jest.fn();
  function ChildComponent(props: { c: number }) {
    const { c } = props;

    useEffect(() => {
      onChange(c);
    }, [c]);

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
        <StrictMode>
          <ChildComponent c={c} />
        </StrictMode>
      </>
    );
  }
  const { container } = render(
    <TransformClass>
      <Continer />
    </TransformClass>
  );

  if (React.version.startsWith("19") || React.version.startsWith("17")) {
    expect(onChange.mock.calls).toHaveLength(1);
    expect(onChildInit.mock.calls).toHaveLength(1);
    expect(onChildRender.mock.calls).toHaveLength(2);
  } else {
    expect(onChange.mock.calls).toHaveLength(2);
    expect(onChildInit.mock.calls).toHaveLength(2);
    expect(onChildRender.mock.calls).toHaveLength(2);
  }

  fireEvent(
    getByText(container, "add"),
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  if (React.version.startsWith("19") || React.version.startsWith("17")) {
    expect(onChange.mock.calls).toHaveLength(2);
    expect(onChildInit.mock.calls).toHaveLength(1);
    expect(onChildRender.mock.calls).toHaveLength(4);
  } else {
    expect(onChange.mock.calls).toHaveLength(3);
    expect(onChildInit.mock.calls).toHaveLength(2);
    expect(onChildRender.mock.calls).toHaveLength(4);
  }
});
