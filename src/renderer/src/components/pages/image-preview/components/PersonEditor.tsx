import { useCallback, useEffect } from 'react';
import { IconGroupPicker, InputWithPopularSelection, SmallTextButtonGroupPicker } from './pickers';
import {
  wearIcons,
  cubeIcons,
  faceIcons,
  lineIcons,
  sleepIcons,
  armVerticalIcons,
  legVerticalIcons,
  armHorizontalIcons,
  legHorizontalIcons,
  hairIcons,
  oppaiIcons,
  spineIcons,
  verticalAngleInfo,
  hairTypeInfo,
  wearOptionsInfo,
} from './pickertypes';
import { ReactTextChangeEvent } from '@renderer/models/types';
import {
  generateCallbacks,
  generateStates,
  handleGenericTextInputChange,
  handleSuggestGeneric,
  PersonData,
  personDataKeys,
  personDataStringArrayKeys,
  personDataTextInputKeys,
  StateType,
  updateInitialData,
} from '../utils/entity_data_converters';

export const PersonEditor: React.FC<{
  initialData?: Partial<PersonData>;
  onChange?: (data: PersonData, diff: { key: string; value: StateType }) => void;
}> = ({ initialData, onChange }) => {
  const states = generateStates(personDataKeys, {
    defaultEmptyStringKeys: personDataTextInputKeys,
    stringArrayKeys: personDataStringArrayKeys,
  });

  const callbacks = generateCallbacks(
    personDataKeys,
    states,
    { idOfImage: initialData?.idOfImage ?? -1 },
    onChange,
  );

  useEffect(() => {
    updateInitialData(personDataKeys, states, initialData);
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
      <h3>顔</h3>
      <div className="searchpane__row">
        <SmallTextButtonGroupPicker
          items={verticalAngleInfo}
          value={states['faceVertical'].state}
          onChange={callbacks['faceVertical']}
        />
        <IconGroupPicker
          icons={faceIcons}
          value={states['faceHorizontal'].state}
          onChange={callbacks['faceHorizontal']}
        />
      </div>
      <h3>表情</h3>
      <InputWithPopularSelection
        value={states['faceEmotion'].state}
        onChange={callbacks['faceEmotion']}
        selection={['真顔', 'ほほえみ', '笑い', '挑発', '感じる', '悲しい', '泣く', '怖い', '怒り']}
        name="faceEmotion"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>髪の長さ</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={hairIcons}
          value={states['hairLength'].state}
          onChange={callbacks['hairLength']}
        />
        <SmallTextButtonGroupPicker
          items={hairTypeInfo}
          values={states['hairType'].state}
          onChangeValues={callbacks['hairType']}
          multiple
        />
      </div>
      <h3>髪型</h3>
      <InputWithPopularSelection
        value={states['hairStyle'].state}
        onChange={callbacks['hairStyle']}
        selection={['ストレート', 'ポニーテール', 'ツインテール']}
        name="hairStyle"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>胴体</h3>
      <div className="searchpane__row">
        <SmallTextButtonGroupPicker
          items={verticalAngleInfo}
          value={states['chestVertical'].state}
          onChange={callbacks['chestVertical']}
        />
        <IconGroupPicker
          icons={cubeIcons}
          value={states['chestHorizontal'].state}
          onChange={callbacks['chestHorizontal']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={spineIcons}
          values={states['bodySpine'].state}
          onChangeMultiple={callbacks['bodySpine']}
          multiple
        />
      </div>
      <h3>胸</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={wearIcons}
          value={states['bodyWear'].state}
          onChange={callbacks['bodyWear']}
        />
        <SmallTextButtonGroupPicker
          values={states['bodyWearOptions'].state}
          onChangeValues={callbacks['bodyWearOptions']}
          items={wearOptionsInfo}
          multiple
        />
      </div>
      <h3>おっぱい</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={oppaiIcons}
          value={states['oppaiSize'].state}
          onChange={callbacks['oppaiSize']}
        />
      </div>
      <InputWithPopularSelection
        value={states['oppai'].state}
        onChange={callbacks['oppai']}
        selection={['上げ', '潰し', '揉み', '自分揉み', '垂らし']}
        name="oppai"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>腰</h3>
      <div className="searchpane__row">
        <SmallTextButtonGroupPicker
          items={verticalAngleInfo}
          value={states['waistVertical'].state}
          onChange={callbacks['waistVertical']}
        />
        <IconGroupPicker
          icons={cubeIcons}
          value={states['waistHorizontal'].state}
          onChange={callbacks['waistHorizontal']}
        />
      </div>
      <h3>左腕</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={armHorizontalIcons}
          value={states['leftArmHorizontal'].state}
          onChange={callbacks['leftArmHorizontal']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={armVerticalIcons}
          value={states['leftArmVertical'].state}
          onChange={callbacks['leftArmVertical']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={lineIcons}
          value={states['leftElbow'].state}
          onChange={callbacks['leftElbow']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={wearIcons}
          value={states['leftArmWear'].state}
          onChange={callbacks['leftArmWear']}
        />
        <SmallTextButtonGroupPicker
          values={states['leftArmWearOptions'].state}
          onChangeValues={callbacks['leftArmWearOptions']}
          items={wearOptionsInfo}
          multiple
        />
      </div>
      <h3>右腕</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={armHorizontalIcons}
          value={states['rightArmHorizontal'].state}
          onChange={callbacks['rightArmHorizontal']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={armVerticalIcons}
          value={states['rightArmVertical'].state}
          onChange={callbacks['rightArmVertical']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={lineIcons}
          value={states['rightElbow'].state}
          onChange={callbacks['rightElbow']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={wearIcons}
          value={states['rightArmWear'].state}
          onChange={callbacks['rightArmWear']}
        />
        <SmallTextButtonGroupPicker
          values={states['rightArmWearOptions'].state}
          onChangeValues={callbacks['rightArmWearOptions']}
          items={wearOptionsInfo}
          multiple
        />
      </div>
      <h3>左脚</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={legHorizontalIcons}
          value={states['leftLegHorizontal'].state}
          onChange={callbacks['leftLegHorizontal']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={legVerticalIcons}
          value={states['leftLegVertical'].state}
          onChange={callbacks['leftLegVertical']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={wearIcons}
          value={states['leftLegWear'].state}
          onChange={callbacks['leftLegWear']}
        />
        <SmallTextButtonGroupPicker
          values={states['leftLegWearOptions'].state}
          onChangeValues={callbacks['leftLegWearOptions']}
          items={wearOptionsInfo}
          multiple
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={lineIcons}
          value={states['leftKnee'].state}
          onChange={callbacks['leftKnee']}
        />
      </div>
      <h3>右脚</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={legHorizontalIcons}
          value={states['rightLegHorizontal'].state}
          onChange={callbacks['rightLegHorizontal']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={legVerticalIcons}
          value={states['rightLegVertical'].state}
          onChange={callbacks['rightLegVertical']}
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={wearIcons}
          value={states['rightLegWear'].state}
          onChange={callbacks['rightLegWear']}
        />
        <SmallTextButtonGroupPicker
          values={states['rightLegWearOptions'].state}
          onChangeValues={callbacks['rightLegWearOptions']}
          items={wearOptionsInfo}
          multiple
        />
      </div>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={lineIcons}
          value={states['rightKnee'].state}
          onChange={callbacks['rightKnee']}
        />
      </div>
      <h3>その他</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={sleepIcons} value={states['sleep'].state} onChange={callbacks['sleep']} />
      </div>
      <h3>その他の体のタグ</h3>
      <InputWithPopularSelection
        value={states['bodyOthers'].state}
        onChange={callbacks['bodyOthers']}
        selection={['膝の裏', '肩上げ']}
        multiline
      />
      <h3>衣装・アクセサリ</h3>
      <InputWithPopularSelection
        value={states['wears'].state}
        onChange={callbacks['wears']}
        selection={[
          'ちら見せ',
          '制服',
          'カッターシャツ',
          'フリル',
          'スクール水着',
          '競泳水着',
          '複雑私服',
          '複雑水着',
          'スカート',
          'パンツ',
          'ブラ',
        ]}
        name="wears"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>行動・ポーズ</h3>
      <InputWithPopularSelection
        value={states['poses'].state}
        onChange={callbacks['poses']}
        selection={['座る', '立つ', '歩く', '走る']}
        name="poses"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>小物</h3>
      <InputWithPopularSelection
        value={states['personItem'].state}
        onChange={callbacks['personItem']}
        selection={[]}
        name="personItem"
        onSuggest={handleSuggest}
        multiline
      />
      <h3>その他</h3>
      <InputWithPopularSelection
        value={states['others'].state}
        onChange={callbacks['others']}
        selection={[]}
        name="others"
        onSuggest={handleSuggest}
        multiline
      />
    </div>
  );
};
