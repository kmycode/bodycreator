import { useCallback, useEffect, useRef, useState } from 'react';
import TabHeaderGroup from '../../../parts/TabHeaderGroup';
import { ReactClickEvent } from '@renderer/models/types';
import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import { clearModalResult, openModal } from '@renderer/models/entities/modal_state';
import {
  BackgroundData,
  backgroundDataToEntity,
  backgroundEntityToData,
  InformationData,
  informationDataToEntity,
  informationEntityToData,
  PersonData,
  personDataToEntity,
  personEntityToData,
  StateType,
} from '../utils/entity_data_converters';
import {
  generateInitialImageBackgroundEntity,
  generateInitialImagePersonEntity,
  Image,
  saveCurrentImage,
  updateCurrentImage,
} from '@renderer/models/entities/image_list';
import { PersonEditor } from './PersonEditor';
import { BackgroundEditor } from './BackgroundEditor';
import { InformationEditor } from './InformationEditor';
import { loadImageElements } from '@renderer/models/utils/imageserializer';

const initialTabs = [{ id: 'information', title: '情報' }];

function makeStateToMutable<T>(from: T, merge?: Partial<T>): T {
  return { ...from, ...merge };
}

interface ElementTab {
  id: string;
  title: string;
  data: Partial<PersonData> | Partial<BackgroundData>;
}

const EditPane: React.FC<{
  imageId: number;
}> = ({ imageId }) => {
  const image = useAppSelector((state) => state.imageList.items[imageId])!;
  const { information: informationEntity, people: personEntities, backgrounds: backgroundEntities } = image;

  const dispatch = useAppDispatch();

  const mutableImage = useRef<Image>(makeStateToMutable(image));
  const [currentImageId, setCurrentImageId] = useState(0);
  const [elementTabs, setElementTabs] = useState([] as ElementTab[]);
  const [selectedTabId, setSelectedTabId] = useState('information');
  const [currentTabElementData, setCurrentTabElementData] = useState({ name: '人間' } as Partial<
    PersonData | BackgroundData
  >);
  const [informationData, setInformationData] = useState({} as InformationData);

  useEffect(() => {
    if (image.loadStatus === 'notyet') {
      loadImageElements(dispatch, imageId);
    }
  }, [image.loadStatus, dispatch, imageId]);

  const handleCurrentImageUpdate = useCallback(
    (diff: (mutableImage: Image) => void, unchange?: boolean) => {
      const newImage = makeStateToMutable(mutableImage.current);

      if (!unchange) {
        newImage.saveStatus = 'ready';
      }
      diff(newImage);
      dispatch(updateCurrentImage(newImage));

      mutableImage.current = newImage;
    },
    [dispatch, mutableImage],
  );

  const handleTabChange = useCallback(
    (value: string, newTabs?: ElementTab[]) => {
      const tabs = newTabs ?? elementTabs;

      const beforeTabId = selectedTabId;

      // 同じ画像内の別の要素タブに切り替える場合
      if (!newTabs) {
        if (['person-', 'background-'].some((s) => beforeTabId.startsWith(s))) {
          const currentTab = tabs.find((tab) => tab.id === beforeTabId);
          if (currentTab) {
            currentTab.data = currentTabElementData;
            setElementTabs([...tabs]);
          }
        }
      }

      const newTab = tabs.find((tab) => tab.id === value);
      if (newTab?.data) {
        setCurrentTabElementData(newTab.data);
      }

      setSelectedTabId(value);
      handleCurrentImageUpdate((newImage) => (newImage.selectedTabId = value), true);
    },
    [
      selectedTabId,
      setSelectedTabId,
      elementTabs,
      setElementTabs,
      currentTabElementData,
      setCurrentTabElementData,
      handleCurrentImageUpdate,
    ],
  );

  useEffect(() => {
    if (image.loadStatus !== 'loaded') return;
    if (!informationEntity) return;

    if (currentImageId !== imageId) {
      setCurrentImageId(imageId);

      // unmount
      dispatch(saveCurrentImage());

      // mount
      mutableImage.current = makeStateToMutable(image, { saveStatus: 'unchanged' });
      dispatch(updateCurrentImage(mutableImage.current));
      const newTabs = personEntities
        .map(
          (e) =>
            ({
              id: `person-${e.idOfImage}`,
              title: e.name,
              data: personEntityToData(e),
            }) as ElementTab,
        )
        .concat()
        .concat(
          backgroundEntities.map(
            (e) =>
              ({
                id: `background-${e.idOfImage}`,
                title: e.name,
                data: backgroundEntityToData(e),
              }) as ElementTab,
          ),
        );
      setCurrentTabElementData({});
      setElementTabs(newTabs);
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
    setElementTabs,
    setSelectedTabId,
    setCurrentTabElementData,
    mutableImage,
    handleTabChange,
    backgroundEntities,
  ]);

  const handleAddTab = useCallback(
    (ev: ReactClickEvent) => {
      const {
        currentTarget: { dataset },
      } = ev;

      const ids = elementTabs
        .map((tab) => parseInt(tab.id.split('-')[1]))
        .sort((a, b) => (a > b ? -1 : a === b ? 0 : 1));
      const maxId = ids[0] ?? 0;

      if (dataset['type'] === 'person') {
        const newData = personEntityToData(
          generateInitialImagePersonEntity({ idOfImage: maxId + 1, name: '人間' }),
        );

        const newTabs = [...elementTabs];
        const pushIndex = newTabs.filter((t) => t.id.startsWith('person-')).length;
        newTabs.splice(pushIndex, 0, {
          id: `person-${newData.idOfImage}`,
          title: '人間',
          data: newData,
        });

        setElementTabs(newTabs);
        handleCurrentImageUpdate((newImage) => {
          const mutablePeople = [
            ...newImage.people,
            personDataToEntity(newData as PersonData, { ...newData, imageId }),
          ];
          newImage.people = mutablePeople;
          newImage.peopleSize = mutablePeople.length;
        });
      } else if (dataset['type'] === 'background') {
        const newData = backgroundEntityToData(
          generateInitialImageBackgroundEntity({ idOfImage: maxId + 1, name: '背景' }),
        );

        const newTabs = [
          ...elementTabs,
          {
            id: `background-${newData.idOfImage}`,
            title: '背景',
            data: newData,
          },
        ];

        setElementTabs(newTabs);
        handleCurrentImageUpdate((newImage) => {
          const mutableBackground = [
            ...newImage.backgrounds,
            backgroundDataToEntity(newData as BackgroundData, { ...newData, imageId }),
          ];
          newImage.backgrounds = mutableBackground;
          newImage.backgroundsSize = mutableBackground.length;
        });
      }
    },
    [elementTabs, setElementTabs, handleCurrentImageUpdate, imageId],
  );

  const handleRemoveTab = useCallback(() => {
    const activePersonTab = elementTabs.find((tab) => tab.id === selectedTabId);
    if (!activePersonTab?.data) return;

    dispatch(
      openModal({
        type: 'confirm',
        parameter: {
          id: 'editpane-remove-element-tab',
          message: `本当に${selectedTabId.startsWith('person-') ? '人間' : '背景'}「${currentTabElementData.name}」を削除しますか？`,
          yesResult: {
            type: 'remove-element-tab',
          },
        },
      }),
    );
  }, [elementTabs, selectedTabId, dispatch, currentTabElementData.name]);

  const modalState = useAppSelector((state) => state.modalState);

  // タブ削除処理
  useEffect(() => {
    if (
      modalState.lastResultId !== 'editpane-remove-element-tab' ||
      modalState.lastResult?.selection !== 'yes'
    )
      return;

    const removeTab = elementTabs.find((tab) => tab.id === selectedTabId);
    if (!removeTab) return;

    const newTabs = elementTabs.filter((tab) => tab.id !== selectedTabId);
    setElementTabs(newTabs);

    handleCurrentImageUpdate((newImage) => {
      newImage.people = newImage.people.filter((p) => p.idOfImage !== removeTab.data.idOfImage);
      newImage.backgrounds = newImage.backgrounds.filter((p) => p.idOfImage !== removeTab.data.idOfImage);
      newImage.peopleSize = newImage.people.length;
      newImage.backgroundsSize = newImage.backgrounds.length;
    });

    setSelectedTabId(newTabs[0]?.id ?? 'information');
    dispatch(clearModalResult());
  }, [
    modalState,
    selectedTabId,
    setElementTabs,
    setSelectedTabId,
    dispatch,
    elementTabs,
    handleCurrentImageUpdate,
  ]);

  const handleElementChange = useCallback(
    (
      option: { type: 'person'; value: PersonData } | { type: 'background'; value: BackgroundData },
      diff: { key: string; value: StateType },
    ) => {
      const activeElementTab = elementTabs.find((tab) => tab.id === selectedTabId);
      if (!activeElementTab) return;

      if (diff.key === 'name' && typeof diff.value === 'string') {
        activeElementTab.title = diff.value;
        setElementTabs([...elementTabs]);
      }

      setCurrentTabElementData(option.value);
      handleCurrentImageUpdate((newImage) => {
        if (option.type === 'person') {
          const currentEntityIndex = newImage.people.findIndex((p) => p.idOfImage === option.value.idOfImage);
          if (currentEntityIndex < 0) return;

          newImage.people = [...newImage.people];
          newImage.people[currentEntityIndex] = personDataToEntity(
            option.value,
            newImage.people[currentEntityIndex],
          );
        } else {
          const currentEntityIndex = newImage.backgrounds.findIndex(
            (p) => p.idOfImage === option.value.idOfImage,
          );
          if (currentEntityIndex < 0) return;

          newImage.backgrounds = [...newImage.backgrounds];
          newImage.backgrounds[currentEntityIndex] = backgroundDataToEntity(
            option.value,
            newImage.backgrounds[currentEntityIndex],
          );
        }
      });
    },
    [selectedTabId, elementTabs, setElementTabs, setCurrentTabElementData, handleCurrentImageUpdate],
  );

  const handlePersonChange = useCallback(
    (value: PersonData, diff: { key: string; value: StateType }) => {
      handleElementChange({ type: 'person', value }, diff);
    },
    [handleElementChange],
  );

  const handleBackgroundChange = useCallback(
    (value: BackgroundData, diff: { key: string; value: StateType }) => {
      handleElementChange({ type: 'background', value }, diff);
    },
    [handleElementChange],
  );

  const handleInformationChange = useCallback(
    (value: InformationData, diff: { key: string; value: StateType }) => {
      setInformationData(value);
      if (!informationEntity) return;

      handleCurrentImageUpdate((newImage) => {
        newImage.information = informationDataToEntity(value, informationEntity);

        if (diff.key === 'evaluation' && typeof value === 'number') {
          newImage.evaluation = value;
        }
      });
    },
    [setInformationData, handleCurrentImageUpdate, informationEntity],
  );

  const tabs = [...elementTabs, ...initialTabs];

  return (
    <div className="editpane pane">
      <h2>編集</h2>
      <div className="pane-contents">
        <TabHeaderGroup headers={tabs} selectedId={selectedTabId} onChange={handleTabChange} />
        <div className="tab-contents">
          {selectedTabId.startsWith('person-') && (
            <div className="tab-contents__image-element">
              <PersonEditor onChange={handlePersonChange} initialData={currentTabElementData} />
              <button onClick={handleRemoveTab} className="tab-contents__image-element__delete">
                削除
              </button>
            </div>
          )}
          {selectedTabId.startsWith('background-') && (
            <div className="tab-contents__image-element">
              <BackgroundEditor onChange={handleBackgroundChange} initialData={currentTabElementData} />
              <button onClick={handleRemoveTab} className="tab-contents__image-element__delete">
                削除
              </button>
            </div>
          )}
          {selectedTabId === 'information' && (
            <>
              <InformationEditor onChange={handleInformationChange} initialData={informationData} />
              <h3>要素</h3>
              <button data-type="person" onClick={handleAddTab}>
                人物を追加
              </button>
              <button data-type="background" onClick={handleAddTab}>
                背景を追加
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditPane;
