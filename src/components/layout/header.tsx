import { TrafficCone } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <TrafficCone className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight font-headline text-foreground">
              VisionAlert
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
}
