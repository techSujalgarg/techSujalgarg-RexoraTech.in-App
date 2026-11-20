export interface EnquiryFormInput {
  fullName: string;
  businessName: string;
  email: string;
  serviceRequired: string;
  projectBudget?: string;
  projectRequirements: string;
}

export type EnquiryField =
  | 'fullName'
  | 'businessName'
  | 'email'
  | 'serviceRequired'
  | 'projectBudget'
  | 'projectRequirements';

export interface EnquiryValidationResult {
  valid: boolean;
  errors: Partial<Record<EnquiryField, string>>;
  sanitized: EnquiryFormInput;
}

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const OFFICIAL_EMAIL = 'rexoratech.dl@gmail.com';

export function validateEnquiryForm(input: EnquiryFormInput): EnquiryValidationResult {
  const fullName = input.fullName.trim();
  const businessName = input.businessName.trim();
  const email = input.email.trim();
  const serviceRequired = input.serviceRequired.trim();
  const projectBudget = (input.projectBudget ?? '').trim();
  const projectRequirements = input.projectRequirements.trim();

  const errors: Partial<Record<EnquiryField, string>> = {};

  if (fullName.length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  } else if (fullName.length > 100) {
    errors.fullName = 'Full name must be 100 characters or fewer.';
  }

  if (businessName.length < 2) {
    errors.businessName = 'Please enter your business or organization name.';
  } else if (businessName.length > 120) {
    errors.businessName = 'Business name must be 120 characters or fewer.';
  }

  if (!email) {
    errors.email = 'Please enter your business email address.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Please enter a valid email address (for example, name@company.com).';
  }

  if (!serviceRequired) {
    errors.serviceRequired = 'Please select the primary service you require.';
  }

  if (projectRequirements.length < 15) {
    errors.projectRequirements =
      'Please describe your project requirements (at least 15 characters).';
  } else if (projectRequirements.length > 3000) {
    errors.projectRequirements = 'Project requirements must be 3,000 characters or fewer.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      fullName,
      businessName,
      email,
      serviceRequired,
      projectBudget,
      projectRequirements,
    },
  };
}

export function buildMailtoHref(input?: Partial<EnquiryFormInput>): string {
  const subject = input?.serviceRequired
    ? `Project Enquiry: ${input.serviceRequired} — ${input.businessName || 'New Business'}`
    : 'Project Consultation Enquiry — RexoraTech';

  const lines: string[] = [];
  if (input?.fullName) lines.push(`Full Name: ${input.fullName}`);
  if (input?.businessName) lines.push(`Business Name: ${input.businessName}`);
  if (input?.email) lines.push(`Reply Email: ${input.email}`);
  if (input?.serviceRequired) lines.push(`Service Required: ${input.serviceRequired}`);
  if (input?.projectBudget) lines.push(`Project Budget: ${input.projectBudget}`);
  if (input?.projectRequirements) {
    lines.push('');
    lines.push('Project Requirements:');
    lines.push(input.projectRequirements);
  }

  if (lines.length === 0) {
    lines.push('Hello RexoraTech team,');
    lines.push('');
    lines.push('I would like to schedule a consultation regarding:');
    lines.push('- Business Name:');
    lines.push('- Service Required:');
    lines.push('- Key Objectives:');
  }

  const params = new URLSearchParams({
    subject,
    body: lines.join('\n'),
  });

  return `mailto:${OFFICIAL_EMAIL}?${params.toString().replace(/\+/g, '%20')}`;
}
