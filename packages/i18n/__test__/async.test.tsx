import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import React, { useEffect, useState } from "react";

import { I18n } from "@react-node-transform/i18n";

test("异步渲染结果", async () => {
  const onChildRender = jest.fn();

  function Page() {
    const [resource, setResource] = useState({});
    useEffect(() => {
      //模拟异步行为
      setTimeout(() => {
        setResource({ 姓名: "Name" });
      }, 1000);
    }, []);
    return (
      <I18n resource={resource}>
        <NameMemo id="a" />
      </I18n>
    );
  }

  function Name(props: { id: string }) {
    onChildRender();
    const { id } = props;
    return <div id={id}>姓名</div>;
  }
  const NameMemo = React.memo(Name);

  render(<Page />);

  expect(onChildRender.mock.calls).toHaveLength(1);
  await screen.findByText("姓名");

  await screen.findByText("Name", undefined, { timeout: 3000 });
  expect(onChildRender.mock.calls).toHaveLength(2);
});
