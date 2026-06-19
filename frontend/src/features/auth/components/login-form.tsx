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
      identifier: "",
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
          id="identifier"
          label="Số điện thoại hoặc CCCD"
          placeholder="09xxxxxxxx hoặc 0xxxxxxxxxx..."
          type="text"
          size="md"
          radius="md"
          description="Nhập SĐT (9–11 số) hoặc số căn cước công dân (12 số)"
          error={form.formState.errors.identifier?.message}
          {...form.register("identifier")}
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
