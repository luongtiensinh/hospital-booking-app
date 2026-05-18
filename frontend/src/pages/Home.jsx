import {
  Box,
  Button,
  Center,
  Container,
  Paper,
  Text,
  Title,
} from "@mantine/core";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <Box bg="gray.0" mih="100vh">
      <Container size="sm" pt="xl">
        <Paper shadow="sm" radius="lg" p="xl" withBorder>
          <Center flexDirection="column" gap="md">
            <Title order={1} size="h3" c="blue.6">
              Trang Chủ
            </Title>
            <Text>
              Xin chào,{" "}
              <strong>{user?.user_metadata?.fullname || user?.email}</strong>!
            </Text>
            <Text c="dimmed" size="sm">
              Bạn đã đăng nhập thành công vào hệ thống.
            </Text>

            <Button mt="xl" color="red" variant="light" onClick={handleLogout}>
              Đăng xuất
            </Button>
          </Center>
        </Paper>
      </Container>
    </Box>
  );
}
