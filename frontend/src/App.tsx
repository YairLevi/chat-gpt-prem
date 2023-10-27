import { Button } from "@/components/ui/button";
import {Plus} from 'lucide-react'
import { Conversation } from "@/components/conversation";

export default function App() {
  return (
    <div className="flex justify-center items-center w-screen h-screen relative">
      <Conversation/>
      <Button className="absolute left-5 top-5" variant="outline">
        <Plus className="mr-2 -ml-2" size={20}/> New Chat
      </Button>
    </div>
  )
}