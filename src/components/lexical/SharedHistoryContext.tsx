/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/facebook/lexical/blob/main/LICENSE
 *
 */

import type { HistoryState } from "@lexical/react/LexicalHistoryPlugin";

import { createEmptyHistoryState } from "@lexical/react/LexicalHistoryPlugin";
import * as React from "react";
import { createContext, ReactNode, useContext, useMemo } from "react";

type ContextShape = {
  historyState?: HistoryState;
};

const Context: React.Context<ContextShape> = createContext({});

export const SharedHistoryContext: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const historyContext = useMemo(
    () => ({
      historyState: createEmptyHistoryState(),
    }),
    [],
  );
  return <Context.Provider value={historyContext}>{children}</Context.Provider>;
};

export const useSharedHistoryContext = (): ContextShape => {
  return useContext(Context);
};
