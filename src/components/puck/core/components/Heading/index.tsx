import { ReactNode } from "react";

export type HeadingProps = {
  children: ReactNode;
  rank?: "1" | "2" | "3" | "4" | "5" | "6";
};

export const Heading = ({ children, rank }: HeadingProps) => {
  const Tag: any = rank ? `h${rank}` : "span";

  return <Tag className="font-medium">{children}</Tag>;
};
