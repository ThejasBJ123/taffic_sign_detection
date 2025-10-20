"use client";

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import Image from 'next/image';
import { detectTrafficSignals, type DetectTrafficSignalsOutput } from '@/ai/flows/detect-traffic-signals';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';

interface ImageDropzoneProps {
  confidence: number;
}

type Detection = DetectTrafficSignalsOutput['detections'][0];

export default function ImageDropzone({ confidence }: ImageDropzoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const { toast } = useToast();
  const placeholderImage = PlaceHolderImages[0];

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const droppedFile = acceptedFiles[0];
      if (!droppedFile.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Invalid File Type",
          description: "Please drop an image file (e.g., JPEG, PNG)."
        });
        return;
      }
      setFile(droppedFile);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        const img = new window.Image();
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height });
        };
        img.src = result;
      };
      reader.readAsDataURL(droppedFile);

      setIsLoading(true);
      setIsDialogOpen(true);

      try {
        const base64Reader = new FileReader();
        base64Reader.readAsDataURL(droppedFile);
        base64Reader.onloadend = async () => {
            const base64data = base64Reader.result as string;
            const result = await detectTrafficSignals({
                frameDataUri: base64data,
                confidenceThreshold: confidence,
            });
            setDetections(result.detections || []);
            setIsLoading(false);
        };
      } catch (error) {
          console.error("Detection failed:", error);
          toast({
              variant: "destructive",
              title: "Detection Failed",
              description: "The AI service could not process the image.",
          });
          setIsLoading(false);
          setIsDialogOpen(false);
      }
    }
  }, [confidence, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png'] },
  });

  const drawDetections = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    detections.forEach((detection) => {
        const [x, y, w, h] = detection.bbox;
        const scaleX = canvas.width / imageSize.width;
        const scaleY = canvas.height / imageSize.height;

        const scaledX = x * scaleX;
        const scaledY = y * scaleY;
        const scaledW = w * scaleX;
        const scaledH = h * scaleY;

        ctx.strokeStyle = 'hsl(var(--accent))';
        ctx.lineWidth = 3;
        ctx.strokeRect(scaledX, scaledY, scaledW, scaledH);
        
        const label = `${detection.class} ${Math.round(detection.confidence * 100)}%`;
        ctx.font = "16px 'Inter', sans-serif";
        const textMetrics = ctx.measureText(label);
        ctx.fillStyle = 'hsl(var(--accent))';
        ctx.fillRect(scaledX, scaledY > 22 ? scaledY - 22 : scaledY, textMetrics.width + 10, 22);
        
        ctx.fillStyle = "#FFFFFF";
        ctx.fillText(label, scaledX + 5, scaledY > 22 ? scaledY - 5 : scaledY + 16);
    });
  };

  const CanvasOverlay = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      if (canvasRef.current && detections.length > 0 && imageSize.width > 0) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if(ctx) {
            canvas.width = canvas.parentElement?.clientWidth || 0;
            canvas.height = canvas.parentElement?.clientHeight || 0;
            drawDetections(ctx, canvas);
        }
      }
    }, [detections, imageSize]);

    if (isLoading) return null;

    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
  };

  return (
    <>
      <div
        {...getRootProps()}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
          isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50 hover:bg-muted/30'
        }`}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-10 h-10 text-muted-foreground mb-2" />
        <p className="text-center text-muted-foreground">
          {isDragActive ? 'Drop the image here...' : 'Drag & drop, or click to select'}
        </p>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl w-full">
          <DialogHeader>
            <DialogTitle>Image Detection Results</DialogTitle>
            <DialogDescription>
              Detected traffic signals in the uploaded image.
            </DialogDescription>
          </DialogHeader>
          <div className="relative w-full aspect-video mt-4 bg-muted rounded-lg overflow-hidden">
            {preview && <Image src={preview} alt="Uploaded preview" layout="fill" objectFit="contain" />}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
              </div>
            )}
            {!isLoading && <CanvasOverlay />}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
