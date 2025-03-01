import "@testing-library/jest-dom";
import { fireEvent, getByText, render, screen } from "@testing-library/react";
import React, { useContext, useEffect, useState } from "react";
import { TransformClass } from "./transformClass";

const ThemeContext = React.createContext("dark");
function SimpleComponent() {
  const theme = useContext(ThemeContext);
  return (
    <div>
      <div>theme is {theme}</div>
    </div>
  );
}

test("渲染context组件", () => {
  const { container } = render(
    <TransformClass>
      <ThemeContext.Provider value="light">
        <SimpleComponent />
      </ThemeContext.Provider>
    </TransformClass>
  );

  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();

  const element = screen.getByText(/theme is light/i);

  expect(element).toBeInTheDocument();
});

test("测试context组件的渲染次数", () => {
  const onChildInit = jest.fn();
  const onChildRender = jest.fn();
  function ChildComponent() {
    const theme = useContext(ThemeContext);
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
        <ChildComponent />
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
