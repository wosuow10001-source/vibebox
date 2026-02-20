// lib/slot-filter.ts
export interface SlotContext {
  device?: "mobile" | "desktop";
  pageType?: string;
  tags?: string[];
}

export function filterSlots(slots: any[], context?: SlotContext) {
  const now = new Date();
  return slots.filter((s) => {
    // 날짜 범위 체크
    if (s.startAt && new Date(s.startAt) > now) return false;
    if (s.endAt && new Date(s.endAt) < now) return false;
    // 기기 타게팅
    if (
      context?.device &&
      s.deviceTarget !== "all" &&
      s.deviceTarget !== context.device
    )
      return false;
    // 페이지 타게팅
    if (
      context?.pageType &&
      s.pageTarget !== "all" &&
      s.pageTarget !== context.pageType
    )
      return false;
    // 태그 타게팅
    if (s.tagTarget && context?.tags && !context.tags.includes(s.tagTarget))
      return false;
    return true;
  });
}
