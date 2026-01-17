import {Input} from "@/shared/ui/input/input.tsx";
import {AvatarProfilePhoto} from "@/shared/ui/avatar/avatar-profile-photo.tsx";
import type {MeUser} from "@/shared/types/AuthUser.ts";
import {Dialog, DialogTrigger, Modal, ModalOverlay} from "@/shared/components/modals/modal.tsx";
import {useState} from "react";
import {FileUploadDropZone} from "@/shared/components/file-upload/file-upload-base.tsx";
import {Cake, User} from "lucide-react";
import {api} from "@/shared/utils/api.ts";
import {safeDate} from "@/shared/utils/safeDate.ts";

interface Props {
    user: MeUser;
}

export default function ProfileSettings({ user }: Props) {
    const [avatarModal, setAvatarModal] = useState<boolean>(false);
    const [uploadedAvatar, setUploadedAvatar] = useState<string | null>(user.avatar_url);

    const handleAvatarUpload = async (file: File) => {
        try {
            setUploadedAvatar(URL.createObjectURL(file));

            const formData = new FormData();
            formData.append("file", file);

            const res = await api.post("/v1/Hub/UserMe/UploadAvatar", formData);

            if (res.status === 200) {
                window.location.reload();
            } else {
                console.error("Avatar upload failed", await res.text());
            }
        } catch (error) {
            console.error("Avatar upload failed", error);

            // rollback, якщо треба
            setUploadedAvatar(user.avatar_url ?? null);
        }
    };

    return (
        <>
            <AvatarProfilePhoto size="md" className="cursor-pointer" src={uploadedAvatar} onClick={() => setAvatarModal(true)} placeholderIcon={User} />

            <Input
                label="Імʼя"
                isDisabled
                value={user.first_name || ""}
                icon={User}
            />

            {user.last_name && (
                <Input
                    label="Прізвище"
                    isDisabled
                    value={user.last_name || ""}
                    icon={User}
                />
            )}

            {user.birthday && (
                <Input
                    label="День народження"
                    isDisabled
                    value={safeDate(user.birthday)}
                    icon={Cake}
                />
            )}

            <ChangeAvatarModal isOpen={avatarModal} setIsOpen={(v) => setAvatarModal(v)} handleAvatarUpload={handleAvatarUpload} />
        </>
    )
}

interface ChangeAvatarModalProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    handleAvatarUpload: (file: File) => void;
}

function ChangeAvatarModal({ isOpen, setIsOpen, handleAvatarUpload }: ChangeAvatarModalProps) {
    return (
        <DialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="relative w-full overflow-hidden p-4 rounded-2xl bg-primary shadow-xl sm:max-w-120">

                            <FileUploadDropZone className="w-full" onDropFiles={(files) => handleAvatarUpload(files[0])} />

                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    )
}








