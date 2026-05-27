import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useForm } from "react-hook-form";

import {
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/register-schema";
import { useRegister } from "@/features/auth/hooks/use-register";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

const fieldIcons = {
  fullName: UserRound,
  email: Mail,
  phoneNumber: Phone,
  password: LockKeyhole,
  confirmPassword: LockKeyhole,
} as const;

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
    <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
      {[
        {
          name: "fullName" as const,
          label: "Họ và tên",
          placeholder: "Nguyễn Văn A",
          type: "text",
        },
        {
          name: "email" as const,
          label: "Email",
          placeholder: "benhnhan@medcare.vn",
          type: "email",
        },
        {
          name: "phoneNumber" as const,
          label: "Số điện thoại",
          placeholder: "09xxxxxxxx",
          type: "tel",
        },
        {
          name: "password" as const,
          label: "Mật khẩu",
          placeholder: "Tạo mật khẩu mạnh",
          type: "password",
        },
        {
          name: "confirmPassword" as const,
          label: "Xác nhận mật khẩu",
          placeholder: "Nhập lại mật khẩu",
          type: "password",
        },
      ].map(({ name, label, placeholder, type }) => {
        const Icon = fieldIcons[name];
        const error = form.formState.errors[name];

        return (
          <div className="space-y-2" key={name}>
            <Label htmlFor={name}>{label}</Label>
            <div className="relative">
              <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id={name}
                type={type}
                placeholder={placeholder}
                className="pl-11"
                {...form.register(name)}
              />
            </div>
            {error ? <p className="text-sm text-danger">{error.message}</p> : null}
          </div>
        );
      })}

      <Button className="w-full" disabled={isPending} size="lg" type="submit">
        {isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
      </Button>
    </form>
  );
}
