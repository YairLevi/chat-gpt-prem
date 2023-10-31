import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ChatProvider } from "@/contexts/chat";
import { ThemeProvider } from "@/contexts/theme";

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  <ThemeProvider>
    <ChatProvider>
      <App/>
    </ChatProvider>
  </ThemeProvider>
)
