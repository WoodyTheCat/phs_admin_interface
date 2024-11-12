import { cn } from "@/lib/utils";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";

type Props = {
  placeholder: string;
  className?: string;
  placeholderClassName?: string;
};

const LexicalContentEditable: React.FC<Props> = ({
  placeholder,
  className,
  placeholderClassName,
}: Props) => {
  return (
    <ContentEditable
      className={cn(
        "border-0 relative outline-0 pt-2 px-2 pb-10 min-h-[150px] lg:px-7",
        className,
      )}
      aria-placeholder={placeholder}
      placeholder={
        <div
          className={cn(
            "pt-2 px-2 lg:px-7 text-muted overflow-hidden absolute text-ellipsis select-none whitespace-nowrap inline-block pointer-events-none",
            placeholderClassName,
          )}
        >
          {placeholder}
        </div>
      }
    />
  );
};

export default LexicalContentEditable;
