'use client';

interface Payload {
  productName: string;
  price?: string;
  benefit: string;
  imageUrl?: string;
  purchaseUrl: string;
  priority: number;
}

export function AffiliateProductSlot({
  payload,
  onClickTrack,
}: {
  payload: Payload;
  onClickTrack: (url: string) => void;
}) {
  return (
    <div className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
      {payload.imageUrl && (
        <img
          src={payload.imageUrl}
          alt={payload.productName}
          className="w-20 h-20 rounded object-cover"
        />
      )}
      <div className="flex-1">
        <p className="font-semibold text-sm">{payload.productName}</p>
        {payload.price && <p className="text-blue-600 font-bold">{payload.price}</p>}
        <p className="text-xs text-gray-500 mt-1">{payload.benefit}</p>
        <a
          href={payload.purchaseUrl}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={() => onClickTrack(payload.purchaseUrl)}
          className="mt-2 inline-block bg-orange-500 text-white text-xs px-3 py-1 rounded hover:bg-orange-600 transition"
        >
          구매하기 →
        </a>
      </div>
    </div>
  );
}
