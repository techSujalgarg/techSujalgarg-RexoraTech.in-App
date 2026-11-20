import React, { useEffect, useState } from 'react';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  AlertCircle,
  ArrowUpRight,
  CheckCircle2,
  FolderKanban,
  LogIn,
  LogOut,
  PencilLine,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { useFirebase } from '../contexts/FirebaseContext';
import {
  BLUEPRINT_LIMITS,
  db,
  formatFirestoreUiError,
  handleFirestoreError,
  OperationType,
} from '../firebase';

export type EnquiryStatus = 'New' | 'In Review' | 'Scoped' | 'Archived';

export interface TrackedEnquiryDoc {
  id: string;
  referenceId: string;
  ownerId: string;
  fullName: string;
  businessName: string;
  email: string;
  serviceRequired: string;
  projectBudget: string;
  projectRequirements: string;
  status: EnquiryStatus;
  createdAtMs: number;
}

export interface SavedBlueprintDoc {
  id: string;
  ownerId: string;
  blueprintTitle: string;
  industry: string;
  teamSize: string;
  executiveSummary: string;
  recommendedServices: string[];
  automationWorkflows: string[];
  challenge: string;
  createdAtMs: number;
}

interface ClientWorkspacePanelProps {
  onApplyBlueprintToForm: (prefill: {
    serviceRequired: string;
    projectRequirements: string;
  }) => void;
}

function toEpochMs(value: unknown): number {
  if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
    return (value as { toMillis: () => number }).toMillis();
  }
  return 0;
}

const STATUS_BADGE_STYLES: Record<EnquiryStatus, string> = {
  New: 'bg-blue-50 text-[#1D4ED8] border-blue-200',
  'In Review': 'bg-amber-50 text-amber-800 border-amber-200',
  Scoped: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  Archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const ClientWorkspacePanel: React.FC<ClientWorkspacePanelProps> = ({
  onApplyBlueprintToForm,
}) => {
  const { user, authReady, isVerified, isAdmin, authBusy, authError, signInWithGoogle, signOutUser } =
    useFirebase();

  const [viewMode, setViewMode] = useState<'mine' | 'admin'>('mine');
  const [enquiries, setEnquiries] = useState<TrackedEnquiryDoc[]>([]);
  const [blueprints, setBlueprints] = useState<SavedBlueprintDoc[]>([]);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRequirements, setEditRequirements] = useState<string>('');
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);
  const [asyncFatalError, setAsyncFatalError] = useState<Error | null>(null);

  if (asyncFatalError) {
    throw asyncFatalError;
  }

  useEffect(() => {
    if (!authReady || !user || !isVerified) {
      setEnquiries([]);
      setBlueprints([]);
      return;
    }

    const enquiriesQuery =
      isAdmin && viewMode === 'admin'
        ? query(collection(db, 'enquiries'))
        : query(collection(db, 'enquiries'), where('ownerId', '==', user.uid));

    const unsubEnquiries = onSnapshot(
      enquiriesQuery,
      (snapshot) => {
        const rows: TrackedEnquiryDoc[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            referenceId: String(data.referenceId || d.id),
            ownerId: String(data.ownerId || ''),
            fullName: String(data.fullName || ''),
            businessName: String(data.businessName || ''),
            email: String(data.email || ''),
            serviceRequired: String(data.serviceRequired || ''),
            projectBudget: String(data.projectBudget || ''),
            projectRequirements: String(data.projectRequirements || ''),
            status: (data.status as EnquiryStatus) || 'New',
            createdAtMs: toEpochMs(data.createdAt),
          };
        });
        rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setEnquiries(rows);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'enquiries');
        } catch (wrapped) {
          setWorkspaceError(formatFirestoreUiError(wrapped));
          setAsyncFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    const blueprintsQuery = query(
      collection(db, 'blueprints'),
      where('ownerId', '==', user.uid)
    );

    const unsubBlueprints = onSnapshot(
      blueprintsQuery,
      (snapshot) => {
        const rows: SavedBlueprintDoc[] = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ownerId: String(data.ownerId || ''),
            blueprintTitle: String(data.blueprintTitle || ''),
            industry: String(data.industry || ''),
            teamSize: String(data.teamSize || ''),
            executiveSummary: String(data.executiveSummary || ''),
            recommendedServices: Array.isArray(data.recommendedServices)
              ? data.recommendedServices.map(String)
              : [],
            automationWorkflows: Array.isArray(data.automationWorkflows)
              ? data.automationWorkflows.map(String)
              : [],
            challenge: String(data.challenge || ''),
            createdAtMs: toEpochMs(data.createdAt),
          };
        });
        rows.sort((a, b) => b.createdAtMs - a.createdAtMs);
        setBlueprints(rows);
      },
      (error) => {
        try {
          handleFirestoreError(error, OperationType.LIST, 'blueprints');
        } catch (wrapped) {
          setWorkspaceError(formatFirestoreUiError(wrapped));
          setAsyncFatalError(wrapped instanceof Error ? wrapped : new Error(String(wrapped)));
        }
      }
    );

    return () => {
      unsubEnquiries();
      unsubBlueprints();
    };
  }, [authReady, user, isVerified, isAdmin, viewMode]);

  const handleSaveRequirementsEdit = async (docId: string) => {
    const trimmed = editRequirements.trim();
    if (trimmed.length < 15 || trimmed.length > BLUEPRINT_LIMITS.maxRequirementsLength) {
      setWorkspaceError('Updated requirements must be between 15 and 3,000 characters.');
      return;
    }

    setWorkspaceError(null);
    setActionBusyId(docId);
    const docPath = `enquiries/${docId}`;
    try {
      await updateDoc(doc(db, 'enquiries', docId), {
        projectRequirements: trimmed,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      } catch (wrapped) {
        setWorkspaceError(formatFirestoreUiError(wrapped));
      }
    } finally {
      setActionBusyId(null);
    }
  };

  const handleAdminStatusChange = async (docId: string, nextStatus: EnquiryStatus) => {
    setWorkspaceError(null);
    setActionBusyId(docId);
    const docPath = `enquiries/${docId}`;
    try {
      await updateDoc(doc(db, 'enquiries', docId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.UPDATE, docPath);
      } catch (wrapped) {
        setWorkspaceError(formatFirestoreUiError(wrapped));
      }
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDeleteEnquiry = async (docId: string) => {
    setWorkspaceError(null);
    setActionBusyId(docId);
    const docPath = `enquiries/${docId}`;
    try {
      await deleteDoc(doc(db, 'enquiries', docId));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      } catch (wrapped) {
        setWorkspaceError(formatFirestoreUiError(wrapped));
      }
    } finally {
      setActionBusyId(null);
    }
  };

  const handleDeleteBlueprint = async (docId: string) => {
    setWorkspaceError(null);
    setActionBusyId(docId);
    const docPath = `blueprints/${docId}`;
    try {
      await deleteDoc(doc(db, 'blueprints', docId));
    } catch (error) {
      try {
        handleFirestoreError(error, OperationType.DELETE, docPath);
      } catch (wrapped) {
        setWorkspaceError(formatFirestoreUiError(wrapped));
      }
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <section
      aria-labelledby="workspace-heading"
      className="py-14 bg-slate-50 border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide">
              RexoraTech Client Workspace
            </p>
            <h2
              id="workspace-heading"
              className="mt-1 text-2xl sm:text-3xl font-display font-bold text-[#0B162C]"
            >
              Track Enquiries & Saved Solution Blueprints
            </h2>
            <p className="mt-1 text-sm text-slate-600 max-w-2xl">
              Sign in with Google to save AI solution blueprints and track submitted consultation
              enquiries across devices in real time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {!user ? (
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={authBusy}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#1D4ED8] disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>{authBusy ? 'Connecting...' : 'Sign in with Google'}</span>
              </button>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <div className="px-3.5 py-2 rounded-lg bg-white border border-slate-200 text-xs">
                  <p className="font-semibold text-[#0B162C]">
                    {user.displayName || 'Authenticated Client'}
                  </p>
                  <p className="text-slate-500">{user.email}</p>
                </div>
                {isAdmin && (
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1">
                    <button
                      type="button"
                      onClick={() => setViewMode('mine')}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                        viewMode === 'mine'
                          ? 'bg-[#0B162C] text-white'
                          : 'text-slate-600 hover:text-[#0B162C]'
                      }`}
                    >
                      My Records
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('admin')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md cursor-pointer ${
                        viewMode === 'admin'
                          ? 'bg-[#2563EB] text-white'
                          : 'text-slate-600 hover:text-[#0B162C]'
                      }`}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Admin Queue</span>
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={signOutUser}
                  disabled={authBusy}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0B162C] bg-white border border-slate-300 hover:border-[#0B162C] rounded-lg transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {(authError || workspaceError) && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-900"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{authError || workspaceError}</span>
          </div>
        )}

        {!user ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-base font-display font-bold text-[#0B162C]">
                Public Submissions Remain Open Without Sign-In
              </h3>
              <p className="text-sm text-slate-600">
                You can submit the enquiry form above anytime. Sign in with Google only if you want
                your enquiries and generated solution blueprints saved to your private workspace.
              </p>
            </div>
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={authBusy}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0B162C] border border-slate-300 hover:border-[#2563EB] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#2563EB]" aria-hidden="true" />
              <span>Open Client Workspace</span>
            </button>
          </div>
        ) : !isVerified ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-sm text-amber-950">
            Please verify your Google account email before reading or saving workspace records.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Tracked Enquiries */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-[#0B162C] flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
                  <span>
                    {isAdmin && viewMode === 'admin'
                      ? 'All Client Enquiries (Admin Queue)'
                      : 'Your Tracked Enquiries'}
                  </span>
                </h3>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {enquiries.length} {enquiries.length === 1 ? 'record' : 'records'}
                </span>
              </div>

              {enquiries.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
                  No tracked enquiries yet. Submit the enquiry form above while signed in to save
                  and track its review status here.
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((item) => {
                    const isEditing = editingId === item.id;
                    const canOwnerEdit = item.ownerId === user.uid && item.status === 'New';
                    const canDelete = isAdmin || canOwnerEdit;

                    return (
                      <article
                        key={item.id}
                        className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-mono text-slate-500">{item.referenceId}</p>
                            <h4 className="text-base font-display font-bold text-[#0B162C]">
                              {item.serviceRequired} — {item.businessName}
                            </h4>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.fullName} · {item.email}
                              {item.projectBudget ? ` · ${item.projectBudget}` : ''}
                            </p>
                          </div>

                          <span
                            className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                              STATUS_BADGE_STYLES[item.status]
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>

                        {isEditing ? (
                          <div className="space-y-2">
                            <label
                              htmlFor={`edit-req-${item.id}`}
                              className="block text-xs font-medium text-[#0B162C]"
                            >
                              Update Project Requirements
                            </label>
                            <textarea
                              id={`edit-req-${item.id}`}
                              rows={3}
                              maxLength={BLUEPRINT_LIMITS.maxRequirementsLength}
                              value={editRequirements}
                              onChange={(e) => setEditRequirements(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-[#0B162C] focus:border-[#2563EB] focus:outline-none"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={actionBusyId === item.id}
                                onClick={() => handleSaveRequirementsEdit(item.id)}
                                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-md cursor-pointer"
                              >
                                Save Update
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-[#0B162C] cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                            {item.projectRequirements}
                          </p>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {canOwnerEdit && !isEditing && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditRequirements(item.projectRequirements);
                                }}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B162C] hover:text-[#2563EB] cursor-pointer"
                              >
                                <PencilLine className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Edit Scope</span>
                              </button>
                            )}
                            {canDelete && (
                              <button
                                type="button"
                                disabled={actionBusyId === item.id}
                                onClick={() => handleDeleteEnquiry(item.id)}
                                aria-label={`Delete enquiry ${item.referenceId}`}
                                className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                <span>Remove</span>
                              </button>
                            )}
                          </div>

                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <label
                                htmlFor={`admin-status-${item.id}`}
                                className="text-xs font-medium text-slate-500"
                              >
                                Status:
                              </label>
                              <select
                                id={`admin-status-${item.id}`}
                                value={item.status}
                                disabled={actionBusyId === item.id}
                                onChange={(e) =>
                                  handleAdminStatusChange(item.id, e.target.value as EnquiryStatus)
                                }
                                className="rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-[#0B162C] focus:border-[#2563EB] focus:outline-none"
                              >
                                <option value="New">New</option>
                                <option value="In Review">In Review</option>
                                <option value="Scoped">Scoped</option>
                                <option value="Archived">Archived</option>
                              </select>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Saved Solution Blueprints */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-display font-bold text-[#0B162C] flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-[#2563EB]" aria-hidden="true" />
                  <span>Saved Solution Blueprints</span>
                </h3>
                <span className="text-xs font-mono text-slate-500 tabular-nums">
                  {blueprints.length} saved
                </span>
              </div>

              {blueprints.length === 0 ? (
                <div className="bg-white border border-slate-200 rounded-xl p-6 text-sm text-slate-600">
                  No saved blueprints yet. Generate a blueprint in our Services Solution Advisor and
                  save it to reference here.
                </div>
              ) : (
                <div className="space-y-4">
                  {blueprints.map((bp) => (
                    <article
                      key={bp.id}
                      className="bg-white border border-slate-200 rounded-xl p-5 space-y-3"
                    >
                      <div>
                        <p className="text-xs font-medium text-[#2563EB]">
                          {bp.industry} · {bp.teamSize}
                        </p>
                        <h4 className="text-base font-display font-bold text-[#0B162C] mt-0.5">
                          {bp.blueprintTitle}
                        </h4>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {bp.executiveSummary}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            onApplyBlueprintToForm({
                              serviceRequired:
                                bp.recommendedServices[0] || 'Custom Digital Solutions',
                              projectRequirements: [
                                `Blueprint: ${bp.blueprintTitle}`,
                                `Industry: ${bp.industry} (${bp.teamSize})`,
                                `Summary: ${bp.executiveSummary}`,
                                `Original Requirement: ${bp.challenge}`,
                              ].join('\n'),
                            })
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B162C] hover:text-[#2563EB] cursor-pointer"
                        >
                          <span>Load into Enquiry Form</span>
                          <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>

                        <button
                          type="button"
                          disabled={actionBusyId === bp.id}
                          onClick={() => handleDeleteBlueprint(bp.id)}
                          aria-label={`Delete blueprint ${bp.blueprintTitle}`}
                          className="inline-flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
