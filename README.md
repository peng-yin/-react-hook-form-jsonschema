<div align="center">

# react-hook-form-jsonschema

use jsonschema Dynamic form for react-hook-form

[![GitHub](https://img.shields.io/github/license/peng-yin/react-hook-form-jsonschema?style=flat-square)](https://github.com/peng-yin/react-hook-form-jsonschema/blob/main/LICENSE)
[![npm type definitions](https://img.shields.io/npm/types/typescript?style=flat-square)](https://github.com/peng-yin/react-hook-form-jsonschema/blob/main/src/types.ts)

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
import FormRender, { useForm } from 'react-hook-form-jsonschema-builder';

const Demo = () => {
  const formInstance = useForm({
    defaultValues: {
    },
  });

  const {
    handleSubmit,
    watch,
  } = formInstance
  
  <FormRender
    dataSource={{  }}
    form={formInstance}
    schema={getSchema()}
  />
};
```

## try

[![Edit react-hook-form-jsonschema-builder](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/p/sandbox/react-hook-form-jsonschema-98ssg5?fontsize=14&hidenavigation=1&theme=dark)

## Props

| Prop               | Type                              | Default   | Description                                   |
| ------------------ | --------------------------------- | --------- | --------------------------------------------- |
| form               | `FormInstance`                    | -         | -                                             |

## License

[MIT License](https://github.com/peng-yin/react-hook-form-jsonschema/blob/main/LICENSE) (c) [peng-yin](https://github.com/peng-yin)
