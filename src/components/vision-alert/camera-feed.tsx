
"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { Camera, CameraOff, Loader2, Maximize } from "lucide-react";
import { detectTrafficSignals, type DetectTrafficSignalsOutput } from "@/ai/flows/detect-traffic-signals";
import { textToSpeech } from "@/ai/flows/text-to-speech";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "../ui/card";
import { useToast } from "@/hooks/use-toast";

type Detection = DetectTrafficSignalsOutput["detections"][0];

interface CameraFeedProps {
  confidence: number;
  isTtsEnabled: boolean;
  onDetectionsChange: (detections: Detection[]) => void;
}

const DETECTION_INTERVAL = 10000;
const ANNOUNCEMENT_PERSISTENCE = 2; // Announce after 2 consecutive frames

export default function CameraFeed({ confidence, isTtsEnabled, onDetectionsChange }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recentDetectionsRef = useRef<Map<string, number>>(new Map());
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const lastAnnouncedSignal = useRef<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsSpeaking(false);
  }, []);

  const speak = useCallback(async (text: string) => {
    if (isSpeaking || !audioRef.current) return;
    setIsSpeaking(true);
    try {
      const response = await textToSpeech(text);
      if (response.media) {
        audioRef.current.src = response.media;
        audioRef.current.play();
        lastAnnouncedSignal.current = text.replace(/ /g, "_").toUpperCase();
      }
    } catch (e) {
      console.error("Speech synthesis failed:", e);
      setIsSpeaking(false);
    }
  }, [isSpeaking]);
  
  const stopCamera = useCallback(() => {
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    
    const canvas = canvasRef.current;
    if(canvas){
        const ctx = canvas.getContext('2d');
        ctx?.clearRect(0,0, canvas.width, canvas.height);
    }

    setIsCameraOn(false);
    onDetectionsChange([]);
  }, [onDetectionsChange]);

  const handleSpokenDetections = useCallback((detections: Detection[]) => {
      if (!isTtsEnabled || isSpeaking) return;

      const priority = ["RED_LIGHT", "STOP", "YIELD", "SPEED_LIMIT", "GREEN_LIGHT", "YELLOW_LIGHT"];
      const detectedClasses = new Set(detections.map(d => d.class));
      const newCounters = new Map<string, number>();

      let highestPrioritySignal: string | null = null;
      let highestPriorityIndex = Infinity;
      
      // Reset signals that are no longer detected
      recentDetectionsRef.current.forEach((_, key) => {
        if (!detectedClasses.has(key)) {
          recentDetectionsRef.current.delete(key);
          if (lastAnnouncedSignal.current === key) {
            lastAnnouncedSignal.current = null;
          }
        }
      });

      detectedClasses.forEach(cls => {
          const currentCount = (recentDetectionsRef.current.get(cls) || 0) + 1;
          newCounters.set(cls, currentCount);

          if (currentCount >= ANNOUNCEMENT_PERSISTENCE) {
              const priorityIndex = priority.indexOf(cls);
              if (priorityIndex !== -1 && priorityIndex < highestPriorityIndex) {
                  highestPriorityIndex = priorityIndex;
                  highestPrioritySignal = cls;
              }
          }
      });
      
      recentDetectionsRef.current = newCounters;

      if (highestPrioritySignal && highestPrioritySignal !== lastAnnouncedSignal.current) {
          const textToSpeak = highestPrioritySignal.replace(/_/g, " ");
          speak(textToSpeak);
          // Reset counter after announcement to avoid immediate re-announcement
          recentDetectionsRef.current.set(highestPrioritySignal, 0); 
      }
  }, [isTtsEnabled, isSpeaking, speak]);


  const drawDetections = useCallback((detections: Detection[]) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    detections.forEach((detection) => {
        const [x, y, w, h] = detection.bbox;
        const scaleX = canvas.width / video.videoWidth;
        const scaleY = canvas.height / video.videoHeight;

        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledW = w * scaleX;
        const scaledH = h * scaleY;

        // Draw bounding box
        ctx.strokeStyle = "hsl(var(--accent))";
        ctx.lineWidth = 3;
        ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
        
        // Draw label background
        const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
        ctx.font = "14px 'Inter', sans-serif";
        const textWidth = ctx.measureText(label).width;
        ctx.fillStyle = "hsl(var(--accent))";
        ctx.fillRect(scaledX, scaledY - 20, textWidth + 10, 20);

        // Draw label text
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(label, scaledX + 5, scaledY - 5);
    });
  }, []);

  const runDetection = useCallback(async () => {
    const video = videoRef.current;
    const hiddenCanvas = hiddenCanvasRef.current;
    if (!video || video.readyState < 2 || !hiddenCanvas) return;
    
    const hiddenCtx = hiddenCanvas.getContext("2d");
    if (!hiddenCtx) return;

    hiddenCanvas.width = 416;
    hiddenCanvas.height = 416;
    hiddenCtx.drawImage(video, 0, 0, hiddenCanvas.width, hiddenCanvas.height);
    
    const frameDataUri = hiddenCanvas.toDataURL("image/jpeg", 0.6);

    try {
      const result = await detectTrafficSignals({
        frameDataUri,
        confidenceThreshold: confidence,
      });

      if (result && result.detections) {
        onDetectionsChange(result.detections);
        drawDetections(result.detections);
        handleSpokenDetections(result.detections);
      }
    } catch (e) {
      console.error("Detection failed:", e);
      toast({
        variant: "destructive",
        title: "AI Detection Error",
        description: "The detection service failed to process the camera feed.",
      });
      // Do not stop the camera on intermittent AI errors
    }
  }, [confidence, onDetectionsChange, drawDetections, handleSpokenDetections, toast]);

  const startCamera = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError("Camera access is not supported by your browser.");
        setIsLoading(false);
        return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play();
            setIsCameraOn(true);
            setIsLoading(false);
            detectionIntervalRef.current = setInterval(runDetection, DETECTION_INTERVAL);
        }
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      if (err instanceof DOMException) {
          if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
              setError("Camera permission was denied. Please allow camera access in your browser settings.");
          } else {
              setError("Could not access camera. Is it being used by another application?");
          }
      } else {
          setError("An unknown error occurred while accessing the camera.");
      }
      setIsLoading(false);
      setIsCameraOn(false);
    }
  }, [runDetection]);

  useEffect(() => {
    // This effect now only runs once on mount to start the camera initially.
    if (isClient) {
      startCamera();
    }
    // The cleanup function will be called when the component unmounts.
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient]); // Intentionally not including startCamera/stopCamera to avoid re-running

  const toggleFullScreen = () => {
    const parentElement = videoRef.current?.parentElement;
    if (parentElement && document.fullscreenEnabled) {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            parentElement.requestFullscreen();
        }
    }
  }

  const handleToggleCamera = () => {
    if (isCameraOn) {
        stopCamera();
    } else {
        startCamera();
    }
  }
  
  if (!isClient) {
    return (
        <Card className="flex-1 w-full h-full p-4 overflow-hidden flex flex-col items-center justify-center relative shadow-lg">
            <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        </Card>
    );
  }

  return (
    <Card className="flex-1 w-full h-full p-4 overflow-hidden flex flex-col items-center justify-center relative shadow-lg">
      <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
        {(isLoading && !error) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Starting camera...</p>
            </div>
        )}
        {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 z-10 p-4">
                <Alert variant="destructive" className="max-w-md">
                    <CameraOff className="h-4 w-4" />
                    <AlertTitle>Camera Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button onClick={startCamera} className="mt-4">
                    <Camera className="mr-2" /> Try Again
                </Button>
            </div>
        )}
        <video
          ref={videoRef}
          playsInline
          autoPlay
          muted
          className={`w-full h-full object-cover transition-opacity duration-300 ${isCameraOn ? 'opacity-100' : 'opacity-0'}`}
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        <canvas ref={hiddenCanvasRef} className="hidden" />
        
        <div className="absolute top-2 right-2 flex items-center gap-2">
            <Button size="icon" variant="ghost" className="bg-background/50 hover:bg-background/80" onClick={toggleFullScreen}>
                <Maximize className="w-5 h-5"/>
                <span className="sr-only">Toggle Fullscreen</span>
            </Button>
            <Button size="icon" variant={isCameraOn ? "destructive" : "default"} onClick={handleToggleCamera}>
                {isCameraOn ? <CameraOff className="w-5 h-5"/> : <Camera className="w-5 h-5"/>}
                <span className="sr-only">{isCameraOn ? 'Stop Camera' : 'Start Camera'}</span>
            </Button>
        </div>
      </div>
    </Card>
  );
}
