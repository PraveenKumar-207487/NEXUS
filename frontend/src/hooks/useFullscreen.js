import { useCallback, useEffect, useState } from 'react'

export function useFullscreen(ref) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fallbackFullscreen, setFallbackFullscreen] =
    useState(false)

  const fullscreenSupported =
    typeof document !== 'undefined' &&
    !!document.documentElement.requestFullscreen

  const enterFullscreen = useCallback(async () => {
    const element = ref.current

    if (!element) return

    // Native Fullscreen API
    if (fullscreenSupported) {
      try {
        await element.requestFullscreen()
        return
      } catch (error) {
        console.warn(
          'Native fullscreen failed:',
          error
        )
      }
    }

    // Mobile/iOS fallback
    setFallbackFullscreen(true)
    setIsFullscreen(true)
  }, [ref, fullscreenSupported])

  const exitFullscreen = useCallback(async () => {
    // Native fullscreen
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen()
      } catch (error) {
        console.warn(
          'Exit fullscreen failed:',
          error
        )
      }
    }

    // Fallback fullscreen
    setFallbackFullscreen(false)
    setIsFullscreen(false)
  }, [])

  useEffect(() => {
    const handleFullscreenChange = () => {
      const active =
        document.fullscreenElement === ref.current

      setIsFullscreen(active)

      if (!active) {
        setFallbackFullscreen(false)
      }
    }

    document.addEventListener(
      'fullscreenchange',
      handleFullscreenChange
    )

    return () => {
      document.removeEventListener(
        'fullscreenchange',
        handleFullscreenChange
      )
    }
  }, [ref])

  return {
    isFullscreen,
    fallbackFullscreen,
    enterFullscreen,
    exitFullscreen,
  }
}