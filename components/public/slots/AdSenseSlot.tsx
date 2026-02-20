'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Payload {
  adClient: string;
  adSlot: string;
  format?: string;
}

export function AdSenseSlot({ payload }: { payload: Payload }) {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!ref.current) return;

    // 라우트 변경 시 기존 ins 교체 → AdSense 재초기화
    ref.current.innerHTML = '';

    const ins = document.createElement('ins');
    ins.className = 'adsbygoogle';
    ins.setAttribute('data-ad-client', payload.adClient);
    ins.setAttribute('data-ad-slot', payload.adSlot);
    ins.setAttribute('data-ad-format', payload.format ?? 'auto');
    ins.setAttribute('data-full-width-responsive', 'true');
    ref.current.appendChild(ins);

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push error', e);
    }
  }, [pathname, payload.adClient, payload.adSlot, payload.format]);

  return <div ref={ref} className="adsense-wrapper my-4" />;
}
