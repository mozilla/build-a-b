import type { Selfie } from '@/types';

export const sortSelfies = (order: 'asc' | 'desc' = 'desc') => {
  return (a: Selfie, b: Selfie) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : new Date().getTime();
    const timeB = b.created_at ? new Date(b.created_at).getTime() : new Date().getTime();
    return order === 'desc' ? timeB - timeA : timeA - timeB;
  };
};
