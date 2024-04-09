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

```jsx

import FormRender, {
  useForm,
  FormControllerContext,
} from "react-hook-form-jsonschema-builder";
import { Input, Checkbox, Radio, Button } from "tdesign-react";

const schema = [
    {
      "field": "name",
      "component": "input",
      "componentProps": {
        "name": "姓名",
        "withwrapper": "true"
      }
    },
    {
      "field": "work",
      "component": "radio",
      "componentProps": {
        "name": "工作",
        "withwrapper": "true",
        "options": [
          {
            "label": "Apple",
            "value": "Apple"
          },
          {
            "label": "Pear",
            "value": "Pear"
          },
          {
            "label": "Orange",
            "value": "Orange"
          }
        ]
      }
    },
    {
      "field": "age",
      "component": "checkbox",
      "componentProps": {
        "name": "性别",
        "withwrapper": "true",
        "disabled": "{{ work == 'Apple' }}",
        "hidden": "{{ ['Orange'].includes(work) }}",
        "options": [
          {
            "label": "Apple",
            "value": "Apple"
          },
          {
            "label": "Pear",
            "value": "Pear"
          },
          {
            "label": "Orange",
            "value": "Orange"
          }
        ]
      }
    }
  ]

const FormItemWrapper = (WrappedComponent: any) => (props: any) => {
  return (
    <div className="form-item">
      <div className="label">{props.name}</div>
      <div className="value">
        <WrappedComponent {...props} />
      </div>
    </div>
  );
};

const middlewares = [
  {
    hoc: FormItemWrapper,
    filter(props: any) {
      return props.withwrapper;
    },
  },
];

const componentsMap: Record<string, any> = {
  input: Input,
  checkbox: Checkbox.Group,
  radio: Radio.Group,
};

const functionMap = {
  getDynamicTip: (value: any) => {
    return `${value} aaaaaaaaa`;
  },
};

export default function App() {
  const formInstance = useForm({
    defaultValues: {},
  });

  const { handleSubmit, watch } = formInstance;
   const formValues = watch(); // 获取所有表单字段的值
  console.log(formValues);
  
  const onSubmit = (data: any) => console.log(data);

  return (
    <FormControllerContext.Provider
      value={{ componentsMap, middlewares, functionMap }}
    >
       <form onSubmit={handleSubmit(onSubmit)}>
          <FormRender dataSource={{}} form={formInstance} schema={schema} />
          <Button theme="primary" type="submit" className="btn-submit">
            提交
          </Button>
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
