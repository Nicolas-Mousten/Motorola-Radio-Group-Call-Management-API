import { Router } from 'express';
import { z } from 'zod';
import { floorService } from '../services/floorService.js';

const router = Router();

const userRequestSchema = z.object({
    userId: z.string().min(1, "userID is required"),
    priority: z.number().max(5).min(1).optional()
});


/**
 * @summary Obtain the current floor occupant
 * 
 * @description Allows the retrieval of the current floor holder for a specified group.
 * 
 * @example - Get {baseURL}/groups/{groupId}/floor/occupant
 * 
 * @param {string} groupId - The unique identifier for the group.
 * 
 * @returns {object} - JSON object containing the userId of the current floor occupant or a 404 if unoccupied.
 */
router.get('/:groupId/floor/occupant', async (req, res) => {
    const { groupId } = req.params;


    const occupant = await floorService.getCurrentOccupant(groupId);

    if (occupant) {
        return res.json({ userId: occupant });
    }
    return res.status(404).json({ message: `No occupant for group ${groupId}` });
});

/**
 * @summary Obtain the floor for a user
 * 
 * @description Allows a user to request and obtain the floor for a specified group, 
 * considering priority levels, and automatic disconnecting after a timelimit has been reached.
 * 
 * @example - Post {baseURL}/groups/{groupId}/floor
 * 
 * @param {string} groupId - The unique identifier for the group.
 * @param {string} userId - The unique identifier for the user requesting the floor.
 * @param {number} [priority] - Optional priority level of the user (1-5).
 * 
 * @returns {object} - JSON object indicating success or conflict status with appropriate messages.
 */
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

/**
 * @summary Release the floor held by a user
 * 
 * @description Allows a user to release the floor they currently hold for a specified group.
 * 
 * @example - Delete {baseURL}/groups/{groupId}/floor/{userId}
 * 
 * @param {string} groupId - The unique identifier for the group.
 * @param {string} userId - The unique identifier for the user releasing the floor.
 * 
 * @return {object} - JSON object indicating success or forbidden status with appropriate messages.
 */
router.delete("/:groupId/floor/:userId", async (req, res) => {
    const { groupId, userId } = req.params;


    const result = await floorService.releaseFloor(groupId, userId);

    if (result.status === "ok") {
        return res.json({ message: result.message });
    } else {
        return res.status(403).json({ message: result.message });
    }
});

/**
 * @summary Retrieve the audit log for floor actions in a group
 * 
 * @description Fetches the audit log detailing all floor-related actions (obtain, release, preempt, timeout) for a specified group.
 * 
 * @example - Get {baseURL}/groups/{groupId}/floor/audit
 * 
 * @param {string} groupId - The unique identifier for the group.
 * 
 * @returns {object} - JSON object containing the audit log entries for the group.
 */
router.get('/:groupId/floor/audit', async (req, res) => {
    const { groupId } = req.params;
    const auditLog = await floorService.getAudit(groupId);
    return res.json({ audit: auditLog });
});

export default router;