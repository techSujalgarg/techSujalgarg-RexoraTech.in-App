# RexoraTech Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants

1. **Identity Ownership Invariant**: Every `/users/{userId}` document must have `userId == request.auth.uid` and `data.uid == request.auth.uid`. Every `/enquiries/{enquiryId}` and `/blueprints/{blueprintId}` must have `data.ownerId == request.auth.uid` on creation, and `ownerId` is immutable thereafter.
2. **Verified Account Gate**: All user-owned reads and writes require `request.auth != null && request.auth.token.email_verified == true`.
3. **PII Isolation (Split Collection + Master Gate)**: Contact email PII lives in `/users/{userId}/private/info` and requires the parent `/users/{userId}` document to exist with `uid == request.auth.uid`. Blanket `list` on `/users` or `/users/{userId}/private` is forbidden (`false`).
4. **No Self-Assigned Privileges**: Users cannot inject `role`, `isAdmin`, or any ghost fields into `/users/{userId}`, `/enquiries/{enquiryId}`, or `/blueprints/{blueprintId}`. `/admins/{userId}` forbids all client writes.
5. **Email Spoofing Guard**: Bootstrapped admin check for `gargsujal6july@gmail.com` requires `request.auth.token.email_verified == true`.
6. **Workflow & Terminal State Integrity**: Enquiries are always created with `status == 'New'`. Non-admin owners can only edit `projectBudget` and `projectRequirements` while `existing().status == 'New'`. Once an enquiry reaches terminal `'Archived'` (or any non-`'New'` state), non-admin updates are denied.
7. **Temporal & Volumetric Integrity**: All `createdAt` (on create) and `updatedAt` (on create/update) fields must equal `request.time`. All document IDs match `^[a-zA-Z0-9_\\-]+$` (`<= 128` chars), all strings enforce strict min/max lengths, and all arrays are bounded `<= 10` elements with type guards.
8. **Zero Client Query Trust / Zero List Cost Explosion**: `allow list` on `/enquiries` and `/blueprints` explicitly validates `resource.data.ownerId == request.auth.uid || isBootstrappedAdmin()` without `get()` or `exists()` lookups.

## 2. The "Dirty Dozen" Adversarial Payloads

| # | Target Path | Operation | Adversarial Payload / Condition | Expected Result |
|---|-------------|-----------|---------------------------------|-----------------|
| 1 | `/users/userA` | `create` | Shadow field injection (`{ uid: "userA", displayName: "A", isAdmin: true, createdAt: NOW, updatedAt: NOW }`) | `PERMISSION_DENIED` |
| 2 | `/enquiries/enq_1` | `create` | Identity spoofing (`ownerId: "victimUid"` by `attackerUid`) | `PERMISSION_DENIED` |
| 3 | `/enquiries/enq_1` | `create` | State shortcutting (`status: "Scoped"` instead of `"New"`) | `PERMISSION_DENIED` |
| 4 | `/enquiries/enq_1` | `create` | Client-forged timestamp (`createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`) | `PERMISSION_DENIED` |
| 5 | `/enquiries/enq_bad$id` | `create` | Path variable ID poisoning (`$`, `/`, or `>128` chars) | `PERMISSION_DENIED` |
| 6 | `/enquiries/enq_1` | `update` | Post-review mutation by owner when `existing.status == "In Review"` | `PERMISSION_DENIED` |
| 7 | `/enquiries/enq_1` | `update` | Terminal state mutation when `existing.status == "Archived"` by non-admin | `PERMISSION_DENIED` |
| 8 | `/enquiries/enq_1` | `update` | Immutable field tampering (`ownerId` or `referenceId` changed by owner) | `PERMISSION_DENIED` |
| 9 | `/enquiries/enq_1` | `list` / `update` | Unverified admin email spoof (`email: "gargsujal6july@gmail.com"`, `email_verified: false`) | `PERMISSION_DENIED` |
| 10 | `/users/victimUid/private/info` | `get` | Cross-user PII read by another authenticated user (`otherUid`) | `PERMISSION_DENIED` |
| 11 | `/blueprints/bp_1` | `create` | Array flooding (`recommendedServices` with 11 items or `[123]` non-string first element) | `PERMISSION_DENIED` |
| 12 | `/admins/attackerUid` | `create` | Privilege escalation attempt writing to `/admins/{uid}` | `PERMISSION_DENIED` |

## 3. Test Runner

`firestore.rules.test.ts` executes with `npx --yes tsx --test firestore.rules.test.ts` and verifies all 12 Dirty Dozen payloads are denied plus positive happy paths and structural rule assertions against `firestore.rules`.
