import { useCallback, useEffect, useRef, useState } from 'react'

export function useIdleControls(
  enabled,
  timeout = 2500
) {
  const [controlsVisible, setControlsVisible] =
    useState(true)

  const timerRef = useRef(null)

  const resetTimer = useCallback(() => {
    setControlsVisible(true)

    if (timerRef.current) {
      window.clearTimeout(timerRef.current)
    }

    timerRef.current = window.setTimeout(() => {
      setControlsVisible(false)
    }, timeout)
  }, [timeout])

  useEffect(() => {
    if (!enabled) {
      setControlsVisible(false)

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }

      return
    }

    const handleMouseMove = (event) => {
      // Only reveal controls when mouse is near top
      if (event.clientY <= 100) {
        resetTimer()
      }
    }

    const handleTouch = () => {
      resetTimer()
    }

    window.addEventListener(
      'mousemove',
      handleMouseMove
    )

    window.addEventListener(
      'touchstart',
      handleTouch,
      { passive: true }
    )

    // Initially show controls
    resetTimer()

    return () => {
      window.removeEventListener(
        'mousemove',
        handleMouseMove
      )

      window.removeEventListener(
        'touchstart',
        handleTouch
      )

      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [enabled, resetTimer])

  return {
    controlsVisible,
  }
}