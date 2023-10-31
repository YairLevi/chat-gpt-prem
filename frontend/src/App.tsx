import { Conversation } from "@/components/conversation";
import { Sidebar } from "@/components/sidebar";

export default function App() {
  return (
    <div className="flex h-screen">
      <Sidebar/>
      <div className="flex justify-center items-center w-full h-full relative overflow-hidden">
        <Conversation/>
      </div>
    </div>
  )
}