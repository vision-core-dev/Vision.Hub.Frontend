import { EmptyState } from "@/shared/ui/application/empty-state/empty-state";
import { Button } from "@/shared/ui/buttons/button";
import { Plus } from "@untitledui/icons";

interface DriveEmptyStateProps {
    onCreateFolder?: () => void;
    onUploadFile?: () => void;
}

export function DriveEmptyState({ onCreateFolder, onUploadFile }: DriveEmptyStateProps) {
    return (
        <EmptyState size="lg" className="py-12">
            <EmptyState.Header pattern="circle">
                <EmptyState.FileTypeIcon type="folder" theme="solid" />
            </EmptyState.Header>
            <EmptyState.Content>
                <EmptyState.Title>Ця папка порожня</EmptyState.Title>
                <EmptyState.Description>
                    Завантажте файли або створіть нову папку, щоб розпочати роботу з Диском.
                </EmptyState.Description>
            </EmptyState.Content>
            {(onCreateFolder || onUploadFile) && (
                <EmptyState.Footer>
                    {onCreateFolder && (
                        <Button color="secondary" onClick={onCreateFolder} iconLeading={Plus}>
                            Нова папка
                        </Button>
                    )}
                    {onUploadFile && (
                        <Button color="primary" onClick={onUploadFile} iconLeading={Plus}>
                            Завантажити
                        </Button>
                    )}
                </EmptyState.Footer>
            )}
        </EmptyState>
    );
}
