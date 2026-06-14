import { cn } from "@/lib/utils";

interface FolioProps {
  folio: string;
  className?: string;
}

/** Order folio in mono, with the workshop prefix honed in gold. */
export function Folio({ folio, className }: FolioProps) {
  const [prefix, number] = folio.split("-");
  return (
    <span className={cn("font-mono font-medium tracking-tight", className)}>
      <span className="text-gold">{prefix}-</span>
      <span>{number}</span>
    </span>
  );
}
