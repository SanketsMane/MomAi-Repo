import { useEffect, useRef, useCallback } from "react";

interface UseNotificationSoundOptions {
  enabled?: boolean;
  volume?: number;
  soundType?: 'incoming' | 'outgoing' | 'newChat' | 'error' | 'typing';
}

export const useNotificationSound = (options: UseNotificationSoundOptions = {}) => {
  const { enabled = true, volume = 0.7, soundType = 'incoming' } = options;
  const audioRefs = useRef<Record<string, HTMLAudioElement | null>>({});

  // Initialize audio elements for different notification types
  useEffect(() => {
    const createAudioElement = (type: string) => {
      const audio = new Audio();
      
      // Generate different notification tones based on type
      const generateNotificationTone = (notificationType: string) => {
        try {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const sampleRate = audioContext.sampleRate;
          
          let duration: number;
          let buffer: AudioBuffer;
          let channelData: Float32Array;
          
          switch (notificationType) {
            case 'incoming': {
              // Incoming Message: Soft "pop + chime" - WhatsApp Web style
              duration = 0.4;
              const numSamples = sampleRate * duration;
              buffer = audioContext.createBuffer(1, numSamples, sampleRate);
              channelData = buffer.getChannelData(0);
              
              for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Soft pop (0-0.05s)
                if (t < 0.05) {
                  const popFreq = 200;
                  const popEnv = Math.exp(-t * 40) * 0.3;
                  sample += Math.sin(2 * Math.PI * popFreq * t) * popEnv;
                }
                
                // Main chime (0.02s-0.4s)
                if (t >= 0.02) {
                  const chimeFreq = 660; // E5 - pleasant frequency
                  const chimeEnv = Math.exp(-(t - 0.02) * 8) * 0.4;
                  sample += Math.sin(2 * Math.PI * chimeFreq * t) * chimeEnv;
                  sample += Math.sin(2 * Math.PI * chimeFreq * 2 * t) * chimeEnv * 0.2; // Harmonic
                }
                
                channelData[i] = Math.max(-1, Math.min(1, sample));
              }
              break;
            }
            
            case 'outgoing': {
              // Outgoing Message: Soft "tap/swoosh" - confirmation feel
              duration = 0.25;
              const numSamples = sampleRate * duration;
              buffer = audioContext.createBuffer(1, numSamples, sampleRate);
              channelData = buffer.getChannelData(0);
              
              for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Soft tap with filtered noise
                const tapFreq = 800;
                const tapEnv = Math.exp(-t * 15) * 0.25;
                sample += Math.sin(2 * Math.PI * tapFreq * t) * tapEnv;
                
                // Add subtle swoosh (filtered white noise)
                if (t < 0.1) {
                  const noise = (Math.random() - 0.5) * 0.1;
                  const noiseEnv = Math.exp(-t * 20);
                  sample += noise * noiseEnv;
                }
                
                channelData[i] = Math.max(-1, Math.min(1, sample));
              }
              break;
            }
            
            case 'newChat': {
              // New Conversation: Digital "ping + shimmer" - premium feel
              duration = 0.6;
              const numSamples = sampleRate * duration;
              buffer = audioContext.createBuffer(1, numSamples, sampleRate);
              channelData = buffer.getChannelData(0);
              
              for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Initial ping
                if (t < 0.15) {
                  const pingFreq = 880; // A5
                  const pingEnv = Math.exp(-t * 12) * 0.4;
                  sample += Math.sin(2 * Math.PI * pingFreq * t) * pingEnv;
                }
                
                // Shimmer effect (0.1s-0.6s)
                if (t >= 0.1) {
                  const shimmerFreq = 1320; // E6
                  const shimmerEnv = Math.exp(-(t - 0.1) * 6) * 0.25;
                  const shimmerMod = 1 + Math.sin(2 * Math.PI * 8 * t) * 0.3;
                  sample += Math.sin(2 * Math.PI * shimmerFreq * t) * shimmerEnv * shimmerMod;
                }
                
                channelData[i] = Math.max(-1, Math.min(1, sample));
              }
              break;
            }
            
            case 'error': {
              // Error: Soft "dud/low thump" - non-harsh
              duration = 0.3;
              const numSamples = sampleRate * duration;
              buffer = audioContext.createBuffer(1, numSamples, sampleRate);
              channelData = buffer.getChannelData(0);
              
              for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Low thump
                const thumpFreq = 120; // Low frequency
                const thumpEnv = Math.exp(-t * 10) * 0.3;
                sample += Math.sin(2 * Math.PI * thumpFreq * t) * thumpEnv;
                
                // Add soft dud effect
                if (t < 0.1) {
                  const dudFreq = 250;
                  const dudEnv = Math.exp(-t * 25) * 0.2;
                  sample += Math.sin(2 * Math.PI * dudFreq * t) * dudEnv;
                }
                
                channelData[i] = Math.max(-1, Math.min(1, sample));
              }
              break;
            }
            
            case 'typing': {
              // Typing Indicator: Subtle "tick + glitch"
              duration = 0.2;
              const numSamples = sampleRate * duration;
              buffer = audioContext.createBuffer(1, numSamples, sampleRate);
              channelData = buffer.getChannelData(0);
              
              for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                let sample = 0;
                
                // Subtle tick
                if (t < 0.05) {
                  const tickFreq = 1200;
                  const tickEnv = Math.exp(-t * 50) * 0.15;
                  sample += Math.sin(2 * Math.PI * tickFreq * t) * tickEnv;
                }
                
                // Glitch effect
                if (t >= 0.03 && t < 0.08) {
                  const glitchFreq = 600 + Math.sin(2 * Math.PI * 50 * t) * 200;
                  const glitchEnv = Math.exp(-(t - 0.03) * 30) * 0.1;
                  sample += Math.sin(2 * Math.PI * glitchFreq * t) * glitchEnv;
                }
                
                channelData[i] = Math.max(-1, Math.min(1, sample));
              }
              break;
            }
            
            default: {
              // Default fallback
              duration = 0.3;
              const numSamples = sampleRate * duration;
              buffer = audioContext.createBuffer(1, numSamples, sampleRate);
              channelData = buffer.getChannelData(0);
              
              for (let i = 0; i < numSamples; i++) {
                const t = i / sampleRate;
                const freq = 440;
                const envelope = Math.exp(-t * 8) * 0.3;
                channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope;
              }
            }
          }
          
          // Convert buffer to WAV and create data URL
          const wavData = audioBufferToWav(buffer);
          const blob = new Blob([wavData], { type: 'audio/wav' });
          return URL.createObjectURL(blob);
          
        } catch (error) {
          console.warn('Could not generate audio:', error);
          return null;
        }
      };
      
      const audioUrl = generateNotificationTone(type);
      if (audioUrl) {
        audio.src = audioUrl;
        audio.volume = volume;
        audio.preload = 'auto';
      }
      
      return audio;
    };

    // Create all notification sound types
    const soundTypes = ['incoming', 'outgoing', 'newChat', 'error', 'typing'];
    soundTypes.forEach(type => {
      audioRefs.current[type] = createAudioElement(type);
    });

    return () => {
      // Cleanup blob URLs
      Object.values(audioRefs.current).forEach(audio => {
        if (audio?.src && audio.src.startsWith('blob:')) {
          URL.revokeObjectURL(audio.src);
        }
      });
    };
  }, [volume]);

  const playNotification = useCallback((type: string = soundType) => {
    if (!enabled) return;
    
    const audio = audioRefs.current[type];
    if (!audio) return;
    
    try {
      audio.volume = volume;
      audio.currentTime = 0;
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.warn('Could not play notification sound:', error);
        });
      }
    } catch (error) {
      console.warn('Could not play notification sound:', error);
    }
  }, [enabled, volume, soundType]);

  return {
    playNotification,
    playIncoming: () => playNotification('incoming'),
    playOutgoing: () => playNotification('outgoing'),
    playNewChat: () => playNotification('newChat'),
    playError: () => playNotification('error'),
    playTyping: () => playNotification('typing'),
  };
};

// Utility function to convert AudioBuffer to WAV format
function audioBufferToWav(buffer: AudioBuffer): ArrayBuffer {
  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  
  const bufferLength = buffer.length;
  const dataSize = bufferLength * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;
  
  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);
  
  // WAV header
  const writeString = (offset: number, string: string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, format, true);
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);
  
  // Convert samples
  const channelData = buffer.getChannelData(0);
  let offset = 44;
  
  for (let i = 0; i < bufferLength; i++) {
    const rawSample = channelData[i] || 0;
    const sample = Math.max(-1, Math.min(1, rawSample));
    view.setInt16(offset, sample * 0x7FFF, true);
    offset += 2;
  }
  
  return arrayBuffer;
}