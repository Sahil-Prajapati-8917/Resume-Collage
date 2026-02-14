import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Loader = ({ size = "default", className, ...props }) => {
    const sizeClasses = {
        small: "w-4 h-4",
        default: "w-8 h-8",
        large: "w-12 h-12",
    };

    return (
        <div className={cn("flex justify-center items-center", className)} {...props}>
            <Loader2 className={cn("animate-spin text-primary", sizeClasses[size])} />
        </div>
    );
};

export const FullPageLoader = () => (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        <Loader size="large" />
    </div>
);
