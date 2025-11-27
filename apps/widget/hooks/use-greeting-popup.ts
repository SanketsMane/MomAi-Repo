"use client";

import { useState, useEffect, useCallback } from "react";

const GREETING_SHOWN_KEY = "mom-ai-greeting-shown";

export const useGreetingPopup = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    // Check if greeting was already shown
    const greetingShown = localStorage.getItem(GREETING_SHOWN_KEY);
    
    console.log("Greeting popup - localStorage check:", greetingShown);
    
    if (!greetingShown) {
      console.log("Greeting popup - showing after delay");
      // Show greeting after a small delay to let the widget load
      const timer = setTimeout(() => {
        setIsVisible(true);
        console.log("Greeting popup - setting visible to true");
      }, 500); // Reduced delay for quicker response
      
      return () => clearTimeout(timer);
    } else {
      console.log("Greeting popup - already shown before, not showing");
    }
  }, []);

  const dismissGreeting = useCallback(() => {
    console.log("Greeting popup - dismissing");
    setIsVisible(false);
    setHasUserInteracted(true);
    
    // Mark greeting as shown in localStorage
    localStorage.setItem(GREETING_SHOWN_KEY, "true");
  }, []);

  const handleUserInteraction = useCallback(() => {
    if (isVisible) {
      dismissGreeting();
    }
    setHasUserInteracted(true);
  }, [isVisible, dismissGreeting]);

  // Auto-dismiss after 15 seconds
  useEffect(() => {
    if (isVisible) {
      console.log("Greeting popup - setting auto-dismiss timer");
      const timer = setTimeout(() => {
        console.log("Greeting popup - auto-dismissing after 15 seconds");
        dismissGreeting();
      }, 15000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, dismissGreeting]);

  const resetGreeting = useCallback(() => {
    localStorage.removeItem(GREETING_SHOWN_KEY);
    setIsVisible(false);
    setHasUserInteracted(false);
    console.log("Greeting popup - reset for testing");
  }, []);

  return {
    isVisible: isVisible && !hasUserInteracted,
    dismissGreeting,
    handleUserInteraction,
    hasUserInteracted,
    resetGreeting // For debugging/testing
  };
};