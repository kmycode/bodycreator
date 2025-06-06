import { ReactClickEvent, ReactKeyDownEvent, ReactTextChangeEvent } from '@renderer/models/types';
import classNames from 'classnames';
import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Overlay } from 'react-overlays';
import { getCarretLineData, replaceCarretLine } from '../utils/carrettextutils';

export interface SuggestItem {
  title: string;
}

export interface SuggestOnChangeData {
  bySuggestion: boolean;
  editingLine?: string;
  editingLineNumber?: number;
  editingLinePosition?: number;
}

export const SuggestableTextInput: React.FC<{
  value?: string;
  onChange?: (
    text: string,
    data: SuggestOnChangeData,
    suggestionCallback: (selection: SuggestItem[]) => void,
  ) => SuggestItem[] | void;
  multiline?: boolean;
  itemFactory?: (item: SuggestItem) => ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inputRef?: React.RefObject<any>;
}> = ({ value, onChange, multiline, itemFactory, inputRef }) => {
  const [suggestion, setSuggestion] = useState([] as SuggestItem[]);
  const [focusedItemIndex, setFocusedItemIndex] = useState(0);
  const [showSuggestion, setShowSuggestion] = useState(true);
  const [placement, setPlacement] = useState('bottom' as 'bottom' | 'top');

  const updatePlacement = useMemo(
    () => () => {
      if (inputRef && inputRef.current) {
        const inputElement = inputRef.current as HTMLElement;
        const elementRect = inputElement.getBoundingClientRect();
        const pageHeight = document.body.clientHeight;

        if (pageHeight - elementRect.y < 350) {
          setPlacement('top');
        } else {
          setPlacement('bottom');
        }
      }
    },
    [setPlacement, inputRef],
  );

  const startSuggestion = useCallback(
    (force?: boolean) => {
      if (suggestion.length === 0 || (!force && document.activeElement !== inputRef?.current)) return;

      updatePlacement();
      setShowSuggestion(true);
      setFocusedItemIndex(-1);
    },
    [inputRef, suggestion, setFocusedItemIndex, updatePlacement],
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
      if (!onChange || !text || !inputRef || !inputRef.current) return;

      const { value, selectionStart } = inputRef.current;
      const newValue = replaceCarretLine(value, selectionStart, text);
      onChange(newValue, { bySuggestion: true }, () => {});

      setShowSuggestion(false);
    },
    [onChange, inputRef],
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

      const { value: text, selectionStart } = ev.currentTarget;
      const editingLine = getCarretLineData(text, selectionStart);

      onChange(text, { bySuggestion: false, ...editingLine }, suggestionCallback);
    },
    [onChange, suggestionCallback],
  );

  const handleBlur = useCallback(() => setShowSuggestion(false), [setShowSuggestion]);

  const handleFocus = useCallback(() => startSuggestion(), [startSuggestion]);

  const handleInputKeyDown = useCallback(
    (ev: ReactKeyDownEvent) => {
      if (!showSuggestion) return;

      const moveDown = (): void => {
        if (showSuggestion && suggestion.length > 0) {
          if (placement === 'bottom' && focusedItemIndex < 0 && (ev.ctrlKey || ev.shiftKey)) {
            return;
          }
          if (placement === 'bottom') {
            if (focusedItemIndex < suggestion.length - 1) {
              setFocusedItemIndex(focusedItemIndex + 1);
            }
            ev.preventDefault();
          } else {
            if (focusedItemIndex >= 0 && focusedItemIndex < suggestion.length - 1) {
              setFocusedItemIndex(focusedItemIndex + 1);
              ev.preventDefault();
            } else if (focusedItemIndex === suggestion.length - 1) {
              setFocusedItemIndex(-1);
              ev.preventDefault();
            }
          }
        }
      };

      const moveUp = (): void => {
        if (showSuggestion && suggestion.length > 0) {
          if (placement === 'top' && focusedItemIndex < 0 && (ev.ctrlKey || ev.shiftKey)) {
            return;
          }
          if (placement === 'bottom') {
            if (focusedItemIndex >= 0) {
              setFocusedItemIndex(focusedItemIndex - 1);
              ev.preventDefault();
            }
          } else {
            if (focusedItemIndex >= 1) {
              setFocusedItemIndex(focusedItemIndex - 1);
            } else if (focusedItemIndex < 0) {
              setFocusedItemIndex(suggestion.length - 1);
            }
            ev.preventDefault();
          }
        }
      };

      switch (ev.key) {
        case 'Escape':
          setShowSuggestion(false);
          ev.preventDefault();
          break;
        case 'ArrowDown':
          moveDown();
          break;
        case 'ArrowUp':
          moveUp();
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
    [showSuggestion, focusedItemIndex, suggestion, selectSuggection, setFocusedItemIndex, placement],
  );

  useEffect(() => {
    startSuggestion();
  }, [startSuggestion]);

  const inputProps = useMemo(() => {
    return {
      ref: inputRef ?? { current: undefined },
      className: 'input',
      value,
      onChange: handleTextChange,
      onBlur: handleBlur,
      onFocus: handleFocus,
      onKeyDown: handleInputKeyDown,
    };
  }, [value, inputRef, handleTextChange, handleBlur, handleInputKeyDown, handleFocus]);

  const input = multiline ? <textarea rows={4} {...inputProps} /> : <input type="text" {...inputProps} />;

  return (
    <div className="suggestable-text-input">
      {input}
      <div className="suggestion">
        <Overlay
          target={inputRef ?? { current: undefined }}
          show={showSuggestion && suggestion.length > 0}
          offset={[0, 0]}
          popperConfig={{ strategy: 'fixed' }}
          placement={placement}
        >
          {({ props }) => (
            <div className="popup__suggestion" {...props}>
              <div style={{ width: `${inputRef?.current?.clientWidth ?? 100}px` }}>
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
