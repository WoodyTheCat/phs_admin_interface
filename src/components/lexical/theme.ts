import type { EditorThemeClasses } from "lexical";

const theme: EditorThemeClasses = {
  autocomplete: "text-muted",
  blockCursor: "PlaygroundEditorTheme__blockCursor",
  characterLimit: "inline bg-muted",
  code: "PlaygroundEditorTheme__code",
  codeHighlight: {
    atrule: "PlaygroundEditorTheme__tokenAttr",
    attr: "PlaygroundEditorTheme__tokenAttr",
    boolean: "PlaygroundEditorTheme__tokenProperty",
    builtin: "PlaygroundEditorTheme__tokenSelector",
    cdata: "PlaygroundEditorTheme__tokenComment",
    char: "PlaygroundEditorTheme__tokenSelector",
    class: "PlaygroundEditorTheme__tokenFunction",
    "class-name": "PlaygroundEditorTheme__tokenFunction",
    comment: "PlaygroundEditorTheme__tokenComment",
    constant: "PlaygroundEditorTheme__tokenProperty",
    deleted: "PlaygroundEditorTheme__tokenProperty",
    doctype: "PlaygroundEditorTheme__tokenComment",
    entity: "PlaygroundEditorTheme__tokenOperator",
    function: "PlaygroundEditorTheme__tokenFunction",
    important: "PlaygroundEditorTheme__tokenVariable",
    inserted: "PlaygroundEditorTheme__tokenSelector",
    keyword: "PlaygroundEditorTheme__tokenAttr",
    namespace: "PlaygroundEditorTheme__tokenVariable",
    number: "PlaygroundEditorTheme__tokenProperty",
    operator: "PlaygroundEditorTheme__tokenOperator",
    prolog: "PlaygroundEditorTheme__tokenComment",
    property: "PlaygroundEditorTheme__tokenProperty",
    punctuation: "PlaygroundEditorTheme__tokenPunctuation",
    regex: "PlaygroundEditorTheme__tokenVariable",
    selector: "PlaygroundEditorTheme__tokenSelector",
    string: "PlaygroundEditorTheme__tokenSelector",
    symbol: "PlaygroundEditorTheme__tokenProperty",
    tag: "PlaygroundEditorTheme__tokenProperty",
    url: "PlaygroundEditorTheme__tokenOperator",
    variable: "PlaygroundEditorTheme__tokenVariable",
  },
  embedBlock: {
    base: "select-none",
    focus: "outline-2 outline-[rgb(60,132,244)]",
  },
  hashtag:
    "bg-[rgba(88,144,255,0.15)] border-b-1 border-[rgba(88,144,255,0.3)]",
  heading: {
    h1: "font-size-6 font-weight-400 m-0",
    h2: "font-size-4 font-weight-700 m-0 uppercase",
    h3: "font-size-3 m-0 uppercase",
    h4: "",
    h5: "",
    h6: "",
  },
  hr: "cursor-pointer mx-0 my-[1em] p-0.5 border-[none] after:content-[''] after:block after:h-0.5 after:bg-[#ccc] after:leading-[2px] select-none [&.selected]:outline-2 [&.selected]:outline-[rgb(60,132,244)]",
  image: "editor-image",
  indent: "",
  inlineImage: "inline-editor-image",
  layoutContainer: "grid gap-2.5 mx-0 my-2.5",
  layoutItem: "border px-4 py-2 border-dashed border-[#ddd]",
  list: {
    checklist: "PlaygroundEditorTheme__checklist",
    listitem: "my-0 mx-8",
    listitemChecked:
      "relative mx-2 px-6 outline-none line-through before:border before:bg-[#3d87f5] before:bg-no-repeat before:rounded-sm before:border-solid before:border-[rgb(61,135,245)] after:content-[''] after:cursor-pointer after:absolute after:block after:w-[3px] after:h-1.5 after:rotate-45 after:border-white after:border-solid after:border-[0_2px_2px_0] after:top-1.5 after:inset-x-[7px]",
    listitemUnchecked: "relative mx-2 px-6 outline-none",
    nested: {
      listitem: "PlaygroundEditorTheme__nestedListItem",
    },
    olDepth: [
      "list-outside m-0 p-0",
      "list-[upper-alpha] list-outside m-0 p-0",
      "list-[lower-alpha] list-outside m-0 p-0",
      "list-[upper-roman] list-outside m-0 p-0",
      "list-[lower-roman] list-outside m-0 p-0",
    ],
    ul: "list-disc list-inside outside m-0 p-0",
  },

  ltr: "text-left",
  rtl: "text-right",
  paragraph: "m-0 relative",
  quote:
    "m-0 ml-5 mb-2.5 text-muted-foreground pl-4 border-primary border-0 border-l-1",
  link: "no-underline text-primary hover:underline hover:cursor-pointer",
  mark: "pb-0.5 border-b-2 border-b-[rgba(255,212,0,0.3)] border-solid bg-[rgba(255,212,0,0.14)] ",
  markOverlap:
    "border-b-2 border-b-[rgba(255,212,0,0.7)] border-solid bg-[rgba(255,212,0,0.3)]",

  table:
    "border-spacing-0 overflow-scroll table-fixed w-fit mt-0 ml-4 mb-4 mr-0",
  tableCell:
    "relative outline-none px-1.5 py-2 text-start align-top w-[75px] border border-black",
  tableCellActionButton:
    "bg-[#eee] block w-5 h-5 text-[#222] cursor-pointer rounded-[20px] border-0 hover:bg-[#ddd]",
  tableCellActionButtonContainer:
    "block absolute z-[4] w-5 h-5 right-[5px] top-1.5",
  tableCellEditing: "shadow-[0 0 5px rgba(0,0,0,0.4)] rounded-[3px]",
  tableCellHeader: "bg-muted text-start",
  tableCellPrimarySelected:
    "block h-[calc(100%_-_2px)] absolute w-[calc(100%_-_2px)] z-[2] border-2 border-solid border-[rgb(60,132,244)] -left-px -top-px",
  tableCellResizer: "absolute h-full w-2 cursor-ew-resize z-10 -right-1 top-0",
  tableCellSelected: "bg-[#c9dbf0]",
  tableCellSortedIndicator:
    "block opacity-50 absolute b-0 l-0 w-full h-1 bg-muted",
  tableResizeRuler: "block absolute w-px bg-[rgb(60,132,244)] h-full top-0",
  tableRowStriping: "even:bg-muted",
  tableSelected: "outline outline-2 outline-primary",
  tableSelection: "bg-transparent",

  text: {
    bold: "font-bold",
    code: "bg-[rgb(240,242,245)] text-95 px-1 py-1 font-mono",
    italic: "italic",
    strikethrough: "line-through",
    subscript: "align-sub text-sm",
    superscript: "align-super text-sm",
    underline: "underline",
    underlineStrikethrough: "[text-decoration-line:underline_line-through]",
  },
};

export default theme;
