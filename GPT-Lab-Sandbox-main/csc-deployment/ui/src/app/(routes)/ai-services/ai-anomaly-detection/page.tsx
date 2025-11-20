'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AINativeAnomalyDetectionService from '../[serviceId]/components/AINativeAnomalyDetectionService';

export default function AIAnomalyDetectionPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      <AINativeAnomalyDetectionService />
    </div>
  );
}
