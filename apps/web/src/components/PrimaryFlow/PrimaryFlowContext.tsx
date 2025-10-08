'use client';

import {
  ChoiceGroup,
  type AvatarData,
  type ChoiceConfig,
  type SelfieAvailabilityState,
} from '@/types';
import { SELFIES_LIMIT } from '@/utils/constants';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

const initialChoices = {
  'core-drive': null,
  'legacy-plan': null,
  'origin-story': null,
  'power-play': null,
  'public-mask': null,
};

interface PrimaryFlowContextValue {
  activeGroup: ChoiceGroup | null;
  setActiveGroup: Dispatch<SetStateAction<ChoiceGroup | null>>;
  userChoices: Record<ChoiceGroup, ChoiceConfig | null>;
  setUserChoices: Dispatch<SetStateAction<Record<ChoiceGroup, ChoiceConfig | null>>>;
  showConfirmation: ChoiceGroup | null;
  setShowConfirmation: Dispatch<SetStateAction<ChoiceGroup | null>>;
  avatarData: AvatarData | null;
  setAvatarData: Dispatch<SetStateAction<AvatarData | null>>;
  showVault: boolean;
  setShowVault: Dispatch<SetStateAction<boolean>>;
  reset: () => void;
  selfieAvailabilityState: SelfieAvailabilityState;
  setSelfieAvailabilityState: Dispatch<SetStateAction<SelfieAvailabilityState>>;
}

export const PrimaryFlowContext = createContext<PrimaryFlowContextValue | undefined>(undefined);

export const PrimaryContextProvider: FC<PropsWithChildren<{ initialData: AvatarData | null }>> = ({
  children,
  initialData,
}) => {
  const [activeGroup, setActiveGroup] = useState<ChoiceGroup | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<ChoiceGroup | null>(null);
  const [showVault, setShowVault] = useState(false);
  const [avatarData, setAvatarData] = useState<AvatarData | null>(initialData);
  const [selfieAvailabilityState, setSelfieAvailabilityState] =
    useState<SelfieAvailabilityState>('AVAILABLE');
  const [userChoices, setUserChoices] =
    useState<Record<ChoiceGroup, ChoiceConfig | null>>(initialChoices);

  useEffect(() => {
    const now = Date.now();

    if (!avatarData) {
      setSelfieAvailabilityState('AVAILABLE');
      return;
    }

    const { next_n, next_at } = avatarData.selfieAvailability;

    if (next_n + 1 >= SELFIES_LIMIT) {
      setSelfieAvailabilityState('REACHED_MAX_LIMIT');
      return;
    }

    if (!next_at) {
      setSelfieAvailabilityState('AVAILABLE');
      return;
    }

    if (next_at.getTime() >= now) {
      setSelfieAvailabilityState('COOL_DOWN_PERIOD');
      return;
    }

    setSelfieAvailabilityState('AVAILABLE');
  }, [avatarData]);

  const reset = useCallback(() => {
    setUserChoices(initialChoices);
    setShowConfirmation(null);
    setActiveGroup(null);
    setAvatarData(null);
  }, [setUserChoices, setShowConfirmation, setActiveGroup, setAvatarData]);

  const value = useMemo(
    () => ({
      activeGroup,
      setActiveGroup,
      userChoices,
      setUserChoices,
      showConfirmation,
      setShowConfirmation,
      avatarData,
      setAvatarData,
      showVault,
      setShowVault,
      reset,
      selfieAvailabilityState,
      setSelfieAvailabilityState,
    }),
    [
      activeGroup,
      setActiveGroup,
      userChoices,
      setUserChoices,
      showConfirmation,
      setShowConfirmation,
      avatarData,
      setAvatarData,
      showVault,
      setShowVault,
      reset,
      selfieAvailabilityState,
      setSelfieAvailabilityState,
    ],
  );

  return <PrimaryFlowContext value={value}>{children}</PrimaryFlowContext>;
};

export const usePrimaryFlowContext = () => {
  const context = useContext(PrimaryFlowContext);
  if (!context) {
    throw new Error(
      'You must use the PrimaryFlowContext Provider in order to consume this context.',
    );
  }
  return context;
};
