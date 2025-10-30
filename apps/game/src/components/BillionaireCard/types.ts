import type { ButtonProps } from '@heroui/react';

export interface BillionaireCardProps extends ButtonProps {
  name: string;
  imageSrc: string;
  isSelected?: boolean;
}
