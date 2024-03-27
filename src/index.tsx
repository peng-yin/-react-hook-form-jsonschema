import React, { useMemo, Context } from "react";
import { Controller, useForm, UseFormReturn, FieldValues, ControllerRenderProps } from 'react-hook-form';

export interface FormControllerContextValue {
  componentsMap?: Record<string, React.ComponentType<any>>;
  middlewares?: Function[];
}

export const FormControllerContext: Context<FormControllerContextValue> = React.createContext({});

export const withValueAsNumber = <P extends object>(WrappedComponent: React.ComponentType<P>) => React.forwardRef<any, P & { onChange?: (value: number) => void }>((props, ref) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (typeof props.onChange === 'function') {
      props.onChange(parseInt(e.target.value, 10));
    }
  };
  return <WrappedComponent {...props} ref={ref} onChange={handleChange} />;
});

interface FunctionMap {
  [key: string]: (...args: any[]) => any;
}

const functionMap: FunctionMap = {
  getDynamicCommon: value => value,
  getDynamicTip: (similarViewDate: string) => {
    return `${similarViewDate} 前的已审核素材，“聚类”审核视图下不支持查询`;
  },
  // 可以在这里添加更多的函数映射
};

function compose(...funcs: Function[]) {
  if (funcs.length === 0) {
    return (arg: any) => arg
  }

  if (funcs.length === 1) {
    return funcs[0]
  }

  return funcs.reduce((a, b) => (...args: any[]) => a(b(...args)));
}

interface ComponentProps {
  component: React.ComponentType<any> | string;
  valueAsNumber?: boolean;
  [key: string]: any;
}

export const Component = React.forwardRef<any, ComponentProps>(({ component, ...props }, ref) => {
  const { componentsMap = {}, middlewares = [] } = React.useContext(FormControllerContext);

  const EnhancedComponent: React.ComponentType<any> | null = useMemo(() => {
    if (React.isValidElement(component)) {
      return component as React.ComponentType<any>;
    }
    
    if (typeof component === 'string') {
      if (!componentsMap || !Object.keys(componentsMap).includes(component)){
         console.warn('未找到对应的组件');
         return null;
      } else {
        return componentsMap[component];
      }
    }

    if (props.valueAsNumber) {
      return withValueAsNumber(component as React.ComponentType<any>);
    }

    return compose(...middlewares)(component as React.ComponentType<any>);
  }, [component, props.valueAsNumber, componentsMap, middlewares]);

  return EnhancedComponent ? <EnhancedComponent {...props} ref={ref} /> : null;
});

interface FormItemControllerProps {
  field: string;
  errors?: Record<string, any>;
  component: React.ComponentType<any> | string;
  componentProps: any;
  formItemProps: any;
}

export const FormItemController: React.FC<FormItemControllerProps> = (props) => {
  return (
    <>
      <Controller
        name={props.field}
        {...props.formItemProps}
        render={({ field }: { field: ControllerRenderProps }) => (
          <Component
            {...field}
            {...props.componentProps}
            component={props.component} 
          />
        )}
      />
      {props.errors?.[props.field] && (
        <div className={props.formItemProps?.errorClassName}>{props.errors[props.field]?.message}</div>
      )}
    </>
  )
};

const parseFunctionMarker = (marker: string, formValues: Record<string, any>): any => {
  const markerPattern = /#(\w+)\(([^)]*)\)/; // 匹配 #functionName(arg1, arg2, ...)
  const match = markerPattern.exec(marker);
  if (match) {
    const functionName = match[1];
    const args = match[2].split(',').map(arg => arg.trim()).map(arg => formValues[arg]);

    if (functionMap[functionName]) {
      return functionMap[functionName](...args);
    }
  }
  return null;
};

const evaluateExpression = (expression: string, values: Record<string, any>): any => {
  const cleanedExpression = expression.replace(/{{|}}/g, '').trim();
  try {
    const keys = Object.keys(values);
    const args = keys.map(key => values[key]);
    return new Function(...keys, `"use strict";return (${cleanedExpression})`)(...args);
  } catch (error) {
    console.error('Error evaluating expression:', expression, error);
    return false;
  }
};

const resolveComponentProps = (componentProps: Record<string, any>, dataSource: Record<string, any>): Record<string, any> => {
  const resolvedProps: Record<string, any> = {};
  Object.keys(componentProps).forEach(key => {
    const value = componentProps[key];
    if (typeof value === 'string') {
      if (value.startsWith("#")) {
        resolvedProps[key] = parseFunctionMarker(value, dataSource);
      } else if (key === 'disabled' || key === 'hidden') {
        resolvedProps[key] = evaluateExpression(value, dataSource);
      } else {
        resolvedProps[key] = value;
      }
    } else {
      resolvedProps[key] = value;
    }
  });

  return resolvedProps;
};

interface FormItemSchema {
  field: string;
  component: string;
  componentProps: Record<string, unknown>;
  formItemProps?: Record<string, unknown>;
}

interface FormRenderProps {
  form: UseFormReturn<FieldValues>;
  schema: FormItemSchema[];
  dataSource: Record<string, any>;
}

const FormRender: React.FC<FormRenderProps> = ({ form, schema, dataSource }) => {
  if (!Array.isArray(schema)) {
    throw new Error('FormRender expects `schema` to be an array.');
  }
  const { watch, control, formState: { errors } } = form;
  const formValues = watch(); // 获取所有表单字段的值

  return (
    <>
      {schema.map(item => {
        const componentProps = resolveComponentProps(item.componentProps, { ...formValues, ...dataSource });
        if (componentProps.hidden) {
          return null;
        }
        return (
          <FormItemController
            key={item.field} 
            field={item.field}
            errors={errors}
            component={item.component}
            componentProps={componentProps}
            formItemProps={{ ...item.formItemProps, control }}
          />
        )
      })}
    </>
  )
};

export { useForm };

export default FormRender;