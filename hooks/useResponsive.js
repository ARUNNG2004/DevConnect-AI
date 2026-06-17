"use client";

import { useState, useEffect } from "react";

/**
 * useResponsive — returns breakpoint booleans based on window width.
 * Breakpoints:
 *   isMobile  : width <= 640px
 *   isTablet  : width > 640px && width <= 1024px
 *   isDesktop : width > 1024px
 */
export function useResponsive() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1280
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    // Set initial value
    setWidth(window.innerWidth);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return {
    width,
    isMobile: width <= 640,
    isTablet: width > 640 && width <= 1024,
    isDesktop: width > 1024,
    isSmallTablet: width > 640 && width <= 768,
  };
}