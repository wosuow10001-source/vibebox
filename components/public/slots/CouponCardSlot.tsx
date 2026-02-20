'use client';

import { useState } from 'react';

interface Payload {
  title: string;
  description: string;
  code: string;
  expiresAt?: string;
  ctaLabel: string;
  ctaUrl: string;
  category?: string;
}

export function CouponCardSlot({
  payload,
  onClickTrack,
}: {
  payload: Payload;
  onClickTrack: (url: string) => void;
}) {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(payload.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isExpired = payload.expiresAt && new Date(payload.expiresAt) < new Date();

  return (
    <div
      className={`border-2 border-dashed rounded-xl p-4 ${
        isExpired ? 'opacity-50' : 'border-yellow-400'
      }`}
    >
      {payload.category && (
        <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full mb-2 inline-block">
          {payload.category}
        </span>
      )}
      <h3 className="font-bold text-lg">{payload.title}</h3>
      <p className="text-gray-600 text-sm mb-3">{payload.description}</p>
      <div className="flex gap-2 items-center mb-3">
        <code className="bg-gray-100 px-3 py-1 rounded font-mono text-sm flex-1 text-center">
          {payload.code}
        </code>
        <button
          onClick={copyCode}
          className="bg-yellow-400 text-black px-3 py-1 rounded text-sm font-medium hover:bg-yellow-500 transition"
        >
          {copied ? '✓ 복사됨' : '복사'}
        </button>
      </div>
      {payload.expiresAt && (
        <p className="text-xs text-gray-400 mb-2">
          만료: {new Date(payload.expiresAt).toLocaleDateString('ko-KR')}
          {isExpired && ' (만료됨)'}
        </p>
      )}
      <a
        href={payload.ctaUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => onClickTrack(payload.ctaUrl)}
        className="block w-full bg-black text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
      >
        {payload.ctaLabel}
      </a>
    </div>
  );
}
