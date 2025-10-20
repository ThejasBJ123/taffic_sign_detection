# **App Name**: VisionAlert

## Core Features:

- Live Video Capture: Capture live video stream from user's camera via WebRTC.
- Traffic Signal Detection: Detect traffic signals/signs & lights from the live video stream using a pre-trained model. Utilize temporal smoothing and tracking algorithms (SORT/DeepSORT) to reduce flicker and false positives. NMS is performed in this feature.
- Real-time Overlay: Overlay the detected traffic signal information (bounding box, class label, confidence) onto the live video feed.
- Audio Announcement: Announce detected signals aloud using the Web Speech API.
- Drag & Drop Testing: Allow users to drag and drop images or videos for testing the traffic signal detection on offline content.
- Admin Panel: Display of a web based admin panel allowing the user to adjust a threshold value that will be used to trigger AI related functions as a tool.

## Style Guidelines:

- Primary color: Deep sky blue (#00BFFF) for clarity and focus. This color evokes trust and awareness, ideal for safety-related applications.
- Background color: Light cyan (#E0FFFF) to provide a clean, unobtrusive backdrop that keeps the focus on the video feed.
- Accent color: Soft violet (#EE82EE) to highlight important detections and call-to-action elements.
- Body and headline font: 'Inter' (sans-serif) for a modern and readable interface.  'Inter' will be used for all text, making the UI clean.
- Use clear, recognizable icons to represent different traffic signals.
- Video pane on the left, detections and controls on the right.
- Subtle animations for highlighting detected signals.