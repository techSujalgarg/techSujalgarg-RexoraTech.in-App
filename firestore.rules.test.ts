import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

interface AuthContext {
  uid: string;
  email: string;
  email_verified: boolean;
}

const REQUEST_TIME = 'SERVER_TIME_SENTINEL';
const ADMIN_EMAIL = 'gargsujal6july@gmail.com';
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

function isValidId(id: unknown): id is string {
  return typeof id === 'string' && id.length >= 1 && id.length <= 128 && ID_REGEX.test(id);
}

function isValidEmail(email: unknown): email is string {
  return typeof email === 'string' && email.length >= 5 && email.length <= 160 && EMAIL_REGEX.test(email);
}

function isBootstrappedAdmin(auth: AuthContext | null): boolean {
  return Boolean(auth && auth.email_verified === true && auth.email === ADMIN_EMAIL);
}

function keysMatchExactly(data: Record<string, unknown>, allowed: string[]): boolean {
  const keys = Object.keys(data);
  return allowed.every((k) => keys.includes(k)) && keys.every((k) => allowed.includes(k));
}

function affectedKeys(
  incoming: Record<string, unknown>,
  existing: Record<string, unknown>
): string[] {
  const all = new Set([...Object.keys(incoming), ...Object.keys(existing)]);
  return [...all].filter((k) => incoming[k] !== existing[k]);
}

function evaluateUserWorkspaceCreate(
  auth: AuthContext | null,
  docId: string,
  data: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified) return 'PERMISSION_DENIED';
  if (!isValidId(docId) || docId !== auth.uid) return 'PERMISSION_DENIED';
  if (!keysMatchExactly(data, ['uid', 'displayName', 'createdAt', 'updatedAt'])) {
    return 'PERMISSION_DENIED';
  }
  if (data.uid !== auth.uid) return 'PERMISSION_DENIED';
  if (typeof data.displayName !== 'string' || data.displayName.length < 1 || data.displayName.length > 120) {
    return 'PERMISSION_DENIED';
  }
  if (data.createdAt !== REQUEST_TIME || data.updatedAt !== REQUEST_TIME) return 'PERMISSION_DENIED';
  return 'ALLOW';
}

function evaluateEnquiryCreate(
  auth: AuthContext | null,
  docId: string,
  data: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified) return 'PERMISSION_DENIED';
  if (!isValidId(docId)) return 'PERMISSION_DENIED';
  const expectedKeys = [
    'referenceId',
    'ownerId',
    'fullName',
    'businessName',
    'email',
    'serviceRequired',
    'projectBudget',
    'projectRequirements',
    'status',
    'createdAt',
    'updatedAt',
  ];
  if (!keysMatchExactly(data, expectedKeys)) return 'PERMISSION_DENIED';
  if (!isValidId(data.referenceId) || data.referenceId.length < 4 || data.referenceId.length > 64) {
    return 'PERMISSION_DENIED';
  }
  if (data.ownerId !== auth.uid) return 'PERMISSION_DENIED';
  if (typeof data.fullName !== 'string' || data.fullName.length < 2 || data.fullName.length > 100) {
    return 'PERMISSION_DENIED';
  }
  if (typeof data.businessName !== 'string' || data.businessName.length < 2 || data.businessName.length > 120) {
    return 'PERMISSION_DENIED';
  }
  if (!isValidEmail(data.email)) return 'PERMISSION_DENIED';
  if (typeof data.serviceRequired !== 'string' || data.serviceRequired.length < 2 || data.serviceRequired.length > 120) {
    return 'PERMISSION_DENIED';
  }
  if (typeof data.projectBudget !== 'string' || data.projectBudget.length > 80) {
    return 'PERMISSION_DENIED';
  }
  if (
    typeof data.projectRequirements !== 'string' ||
    data.projectRequirements.length < 15 ||
    data.projectRequirements.length > 3000
  ) {
    return 'PERMISSION_DENIED';
  }
  if (data.status !== 'New') return 'PERMISSION_DENIED';
  if (data.createdAt !== REQUEST_TIME || data.updatedAt !== REQUEST_TIME) return 'PERMISSION_DENIED';
  return 'ALLOW';
}

function evaluateEnquiryUpdate(
  auth: AuthContext | null,
  docId: string,
  existing: Record<string, unknown>,
  incoming: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified || !isValidId(docId)) return 'PERMISSION_DENIED';
  if (
    incoming.ownerId !== existing.ownerId ||
    incoming.referenceId !== existing.referenceId ||
    incoming.createdAt !== existing.createdAt ||
    incoming.updatedAt !== REQUEST_TIME
  ) {
    return 'PERMISSION_DENIED';
  }
  if (
    !['New', 'In Review', 'Scoped', 'Archived'].includes(String(incoming.status))
  ) {
    return 'PERMISSION_DENIED';
  }
  const changed = affectedKeys(incoming, existing);
  if (existing.status === 'Archived' && !isBootstrappedAdmin(auth)) {
    return 'PERMISSION_DENIED';
  }
  if (isBootstrappedAdmin(auth)) {
    return changed.every((k) => ['status', 'updatedAt'].includes(k))
      ? 'ALLOW'
      : 'PERMISSION_DENIED';
  }
  if (
    existing.ownerId === auth.uid &&
    existing.status === 'New' &&
    incoming.status === 'New' &&
    changed.every((k) => ['projectBudget', 'projectRequirements', 'updatedAt'].includes(k))
  ) {
    return 'ALLOW';
  }
  return 'PERMISSION_DENIED';
}

function evaluateBlueprintCreate(
  auth: AuthContext | null,
  docId: string,
  data: Record<string, unknown>
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified || !isValidId(docId) || docId.length < 4) {
    return 'PERMISSION_DENIED';
  }
  const expectedKeys = [
    'id',
    'ownerId',
    'blueprintTitle',
    'industry',
    'teamSize',
    'executiveSummary',
    'recommendedServices',
    'automationWorkflows',
    'systemModules',
    'implementationPhases',
    'challenge',
    'createdAt',
    'updatedAt',
  ];
  if (!keysMatchExactly(data, expectedKeys)) return 'PERMISSION_DENIED';
  if (data.id !== docId || data.ownerId !== auth.uid) return 'PERMISSION_DENIED';
  for (const listField of [
    'recommendedServices',
    'automationWorkflows',
    'systemModules',
    'implementationPhases',
  ]) {
    const val = data[listField];
    if (!Array.isArray(val) || val.length < 1 || val.length > 10) return 'PERMISSION_DENIED';
  }
  if (typeof (data.recommendedServices as unknown[])[0] !== 'string') return 'PERMISSION_DENIED';
  if (typeof (data.automationWorkflows as unknown[])[0] !== 'string') return 'PERMISSION_DENIED';
  if (data.createdAt !== REQUEST_TIME || data.updatedAt !== REQUEST_TIME) return 'PERMISSION_DENIED';
  return 'ALLOW';
}

function evaluatePrivatePiiGet(
  auth: AuthContext | null,
  targetUserId: string
): 'ALLOW' | 'PERMISSION_DENIED' {
  if (!auth || !auth.email_verified || !isValidId(targetUserId)) return 'PERMISSION_DENIED';
  if (auth.uid === targetUserId || isBootstrappedAdmin(auth)) return 'ALLOW';
  return 'PERMISSION_DENIED';
}

const USER_A: AuthContext = { uid: 'userA', email: 'client@acme.in', email_verified: true };
const USER_B: AuthContext = { uid: 'userB', email: 'other@acme.in', email_verified: true };
const ADMIN_REAL: AuthContext = { uid: 'adminUid', email: ADMIN_EMAIL, email_verified: true };
const ADMIN_UNVERIFIED: AuthContext = { uid: 'spoofUid', email: ADMIN_EMAIL, email_verified: false };

function validEnquiry(ownerId = 'userA'): Record<string, unknown> {
  return {
    referenceId: 'REX-1001',
    ownerId,
    fullName: 'Aarav Mehta',
    businessName: 'Mehta Traders',
    email: 'aarav@mehtatraders.in',
    serviceRequired: 'Business Automation',
    projectBudget: '₹75,000 – ₹2,00,000',
    projectRequirements: 'Need automated purchase and warehouse stock dashboard in Google Sheets.',
    status: 'New',
    createdAt: REQUEST_TIME,
    updatedAt: REQUEST_TIME,
  };
}

test('Dirty Dozen #1: rejects shadow field isAdmin on user workspace creation', () => {
  assert.equal(
    evaluateUserWorkspaceCreate(USER_A, 'userA', {
      uid: 'userA',
      displayName: 'Aarav',
      isAdmin: true,
      createdAt: REQUEST_TIME,
      updatedAt: REQUEST_TIME,
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #2: rejects identity spoofing ownerId on enquiry creation', () => {
  assert.equal(evaluateEnquiryCreate(USER_B, 'REX-1001', validEnquiry('userA')), 'PERMISSION_DENIED');
});

test('Dirty Dozen #3: rejects state shortcutting status="Scoped" on enquiry creation', () => {
  assert.equal(
    evaluateEnquiryCreate(USER_A, 'REX-1001', { ...validEnquiry(), status: 'Scoped' }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #4: rejects client-forged timestamp on enquiry creation', () => {
  assert.equal(
    evaluateEnquiryCreate(USER_A, 'REX-1001', { ...validEnquiry(), createdAt: '2024-01-01T00:00:00Z' }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #5: rejects path variable ID poisoning with invalid characters', () => {
  assert.equal(evaluateEnquiryCreate(USER_A, 'REX$bad/id', validEnquiry()), 'PERMISSION_DENIED');
});

test('Dirty Dozen #6: rejects owner update after enquiry moves to In Review', () => {
  const existing = { ...validEnquiry(), status: 'In Review' };
  const incoming = {
    ...existing,
    projectRequirements: 'Attempted modification after review began by non-admin owner.',
    updatedAt: REQUEST_TIME,
  };
  assert.equal(evaluateEnquiryUpdate(USER_A, 'REX-1001', existing, incoming), 'PERMISSION_DENIED');
});

test('Dirty Dozen #7: rejects terminal state Archived mutation by non-admin', () => {
  const existing = { ...validEnquiry(), status: 'Archived' };
  const incoming = { ...existing, status: 'New', updatedAt: REQUEST_TIME };
  assert.equal(evaluateEnquiryUpdate(USER_A, 'REX-1001', existing, incoming), 'PERMISSION_DENIED');
});

test('Dirty Dozen #8: rejects immutable ownerId/referenceId tampering on update', () => {
  const existing = validEnquiry();
  const incoming = { ...existing, ownerId: 'userB', updatedAt: REQUEST_TIME };
  assert.equal(evaluateEnquiryUpdate(USER_A, 'REX-1001', existing, incoming), 'PERMISSION_DENIED');
});

test('Dirty Dozen #9: rejects unverified admin email spoof during status transition', () => {
  const existing = validEnquiry();
  const incoming = { ...existing, status: 'Scoped', updatedAt: REQUEST_TIME };
  assert.equal(
    evaluateEnquiryUpdate(ADMIN_UNVERIFIED, 'REX-1001', existing, incoming),
    'PERMISSION_DENIED'
  );
  assert.equal(evaluateEnquiryUpdate(ADMIN_REAL, 'REX-1001', existing, incoming), 'ALLOW');
});

test('Dirty Dozen #10: rejects cross-user private PII read', () => {
  assert.equal(evaluatePrivatePiiGet(USER_B, 'userA'), 'PERMISSION_DENIED');
  assert.equal(evaluatePrivatePiiGet(USER_A, 'userA'), 'ALLOW');
});

test('Dirty Dozen #11: rejects blueprint array flooding (>10 items) and wrong element type', () => {
  const baseBlueprint = {
    id: 'bp_1001',
    ownerId: 'userA',
    blueprintTitle: 'Warehouse Ops Hub',
    industry: 'Distributors',
    teamSize: '15–50 employees',
    executiveSummary: 'Centralized stock and billing MIS hub.',
    recommendedServices: new Array(11).fill('Inventory Management Systems'),
    automationWorkflows: ['Auto reorder alert'],
    systemModules: [{ moduleName: 'Stock', purpose: 'Tracking' }],
    implementationPhases: [{ phase: 'Phase 1', focus: 'Data import' }],
    challenge: 'Track stock across two warehouses accurately.',
    createdAt: REQUEST_TIME,
    updatedAt: REQUEST_TIME,
  };
  assert.equal(evaluateBlueprintCreate(USER_A, 'bp_1001', baseBlueprint), 'PERMISSION_DENIED');
  assert.equal(
    evaluateBlueprintCreate(USER_A, 'bp_1001', {
      ...baseBlueprint,
      recommendedServices: [12345],
    }),
    'PERMISSION_DENIED'
  );
});

test('Dirty Dozen #12: verifies rules file enforces default-deny, email_verified, and zero admin client writes', () => {
  const rulesPath = fs.existsSync(path.resolve('firestore.rules'))
    ? path.resolve('firestore.rules')
    : path.resolve('DRAFT_firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf8');
  assert.match(rules, /rules_version = '2';/);
  assert.match(rules, /match \/\{document=\*\*\} \{\s*allow read, write: if false;/);
  assert.match(rules, /request\.auth\.token\.email_verified == true/);
  assert.match(rules, /match \/admins\/\{userId\}[\s\S]*allow list, create, update, delete: if false;/);
  assert.match(rules, /isValidEnquiryRecord\(incoming\(\)\)/);
  assert.match(rules, /isValidBlueprintRecord\(incoming\(\)\)/);
});
