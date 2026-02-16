"use client";

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: any;
  }
}

interface SecurityWidgetProps {
  onVerify: (token: string) => void;
}

const SecurityWidget = forwardRef(({ onVerify }: SecurityWidgetProps, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
        onVerify(''); 
      }
    }
  }));

  useEffect(() => {
    const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    
    if (!siteKey) {
      console.error("Cloudflare Turnstile Site Key가 없습니다.");
      setError("보안 키 설정 오류");
      return;
    }

    const renderWidget = () => {
      if (!containerRef.current || !window.turnstile) return;

      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (e) {
        }
        widgetIdRef.current = null;
      }

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerify(token);
          },
          "error-callback": () => {
             setError("보안 검증에 실패했습니다. 다시 시도해주세요.");
          },
        });
        widgetIdRef.current = id;
      } catch (e) {
        console.error("Turnstile Render Error:", e);
      }
    };

    const loadTurnstile = () => {
      if (window.turnstile) {
        renderWidget();
        return;
      }

      const scriptId = 'turnstile-script';
      if (document.getElementById(scriptId)) {
         const checkInterval = setInterval(() => {
            if(window.turnstile) {
                clearInterval(checkInterval);
                renderWidget();
            }
         }, 100);
         return;
      }

      const script = document.createElement('script');
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.id = scriptId;
      script.async = true;
      script.defer = true;
      script.onload = () => renderWidget();
      document.body.appendChild(script);
    };

    loadTurnstile();

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch(e) {
        }
        widgetIdRef.current = null;
      }
    };
  }, [onVerify]);

  return (
    <div className="flex flex-col items-center justify-center py-4">
      {error ? (
        <div className="text-red-500 text-sm font-bold bg-red-50 px-4 py-2 rounded-lg">
          ⚠️ {error}
        </div>
      ) : (
        <div ref={containerRef} className="min-h-[65px]" />
      )}
      <p className="text-[10px] text-slate-400 mt-2">
        보안을 위해 Cloudflare Turnstile을 사용합니다.
      </p>
    </div>
  );
});

SecurityWidget.displayName = "SecurityWidget";
export default SecurityWidget;