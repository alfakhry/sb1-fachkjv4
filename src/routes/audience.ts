/**
 * Audience routes — three-layer audience list management and Mbiaat sync.
 *
 * Endpoints:
 *   GET  /audience/templates               — All 12 preset templates with live counts
 *   POST /audience/preview                 — Preview audience count + sample
 *   POST /audience/save                    — Save audience list with filters
 *   POST /audience/sync/:listId            — Sync audience list to Mbiaat labels
 *   GET  /audience/lists/:merchantId       — All saved lists for a merchant
 */

import { Router, Request, Response } from 'express';
import {
  PRESET_TEMPLATES,
  previewAudience,
  saveAudienceList,
  syncAudienceToMbiaat,
  getAudienceListsForMerchant,
  buildAudienceQuery,
  AudienceFilter,
} from '../services/audienceService';
import prisma from '../lib/prisma';

const router = Router();

router.get('/templates', async (req: Request, res: Response): Promise<void> => {
  try {
    const merchantId = req.query.merchant_id ? Number(req.query.merchant_id) : null;

    const templates = await Promise.all(
      PRESET_TEMPLATES.map(async (template) => {
        let count: number | null = null;
        if (merchantId) {
          try {
            const ids = await buildAudienceQuery(merchantId, template.filters);
            count = ids.length;
          } catch {
            count = null;
          }
        }
        return { ...template, count };
      })
    );

    res.json({ success: true, data: templates });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

router.post('/preview', async (req: Request, res: Response): Promise<void> => {
  try {
    const { merchant_id, filters } = req.body as {
      merchant_id: number;
      filters: AudienceFilter[];
    };

    if (!merchant_id || !filters) {
      res.status(400).json({ success: false, error: 'merchant_id and filters are required' });
      return;
    }

    const result = await previewAudience(merchant_id, filters);
    res.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

router.post('/save', async (req: Request, res: Response): Promise<void> => {
  try {
    const { merchant_id, name, filters } = req.body as {
      merchant_id: number;
      name: string;
      filters: AudienceFilter[];
    };

    if (!merchant_id || !name || !filters) {
      res.status(400).json({ success: false, error: 'merchant_id, name, and filters are required' });
      return;
    }

    const merchant = await prisma.merchants.findUnique({
      where: { id: merchant_id },
      select: { mbiaat_api_token: true },
    });

    const list = await saveAudienceList(merchant_id, name, filters, merchant?.mbiaat_api_token ?? null);
    res.json({ success: true, data: list });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

router.post('/sync/:listId', async (req: Request, res: Response): Promise<void> => {
  try {
    const listId = Number(req.params.listId);
    const { merchant_id } = req.body as { merchant_id: number };

    if (!merchant_id || !listId) {
      res.status(400).json({ success: false, error: 'merchant_id and listId are required' });
      return;
    }

    const result = await syncAudienceToMbiaat(merchant_id, listId);
    res.json({ success: true, data: result });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

router.get('/lists/:merchantId', async (req: Request, res: Response): Promise<void> => {
  try {
    const merchantId = Number(req.params.merchantId);
    if (!merchantId) {
      res.status(400).json({ success: false, error: 'merchantId is required' });
      return;
    }

    const lists = await getAudienceListsForMerchant(merchantId);
    res.json({ success: true, data: lists });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ success: false, error: msg });
  }
});

export default router;
