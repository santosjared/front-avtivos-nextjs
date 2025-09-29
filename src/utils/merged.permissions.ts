import { Permission } from "src/context/types";

export const mergePermissions = (permissions: Permission[]): Permission[] => {
    const merged: Record<string, Permission> = {};

    for (const perm of permissions) {
        const key = perm.subject;

        if (!merged[key]) {
            merged[key] = {
                ...perm,
                action: [...new Set(perm.action)],
            };
        } else {
            const combinedActions = new Set([
                ...merged[key].action,
                ...perm.action
            ]);
            merged[key].action = Array.from(combinedActions);
        }
    }

    return Object.values(merged);
};
