import DriveToolbar from "./DriveToolbar";
import {Breadcrumbs} from "@/shared/components/breadcrumbs/breadcrumbs.tsx";
import {HomeLine} from "@untitledui/icons";
import DriveGrid from "@/features/drive/DriveGrid.tsx";

export default function DrivePage() {
    return (
        <div className="flex flex-col gap-4 p-6">
            <DriveBreadcrumbs />

            <DriveToolbar />

            <DriveGrid />
        </div>
    );
}

const DriveBreadcrumbs = () => (
    <div className="flex flex-col gap-8">
        <Breadcrumbs type="button" divider="slash" maxVisibleItems={4}>
            <Breadcrumbs.Item href="#" icon={HomeLine} />
        </Breadcrumbs>
    </div>
);











