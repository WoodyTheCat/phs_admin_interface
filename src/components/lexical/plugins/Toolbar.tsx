/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/facebook/lexical/blob/main/LICENSE
 *
 */

import {
  $createCodeNode,
  $isCodeNode,
  CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  CODE_LANGUAGE_MAP,
  getLanguageFriendlyName,
} from "@lexical/code";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isListNode,
  INSERT_CHECK_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  ListNode,
} from "@lexical/list";
import { INSERT_EMBED_COMMAND } from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $isDecoratorBlockNode } from "@lexical/react/LexicalDecoratorBlockNode";
import { INSERT_HORIZONTAL_RULE_COMMAND } from "@lexical/react/LexicalHorizontalRuleNode";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode,
  $isQuoteNode,
  HeadingTagType,
} from "@lexical/rich-text";
import {
  $getSelectionStyleValueForProperty,
  $isParentElementRTL,
  $patchStyleText,
  $setBlocksType,
} from "@lexical/selection";
import { $isTableNode, $isTableSelection } from "@lexical/table";
import {
  $findMatchingParent,
  $getNearestBlockElementAncestorOrThrow,
  $getNearestNodeOfType,
  $isEditorIsNestedEditor,
  mergeRegister,
} from "@lexical/utils";
import {
  $createParagraphNode,
  $getNodeByKey,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isRootOrShadowRoot,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  COMMAND_PRIORITY_CRITICAL,
  COMMAND_PRIORITY_NORMAL,
  ElementFormatType,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  INDENT_CONTENT_COMMAND,
  KEY_MODIFIER_COMMAND,
  LexicalEditor,
  NodeKey,
  OUTDENT_CONTENT_COMMAND,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from "lexical";
import { Dispatch, useCallback, useEffect, useState } from "react";
import { IS_APPLE, SUPER } from "../environment";

import * as Dialog from "@/components/ui/dialog";
import * as Dropdown from "@/components/ui/dropdown-menu";

import * as React from "react";
// import DropdownColorPicker from "../../ui/DropdownColorPicker";
import { getSelectedNode } from "../utils";
import { sanitizeUrl } from "../utils";
import { EmbedConfigs } from "./AutoEmbed";
// import { INSERT_COLLAPSIBLE_COMMAND } from "../CollapsiblePlugin";
// import { InsertEquationDialog } from "../EquationsPlugin";
// import { INSERT_EXCALIDRAW_COMMAND } from "../ExcalidrawPlugin";
import { InsertImageDialog } from "./Images";
// import { InsertInlineImageDialog } from "../InlineImagePlugin";
// import InsertLayoutDialog from "../LayoutPlugin/InsertLayoutDialog";
// import { INSERT_PAGE_BREAK } from "../PageBreakPlugin";
// import { InsertPollDialog } from "../PollPlugin";
import { InsertTableDialog } from "./Table";
import FontSize from "./fontSize.temp";

import * as Lucide from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const blockTypeToBlockName = {
  bullet: "Bulleted List",
  check: "Check List",
  code: "Code Block",
  h1: "Heading 1",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  h5: "Heading 5",
  h6: "Heading 6",
  number: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
};

const blockTypeToIcon: {
  [key in keyof typeof blockTypeToBlockName]: React.ForwardRefExoticComponent<
    Omit<Lucide.LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
  >;
} = {
  bullet: Lucide.List,
  check: Lucide.ListChecks,
  code: Lucide.CodeXml,
  h1: Lucide.Heading1,
  h2: Lucide.Heading2,
  h3: Lucide.Heading3,
  h4: Lucide.Heading4,
  h5: Lucide.Heading5,
  h6: Lucide.Heading6,
  number: Lucide.ListOrdered,
  paragraph: Lucide.Pilcrow,
  quote: Lucide.Quote,
};

const rootTypeToRootName = {
  root: "Root",
  table: "Table",
};

function getCodeLanguageOptions(): [string, string][] {
  const options: [string, string][] = [];

  for (const [lang, friendlyName] of Object.entries(
    CODE_LANGUAGE_FRIENDLY_NAME_MAP,
  )) {
    options.push([lang, friendlyName]);
  }

  return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

const ELEMENT_FORMAT_OPTIONS: {
  [key in Exclude<ElementFormatType, "">]: {
    icon: React.ForwardRefExoticComponent<
      Omit<Lucide.LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
    >;
    name: string;
  };
} = {
  start: {
    icon: Lucide.AlignLeft,
    name: "Start Align",
  },
  left: {
    icon: Lucide.AlignLeft,
    name: "Left Align",
  },
  center: {
    icon: Lucide.AlignCenter,
    name: "Center Align",
  },
  right: {
    icon: Lucide.AlignRight,
    name: "Right Align",
  },
  end: {
    icon: Lucide.AlignLeft,
    name: "End Align",
  },
  justify: {
    icon: Lucide.AlignJustify,
    name: "Justify Align",
  },
};

function BlockFormatDropDown({
  editor,
  blockType,
  rootType,
  disabled = false,
}: {
  blockType: keyof typeof blockTypeToBlockName;
  rootType: keyof typeof rootTypeToRootName;
  editor: LexicalEditor;
  disabled?: boolean;
}): JSX.Element {
  const formatParagraph = () => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        $setBlocksType(selection, () => $createParagraphNode());
      }
    });
  };

  const formatHeading = (headingSize: HeadingTagType) => {
    if (blockType !== headingSize) {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createHeadingNode(headingSize));
      });
    }
  };

  const formatBulletList = () => {
    if (blockType !== "bullet") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatCheckList = () => {
    if (blockType !== "check") {
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatNumberedList = () => {
    if (blockType !== "number") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      formatParagraph();
    }
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createQuoteNode());
      });
    }
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        let selection = $getSelection();

        if (selection !== null) {
          if (selection.isCollapsed()) {
            $setBlocksType(selection, () => $createCodeNode());
          } else {
            const textContent = selection.getTextContent();
            const codeNode = $createCodeNode();
            selection.insertNodes([codeNode]);
            selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.insertRawText(textContent);
            }
          }
        }
      });
    }
  };

  // TODO: Replace with a shadcn select
  return (
    <Dropdown.Menu>
      <Dropdown.MenuTrigger
        className="inline-flex items-center px-1 font-normal"
        aria-label="Formatting options for text style"
        disabled={disabled}
      >
        {React.createElement(blockTypeToIcon[blockType], {
          size: 18,
          className: "mr-1.5",
        })}
        {blockTypeToBlockName[blockType]}
      </Dropdown.MenuTrigger>
      <Dropdown.MenuContent>
        <Dropdown.MenuItem
          className={blockType === "paragraph" ? "" : "text-muted-foreground"}
          onClick={formatParagraph}
        >
          <Lucide.Pilcrow size={18} className="mr-1.5" />
          <span>Normal</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "h1" ? "" : "text-muted-foreground"}
          onClick={() => formatHeading("h1")}
        >
          <Lucide.Heading1 size={18} className="mr-1.5" />
          <span>Heading 1</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "h2" ? "" : "text-muted-foreground"}
          onClick={() => formatHeading("h2")}
        >
          <Lucide.Heading2 size={18} className="mr-1.5" />
          <span>Heading 2</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "h3" ? "" : "text-muted-foreground"}
          onClick={() => formatHeading("h3")}
        >
          <Lucide.Heading3 size={18} className="mr-1.5" />
          <span>Heading 3</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "bullet" ? "" : "text-muted-foreground"}
          onClick={formatBulletList}
        >
          <Lucide.List size={18} className="mr-1.5" />
          <span>Bullet List</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "number" ? "" : "text-muted-foreground"}
          onClick={formatNumberedList}
        >
          <Lucide.ListOrdered size={18} className="mr-1.5" />
          <span>Numbered List</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "check" ? "" : "text-muted-foreground"}
          onClick={formatCheckList}
        >
          <Lucide.ListChecks size={18} className="mr-1.5" />
          <span>Check List</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "quote" ? "" : "text-muted-foreground"}
          onClick={formatQuote}
        >
          <Lucide.Quote size={18} className="mr-1.5" />
          <span>Quote</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          className={blockType === "code" ? "" : "text-muted-foreground"}
          onClick={formatCode}
        >
          <Lucide.CodeXml size={18} className="mr-1.5" />
          <span>Code Block</span>
        </Dropdown.MenuItem>
      </Dropdown.MenuContent>
    </Dropdown.Menu>
  );
}

function ElementFormatDropdown({
  editor,
  value,
  disabled,
}: {
  editor: LexicalEditor;
  value: ElementFormatType;
  isRTL: boolean;
  disabled: boolean;
}) {
  const formatOption = ELEMENT_FORMAT_OPTIONS[value || "left"];

  // TODO: Replace with a shadcn select
  return (
    <Dropdown.Menu>
      <Dropdown.MenuTrigger
        aria-label="Formatting options for text alignment"
        disabled={disabled}
      >
        {React.createElement(formatOption.icon, { size: 18 })}
      </Dropdown.MenuTrigger>
      <Dropdown.MenuContent>
        <Dropdown.MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
          }}
        >
          <Lucide.AlignLeft size={18} className="mr-1.5" />
          <span>Left Align</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
          }}
        >
          <Lucide.AlignCenter size={18} className="mr-1.5" />
          <span>Center Align</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
          }}
        >
          <Lucide.AlignRight size={18} className="mr-1.5" />
          <span>Right Align</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          onClick={() => {
            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
          }}
        >
          <Lucide.AlignJustify size={18} className="mr-1.5" />
          <span>Justify Align</span>
        </Dropdown.MenuItem>

        <Dropdown.MenuSeparator />

        <Dropdown.MenuItem
          onClick={() => {
            editor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined);
          }}
        >
          <Lucide.IndentDecrease size={18} className="mr-1.5" />
          <span>Outdent</span>
        </Dropdown.MenuItem>
        <Dropdown.MenuItem
          onClick={() => {
            editor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined);
          }}
        >
          <Lucide.IndentIncrease size={18} className="mr-1.5" />
          <span>Indent</span>
        </Dropdown.MenuItem>
      </Dropdown.MenuContent>
    </Dropdown.Menu>
  );
}

export default function ToolbarPlugin({
  setIsLinkEditMode,
}: {
  setIsLinkEditMode: Dispatch<boolean>;
}): JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [activeEditor, setActiveEditor] = useState(editor);
  const [blockType, setBlockType] =
    useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [rootType, setRootType] =
    useState<keyof typeof rootTypeToRootName>("root");
  const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(
    null,
  );
  const [fontSize, setFontSize] = useState<string>("15px");
  const [fontColor, setFontColor] = useState<string>("#000");
  const [bgColor, setBgColor] = useState<string>("#fff");
  const [elementFormat, setElementFormat] = useState<ElementFormatType>("left");
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isSubscript, setIsSubscript] = useState(false);
  const [isSuperscript, setIsSuperscript] = useState(false);
  const [isCode, setIsCode] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const [isRTL, setIsRTL] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState<string>("");
  const [isEditable, setIsEditable] = useState(() => editor.isEditable());
  const [isImageCaption, setIsImageCaption] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      if (activeEditor !== editor && $isEditorIsNestedEditor(activeEditor)) {
        const rootElement = activeEditor.getRootElement();
        setIsImageCaption(
          !!rootElement?.parentElement?.classList.contains(
            "image-caption-container",
          ),
        );
      } else {
        setIsImageCaption(false);
      }

      const anchorNode = selection.anchor.getNode();
      let element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : $findMatchingParent(anchorNode, (e) => {
              const parent = e.getParent();
              return parent !== null && $isRootOrShadowRoot(parent);
            });

      if (element === null) {
        element = anchorNode.getTopLevelElementOrThrow();
      }

      const elementKey = element.getKey();
      const elementDOM = activeEditor.getElementByKey(elementKey);

      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }

      const tableNode = $findMatchingParent(node, $isTableNode);
      if ($isTableNode(tableNode)) {
        setRootType("table");
      } else {
        setRootType("root");
      }

      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType<ListNode>(
            anchorNode,
            ListNode,
          );
          const type = parentList
            ? parentList.getListType()
            : element.getListType();
          setBlockType(type);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          if (type in blockTypeToBlockName) {
            setBlockType(type as keyof typeof blockTypeToBlockName);
          }
          if ($isCodeNode(element)) {
            const language =
              element.getLanguage() as keyof typeof CODE_LANGUAGE_MAP;
            setCodeLanguage(
              language ? CODE_LANGUAGE_MAP[language] || language : "",
            );
            return;
          }
        }
      }
      // Handle buttons
      setFontColor(
        $getSelectionStyleValueForProperty(selection, "color", "#000"),
      );
      setBgColor(
        $getSelectionStyleValueForProperty(
          selection,
          "background-color",
          "#fff",
        ),
      );

      let matchingParent;
      if ($isLinkNode(parent)) {
        // If node is a link, we need to fetch the parent paragraph node to set format
        matchingParent = $findMatchingParent(
          node,
          (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
        );
      }

      // If matchingParent is a valid node, pass it's format type
      setElementFormat(
        $isElementNode(matchingParent)
          ? matchingParent.getFormatType()
          : $isElementNode(node)
            ? node.getFormatType()
            : parent?.getFormatType() || "left",
      );
    }
    if ($isRangeSelection(selection) || $isTableSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsSubscript(selection.hasFormat("subscript"));
      setIsSuperscript(selection.hasFormat("superscript"));
      setIsCode(selection.hasFormat("code"));

      setFontSize(
        $getSelectionStyleValueForProperty(selection, "font-size", "15px"),
      );
    }
  }, [activeEditor, editor]);

  useEffect(() => {
    return editor.registerCommand(
      SELECTION_CHANGE_COMMAND,
      (_payload, newEditor) => {
        setActiveEditor(newEditor);
        $updateToolbar();
        return false;
      },
      COMMAND_PRIORITY_CRITICAL,
    );
  }, [editor, $updateToolbar]);

  useEffect(() => {
    activeEditor.getEditorState().read(() => {
      $updateToolbar();
    });
  }, [activeEditor, $updateToolbar]);

  useEffect(() => {
    return mergeRegister(
      editor.registerEditableListener((editable) => {
        setIsEditable(editable);
      }),
      activeEditor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      activeEditor.registerCommand<boolean>(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
      activeEditor.registerCommand<boolean>(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        COMMAND_PRIORITY_CRITICAL,
      ),
    );
  }, [$updateToolbar, activeEditor, editor]);

  useEffect(() => {
    return activeEditor.registerCommand(
      KEY_MODIFIER_COMMAND,
      (payload) => {
        const event: KeyboardEvent = payload;
        const { code, ctrlKey, metaKey } = event;

        if (code === "KeyK" && (ctrlKey || metaKey)) {
          event.preventDefault();
          let url: string | null;
          if (!isLink) {
            setIsLinkEditMode(true);
            url = sanitizeUrl("https://");
          } else {
            setIsLinkEditMode(false);
            url = null;
          }
          return activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
        }
        return false;
      },
      COMMAND_PRIORITY_NORMAL,
    );
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const applyStyleText = useCallback(
    (styles: Record<string, string>, skipHistoryStack?: boolean) => {
      activeEditor.update(
        () => {
          const selection = $getSelection();
          if (selection !== null) {
            $patchStyleText(selection, styles);
          }
        },
        skipHistoryStack ? { tag: "historic" } : {},
      );
    },
    [activeEditor],
  );

  const clearFormatting = useCallback(() => {
    activeEditor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection) || $isTableSelection(selection)) {
        const anchor = selection.anchor;
        const focus = selection.focus;
        const nodes = selection.getNodes();
        const extractedNodes = selection.extract();

        if (anchor.key === focus.key && anchor.offset === focus.offset) {
          return;
        }

        nodes.forEach((node, idx) => {
          // We split the first and last node by the selection
          // So that we don't format unselected text inside those nodes
          if ($isTextNode(node)) {
            // Use a separate variable to ensure TS does not lose the refinement
            let textNode = node;
            if (idx === 0 && anchor.offset !== 0) {
              textNode = textNode.splitText(anchor.offset)[1] || textNode;
            }
            if (idx === nodes.length - 1) {
              textNode = textNode.splitText(focus.offset)[0] || textNode;
            }
            /**
             * If the selected text has one format applied
             * selecting a portion of the text, could
             * clear the format to the wrong portion of the text.
             *
             * The cleared text is based on the length of the selected text.
             */
            // We need this in case the selected text only has one format
            const extractedTextNode = extractedNodes[0];
            if (nodes.length === 1 && $isTextNode(extractedTextNode)) {
              textNode = extractedTextNode;
            }

            if (textNode.__style !== "") {
              textNode.setStyle("");
            }
            if (textNode.__format !== 0) {
              textNode.setFormat(0);
              $getNearestBlockElementAncestorOrThrow(textNode).setFormat("");
            }
            node = textNode;
          } else if ($isHeadingNode(node) || $isQuoteNode(node)) {
            node.replace($createParagraphNode(), true);
          } else if ($isDecoratorBlockNode(node)) {
            node.setFormat("");
          }
        });
      }
    });
  }, [activeEditor]);

  const onFontColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ color: value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const onBgColorSelect = useCallback(
    (value: string, skipHistoryStack: boolean) => {
      applyStyleText({ "background-color": value }, skipHistoryStack);
    },
    [applyStyleText],
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      setIsLinkEditMode(true);
      activeEditor.dispatchCommand(
        TOGGLE_LINK_COMMAND,
        sanitizeUrl("https://"),
      );
    } else {
      setIsLinkEditMode(false);
      activeEditor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [activeEditor, isLink, setIsLinkEditMode]);

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      activeEditor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(value);
          }
        }
      });
    },
    [activeEditor, selectedElementKey],
  );

  const canViewerSeeInsertDropdown = !isImageCaption;
  const canViewerSeeInsertCodeButton = !isImageCaption;

  return (
    <div className="w-full p-2 border-b">
      <div className="flex space-x-2 justify-center h-8">
        <Button
          variant="ghost-icon"
          size="icon"
          disabled={!canUndo || !isEditable}
          aria-label="Undo"
          title={IS_APPLE ? "Undo (⌘Z)" : "Undo (Ctrl+Z)"}
          onClick={() => {
            activeEditor.dispatchCommand(UNDO_COMMAND, undefined);
          }}
        >
          <Lucide.RotateCcw size={18} />
        </Button>

        <Button
          variant="ghost-icon"
          size="icon"
          disabled={!canRedo || !isEditable}
          aria-label="Redo"
          title={IS_APPLE ? "Redo (⇧⌘Z)" : "Redo (Ctrl+Y)"}
          onClick={() => {
            activeEditor.dispatchCommand(REDO_COMMAND, undefined);
          }}
        >
          <Lucide.RotateCw size={18} />
        </Button>

        <Separator orientation="vertical" />

        {blockType in blockTypeToBlockName && activeEditor === editor && (
          <BlockFormatDropDown
            disabled={!isEditable}
            blockType={blockType}
            rootType={rootType}
            editor={activeEditor}
          />
        )}
        {blockType === "code" ? (
          <>
            <Separator orientation="vertical" />
            <Dropdown.Menu>
              <Dropdown.MenuTrigger
                disabled={!isEditable}
                aria-label="Select language"
                className="min-w-[30px]"
              >
                {getLanguageFriendlyName(codeLanguage)}
              </Dropdown.MenuTrigger>
              <Dropdown.MenuContent>
                {CODE_LANGUAGE_OPTIONS.map(([value, name]) => (
                  <Dropdown.MenuItem
                    className={`item ${
                      value === codeLanguage ? "" : "text-muted-foreground"
                    }`}
                    onClick={() => onCodeLanguageSelect(value)}
                    key={value}
                  >
                    <span>{name}</span>
                  </Dropdown.MenuItem>
                ))}
              </Dropdown.MenuContent>
            </Dropdown.Menu>
          </>
        ) : (
          <>
            <Separator orientation="vertical" />

            <FontSize
              selectionFontSize={fontSize.slice(0, -2)}
              editor={activeEditor}
              disabled={!isEditable}
            />

            <Separator orientation="vertical" />

            {/* <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting text color"
            color={fontColor}
            onChange={onFontColorSelect}
            title="text color"
          />
          <DropdownColorPicker
            disabled={!isEditable}
            buttonClassName="toolbar-item color-picker"
            buttonAriaLabel="Formatting background color"
            color={bgColor}
            onChange={onBgColorSelect}
            title="bg color"
          /> */}

            <Toggle
              pressed={isBold}
              size="sm"
              disabled={!isEditable}
              title={`Bold (${SUPER}B)`}
              aria-label={`Format text as bold. Shortcut: ${SUPER}B`}
              onPressedChange={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
              }}
            >
              <Lucide.Bold size={18} />
            </Toggle>

            <Toggle
              pressed={isItalic}
              size="sm"
              disabled={!isEditable}
              title={`Italic (${SUPER}I)`}
              aria-label={`Format text as italics. Shortcut: ${SUPER}I`}
              onPressedChange={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
              }}
            >
              <Lucide.Italic size={18} />
            </Toggle>

            <Toggle
              pressed={isUnderline}
              size="sm"
              disabled={!isEditable}
              title={`Underline (${SUPER}U)`}
              aria-label={`Format text to underlined. Shortcut: ${SUPER}U`}
              onPressedChange={() => {
                activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
              }}
            >
              <Lucide.Underline size={18} />
            </Toggle>

            {canViewerSeeInsertCodeButton && (
              <Toggle
                pressed={isCode}
                size="sm"
                disabled={!isEditable}
                title="Toggle inline code"
                aria-label="Format text as code"
                onPressedChange={() => {
                  activeEditor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
                }}
              >
                <Lucide.CodeXml size={18} />
              </Toggle>
            )}

            <Toggle
              pressed={isLink}
              size="sm"
              disabled={!isEditable}
              aria-label="Insert link"
              title="Insert link"
              onPressedChange={insertLink}
            >
              <Lucide.Link size={18} />
            </Toggle>

            <Button
              variant="ghost-icon"
              size="icon"
              title="Clear text formatting"
              aria-label="Clear all text formatting"
              onClick={clearFormatting}
            >
              <Lucide.Eraser size={18} />
            </Button>

            <Dropdown.Menu>
              <Dropdown.MenuTrigger
                disabled={!isEditable}
                aria-label="Formatting options for additional text styles"
              >
                <Lucide.ChevronDown size={18} />
              </Dropdown.MenuTrigger>
              <Dropdown.MenuContent className="[&>div>svg]:mr-1.5">
                <Dropdown.MenuItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      "strikethrough",
                    );
                  }}
                  className={isStrikethrough ? "" : "text-muted-foreground"}
                  title="Strikethrough"
                  aria-label="Format text with a strikethrough"
                >
                  <Lucide.Strikethrough size={18} />
                  <span>Strikethrough</span>
                </Dropdown.MenuItem>
                <Dropdown.MenuItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      "subscript",
                    );
                  }}
                  className={isSubscript ? "" : "text-muted-foreground"}
                  title="Subscript"
                  aria-label="Format text with a subscript"
                >
                  <Lucide.Subscript size={18} />
                  <span>Subscript</span>
                </Dropdown.MenuItem>
                <Dropdown.MenuItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      FORMAT_TEXT_COMMAND,
                      "superscript",
                    );
                  }}
                  className={isSuperscript ? "" : "text-muted-foreground"}
                  title="Superscript"
                  aria-label="Format text with a superscript"
                >
                  <Lucide.Superscript size={18} />
                  <span>Superscript</span>
                </Dropdown.MenuItem>
              </Dropdown.MenuContent>
            </Dropdown.Menu>
            {canViewerSeeInsertDropdown && (
              <>
                <Separator orientation="vertical" />
                <Dropdown.Menu>
                  <Dropdown.MenuTrigger
                    aria-label="Insert a specialised element"
                    disabled={!isEditable}
                  >
                    <Lucide.Plus size={18} />
                  </Dropdown.MenuTrigger>
                  <Dropdown.MenuContent className="[&>div>svg]:mr-1.5">
                    <Dropdown.MenuItem
                      onClick={() => {
                        activeEditor.dispatchCommand(
                          INSERT_HORIZONTAL_RULE_COMMAND,
                          undefined,
                        );
                      }}
                    >
                      <Lucide.SquareSplitVertical size={18} />
                      <span>Horizontal Rule</span>
                    </Dropdown.MenuItem>

                    <Dialog.DropdownItem
                      triggerChildren={
                        <>
                          <Lucide.Image size={18} />
                          <span>Image</span>
                        </>
                      }
                    >
                      <InsertImageDialog activeEditor={activeEditor} />
                    </Dialog.DropdownItem>

                    {/* <DropDownItem
                  onClick={() => {
                    showModal("Insert Inline Image", (onClose) => (
                      <InsertInlineImageDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}

                >
                  <i className="icon image" />
                  <span>Inline Image</span>
                </DropDownItem> */}
                    {/* <DropDownItem
                  onClick={() =>
                    insertGifOnClick({
                      altText: "Cat typing on a laptop",
                      src: catTypingGif,
                    })
                  }

                >
                  <i className="icon gif" />
                  <span>GIF</span>
                </DropDownItem> */}
                    {/* <DropDownItem
                  onClick={() => {
                    activeEditor.dispatchCommand(
                      INSERT_EXCALIDRAW_COMMAND,
                      undefined,
                    );
                  }}

                >
                  <i className="icon diagram-2" />
                  <span>Excalidraw</span>
                </DropDownItem> */}
                    <Dialog.DropdownItem
                      triggerChildren={
                        <>
                          <Lucide.Table size={18} />
                          <span>Table</span>
                        </>
                      }
                    >
                      <InsertTableDialog activeEditor={activeEditor} />
                    </Dialog.DropdownItem>

                    {/* <DropDownItem
                  onClick={() => {
                    showModal("Insert Poll", (onClose) => (
                      <InsertPollDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}

                >
                  <i className="icon poll" />
                  <span>Poll</span>
                </DropDownItem> */}
                    {/* TODO: Reinstate this one */}
                    {/* <Dialog.DropdownItem
                  triggerChildren={
                    <>
                      <i className="icon columns" />
                      <span>Columns Layout</span>
                    </>
                  }
                >
                  <InsertLayoutDialog activeEditor={activeEditor} />
                </Dialog.DropdownItem> */}

                    {/* <DropDownItem
                  onClick={() => {
                    showModal("Insert Equation", (onClose) => (
                      <InsertEquationDialog
                        activeEditor={activeEditor}
                        onClose={onClose}
                      />
                    ));
                  }}

                >
                  <i className="icon equation" />
                  <span>Equation</span>
                </DropDownItem> */}
                    {/* <Dropdown.MenuItem
                  onClick={() => {
                    editor.update(() => {
                      const root = $getRoot();
                      const stickyNode = $createStickyNode(0, 0);
                      root.append(stickyNode);
                    });
                  }}

                >
                  <i className="icon sticky" />
                  <span>Sticky Note</span>
                </Dropdown.MenuItem> */}
                    {/* <Dropdown.MenuItem
                  onClick={() => {
                    editor.dispatchCommand(
                      INSERT_COLLAPSIBLE_COMMAND,
                      undefined,
                    );
                  }}

                >
                  <i className="icon caret-right" />
                  <span>Collapsible container</span>
                </Dropdown.MenuItem> */}
                    {EmbedConfigs.map((embedConfig) => (
                      <Dropdown.MenuItem
                        key={embedConfig.type}
                        onClick={() => {
                          activeEditor.dispatchCommand(
                            INSERT_EMBED_COMMAND,
                            embedConfig.type,
                          );
                        }}
                      >
                        {embedConfig.icon}
                        <span>{embedConfig.contentName}</span>
                      </Dropdown.MenuItem>
                    ))}
                  </Dropdown.MenuContent>
                </Dropdown.Menu>
              </>
            )}
          </>
        )}
        <Separator orientation="vertical" />
        <ElementFormatDropdown
          disabled={!isEditable}
          value={elementFormat}
          editor={activeEditor}
          isRTL={isRTL}
        />
      </div>
    </div>
  );
}
