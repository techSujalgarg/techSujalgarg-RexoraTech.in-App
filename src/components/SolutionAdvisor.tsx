import React, { useState } from 'react';
import {
  ArrowRight,
  BookmarkCheck,
  BookmarkPlus,
  CheckCircle2,
  Cpu,
  Layers,
  Loader2,
  LogIn,
  AlertCircle,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { INDUSTRIES } from '../data/rexoraData';
import { useFirebase } from '../contexts/FirebaseContext';
import {
  BLUEPRINT_LIMITS,
  db,
  formatFirestoreUiError,
  handleFirestoreError,
  OperationType,
  sanitizeDocumentId,
} from '../firebase';

export interface SolutionBlueprint {
  blueprintTitle: string;
  executiveSummary: string;
  recommendedServices: string[];
  systemModules: { moduleName: string; purpose: string }[];
  automationWorkflows: string[];
  implementationPhases: { phase: string; focus: string }[];
}

interface SolutionAdvisorProps {
  onApplyToEnquiry: (prefill: {
    serviceRequired: string;
    projectRequirements: string;
  }) => void;
}

const PRESET_SCENARIOS = [
  {
    label: 'Multi-Warehouse Inventory & Billing',
    industry: 'Distributors',
    teamSize: '15–50 employees',
    challenge:
      'We track stock across two warehouses in separate Excel sheets and lose visibility on reorder levels and pending party collections.',
  },
  {
    label: 'Retail Storefront + Stock Sync',
    industry: 'Retail Businesses',
    teamSize: '5–15 employees',
    challenge:
      'We want an online e-commerce catalog synced with our physical store stock so customers can check availability and submit orders.',
  },
  {
    label: 'Automated Daily Kitchen & Sales MIS',
    industry: 'Restaurants & Cafes',
    teamSize: '10–30 employees',
    challenge:
      'Daily counter closing, ingredient purchases, and vendor expenses take 2 hours to compile manually every night.',
  },
];

export const SolutionAdvisor: React.FC<SolutionAdvisorProps> = ({ onApplyToEnquiry }) => {
  const { user, isVerified, signInWithGoogle, authBusy } = useFirebase();
  const [industry, setIndustry] = useState<string>(INDUSTRIES[0].name);
  const [teamSize, setTeamSize] = useState<string>('10–50 employees');
  const [challenge, setChallenge] = useState<string>(
    'We manage purchase orders, stock levels, and weekly MIS reports across disconnected spreadsheets and want an automated system.'
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<SolutionBlueprint | null>(null);
  const [modelUsed, setModelUsed] = useState<string | null>(null);
  const [savingBlueprint, setSavingBlueprint] = useState<boolean>(false);
  const [savedBlueprintId, setSavedBlueprintId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (challenge.trim().length < 12) {
      setError('Please describe your operational goal in at least 12 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/advisor/blueprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, teamSize, challenge }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Unable to generate architecture blueprint right now.');
        return;
      }

      setBlueprint(data.blueprint);
      setModelUsed(data.modelUsed || 'gemini-4-hydrogen');
      setSavedBlueprintId(null);
      setSaveError(null);
    } catch {
      setError('Network error reaching the RexoraTech solution advisor service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBlueprint = async () => {
    if (!blueprint || !user || !isVerified) return;
    setSavingBlueprint(true);
    setSaveError(null);

    const docId = sanitizeDocumentId(`bp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`);
    const docPath = `blueprints/${docId}`;

    const sanitizedRecommendedServices = (
      blueprint.recommendedServices.length > 0
        ? blueprint.recommendedServices
        : ['Custom Digital Solutions']
    )
      .slice(0, BLUEPRINT_LIMITS.maxArrayItems)
      .map((item) => String(item).trim().slice(0, 120) || 'Custom Digital Solutions');

    const sanitizedWorkflows = (
      blueprint.automationWorkflows.length > 0
        ? blueprint.automationWorkflows
        : ['Automated workflow sync']
    )
      .slice(0, BLUEPRINT_LIMITS.maxArrayItems)
      .map((item) => String(item).trim().slice(0, 240) || 'Automated workflow sync');

    const sanitizedModules = (
      blueprint.systemModules.length > 0
        ? blueprint.systemModules
        : [{ moduleName: 'Core Operations Module', purpose: 'Workflow and data tracking' }]
    )
      .slice(0, BLUEPRINT_LIMITS.maxArrayItems)
      .map((mod) => ({
        moduleName: String(mod.moduleName || 'Module').trim().slice(0, 120),
        purpose: String(mod.purpose || 'Core operational workflow').trim().slice(0, 400),
      }));

    const sanitizedPhases = (
      blueprint.implementationPhases.length > 0
        ? blueprint.implementationPhases
        : [{ phase: 'Discovery & Architecture', focus: 'Requirements mapping and schema design' }]
    )
      .slice(0, BLUEPRINT_LIMITS.maxArrayItems)
      .map((ph) => ({
        phase: String(ph.phase || 'Phase').trim().slice(0, 120),
        focus: String(ph.focus || 'Delivery milestone').trim().slice(0, 400),
      }));

    const rawChallenge = challenge.trim();
    const safeChallenge =
      rawChallenge.length >= 12
        ? rawChallenge.slice(0, BLUEPRINT_LIMITS.maxChallengeLength)
        : 'Custom business workflow automation and reporting requirement.';

    try {
      await setDoc(doc(db, 'blueprints', docId), {
        id: docId,
        ownerId: user.uid,
        blueprintTitle:
          blueprint.blueprintTitle.trim().slice(0, BLUEPRINT_LIMITS.maxBlueprintTitleLength) ||
          'RexoraTech Architecture Blueprint',
        industry: industry.trim().slice(0, BLUEPRINT_LIMITS.maxIndustryLength) || 'SME',
        teamSize: teamSize.trim().slice(0, BLUEPRINT_LIMITS.maxTeamSizeLength) || '10–50 employees',
        executiveSummary:
          blueprint.executiveSummary.trim().slice(0, BLUEPRINT_LIMITS.maxSummaryLength) ||
          'Modular architecture blueprint tailored for operational clarity.',
        recommendedServices: sanitizedRecommendedServices,
        automationWorkflows: sanitizedWorkflows,
        systemModules: sanitizedModules,
        implementationPhases: sanitizedPhases,
        challenge: safeChallenge,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSavedBlueprintId(docId);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, docPath);
      } catch (wrapped) {
        setSaveError(formatFirestoreUiError(wrapped));
      }
    } finally {
      setSavingBlueprint(false);
    }
  };

  const applyPreset = (preset: (typeof PRESET_SCENARIOS)[number]) => {
    setIndustry(preset.industry);
    setTeamSize(preset.teamSize);
    setChallenge(preset.challenge);
    setError(null);
  };

  const handleApplyBlueprint = () => {
    if (!blueprint) return;
    const service = blueprint.recommendedServices[0] || 'Custom Digital Solutions';
    const summaryText = [
      `Blueprint: ${blueprint.blueprintTitle}`,
      `Industry: ${industry} (${teamSize})`,
      `Summary: ${blueprint.executiveSummary}`,
      `Recommended Services: ${blueprint.recommendedServices.join(', ')}`,
      `Original Requirement: ${challenge}`,
    ].join('\n');

    onApplyToEnquiry({
      serviceRequired: service,
      projectRequirements: summaryText,
    });
  };

  return (
    <section
      aria-labelledby="advisor-heading"
      className="bg-slate-50 border border-slate-200 rounded-xl p-6 sm:p-8"
    >
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-[#2563EB] tracking-wide uppercase">
          Interactive Solution Scoping
        </p>
        <h2
          id="advisor-heading"
          className="mt-2 text-2xl sm:text-3xl font-display font-bold text-[#0B162C] tracking-tight"
        >
          Generate a Custom Technology Blueprint
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
          Describe your industry and current workflow bottleneck. Our AI-assisted solution
          architect outlines the recommended RexoraTech modules, automation flows, and rollout
          phases before you request a formal quote.
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-500 mr-1">Quick scenarios:</span>
        {PRESET_SCENARIOS.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => applyPreset(preset)}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-white border border-slate-200 text-[#0B162C] hover:border-[#2563EB] hover:text-[#2563EB] transition-colors cursor-pointer"
          >
            {preset.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleGenerate} className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-4 space-y-4">
          <div>
            <label
              htmlFor="advisor-industry"
              className="block text-sm font-medium text-[#0B162C] mb-1.5"
            >
              Industry Sector
            </label>
            <select
              id="advisor-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0B162C] focus:border-[#2563EB] focus:outline-none"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind.id} value={ind.name}>
                  {ind.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="advisor-scale"
              className="block text-sm font-medium text-[#0B162C] mb-1.5"
            >
              Team / Operational Scale
            </label>
            <select
              id="advisor-scale"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0B162C] focus:border-[#2563EB] focus:outline-none"
            >
              <option value="1–10 employees">1–10 employees</option>
              <option value="10–50 employees">10–50 employees</option>
              <option value="50–200 employees">50–200 employees</option>
              <option value="200+ employees / Multi-branch">
                200+ employees / Multi-branch
              </option>
            </select>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
          <div>
            <label
              htmlFor="advisor-challenge"
              className="block text-sm font-medium text-[#0B162C] mb-1.5"
            >
              Current Bottleneck or Digital Goal
            </label>
            <textarea
              id="advisor-challenge"
              rows={4}
              maxLength={BLUEPRINT_LIMITS.maxChallengeLength}
              value={challenge}
              onChange={(e) => setChallenge(e.target.value)}
              placeholder="Describe what tools or manual processes you use today and what you want automated..."
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0B162C] focus:border-[#2563EB] focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 rounded-lg transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                  <span>Analyzing Architecture...</span>
                </>
              ) : (
                <>
                  <Cpu className="w-4 h-4" aria-hidden="true" />
                  <span>Generate Solution Blueprint</span>
                </>
              )}
            </button>

            <span className="text-xs text-slate-500">
              Deep reasoning scoping powered by server-side Gemini intelligence
            </span>
          </div>
        </div>
      </form>

      {error && (
        <div
          role="alert"
          className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-900"
        >
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="space-y-1">
            <p className="font-medium">{error}</p>
            <p className="text-xs text-red-700">
              You can still proceed directly to the consultation form with your selected requirements.
            </p>
            <button
              type="button"
              onClick={() =>
                onApplyToEnquiry({
                  serviceRequired: 'Custom Business Workflows',
                  projectRequirements: `Industry: ${industry} (${teamSize})\nGoal: ${challenge}`,
                })
              }
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0B162C] underline underline-offset-4 cursor-pointer"
            >
              <span>Send requirements directly via Contact Us</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {blueprint && (
        <div className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <p className="text-xs font-medium text-slate-500">
                Proposed Architecture · {industry} {modelUsed ? `· ${modelUsed}` : ''}
              </p>
              <h3 className="mt-1 text-xl font-display font-bold text-[#0B162C]">
                {blueprint.blueprintTitle}
              </h3>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                {blueprint.executiveSummary}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {user && isVerified ? (
                <button
                  type="button"
                  disabled={savingBlueprint || Boolean(savedBlueprintId)}
                  onClick={handleSaveBlueprint}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B162C] bg-slate-100 hover:bg-slate-200 disabled:opacity-75 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {savedBlueprintId ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                      <span>Saved to Workspace</span>
                    </>
                  ) : savingBlueprint ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                      <span>Save Blueprint</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={authBusy}
                  onClick={signInWithGoogle}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-[#0B162C] border border-slate-300 hover:border-[#2563EB] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                  <span>Sign in to Save</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleApplyBlueprint}
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>Use in Enquiry Form</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {saveError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900"
            >
              {saveError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold text-[#0B162C] flex items-center gap-2 mb-3">
                <Layers className="w-4 h-4 text-[#2563EB]" aria-hidden="true" />
                <span>Recommended RexoraTech Services</span>
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {blueprint.recommendedServices.map((svc) => (
                  <li key={svc} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{svc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#0B162C] mb-3">
                Core Automation Workflows
              </h4>
              <ul className="space-y-2 text-sm text-slate-700">
                {blueprint.automationWorkflows.map((wf) => (
                  <li key={wf} className="flex items-start gap-2">
                    <span className="text-[#2563EB] font-mono text-xs mt-1">-</span>
                    <span>{wf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
            <div>
              <h4 className="text-sm font-semibold text-[#0B162C] mb-3">System Modules</h4>
              <div className="space-y-2.5">
                {blueprint.systemModules.map((mod) => (
                  <div key={mod.moduleName} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm font-semibold text-[#0B162C]">{mod.moduleName}</p>
                    <p className="text-xs text-slate-600 mt-0.5">{mod.purpose}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-[#0B162C] mb-3">Implementation Phases</h4>
              <div className="space-y-2.5">
                {blueprint.implementationPhases.map((p, idx) => (
                  <div key={p.phase} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                    <p className="text-sm font-semibold text-[#0B162C]">
                      0{idx + 1}. {p.phase}
                    </p>
                    <p className="text-xs text-slate-600 mt-0.5">{p.focus}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
