"use client";

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile: any;
  }
}

interface Props {
  onVerify: (token: string) => void;
}

export default function SecurityWidget({ onVerify }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.turnstile) {
        window.turnstile.render(containerRef.current, {
          sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY, 
          callback: (token: string) => {
            onVerify(token);
          },
        });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, [onVerify]);

  return <div ref={containerRef} className="my-4 flex justify-center" />;
}