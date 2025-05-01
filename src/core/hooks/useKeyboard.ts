import { useEffect } from 'react';

interface UseKeyboardProps {
  key: string;
  onKeyPressed: () => void;
}

export default function useKeyboard({ key, onKeyPressed }: UseKeyboardProps) {
  useEffect(() => {
    function keyDownHandler(e: globalThis.KeyboardEvent) {
      if (e.key === key) {
        e.preventDefault();
        onKeyPressed();
      }
    }

    document.addEventListener('keydown', keyDownHandler);

    return () => {
      document.removeEventListener('keydown', keyDownHandler);
    };
  }, [key, onKeyPressed]);
}
