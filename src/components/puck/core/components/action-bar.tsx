import { ReactNode, SyntheticEvent } from "react";
import { Button } from "@/components/ui/button";

export const ActionBar = ({
  label,
  children,
}: {
  label?: string;
  children?: ReactNode;
}) => (
  <div className="flex w-auto p-1 rounded bg-background gap-1 min-h-8 border">
    {label && (
      <div className="flex font-medium content-center items-center px-2 overflow-ellipsis whitespace-nowrap">
        {label}
      </div>
    )}
    {children}
  </div>
);

export const Action = ({
  children,
  label,
  onClick,
  className,
}: {
  children: ReactNode;
  className?: string;
  label?: string;
  onClick: (e: SyntheticEvent) => void;
}) => (
  <Button
    variant="ghost-icon"
    size="icon"
    title={label}
    onClick={onClick}
    className={className}
  >
    {children}
  </Button>
);

export const Group = ({ children }: { children: ReactNode }) => (
  <div className="border-l px-1 flex empty:hidden last-of-type:pr-0">
    {children}
  </div>
);

ActionBar.Action = Action;
ActionBar.Group = Group;
