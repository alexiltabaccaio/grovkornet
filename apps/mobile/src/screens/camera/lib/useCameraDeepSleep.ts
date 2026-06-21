import { useEffect, useState } from 'react';

export const useCameraDeepSleep = (isOpen: boolean) => {
  const [isCameraDeepSleep, setIsCameraDeepSleep] = useState(false);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (!isOpen) {
      setIsCameraDeepSleep(false);
    }
  }

  useEffect(() => {
    if (!isOpen) return;

    // Completely shuts down the sensor (unmounts the Viewfinder) after 60 seconds of inactivity in the gallery to preserve battery
    const timer = setTimeout(() => {
      setIsCameraDeepSleep(true);
    }, 60000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  return { isCameraDeepSleep };
};
