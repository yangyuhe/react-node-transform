import {
  ReactNodeTransform,
  SymbolNext,
  SymbolStop,
} from "@react-node-transform/core";
import React, { ReactElement } from "react";
export function Ignore(props: { children }) {
  const { children } = props;
  return children;
}
export function TransformClass(props: { children; className?: string }) {
  const { children, className = "transformed_by_me" } = props;
  return (
    <ReactNodeTransform
      middleware={(node) => {
        const ele = node as ReactElement<any>;
        if (typeof ele?.type === "string") {
          const newProps = {
            ...ele.props,
            className: ele.props?.className
              ? className + " " + ele.props.className
              : className,
          };
          const newNode: any = {
            props: newProps,
          };
          Object.setPrototypeOf(newNode, ele);
          return [newNode, SymbolNext];
        }
        if (ele?.type === Ignore) {
          return [node, SymbolStop];
        }
        return [node, SymbolNext];
      }}
    >
      {children}
    </ReactNodeTransform>
  );
}
