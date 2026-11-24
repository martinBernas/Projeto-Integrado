"use client";

import { useEffect } from 'react';
import { bindInfoTips } from '@/lib/info-tips';

export function InfoTipController() {
  useEffect(() => bindInfoTips(document), []);
  return null;
}
