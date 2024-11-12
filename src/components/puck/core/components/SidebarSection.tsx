import { ReactNode } from "react";
import { Heading } from "./Heading";
import { ChevronRight } from "lucide-react";
import { useBreadcrumbs } from "./../lib/use-breadcrumbs";
import { useAppContext } from "./Puck/context";
import { Loader } from "./Loader";
import { cn } from "@/lib/utils";

export const SidebarSection = ({
  children,
  title,
  showBreadcrumbs,
  noBorderTop,
  isLoading,
}: {
  children: ReactNode;
  title: ReactNode;
  showBreadcrumbs?: boolean;
  noBorderTop?: boolean;
  isLoading?: boolean | null;
}) => {
  const { setUi } = useAppContext();
  const breadcrumbs = useBreadcrumbs(1);

  return (
    <div className="flex flex-col last-of-type:grow">
      <div
        className={cn(
          "p-3 border-y overflow-x-auto",
          noBorderTop && "border-t-0",
        )}
      >
        <div className="items-center flex gap-1">
          {showBreadcrumbs &&
            breadcrumbs.map((breadcrumb, i) => (
              <div key={i} className="items-center flex gap-1">
                <button
                  type="button"
                  className="bg-none cursor-pointer shrink-0 transition-colors ease-in duration-75 focus-visible:ring-2 focus-visible:ring-offset-2 hover:text-accent active:text-accent"
                  onClick={() => setUi({ itemSelector: breadcrumb.selector })}
                >
                  {breadcrumb.label}
                </button>
                <ChevronRight size={16} />
              </div>
            ))}
          <div className="pr-4">
            <Heading rank="2">{title}</Heading>
          </div>
        </div>
      </div>
      <div className="px-4 py-2">{children}</div>
      {isLoading && (
        <div className="flex justify-center items-center h-full w-full top-0 absolute box-border pointer-events-[all] opacity-80">
          <Loader size={32} />
        </div>
      )}
    </div>
  );
};
