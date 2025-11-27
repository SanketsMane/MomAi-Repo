
"use client";

import { useEffect, useState } from "react";
import { cn } from "@workspace/ui/lib/utils";

interface GreetingPopupProps {
  isVisible: boolean;
  onDismiss: () => void;
  className?: string;
}

const getTimeBasedGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return {
      greeting: "Good Morning 👋",
      icon: "🌅"
    };
  } else if (hour >= 12 && hour < 17) {
    return {
      greeting: "Good Afternoon ☀️", 
      icon: "☀️"
    };
  } else {
    return {
      greeting: "Good Evening 🌙",
      icon: "🌙"
    };
  }
};

export const GreetingPopup = ({ isVisible, onDismiss, className }: GreetingPopupProps) => {
  const [shouldRender, setShouldRender] = useState(isVisible);
  const { greeting } = getTimeBasedGreeting();

  console.log('GreetingPopup render - isVisible:', isVisible, 'shouldRender:', shouldRender);

  useEffect(() => {
    console.log('GreetingPopup useEffect - isVisible changed to:', isVisible);
    if (isVisible) {
      setShouldRender(true);
      
      // Auto-dismiss after 15 seconds
      const timer = setTimeout(() => {
        console.log('GreetingPopup auto-dismiss timer fired');
        onDismiss();
      }, 15000);

      return () => clearTimeout(timer);
    } else {
      // Delay unmounting to allow exit animation
      const timer = setTimeout(() => {
        console.log('GreetingPopup hiding after animation');
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!shouldRender) return null;

  return (
    <div
      className={cn(
        "absolute bottom-20 left-4 right-4 z-50 transition-all duration-300 ease-in-out",
        isVisible 
          ? "opacity-100 translate-y-0 scale-100" 
          : "opacity-0 translate-y-2 scale-95 pointer-events-none",
        className
      )}
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">AI</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {greeting}
            </div>
            <div className="text-sm text-gray-600">
              Hey there! I'm here to assist you with any doubts you might have.
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Small arrow pointing down */}
        <div className="absolute -bottom-2 left-6">
          <div className="w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
        </div>
      </div>
    </div>
  );
};