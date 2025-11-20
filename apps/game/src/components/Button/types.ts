import type { ButtonProps as HeroUIButtonProps } from '@heroui/react';

export interface ButtonProps extends Omit<HeroUIButtonProps, 'variant' | 'isDisabled'> {
  variant?: 'primary' | 'secondary';
  /**
   * Determines whether or not the Button will playAudio(TRACKS.BUTTON_PRESS) on press
   */
  muted?: boolean;
  /**
   * The volume at which to play the button press sound effect (0.0 to 1.0)
   */
  volume?: number;
}
