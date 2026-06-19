import { createContext, useContext } from 'react';

export interface InteractionContextType {
  isInteractable: boolean;
}

export const InteractionContext = createContext<InteractionContextType>({
  isInteractable: true,
});

export const useInteractionContext = () => {
  return useContext(InteractionContext);
};
