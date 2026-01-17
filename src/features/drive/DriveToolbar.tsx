import { useState } from "react";
import { Plus, Folder, UploadCloud01 } from "@untitledui/icons";
import { Button } from "@/shared/ui/buttons/button";
import { Input } from "@/shared/ui/input/input";
import { Dropdown } from "@/shared/ui/dropdown/dropdown";

import {Dialog, DialogTrigger, Modal} from "@/shared/components/modals/modal";
import {ModalOverlay} from "@/shared/components/modals/modal.tsx";
import { FileUpload } from "@/shared/components/file-upload/file-upload-base";
import {Search} from "lucide-react";

export default function DriveToolbar() {
    const [openFolder, setOpenFolder] = useState(false);
    const [openUpload, setOpenUpload] = useState(false);

    return (
        <>
            <div className="flex items-center justify-between">
                <Dropdown.Root>
                    <Button iconLeading={Plus} iconTrailing>
                        Додати
                    </Button>

                    <Dropdown.Popover>
                        <Dropdown.Menu>
                            <Dropdown.Item icon={Folder} onClick={() => setOpenFolder(true)}>
                                Папка
                            </Dropdown.Item>
                            <Dropdown.Item icon={UploadCloud01} onClick={() => setOpenUpload(true)}>
                                Файл
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown.Popover>
                </Dropdown.Root>

                <Input icon={Search} placeholder="Шукати файли..." className="w-64" size="sm" />
            </div>

            <CreateFolderModal open={openFolder} onClose={() => setOpenFolder(false)} />
            <UploadFileModal open={openUpload} onClose={() => setOpenUpload(false)} />
        </>
    );
}

interface ModalProps {
    open: boolean;
    onClose: () => void;
}

function CreateFolderModal({ open, onClose }: ModalProps) {
    return (
        <DialogTrigger isOpen={open} onOpenChange={open => !open && onClose()}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="w-full max-w-md rounded-xl bg-white p-6">
                            <h3 className="text-md font-semibold mb-4">
                                Створити папку
                            </h3>

                            <Input
                                autoFocus
                                placeholder="Назва папки"
                                className="mb-6"
                            />

                            <div className="flex justify-end gap-2">
                                <Button color="secondary" onClick={onClose}>
                                    Скасувати
                                </Button>
                                <Button color="primary">
                                    Створити
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}

function UploadFileModal({ open, onClose }: ModalProps) {
    const [uploadFiles, ] = useState([]);
    return (
        <DialogTrigger isOpen={open} onOpenChange={(v) => !v && onClose()}>
            <ModalOverlay isDismissable>
                <Modal>
                    <Dialog>
                        <div className="w-full max-w-lg rounded-xl bg-white p-6">
                            <h3 className="mb-4 text-md font-semibold">
                                Завантажити файли
                            </h3>

                            <FileUpload.Root>
                                <FileUpload.DropZone hint="Всі файли (макс. 10 ГБ)" accept="*" maxSize={10_000_000_000} />

                                {uploadFiles.length > 0 && (
                                    <FileUpload.List>
                                    </FileUpload.List>
                                )}
                            </FileUpload.Root>

                            <div className="mt-6 flex justify-end gap-2">
                                <Button color="primary" isDisabled>
                                    Додати
                                </Button>
                                <Button color="secondary" onClick={onClose}>
                                    Закрити
                                </Button>
                            </div>
                        </div>
                    </Dialog>
                </Modal>
            </ModalOverlay>
        </DialogTrigger>
    );
}








