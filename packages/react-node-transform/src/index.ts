import { Children, ReactNode } from "react";

const typeCache = new WeakMap();

function proxyNode(node, middleware: Middleware) {
  if (Array.isArray(node)) {
    return node.map((item) => proxyNode(item, middleware));
  }
  return proxy(node, middleware);
}
function proxyChilren(children, middleware: Middleware) {
  let newChildren = children;
  if (!Array.isArray(children)) {
    newChildren = proxyNode(children, middleware);
  } else {
    newChildren = Children.map(children, (child) => {
      return proxyNode(child, middleware);
    });
  }
  return newChildren;
}
const DealedPrefix = "$$_";
function NewTypeFactory(OldType, middleware: Middleware) {
  if (OldType.prototype?.render) {
    const NewType = class extends OldType {
      render() {
        const node = super.render();
        return proxyNode(node, middleware);
      }
    };
    Object.defineProperty(NewType, "name", {
      value: DealedPrefix + OldType.name,
    });
    if (NewType.displayName) {
      NewType.displayName = DealedPrefix + NewType.displayName;
    }
    return NewType;
  }
  if (typeof OldType === "function") {
    const NewType = function (...args: any[]) {
      const originNode = OldType.call(null, ...args);
      return proxyNode(originNode, middleware);
    };
    Object.defineProperty(NewType, "name", {
      value: DealedPrefix + OldType.name,
    });
    return NewType;
  }
}

function isDealed(name) {
  return name.startsWith(DealedPrefix);
}

function RecursiveReplaceOldType(OldType, middleware: Middleware) {
  if (typeof OldType === "function") {
    if (isDealed(OldType.name)) {
      return;
    }

    const exist = typeCache.get(OldType);
    let NewType;
    if (exist) {
      NewType = exist;
    } else {
      NewType = NewTypeFactory(OldType, middleware);
      typeCache.set(OldType, NewType);
    }
    return NewType;
  }

  if (OldType.$$typeof?.toString() === "Symbol(react.lazy)") {
    const { _result: result, _status } = OldType._payload;
    if (_status !== -1 || typeof result !== "function") return;

    const newResult = async () => {
      const res = await result();
      const mod = res.default;
      const exist = typeCache.get(mod);
      if (exist) {
        const newDefault = { ...res, default: exist };
        return newDefault;
      }
      const NewType = NewTypeFactory(mod, middleware);
      typeCache.set(mod, NewType);
      const newDefault = { ...res, default: NewType };
      return newDefault;
    };
    OldType._payload._result = newResult;

    return;
  }

  if (OldType.$$typeof?.toString() === "Symbol(react.forward_ref)") {
    if (typeof OldType.render === "object") {
      RecursiveReplaceOldType(OldType.render, middleware);
      return;
    }
    if (isDealed(OldType.render.name)) return;
    const exist = typeCache.get(OldType.render);
    let NewType;
    if (exist) {
      NewType = exist;
    } else {
      NewType = NewTypeFactory(OldType.render, middleware);
      typeCache.set(OldType.render, NewType);
    }
    if (OldType.displayName) {
      OldType.displayName = DealedPrefix + OldType.displayName;
    }
    OldType.render = NewType;
    return;
  }

  //React.memo
  if (OldType.$$typeof?.toString() === "Symbol(react.memo)") {
    if (typeof OldType.type === "object") {
      RecursiveReplaceOldType(OldType.type, middleware);
      return;
    }
    if (isDealed(OldType.type.name)) return;
    const exist = typeCache.get(OldType.type);
    let NewType;
    if (exist) {
      NewType = exist;
    } else {
      NewType = NewTypeFactory(OldType.type, middleware);
      typeCache.set(OldType.type, NewType);
    }
    OldType.type = NewType;
    return;
  }
}

function proxy(child, middleware: Middleware) {
  const newChild = middleware(child);
  if (newChild !== undefined) return newChild;
  if (child !== undefined && child !== null && typeof child === "object") {
    const OldType = child.type;

    const oldProps = child.props;

    if (child.$$typeof?.toString() === "Symbol(react.portal)") {
      proxyChilren(child.children, middleware);
      return child;
    }

    //针对Context.Consumer类型
    if (OldType.$$typeof?.toString() === "Symbol(react.context)") {
      const newProps = {
        ...oldProps,
        children: function (...args) {
          const node = oldProps.children.call(this, ...args);
          return proxyNode(node, middleware);
        },
      };
      const newChild = {
        props: newProps,
      };
      Object.setPrototypeOf(newChild, child);
      return newChild;
    }

    const newChildren = proxyChilren(oldProps.children, middleware);

    const newProps = {
      ...oldProps,
      children: newChildren,
    };

    if (typeof OldType === "string") {
      const newChild = {
        props: newProps,
      };
      Object.setPrototypeOf(newChild, child);
      return newChild;
    }

    const res = RecursiveReplaceOldType(OldType, middleware);
    if (!res) {
      const newChild = {
        props: newProps,
      };
      Object.setPrototypeOf(newChild, child);
      return newChild;
    } else {
      const newChild = {
        type: res,
        props: newProps,
      };
      Object.setPrototypeOf(newChild, child);
      return newChild;
    }
  }

  return child;
}

type Middleware = (node: ReactNode) => ReactNode;

export function ReactNodeTransform(props: {
  children: any;
  middleware?: Middleware;
}) {
  const { children, middleware = () => undefined } = props;
  return proxyChilren(children, middleware);
}
