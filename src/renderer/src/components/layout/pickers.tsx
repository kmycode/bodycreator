import { ReactClickEvent } from '@renderer/models/types';
import { useCallback, useRef } from 'react';
import classNames from 'classnames';
import { SuggestableTextInput, SuggestItem, SuggestOnChangeData } from '../generic/SuggestableTextInput';
import { replaceCarretLine } from '../utils/carrettextutils';

export const VerticalAnglePicker: React.FC<{
  value?: string;
  onChange?: (selectedType: string) => void;
}> = ({ value, onChange }) => {
  const handleClick = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChange) return;

      const target = ev.currentTarget;
      const className =
        Array.from(target.classList).find((name) =>
          ['normal', 'high', 'low'].includes(name) ? name : false,
        ) ?? 'unknown';

      onChange(className === value ? 'normal' : className);
    },
    [value, onChange],
  );

  return (
    <div className="verticalanglepicker">
      <button className={classNames({ high: true, selected: value === 'high' })} onClick={handleClick}>
        フカン
      </button>
      <button className={classNames({ low: true, selected: value === 'low' })} onClick={handleClick}>
        アオリ
      </button>
    </div>
  );
};

export const WearOptionPicker: React.FC<{
  values?: string[];
  onChangeValues?: (selectedType: string[]) => void;
}> = ({ values, onChangeValues }) => {
  const handleClick = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChangeValues || !values) return;

      const target = ev.currentTarget;
      const className =
        Array.from(target.classList).find((name) => (['takeoff', 'wet'].includes(name) ? name : false)) ??
        'unknown';

      let newValues;
      if (values.includes(className)) {
        newValues = values.filter((v) => v !== className);
      } else {
        newValues = [...values];
        newValues.push(className);
      }

      onChangeValues(newValues);
    },
    [values, onChangeValues],
  );

  return (
    <div className="verticalanglepicker wearoptionpicker">
      <button
        className={classNames({ takeoff: true, selected: values?.includes('takeoff') })}
        onClick={handleClick}
      >
        脱ぐ
      </button>
      <button className={classNames({ wet: true, selected: values?.includes('wet') })} onClick={handleClick}>
        濡れ
      </button>
    </div>
  );
};

export const HairTypePicker: React.FC<{
  values?: string[];
  onChangeValues?: (selectedType: string[]) => void;
}> = ({ values, onChangeValues }) => {
  const handleClick = useCallback(
    (ev: ReactClickEvent) => {
      if (!onChangeValues || !values) return;

      const target = ev.currentTarget;
      const className =
        Array.from(target.classList).find((name) =>
          ['tidire', 'maki', 'saga', 'mitsu', 'osage'].includes(name) ? name : false,
        ) ?? 'unknown';

      let newValues;
      if (values.includes(className)) {
        newValues = values.filter((v) => v !== className);
      } else {
        newValues = [...values];
        newValues.push(className);
      }

      onChangeValues(newValues);
    },
    [values, onChangeValues],
  );

  return (
    <>
      <div className="verticalanglepicker wearoptionpicker">
        <button
          className={classNames({ tidire: true, selected: values?.includes('tidire') })}
          onClick={handleClick}
        >
          ちぢれ
        </button>
        <button
          className={classNames({ maki: true, selected: values?.includes('maki') })}
          onClick={handleClick}
        >
          巻き
        </button>
      </div>
      <div className="verticalanglepicker wearoptionpicker">
        <button
          className={classNames({ saga: true, selected: values?.includes('saga') })}
          onClick={handleClick}
        >
          逆立ち
        </button>
        <button
          className={classNames({ mitsu: true, selected: values?.includes('mitsu') })}
          onClick={handleClick}
        >
          三つ編
        </button>
      </div>
      <div className="verticalanglepicker wearoptionpicker">
        <button
          className={classNames({ osage: true, selected: values?.includes('osage') })}
          onClick={handleClick}
        >
          おさげ
        </button>
      </div>
    </>
  );
};

export interface IconItem {
  id: string;
  numId: number;
  svg: string;
}

export const IconGroupPicker: React.FC<{
  icons: IconItem[];
  value?: string;
  values?: string[];
  onChange?: (selectedId: string) => void;
  onChangeMultiple?: (selectedIds: string[]) => void;
}> = ({ icons, value, values, onChange, onChangeMultiple }) => {
  // const isMultiple = values || onChangeMultiple;

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

      if (values) {
        let newValues;

        if (values.includes(id)) {
          newValues = values.filter((v) => v !== id);
        } else {
          newValues = [...values];
          newValues.push(id);
        }

        if (onChangeMultiple) {
          onChangeMultiple(newValues);
        }
      }
    },
    [value, onChange, onChangeMultiple, values],
  );

  return (
    <div className="icongrouppicker">
      {icons.map((icon) => (
        <button key={icon.id} data-id={icon.id} onClick={handleChange} className="svgbutton">
          <img
            src={icon.svg}
            className={classNames({ svgicon: true, enabled: value === icon.id || values?.includes(icon.id) })}
          />
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
}> = ({ value, selection, multiline, onChange }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const inputRef = useRef<any>(null);

  const handleChange = useCallback(
    (text: string, _data: SuggestOnChangeData, suggestionCallback: (selection: SuggestItem[]) => void) => {
      if (!onChange) return;

      onChange(text);
      suggestionCallback([{ title: 'あああ' }, { title: 'いいい' }]);
    },
    [onChange],
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
