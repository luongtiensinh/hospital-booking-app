import { useEffect, useState } from "react";

function App() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const fetchTodos = async () => {
      try {
        // Sử dụng native fetch API của trình duyệt
        const response = await fetch("http://localhost:5000/api/todos");

        // Fetch không tự động quăng lỗi nếu mã HTTP là 4xx, 5xx nên ta cần tự kiểm tra
        if (!response.ok) {
          throw new Error(`Lỗi HTTP! Trạng thái: ${response.status}`);
        }

        // Parse dữ liệu JSON
        const data = await response.json();
        setTodos(data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    };

    fetchTodos();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h1>Danh sách công việc từ Supabase</h1>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.work_date}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
