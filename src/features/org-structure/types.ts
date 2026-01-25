import type { UserType } from "@/shared/types/Users";

export type NodeType = "department" | "project" | "user";

export interface OrgNode {
    id: string;
    node_type: NodeType;
    name: string | null;
    description: string | null;
    user_id: string | null;
    parent_id: string | null;
    order: number;
    meta_data: Record<string, any> | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    user?: UserType | null;
    children?: OrgNode[];
}

export interface OrgTreeResponse {
    roots: OrgNode[];
    total_nodes: number;
}

export interface CreateNodeRequest {
    node_type: NodeType;
    name?: string;
    description?: string;
    user_id?: string;
    parent_id?: string | null;
    order?: number;
    meta_data?: Record<string, any>;
}

export interface UpdateNodeRequest {
    name?: string;
    description?: string;
    parent_id?: string | null;
    order?: number;
    meta_data?: Record<string, any>;
    is_active?: boolean;
}

export interface MoveNodeRequest {
    new_parent_id: string | null;
    new_order?: number;
}
