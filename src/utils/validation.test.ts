import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMailtoHref, OFFICIAL_EMAIL, validateEnquiryForm } from './validation';

test('validateEnquiryForm rejects empty or invalid inputs', () => {
  const result = validateEnquiryForm({
    fullName: 'A',
    businessName: '',
    email: 'not-an-email',
    serviceRequired: '',
    projectBudget: '',
    projectRequirements: 'Too short',
  });

  assert.equal(result.valid, false);
  assert.ok(result.errors.fullName);
  assert.ok(result.errors.businessName);
  assert.ok(result.errors.email);
  assert.ok(result.errors.serviceRequired);
  assert.ok(result.errors.projectRequirements);
  assert.equal(result.errors.projectBudget, undefined);
});

test('validateEnquiryForm accepts valid enquiry with optional budget omitted', () => {
  const result = validateEnquiryForm({
    fullName: '  Aarav Mehta  ',
    businessName: '  Northline Distributors  ',
    email: 'aarav@northline.example.in',
    serviceRequired: 'Inventory Management Systems',
    projectBudget: '',
    projectRequirements:
      'We manage 400 SKUs across two Delhi NCR warehouses and need automated reorder alerts.',
  });

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, {});
  assert.equal(result.sanitized.fullName, 'Aarav Mehta');
  assert.equal(result.sanitized.businessName, 'Northline Distributors');
});

test('buildMailtoHref targets official RexoraTech email with no phone numbers', () => {
  const href = buildMailtoHref({
    fullName: 'Priya Sharma',
    businessName: 'Capital Crafts',
    email: 'priya@capitalcrafts.example.com',
    serviceRequired: 'Business Websites',
    projectRequirements: 'Need a responsive B2B catalog website.',
  });

  assert.ok(href.startsWith(`mailto:${OFFICIAL_EMAIL}?`));
  assert.ok(href.includes('Business%20Websites'));
  assert.ok(!href.toLowerCase().includes('phone'));
});
