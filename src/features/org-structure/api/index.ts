import { api } from "@/shared/utils/api";
import type { CreateNodeRequest, MoveNodeRequest, OrgNode, OrgTreeResponse, UpdateNodeRequest } from "../types";

export const orgStructureApi = {
    getTree: async (includeInactive: boolean = false): Promise<OrgTreeResponse> => {
        const res = await api.get(`/v1/Hub/OrgStructure/Tree?include_inactive=${includeInactive}`);
        return res.json();
    },

    getNode: async (id: string): Promise<OrgNode> => {
        const res = await api.get(`/v1/Hub/OrgStructure/Node/${id}`);
        return res.json();
    },

    createNode: async (data: CreateNodeRequest): Promise<OrgNode> => {
        const res = await api.post("/v1/Hub/OrgStructure/Node", data);
        return res.json();
    },

    updateNode: async (id: string, data: UpdateNodeRequest): Promise<OrgNode> => {
        const res = await api.patch(`/v1/Hub/OrgStructure/Node/${id}`, data);
        return res.json();
    },

    deleteNode: async (id: string, cascade: boolean = false): Promise<void> => {
        await api.delete(`/v1/Hub/OrgStructure/Node/${id}?cascade=${cascade}`);
    },

    moveNode: async (id: string, data: MoveNodeRequest): Promise<OrgNode> => {
        const res = await api.post(`/v1/Hub/OrgStructure/Node/${id}/Move`, data);
        return res.json();
    },

    searchNodes: async (query: string, nodeTypes?: string[]): Promise<OrgNode[]> => {
        let url = `/v1/Hub/OrgStructure/Search?q=${encodeURIComponent(query)}`;
        if (nodeTypes && nodeTypes.length > 0) {
            nodeTypes.forEach(type => {
                url += `&node_types=${type}`;
            });
        }
        const res = await api.get(url);
        return res.json();
    }
};
