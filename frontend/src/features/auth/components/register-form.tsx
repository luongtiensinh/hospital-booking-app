import { zodResolver } from "@hookform/resolvers/zod";
import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "react-hook-form";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register-schema";
import { useRegister } from "@/features/auth/hooks/use-register";

export function RegisterForm() {
  const { register, isPending } = useRegister();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phoneNumber: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    const { confirmPassword, ...payload } = values;
    void confirmPassword;
    register(payload);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Stack gap="md">
        <TextInput
          id="fullName"
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          size="md"
          radius="md"
          error={form.formState.errors.fullName?.message}
          {...form.register("fullName")}
        />

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

        <TextInput
          id="phoneNumber"
          label="Số điện thoại"
          placeholder="09xxxxxxxx"
          type="tel"
          size="md"
          radius="md"
          error={form.formState.errors.phoneNumber?.message}
          {...form.register("phoneNumber")}
        />

        <PasswordInput
          id="password"
          label="Mật khẩu"
          placeholder="Tạo mật khẩu mạnh"
          size="md"
          radius="md"
          error={form.formState.errors.password?.message}
          {...form.register("password")}
        />

        <PasswordInput
          id="confirmPassword"
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          size="md"
          radius="md"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register("confirmPassword")}
        />

        <Button
          fullWidth
          size="md"
          radius="md"
          type="submit"
          loading={isPending}
          mt="xs"
        >
          {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
        </Button>
      </Stack>
    </form>
  );
}
