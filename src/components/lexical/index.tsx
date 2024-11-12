/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/facebook/lexical/blob/main/LICENSE
 *
 */

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { CheckListPlugin } from "@lexical/react/LexicalCheckListPlugin";
import { ClearEditorPlugin } from "@lexical/react/LexicalClearEditorPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import { useLexicalEditable } from "@lexical/react/useLexicalEditable";
import * as React from "react";
import { useEffect, useState } from "react";

import { useSharedHistoryContext } from "./SharedHistoryContext";
// import CodeActionMenuPlugin from "./plugins/CodeActionMenuPlugin";
// import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin";
// import CollapsiblePlugin from "./plugins/CollapsiblePlugin";
// import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin";
// import DragDropPaste from "./plugins/DragDropPastePlugin";
// import DraggableBlockPlugin from "./plugins/DraggableBlockPlugin";
// import EmojiPickerPlugin from "./plugins/EmojiPickerPlugin";
// import EmojisPlugin from "./plugins/EmojisPlugin";
// import EquationsPlugin from "./plugins/EquationsPlugin";
// import InlineImagePlugin from "./plugins/InlineImagePlugin";

// import ActionsPlugin from "./plugins/ActionsPlugin";
// import AutocompletePlugin from "./plugins/AutocompletePlugin";
import AutoLinkPlugin from "./plugins/AutoLink";
// import ContextMenuPlugin from "./plugins/ContextMenuPlugin";
// import ImagesPlugin from "./plugins/ImagesPlugin";
// import LinkPlugin from "./plugins/LinkPlugin";
// import MentionsPlugin from "./plugins/MentionsPlugin";
import AutoEmbedPlugin from "./plugins/AutoEmbed";
import ToolbarPlugin from "./plugins/Toolbar";

import ContentEditable from "./ui/ContentEditable";

const Editor: React.FC = () => {
  const { historyState } = useSharedHistoryContext();

  const isEditable = useLexicalEditable();

  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        typeof window !== "undefined" &&
        typeof window.document !== "undefined" &&
        typeof window.document.createElement !== "undefined" &&
        window.matchMedia("(max-width: 1025px)").matches;

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport);
      }
    };
    updateViewPortWidth();
    window.addEventListener("resize", updateViewPortWidth);

    return () => {
      window.removeEventListener("resize", updateViewPortWidth);
    };
  }, [isSmallWidthViewport]);

  return (
    <>
      <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
      <div className="editor-container tree-view">
        {/* <DragDropPaste /> */}
        <AutoFocusPlugin />
        <ClearEditorPlugin />
        {/* <ComponentPickerPlugin />
        <EmojiPickerPlugin /> */}
        <AutoEmbedPlugin />

        {/* <MentionsPlugin /> */}
        {/* <EmojisPlugin />
        <HashtagPlugin />
        <KeywordsPlugin />
        <SpeechToTextPlugin /> */}
        <AutoLinkPlugin />
        {/* <CommentPlugin
          providerFactory={isCollab ? createWebsocketProvider : undefined}
        /> */}
        <HistoryPlugin externalHistoryState={historyState} />

        <RichTextPlugin
          contentEditable={
            <div className="editor-scroller">
              <div className="editor" ref={onRef}>
                <ContentEditable placeholder={"Enter some rich text here..."} />
              </div>
            </div>
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        {/* <MarkdownShortcutPlugin /> */}
        {/* <CodeHighlightPlugin /> */}
        <ListPlugin />
        <CheckListPlugin />
        {/* <ListMaxIndentLevelPlugin maxDepth={7} /> */}
        <TablePlugin hasCellMerge={true} hasCellBackgroundColor={true} />
        {/* <TableCellResizer /> */}
        {/* <TableHoverActionsPlugin /> */}
        {/* <ImagesPlugin /> */}
        {/* <InlineImagePlugin /> */}
        {/* <LinkPlugin /> */}
        {/* <PollPlugin /> */}
        {/* <TwitterPlugin /> */}
        {/* <YouTubePlugin /> */}
        {/* <FigmaPlugin /> */}
        <ClickableLinkPlugin disabled={isEditable} />
        <HorizontalRulePlugin />
        {/* <EquationsPlugin /> */}
        {/* <ExcalidrawPlugin /> */}
        {/* <TabFocusPlugin /> */}
        <TabIndentationPlugin />
        {/* <CollapsiblePlugin /> */}
        {/* <PageBreakPlugin /> */}
        {/* <LayoutPlugin /> */}
        {/* {floatingAnchorElem && !isSmallWidthViewport && (
              <>
                <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                <FloatingLinkEditorPlugin
                  anchorElem={floatingAnchorElem}
                  isLinkEditMode={isLinkEditMode}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
                <TableCellActionMenuPlugin
                  anchorElem={floatingAnchorElem}
                  cellMerge={true}
                />
                <FloatingTextFormatToolbarPlugin
                  anchorElem={floatingAnchorElem}
                  setIsLinkEditMode={setIsLinkEditMode}
                />
              </>
            )} */}

        {/* {(isCharLimit || isCharLimitUtf8) && (
          <CharacterLimitPlugin
            charset={isCharLimit ? "UTF-16" : "UTF-8"}
            maxLength={5}
          />
        )} */}
        {/* <AutocompletePlugin /> */}
        {/* <div>{showTableOfContents && <TableOfContentsPlugin />}</div> */}
        {/* <ContextMenuPlugin /> */}
        {/* <ActionsPlugin
          isRichText={true}
          shouldPreserveNewLinesInMarkdown={true}
        /> */}
      </div>
      {/* {showTreeView && <TreeViewPlugin />} */}
    </>
  );
};

export default Editor;
