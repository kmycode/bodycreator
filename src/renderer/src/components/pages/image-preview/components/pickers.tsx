import { ReactClickEvent, ReactMouseEvent } from '@renderer/models/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import classNames from 'classnames';
import {
  SuggestableTextInput,
  SuggestItem,
  SuggestOnChangeData,
} from '../../../generic/SuggestableTextInput';
import { replaceCarretLine } from '../../../utils/carrettextutils';
import StarIcon from '@renderer/assets/icons/picture/star.svg';
import StarFillIcon from '@renderer/assets/icons/picture/star-fill.svg';

export interface SmallTextButtonGroup {
  id: string;
  title: string;
}

export const SmallTextButtonGroupPicker: React.FC<{
  items: SmallTextButtonGroup[];
  multiple?: boolean;
  value?: string;
  onChange?: (selectedType: string) => void;
  values?: string[];
  onChangeValues?: (selectedType: string[]) => void;
}> = ({ items, multiple, value, onChange, values, onChangeValues }) => {
  const handleClick = useCallback(
    (ev: ReactClickEvent) => {
      if (multiple && values) {
        if (!onChangeValues) return;

        const target = ev.currentTarget;
        const className =
          Array.from(target.classList).find((name) =>
            items.map((i) => i.id).includes(name) ? name : false,
          ) ?? 'unknown';

        let newValues;
        if (values.includes(className)) {
          newValues = values.filter((v) => v !== className);
        } else {
          newValues = [...values];
          newValues.push(className);
        }

        onChangeValues(newValues);
      } else if (!multiple) {
        if (!onChange) return;

        const target = ev.currentTarget;
        const className =
          Array.from(target.classList).find((name) =>
            items.map((i) => i.id).includes(name) ? name : false,
          ) ?? 'unknown';

        onChange(className === value ? 'unknown' : className);
      }
    },
    [value, onChange, values, onChangeValues, multiple, items],
  );

  const itemGroups = [] as SmallTextButtonGroup[][];
  for (let i = 0; i < (items.length + 1) / 2; i++) {
    const group = [items[i * 2], items[i * 2 + 1]].filter((item) => item);
    if (group.length > 0) {
      itemGroups.push(group);
    }
  }

  const selected = useCallback(
    (id: string): 'selected' | '' => {
      if (multiple && values) {
        return values.includes(id) ? 'selected' : '';
      } else if (!multiple) {
        return value === id ? 'selected' : '';
      }
      return '';
    },
    [multiple, values, value],
  );

  return (
    <>
      {itemGroups.map((g) => (
        <div key={g[0]?.id + '_g'} className="verticalanglepicker wearoptionpicker">
          {g.map((i) => (
            <button key={i.id} className={`${i.id} ${selected(i.id)}`} onClick={handleClick}>
              {i.title}
            </button>
          ))}
        </div>
      ))}
    </>
  );
};

export interface IconItem {
  id: string;
  numId: number;
  svg: string;
  reverse?: boolean;
  title?: string;
}

export const IconGroupPicker: React.FC<{
  icons: IconItem[];
  value?: string;
  values?: string[];
  onChange?: (selectedId: string) => void;
  onChangeMultiple?: (selectedIds: string[]) => void;
  multiple?: boolean;
}> = ({ icons, value, values, onChange, onChangeMultiple, multiple }) => {
  const handleChange = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChange && !onChangeMultiple) return;

      const target = ev.currentTarget;
      const id = target.dataset['id'];
      if (!id) return;

      const isChecked = value === id;

      if (onChange) {
        onChange(isChecked ? 'unknown' : id);
      }

      if (multiple) {
        const currentValues = values ?? [];
        let newValues;

        if (currentValues.includes(id)) {
          newValues = currentValues.filter((v) => v !== id);
        } else {
          newValues = [...currentValues];
          newValues.push(id);
        }

        if (onChangeMultiple) {
          onChangeMultiple(newValues);
        }
      }
    },
    [value, onChange, onChangeMultiple, values, multiple],
  );

  return (
    <div className="icongrouppicker">
      {icons.map((icon) => (
        <button
          key={icon.id}
          className={classNames({ svgbutton: true, enabled: value === icon.id || values?.includes(icon.id) })}
          data-id={icon.id}
          onClick={handleChange}
        >
          <img
            src={icon.svg}
            className={classNames({
              svgicon: true,
              enabled: value === icon.id || values?.includes(icon.id),
              reverse: icon.reverse,
            })}
          />
          <span className="icongrouppicker__title-tip">{icon.title}</span>
        </button>
      ))}
    </div>
  );
};

export const InputWithPopularSelection: React.FC<{
  value?: string;
  selection?: string[];
  multiline?: boolean;
  onChange?: (value: string) => void;
  name?: string;
  onSuggest?: (name: string, data: SuggestOnChangeData) => SuggestItem[];
}> = ({ value, selection, multiline, onChange, name, onSuggest }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  const handleChange = useCallback(
    (text: string, data: SuggestOnChangeData, suggestionCallback: (selection: SuggestItem[]) => void) => {
      if (!onChange) return;

      onChange(text);
      if (name && onSuggest) {
        const suggestion = onSuggest(name, data);
        suggestionCallback(suggestion);
      }
    },
    [onChange, name, onSuggest],
  );

  const handleSelectionClick = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChange || !inputRef.current) return;

      const { value, selectionStart } = inputRef.current as HTMLInputElement | HTMLTextAreaElement;
      const text = ev.currentTarget.dataset['key'];
      if (!text) return;

      const newText = replaceCarretLine(value, selectionStart, text);

      onChange(newText);
    },
    [onChange, inputRef],
  );

  return (
    <div className="input-with-selection">
      <SuggestableTextInput
        value={value ?? ''}
        onChange={handleChange}
        multiline={multiline}
        inputRef={inputRef}
      />
      <div>
        {selection?.map((item) => (
          <button key={item} data-key={item} onClick={handleSelectionClick}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
};

export const EvaluationPicker: React.FC<{
  value?: number;
  onChange: (value: number) => void;
}> = ({ value, onChange }) => {
  const [fillNum, setFillNum] = useState(value ?? 0);

  useEffect(() => setFillNum(value ?? 0), [setFillNum, value]);

  const handleMouseOver = useCallback(
    (ev: ReactMouseEvent) => {
      const {
        currentTarget: { dataset },
      } = ev;
      const key = dataset['key'];
      if (!key) return;

      setFillNum(parseInt(key));
    },
    [setFillNum],
  );

  const handleMouseOut = useCallback(() => {
    setFillNum(value ?? 0);
  }, [setFillNum, value]);

  const handleClick = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChange) return;

      const {
        currentTarget: { dataset },
      } = ev;
      const key = dataset['key'];
      if (!key) return;

      const newValue = parseInt(key);
      if (value === newValue) {
        onChange(0);
      } else {
        onChange(newValue);
      }
    },
    [onChange, value],
  );

  return (
    <div className="evaluation-picker">
      {[1, 2, 3, 4, 5].map((v) => {
        const fill = v <= fillNum;
        return (
          <img
            key={v}
            data-key={v}
            className={classNames({ fill })}
            src={fill ? StarFillIcon : StarIcon}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
            onMouseDown={handleClick}
          />
        );
      })}
    </div>
  );
};
