# VisionAlert

VisionAlert is a real-time traffic signal detection and announcement application built with Next.js and Google's Generative AI. It uses your device's camera to identify traffic signs and lights, providing visual and audio feedback to the user.

## Features

- **Real-time Detection**: Uses the device's camera feed to detect traffic signals in real-time.
- **AI-Powered Analysis**: Leverages a powerful AI model to identify a wide range of traffic signals, including stop signs, yield signs, and traffic lights (red, yellow, green).
- **Adjustable Confidence Threshold**: Allows you to fine-tune the sensitivity of the detection algorithm.
- **Audio Announcements**: Converts the detected signal's text into speech and plays it as an audio announcement.
- **Image Testing**: Drag and drop a static image to test the detection capabilities without using a live camera feed.
- **Camera Controls**:
    - Switch between front and rear-facing cameras.
    - Toggle the camera on and off.
    - View the camera feed in fullscreen mode.
- **Responsive Design**: A clean, modern interface that works on both desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn/ui](https://ui.shadcn.com/)
- **AI/Generative**: [Genkit](https://firebase.google.com/docs/genkit) (for AI flows)
- **Icons**: [Lucide React](https://lucide.dev/)

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later recommended)
- [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)
- A Google AI API key for Genkit.

### Setup

1.  **Clone the repository**:
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up environment variables**:
    Create a `.env` file in the root of the project and add your Google AI API key:
    ```
    GEMINI_API_KEY=your_google_ai_api_key_here
    ```

4.  **Run the development server**:
    The application runs on two development servers: one for the Next.js frontend and one for the Genkit AI flows.

    - **Start the Next.js app**:
      ```bash
      npm run dev
      ```
      This will start the main application on [http://localhost:9002](http://localhost:9002).

    - **Start the Genkit server**:
      In a separate terminal, run:
      ```bash
      npm run genkit:dev
      ```
      This starts the Genkit development server, which handles the AI-powered detections and text-to-speech services.

5.  **Open the app**:
    Navigate to [http://localhost:9002](http://localhost:9002) in your browser to use the application.
