import { useCallback, useEffect, useState } from 'react';
import {
  VerticalAnglePicker,
  WearOptionPicker,
  IconGroupPicker,
  InputWithPopularSelection,
  HairTypePicker,
  EvaluationPicker,
} from './pickers';
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
} from './pickertypes';
import TabHeaderGroup from '../../../parts/TabHeaderGroup';
import { ReactTextChangeEvent } from '@renderer/models/types';
import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { clearModalResult, openModal } from '@renderer/models/entities/modal_state';
import {
  InformationData,
  informationDataKeys,
  informationDataNumberKeys,
  informationDataStringArrayKeys,
  informationDataTextInputKeys,
  informationDataToEntity,
  informationEntityToData,
  PersonData,
  personDataKeys,
  personDataStringArrayKeys,
  personDataTextInputKeys,
} from '../utils/entity_data_converters';
import { Image, saveCurrentImage, updateCurrentImage } from '@renderer/models/entities/image_list';

type StateType = (string & string[] & number) | undefined;
type SetStateType = React.Dispatch<React.SetStateAction<StateType>>;
type StatesObjectType = { [s: string]: { state: StateType; setState: SetStateType } };
type CallbacksObjectType = { [s: string]: any }; // eslint-disable-line @typescript-eslint/no-explicit-any

interface KeyOptions {
  defaultEmptyStringKeys?: string[];
  stringArrayKeys?: string[];
  numberKeys?: string[];
}

const generateStates = (keys: string[], keyOptions: KeyOptions): StatesObjectType => {
  const defaultEmptyStringKeys = keyOptions.defaultEmptyStringKeys ?? [];
  const stringArrayKeys = keyOptions.stringArrayKeys ?? [];
  const numberKeys = keyOptions.numberKeys ?? [];

  return keys.reduce((obj, key) => {
    const fn = useState(
      stringArrayKeys.includes(key)
        ? []
        : numberKeys.includes(key)
          ? 0
          : defaultEmptyStringKeys.includes(key)
            ? ''
            : 'unknown',
    );
    obj[key] = { state: fn[0], setState: fn[1] };
    return obj;
  }, {});
};

const generateCallbacks = (
  keys: string[],
  states: StatesObjectType,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  onChange: ((data: any, diff: { key: string; value: StateType }) => void) | undefined,
): CallbacksObjectType => {
  return keys.reduce((obj, key) => {
    const state = states[key];
    if (!state) return obj;

    obj[key] = (value: StateType) => {
      state.setState(value);

      const data = Object.entries<{ state: StateType; setState: SetStateType }>(states).reduce(
        (obj, entry) => {
          const key = entry[0];
          const value = entry[1].state;
          obj[key] = value;
          return obj;
        },
        {},
      );
      data[key] = value;

      if (onChange) {
        onChange(data, { key, value });
      }
    };
    return obj;
  }, {});
};

const updateInitialData = (
  keys: string[],
  states: StatesObjectType,
  initialData: object | undefined,
): void => {
  if (!initialData) return;

  for (const key of keys) {
    const state = states[key];
    const data = initialData[key];

    if (!state || typeof data === 'undefined') continue;

    state.setState(data);
  }
};

const handleGenericTextInputChange = (ev: ReactTextChangeEvent, callbacks: CallbacksObjectType): void => {
  const {
    currentTarget: { value, dataset },
  } = ev;
  const key = dataset['key'];
  if (!key) return;

  const callback = callbacks[key];
  if (!callback) return;

  callback(value);
};

const PersonEditor: React.FC<{
  initialData?: Partial<PersonData>;
  onChange?: (data: PersonData, diff: { key: string; value: StateType }) => void;
}> = ({ initialData, onChange }) => {
  const states = generateStates(personDataKeys, {
    defaultEmptyStringKeys: personDataTextInputKeys,
    stringArrayKeys: personDataStringArrayKeys,
  });

  const callbacks = generateCallbacks(personDataKeys, states, onChange);

  useEffect(() => {
    updateInitialData(personDataKeys, states, initialData);
  }, [initialData, states]);

  const handleTextInputChange = useCallback(
    (ev: ReactTextChangeEvent): void => {
      handleGenericTextInputChange(ev, callbacks);
    },
    [callbacks],
  );

  return (
    <div>
      <h3>名前</h3>
      <input type="text" data-key="name" value={states['name'].state} onChange={handleTextInputChange} />
      <h3>顔</h3>
      <div className="searchpane__row">
        <VerticalAnglePicker value={states['faceVertical'].state} onChange={callbacks['faceVertical']} />
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
      />
      <h3>髪の長さ</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={hairIcons}
          value={states['hairLength'].state}
          onChange={callbacks['hairLength']}
        />
        <HairTypePicker values={states['hairType'].state} onChangeValues={callbacks['hairType']} />
      </div>
      <h3>髪型</h3>
      <InputWithPopularSelection
        value={states['hairStyle'].state}
        onChange={callbacks['hairStyle']}
        selection={['ストレート', 'ポニーテール', 'ツインテール']}
      />
      <h3>胴体</h3>
      <div className="searchpane__row">
        <VerticalAnglePicker value={states['chestVertical'].state} onChange={callbacks['chestVertical']} />
        <IconGroupPicker
          icons={cubeIcons}
          value={states['chestHorizontal'].state}
          onChange={callbacks['chestHorizontal']}
        />
      </div>
      <h3>胸</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={wearIcons}
          value={states['bodyWear'].state}
          onChange={callbacks['bodyWear']}
        />
        <WearOptionPicker
          values={states['bodyWearOptions'].state}
          onChangeValues={callbacks['bodyWearOptions']}
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
      />
      <h3>腰</h3>
      <div className="searchpane__row">
        <VerticalAnglePicker value={states['waistVertical'].state} onChange={callbacks['waistVertical']} />
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
        <WearOptionPicker
          values={states['leftArmWearOptions'].state}
          onChangeValues={callbacks['leftArmWearOptions']}
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
        <WearOptionPicker
          values={states['rightArmWearOptions'].state}
          onChangeValues={callbacks['rightArmWearOptions']}
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
        <WearOptionPicker
          values={states['leftLegWearOptions'].state}
          onChangeValues={callbacks['leftLegWearOptions']}
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
        <WearOptionPicker
          values={states['rightLegWearOptions'].state}
          onChangeValues={callbacks['rightLegWearOptions']}
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
          'パンツ',
          'ブラ',
        ]}
        multiline
      />
      <h3>行動・ポーズ</h3>
      <InputWithPopularSelection
        value={states['poses'].state}
        onChange={callbacks['poses']}
        selection={['座る', '立つ', '歩く', '走る']}
        multiline
      />
      <h3>その他</h3>
      <InputWithPopularSelection
        value={states['others'].state}
        onChange={callbacks['others']}
        selection={[]}
        multiline
      />
    </div>
  );
};

const InformationEditor: React.FC<{
  initialData?: Partial<InformationData>;
  onChange?: (data: InformationData, diff: { key: string; value: StateType }) => void;
}> = ({ initialData, onChange }) => {
  const states = generateStates(informationDataKeys, {
    defaultEmptyStringKeys: informationDataTextInputKeys,
    stringArrayKeys: informationDataStringArrayKeys,
    numberKeys: informationDataNumberKeys,
  });

  const callbacks = generateCallbacks(informationDataKeys, states, onChange);

  useEffect(() => {
    updateInitialData(informationDataKeys, states, initialData);
  }, [initialData, states]);

  const handleTextInputChange = useCallback(
    (ev: ReactTextChangeEvent): void => {
      handleGenericTextInputChange(ev, callbacks);
    },
    [callbacks],
  );

  return (
    <div>
      <h3>評価</h3>
      <EvaluationPicker value={states['evaluation'].state} onChange={callbacks['evaluation']} />
      <h3>作者</h3>
      <InputWithPopularSelection
        value={states['author'].state}
        onChange={callbacks['author']}
        selection={['mignon', '宮瀬まひろ', 'むにんしき']}
      />
      <h3>URL</h3>
      <input type="text" data-key="url" value={states['url'].state} onChange={handleTextInputChange} />
      <h3>メモ</h3>
      <textarea data-key="memo" rows={4} value={states['memo'].state} onChange={handleTextInputChange} />
    </div>
  );
};

const initialTabs = [
  { id: 'person-add', title: '＋', specialTabType: 'new' },
  { id: 'information', title: '情報' },
];

const EditPane: React.FC<{
  imageId: number;
}> = ({ imageId }) => {
  const image = useAppSelector((state) => state.imageList.items.find((i) => i.id === imageId))!;
  const { information: informationEntity } = image;

  const dispatch = useAppDispatch();

  const [currentImageId, setCurrentImageId] = useState(0);
  const [personTabs, setPersonTabs] = useState([
    { id: 'person-1', title: '人間', data: { name: '人間' } as Partial<PersonData> },
  ]);
  const [selectedTabId, setSelectedTabId] = useState('information');
  const [currentTabPersonData, setCurrentTabPersonData] = useState({ name: '人間' } as Partial<PersonData>);
  const [informationData, setInformationData] = useState({} as InformationData);

  useEffect(() => {
    if (currentImageId !== imageId) {
      setCurrentImageId(imageId);

      // unmount
      dispatch(saveCurrentImage());

      // mount
      setInformationData(informationEntityToData(informationEntity));
    }
  }, [currentImageId, setCurrentImageId, imageId, setInformationData, informationEntity, dispatch]);

  const handleAddTab = useCallback(() => {
    const ids = personTabs
      .map((tab) => parseInt(tab.id.split('-')[1]))
      .sort((a, b) => (a > b ? -1 : a === b ? 0 : 1));
    const maxId = ids[0] ?? 0;

    const newTabs = [...personTabs];
    newTabs.push({
      id: `person-${maxId + 1}`,
      title: '人間',
      data: { name: '人間' },
    });

    setPersonTabs(newTabs);
    setSelectedTabId(`person-${maxId + 1}`);
  }, [personTabs, setPersonTabs, setSelectedTabId]);

  const handleRemoveTab = useCallback(() => {
    const activePersonTab = personTabs.find((tab) => tab.id === selectedTabId);
    if (!activePersonTab) return;

    dispatch(
      openModal({
        type: 'confirm',
        parameter: {
          id: 'editpane-remove-person-tab',
          message: `本当に人間「${currentTabPersonData.name}」を削除しますか？`,
          yesResult: {
            type: 'remove-person-tab',
          },
        },
      }),
    );
  }, [personTabs, selectedTabId, dispatch, currentTabPersonData.name]);

  const modalState = useAppSelector((state) => state.modalState);
  useEffect(() => {
    if (
      modalState.lastResultId !== 'editpane-remove-person-tab' ||
      modalState.lastResult?.selection !== 'yes'
    )
      return;

    const newTabs = personTabs.filter((tab) => tab.id !== selectedTabId);

    setPersonTabs(newTabs);
    setSelectedTabId(newTabs[0]?.id ?? 'information');

    dispatch(clearModalResult());
  }, [modalState, selectedTabId, setPersonTabs, setSelectedTabId, dispatch, personTabs]);

  const handleTabChange = useCallback(
    (value: string) => {
      if (value === 'person-add') {
        handleAddTab();
        return;
      }

      const beforeTabId = selectedTabId;

      if (beforeTabId.startsWith('person-')) {
        const currentTab = personTabs.find((tab) => tab.id === beforeTabId);
        if (currentTab) {
          currentTab.data = currentTabPersonData;
          setPersonTabs([...personTabs]);
        }

        const newTab = personTabs.find((tab) => tab.id === value);
        if (newTab) {
          setCurrentTabPersonData(newTab.data ?? {});
        }
      }

      setSelectedTabId(value);
    },
    [
      selectedTabId,
      setSelectedTabId,
      personTabs,
      setPersonTabs,
      currentTabPersonData,
      setCurrentTabPersonData,
      handleAddTab,
    ],
  );

  const handleCurrentImageUpdate = useCallback(
    (diff: (newImage: Image) => void) => {
      const newImage = { ...image };
      newImage.information = informationDataToEntity(informationData, informationEntity);
      diff(newImage);
      dispatch(updateCurrentImage(newImage));
    },
    [informationData, dispatch, image, informationEntity],
  );

  const handlePersonChange = useCallback(
    (value: PersonData, diff: { key: string; value: StateType }) => {
      const activePersonTab = personTabs.find((tab) => tab.id === selectedTabId);
      if (!activePersonTab) return;

      if (diff.key === 'name' && typeof diff.value === 'string') {
        activePersonTab.title = diff.value;
        setPersonTabs([...personTabs]);
      }

      setCurrentTabPersonData(value);
    },
    [selectedTabId, personTabs, setPersonTabs, setCurrentTabPersonData],
  );

  const handleInformationChange = useCallback(
    (value: InformationData) => {
      setInformationData(value);
      handleCurrentImageUpdate(
        (newImage) => (newImage.information = informationDataToEntity(value, informationEntity)),
      );
    },
    [setInformationData, handleCurrentImageUpdate, informationEntity],
  );

  const tabs = [...personTabs, ...initialTabs];

  return (
    <div className="editpane pane">
      <h2>編集</h2>
      <div className="pane-contents">
        <TabHeaderGroup headers={tabs} selectedId={selectedTabId} onChange={handleTabChange} />
        <div className="tab-contents">
          {selectedTabId.startsWith('person-') && (
            <>
              <PersonEditor onChange={handlePersonChange} initialData={currentTabPersonData} />
              <button onClick={handleRemoveTab}>この人物を削除する</button>
            </>
          )}
          {selectedTabId === 'information' && (
            <InformationEditor onChange={handleInformationChange} initialData={informationData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPane;

/*
      <div className="searchpane__row">
        <VerticalAnglePicker value={faceVertical} onChange={handleFaceVerticalChange}/>
        <IconGroupPicker icons={faceIcons} value={faceHorizontal} onChange={handleFaceHorizontalChange}/>
      </div>
      <h3>表情</h3>
      <input type="text"/>
      <h3>髪の長さ</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={hairIcons} value={hairLength} onChange={handleHairLengthChange}/>
      </div>
      <h3>髪型</h3>
      <input type="text"/>
      <h3>胸</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={bodyWear} onChange={handleBodyWearChange}/>
        <WearOptionPicker values={bodyWearOptions} onChangeValues={handleBodyWearOptionsChange}/>
      </div>
      <div className="searchpane__row">
        <VerticalAnglePicker value={chestVertical} onChange={handleChestVerticalChange}/>
        <IconGroupPicker icons={cubeIcons} value={chestHorizontal} onChange={handleChestHorizontalChange}/>
      </div>
      <h3>腰</h3>
      <div className="searchpane__row">
        <VerticalAnglePicker value={waistVertical} onChange={handleWaistVerticalChange}/>
        <IconGroupPicker icons={cubeIcons} value={waistHorizontal} onChange={handleWaistHorizontalChange}/>
      </div>
      <h3>左腕</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={armHorizontalIcons} value={leftArmHorizontal} onChange={handleLeftArmHorizontalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={armVerticalIcons} value={leftArmVertical} onChange={handleLeftArmVerticalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={leftElbow} onChange={handleLeftElbowChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={leftArmWear} onChange={handleLeftArmWearChange}/>
        <WearOptionPicker values={leftArmWearOptions} onChangeValues={handleLeftArmWearOptionsChange}/>
      </div>
      <h3>右腕</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={armHorizontalIcons} value={rightArmHorizontal} onChange={handleRightArmHorizontalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={armVerticalIcons} value={rightArmVertical} onChange={handleRightArmVerticalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={rightElbow} onChange={handleRightElbowChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={rightArmWear} onChange={handleRightArmWearChange}/>
        <WearOptionPicker values={rightArmWearOptions} onChangeValues={handleRightArmWearOptionsChange}/>
      </div>
      <h3>左脚</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={legHorizontalIcons} value={leftLegHorizontal} onChange={handleLeftLegHorizontalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={legVerticalIcons} value={leftLegVertical} onChange={handleLeftLegVerticalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={leftLegWear} onChange={handleLeftLegWearChange}/>
        <WearOptionPicker values={leftLegWearOptions} onChangeValues={handleLeftLegWearOptionsChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={leftKnee} onChange={handleLeftKneeChange}/>
      </div>
      <h3>右脚</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={legHorizontalIcons} value={rightLegHorizontal} onChange={handleRightLegHorizontalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={legVerticalIcons} value={rightLegVertical} onChange={handleRightLegVerticalChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={rightLegWear} onChange={handleRightLegWearChange}/>
        <WearOptionPicker values={rightLegWearOptions} onChangeValues={handleRightLegWearOptionsChange}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={rightKnee} onChange={handleRightKneeChange}/>
      </div>
      <h3>その他</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={sleepIcons} value={sleep} onChange={handleSleepChange}/>
      </div>

*/
