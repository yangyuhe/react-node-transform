import React, { ReactNode, useContext, useRef } from "react";

function proxyNode(
  node,
  middleware: Middleware,
  Context: React.Context<any>,
  typeCache: WeakMap<any, any>
) {
  if (Array.isArray(node)) {
    return node.map((item) => proxyNode(item, middleware, Context, typeCache));
  }
  return proxy(node, middleware, Context, typeCache);
}

const DealedPrefix = "$$_";

function RenameNewType(NewType, OldType) {
  Object.defineProperty(NewType, "name", {
    value: DealedPrefix + (OldType.name || "_anonymouse"),
  });
  if (OldType.displayName) {
    NewType.displayName = DealedPrefix + OldType.displayName;
  }
}
function NewTypeFactory(
  OldType,
  middleware: Middleware,
  Context: React.Context<any>,
  typeCache: WeakMap<any, any>
) {
  if (!OldType) return OldType;
  //React类组件场景
  if (OldType.prototype?.render) {
    const exist = typeCache.get(OldType);
    if (exist) {
      return exist;
    }

    const NewType = class extends OldType {
      render() {
        const node = super.render();
        const newNode = proxyNode(node, middleware, Context, typeCache);
        return (
          <Context.Consumer>
            {() => {
              return newNode;
            }}
          </Context.Consumer>
        );
      }
    };
    RenameNewType(NewType, OldType);

    typeCache.set(OldType, NewType);
    return NewType;
  }
  //React函数组件场景
  if (typeof OldType === "function") {
    const exist = typeCache.get(OldType);
    if (exist) {
      return exist;
    }
    const NewType = function (...args: any[]) {
      useContext(Context);
      const originNode = OldType.call(null, ...args);
      return proxyNode(originNode, middleware, Context, typeCache);
    };
    RenameNewType(NewType, OldType);
    typeCache.set(OldType, NewType);
    return NewType;
  }
  //React.memo场景
  if (OldType.$$typeof?.toString() === "Symbol(react.memo)") {
    const exist = typeCache.get(OldType);
    if (exist) {
      return exist;
    }
    const NewType = {
      type: NewTypeFactory(OldType.type, middleware, Context, typeCache),
    };
    Object.setPrototypeOf(NewType, OldType);
    typeCache.set(OldType, NewType);
    return NewType;
  }
  //React.forwardRef场景
  if (OldType.$$typeof?.toString() === "Symbol(react.forward_ref)") {
    const exist = typeCache.get(OldType);
    if (exist) {
      return exist;
    }
    const NewType = {
      render: NewTypeFactory(OldType.render, middleware, Context, typeCache),
    };
    if (OldType.displayName)
      NewType.displayName = DealedPrefix + OldType.displayName;
    Object.setPrototypeOf(NewType, OldType);
    typeCache.set(OldType, NewType);
    return NewType;
  }

  if (
    //html元素
    typeof OldType === "string" ||
    //Context.Provider场景
    OldType.$$typeof?.toString() === "Symbol(react.provider)" ||
    //Context.Consumer场景
    OldType.$$typeof?.toString() === "Symbol(react.context)" ||
    //React.Fragment场景
    OldType.toString() === "Symbol(react.fragment)" ||
    //React.StrictMode场景
    OldType.toString() === "Symbol(react.strict_mode)" ||
    //React.Profiler场景
    OldType.toString() === "Symbol(react.profiler)" ||
    //React.Suspense场景
    OldType.toString() === "Symbol(react.suspense)"
  ) {
    return OldType;
  }

  //React.lazy场景
  if (OldType.$$typeof?.toString() === "Symbol(react.lazy)") {
    const exist = typeCache.get(OldType);
    if (exist) {
      return exist;
    }
    const { _result: result, _status } = OldType._payload;
    if (_status !== -1 || typeof result !== "function") {
      return OldType;
    } else {
      const newResult = async () => {
        const res = await result();
        const mod = res.default;
        const exist = typeCache.get(mod);
        if (exist) {
          const newDefault = { ...res, default: exist };
          return newDefault;
        }
        const NewType = NewTypeFactory(mod, middleware, Context, typeCache);
        typeCache.set(mod, NewType);
        const newDefault = { ...res, default: NewType };
        return newDefault;
      };
      const newType = {
        _payload: {
          ...OldType._payload,
          _result: newResult,
        },
      };
      Object.setPrototypeOf(newType, OldType);
      typeCache.set(OldType, newType);
      return newType;
    }
  }

  //createPortal场景等其他场景
  return OldType;
}

export const SymbolNext = Symbol("next");
export const SymbolStop = Symbol("stop");

function proxy(
  child,
  middleware: Middleware,
  Context: React.Context<any>,
  typeCache: WeakMap<any, any>
) {
  const [newChild, symbol] = middleware(child);
  if (symbol === SymbolStop) {
    return newChild;
  }
  if (symbol === SymbolNext) {
    child = newChild;
  }

  // Context.Consumer 场景
  if (typeof child === "function") {
    return function (...args) {
      const node = child.call(this, ...args);
      return proxyNode(node, middleware, Context, typeCache);
    };
  }

  if (child !== null && typeof child === "object") {
    const OldType = child.type;

    const oldProps = child.props;

    const NewType = NewTypeFactory(OldType, middleware, Context, typeCache);

    //createPortal类型
    if (child.$$typeof?.toString() === "Symbol(react.portal)") {
      const newChildren = proxyNode(
        child.children,
        middleware,
        Context,
        typeCache
      );
      const newChild = {
        children: newChildren,
      };
      Object.setPrototypeOf(newChild, child);
      return newChild;
    }

    if (
      (oldProps?.children &&
        (typeof OldType === "string" ||
          OldType.toString() === "Symbol(react.profiler)" ||
          OldType.toString() === "Symbol(react.strict_mode)" ||
          OldType.toString() === "Symbol(react.suspense)" ||
          OldType.toString() === "Symbol(react.fragment)" ||
          OldType.$$typeof?.toString() === "Symbol(react.provider)")) ||
      OldType.$$typeof?.toString() === "Symbol(react.context)"
    ) {
      const newChildren = proxyNode(
        oldProps.children,
        middleware,
        Context,
        typeCache
      );

      const newProps = {
        ...oldProps,
        children: newChildren,
      };
      if (
        OldType.toString() === "Symbol(react.suspense)" &&
        oldProps.fallback
      ) {
        newProps.fallback = proxyNode(
          oldProps.fallback,
          middleware,
          Context,
          typeCache
        );
      }
      const newChild = {
        props: newProps,
        type: NewType,
      };
      Object.setPrototypeOf(newChild, child);
      return newChild;
    } else {
      const newChild = {
        type: NewType,
      };
      Object.setPrototypeOf(newChild, child);
      return newChild;
    }
  }

  return child;
}

type Middleware = (
  node: ReactNode
) => [ReactNode | undefined, typeof SymbolNext | typeof SymbolStop];

const defaultContext = React.createContext("");
export function ReactNodeTransform(props: {
  children: any;
  middleware?: Middleware;
  Context?: React.Context<any>;
  contextValue?: any;
}) {
  const typeCacheRef = useRef(new WeakMap());
  const {
    children,
    middleware = () => undefined,
    Context = defaultContext,
    contextValue = "",
  } = props;
  const newChildren = proxyNode(
    children,
    middleware,
    Context,
    typeCacheRef.current
  );
  return (
    <Context.Provider value={contextValue}>{newChildren}</Context.Provider>
  );
}
