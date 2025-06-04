import { useCallback, useEffect, useState } from "react";
import { VerticalAnglePicker, WearOptionPicker, IconGroupPicker, wearIcons, cubeIcons, faceIcons, lineIcons, sleepIcons, armVerticalIcons, legVerticalIcons, armHorizontalIcons, legHorizontalIcons, hairIcons } from "./pickers";
import TabHeaderGroup from "../parts/TabHeaderGroup";

const personDataKeys = [
  'name',
  'faceVertical',
  'faceHorizontal',
  'faceEmotion',
  'hairLength',
  'hairStyle',
  'leftArmHorizontal',
  'leftArmVertical',
  'rightArmHorizontal',
  'rightArmVertical',
  'leftElbow',
  'rightElbow',
  'leftLegHorizontal',
  'leftLegVertical',
  'leftKnee',
  'rightLegHorizontal',
  'rightLegVertical',
  'rightKnee',
  'chestVertical',
  'chestHorizontal',
  'waistVertical',
  'waistHorizontal',
  'sleep',
  'leftArmWear',
  'leftArmWearOptions',
  'rightArmWear',
  'rightArmWearOptions',
  'bodyWear',
  'bodyWearOptions',
  'leftLegWear',
  'leftLegWearOptions',
  'rightLegWear',
  'rightLegWearOptions',
];

interface PersonData {
  name: string;
  faceVertical: string;
  faceHorizontal: string;
  faceEmotion: string;
  hairLength: string;
  hairStyle: string;
  leftArmHorizontal: string;
  leftArmVertical: string;
  rightArmHorizontal: string;
  rightArmVertical: string;
  leftElbow: string;
  rightElbow: string;
  leftLegHorizontal: string;
  leftLegVertical: string;
  leftKnee: string;
  rightLegHorizontal: string;
  rightLegVertical: string;
  rightKnee: string;
  chestVertical: string;
  chestHorizontal: string;
  waistVertical: string;
  waistHorizontal: string;
  sleep: string;
  leftArmWear: string;
  leftArmWearOptions: string[];
  rightArmWear: string;
  rightArmWearOptions: string[];
  bodyWear: string;
  bodyWearOptions: string[];
  leftLegWear: string;
  leftLegWearOptions: string[];
  rightLegWear: string;
  rightLegWearOptions: string[];
}

const personDataTextInputKeys = [
  'name',
  'faceEmotion',
  'hairStyle',
];

const PersonEditor: React.FC<{
  initialData?: Partial<PersonData>;
  onChange?: (data: PersonData, diff: { key: string; value: string; }) => void;
}> = ({ initialData, onChange }) => {
  const states = personDataKeys.reduce((obj, key) => {
    const fn = useState(key.endsWith('WearOptions') ? [] : personDataTextInputKeys.includes(key) ? '' : 'unknown');
    obj[key] = { state: fn[0], setState: fn[1], };
    return obj;
  }, {});

  const callbacks = personDataKeys.reduce((obj, key) => {
    const state = states[key] as { state: any, setState: any, };
    if (!state) return obj;

    obj[key] = (value: any) => {
      state.setState(value);

      const data = Object.entries<{ state: any, setState: any }>(states).reduce((obj, entry) => {
        const key = entry[0];
        const value = entry[1].state;
        obj[key] = value;
        return obj;
      }, {});
      data[key] = value;
      
      if (onChange) {
        onChange(data as PersonData, { key, value, });
      }
    };
    return obj;
  }, {});

  useEffect(() => {
    if (!initialData) return;

    for (const key of personDataKeys) {
      const state = states[key];
      const data = initialData[key];

      if (!state || typeof(data) === 'undefined') continue;

      state.setState(data);
    }
  }, [initialData]);

  const handleTextInputChange = (ev) => {
    const target = ev.currentTarget;
    const value = target.value;
    const key = target.dataset['key'];
    const callback = callbacks[key];

    if (!callback) return;

    callback(value);
  };

  return (
    <div>
      <h3>名前</h3>
      <input type="text" data-key="name" value={states['name'].state} onChange={handleTextInputChange}/>
      <h3>顔</h3>
      <div className="searchpane__row">
        <VerticalAnglePicker value={states['faceVertical'].state} onChange={callbacks['faceVertical']}/>
        <IconGroupPicker icons={faceIcons} value={states['faceHorizontal'].state} onChange={callbacks['faceHorizontal']}/>
      </div>
      <h3>表情</h3>
      <input type="text" data-key="faceEmotion" value={states['faceEmotion'].state} onChange={handleTextInputChange}/>
      <h3>髪の長さ</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={hairIcons} value={states['hairLength'].state} onChange={callbacks['hairLength']}/>
      </div>
      <h3>髪型</h3>
      <input type="text" data-key="hairStyle" value={states['hairStyle'].state} onChange={handleTextInputChange}/>
      <h3>胴体</h3>
      <div className="searchpane__row">
        <VerticalAnglePicker value={states['chestVertical'].state} onChange={callbacks['chestVertical']}/>
        <IconGroupPicker icons={cubeIcons} value={states['chestHorizontal'].state} onChange={callbacks['chestHorizontal']}/>
      </div>
      <h3>胸</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={states['bodyWear'].state} onChange={callbacks['bodyWear']}/>
        <WearOptionPicker values={states['bodyWearOptions'].state} onChangeValues={callbacks['bodyWearOptions']}/>
      </div>
      <h3>腰</h3>
      <div className="searchpane__row">
        <VerticalAnglePicker value={states['waistVertical'].state} onChange={callbacks['waistVertical']}/>
        <IconGroupPicker icons={cubeIcons} value={states['waistHorizontal'].state} onChange={callbacks['waistHorizontal']}/>
      </div>
      <h3>左腕</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={armHorizontalIcons} value={states['leftArmHorizontal'].state} onChange={callbacks['leftArmHorizontal']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={armVerticalIcons} value={states['leftArmVertical'].state} onChange={callbacks['leftArmVertical']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={states['leftElbow'].state} onChange={callbacks['leftElbow']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={states['leftArmWear'].state} onChange={callbacks['leftArmWear']}/>
        <WearOptionPicker values={states['leftArmWearOptions'].state} onChangeValues={callbacks['leftArmWearOptions']}/>
      </div>
      <h3>右腕</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={armHorizontalIcons} value={states['rightArmHorizontal'].state} onChange={callbacks['rightArmHorizontal']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={armVerticalIcons} value={states['rightArmVertical'].state} onChange={callbacks['rightArmVertical']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={states['rightElbow'].state} onChange={callbacks['rightElbow']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={states['rightArmWear'].state} onChange={callbacks['rightArmWear']}/>
        <WearOptionPicker values={states['rightArmWearOptions'].state} onChangeValues={callbacks['rightArmWearOptions']}/>
      </div>
      <h3>左脚</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={legHorizontalIcons} value={states['leftLegHorizontal'].state} onChange={callbacks['leftLegHorizontal']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={legVerticalIcons} value={states['leftLegVertical'].state} onChange={callbacks['leftLegVertical']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={states['leftLegWear'].state} onChange={callbacks['leftLegWear']}/>
        <WearOptionPicker values={states['leftLegWearOptions'].state} onChangeValues={callbacks['leftLegWearOptions']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={states['leftKnee'].state} onChange={callbacks['leftKnee']}/>
      </div>
      <h3>右脚</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={legHorizontalIcons} value={states['rightLegHorizontal'].state} onChange={callbacks['rightLegHorizontal']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={legVerticalIcons} value={states['rightLegVertical'].state} onChange={callbacks['rightLegVertical']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={wearIcons} value={states['rightLegWear'].state} onChange={callbacks['rightLegWear']}/>
        <WearOptionPicker values={states['rightLegWearOptions'].state} onChangeValues={callbacks['rightLegWearOptions']}/>
      </div>
      <div className="searchpane__row">
        <IconGroupPicker icons={lineIcons} value={states['rightKnee'].state} onChange={callbacks['rightKnee']}/>
      </div>
      <h3>その他</h3>
      <div className="searchpane__row">
        <IconGroupPicker icons={sleepIcons} value={states['sleep'].state} onChange={callbacks['sleep']}/>
      </div>
    </div>
  );
};

const initialTabs = [
  { id: 'person-add', title: '＋', specialTabType: 'new', },
  { id: 'information', title: '情報', },
];

const EditPane: React.FC<{

}> = ({  }) => {

  const [personTabs, setPersonTabs] = useState([{ id: 'person-1', title: '人間', data: { name: '人間' } as Partial<PersonData> }]);
  const [selectedTabId, setSelectedTabId] = useState('information');
  const [currentTabPersonData, setCurrentTabPersonData] = useState({ name: '人間' } as Partial<PersonData>);

  const handleAddTab = useCallback(() => {
    const ids = personTabs
      .map((tab) => parseInt(tab.id.split('-')[1]))
      .sort((a, b) => a > b ? -1 : a === b ? 0 : 1);
    const maxId = ids[0] ?? 0;

    const newTabs = [...personTabs];
    newTabs.push({
      id: `person-${maxId + 1}`,
      title: '人間',
      data: { name: '人間' },
    });

    setPersonTabs(newTabs);
  }, [personTabs, setPersonTabs]);

  const handleRemoveTab = useCallback(() => {
    const activePersonTab = personTabs.find((tab) => tab.id === selectedTabId);
    if (!activePersonTab || !confirm('本当に削除しますか？')) return;

    const newTabs = personTabs.filter((tab) => tab.id !== selectedTabId);

    setPersonTabs(newTabs);
    setSelectedTabId(newTabs[0]?.id ?? 'information');
  }, [selectedTabId, setPersonTabs, personTabs, setSelectedTabId]);

  const handleTabChange = useCallback((value: string) => {
    if (value === 'person-add') {
      handleAddTab();
      return;
    }

    if (selectedTabId.startsWith('person-')) {
      const currentTab = personTabs.find((tab) => tab.id === selectedTabId);
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
  }, [selectedTabId, setSelectedTabId, personTabs, setPersonTabs, currentTabPersonData, setCurrentTabPersonData]);

  const handlePersonChange = useCallback((value: PersonData, diff: { key: string; value: any; }) => {
    if (diff.key === 'name') {
      const activePersonTab = personTabs.find((tab) => tab.id === selectedTabId);
      if (!activePersonTab) return;

      activePersonTab.title = diff.value;
      setPersonTabs([...personTabs]);
    }

    setCurrentTabPersonData(value);
  }, [selectedTabId, personTabs, setPersonTabs, setCurrentTabPersonData]);

  const tabs = [...personTabs, ...initialTabs];

  return (
    <div className="editpane pane">
      <h2>編集</h2>
      <div className="pane-contents">
        <TabHeaderGroup headers={tabs} selectedId={selectedTabId} onChange={handleTabChange}/>
        <div className="tab-contents">
          {selectedTabId.startsWith('person-') && (
            <>
              <button onClick={handleRemoveTab}>削除</button>
              <PersonEditor onChange={handlePersonChange} initialData={currentTabPersonData}/>
            </>
          )}
          {selectedTabId === 'information' && (
            <div>
              <h3>評価</h3>
              <h3>作者名</h3>
              <input type="text"/>
              <h3>URL</h3>
              <input type="text"/>
              <h3>メモ</h3>
              <textarea rows={4}/>
            </div>
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
