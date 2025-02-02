"use client";

import { useEffect } from 'react';

type AdSenseItem = {
  [key: string]: unknown;
};

declare global {
  interface Window {
    adsbygoogle: Array<AdSenseItem>;
  }
}

export default function AdBottom() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (error) {
      console.error('Error loading bottom ad:', error);
    }
  }, []);

  return (
    <div className="w-full my-4">
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-6423546523017297"
        data-ad-slot="7614190772"
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}