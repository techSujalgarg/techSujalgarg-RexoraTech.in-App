import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import dotenv from 'dotenv';
import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';
import { buildMailtoHref, OFFICIAL_EMAIL, validateEnquiryForm } from './src/utils/validation.ts';

dotenv.config();

const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.resolve(process.cwd(), 'data');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

interface StoredEnquiry {
  referenceId: string;
  submittedAt: string;
  fullName: string;
  businessName: string;
  email: string;
  serviceRequired: string;
  projectBudget: string;
  projectRequirements: string;
}

async function persistEnquiry(record: StoredEnquiry): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  let existing: StoredEnquiry[] = [];
  try {
    const raw = await fs.readFile(ENQUIRIES_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      existing = parsed;
    }
  } catch {
    existing = [];
  }
  existing.unshift(record);
  await fs.writeFile(ENQUIRIES_FILE, JSON.stringify(existing.slice(0, 500), null, 2), 'utf8');
}

async function createApp() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', company: 'Rexora Technologies', email: OFFICIAL_EMAIL });
  });

  app.post('/api/enquiries', async (req, res) => {
    const body = req.body ?? {};
    const validation = validateEnquiryForm({
      fullName: String(body.fullName ?? ''),
      businessName: String(body.businessName ?? ''),
      email: String(body.email ?? ''),
      serviceRequired: String(body.serviceRequired ?? ''),
      projectBudget: String(body.projectBudget ?? ''),
      projectRequirements: String(body.projectRequirements ?? ''),
    });

    if (!validation.valid) {
      res.status(400).json({
        error: 'Please review the highlighted fields before submitting.',
        errors: validation.errors,
      });
      return;
    }

    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, '');
    const suffix = crypto.randomBytes(2).toString('hex').toUpperCase();
    const referenceId = `RX-${datePart}-${suffix}`;

    const record: StoredEnquiry = {
      referenceId,
      submittedAt: now.toISOString(),
      ...validation.sanitized,
      projectBudget: validation.sanitized.projectBudget || 'Not specified',
    };

    try {
      await persistEnquiry(record);
    } catch (err) {
      console.error('Failed to persist enquiry:', err);
      res.status(500).json({
        error: `Unable to save enquiry on the server right now. Please email us directly at ${OFFICIAL_EMAIL}.`,
      });
      return;
    }

    const mailtoUrl = buildMailtoHref(validation.sanitized);

    res.status(201).json({
      referenceId,
      submittedAt: record.submittedAt,
      deliveryMode: 'server_recorded',
      officialEmail: OFFICIAL_EMAIL,
      mailtoUrl,
      message: `Enquiry recorded on the RexoraTech server (Reference ${referenceId}). Direct email dispatch can also be opened via your mail client to ${OFFICIAL_EMAIL}.`,
    });
  });

  app.post('/api/advisor/blueprint', async (req, res) => {
    const industry = String(req.body?.industry ?? '').trim();
    const challenge = String(req.body?.challenge ?? '').trim();
    const teamSize = String(req.body?.teamSize ?? '').trim();

    if (!industry || challenge.length < 12) {
      res.status(400).json({
        error: 'Please choose an industry and describe your operational goal (at least 12 characters).',
      });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      res.status(503).json({
        error:
          'Live AI Solution Architect is unavailable because GEMINI_API_KEY is not configured in server secrets. You can load a sample architecture blueprint or submit an enquiry directly.',
      });
      return;
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });

      const prompt = [
        `You are a Principal Solutions Architect at Rexora Technologies (RexoraTech), Delhi, India.`,
        `Design a practical, actionable technology and automation blueprint for a client with:`,
        `- Industry: ${industry}`,
        teamSize ? `- Operational Scale: ${teamSize}` : '',
        `- Business Challenge / Goal: ${challenge}`,
        `Map recommendations strictly to RexoraTech capabilities: Website Development (Business Websites, E-commerce Websites, Portfolio Websites, Landing Pages, Website Redesign, Website Maintenance), Business Automation (Google Sheets Automation, Inventory Management Systems, Store Management Systems, Stock Management, Sales & Purchase Management, Automated Reports, Custom Business Workflows), Data Analytics & MIS (Data Analysis, Data Cleaning, MIS Reporting, Excel Automation, Interactive Dashboards, Business Performance Reports), and Digital Business Solutions (CRM Solutions, Employee Management Systems, Customer Management, Billing & Expense Tracking, Google Forms Automation, Custom Digital Solutions).`,
        `Never invent phone numbers, fake client names, or unrealistic claims. Keep descriptions crisp, concrete, and business-focused.`,
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.HIGH,
          },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              blueprintTitle: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              recommendedServices: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              systemModules: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    moduleName: { type: Type.STRING },
                    purpose: { type: Type.STRING },
                  },
                },
              },
              automationWorkflows: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              implementationPhases: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    phase: { type: Type.STRING },
                    focus: { type: Type.STRING },
                  },
                },
              },
            },
          },
        },
      });

      const rawText = (response.text ?? '{}').trim();
      const blueprint = JSON.parse(rawText);
      res.json({ blueprint, modelUsed: 'gemini-4-hydrogen' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate solution blueprint.';
      console.error('Gemini advisor error:', message);
      res.status(502).json({
        error: `Unable to generate AI solution blueprint right now (${message}).`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`RexoraTech server listening on http://0.0.0.0:${PORT}`);
  });
}

createApp();
