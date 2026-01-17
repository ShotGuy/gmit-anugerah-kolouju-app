import { FormProvider } from "react-hook-form";

export default function HookForm({ methods, onSubmit, children, ...props }) {
  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} {...props}>
        {children}
      </form>
    </FormProvider>
  );
}
