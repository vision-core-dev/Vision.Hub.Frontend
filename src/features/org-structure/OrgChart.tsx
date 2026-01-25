import { memo } from 'react';
import type { OrgNode } from './types';
import { Building2, Briefcase, User as UserIcon, MoreHorizontal, Plus } from 'lucide-react';
import { cx } from '@/shared/utils/cx';

// --- Types ---

interface OrgChartProps {
    roots: OrgNode[];
    onCreateChild?: (parentId: string) => void;
    onEdit?: (node: OrgNode) => void;
    onDelete?: (node: OrgNode) => void;
}

// --- Styles for the Tree (Pure CSS injected via style tag) ---
// This implements the classic CSS structure for organization charts
const treeStyles = `
.org-tree ul {
    padding-top: 20px; 
    position: relative;
    transition: all 0.5s;
    display: flex;
    justify-content: center;
    margin: 0;
    padding-left: 0;
}

.org-tree li {
    float: left; text-align: center;
    list-style-type: none;
    position: relative;
    padding: 20px 10px 0 10px;
    transition: all 0.5s;
}

/* We will use ::before and ::after to draw the connectors */

.org-tree li::before, .org-tree li::after{
    content: '';
    position: absolute; top: 0; right: 50%;
    border-top: 2px solid #E4E7EC; /* Tailwind gray-200 */
    width: 50%; height: 20px;
    z-index: 0;
}
.org-tree li::after{
    right: auto; left: 50%;
    border-left: 2px solid #E4E7EC;
}

/* We need to remove left-right connectors from elements without any siblings */
.org-tree li:only-child::after, .org-tree li:only-child::before {
    display: none;
}

/* Remove space from the top of single children */
.org-tree li:only-child{ 
    padding-top: 0;
}

/* Remove left connector from first child and right connector from last child */
.org-tree li:first-child::before, .org-tree li:last-child::after{
    border: 0 none;
}

/* Adding the vertical connector to the last nodes */
.org-tree li:last-child::before{
    border-right: 2px solid #E4E7EC;
    border-radius: 0 5px 0 0;
}
.org-tree li:first-child::after{
    border-radius: 5px 0 0 0;
}

/* Time to add the downward connector from the parents */
.org-tree ul ul::before{
    content: '';
    position: absolute; top: 0; left: 50%;
    border-left: 2px solid #E4E7EC;
    width: 0; height: 20px;
    z-index: 0;
}
`;

// --- Node Card Component ---

const NodeCard = memo(({ node, onEdit, onCreateChild }: { node: OrgNode, onEdit?: (n: OrgNode) => void, onCreateChild?: (id: string) => void }) => {
    const isUser = node.node_type === 'user';
    const isProject = node.node_type === 'project';
    const isDepartment = node.node_type === 'department';

    // Styles based on type (mimicking the green/purple styles from images)
    const cardStyles = cx(
        "relative flex flex-col items-start p-3 gap-2 min-w-[200px] max-w-[240px] text-left rounded-xl border-2 bg-white shadow-sm transition-all hover:shadow-md z-10",
        isDepartment && "border-green-500 bg-green-50/30",
        isProject && "border-green-500 bg-green-50/30",
        // Using distinct colors for user if needed, but keeping consistent with requested "green" theme for structure
        isUser && "border-purple-200 bg-purple-50/30"
    );

    return (
        <div className={cardStyles}>
            {/* Header / Icon */}
            <div className="flex w-full items-start justify-between">
                <div className={cx(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    isDepartment && "bg-green-100 text-green-700",
                    isProject && "bg-green-100 text-green-700",
                    isUser && "bg-purple-100 text-purple-700"
                )}>
                    {isDepartment && <Building2 size={18} />}
                    {isProject && <Briefcase size={18} />}
                    {isUser && <UserIcon size={18} />}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-100">
                    {onCreateChild && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onCreateChild(node.id); }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-tertiary hover:bg-secondary hover:text-primary transition-colors"
                            title="Add child"
                        >
                            <Plus size={14} />
                        </button>
                    )}
                    {onEdit && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onEdit(node); }}
                            className="flex h-6 w-6 items-center justify-center rounded-md text-tertiary hover:bg-secondary hover:text-primary transition-colors"
                        >
                            <MoreHorizontal size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="flex w-full flex-col">
                {isUser && node.user ? (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-900 leading-tight">
                            {node.user.first_name} {node.user.last_name}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                            {node.user.role?.name || 'No Role'}
                        </span>
                        {/* {node.user.avatar_url && (
                            <Avatar src={node.user.avatar_url} size="md" className="absolute -top-3 -right-3 border-2 border-white shadow-sm" />
                        )} */}
                    </div>
                ) : (
                    <div className="flex flex-col gap-1">
                        <span className="text-sm font-bold text-gray-900 leading-tight">
                            {node.name}
                        </span>
                        {node.description && (
                            <span className="text-xs text-gray-500 line-clamp-2">
                                {node.description}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Type Label */}
            {/* <div className="mt-1 flex items-center gap-1.5 border-t border-dashed border-gray-200 pt-2 w-full">
                <span className="text-[10px] uppercase tracking-wider font-semibold text-tertiary">
                    {isUser ? 'Співробітник' : isProject ? 'Проект' : 'Відділ'}
                </span>
            </div> */}
        </div>
    );
});

// --- Recursive Tree Component ---

const TreeNode = ({ node, ...props }: { node: OrgNode } & Omit<OrgChartProps, 'roots'>) => {
    return (
        <li>
            <div className="inline-block"> {/* Wrapper to ensure card is centered in li */}
                <NodeCard node={node} onEdit={props.onEdit} onCreateChild={props.onCreateChild} />
            </div>

            {node.children && node.children.length > 0 && (
                <ul>
                    {node.children.map(child => (
                        <TreeNode key={child.id} node={child} {...props} />
                    ))}
                </ul>
            )}
        </li>
    );
};

// --- Main Export ---

export const OrgChart = ({ roots, ...props }: OrgChartProps) => {
    if (!roots || roots.length === 0) return null;

    return (
        <div className="w-full h-full overflow-auto bg-slate-50 p-10 cursor-grab active:cursor-grabbing">
            <style>{treeStyles}</style>
            <div className="org-tree min-w-max">
                <ul>
                    {roots.map(root => (
                        <TreeNode key={root.id} node={root} {...props} />
                    ))}
                </ul>
            </div>
        </div>
    );
};
