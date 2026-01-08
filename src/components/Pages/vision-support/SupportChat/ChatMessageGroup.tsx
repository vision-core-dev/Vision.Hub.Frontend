import { MessageItem } from "@/ui/application/messaging/messaging";
import type { ChatItem } from "./ChatMessagesProvider";
import {
    getFileName,
    getFileExt,
    getAttachmentType,
    isImage,
} from "@/utils/message-files";

interface Props {
    message: ChatItem;
}

export function ChatMessageGroup({ message }: Props) {
    const isMe = message.from === "operator";
    const files = message.files || [];

    const firstFile = files[0];
    const hasSingleFile = files.length === 1;

    const image =
        hasSingleFile && isImage(firstFile)
            ? {
                src: firstFile,
                alt: getFileName(firstFile),
                name: getFileName(firstFile),
                size: "",
            }
            : undefined;

    const attachment =
        hasSingleFile && !isImage(firstFile)
            ? {
                name: getFileName(firstFile),
                size: "",
                type: getAttachmentType(getFileExt(firstFile)),
            }
            : undefined;

    return (
        <MessageItem
            msg={{
                id: message.id,
                sentAt: new Date(message.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                text: message.text || undefined,
                image,
                attachment,
                user: {
                    name: isMe ? "Оператор" : "Користувач",
                    me: isMe,
                    avatarUrl: !isMe ? "/avatars/user.png" : undefined,
                },
            }}
        />
    );
}
