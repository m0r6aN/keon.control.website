"use client"

import { useEffect, useCallback, useRef, type RefObject } from "react"

/**
 * Keyboard navigation utilities for Keon Command Center.
 * Provides hooks and constants for implementing keyboard-first interfaces.
 */

/**
 * Keyboard key constants for consistent key handling.
 */
export const KEYS = {
  ESCAPE: "Escape",
  ENTER: "Enter",
  SPACE: " ",
  ARROW_UP: "ArrowUp",
  ARROW_DOWN: "ArrowDown",
  ARROW_LEFT: "ArrowLeft",
  ARROW_RIGHT: "ArrowRight",
  TAB: "Tab",
  J: "j",
  K: "k",
  SLASH: "/",
  QUESTION: "?",
} as const

/**
 * Type for keyboard key values.
 */
export type KeyValue = typeof KEYS[keyof typeof KEYS]

/**
 * Options for useKeyboardNavigation hook.
 */
export interface UseKeyboardNavigationOptions {
  /**
   * Total number of items in the list.
   */
  itemCount: number

  /**
   * Callback when an item is selected (Enter key).
   */
  onSelect?: (index: number) => void

  /**
   * Whether the navigation is currently enabled.
   * @default true
   */
  enabled?: boolean

  /**
   * Whether to loop navigation (wrap around at ends).
   * @default true
   */
  loop?: boolean

  /**
   * Optional ref to the container element for scrolling.
   */
  containerRef?: RefObject<HTMLElement>

  /**
   * Function to get ref for a specific item (for scrolling into view).
   */
  getItemRef?: (index: number) => RefObject<HTMLElement> | null
}

/**
 * Hook for J/K keyboard navigation in lists.
 * Implements vim-style navigation with automatic scrolling.
 *
 * @param options - Navigation configuration options
 * @returns Current selected index and setter function
 *
 * @example
 * const [selectedIndex, setSelectedIndex] = useKeyboardNavigation({
 *   itemCount: items.length,
 *   onSelect: (index) => handleItemClick(items[index]),
 *   enabled: isOpen,
 * })
 */
export function useKeyboardNavigation(
  options: UseKeyboardNavigationOptions
): [number, (index: number) => void] {
  const {
    itemCount,
    onSelect,
    enabled = true,
    loop = true,
    containerRef,
    getItemRef,
  } = options

  const [selectedIndex, setSelectedIndex] = useStateRef(0)

  const handleNavigation = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled || itemCount === 0) return

      const current = selectedIndex.current

      switch (event.key) {
        case KEYS.J:
        case KEYS.ARROW_DOWN:
          event.preventDefault()
          setSelectedIndex((prev) => {
            if (prev < itemCount - 1) {
              return prev + 1
            }
            return loop ? 0 : prev
          })
          break

        case KEYS.K:
        case KEYS.ARROW_UP:
          event.preventDefault()
          setSelectedIndex((prev) => {
            if (prev > 0) {
              return prev - 1
            }
            return loop ? itemCount - 1 : prev
          })
          break

        case KEYS.ENTER:
          event.preventDefault()
          if (onSelect && current >= 0 && current < itemCount) {
            onSelect(current)
          }
          break
      }
    },
    [enabled, itemCount, loop, onSelect, selectedIndex, setSelectedIndex]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener("keydown", handleNavigation)
    return () => window.removeEventListener("keydown", handleNavigation)
  }, [enabled, handleNavigation])

  // Scroll selected item into view
  useEffect(() => {
    const itemRef = getItemRef?.(selectedIndex.current)
    if (itemRef?.current) {
      itemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      })
    }
  }, [selectedIndex.current, getItemRef])

  // Reset selection when item count changes
  useEffect(() => {
    if (selectedIndex.current >= itemCount) {
      setSelectedIndex(Math.max(0, itemCount - 1))
    }
  }, [itemCount, selectedIndex, setSelectedIndex])

  return [selectedIndex.current, setSelectedIndex]
}

/**
 * Options for useCommandPalette hook.
 */
export interface UseCommandPaletteOptions {
  /**
   * Callback when the command palette should open.
   */
  onOpen: () => void

  /**
   * Whether the hook is enabled.
   * @default true
   */
  enabled?: boolean

  /**
   * Custom key combination. Defaults to Cmd+K (Mac) or Ctrl+K (Windows/Linux).
   */
  customKey?: {
    key: string
    ctrlKey?: boolean
    metaKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
  }
}

/**
 * Hook for Cmd+K / Ctrl+K command palette trigger.
 * Handles platform-specific keyboard shortcuts.
 *
 * @param options - Command palette configuration
 *
 * @example
 * useCommandPalette({
 *   onOpen: () => setCommandPaletteOpen(true),
 *   enabled: !commandPaletteOpen,
 * })
 */
export function useCommandPalette(options: UseCommandPaletteOptions): void {
  const { onOpen, enabled = true, customKey } = options

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0

      // Default: Cmd+K on Mac, Ctrl+K on Windows/Linux
      const shouldTrigger = customKey
        ? event.key === customKey.key &&
          event.ctrlKey === Boolean(customKey.ctrlKey) &&
          event.metaKey === Boolean(customKey.metaKey) &&
          event.shiftKey === Boolean(customKey.shiftKey) &&
          event.altKey === Boolean(customKey.altKey)
        : event.key === KEYS.K &&
          ((isMac && event.metaKey && !event.ctrlKey) ||
            (!isMac && event.ctrlKey && !event.metaKey))

      if (shouldTrigger) {
        event.preventDefault()
        onOpen()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [enabled, onOpen, customKey])
}

/**
 * Custom hook that combines useState with a ref for immediate access to current value.
 * Useful for event handlers that need the latest state value.
 */
function useStateRef<T>(
  initialValue: T
): [RefObject<T>, (value: T | ((prev: T) => T)) => void] {
  const ref = useRef<T>(initialValue)

  const setValue = useCallback((value: T | ((prev: T) => T)) => {
    ref.current = typeof value === "function"
      ? (value as (prev: T) => T)(ref.current)
      : value
  }, [])

  return [ref, setValue]
}
