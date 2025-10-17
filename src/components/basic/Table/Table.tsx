import React from "react";
import styles from "./Table.module.css";

interface Column<T> {
    key: keyof T | string;
    label: string;
    render?: (value: any, row: T) => React.ReactNode;
}

interface TableProps<T> {
    columns: Column<T>[];
    data: T[];
    onRowClick?: (row: T) => void;
    emptyText?: string;
}

const Table = <T extends Record<string, any>>({
                                                  columns,
                                                  data,
                                                  onRowClick,
                                                  emptyText = "Немає даних",
                                              }: TableProps<T>) => {
    return (
        <div className={styles.wrapper}>
            <table className={styles.table}>
                <thead>
                <tr>
                    {columns.map((col) => (
                        <th key={col.key as string}>{col.label}</th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.length > 0 ? (
                    data.map((row, i) => (
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
