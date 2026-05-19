import { useRef, useCallback } from 'react';

export const useDoublePress = <T extends string>(onReset: (tool: T) => void) => {
  const lastPressRef = useRef<{ [key: string]: number }>({});

  const handlePressWithDouble = useCallback((toolName: T, onSingle: () => void) => {
    const time = new Date().getTime();
    const lastTime = lastPressRef.current[toolName] || 0;
    
    if (time - lastTime < 300) {
      // Double press: reset value
      onReset(toolName);
      lastPressRef.current[toolName] = 0;
    } else {
      // Single press
      onSingle();
      lastPressRef.current[toolName] = time;
    }
  }, [onReset]);

  return { handlePressWithDouble };
};
