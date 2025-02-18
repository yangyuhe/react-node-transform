import React, { useEffect } from "react";

export default function RenderTest(props: { onChildInit; onChildRender }) {
  const { onChildInit, onChildRender } = props;
  debugger;
  useEffect(() => {
    onChildInit();
  }, [onChildInit]);
  onChildRender();
  return <div>RenderTest</div>;
}
