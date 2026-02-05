"use client";

import { useEffect, useState } from "react";
import type { ProvenanceData } from "@/components/ui/explain-overlay";

/**
 * Hook for "Explain This" Mode
 * 
 * Listens for "?" keypress and shows provenance overlay
 * Implements the directive: "Hotkey: ? - Instantly overlays provenance, 
 * last mutation, policy source, and signer for the focused element"
 * 
 * Usage:
 * ```tsx
 * const { isExplainMode, provenanceData, closeExplainMode } = useExplainMode();
 * 
 * <ExplainOverlay data={provenanceData} onClose={closeExplainMode} />
 * ```
 */
export function useExplainMode() {
  const [isExplainMode, setIsExplainMode] = useState(false);
  const [provenanceData, setProvenanceData] = useState<ProvenanceData | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Trigger on "?" key (Shift + /)
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        
        // Get the currently focused element or hovered element
        const focusedElement = document.activeElement;
        const elementName = focusedElement?.getAttribute("data-explain-name") 
          || focusedElement?.getAttribute("aria-label")
          || focusedElement?.tagName
          || "Unknown Element";

        // Mock provenance data - in production, this would fetch from the backend
        const mockData: ProvenanceData = {
          element: elementName,
          provenance: {
            source: "Keon Trust Engine v2.1.0",
            hash: "0x" + Array.from({ length: 32 }, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join(""),
            timestamp: new Date().toISOString(),
          },
          lastMutation: {
            agent: "ClaudeTitan",
            action: "UPDATE_METRIC",
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            receipt: "0x" + Array.from({ length: 16 }, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join(""),
          },
          policySource: {
            pack: "keon-core-policies",
            rule: "trust-threshold-enforcement",
            version: "1.4.2",
          },
          signer: {
            identity: "system@keon.io",
            publicKey: "0x" + Array.from({ length: 32 }, () => 
              Math.floor(Math.random() * 16).toString(16)
            ).join(""),
            verified: true,
          },
        };

        setProvenanceData(mockData);
        setIsExplainMode(true);
      }

      // Close on ESC
      if (e.key === "Escape" && isExplainMode) {
        e.preventDefault();
        setIsExplainMode(false);
        setProvenanceData(null);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isExplainMode]);

  const closeExplainMode = () => {
    setIsExplainMode(false);
    setProvenanceData(null);
  };

  return {
    isExplainMode,
    provenanceData,
    closeExplainMode,
  };
}

