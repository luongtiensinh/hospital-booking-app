import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MantineProvider, createTheme } from "@mantine/core";
import "@mantine/core/styles.css";
import "./index.css";
import App from "./App.jsx";

const theme = createTheme({
  fontFamily: "'Inter', system-ui, sans-serif",
  primaryColor: "blue",
  defaultRadius: "md",
  components: {
    Button: {
      defaultProps: {
        variant: "filled",
      },
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <MantineProvider theme={theme} defaultColorScheme="light">
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </MantineProvider>
  </StrictMode>,
);
