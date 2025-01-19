import React, {
  ReactChild,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
} from "react";
import { ReactNodeTransform } from "@react-node-transform/core";

export function I18n(props: { children; resource: { [key: string]: string } }) {
  const { children, resource } = props;

  const getEn = useCallback((ch: string) => {
    if (resource[ch]) return resource[ch];

    let target = "";
    const matched = Object.keys(resource).find((key) => {
      const placeholders = key.match(/\{\{\d*\}\}/g);
      if (placeholders) {
        const reg = new RegExp(key.replace(/{{\d*}}/g, "(.+)"));
        const res = ch.match(reg);

        if (res) {
          let en = resource[key];
          for (let i = 0; i < placeholders.length; i++) {
            const p = placeholders[i];
            en = en.replace(p, res[i + 1]);
          }
          target = en;
          return true;
        }
      }

      return false;
    });
    if (matched) {
      return target;
    }
    return resource[ch] || ch;
  }, []);
  return (
    <ReactNodeTransform
      middleware={(child) => {
        if (typeof child === "string") {
          return getEn(child);
        }

        const node = child as ReactElement;
        if (node?.type === "input" && node?.props.placeholder) {
          const enPlaceholder = getEn(node?.props.placeholder);
          if (
            enPlaceholder !== undefined &&
            enPlaceholder !== node?.props.placeholder
          ) {
            const newProps = {
              ...node.props,
              placeholder: enPlaceholder,
            };
            const newChild = {
              props: newProps,
            };
            Object.setPrototypeOf(newChild, node);

            return newChild;
          }
        }
      }}
    >
      {children}
    </ReactNodeTransform>
  );
}
