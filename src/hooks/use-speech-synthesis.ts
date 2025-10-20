"use client";

import { useState, useCallback, useEffect } from 'react';

export function useSpeechSynthesis() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const speak = useCallback((text: string) => {
    if (!isSupported || isSpeaking) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [isSupported, isSpeaking]);

  const cancel = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
}
