'use client';

interface Payload {
  title: string;
  description: string;
  badgeLabel?: string;
  imageUrl?: string;
  linkUrl: string;
  linkLabel: string;
}

export function NativeCardSlot({
  payload,
  onClickTrack,
}: {
  payload: Payload;
  onClickTrack: (url: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      {payload.imageUrl && (
        <img
          src={payload.imageUrl}
          alt={payload.title}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        {payload.badgeLabel && (
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full mb-2 inline-block">
            {payload.badgeLabel}
          </span>
        )}
        <h3 className="font-semibold text-sm mb-2">{payload.title}</h3>
        <p className="text-gray-600 text-xs mb-3">{payload.description}</p>
        <a
          href={payload.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onClickTrack(payload.linkUrl)}
          className="font-medium text-blue-600 hover:underline text-xs"
        >
          {payload.linkLabel} →
        </a>
      </div>
    </div>
  );
}
