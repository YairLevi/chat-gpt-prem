import { useEffect } from "react";

export const Keys = {
  delete: 'Delete',
  backspace: 'Backspace',
  control: 'control'
}

function keyDown(k: string, e: KeyboardEvent) {
  const d: {[key: string]: boolean} = {
    'control': e.ctrlKey,
    'alt': e.altKey,
    'shift': e.shiftKey,
  }
  return d[k] ?? e.code === k
}

export function useKeybind(handler: (e?: KeyboardEvent) => void, deps: any[], ...keySets: string[][]) {
  useEffect(() => {
    const applyIfPressed = (e: KeyboardEvent) => {
      for (const keys of keySets) {
        if (keys.every(key => keyDown(key, e))) {
          handler(e)
          break
        }
      }
    }

    window.addEventListener('keydown', applyIfPressed)
    return () => window.removeEventListener('keydown', applyIfPressed)
  }, deps)
}