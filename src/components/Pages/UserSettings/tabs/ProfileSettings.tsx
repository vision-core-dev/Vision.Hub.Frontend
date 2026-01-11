import {Input} from "@/ui/base/input/input.tsx";
import {AvatarProfilePhoto} from "@/ui/base/avatar/avatar-profile-photo.tsx";
import type {MeUser} from "@/types/AuthUser.ts";
import {Dialog, DialogTrigger, Modal, ModalOverlay} from "@/ui/application/modals/modal.tsx";
import {useState} from "react";
import {FileUploadDropZone} from "@/ui/application/file-upload/file-upload-base.tsx";
import {User} from "lucide-react";
import {api} from "@/utils/api.ts";

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
            const data: {file_url: string} = await res.json();

            setUploadedAvatar(data.file_url);
            setAvatarModal(false);
        } catch (error) {
            console.error("Avatar upload failed", error);
            setUploadedAvatar(user.avatar_url ?? null);
        }
    };

    return (
        <>
            <AvatarProfilePhoto size="md" className="cursor-pointer" src={uploadedAvatar} onClick={() => setAvatarModal(true) } />

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