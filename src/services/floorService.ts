type FloorState = {
    userId: string;
    priority: number;
};

type FloorAuditEntry = {
    userId: string;
    action: "obtained" | "released" | "timeout" | "preempted";
    timestamp: string; //ISO
}

const TimeToExpire = 10000;

class FloorService {
    private floors: Map<string, FloorState> = new Map();
    private auditLog: Map<string, FloorAuditEntry[]> = new Map();
    private timers: Map<string, NodeJS.Timeout> = new Map();
    
    async obtainFloor(groupId: string, userId: string, priority: number = 0) {
        const currentFloor = this.floors.get(groupId);

        if (!currentFloor) {
            // Floor is free, grant it
            this.floors.set(groupId, { userId, priority });
            this.logAudit(groupId, { userId, action: "obtained", timestamp: new Date().toISOString() });
            this.floorTimer(groupId, userId, TimeToExpire);
            return {
                status: "ok",
                message: `Floor obtained by ${userId} for group ${groupId}`
            };
        }

        if (currentFloor.userId === userId) {
            // Already holds the floor
            return {
                status: "ok",
                message: `You already hold the floor for group ${groupId}`
            };
        }

        if (priority > currentFloor.priority) {
            // New request has higher priority → preempt current holder
            this.floors.set(groupId, { userId, priority });
            console.log(`Floor preempted: ${userId} replaced ${currentFloor.userId} on group ${groupId}`);
            this.logAudit(groupId, { userId, action: "preempted", timestamp: new Date().toISOString() });
            this.floorTimer(groupId, userId, TimeToExpire);
            return {
                status: "ok",
                message: `Floor preempted: now held by ${userId} for group ${groupId}`
            };
        }

        // Floor is held by someone with equal or higher priority
        return {
            status: "conflict",
            message: `Floor is currently held by ${currentFloor.userId} for group ${groupId}`
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

        // Clear the timeout
        const timer = this.timers.get(groupId);
        if (timer) {
            clearTimeout(timer);
            this.timers.delete(groupId);
        }

        this.floors.delete(groupId);
        this.logAudit(groupId, { userId, action: "released", timestamp: new Date().toISOString() });

        return {
            status: "ok",
            message: `Floor released by ${userId} for group ${groupId}`
        };
    }

    async getCurrentOccupant(groupId: string) {
        const current = this.floors.get(groupId);
        return current ? current.userId : null;
    }

    async floorTimer(groupId: string, userId: string, duration: number) {
        const existingTimer = this.timers.get(groupId);
        if (existingTimer) {
            clearTimeout(existingTimer);
        }

        const timer = setTimeout(async () => {
            const current = this.floors.get(groupId);
            if (current && current.userId === userId) {
                this.logAudit(groupId, { userId, action: "timeout", timestamp: new Date().toISOString() });
                await this.releaseFloor(groupId, userId);
                //console.log(`Floor automatically released for group ${groupId} after ${duration}ms`);
            }
            this.timers.delete(groupId); 
        }, duration);

        this.timers.set(groupId, timer);
    }

    private logAudit(groupId: string, entry: FloorAuditEntry) {
        if (!this.auditLog.has(groupId)) {
            this.auditLog.set(groupId, []);
        }
        this.auditLog.get(groupId)!.push(entry);
    }

    async getAudit(groupId: string): Promise<FloorAuditEntry[]> {
        return this.auditLog.get(groupId) || [];
    }

}

export const floorService = new FloorService();
