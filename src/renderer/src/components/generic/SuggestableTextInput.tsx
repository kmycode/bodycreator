import { ReactClickEvent, ReactKeyDownEvent, ReactTextChangeEvent } from '@renderer/models/types';
import classNames from 'classnames';
import { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Overlay } from 'react-overlays';

export interface SuggestItem {
  title: string;
}

export const SuggestableTextInput: React.FC<{
  value?: string;
  onChange?: (
    text: string,
    bySuggestion: boolean,
    suggestionCallback: (selection: SuggestItem[]) => void,
  ) => SuggestItem[] | void;
  multiline?: boolean;
  itemFactory?: (item: SuggestItem) => ReactNode;
}> = ({ value, onChange, multiline, itemFactory }) => {
  const [suggestion, setSuggestion] = useState([] as SuggestItem[]);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  const startSuggestion = useCallback(
    (force?: boolean) => {
      if (suggestion.length === 0 || (!force && document.activeElement !== inputRef.current)) return;

      setShowSuggestion(true);
      setFocusedItemIndex(0);
    },
    [inputRef, suggestion, setFocusedItemIndex],
  );

  const suggestionCallback = useCallback(
    (selection: SuggestItem[]) => {
      setSuggestion(selection);
      startSuggestion(true);
    },
    [startSuggestion, setSuggestion],
  );

  const selectSuggection = useMemo(
    () => (text: string) => {
      if (!onChange) return;

      onChange(text, true, () => {});
      setShowSuggestion(false);
    },
    [onChange],
  );

  const handleSuggestionClick = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChange) return;

      const {
        dataset: { title: text },
      } = ev.currentTarget;

      selectSuggection(text ?? '');
    },
    [onChange, selectSuggection],
  );

  const handleTextChange = useCallback(
    (ev: ReactTextChangeEvent) => {
      if (!onChange) return;

      const { value: text } = ev.currentTarget;

      onChange(text, false, suggestionCallback);
    },
    [onChange, suggestionCallback],
  );

  const handleBlur = useCallback(() => setShowSuggestion(false), [setShowSuggestion]);

  const handleFocus = useCallback(() => startSuggestion(), [startSuggestion]);

  const handleInputKeyDown = useCallback(
    (ev: ReactKeyDownEvent) => {
      if (!showSuggestion) return;

      switch (ev.key) {
        case 'Escape':
          setShowSuggestion(false);
          ev.preventDefault();
          break;
        case 'ArrowDown':
          if (showSuggestion && suggestion.length > 0) {
            if (focusedItemIndex < suggestion.length - 1) {
              setFocusedItemIndex(focusedItemIndex + 1);
            }
            ev.preventDefault();
          }
          break;
        case 'ArrowUp':
          if (showSuggestion && suggestion.length > 0) {
            if (focusedItemIndex >= 0) {
              setFocusedItemIndex(focusedItemIndex - 1);
            }
            ev.preventDefault();
          }
          break;
        case 'Enter':
          {
            const currentItem = suggestion[focusedItemIndex];
            if (currentItem) {
              selectSuggection(currentItem.title);
              ev.preventDefault();
            }
          }
          break;
      }
    },
    [showSuggestion, focusedItemIndex, suggestion, selectSuggection, setFocusedItemIndex],
  );

  useEffect(() => {
    startSuggestion();
  }, [startSuggestion]);

  const inputProps = useMemo(() => {
    return {
      ref: inputRef,
      className: 'input',
      value,
      onChange: handleTextChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onKeyDown: handleInputKeyDown,
    };
  }, [value, inputRef, handleTextChange, handleBlur, handleInputKeyDown, handleFocus]);

  const input = multiline ? <textarea {...inputProps} /> : <input type="text" {...inputProps} />;

  return (
    <div className="suggestable-text-input">
      {input}
      <div className="suggestion">
        <Overlay
          target={inputRef}
          placement="bottom"
          show={showSuggestion && suggestion.length > 0}
          offset={[0, 0]}
          popperConfig={{ strategy: 'fixed' }}
        >
          {({ props }) => (
            <div className="popup__suggestion" {...props}>
              <div style={{ width: `${inputRef.current?.clientWidth ?? 100}px` }}>
                {suggestion.map((item, index) => (
                  <div
                    key={item.title}
                    data-title={item.title}
                    className={classNames({
                      popup__suggestion__item: true,
                      focused: focusedItemIndex === index,
                    })}
                    onMouseDown={handleSuggestionClick}
                  >
                    {itemFactory ? itemFactory(item) : item.title}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Overlay>
      </div>
    </div>
  );
};
