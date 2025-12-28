import { useCallback, useEffect } from 'react';
import { InputWithPopularSelection, EvaluationPicker } from './pickers';
import { ReactTextChangeEvent } from '@renderer/models/types';
import {
  generateCallbacks,
  generateStates,
  handleGenericTextInputChange,
  handleSuggestGeneric,
  InformationData,
  informationDataKeys,
  informationDataNumberKeys,
  informationDataStringArrayKeys,
  informationDataTextInputKeys,
  StateType,
  updateInitialData,
} from '../utils/entity_data_converters';

export const InformationEditor: React.FC<{
  initialData?: Partial<InformationData>;
  onChange?: (data: InformationData, diff: { key: string; value: StateType }) => void;
}> = ({ initialData, onChange }) => {
  const states = generateStates(informationDataKeys, {
    defaultEmptyStringKeys: informationDataTextInputKeys,
    stringArrayKeys: informationDataStringArrayKeys,
    numberKeys: informationDataNumberKeys,
  });

  const callbacks = generateCallbacks(informationDataKeys, states, {}, onChange);

  useEffect(() => {
    updateInitialData(informationDataKeys, states, initialData);
  }, [initialData, states]);

  const handleTextInputChange = useCallback(
    (ev: ReactTextChangeEvent): void => {
      handleGenericTextInputChange(ev, callbacks);
    },
    [callbacks],
  );

  const handleSuggest = handleSuggestGeneric;

  return (
    <div>
      <h3>評価</h3>
      <EvaluationPicker value={states['evaluation'].state} onChange={callbacks['evaluation']} />
      <h3>作者</h3>
      <InputWithPopularSelection
        value={states['author'].state}
        onChange={callbacks['author']}
        selection={['A', 'B', 'C', 'D']}
        name="author"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>カテゴリ</h3>
      <InputWithPopularSelection
        value={states['category'].state}
        onChange={callbacks['category']}
        selection={['イラスト', '漫画']}
        name="category"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>URL</h3>
      <input type="text" data-key="url" value={states['url'].state} onChange={handleTextInputChange} />
      <h3>メモ</h3>
      <textarea data-key="memo" rows={4} value={states['memo'].state} onChange={handleTextInputChange} />
    </div>
  );
};
