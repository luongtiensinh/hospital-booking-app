import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import {
  loginSchema,
  type LoginFormValues,
} from "@/features/auth/schemas/login-schema";
import { useLogin } from "@/features/auth/hooks/use-login";

export function LoginForm() {
  const { login, isPending } = useLogin();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    login(values);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          id="email"
          label="Email"
          placeholder="benhnhan@medcare.vn"
          type="email"
          size="md"
          radius="md"
          error={form.formState.errors.email?.message}
          {...form.register("email")}
        />

        <PasswordInput
          id="password"
          label="Mật khẩu"
          placeholder="Nhập mật khẩu của bạn"
          size="md"
          radius="md"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />

        <Button
          fullWidth
          size="md"
          radius="md"
          type="submit"
          loading={isPending}
          mt="xs"
        >
          {isPending ? "Đang xác thực..." : "Đăng nhập"}
        </Button>
      </Stack>
    </form>
  );
}
