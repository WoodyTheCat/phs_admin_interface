import { useAppContext } from "../components/Puck/context";
import { PuckConfig, UserGenerics } from "../types";

export const usePuck = <UserConfig extends PuckConfig = PuckConfig>() => {
  const {
    state: appState,
    config,
    history,
    dispatch,
    selectedItem: currentItem,
    getPermissions,
    refreshPermissions,
  } = useAppContext<UserConfig>();

  return {
    appState,
    config,
    dispatch,
    getPermissions,
    refreshPermissions,
    history: {
      back: history.back!,
      forward: history.forward!,
      setHistories: history.setHistories!,
      setHistoryIndex: history.setHistoryIndex!,
      hasPast: history.historyStore!.hasPast,
      hasFuture: history.historyStore!.hasFuture,
      histories: history.historyStore!.histories,
      index: history.historyStore!.index,
      historyStore: history.historyStore,
    },
    selectedItem: currentItem || null,
  };
};
