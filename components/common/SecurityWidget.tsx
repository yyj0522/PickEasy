"use client";

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile: any;
  }
}

interface Props {
  onVerify: (token: string) => void;
}

const SecurityWidget = forwardRef(({ onVerify }: Props, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        onVerify('');
      }
    }
  }));

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.turnstile && containerRef.current) {
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
            callback: (token: string) => {
              onVerify(token);
            },
            'error-callback': () => {
              console.error("Turnstile 인증 에러 발생");
            }
          });
        } catch (e) {
          console.error("Turnstile 렌더링 실패:", e);
        }
      }
    };

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [onVerify]);

  return <div ref={containerRef} className="my-4 flex justify-center min-h-[65px]" />;
});

SecurityWidget.displayName = "SecurityWidget";
export default SecurityWidget;