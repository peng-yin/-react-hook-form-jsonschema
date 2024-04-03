// @ts-nocheck
import React from "react";
import { Control, FieldValues, useForm, UseFormReturn, Controller } from 'react-hook-form';

export interface FormItemProps {
  errorClassName?: string;
  control: Control<FieldValues>;
  [key: string]: any; // 允许额外的属性
}

export interface SchemaItem {
  field: string;
  component: React.ElementType | React.ReactNode;
  componentProps: Record<string, any>;
  formItemProps?: FormItemProps;
}

export interface FormRenderProps {
  form: UseFormReturn<FieldValues>;
  schema: SchemaItem[];
  dataSource: Record<string, any>;
}

export interface FormItemControllerProps {
  field: string;
  errors?: Record<string, any>;
  component: string | React.ReactNode;
  componentProps?: Record<string, any>;
  formItemProps?: {
    control?: Control<FieldValues>;
    errorClassName?: string;
    [key: string]: any;
  };
}

interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

export interface Middleware {
  hoc: (component: React.ComponentType) => React.ComponentType;
  filter: (props: Record<string, any>) => boolean;
}

export interface FormControllerContextValue {
  componentsMap?: Record<string, React.ComponentType>;
  middlewares?: Middleware[];
  functionMap?: { [key: string]: (...args: any[]) => any };
}

export const FormControllerContext = React.createContext<FormControllerContextValue>({});

type WithValueAsNumberProps = {
  onChange?: (value: number) => void;
};

const withValueAsNumber: React.FC<WithValueAsNumberProps> = WrappedComponent => (props, ref) => {
  const handleChange = (e: any) => {
    if (typeof props.onChange === 'function') {
      props.onChange(parseInt(e.target.value, 10));
    }
  };
  return <WrappedComponent {...props} ref={ref} onChange={handleChange} />;
};

const internalMiddleware: Middleware[] = [{
  hoc: withValueAsNumber,
  filter(props) {
    return props.valueAsNumber
  }
}]

const customFunctionMap: Record<string, Function> = {
  getDynamicCommon: value => value,
};

function compose(...funcs: Function[]): Function {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const Component: React.FC = ({ component, ...props }) => {
  const { componentsMap = {}, middlewares = [] } = React.useContext(FormControllerContext)

  const middlewareList = [...internalMiddleware, ...middlewares].reduce((prev, middleware) => {
    const { hoc, filter } = middleware;
    if (typeof hoc !== 'function' || typeof filter !== 'function') {
      throw new Error('Middleware HOC or Middleware Filter is not a function');
    }
    if (filter(props)) {
      prev.push(hoc);
    }
    return prev;
  }, []);
  
  const EnhancedComponent = React.useMemo(() => {
    if (typeof component === 'string') {
      if (!componentsMap || !Object.keys(componentsMap).includes(component)) {
        throw new Error(`未找到对应的组件: ${component}`);
      }
    }
    if (React.isValidElement(component) || typeof component === 'function' || typeof component === 'object') {
      return component
    }
    const NewComponent = componentsMap[component];
    return NewComponent;
  }, [component, internalMiddleware, middlewares, componentsMap]);

  return compose(...middlewareList)(<EnhancedComponent {...props} />);
};

const FormItemController = React.forwardRef((props, ref) => {
  return (
    <>
      <Controller
        name={props.field}
        {...props.formItemProps}
        render={({ field }) => (
          <Component
            {...field}
            ref={ref} // ref覆盖解决warning
            {...props.componentProps}
            component={props.component}
          />
        )}
      />
      {props?.errors?.[props.field] && (
        <div className={props.formItemProps?.errorClassName}>{props?.errors?.[props.field]?.message}</div>
      )}
    </>
  )
});

const parseFunctionMarker = (marker, formValues) => {
  const markerPattern = /#(\w+)\(([^)]*)\)/; // 匹配 #functionName(arg1, arg2, ...)
  const match = markerPattern.exec(marker);
  if (match) {
    const functionName = match[1];
    const args = match[2].split(',').map(arg => arg.trim()).map(arg => formValues[arg]);
    const context = React.useContext(FormControllerContext)
    const functionMap = { ...customFunctionMap, ...context?.functionMap };
    if (!functionMap || !Object.keys(functionMap).includes(functionName)) {
      throw new Error(`未找到对应的函数: ${functionName}`);
    }
    return functionMap[functionName](...args);
  }
  return null;
};

const evaluateExpression = (expression, values) => {
  const cleanedExpression = expression.replace(/{{|}}/g, '').trim();
  try {
    const keys = Object.keys(values);
    const args = keys.map(key => values[key]);
    return Function(...keys, `"use strict";return (${cleanedExpression})`)(...args);
  } catch (error) {
    throw new Error(`Error evaluating expression: ${expression}`);
  }
};

const resolveComponentProps = (componentProps, dataSource) => {
  const resolvedProps = {};
  Object.keys(componentProps).forEach(key => {
    const value = componentProps[key];
    if (typeof value === 'string') {
      if (value.startsWith("#")) {
        resolvedProps[key] = parseFunctionMarker(value, dataSource);
      } else if (['disabled', 'hidden'].includes(key)) {
        resolvedProps[key] = evaluateExpression(value, dataSource);
      } else if (key === 'data') {
        resolvedProps[key] = dataSource?.[value];
      } else {
        resolvedProps[key] = value;
      }
    } else {
      resolvedProps[key] = value;
    }
  });

  return resolvedProps;
};

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return <h1>FormItem rendering error.</h1>;
    }

    return this.props.children;
  }
}

/**
 * 
 * @param {*} form: FormInstance
 * @param {*} schema： 表单配置
 * @param {*} dataSource： 数据源
 * @returns 
 */
const FormRender: React.FC<FormRenderProps> = ({ form, schema, dataSource }) => {
  if (!Array.isArray(schema)) {
    throw new Error('FormRender expects `schema` to be an array.');
  }
  const { watch, control, formState: { errors } } = form
  const formValues = watch(); // 获取所有表单字段的值

  return (
    <>
      {schema.map(item => {
        const componentProps = resolveComponentProps(item.componentProps, { ...formValues, ...dataSource });
        if (componentProps.hidden) {
          return null;
        }
        return (
          <ErrorBoundary key={item.field}>
            <FormItemController
              field={item.field}
              errors={errors}
              component={item.component}
              componentProps={componentProps}
              formItemProps={{ ...item.formItemProps, control }}
            />
          </ErrorBoundary>
        )
      })}
    </>
  )
};

export { useForm }

export default FormRender;