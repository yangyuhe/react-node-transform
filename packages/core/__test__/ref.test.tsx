import "@testing-library/jest-dom";
import { fireEvent, getByText, render, screen } from "@testing-library/react";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import { TransformClass } from "./transformClass";

test("渲染forwardRef组件", () => {
  function SimpleComponent(props, ref) {
    const [count, setCount] = useState(0);
    useImperativeHandle(
      ref,
      () => {
        return {
          add() {
            setCount((c) => c + 1);
          },
        };
      },
      []
    );
    return (
      <div>
        <div>count:{count}</div>
      </div>
    );
  }

  const SimpleComponentRef = React.forwardRef(SimpleComponent);

  function App() {
    const ref = useRef<any>(null);
    return (
      <>
        <SimpleComponentRef ref={ref} />
        <button onClick={() => ref.current.add()}>add button</button>
      </>
    );
  }

  const { container } = render(
    <TransformClass>
      <App />
    </TransformClass>
  );

  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();

  let element = screen.getByText(/count:0/i);
  expect(element).toBeInTheDocument();

  fireEvent.click(screen.getByText("add button"));
  element = screen.getByText(/count:1/i);
  expect(element).toBeInTheDocument();
});

test("渲染带ref的class组件", () => {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  class SimpleComponent extends React.Component<{}, { count: number }> {
    state = {
      count: 0,
    };
    add() {
      this.setState((s) => ({ count: s.count + 1 }));
    }
    render() {
      return (
        <div>
          <div>count:{this.state.count}</div>
        </div>
      );
    }
  }

  function App() {
    const ref = useRef<any>(null);
    return (
      <>
        <SimpleComponent ref={ref} />
        <button onClick={() => ref.current.add()}>add button</button>
      </>
    );
  }

  const { container } = render(
    <TransformClass>
      <App />
    </TransformClass>
  );

  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();

  let element = screen.getByText(/count:0/i);
  expect(element).toBeInTheDocument();

  fireEvent.click(screen.getByText("add button"));
  element = screen.getByText(/count:1/i);
  expect(element).toBeInTheDocument();
});

test("测试ref组件的渲染次数", () => {
  const onChildInit = jest.fn();
  const onChildRender = jest.fn();
  function ChildComponent() {
    useEffect(() => {
      onChildInit();
    }, []);
    onChildRender();
    return null;
  }
  const ChildComponentRef = React.forwardRef(ChildComponent);
  function Continer() {
    const [c, setC] = useState(0);
    return (
      <>
        <button onClick={() => setC((c) => c + 1)}>add</button>
        <ChildComponentRef />
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
