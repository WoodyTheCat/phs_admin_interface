/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found at
 * https://github.com/facebook/lexical/blob/main/LICENSE
 *
 */

import {
  AutoEmbedOption,
  EmbedConfig,
  EmbedMatchResult,
  LexicalAutoEmbedPlugin,
  URL_MATCHER,
} from "@lexical/react/LexicalAutoEmbedPlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useMemo, useState } from "react";
import * as ReactDOM from "react-dom";

import { Button } from "@/components/ui/button";
import * as Dialog from "@/components/ui/dialog";

// TODO Copy these over
// import { INSERT_FIGMA_COMMAND } from "../FigmaPlugin";
// import { INSERT_TWEET_COMMAND } from "../TwitterPlugin";
// import { INSERT_YOUTUBE_COMMAND } from "../YouTubePlugin";

interface LexicalEmbedConfig extends EmbedConfig {
  // Human readable name of the embeded content e.g. Tweet or Google Map.
  contentName: string;

  // Icon for display.
  icon?: JSX.Element;

  // An example of a matching url https://twitter.com/jack/status/20
  exampleUrl: string;

  // For extra searching.
  keywords: Array<string>;

  // Embed a Figma Project.
  description?: string;
}

// export const YoutubeEmbedConfig: LexicalEmbedConfig = {
//   contentName: "Youtube Video",

//   exampleUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",

//   // Icon for display.
//   icon: <i className="icon youtube" />,

//   insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
//     editor.dispatchCommand(INSERT_YOUTUBE_COMMAND, result.id);
//   },

//   keywords: ["youtube", "video"],

//   // Determine if a given URL is a match and return url data.
//   parseUrl: async (url: string) => {
//     const match =
//       /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/.exec(url);

//     const id = match ? (match?.[2].length === 11 ? match[2] : null) : null;

//     if (id != null) {
//       return {
//         id,
//         url,
//       };
//     }

//     return null;
//   },

//   type: "youtube-video",
// };

// export const TwitterEmbedConfig: LexicalEmbedConfig = {
//   // e.g. Tweet or Google Map.
//   contentName: "Tweet",

//   exampleUrl: "https://twitter.com/jack/status/20",

//   // Icon for display.
//   icon: <i className="icon tweet" />,

//   // Create the Lexical embed node from the url data.
//   insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
//     editor.dispatchCommand(INSERT_TWEET_COMMAND, result.id);
//   },

//   // For extra searching.
//   keywords: ["tweet", "twitter"],

//   // Determine if a given URL is a match and return url data.
//   parseUrl: (text: string) => {
//     const match =
//       /^https:\/\/(twitter|x)\.com\/(#!\/)?(\w+)\/status(es)*\/(\d+)/.exec(
//         text,
//       );

//     if (match != null) {
//       return {
//         id: match[5],
//         url: match[1],
//       };
//     }

//     return null;
//   },

//   type: "tweet",
// };

// export const FigmaEmbedConfig: LexicalEmbedConfig = {
//   contentName: "Figma Document",

//   exampleUrl: "https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File",

//   icon: <i className="icon figma" />,

//   insertNode: (editor: LexicalEditor, result: EmbedMatchResult) => {
//     editor.dispatchCommand(INSERT_FIGMA_COMMAND, result.id);
//   },

//   keywords: ["figma", "figma.com", "mock-up"],

//   // Determine if a given URL is a match and return url data.
//   parseUrl: (text: string) => {
//     const match =
//       /https:\/\/([\w.-]+\.)?figma.com\/(file|proto)\/([0-9a-zA-Z]{22,128})(?:\/.*)?$/.exec(
//         text,
//       );

//     if (match != null) {
//       return {
//         id: match[3],
//         url: match[0],
//       };
//     }

//     return null;
//   },

//   type: "figma",
// };

export const EmbedConfigs: LexicalEmbedConfig[] = [
  // TwitterEmbedConfig,
  // YoutubeEmbedConfig,
  // FigmaEmbedConfig,
];

function AutoEmbedMenuItem({
  index,
  isSelected,
  onClick,
  onMouseEnter,
  option,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: AutoEmbedOption;
}) {
  let className = "item";
  if (isSelected) {
    className += " selected";
  }
  return (
    <li
      key={option.key}
      tabIndex={-1}
      className={className}
      ref={option.setRefElement}
      role="option"
      aria-selected={isSelected}
      id={"typeahead-item-" + index}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
    >
      <span className="text">{option.title}</span>
    </li>
  );
}

function AutoEmbedMenu({
  options,
  selectedItemIndex,
  onOptionClick,
  onOptionMouseEnter,
}: {
  selectedItemIndex: number | null;
  onOptionClick: (option: AutoEmbedOption, index: number) => void;
  onOptionMouseEnter: (index: number) => void;
  options: Array<AutoEmbedOption>;
}) {
  return (
    <div className="typeahead-popover">
      <ul>
        {options.map((option: AutoEmbedOption, i: number) => (
          <AutoEmbedMenuItem
            index={i}
            isSelected={selectedItemIndex === i}
            onClick={() => onOptionClick(option, i)}
            onMouseEnter={() => onOptionMouseEnter(i)}
            key={option.key}
            option={option}
          />
        ))}
      </ul>
    </div>
  );
}

const debounce = (callback: (text: string) => void, delay: number) => {
  let timeoutId: number;
  return (text: string) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => {
      callback(text);
    }, delay);
  };
};

export function AutoEmbedDialog({
  embedConfig,
  onOpenChange,
}: {
  embedConfig: LexicalEmbedConfig | null;
  onOpenChange: (now: boolean) => void;
}): JSX.Element {
  const [text, setText] = useState("");
  const [editor] = useLexicalComposerContext();
  const [embedResult, setEmbedResult] = useState<EmbedMatchResult | null>(null);

  const validateText = useMemo(
    () =>
      debounce((inputText: string) => {
        const urlMatch = URL_MATCHER.exec(inputText);
        if (embedConfig != null && inputText != null && urlMatch != null) {
          Promise.resolve(embedConfig.parseUrl(inputText)).then(
            (parseResult) => {
              setEmbedResult(parseResult);
            },
          );
        } else if (embedResult != null) {
          setEmbedResult(null);
        }
      }, 200),
    [embedConfig, embedResult],
  );

  return (
    <Dialog.Root onOpenChange={onOpenChange} open={embedConfig !== null}>
      <Dialog.Content>
        <Dialog.Title>Embed {embedConfig?.contentName}</Dialog.Title>
        <div className="Input__wrapper">
          <input
            type="text"
            className="Input__input"
            placeholder={embedConfig?.exampleUrl}
            value={text}
            onChange={(e) => {
              const { value } = e.target;
              setText(value);
              validateText(value);
            }}
          />
        </div>
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button
              disabled={!embedResult}
              onClick={() =>
                embedResult != null &&
                embedConfig?.insertNode(editor, embedResult)
              }
            >
              Embed
            </Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  );
}

export default function AutoEmbedPlugin(): JSX.Element {
  const [embedConfig, setEmbedConfig] = useState<LexicalEmbedConfig | null>(
    null,
  );

  // const openEmbedModal = (embedConfig: PlaygroundEmbedConfig) => {
  // showModal(`Embed ${embedConfig.contentName}`, (onClose) => (
  // ));
  // };

  const getMenuOptions = (
    activeEmbedConfig: LexicalEmbedConfig,
    embedFn: () => void,
    dismissFn: () => void,
  ) => {
    return [
      new AutoEmbedOption("Dismiss", {
        onSelect: dismissFn,
      }),
      new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
        onSelect: embedFn,
      }),
    ];
  };

  return (
    <>
      <AutoEmbedDialog
        embedConfig={embedConfig}
        onOpenChange={(now) => now === false && setEmbedConfig(null)}
      />
      <LexicalAutoEmbedPlugin<LexicalEmbedConfig>
        embedConfigs={EmbedConfigs}
        onOpenEmbedModalForConfig={(conf) => setEmbedConfig(conf)}
        getMenuOptions={getMenuOptions}
        menuRenderFn={(
          anchorElementRef,
          {
            selectedIndex,
            options,
            selectOptionAndCleanUp,
            setHighlightedIndex,
          },
        ) =>
          anchorElementRef.current
            ? ReactDOM.createPortal(
                <div
                  className="typeahead-popover auto-embed-menu"
                  style={{
                    marginLeft: `${Math.max(
                      parseFloat(anchorElementRef.current.style.width) - 200,
                      0,
                    )}px`,
                    width: 200,
                  }}
                >
                  <AutoEmbedMenu
                    options={options}
                    selectedItemIndex={selectedIndex}
                    onOptionClick={(option: AutoEmbedOption, index: number) => {
                      setHighlightedIndex(index);
                      selectOptionAndCleanUp(option);
                    }}
                    onOptionMouseEnter={(index: number) => {
                      setHighlightedIndex(index);
                    }}
                  />
                </div>,
                anchorElementRef.current,
              )
            : null
        }
      />
    </>
  );
}
