import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, LockKeyhole } from "lucide-react";
import { useForm } from "react-hook-form";

import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/login-schema";
import { useLogin } from "@/features/auth/hooks/use-login";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

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
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            placeholder="benhnhan@medcare.vn"
            className="pl-11"
            {...form.register("email")}
          />
        </div>
        {form.formState.errors.email ? (
          <p className="text-sm text-danger">{form.formState.errors.email.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            className="pl-11"
            {...form.register("password")}
          />
        </div>
        {form.formState.errors.password ? (
          <p className="text-sm text-danger">
            {form.formState.errors.password.message}
          </p>
        ) : null}
      </div>

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Đang xác thực..." : "Đăng nhập"}
      </Button>
    </form>
  );
}
