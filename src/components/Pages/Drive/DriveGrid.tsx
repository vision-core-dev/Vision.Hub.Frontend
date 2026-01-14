import { Folder, DotsVertical } from "@untitledui/icons";
import {Xlsx} from "@untitledui/file-icons/dist/xlsx";

interface DriveItem {
    id: string;
    name: string;
    type: string;
}

const items: DriveItem[] = [
    { id: "1", name: "Vision", type: "folder" },
    { id: "2", name: "Core", type: "folder" },
    { id: "3", name: "Dev", type: "folder" },
    { id: "4", name: "Не відкривати", type: "folder" },
];

export default function DriveGrid() {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
                <DriveItemCard key={item.id} item={item} />
            ))}
        </div>
    );
}


function DriveItemCard({ item }: { item: DriveItem }) {
    const icon =
        item.type === "folder" ? (
            <Folder className="text-gray-600" />
        ) : (
            <Xlsx className="text-green-600" />
        );

    return (
        <div className="group relative rounded-xl border bg-white p-3 hover:shadow-sm">
            <div className="flex items-center justify-between">
                {icon}
                <button className="opacity-0 group-hover:opacity-100">
                    <DotsVertical className="text-gray-400" />
                </button>
            </div>

            <div className="mt-3 text-sm font-medium truncate">
                {item.name}
            </div>
        </div>
    );
}
