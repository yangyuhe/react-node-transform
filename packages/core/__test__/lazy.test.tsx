import "@testing-library/jest-dom";
import { fireEvent, getByText, render, screen } from "@testing-library/react";
import React, { Suspense, useEffect, useState } from "react";
import { TransformClass } from "./transformClass";

test("渲染lazy组件", async () => {
  const SimpleComponentLazy = React.lazy(
    () => import("./components/SimpleComponent")
  );

  function Loading() {
    return <div>loading...</div>;
  }
  const { container } = render(
    <TransformClass>
      <Suspense fallback={<Loading />}>
        <SimpleComponentLazy />
      </Suspense>
    </TransformClass>
  );

  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();

  const loading = screen.getByText(/loading.../i);
  expect(loading).toBeInTheDocument();

  const simple = await screen.findByText(/SimpleComponent/i);

  expect(simple).toBeInTheDocument();
  expect(container.querySelector(":not(.transformed_by_me)")).toBeNull();
});

test("测试lazy组件的渲染次数", async () => {
  const onChildInit = jest.fn();
  const onChildRender = jest.fn();
  const RenderTest = React.lazy(() => import("./components/RenderTest"));

  function Continer() {
    const [c, setC] = useState(0);
    return (
      <>
        <span className="count">{c}</span>
        <button onClick={() => setC((c) => c + 1)}>add</button>
        <Suspense fallback={null}>
          <RenderTest onChildRender={onChildRender} onChildInit={onChildInit} />
        </Suspense>
      </>
    );
  }
  const { container } = render(
    <TransformClass>
      <Continer />
    </TransformClass>
  );

  await screen.findByText(/RenderTest/i, undefined, { timeout: 50000 });

  expect(container.querySelector(".count")?.innerHTML).toBe("0");
  expect(onChildInit.mock.calls).toHaveLength(1);
  expect(onChildRender.mock.calls).toHaveLength(1);

  fireEvent(
    getByText(container, "add"),
    new MouseEvent("click", {
      bubbles: true,
      cancelable: true,
    })
  );

  expect(container.querySelector(".count")?.innerHTML).toBe("1");
  expect(onChildInit.mock.calls).toHaveLength(1);
  expect(onChildRender.mock.calls).toHaveLength(2);
}, 50000);
