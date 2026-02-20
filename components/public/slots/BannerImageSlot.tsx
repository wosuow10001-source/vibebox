'use client';

interface Payload {
  imageUrl: string;
  clickUrl: string;
  altText?: string;
  openNewTab?: boolean;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

function buildUrl(payload: Payload) {
  let url = payload.clickUrl;
  const params = new URLSearchParams({
    utm_source: payload.utmSource ?? 'platform',
    utm_medium: payload.utmMedium ?? 'banner',
    utm_campaign: payload.utmCampaign ?? 'slot',
  });
  url += (url.includes('?') ? '&' : '?') + params.toString();
  return url;
}

export function BannerImageSlot({
  payload,
  onClickTrack,
}: {
  payload: Payload;
  onClickTrack: (url: string) => void;
}) {
  const finalUrl = buildUrl(payload);

  return (
    <a
      href={finalUrl}
      target={payload.openNewTab ? '_blank' : '_self'}
      rel="noopener noreferrer"
      onClick={() => onClickTrack(finalUrl)}
      className="block"
    >
      <img
        src={payload.imageUrl}
        alt={payload.altText ?? '광고 배너'}
        className="w-full h-auto rounded"
      />
    </a>
  );
}
