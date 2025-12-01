/**
 * UI Actions Functions
 * Handles UI state management including billionaire/background selection,
 * pause/menu toggles, hand viewer, audio settings, and tooltips
 */

import { getRandomBillionaire, type BillionaireId } from '@/config/billionaires';
import type { PlayerType, SetState, GetState } from '@/types';
import { TRACKS } from '@/config/audio-config';

export function createUIActions(set: SetState, get: GetState) {
  return {
    /**
     * Sets the selected billionaire for the player and randomly selects one for CPU
     */
    selectBillionaire: (billionaire: BillionaireId) => {
      const cpuBillionaire = getRandomBillionaire(billionaire as BillionaireId);
      set({
        selectedBillionaire: billionaire,
        cpuBillionaire,
        player: {
          ...get().player,
          billionaireCharacter: billionaire,
        },
      });
    },

    /**
     * Sets the selected background
     */
    selectBackground: (background: string) => {
      set({ selectedBackground: background });
    },

    /**
     * Toggles game pause state
     */
    togglePause: () => {
      set({ isPaused: !get().isPaused });
    },

    /**
     * Toggles menu visibility and pauses game when opening
     */
    toggleMenu: () => {
      get().playAudio(TRACKS.WHOOSH);
      const currentShowMenu = get().showMenu;
      set({
        showMenu: !currentShowMenu,
        isPaused: !currentShowMenu, // Pause when opening menu
      });
    },

    /**
     * Toggles hand viewer visibility
     */
    toggleHandViewer: (player?: PlayerType) => {
      set({
        showHandViewer: !get().showHandViewer,
        handViewerPlayer: player || get().handViewerPlayer,
      });
    },

    /**
     * Toggles music on/off and persists to localStorage
     */
    toggleMusic: () => {
      const newValue = !get().musicEnabled;
      set({ musicEnabled: newValue });
      localStorage.setItem('musicEnabled', String(newValue));
    },

    /**
     * Toggles sound effects on/off and persists to localStorage
     */
    toggleSoundEffects: () => {
      const newValue = !get().soundEffectsEnabled;
      set({ soundEffectsEnabled: newValue });
      localStorage.setItem('soundEffectsEnabled', String(newValue));
    },

    /**
     * Toggles all sound (music and SFX) on/off
     * If both are OFF → Turn both ON
     * If either or both are ON → Turn both OFF
     */
    toggleAllSound: () => {
      const state = get();
      const bothOff = !state.musicEnabled && !state.soundEffectsEnabled;

      if (bothOff) {
        // Both are OFF → Turn both ON
        set({
          musicEnabled: true,
          soundEffectsEnabled: true,
        });
        localStorage.setItem('musicEnabled', 'true');
        localStorage.setItem('soundEffectsEnabled', 'true');
      } else {
        // Either or both are ON → Turn both OFF
        set({
          musicEnabled: false,
          soundEffectsEnabled: false,
        });
        localStorage.setItem('musicEnabled', 'false');
        localStorage.setItem('soundEffectsEnabled', 'false');
      }
    },

    /**
     * Toggles instructions visibility
     */
    toggleInstructions: () => {
      set({ showInstructions: !get().showInstructions });
    },

    /**
     * Sets tooltip visibility
     */
    setShowTooltip: (show: boolean) => {
      set({ showTooltip: show });
    },
  };
}
