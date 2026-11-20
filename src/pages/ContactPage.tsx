import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Mail,
  MapPin,
  Send,
} from 'lucide-react';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { COMPANY_INFO, SERVICE_PILLARS } from '../data/rexoraData';
import {
  buildMailtoHref,
  validateEnquiryForm,
  type EnquiryField,
  type EnquiryFormInput,
} from '../utils/validation';
import { useFirebase } from '../contexts/FirebaseContext';
import {
  BLUEPRINT_LIMITS,
  db,
  formatFirestoreUiError,
  handleFirestoreError,
  OperationType,
  sanitizeDocumentId,
} from '../firebase';
import { ClientWorkspacePanel } from '../components/ClientWorkspacePanel';

interface ContactPageProps {
  prefill?: {
    serviceRequired?: string;
    projectRequirements?: string;
  } | null;
}

interface SubmissionResult {
  referenceId: string;
  submittedAt: string;
  message: string;
  mailtoUrl: string;
}

const BUDGET_OPTIONS = [
  '',
  'Under ₹25,000',
  '₹25,000 – ₹75,000',
  '₹75,000 – ₹2,00,000',
  '₹2,00,000+',
  'To be discussed after scoping',
];

export const ContactPage: React.FC<ContactPageProps> = ({ prefill }) => {
  const { user, isVerified } = useFirebase();
  const formRef = useRef<HTMLFormElement | null>(null);
  const fullNameInputRef = useRef<HTMLInputElement | null>(null);
  const statusRef = useRef<HTMLDivElement | null>(null);

  const [formData, setFormData] = useState<EnquiryFormInput>({
    fullName: '',
    businessName: '',
    email: '',
    serviceRequired: prefill?.serviceRequired || 'Business Websites',
    projectBudget: '',
    projectRequirements: prefill?.projectRequirements || '',
  });

  const [fieldErrors, setFieldErrors] = useState<Partial<Record<EnquiryField, string>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submittedResult, setSubmittedResult] = useState<SubmissionResult | null>(null);

  useEffect(() => {
    if (prefill) {
      setFormData((prev) => ({
        ...prev,
        serviceRequired: prefill.serviceRequired || prev.serviceRequired,
        projectRequirements: prefill.projectRequirements || prev.projectRequirements,
      }));
      setSubmittedResult(null);
    }
  }, [prefill]);

  const handleFieldChange = (field: keyof EnquiryFormInput, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    setServerError(null);
  };

  const handleFocusQuoteForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setTimeout(() => fullNameInputRef.current?.focus(), 200);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    const check = validateEnquiryForm(formData);
    if (!check.valid) {
      setFieldErrors(check.errors);
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/enquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(check.sanitized),
      });

      const payload = await response.json();
      if (!response.ok) {
        if (payload.errors) {
          setFieldErrors(payload.errors);
        }
        setServerError(payload.error || 'Unable to submit enquiry. Please review your entries.');
        return;
      }

      let finalMessage = payload.message as string;
      if (user && isVerified) {
        const refId = sanitizeDocumentId(String(payload.referenceId || `REX_${Date.now()}`)).slice(0, 64);
        const docPath = `enquiries/${refId}`;
        try {
          await setDoc(doc(db, 'enquiries', refId), {
            referenceId: refId,
            ownerId: user.uid,
            fullName: check.sanitized.fullName.slice(0, BLUEPRINT_LIMITS.maxFullNameLength),
            businessName: check.sanitized.businessName.slice(0, BLUEPRINT_LIMITS.maxBusinessNameLength),
            email: check.sanitized.email.slice(0, BLUEPRINT_LIMITS.maxEmailLength),
            serviceRequired: check.sanitized.serviceRequired.slice(0, BLUEPRINT_LIMITS.maxServiceLength),
            projectBudget: (check.sanitized.projectBudget || '').slice(0, BLUEPRINT_LIMITS.maxBudgetLength),
            projectRequirements: check.sanitized.projectRequirements.slice(
              0,
              BLUEPRINT_LIMITS.maxRequirementsLength
            ),
            status: 'New',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
          finalMessage = `${finalMessage} It is also saved to your RexoraTech Client Workspace below.`;
        } catch (fsErr) {
          try {
            handleFirestoreError(fsErr, OperationType.CREATE, docPath);
          } catch (wrapped) {
            setServerError(formatFirestoreUiError(wrapped));
          }
        }
      }

      setSubmittedResult({
        referenceId: payload.referenceId,
        submittedAt: payload.submittedAt,
        message: finalMessage,
        mailtoUrl: payload.mailtoUrl,
      });
      setTimeout(() => {
        statusRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 60);
      setFormData({
        fullName: '',
        businessName: '',
        email: '',
        serviceRequired: 'Business Websites',
        projectBudget: '',
        projectRequirements: '',
      });
    } catch {
      setServerError(
        `Network error reaching the enquiry server. You can email us directly at ${COMPANY_INFO.officialEmail}.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const allServices = SERVICE_PILLARS.flatMap((pillar) =>
    pillar.services.map((svc) => ({
      pillar: pillar.title,
      title: svc.title,
    }))
  );

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="bg-[#0B162C] text-white py-14 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs font-semibold text-[#60A5FA] tracking-wide uppercase">
              Contact Us · {COMPANY_INFO.location}
            </p>
            <h1 className="text-3xl sm:text-5xl font-display font-bold tracking-tight">
              Start a Conversation With {COMPANY_INFO.brandName}
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed">
              Share your requirements through our validated enquiry workflow or reach our
              engineering team directly by email.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <a
              href={buildMailtoHref(formData)}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Mail className="w-4 h-4" aria-hidden="true" />
              <span>Email Us</span>
            </a>
            <button
              type="button"
              onClick={handleFocusQuoteForm}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0B162C] bg-white hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Get a Quote</span>
            </button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Info Column */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="p-6 rounded-xl border border-slate-200 bg-slate-50 space-y-5">
              <div>
                <p className="text-xs font-semibold text-[#2563EB] uppercase tracking-wide">
                  Official Contact Channels
                </p>
                <h2 className="mt-1 text-xl font-display font-bold text-[#0B162C]">
                  {COMPANY_INFO.fullCompanyName}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">{COMPANY_INFO.tagline}</p>
              </div>

              <div className="space-y-4 pt-3 border-t border-slate-200">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Official Email</p>
                    <a
                      href={`mailto:${COMPANY_INFO.officialEmail}`}
                      className="text-sm font-semibold text-[#0B162C] hover:text-[#2563EB] underline underline-offset-4 break-all"
                    >
                      {COMPANY_INFO.officialEmail}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs font-semibold text-slate-500">Business Location</p>
                    <p className="text-sm font-semibold text-[#0B162C]">
                      {COMPANY_INFO.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <a
                  href={`mailto:${COMPANY_INFO.officialEmail}`}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#0B162C] hover:bg-[#1D4ED8] rounded-lg transition-colors"
                >
                  <Mail className="w-4 h-4" aria-hidden="true" />
                  <span>Open Email App</span>
                </a>
              </div>
            </div>

            <div className="p-6 rounded-xl border border-slate-200 bg-white space-y-2">
              <h3 className="text-sm font-display font-bold text-[#0B162C]">
                How Enquiries Are Handled
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Submitting the form records your project brief on the RexoraTech server with a
                verified reference ID and prepares an optional direct email dispatch to{' '}
                {COMPANY_INFO.officialEmail} so you retain a copy in your own outbox.
              </p>
            </div>
          </aside>

          {/* Right Form Column */}
          <div className="lg:col-span-8">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              noValidate
              className="p-6 sm:p-8 rounded-2xl border border-slate-200 bg-white space-y-6"
            >
              <div className="pb-4 border-b border-slate-200">
                <h2 className="text-2xl font-display font-bold text-[#0B162C]">
                  Project & Consultation Enquiry Form
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Fields marked with * are required so we can prepare an accurate technical
                  response.
                </p>
              </div>

              {submittedResult && (
                <div
                  ref={statusRef}
                  role="status"
                  className="scroll-mt-24 rounded-xl border border-emerald-200 bg-emerald-50 p-5 space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-emerald-950">
                        Enquiry Logged · Reference {submittedResult.referenceId}
                      </p>
                      <p className="text-sm text-emerald-900">{submittedResult.message}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 pl-8">
                    <a
                      href={submittedResult.mailtoUrl}
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0B162C] hover:bg-[#1D4ED8] rounded-lg"
                    >
                      <Mail className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Send Copy via Default Email App</span>
                    </a>
                  </div>
                </div>
              )}

              {serverError && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 p-4 flex items-start gap-3 text-sm text-red-900"
                >
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                  <span>{serverError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="enquiry-fullName"
                    className="block text-sm font-medium text-[#0B162C] mb-1.5"
                  >
                    Full Name *
                  </label>
                  <input
                    ref={fullNameInputRef}
                    id="enquiry-fullName"
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.maxFullNameLength}
                    value={formData.fullName}
                    onChange={(e) => handleFieldChange('fullName', e.target.value)}
                    placeholder="Your full name"
                    aria-invalid={Boolean(fieldErrors.fullName)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0B162C] focus:outline-none ${
                      fieldErrors.fullName
                        ? 'border-red-500 bg-red-50/40'
                        : 'border-slate-300 focus:border-[#2563EB]'
                    }`}
                  />
                  {fieldErrors.fullName && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.fullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="enquiry-businessName"
                    className="block text-sm font-medium text-[#0B162C] mb-1.5"
                  >
                    Business Name *
                  </label>
                  <input
                    id="enquiry-businessName"
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.maxBusinessNameLength}
                    value={formData.businessName}
                    onChange={(e) => handleFieldChange('businessName', e.target.value)}
                    placeholder="Company or organization name"
                    aria-invalid={Boolean(fieldErrors.businessName)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0B162C] focus:outline-none ${
                      fieldErrors.businessName
                        ? 'border-red-500 bg-red-50/40'
                        : 'border-slate-300 focus:border-[#2563EB]'
                    }`}
                  />
                  {fieldErrors.businessName && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.businessName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="enquiry-email"
                    className="block text-sm font-medium text-[#0B162C] mb-1.5"
                  >
                    Email Address *
                  </label>
                  <input
                    id="enquiry-email"
                    type="email"
                    required
                    maxLength={BLUEPRINT_LIMITS.maxEmailLength}
                    value={formData.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    placeholder="you@company.com"
                    aria-invalid={Boolean(fieldErrors.email)}
                    className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0B162C] focus:outline-none ${
                      fieldErrors.email
                        ? 'border-red-500 bg-red-50/40'
                        : 'border-slate-300 focus:border-[#2563EB]'
                    }`}
                  />
                  {fieldErrors.email && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="enquiry-service"
                    className="block text-sm font-medium text-[#0B162C] mb-1.5"
                  >
                    Service Required *
                  </label>
                  <select
                    id="enquiry-service"
                    required
                    value={formData.serviceRequired}
                    onChange={(e) => handleFieldChange('serviceRequired', e.target.value)}
                    aria-invalid={Boolean(fieldErrors.serviceRequired)}
                    className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#0B162C] focus:outline-none ${
                      fieldErrors.serviceRequired
                        ? 'border-red-500'
                        : 'border-slate-300 focus:border-[#2563EB]'
                    }`}
                  >
                    <option value="">Select a service...</option>
                    <option value="General Consultation">General Consultation</option>
                    {allServices.map((item) => (
                      <option key={`${item.pillar}-${item.title}`} value={item.title}>
                        {item.title} ({item.pillar})
                      </option>
                    ))}
                  </select>
                  {fieldErrors.serviceRequired && (
                    <p className="mt-1 text-xs text-red-600">{fieldErrors.serviceRequired}</p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="enquiry-budget"
                  className="block text-sm font-medium text-[#0B162C] mb-1.5"
                >
                  Project Budget (Optional)
                </label>
                <select
                  id="enquiry-budget"
                  value={formData.projectBudget}
                  onChange={(e) => handleFieldChange('projectBudget', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-[#0B162C] focus:border-[#2563EB] focus:outline-none"
                >
                  {BUDGET_OPTIONS.map((opt) => (
                    <option key={opt || 'unspecified'} value={opt}>
                      {opt || 'Prefer not to specify right now'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="enquiry-requirements"
                  className="block text-sm font-medium text-[#0B162C] mb-1.5"
                >
                  Project Requirements *
                </label>
                <textarea
                  id="enquiry-requirements"
                  rows={5}
                  required
                  maxLength={BLUEPRINT_LIMITS.maxRequirementsLength}
                  value={formData.projectRequirements}
                  onChange={(e) => handleFieldChange('projectRequirements', e.target.value)}
                  placeholder="Describe what you want to build or automate, your current tools, and expected timeline..."
                  aria-invalid={Boolean(fieldErrors.projectRequirements)}
                  className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-[#0B162C] focus:outline-none ${
                    fieldErrors.projectRequirements
                      ? 'border-red-500 bg-red-50/40'
                      : 'border-slate-300 focus:border-[#2563EB]'
                  }`}
                />
                {fieldErrors.projectRequirements && (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.projectRequirements}</p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-60 rounded-lg transition-colors cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                      <span>Submitting Enquiry...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Submit Enquiry</span>
                    </>
                  )}
                </button>

                <a
                  href={buildMailtoHref(formData)}
                  className="text-sm font-semibold text-[#0B162C] hover:text-[#2563EB] underline underline-offset-4"
                >
                  Or send directly via {COMPANY_INFO.officialEmail}
                </a>
              </div>
            </form>
          </div>
        </div>
      </section>

      <ClientWorkspacePanel
        onApplyBlueprintToForm={(bpPrefill) => {
          setFormData((prev) => ({
            ...prev,
            serviceRequired: bpPrefill.serviceRequired,
            projectRequirements: bpPrefill.projectRequirements,
          }));
          handleFocusQuoteForm();
        }}
      />
    </div>
  );
};
