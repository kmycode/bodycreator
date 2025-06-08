import { useCallback, useEffect, useRef, useState } from 'react';
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
  spineIcons,
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
  personDataToEntity,
  personEntityToData,
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
  dataBase: object | undefined,
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
        dataBase ?? {},
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
      <div className="searchpane__row">
        <IconGroupPicker
          icons={spineIcons}
          values={states['bodySpine'].state}
          onChangeMultiple={callbacks['bodySpine']}
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

function makeStateToMutable<T>(from: T): T {
  return { ...from };
}

interface PersonTab {
  id: string;
  title: string;
  data: Partial<PersonData>;
}

const EditPane: React.FC<{
  imageId: number;
}> = ({ imageId }) => {
  const image = useAppSelector((state) => state.imageList.items.find((i) => i.id === imageId))!;
  const { information: informationEntity, people: personEntities } = image;

  const dispatch = useAppDispatch();

  const mutableImage = useRef<Image>(makeStateToMutable(image));
  const [currentImageId, setCurrentImageId] = useState(0);
  const [personTabs, setPersonTabs] = useState([] as PersonTab[]);
  const [selectedTabId, setSelectedTabId] = useState('information');
  const [currentTabPersonData, setCurrentTabPersonData] = useState({ name: '人間' } as Partial<PersonData>);
  const [informationData, setInformationData] = useState({} as InformationData);

  const handleCurrentImageUpdate = useCallback(
    (diff: (mutableImage: Image) => void) => {
      const newImage = makeStateToMutable(mutableImage.current);

      diff(newImage);
      dispatch(updateCurrentImage(newImage));

      mutableImage.current = newImage;
    },
    [dispatch, mutableImage],
  );

  const handleTabChange = useCallback(
    (value: string, newTabs?: PersonTab[]) => {
      const tabs = newTabs ?? personTabs;

      const beforeTabId = selectedTabId;

      if (!newTabs && beforeTabId.startsWith('person-')) {
        const currentTab = tabs.find((tab) => tab.id === beforeTabId);
        if (currentTab) {
          currentTab.data = currentTabPersonData;
          setPersonTabs([...tabs]);
        }
      }

      const newTab = tabs.find((tab) => tab.id === value);
      if (newTab?.data) {
        setCurrentTabPersonData(newTab.data);
      }

      setSelectedTabId(value);
      handleCurrentImageUpdate((newImage) => (newImage.selectedTabId = value));
    },
    [
      selectedTabId,
      setSelectedTabId,
      personTabs,
      setPersonTabs,
      currentTabPersonData,
      setCurrentTabPersonData,
      handleCurrentImageUpdate,
    ],
  );

  useEffect(() => {
    if (currentImageId !== imageId) {
      setCurrentImageId(imageId);

      // unmount
      dispatch(saveCurrentImage());

      // mount
      mutableImage.current = makeStateToMutable(image);
      const newTabs = personEntities.map((e) => ({
        id: `person-${e.idOfImage}`,
        title: e.name,
        data: personEntityToData(e),
      }));
      setCurrentTabPersonData({});
      setPersonTabs(newTabs);
      setInformationData(informationEntityToData(informationEntity));
      handleTabChange(image.selectedTabId ?? 'information', newTabs);
    }
  }, [
    image,
    currentImageId,
    setCurrentImageId,
    imageId,
    setInformationData,
    informationEntity,
    dispatch,
    personEntities,
    setPersonTabs,
    setSelectedTabId,
    setCurrentTabPersonData,
    mutableImage,
    handleTabChange,
  ]);

  const handleAddTab = useCallback(
    (id: string) => {
      if (id !== 'person-add') return;

      const ids = personTabs
        .map((tab) => parseInt(tab.id.split('-')[1]))
        .sort((a, b) => (a > b ? -1 : a === b ? 0 : 1));
      const maxId = ids[0] ?? 0;

      const newData = { idOfImage: maxId + 1, name: '人間' };

      const newTabs = [...personTabs];
      newTabs.push({
        id: `person-${newData.idOfImage}`,
        title: '人間',
        data: newData,
      });

      setPersonTabs(newTabs);
      handleCurrentImageUpdate(
        (newImage) =>
          (newImage.people = [
            ...newImage.people,
            personDataToEntity(newData as PersonData, { ...newData, imageId }),
          ]),
      );
    },
    [personTabs, setPersonTabs, handleCurrentImageUpdate, imageId],
  );

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

  const handlePersonChange = useCallback(
    (value: PersonData, diff: { key: string; value: StateType }) => {
      const activePersonTab = personTabs.find((tab) => tab.id === selectedTabId);
      if (!activePersonTab) return;

      if (diff.key === 'name' && typeof diff.value === 'string') {
        activePersonTab.title = diff.value;
        setPersonTabs([...personTabs]);
      }

      if (diff.key === 'faceHorizontal') console.log(`handlePersonChange = ${diff.value}`);

      setCurrentTabPersonData(value);
      handleCurrentImageUpdate((newImage) => {
        const currentEntityIndex = newImage.people.findIndex((p) => p.idOfImage === value.idOfImage);
        console.log(`handlePersonChange = idOfImage: ${value.idOfImage} / index: ${currentEntityIndex}`);
        console.log(
          `handlePersonChange = newImage.people.length: ${newImage.people.length}, idOfImage: ${newImage.people.map((p) => p.idOfImage).join(', ')}`,
        );
        if (currentEntityIndex < 0) return;

        newImage.people = [...newImage.people];
        newImage.people[currentEntityIndex] = personDataToEntity(value, newImage.people[currentEntityIndex]);
      });
    },
    [selectedTabId, personTabs, setPersonTabs, setCurrentTabPersonData, handleCurrentImageUpdate],
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
        <TabHeaderGroup
          headers={tabs}
          selectedId={selectedTabId}
          onChange={handleTabChange}
          onNew={handleAddTab}
        />
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
