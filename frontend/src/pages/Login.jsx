import { Link, useLocation } from "react-router-dom";
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

function IconCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

export default function Login() {
  const location = useLocation();
  const justRegistered = location.state?.registered;

  return (
    <Center mih="100vh" bg="gray.0" p="md">
      <Box w="100%" maw={420}>
        {/* Logo & Heading */}
        <Stack align="center" mb="xl" gap="xs">
          <Title order={1} size="h2" fw={700} c="dark.8">
            Đăng nhập
          </Title>
          <Text size="sm" c="dimmed" ta="center">
            Chào mừng bạn quay trở lại
          </Text>
        </Stack>

        <Paper shadow="sm" radius="lg" p="xl" withBorder>
          {justRegistered && (
            <Alert
              icon={<IconCheck />}
              color="green"
              variant="light"
              mb="md"
              radius="md"
            >
              Đăng ký thành công! Hãy đăng nhập để tiếp tục.
            </Alert>
          )}

          <form onSubmit={(e) => e.preventDefault()}>
            <Stack gap="md">
              <TextInput
                id="login-email"
                label="Email"
                placeholder="example@email.com"
                size="md"
                radius="md"
                type="email"
                autoComplete="email"
              />

              <PasswordInput
                id="login-password"
                label="Mật khẩu"
                placeholder="Mật khẩu của bạn"
                size="md"
                radius="md"
                autoComplete="current-password"
              />

              <Button
                id="login-submit-btn"
                type="submit"
                fullWidth
                size="md"
                radius="md"
                mt="xs"
                variant="filled"
                color="blue"
              >
                Đăng nhập
              </Button>
            </Stack>
          </form>
        </Paper>

        <Divider my="lg" />

        <Text ta="center" size="sm" c="dimmed">
          Chưa có tài khoản?{" "}
          <Text
            component={Link}
            to="/register"
            size="sm"
            c="blue"
            fw={600}
            style={{ textDecoration: "none" }}
          >
            Đăng ký ngay
          </Text>
        </Text>
      </Box>
    </Center>
  );
}
