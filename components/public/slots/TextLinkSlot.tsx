'use client';

interface Payload {
  items: Array<{ label: string; url: string }>;
}

export function TextLinkSlot({
  payload,
  onClickTrack,
}: {
  payload: Payload;
  onClickTrack: (url: string) => void;
}) {
  return (
    <ul className="space-y-2">
      {payload.items?.map((item, i) => (
        <li key={i}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => onClickTrack(item.url)}
            className="text-blue-600 hover:underline text-sm"
          >
            {item.label} →
          </a>
        </li>
      ))}
    </ul>
  );
}
