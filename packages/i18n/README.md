@react-node-transform/i18n 提供了一种新的非侵入式的 i18n 解决方案，传统的 i18n 解决方案，例如 i18next，对源代码的侵入性太强，而且要求我们在开发时对每一个新的翻译指定一个不重复的 key，一定程度上增加了代码量和思考成本。

### 安装

使用 npm

```bash
npm install @react-node-transform/core @react-node-transform/i18n
```

或者使用 yarn

```bash
yarn add @react-node-transform/core @react-node-transform/i18n
```

### 简单的使用示例如下：

```jsx
import React from "react";
import { I18n } from "@react-node-transform/i18n";
export function Page() {
  return (
    <I18n
      resource={{
        姓名: "name",
      }}
    >
      <Component />
    </I18n>
  );
}

function Component() {
  return <div>姓名</div>;
}
```

输出

```html
<div>name</div>
```

### 示例：如何动态的替换文案

```jsx
import React from "react";
import { I18n } from "@react-node-transform/i18n";
export function Page() {
  return (
    <I18n
      resource={{
        "你确定要删除节点{{}}吗？": "are you sure to delete node {{}}?",
        "节点{{1}}已移除的情况下，是否启用新的节点{{2}}？":
          "do you want to enable new node {{2}} in the case where node {{1}} has been removed?",
      }}
    >
      <div>你确定要删除节点node-zxy001吗？</div>
      <div>节点node-zxy001已移除的情况下，是否启用新的节点node-zxy002？</div>
    </I18n>
  );
}
```

输出

```html
<div>are you sure to delete node node-zxy001?</div>
<div>
  do you want to enable new node node-zxy002 in the case where node node-zxy001
  has been removed?
</div>
```

### 示例，如何指定忽略某些不需要翻译的组件

```jsx
import React from "react";

import { ExcludeI18n, I18n } from "@react-node-transform/i18n";
export function Page() {
  return (
    <I18n
      resource={{
        姓名: "name",
      }}
    >
      <Name id="a" />
      /** ExcludeI18n包裹的区域不会被翻译 **/
      <ExcludeI18n>
        <Name id="b" />
      </ExcludeI18n>
    </I18n>
  );
}

function Name(props: { id: string }) {
  const { id } = props;
  return <div id={id}>姓名</div>;
}
```

输出结果

```html
<div id="a">name</div>
<!-- ExcludeI18n包裹的区域不会被翻译 -->
<div id="b">姓名</div>
```

### API

## 组件名：I18n

| 属性名   | 类型                  | 描述                                                                                                                                     |
| -------- | --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| resource | {[key:string]:string} | 该映射包含原文案和翻译后的文案，如果找不到对应的翻译，就是用原本的文案;resources 中的值支持翻译模版，详见上方示例 **如何动态的替换文案** |

## 组件名：ExcludeI18n

该组件包裹的区域的文案不会被翻译，保持原始值。这对于某些需要动态展示后端返回的数据的场景很有必要（例如表格组件中展示的数据）。

### 原理

借助@react-node-transform/core 提供的 react 组件树的遍历能力，@react-node-transform/i18n 在检测到有文字节点被渲染出来之前，替换为对应的国际化内容，找不到对应的国际化内容时，就是用原本的文案内容。

### License

@react-node-transform/i18n is [MIT licensed](./LICENSE).
