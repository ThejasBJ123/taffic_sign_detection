"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, List } from "lucide-react";

export type Detection = {
  class: string;
  confidence: number;
  bbox: number[];
};

interface DetectionListProps {
  detections: Detection[];
}

export default function DetectionList({ detections }: DetectionListProps) {
  if (detections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-6 bg-muted/50 rounded-lg border-dashed border-2 h-full">
        <List className="w-10 h-10 text-muted-foreground mb-3" />
        <p className="text-muted-foreground font-medium">No signals detected.</p>
        <p className="text-sm text-muted-foreground/80">Point the camera at a road sign.</p>
      </div>
    );
  }

  const sortedDetections = [...detections].sort((a, b) => b.confidence - a.confidence);

  return (
    <div className="space-y-2">
      {sortedDetections.map((detection, index) => (
        <Card key={index} className="transition-all hover:bg-muted/50">
          <CardContent className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/20 rounded-md">
                <BarChart className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="font-semibold text-foreground">
                  {detection.class.replace(/_/g, " ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Confidence: {(detection.confidence * 100).toFixed(1)}%
                </p>
              </div>
            </div>
            <Badge variant="secondary">{`BBox: [${detection.bbox.map(b => Math.round(b)).join(', ')}]`}</Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
