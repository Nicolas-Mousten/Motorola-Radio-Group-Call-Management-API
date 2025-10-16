type FloorState = {
    userId: string;
    expiresAt?: number;
};

class FloorService {
    private floors: Map<string, FloorState> = new Map();

    async obtainFloor(groupId: string, userId: string) {
        const current = this.floors.get(groupId);
        if (current && current.userId !== userId) {
            return {
                status: "conflict",
                message: `Floor is currently held by ${current.userId} for group ${groupId}`
            };
        }

        this.floors.set(groupId, { userId });
        return {
            status: "ok",
            message: `Floor obtained by ${userId} for group ${groupId}`
        };
    }

    async releaseFloor(groupId: string, userId: string) {
        const current = this.floors.get(groupId);
        if (!current || current.userId !== userId) {
            return {
                status: "forbidden",
                message: `User ${userId} does not hold the floor for group ${groupId}`
            };
        }

        this.floors.delete(groupId);
        return {
            status: "ok",
            message: `Floor released by ${userId} for group ${groupId}`
        };
    }

    
}

export const floorService = new FloorService();
