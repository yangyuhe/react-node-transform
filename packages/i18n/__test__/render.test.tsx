import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React from "react";

import { ExcludeI18n, I18n } from "@react-node-transform/i18n";
export function Page() {
  return (
    <I18n
      resource={{
        姓名: "name",
        "你确定要删除节点{{}}吗？": "are you sure to delete node {{}}?",
        "节点{{1}}已移除的情况下，是否启用新的节点{{2}}？":
          "do you want to enable new node {{2}} in the case where node {{1}} has been removed?",
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
        <div id="d">你确定要删除节点node-zxy001吗？</div>
        <div id="e">
          节点node-zxy001已移除的情况下，是否启用新的节点node-zxy002？
        </div>
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
  expect(container.querySelector("#d")?.innerHTML).toBe(
    "are you sure to delete node node-zxy001?"
  );
  expect(container.querySelector("#e")?.innerHTML).toBe(
    "do you want to enable new node node-zxy002 in the case where node node-zxy001 has been removed?"
  );
});
