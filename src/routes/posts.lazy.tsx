import { LexicalComposer } from "@lexical/react/LexicalComposer";

import Editor from "@/components/lexical";
import PHSNodes from "@/components/lexical/nodes";

import { createLazyFileRoute } from "@tanstack/react-router";
import React from "react";
import theme from "@/components/lexical/theme";

const PostsPage: React.FC = () => {
  const initialConfig = {
    editorState: undefined,
    namespace: "Post Editor",
    nodes: [...PHSNodes],
    onError: (error: Error) => {
      throw error;
    },
    theme,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* <SharedHistoryContext>
        <TableContext>
          <SharedAutocompleteContext> */}
      {/* <div className="editor-shell"> */}
      <Editor />
      {/* </div> */}
      {/* </SharedAutocompleteContext>
        </TableContext>
      </SharedHistoryContext> */}
    </LexicalComposer>
  );
};

export default PostsPage;

export const Route = createLazyFileRoute("/posts")({
  component: PostsPage,
});
