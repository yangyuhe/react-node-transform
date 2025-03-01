import "@testing-library/jest-dom";
import { fireEvent, getByText, render, screen } from "@testing-library/react";
import React, { useEffect, useState } from "react";
import { TransformClass } from "./transformClass";

test("渲染consumer组件", () => {
  const ThemeContext = React.createContext("dark");
  function SimpleComponent() {
    return (
      <ThemeContext.Consumer>
        {(theme) => {
          return (
            <div>
              <div>theme is {theme}</div>
            </div>
          );
        }}
      </ThemeContext.Consumer>
    );
  }
  const { container } = render(
    <TransformClass>
      <ThemeContext.Provider value="light">
        <SimpleComponent />
      </ThemeContext.Provider>
    </TransformClass>
  );

  screen.debug();

  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();

  const element = screen.getByText(/theme is light/i);

  expect(element).toBeInTheDocument();
});

test("测试consumer组件的渲染次数", () => {
  const ThemeContext = React.createContext("dark");
  const onChildInit = jest.fn();
  const onChildRender = jest.fn();
  function ChildComponent(props: { theme }) {
    const { theme } = props;
    useEffect(() => {
      onChildInit();
    }, []);
    onChildRender();
    return <div>theme is {theme}</div>;
  }
  function Continer() {
    const [c, setC] = useState(0);
    return (
      <ThemeContext.Provider value="light">
        <button onClick={() => setC((c) => c + 1)}>add</button>
        <ThemeContext.Consumer>
          {(theme) => {
            return <ChildComponent theme={theme} />;
          }}
        </ThemeContext.Consumer>
      </ThemeContext.Provider>
    );
  }
  const { container } = render(
    <TransformClass>
      <Continer />
    </TransformClass>
  );
  const element = screen.getByText(/theme is light/i);
  expect(element).toBeInTheDocument();

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
