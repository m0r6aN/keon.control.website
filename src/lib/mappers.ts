import { CollaborationLedgerEntry, ManifestEntry, ThinReceipt } from "./contracts/pt013";

/**
 * Maps snake_case PT-013 contracts to camelCase for UI consumption.
 */

export interface UIManifestEntry {
  rhid: string;
  sha256: string;
  contentType: string;
  sizeBytes: number;
  storageUri: string;
  createdByActorId: string;
  createdAt: string;
}

export interface UICollaborationLedgerEntry {
  seq: number;
  stepId: string;
  actorId: string;
  actorType: string;
  actionType: string;
  policyDecision?: "allow" | "flag" | "deny";
  timestamp: string;
  durationMs: number;
  status: string;
  inputs: string[];
  outputs: string[];
  receiptRhid?: string;
  prevActionHash?: string;
}

export interface UIThinReceipt {
  receiptId: string;
  runId: string;
  actionType: string;
  timestamp: string;
  policyRhid?: string;
  evidenceRhids: string[];
  prevReceiptHash?: string;
  hash: string;
  signature?: string;
}

export const mapManifestEntry = (entry: ManifestEntry): UIManifestEntry => ({
  rhid: entry.rhid,
  sha256: entry.sha256,
  contentType: entry.content_type,
  sizeBytes: entry.size_bytes,
  storageUri: entry.storage_uri,
  createdByActorId: entry.created_by_actor_id,
  createdAt: entry.created_at,
});

export const mapCollaborationLedgerEntry = (entry: CollaborationLedgerEntry): UICollaborationLedgerEntry => ({
  seq: entry.seq,
  stepId: entry.step_id,
  actorId: entry.actor_id,
  actorType: entry.actor_type,
  actionType: entry.action_type,
  policyDecision: entry.policy_decision,
  timestamp: entry.timestamp,
  durationMs: entry.duration_ms,
  status: entry.status,
  inputs: entry.inputs,
  outputs: entry.outputs,
  receiptRhid: entry.receipt_rhid,
  prevActionHash: entry.prev_action_hash,
});

export const mapThinReceipt = (receipt: ThinReceipt): UIThinReceipt => ({
  receiptId: receipt.receipt_id,
  runId: receipt.run_id,
  actionType: receipt.action_type,
  timestamp: receipt.timestamp,
  policyRhid: receipt.policy_rhid,
  evidenceRhids: receipt.evidence_rhids,
  prevReceiptHash: receipt.prev_receipt_hash,
  hash: receipt.hash,
  signature: receipt.signature,
});
