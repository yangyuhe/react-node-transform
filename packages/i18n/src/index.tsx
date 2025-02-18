import {
  ReactNodeTransform,
  SymbolNext,
  SymbolStop,
} from "@react-node-transform/core";
import React, {
  ReactElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { ExcludeI18n } from "./exclude";
export { ExcludeI18n } from "./exclude";

const LanguageContext = React.createContext("zh");

export function I18n(props: { children; resource: { [key: string]: string } }) {
  const { children, resource } = props;
  const resourceRef = useRef(resource);

  const getEn = useCallback((ch: string) => {
    if (resourceRef.current[ch]) return resourceRef.current[ch];

    let target = "";
    const matched = Object.keys(resourceRef.current).find((key) => {
      const placeholders = key.match(/\{\{\d*\}\}/g);
      if (placeholders) {
        const reg = new RegExp(key.replace(/{{\d*}}/g, "(.+)"));
        const res = ch.match(reg);

        if (res) {
          let en = resourceRef.current[key];
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
    return resourceRef.current[ch] || ch;
  }, []);

  const [hash, setHash] = useState(Date.now());
  useEffect(() => {
    if (JSON.stringify(resource) !== JSON.stringify(resourceRef.current)) {
      setHash(Date.now());
      resourceRef.current = resource;
    }
  }, [resource]);
  return (
    <ReactNodeTransform
      Context={LanguageContext}
      contextValue={hash}
      middleware={(child) => {
        if (typeof child === "string") {
          return [getEn(child), SymbolStop];
        }
        if (
          (child as ReactElement)?.type === ExcludeI18n ||
          (child as ReactElement)?.type === I18n
        ) {
          return [child, SymbolStop];
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

            return [newChild, SymbolNext];
          }
        }
        return [child, SymbolNext];
      }}
    >
      {children}
    </ReactNodeTransform>
  );
}
