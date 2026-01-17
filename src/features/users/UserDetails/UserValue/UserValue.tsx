import React from "react";
import { cx } from "@/shared/utils/cx";

interface UserValueProps {
    label: string;
    value?: React.ReactNode;
    align?: "left" | "right";
}

const UserValue: React.FC<UserValueProps> = ({ label, value, align = "left" }) => {
    return (
        <div className={cx("flex flex-col gap-1", align === "right" ? "text-right" : "text-left")}>
            <p className="text-sm font-medium text-tertiary">{label}</p>
            <p className="break-words text-base font-medium text-primary">
                {value ? value : "—"}
            </p>
        </div>
    );
};

export default UserValue;









