import { cn } from "@/lib/utils";

export interface ThemedColor {
  readonly light: string;
  readonly dark: string;
}

/** Colour chip that follows the light/dark theme (chart CSS variables only exist inside a chart). */
export function ColorSwatch({ color, className }: { color: ThemedColor; className?: string }) {
  return (
    <span aria-hidden="true" className={cn("inline-block size-2.5 shrink-0 rounded-xs", className)}>
      <span className="block size-full rounded-[inherit] dark:hidden" style={{ background: color.light }} />
      <span className="hidden size-full rounded-[inherit] dark:block" style={{ background: color.dark }} />
    </span>
  );
}

/**
 * Legend with colour, name and (optionally) value for each series, so series identity
 * never depends on colour alone. Hidden from screen readers when the chart has a data table.
 */
export function LegendList({
  items,
  className,
  layout = "list",
}: {
  items: { key: string; label: string; color: ThemedColor; value?: React.ReactNode }[];
  className?: string;
  layout?: "list" | "inline";
}) {
  return (
    <ul
      aria-hidden="true"
      className={cn(
        layout === "list" ? "grid gap-1.5 text-sm" : "flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground text-xs",
        className,
      )}
    >
      {items.map((item) => (
        <li key={item.key} className="flex min-w-0 items-center gap-2">
          <ColorSwatch color={item.color} />
          <span className="min-w-0 flex-1 truncate">{item.label}</span>
          {item.value !== undefined && <span className="font-medium text-foreground tabular-nums">{item.value}</span>}
        </li>
      ))}
    </ul>
  );
}
