import { Conversation } from "@/components/conversation";
import { Sidebar } from "@/components/sidebar";

export default function App() {
  return (
    <div className="flex overflow-hidden">
      <Sidebar/>
      <div className="flex justify-center items-center w-screen h-screen relative overflow-hidden">
        <Conversation/>
      </div>
    </div>
  )
}