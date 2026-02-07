import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

/**
 * PT-013 Mock Bundle Generator
 * Generates deterministic mock bundles for UI development.
 */

interface Actor {
  id: string;
  type: string;
  name: string;
}

interface ManifestEntry {
  rhid: string;
  sha256: string;
  content_type: string;
  size_bytes: number;
  storage_uri: string;
  created_by_actor_id: string;
  created_at: string;
}

interface LedgerEntry {
  seq: number;
  step_id: string;
  actor_id: string;
  actor_type: string;
  action_type: string;
  policy_decision?: 'allow' | 'flag' | 'deny';
  timestamp: string;
  duration_ms: number;
  status: string;
  inputs: string[];
  outputs: string[];
  receipt_rhid?: string;
  prev_action_hash?: string;
}

interface Receipt {
  receipt_id: string;
  run_id: string;
  action_type: string;
  timestamp: string;
  policy_rhid?: string;
  evidence_rhids: string[];
  prev_receipt_hash?: string;
  hash: string;
  signature?: string;
}

const ACTORS = {
  TITAN_1: { id: 'titan:t1', type: 'Titan', name: 'Titan-Alpha' },
  TITAN_2: { id: 'titan:t2', type: 'Titan', name: 'Titan-Beta' },
  TITAN_3: { id: 'titan:t3', type: 'Titan', name: 'Titan-Gamma' },
  TITAN_4: { id: 'titan:t4', type: 'Titan', name: 'Titan-Delta' },
  TOOL_1: { id: 'tool:executor', type: 'tool', name: 'CodeExecutor' },
  HUMAN_1: { id: 'user:clint', type: 'human', name: 'Clint' },
  FC: { id: 'service:fc', type: 'fc', name: 'Federation Core' },
};

function sha256(content: string): string {
  return `sha256:${crypto.createHash('sha256').update(content).digest('hex')}`;
}

function generateRhid(kind: string, seed: string): string {
  const hash = crypto.createHash('sha256').update(seed).digest('hex').substring(0, 12);
  return `rhid:${kind}:${hash}`;
}

class BundleGenerator {
  private baseDir: string;
  private manifest: ManifestEntry[] = [];
  private ledger: LedgerEntry[] = [];
  private receipts: Record<string, Receipt> = {};
  private runId: string;
  private timestamp: Date;
  private prevActionHash: string | undefined;
  private prevReceiptHash: string | undefined;

  constructor(baseDir: string, scenario: string, seed: string) {
    this.baseDir = path.join(baseDir, scenario);
    this.runId = `run-${seed}`;
    this.timestamp = new Date('2026-02-07T08:00:00Z');
    
    if (fs.existsSync(this.baseDir)) {
      fs.rmSync(this.baseDir, { recursive: true, force: true });
    }
    fs.mkdirSync(path.join(this.baseDir, 'evidence/receipts'), { recursive: true });
    fs.mkdirSync(path.join(this.baseDir, 'evidence/objects'), { recursive: true });
    fs.mkdirSync(path.join(this.baseDir, 'artifacts'), { recursive: true });
  }

  private addTimestamp(ms: number) {
    this.timestamp = new Date(this.timestamp.getTime() + ms);
  }

  addObject(kind: string, name: string, content: string, actorId: string): string {
    const rhid = generateRhid(kind, `${name}-${this.timestamp.toISOString()}`);
    const hash = sha256(content);
    const size = Buffer.byteLength(content);
    const contentType = name.endsWith('.md') ? 'text/markdown' : (name.endsWith('.json') ? 'application/json' : 'text/plain');
    
    const filePath = path.join(this.baseDir, 'evidence/objects', `${rhid.replace(/:/g, '_')}.dat`);
    fs.writeFileSync(filePath, content);

    this.manifest.push({
      rhid,
      sha256: hash,
      content_type: contentType,
      size_bytes: size,
      storage_uri: `file://${filePath}`,
      created_by_actor_id: actorId,
      created_at: this.timestamp.toISOString(),
    });

    return rhid;
  }

  private addReceipt(actionType: string, policyRhid: string | undefined, evidenceRhids: string[]): string {
    const receiptId = `rcpt_${crypto.randomBytes(8).toString('hex')}`;
    const rhid = generateRhid('receipt', receiptId);
    
    const receipt: Receipt = {
      receipt_id: receiptId,
      run_id: this.runId,
      action_type: actionType,
      timestamp: this.timestamp.toISOString(),
      policy_rhid: policyRhid,
      evidence_rhids: evidenceRhids,
      prev_receipt_hash: this.prevReceiptHash,
      hash: '', // placeholder
      signature: `sig_${crypto.randomBytes(16).toString('hex')}`,
    };

    receipt.hash = sha256(JSON.stringify(receipt));
    this.receipts[rhid] = receipt;
    this.prevReceiptHash = receipt.hash;

    const filePath = path.join(this.baseDir, 'evidence/receipts', `${rhid.replace(/:/g, '_')}.json`);
    fs.writeFileSync(filePath, JSON.stringify(receipt, null, 2));

    this.manifest.push({
      rhid,
      sha256: receipt.hash,
      content_type: 'application/json',
      size_bytes: JSON.stringify(receipt).length,
      storage_uri: `file://${filePath}`,
      created_by_actor_id: ACTORS.FC.id,
      created_at: this.timestamp.toISOString(),
    });

    return rhid;
  }

  addAction(stepId: string, actor: Actor, actionType: string, inputs: string[], outputs: string[], props: Partial<LedgerEntry> = {}): string {
    const policyRhid = props.policy_decision ? generateRhid('policy', `policy-${actionType}`) : undefined;
    const receiptRhid = this.addReceipt(actionType, policyRhid, [...inputs, ...outputs]);

    const entry: LedgerEntry = {
      seq: this.ledger.length,
      step_id: stepId,
      actor_id: actor.id,
      actor_type: actor.type,
      action_type: actionType,
      policy_decision: props.policy_decision,
      timestamp: this.timestamp.toISOString(),
      duration_ms: Math.floor(Math.random() * 2000) + 100,
      status: props.status || 'success',
      inputs,
      outputs,
      receipt_rhid: receiptRhid,
      prev_action_hash: this.prevActionHash,
    };

    const entryString = JSON.stringify(entry);
    this.ledger.push(entry);
    this.prevActionHash = sha256(entryString);
    this.addTimestamp(entry.duration_ms + 50);
    
    return this.prevActionHash;
  }

  save() {
    fs.writeFileSync(path.join(this.baseDir, 'collaboration_ledger.jsonl'), this.ledger.map(e => JSON.stringify(e)).join('\n'));
    fs.writeFileSync(path.join(this.baseDir, 'evidence/manifest.json'), JSON.stringify({ entries: this.manifest }, null, 2));
    
    // Minimal artifacts
    fs.writeFileSync(path.join(this.baseDir, 'artifacts/work_order.json'), JSON.stringify({ run_id: this.runId, objective: 'PT-013 Test' }));
  }

  addExternalRhidToManifest(rhid: string) {
      // Used for missing_manifest scenario - just don't add it
  }
}

const MOCK_DIR = path.resolve('public/mock/pt013');

// Scenario: Happy Path
{
  const gen = new BundleGenerator(MOCK_DIR, 'happy', 'seed-1');
  const policyContent = `
# Budget Approval Policy (v1.2.0)
Decisions regarding budget allocation MUST:
1. Be signed by a Level-2 or higher authority.
2. Not exceed the quarterly variance limit of 5%.
3. Include explicit rationale for audit trails.
  `;
  const pol = gen.addObject('policy', 'budget-v1.2.0.md', policyContent, ACTORS.FC.id);
  const wo = gen.addAction('start', ACTORS.HUMAN_1, 'workflow.start', [], [gen.addObject('artifact', 'work_order.json', '{"task":"test"}', ACTORS.HUMAN_1.id)]);
  const plan = gen.addAction('plan', ACTORS.TITAN_1, 'task.plan', [wo], [gen.addObject('artifact', 'plan.md', '# Plan\nStep 1', ACTORS.TITAN_1.id)]);
  gen.addAction('execute', ACTORS.TOOL_1, 'tool.run', [plan], [gen.addObject('artifact', 'output.txt', 'Done', ACTORS.TOOL_1.id)]);
  gen.addAction('gate', ACTORS.FC, 'gate.resolve', [], [], { policy_decision: 'allow' });
  gen.addAction('seal', ACTORS.FC, 'pack.seal', [], []);
  gen.save();
}

// Scenario: Gate Deny
{
  const gen = new BundleGenerator(MOCK_DIR, 'gate_deny', 'seed-2');
  gen.addAction('start', ACTORS.HUMAN_1, 'workflow.start', [], []);
  gen.addAction('gate', ACTORS.FC, 'gate.resolve', [], [], { policy_decision: 'deny', status: 'fail-closed' });
  gen.save();
}

// Scenario: Missing Manifest Entry
{
  const gen = new BundleGenerator(MOCK_DIR, 'missing_manifest', 'seed-3');
  const phantomRhid = 'rhid:artifact:phantom-123';
  gen.addAction('corrupt_step', ACTORS.TITAN_3, 'data.leak', [], [phantomRhid]);
  gen.save();
}

console.log('Mock bundles generated at:', MOCK_DIR);
