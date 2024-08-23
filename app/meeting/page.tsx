/**
 * v0 by Vercel.
 * @see https://v0.dev/t/x3qJ1pboqoH
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function Component() {
  return (
    <div className="flex flex-col min-h-dvh">
      <main className="flex-1 flex flex-col items-center justify-center px-4 md:px-6 py-12">
        <div className="max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold">Audio Transcription</h1>
            <p className="text-muted-foreground">Upload an audio file and get a transcript.</p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Upload Audio</CardTitle>
              <CardDescription>Supported formats: MP3, WAV, FLAC</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input type="file" id="audio-file" />
                <Button type="submit" className="w-full">
                  Transcribe
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}