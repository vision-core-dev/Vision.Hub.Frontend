import React, { useState, useMemo } from "react";
import styles from "./Table.module.css";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

interface Column<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    emptyText?: string;
    maxWidth?: string;
}

const Table = <T extends Record<string, any>>({
    columns,
    data,
    onRowClick,
    emptyText = "Немає даних",
    maxWidth,
}: TableProps<T>) => {

    const [sortKey, setSortKey] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    const sortedData = useMemo(() => {
        if (!sortKey) return data;

        return [...data].sort((a, b) => {
            const v1 = a[sortKey];
            const v2 = b[sortKey];

            if (v1 === undefined || v1 === null) return 1;
            if (v2 === undefined || v2 === null) return -1;

            if (typeof v1 === "number" && typeof v2 === "number") {
                return sortOrder === "asc" ? v1 - v2 : v2 - v1;
            }
            if (typeof v1 === "string" && typeof v2 === "string") {
                return sortOrder === "asc"
                    ? v1.localeCompare(v2)
                    : v2.localeCompare(v1);
            }

            return 0;
        });
    }, [data, sortKey, sortOrder]);

    const toggleSort = (key: string) => {
        if (sortKey === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc");
        } else {
            setSortKey(key);
            setSortOrder("asc");
        }
    };

    const renderSortIcon = (colKey: string) => {
        if (colKey !== sortKey) return <ChevronsUpDown size={16} />;
        return sortOrder === "asc"
            ? <ChevronUp size={16} />
            : <ChevronDown size={16} />;
    };

    return (
        <div className={styles.wrapper} style={{ maxWidth: maxWidth }}>
            <table className={styles.table}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th
                                key={col.key as string}
                                className={col.sortable ? styles.sortable : ""}
                                onClick={() => col.sortable && toggleSort(col.key as string)}
                            >
                                <span className={styles.headerCell}>
                                    {col.label}
                                    {col.sortable && (
                                        <span className={styles.sortIcon}>
                                            {renderSortIcon(col.key as string)}
                                        </span>
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>

                <tbody>
                    {sortedData.length > 0 ? (
                        sortedData.map((row, i) => (
                            <tr
                                key={i}
                                onClick={() => onRowClick && onRowClick(row)}
                                className={onRowClick ? styles.clickableRow : ""}
                            >
                                {columns.map((col) => (
                                    <td key={col.key as string}>
                                        {col.render
                                            ? col.render(row[col.key as string], row)
                                            : row[col.key as string] ?? "—"}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} className={styles.empty}>
                                {emptyText}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Table;





