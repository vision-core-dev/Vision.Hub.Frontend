// utils/message-files.ts
export function isImage(url: string) {
    return /\.(jpg|jpeg|png|webp|gif)$/i.test(url);
}

export function getFileName(url: string) {
    return decodeURIComponent(url.split("/").pop() || "");
}

export function getFileExt(name: string) {
    return name.split(".").pop()?.toLowerCase() || "file";
}

export function getAttachmentType(ext: string): "jpg" | "txt" | "pdf" | "mp4" {
    if (["jpg", "jpeg", "png", "webp"].includes(ext)) return "jpg";
    if (ext === "pdf") return "pdf";
    if (ext === "mp4") return "mp4";
    return "txt";
}
