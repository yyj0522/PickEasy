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
        onVerify(''); // 토큰 초기화
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
        // [중요] 환경변수 뒤에 붙은 공백/줄바꿈 제거 (.trim())
        const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

        if (!siteKey) {
          console.error("Turnstile Site Key가 없습니다.");
          return;
        }

        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey, 
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
// Vercel 환경변수 갱신을 위한 강제 재배포 트리거