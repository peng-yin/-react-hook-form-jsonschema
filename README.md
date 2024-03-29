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
import FormRender, { useForm } from 'react-hook-form-jsonschema-builder';

const schema = [
  {
    "field": "name",
    "component": "Input",
    "componentProps": {
      "addonBefore": "http://"
    },
    "formItemProps": {}
  },
  {
    "field": "name1",
    "component": "Checkbox",
    "componentProps": {
      "options": [
        { label: 'Apple', value: 'Apple' },
        { label: 'Pear', value: 'Pear' },
        { label: 'Orange', value: 'Orange', disabled: false },
      ]
    },
    "formItemProps": {}
  }
]

const Demo = () => {
  const formInstance = useForm({
    defaultValues: {
    },
  });

  const {
    handleSubmit,
    watch,
  } = formInstance
  
  return (
    <>
      <FormRender
        dataSource={{  }}
        form={formInstance}
        schema={getSchema()}
      />
    </>
  )
};
```

> advanced


```jsx
import FormRender, { useForm, FormControllerContext }  from 'react-hook-form-jsonschema-builder';
import { Checkbox, Input} from 'antd';


const schema = [
  {
    "field": "name",
    "component": "Input",
    "componentProps": {
      "addonBefore": #getDynamicTip('name1')
    },
    "formItemProps": {}
  },
  {
    "field": "name1",
    "component": "Checkbox",
    "componentProps": {
      "options": [
        { label: 'Apple', value: 'Apple' },
        { label: 'Pear', value: 'Pear' },
        { label: 'Orange', value: 'Orange', disabled: false },
      ]
    },
    "formItemProps": {}
  }
]

const componentsMap = {
  Input,
  Checkbox:Checkbox.Group
}

const functionMap = {
  getDynamicTip: (value) => {
    return `${value} aaaaaaaaa`;
  }
}

const Demo = () => {
  const formInstance = useForm({
    defaultValues: {
    },
  });

  const {
    handleSubmit,
    watch,
  } = formInstance
  
  return (
    <FormControllerContext.Provider value={{ componentsMap: {}, middlewares: [], functionMap }}>
      <FormRender
        dataSource={{  }}
        form={formInstance}
        schema={getSchema()}
      />
    </FormControllerContext.Provider>
  )
};
```

## try

[![Edit react-hook-form-jsonschema-builder](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-hook-form-jsonschema-98ssg5?fontsize=14&hidenavigation=1&theme=dark)

## Props

| Prop               | Type                              | Default   | Description                                   |
| ------------------ | --------------------------------- | --------- | --------------------------------------------- |
| form               | `FormInstance`                    | -         | react-hook-form实例                            |
| schema             | `Schema`                          | -         | json schema                                   |
| dataSource         | `DataSource`                      | -         | 数据源                                         |

## License

[MIT License](https://github.com/peng-yin/react-hook-form-jsonschema-builder/blob/main/LICENSE) (c) [peng-yin](https://github.com/peng-yin)
