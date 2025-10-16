import { Router } from 'express';
import { z } from 'zod';
import { floorService } from '../services/floorService.js';

const router = Router();

const userRequestSchema = z.object({
    userId: z.string().min(1, "userID is required"),
    priority: z.number().max(5).min(1).optional()
});

router.get('/:groupId/floor/occupant', async (req, res) => {
    const { groupId } = req.params;


    const occupant = await floorService.getCurrentOccupant(groupId);

    if (occupant) {
        return res.json({ userId: occupant });
    }
    return res.status(404).json({ message: `No occupant for group ${groupId}` });
});

router.post('/:groupId/floor', async (req, res) => {
    const { groupId } = req.params;
    const parsed = userRequestSchema.safeParse(req.body);


    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid request: userId is required" });
    }

    const { userId, priority } = parsed.data;
    const result = await floorService.obtainFloor(groupId, userId, priority);

    if (result.status === "ok") {
        return res.json({ message: result.message });
    } else if (result.status === "conflict") {
        return res.status(409).json({ message: result.message });
    }
});

router.delete("/:groupId/floor/:userId", async (req, res) => {
    const { groupId, userId } = req.params;


    const result = await floorService.releaseFloor(groupId, userId);

    if (result.status === "ok") {
        return res.json({ message: result.message });
    } else {
        return res.status(403).json({ message: result.message });
    }
});

router.get('/:groupId/floor/audit', async (req, res) => {
    const { groupId } = req.params;
    const auditLog = await floorService.getAudit(groupId);
    return res.json({ audit: auditLog });
});

export default router;