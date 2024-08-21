/**
 * v0 by Vercel.
 * @see https://v0.dev/t/VClU7ymAALQ
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { JSX, SVGProps } from "react"

export default function Component() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Audio to Transcript</CardTitle>
          <CardDescription>Upload an audio file and we'll generate a transcript for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-muted rounded-md cursor-pointer">
            <input type="file" accept="audio/*" className="absolute w-full h-full opacity-0 cursor-pointer" />
            <div className="flex flex-col items-center justify-center space-y-2 text-muted-foreground">
              <UploadIcon className="w-8 h-8" />
              <p>Drag and drop your audio file here</p>
              <p className="text-sm">or click to select a file</p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="Enter a title for your transcript" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="summary">Summary</Label>
            <Textarea id="summary" placeholder="Summarize the key points of the audio" className="min-h-[100px]" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="critique">Critique</Label>
            <Textarea
              id="critique"
              placeholder="Add your thoughts and feedback on the audio"
              className="min-h-[100px]"
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Generate Transcript</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

function UploadIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  )
}