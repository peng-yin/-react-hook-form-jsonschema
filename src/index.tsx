// @ts-nocheck
import React from "react";

export interface SchemaItem {
  field: string;
  component: React.ElementType | React.ReactNode;
  componentProps: Record<string, any>;
  formItemProps?:  Record<string, any>;
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

const withValueAsNumber: React.FC<WithValueAsNumberProps> = WrappedComponent => React.forwardRef((props, ref) => {
  const handleChange = (e: any) => {
    if (typeof props.onChange === 'function') {
      props.onChange(parseInt(e.target.value, 10));
    }
  };
  return <WrappedComponent {...props} ref={ref} onChange={handleChange} />;
});

const internalMiddleware:Middleware[] = [{
  hoc: withValueAsNumber,
  filter(props) {
    return props.valueAsNumber
  }
}]

const customFunctionMap:Record<string, Function> = {
  getDynamicCommon: value => value,
};

function compose(...funcs:Function[]): Function {
  if (funcs.length === 0) {
    return arg => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args) => a(b(...args)));
}

const Component: React.FC = React.forwardRef(({ component, ...props }, ref) => {
  const { componentsMap = {}, middlewares = [] } = React.useContext(FormControllerContext)

  const EnhancedComponent = React.useMemo(() => {
   
    if (React.isValidElement(component)) {
      return component
    }
    
    if (typeof component === 'string') {
      if (!componentsMap || !Object.keys(componentsMap).includes(component)){
        throw new Error(`未找到对应的组件: ${component}`);
      }
    }
    
    const NewComponent =  componentsMap[component];
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

    return compose(...middlewareList)(NewComponent);
  }, [component, internalMiddleware, middlewares, componentsMap]);

  return <EnhancedComponent {...props} ref={ref} />;
});

const parseFunctionMarker = (marker: string, formValues: Record<string, any>) => {
  const markerPattern = /#(\w+)\(([^)]*)\)/; // 匹配 #functionName(arg1, arg2, ...)
  const match = markerPattern.exec(marker);
  if (match) {
    const functionName = match[1];
    const args = match[2].split(',').map(arg => arg.trim()).map(arg => formValues[arg]);
    const context = React.useContext(FormControllerContext)
    const functionMap = { ...customFunctionMap, ...context?.functionMap };
    if (!functionMap || !Object.keys(functionMap).includes(functionName)){
      throw new Error(`未找到对应的函数: ${functionName}`);
    }
    return functionMap[functionName](...args);
  }
  return null;
};

const evaluateExpression = (expression: string, values: Record<string, any>) => {
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

export interface FormRenderProps {
  schema: SchemaItem[];
  dataSource: Record<string, any>;
  renderFormItem: (value: any) => React.ReactNode
}


/**
 * 
 * @param {*} form: FormInstance
 * @param {*} schema： 表单配置
 * @param {*} dataSource： 数据源
 * @returns 
 */
const FormRender: React.FC<FormRenderProps> = ({ schema, dataSource, renderFormItem }) => {
  if (!Array.isArray(schema)) {
    throw new Error('FormRender expects `schema` to be an array.');
  }

  return (
    <>
      {schema.map(item => {
        const componentProps = resolveComponentProps(item.componentProps, { ...dataSource });
        if (componentProps.hidden) {
          return null;
        }
        const formItemProps = {
          FieldRender: React.forwardRef(({ field }, ref) => (
            <Component
              {...field}
              ref={ref}
              {...componentProps}
              component={item.component}
            />
          )),
          componentProps: { field: item.field, ...componentProps }
        }
        return (
          <ErrorBoundary key={item.field}>
            {renderFormItem(formItemProps)}
          </ErrorBoundary>
        )
      })}
    </>
  )
};

export default FormRender;