import { Manifest } from "./contracts/pt013";
import { mapManifestEntry, UIManifestEntry } from "./mappers";

/**
 * Resolves an RHID against a given manifest.
 * Used for chain-of-custody verification in the UI.
 */
export function resolveRhid(
  rhid: string,
  manifest: Manifest | null
): UIManifestEntry | null {
  if (!manifest || !manifest.entries) return null;
  
  const entry = manifest.entries.find((e) => e.rhid === rhid);
  if (!entry) return null;

  return mapManifestEntry(entry);
}

/**
 * Checks if an RHID is resolvable.
 * If false, UI should show the BLOCKED / INVALID PACK banner.
 */
export function isRhidValid(rhid: string, manifest: Manifest | null): boolean {
  if (!rhid) return true; // Empty RHID is technically not invalid, just not provided
  return !!resolveRhid(rhid, manifest);
}
