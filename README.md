<div align="center">

# react-hook-form-jsonschema-builder

use jsonschema Dynamic form for react-hook-form

[![npm](https://img.shields.io/npm/v/react-hook-form-jsonschema-builder)](https://www.npmjs.com/package/react-hook-form-jsonschema-builder-builderd)
[![GitHub](https://img.shields.io/github/license/peng-yin/react-hook-form-jsonschema-builder?style=flat-square)](https://github.com/peng-yin/react-hook-form-jsonschema-builder/blob/main/LICENSE)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/peng-yin/react-hook-form-jsonschema-builder/blob/main/src/types.ts)

</div>

## Install

```sh
pnpm add react-hook-form-jsonschema-builder
# or
yarn add react-hook-form-jsonschema-builder
# or
npm i react-hook-form-jsonschema-builder
```

## Usage

> simple

```jsx
import FormRender, { useForm } from "react-hook-form-jsonschema-builder";
import { Input, Checkbox, Radio } from "antd";

const schema = [
  {
    field: "name",
    component: "input",
    componentProps: {
      addonBefore: "http://",
    },
  },
  {
    field: "age",
    component: "checkbox",
    componentProps: {
      options: [
        { label: "Apple", value: "Apple" },
        { label: "Pear", value: "Pear" },
        { label: "Orange", value: "Orange" },
      ],
    },
  },
  {
    field: "work",
    component: "radio",
    componentProps: {
      options: [
        { label: "Apple", value: "Apple" },
        { label: "Pear", value: "Pear" },
        { label: "Orange", value: "Orange" },
      ],
    },
  },
];

const componentsMap: Record<string, any> = {
  input: Input,
  checkbox: Checkbox.Group,
  radio: Radio.Group,
};

const getSchema = () => {
  return schema.map(({ component, componentProps, ...otherProps }) => {
    let resolvedComponent = component;
    if (typeof component === "string") {
      resolvedComponent = componentsMap[component];
    }
    return { component: resolvedComponent, componentProps, ...otherProps };
  });
};

export default function App() {
  const formInstance = useForm({
    defaultValues: {},
  });

  const { handleSubmit } = formInstance;

  const onSubmit = (data) => console.log(data);

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <FormRender form={formInstance} schema={getSchema()} />
      <button type="submit">Submit</button>
    </form>
  );
}

```

> advanced


```jsx
import FormRender, {
  useForm,
  FormControllerContext,
} from "react-hook-form-jsonschema-builder";
import { Input, Checkbox, Radio } from "antd";

const schema = [
  {
    field: "name",
    component: "input",
    componentProps: {
      addonBefore: "http://",
    },
  },
  {
    field: "age",
    component: "checkbox",
    componentProps: {
      options: [
        { label: "Apple", value: "Apple" },
        { label: "Pear", value: "Pear" },
        { label: "Orange", value: "Orange" },
      ],
    },
  },
  {
    field: "work",
    component: "radio",
    componentProps: {
      options: [
        { label: "Apple", value: "Apple" },
        { label: "Pear", value: "Pear" },
        { label: "Orange", value: "Orange" },
      ],
    },
  },
];

const componentsMap: Record<string, any> = {
  input: Input,
  checkbox: Checkbox.Group,
  radio: Radio.Group,
};

const functionMap = {
  getDynamicTip: (value) => {
    return `${value} aaaaaaaaa`;
  },
};

export default function App() {
  const formInstance = useForm({
    defaultValues: {},
  });

  const { handleSubmit } = formInstance;

  const onSubmit = (data) => console.log(data);

  return (
    <FormControllerContext.Provider
      value={{ componentsMap, middlewares: [], functionMap }}
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormRender dataSource={{}} form={formInstance} schema={schema} />
        <button type="submit">Submit</button>
      </form>
    </FormControllerContext.Provider>
  );
}
```

## try

[![Edit react-hook-form-jsonschema-builder](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-hook-form-jsonschema-builder-cmx394?fontsize=14&hidenavigation=1&theme=dark)

## Props

> FormRender

| Prop               | Type                              | Default   | Description                                   |
| ------------------ | --------------------------------- | --------- | --------------------------------------------- |
| form               | `FormInstance`                    | -         | react-hook-form实例                            |
| schema             | `JSON`                            | -         | json schema                                   |
| dataSource         | `Object`                          | -         | 数据源                                         |

---

> FormControllerContext

| Prop               | Type                              | Default   | Description                                   |
| ------------------ | --------------------------------- | --------- | --------------------------------------------- |
| componentsMap      | `Object`                          | -         | 组件映射, 与schema 中 component一一对应，需受控组件 |
| middlewares        | `Array`                           | -         | 增强组件的插件拓展                                |
| functionMap        | `Object`                          | -         | 自定义函数，改变字段值                            |

## License

[MIT License](https://github.com/peng-yin/react-hook-form-jsonschema-builder/blob/main/LICENSE) (c) [peng-yin](https://github.com/peng-yin)
