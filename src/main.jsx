import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"

// Монтируем React в div#root из index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
