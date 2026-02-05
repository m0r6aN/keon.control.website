/**
 * Keon Command Center UI Components
 * Barrel export for all cockpit-style components
 *
 * Design Philosophy: SpaceX Mission Control meets Bloomberg Terminal
 * - No drop shadows, 1px borders only
 * - Minimal rounded corners (2-4px max)
 * - Mechanical, instant feedback
 * - Glow effects for active states
 */

export { Badge, badgeVariants, type BadgeProps } from "./badge";
export { Button, buttonVariants, type ButtonProps } from "./button";
export {
    DataValue,
    dataValueVariants,
    type DataValueProps
} from "./data-value";
export {
    ExplainOverlay,
    type ProvenanceData
} from "./explain-overlay";
export { Input, inputVariants, type InputProps } from "./input";
export {
    Panel, PanelContent, PanelDescription, PanelFooter, PanelHeader, PanelTitle, type PanelProps
} from "./panel";
export { Separator } from "./separator";
export {
    StatusIndicator,
    statusIndicatorVariants,
    type StatusIndicatorProps
} from "./status-indicator";
export { TrustScore } from "./trust-score";

