
"use client";

import { useState, useEffect } from "react";
import CameraFeed from "./camera-feed";
import ControlPanel from "./control-panel";
import { type DetectTrafficSignalsOutput } from "@/ai/flows/detect-traffic-signals";

type Detection = DetectTrafficSignalsOutput["detections"][0];

export default function VisionAlertDashboard() {
  const [confidence, setConfidence] = useState(0.5);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null; // or a loading spinner
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-65px)]">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
        <div className="lg:col-span-2 h-full flex">
          <CameraFeed
            confidence={confidence}
            isTtsEnabled={isTtsEnabled}
            onDetectionsChange={setDetections}
          />
        </div>
        <div className="lg:col-span-1 h-full flex">
          <ControlPanel
            confidence={confidence}
            onConfidenceChange={setConfidence}
            isTtsEnabled={isTtsEnabled}
            onTtsToggle={setIsTtsEnabled}
            detections={detections}
          />
        </div>
      </div>
    </div>
  );
}
