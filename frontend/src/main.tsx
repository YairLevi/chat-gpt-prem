import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import { ChatProvider } from "@/contexts/chat";

const container = document.getElementById('root')

const root = createRoot(container!)

root.render(
  <ChatProvider>
    <App/>
  </ChatProvider>
)
