import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import MarkdownPreview from "@uiw/react-markdown-preview";


type PromptProps = {
  content: string
}

export function Prompt({ content }: PromptProps) {
  return (
    <div className="pl-4 pr-12 py-4 flex gap-5">
      <Avatar>
        <AvatarImage src={null}/>
        <AvatarFallback className="text-white bg-orange-500">YL</AvatarFallback>
      </Avatar>
      <MarkdownPreview
        className="bg-transparent !min-w-0 text-foreground"
        source={content}
      />
    </div>
  )
}