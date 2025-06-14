import { useCallback, useEffect } from 'react';
import { InputWithPopularSelection } from './pickers';
import { ReactTextChangeEvent } from '@renderer/models/types';
import {
  BackgroundData,
  backgroundDataKeys,
  backgroundDataNumberKeys,
  backgroundDataStringArrayKeys,
  backgroundDataTextInputKeys,
  generateCallbacks,
  generateStates,
  handleGenericTextInputChange,
  handleSuggestGeneric,
  StateType,
  updateInitialData,
} from '../utils/entity_data_converters';

export const BackgroundEditor: React.FC<{
  initialData?: Partial<BackgroundData>;
  onChange?: (data: BackgroundData, diff: { key: string; value: StateType }) => void;
}> = ({ initialData, onChange }) => {
  const states = generateStates(backgroundDataKeys, {
    defaultEmptyStringKeys: backgroundDataTextInputKeys,
    stringArrayKeys: backgroundDataStringArrayKeys,
    numberKeys: backgroundDataNumberKeys,
  });

  const callbacks = generateCallbacks(
    backgroundDataKeys,
    states,
    { idOfImage: initialData?.idOfImage ?? -1 },
    onChange,
  );

  useEffect(() => {
    updateInitialData(backgroundDataKeys, states, initialData);
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
      <h3>名前</h3>
      <input type="text" data-key="name" value={states['name'].state} onChange={handleTextInputChange} />
      <h3>場所</h3>
      <InputWithPopularSelection
        value={states['place'].state}
        onChange={callbacks['place']}
        selection={['学校', '海', 'プール']}
        name="place"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>遠景</h3>
      <InputWithPopularSelection
        value={states['landscape'].state}
        onChange={callbacks['landscape']}
        selection={['山', '雲']}
        name="landscape"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>家具・小物</h3>
      <InputWithPopularSelection
        value={states['items'].state}
        onChange={callbacks['items']}
        selection={['ベッド']}
        name="items"
        onSuggest={handleSuggest}
        multiline
      />
    </div>
  );
};
