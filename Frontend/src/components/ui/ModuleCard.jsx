import {
    CheckBadgeIcon,
    CogIcon,
    ExclamationCircleIcon,
} from "@heroicons/react/24/solid";

export default function ModuleCard({ title, isOnline, bgColor }) {
    return (
        <div
            className="relative flex items-center gap-3 rounded-lg px-4 py-3 my-2 text-white"
            style={{ backgroundColor: bgColor }}
        >
            <CogIcon className="h-13 w-13 text-white" />
            <span className="font-semibold">{title}</span>
            <div className="absolute bottom-2 left-2">
                {isOnline ? (
                    <CheckBadgeIcon className="h-8 w-8 text-green-500" />  
                ) : (
                    <ExclamationCircleIcon className="h-8 w-8 text-red-400" />
                )}
            </div>
        </div>
    );
}
