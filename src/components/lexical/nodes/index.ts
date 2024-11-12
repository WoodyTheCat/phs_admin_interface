import { Klass, LexicalNode } from "lexical";

import { ImageNode } from "./ImageNode";

import { CodeHighlightNode, CodeNode } from "@lexical/code";
import { HashtagNode } from "@lexical/hashtag";
import { AutoLinkNode, LinkNode } from "@lexical/link";
import { ListItemNode, ListNode } from "@lexical/list";
import { MarkNode } from "@lexical/mark";
import { OverflowNode } from "@lexical/overflow";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { TableCellNode, TableNode, TableRowNode } from "@lexical/table";

const PHSNodes: Array<Klass<LexicalNode>> = [
  ImageNode,
  TableCellNode,
  TableNode,
  TableRowNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  LinkNode,
  AutoLinkNode,
  QuoteNode,
  HashtagNode,
  MarkNode,
  OverflowNode,
  HorizontalRuleNode,
  HeadingNode,
];

export default PHSNodes;
