export const CAN_USE_DOM: boolean =
  typeof window !== "undefined" &&
  typeof window.document !== "undefined" &&
  typeof window.document.createElement !== "undefined";

// FIXME WARN: Using deprecated Navigator.platform
export const IS_APPLE: boolean =
  CAN_USE_DOM && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

export const SUPER: string = IS_APPLE ? "⌘" : "CTRL+";
