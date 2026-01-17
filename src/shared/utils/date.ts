import {
    parseAbsolute,
    getLocalTimeZone
} from "@internationalized/date";
import type { DateValue } from "react-aria-components";

export function dateValueToIso(value: DateValue | null): string | null {
    if (!value) return null;

    if ("toDate" in value) {
        return value.toDate(getLocalTimeZone()).toISOString();
    }

    return null;
}


function normalizeIso(iso: string): string {
    // якщо немає Z або +hh:mm
    if (!iso.match(/Z|[+-]\d\d:\d\d$/)) {
        return iso + "Z";
    }
    return iso;
}

export function isoToDateValue(iso?: string | null): DateValue | null {
    if (!iso) return null;

    return parseAbsolute(
        normalizeIso(iso),
        getLocalTimeZone()
    );
}


export function dateValueToLocalString(
    value: DateValue | null
): string | null {
    if (!value || !("toDate" in value)) return null;

    const date = value.toDate(getLocalTimeZone());

    const pad = (n: number) => n.toString().padStart(2, "0");

    return (
        `${date.getFullYear()}-` +
        `${pad(date.getMonth() + 1)}-` +
        `${pad(date.getDate())}T` +
        `${pad(date.getHours())}:` +
        `${pad(date.getMinutes())}`
    );
}

export function getAge(birthday: string | number | Date | undefined) {
    if (!birthday) return null;
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
};







