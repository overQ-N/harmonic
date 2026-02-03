import { cn } from "@/lib/utils";

interface AlbumCoverProps {
  cover?: string; // Base64 encoded image
  title: string;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export function AlbumCover({ cover, title, className, size = "md" }: AlbumCoverProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-14 h-14",
    lg: "w-32 h-32",
    xl: "w-48 h-48",
  };

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-md overflow-hidden bg-muted flex-shrink-0",
        className
      )}
    >
      {cover ? (
        <img
          src={`data:image/jpeg;base64,${cover}`}
          alt={title}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
          <span className="text-2xl">♪</span>
        </div>
      )}
    </div>
  );
}
