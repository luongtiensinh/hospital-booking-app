import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { API_BASE_URL } from "../lib/api-base-url";
import {
  Box,
  Button,
  Center,
  Divider,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
  Alert,
} from "@mantine/core";
import { useForm } from "@mantine/form";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const form = useForm({
    initialValues: {
      fullname: "",
      email: "",
      phone: "",
      password: "",
    },
    validate: {
      fullname: (v) => (!v.trim() ? "Họ tên không được để trống." : null),
      email: (v) => {
        if (!v.trim()) return "Email không được để trống.";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Email không hợp lệ.";
        return null;
      },
      phone: (v) => {
        if (!v.trim()) return "Số điện thoại không được để trống.";
        if (!/^[0-9]{9,11}$/.test(v.trim()))
          return "Số điện thoại không hợp lệ (9–11 chữ số).";
        return null;
      },
      password: (v) => {
        if (!v) return "Mật khẩu không được để trống.";
        if (v.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự.";
        return null;
      },
    },
  });

  async function handleSubmit(values) {
    setLoading(true);
    setServerError("");

    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.errors) {
          // Map server errors back to form fields
          Object.entries(data.errors).forEach(([field, msg]) => {
            form.setFieldError(field, msg);
          });
        } else {
          setServerError(data.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
        }
        return;
      }

      // Redirect to login on success
      // Actually, log them in and redirect to home
      if (data.user && data.session) {
        login(data.user, data.session);
        navigate("/");
      } else {
        // Fallback in case backend doesn't return session
        navigate("/login", { state: { registered: true } });
      }
    } catch {
      setServerError("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Center mih="100vh" bg="gray.0" p="md">
      <Box w="100%" maw={420}>
        {/* Logo & Heading */}
        <Stack align="center" mb="xl" gap="xs">
          <Title order={1} size="h2" fw={700} c="dark.8">
            Tạo tài khoản
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            Đăng ký để đặt lịch khám và theo dõi kết quả y tế
          </Text>
        </Stack>

        <Paper shadow="sm" radius="lg" p="xl" withBorder>
          {serverError && (
            <Alert color="red" variant="light" mb="md" radius="md">
              {serverError}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)} noValidate>
            <Stack gap="md">
              <TextInput
                id="reg-fullname"
                label="Họ và tên"
                placeholder="Nguyễn Văn A"
                size="md"
                radius="md"
                autoComplete="name"
                {...form.getInputProps("fullname")}
              />

              <TextInput
                id="reg-email"
                label="Email"
                placeholder="example@email.com"
                size="md"
                radius="md"
                type="email"
                autoComplete="email"
                {...form.getInputProps("email")}
              />

              <TextInput
                id="reg-phone"
                label="Số điện thoại"
                placeholder="0912345678"
                size="md"
                radius="md"
                type="tel"
                autoComplete="tel"
                {...form.getInputProps("phone")}
              />

              <PasswordInput
                id="reg-password"
                label="Mật khẩu"
                placeholder="Tối thiểu 8 ký tự"
                size="md"
                radius="md"
                autoComplete="new-password"
                {...form.getInputProps("password")}
              />

              <Button
                id="register-submit-btn"
                type="submit"
                fullWidth
                size="md"
                radius="md"
                mt="xs"
                loading={loading}
                variant="filled"
                color="blue"
              >
                Tạo tài khoản
              </Button>
            </Stack>
          </form>
        </Paper>

        <Divider my="lg" />

        <Text ta="center" size="sm" c="dimmed">
          Đã có tài khoản?{" "}
          <Text
            component={Link}
            to="/login"
            size="sm"
            c="blue"
            fw={600}
            td="none"
            style={{ textDecoration: "none" }}
          >
            Đăng nhập
          </Text>
        </Text>
      </Box>
    </Center>
  );
}
