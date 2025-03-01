import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";
import { Ignore, TransformClass } from "./transformClass";

test("渲染嵌套的TransformClass", () => {
  function SimpleComponent(props: { id: string }) {
    const { id } = props;
    return <div id={id}></div>;
  }

  const { container } = render(
    <TransformClass>
      <SimpleComponent id="a" />
      <TransformClass className="transformed_by_you">
        <SimpleComponent id="b" />
      </TransformClass>
    </TransformClass>
  );

  screen.debug();
  expect(container.querySelector("#a")?.className).toBe("transformed_by_me");
  expect(container.querySelector("#b")?.className).toBe(
    "transformed_by_me transformed_by_you"
  );
});

test("测试终止遍历", () => {
  const { container } = render(
    <TransformClass>
      <div id="a">a</div>
      <Ignore>
        <div id="b">b</div>
        <TransformClass>
          <div id="c">c</div>
        </TransformClass>
      </Ignore>
    </TransformClass>
  );

  expect(container.querySelector("#a")?.className).toBe("transformed_by_me");
  expect(container.querySelector("#b")?.className).toBe("");
  expect(container.querySelector("#c")?.className).toBe("transformed_by_me");

  const a = screen.getByText(/a/i);
  const b = screen.getByText(/b/i);
  const c = screen.getByText(/c/i);

  expect(a).toBeInTheDocument();
  expect(b).toBeInTheDocument();
  expect(c).toBeInTheDocument();
});
