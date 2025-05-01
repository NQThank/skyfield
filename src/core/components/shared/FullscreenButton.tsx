import React, { PropsWithChildren, useLayoutEffect, useState } from 'react';
import clsx from 'clsx';

import AppButton from '../base/AppButton';

type FullscreenButtonProps = PropsWithChildren & {
  containerId: string;
};
const FullscreenButton: React.FC<FullscreenButtonProps> = ({ containerId, children }) => {
  const [isFullScreen, setIsFullScreen] = useState(false);

  useLayoutEffect(() => {
    const handleFullScreenChange = (event: Event) => {
      if ((event.target as HTMLElement).id === containerId) {
        setIsFullScreen(!!document.fullscreenElement);
      }
    };
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, [containerId]);

  const handleFullScreen = () => {
    const taskContainer = document.getElementById(containerId);
    if (!taskContainer) return;
    if (!document.fullscreenElement) {
      taskContainer.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
  return (
    <AppButton
      icon={
        <i
          className={clsx(
            isFullScreen
              ? 'fa-solid fa-arrow-down-left-and-arrow-up-right-to-center'
              : 'fa-solid fa-arrow-up-right-and-arrow-down-left-from-center'
          )}
        />
      }
      type="text"
      onClick={handleFullScreen}
      title={isFullScreen ? 'Exit fullscreen' : 'View fullscreen'}
    >
      {children}
    </AppButton>
  );
};

export default FullscreenButton;
