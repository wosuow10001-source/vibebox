'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { AdSenseSlot } from './slots/AdSenseSlot';
import { BannerImageSlot } from './slots/BannerImageSlot';
import { CouponCardSlot } from './slots/CouponCardSlot';
import { AffiliateProductSlot } from './slots/AffiliateProductSlot';
import { TextLinkSlot } from './slots/TextLinkSlot';
import { NativeCardSlot } from './slots/NativeCardSlot';
import { filterSlots, type SlotContext } from '@/lib/slot-filter';

interface Props {
  placement: string;
  context?: SlotContext;
}

export function SlotRenderer({ placement, context }: Props) {
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // loadSlots is executed inside the effect so it can capture the
  // current `context` value each time without relying on unstable
  // function identity.

  // Create a stable string key for context so we only reload when its
  // actual content changes (not when a new object reference is passed).
  const contextKey = useMemo(() => JSON.stringify(context || {}), [context]);

  // 라우트 또는 로드 함수 변경 시 슬롯 재로드
  useEffect(() => {
    let mounted = true;

    const doLoad = async () => {
      try {
        setLoading(true);
        const device = typeof window !== 'undefined' && window.innerWidth < 768 ? 'mobile' : 'desktop';
        const params = new URLSearchParams({
          placement,
          device,
          ...(context?.pageType && { pageType: context.pageType }),
        });

        const res = await fetch(`/api/public/slots?${params}`, { cache: 'no-store' });
        const data = await res.json();
        if (!mounted) return;
        setSlots(filterSlots(data, { device, ...context }));
      } catch (error) {
        console.error('Failed to load slots:', error);
        if (!mounted) return;
        setSlots([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    doLoad();

    return () => {
      mounted = false;
    };
  }, [pathname, placement, contextKey]);

  if (loading || !slots.length) return null;

  return (
    <div className="slot-container" data-placement={placement}>
      {slots.map((slot) => (
        <SlotItem key={slot.id} slot={slot} />
      ))}
    </div>
  );
}

function SlotItem({ slot }: { slot: any }) {
  const trackClick = useCallback(async (url: string) => {
    try {
      await fetch('/api/track/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: slot.id,
          url,
          pagePath: typeof window !== 'undefined' ? window.location.pathname : '/',
        }),
      });
    } catch (error) {
      console.error('Click tracking failed:', error);
    }
  }, [slot.id]);

  const disclosure = slot.showDisclosure && slot.disclosureText && (
    <p className="text-xs text-gray-400 mb-1">※ {slot.disclosureText}</p>
  );

  return (
    <div className="slot-item">
      {disclosure}
      {slot.type === 'ADSENSE' && <AdSenseSlot payload={slot.payloadJson} />}
      {slot.type === 'BANNER_IMAGE' && (
        <BannerImageSlot payload={slot.payloadJson} onClickTrack={trackClick} />
      )}
      {slot.type === 'COUPON_CARD' && (
        <CouponCardSlot payload={slot.payloadJson} onClickTrack={trackClick} />
      )}
      {slot.type === 'AFFILIATE_PRODUCT' && (
        <AffiliateProductSlot payload={slot.payloadJson} onClickTrack={trackClick} />
      )}
      {slot.type === 'TEXT_LINK' && (
        <TextLinkSlot payload={slot.payloadJson} onClickTrack={trackClick} />
      )}
      {slot.type === 'NATIVE_CARD' && (
        <NativeCardSlot payload={slot.payloadJson} onClickTrack={trackClick} />
      )}
    </div>
  );
}
