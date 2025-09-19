'use client';

import { ChoiceGroup, type ChoiceConfig } from '@/types';
import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type FC,
  type PropsWithChildren,
  type SetStateAction,
} from 'react';

interface AvatarData {
  filename: string;
  url: string;
}

interface PrimaryFlowContextValue {
  activeGroup: ChoiceGroup | null;
  setActiveGroup: Dispatch<SetStateAction<ChoiceGroup | null>>;
  userChoices: Record<ChoiceGroup, ChoiceConfig | null>;
  setUserChoices: Dispatch<SetStateAction<Record<ChoiceGroup, ChoiceConfig | null>>>;
  showConfirmation: ChoiceGroup | null;
  setShowConfirmation: Dispatch<SetStateAction<ChoiceGroup | null>>;
  avatarData: AvatarData | null;
  setAvatarData: Dispatch<SetStateAction<AvatarData | null>>;
}

export const PrimaryFlowContext = createContext<PrimaryFlowContextValue | undefined>(undefined);

export const PrimaryContextProvider: FC<PropsWithChildren> = ({ children }) => {
  const [activeGroup, setActiveGroup] = useState<ChoiceGroup | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<ChoiceGroup | null>(null);
  const [avatarData, setAvatarData] = useState<AvatarData | null>(null);
  const [userChoices, setUserChoices] = useState<Record<ChoiceGroup, ChoiceConfig | null>>({
    'core-drive': null,
    'legacy-plan': null,
    'origin-story': null,
    'power-play': null,
    'public-mask': null,
  });

  return (
    <PrimaryFlowContext
      value={{
        activeGroup,
        setActiveGroup,
        userChoices,
        setUserChoices,
        showConfirmation,
        setShowConfirmation,
        avatarData,
        setAvatarData,
      }}
    >
      {children}
    </PrimaryFlowContext>
  );
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
