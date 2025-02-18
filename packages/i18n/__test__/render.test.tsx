import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";

import { ExcludeI18n, I18n } from "@react-node-transform/i18n";
export function Page() {
  return (
    <I18n
      resource={{
        姓名: "name",
      }}
    >
      <div>
        <Name id="a" />
        <ExcludeI18n>
          <Name id="b" />
        </ExcludeI18n>
        <I18n
          resource={{
            姓名: "姓名",
          }}
        >
          <Name id="c" />
        </I18n>
      </div>
    </I18n>
  );
}

function Name(props: { id: string }) {
  const { id } = props;
  return <div id={id}>姓名</div>;
}

test("翻译渲染结果", () => {
  const { container } = render(<Page />);
  // screen.debug();

  expect(container.querySelector("#a")?.innerHTML).toBe("name");
  expect(container.querySelector("#b")?.innerHTML).toBe("姓名");
  expect(container.querySelector("#c")?.innerHTML).toBe("姓名");
});
