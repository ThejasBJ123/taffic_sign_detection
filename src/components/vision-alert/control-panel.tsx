"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Bell, BellOff, UploadCloud, Settings, BrainCircuit } from "lucide-react";
import DetectionList, { type Detection } from "./detection-list";
import ImageDropzone from "./image-dropzone";
import { Separator } from "../ui/separator";

interface ControlPanelProps {
  confidence: number;
  onConfidenceChange: (value: number) => void;
  isTtsEnabled: boolean;
  onTtsToggle: (value: boolean) => void;
  detections: Detection[];
}

export default function ControlPanel({
  confidence,
  onConfidenceChange,
  isTtsEnabled,
  onTtsToggle,
  detections,
}: ControlPanelProps) {
  return (
    <Card className="h-full shadow-lg flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="text-primary" />
          <span>Control Panel</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confidence-slider" className="flex items-center gap-2 text-base">
              <BrainCircuit className="w-5 h-5" /> Confidence Threshold
            </Label>
            <div className="flex items-center gap-4">
              <Slider
                id="confidence-slider"
                min={0}
                max={1}
                step={0.05}
                value={[confidence]}
                onValueChange={(value) => onConfidenceChange(value[0])}
              />
              <span className="font-mono text-lg font-semibold text-primary w-16 text-center">
                {(confidence * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div className="flex items-center space-x-2">
                {isTtsEnabled ? <Bell className="text-primary" /> : <BellOff className="text-muted-foreground" />}
              <Label htmlFor="tts-switch" className="text-base cursor-pointer">
                Audio Announcements
              </Label>
            </div>
            <Switch
              id="tts-switch"
              checked={isTtsEnabled}
              onCheckedChange={onTtsToggle}
            />
          </div>
        </div>

        <Separator />
        
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            Active Detections
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2">
            <DetectionList detections={detections} />
          </div>
        </div>
        
        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
            <UploadCloud /> Test an Image
          </h3>
          <ImageDropzone confidence={confidence} />
        </div>
      </CardContent>
    </Card>
  );
}
