### 这个库用于提供遍历并修改 react 节点的能力

@react-node-transform/core 通过 hack 的方式，在 react render 阶段完成之前将各层级的 ReactNode 对象进行遍历，允许返回新的 ReactNode 节点

### 安装

使用 npm

```bash
npm install @react-node-transform/core
```

或者使用 yarn

```bash
yarn add @react-node-transform/core
```

### API

#### ReactNodeTransform

type Middleware = (
node: ReactNode
) => [ReactNode | undefined, typeof SymbolNext | typeof SymbolStop];

| 属性       | 类型          | 备注                                                                                                             |
| ---------- | ------------- | ---------------------------------------------------------------------------------------------------------------- |
| middleware | Middleware    | 接受旧的 ReactNode, 根据需要返回新的 ReactNode，SymbolNext 表示继续进行子树的遍历，SymbolStop 表示停止子树的遍历 |
| Context    | React.Context | 该参数会被内部构建的新的组件作为 context 使用，通过 context 值的变化触发组件的必要的刷新                         |

### License

@react-node-transform/core is [MIT licensed](./LICENSE).
