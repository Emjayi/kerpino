import { Loader2 } from "lucide-react"
import { WavyBackground } from "../ui/wavy-background"

export default function Loading() {
  return (
    <WavyBackground className="flex min-h-[80vh] items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    </WavyBackground>
  )
}

