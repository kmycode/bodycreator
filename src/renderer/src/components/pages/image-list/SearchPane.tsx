import { pickTagNames, searchImage } from '@renderer/models/utils/imageserializer';
import {
  cubeIcons,
  faceIcons,
  oppaiIcons,
  orAndInfo,
  spineIcons,
  verticalAngleInfoWithZero,
  wearIcons,
} from '../image-preview/components/pickertypes';
import { store, useAppDispatch } from '@renderer/models/store';
import TabHeaderGroup, { TabHeaderItem } from '@renderer/components/parts/TabHeaderGroup';
import { useCallback, useEffect, useState } from 'react';
import { IconGroupPicker, SmallTextButtonGroupPicker } from '../image-preview/components/pickers';
import {
  generateCallbacks,
  generateStates,
  StateType,
  updateInitialData,
} from '../image-preview/utils/entity_data_converters';
import {
  generateImageSearchQueryData,
  ImageSearchPersonQueryData,
  ImageSearchQueryData,
  updateTabData,
  WindowTab,
} from '@renderer/models/entities/window_tab_group';

interface ImageSearchPersonQuery {
  faceHorizontal: number[];
  faceVertical: number[];
  chestHorizontal: number[];
  chestVertical: number[];
  bodySpine: number[];
  bodyWear: number[];
  oppaiSize: number[];
  waistHorizontal: number[];
}

export interface ImageSearchQuery {
  person: ImageSearchPersonQuery;
}

const searchQueryConvertInfo = {
  faceHorizontal: faceIcons,
  faceVertical: verticalAngleInfoWithZero,
  chestHorizontal: cubeIcons,
  chestVertical: verticalAngleInfoWithZero,
  bodySpine: spineIcons,
  bodyWear: wearIcons,
  oppaiSize: oppaiIcons,
  waistHorizontal: cubeIcons,
};

const tagCategoriesOfSearchQuery: { [key: string]: string } = {};

const searchDataToQuery = (data: ImageSearchQueryData): ImageSearchQuery => {
  const stringToNumber = (text: string, info: { id: string; numId: number }[]): number => {
    const item = info.find((i) => i.id === text);
    return item?.numId ?? -1;
  };

  const stringArrayToNumberArray = (text: string[], info: { id: string; numId: number }[]): number[] => {
    return text.map((t) => stringToNumber(t, info)).filter((n) => n >= 0);
  };

  const allTags = store.getState().tagList.items;

  const objectToQuery = (dataObj: object): object => {
    const query = {};
    for (const [key, value] of Object.entries(dataObj)) {
      const info = searchQueryConvertInfo[key];
      const tagCategory = tagCategoriesOfSearchQuery[key];

      if (info) {
        if (typeof value === 'string') {
          query[key] = stringToNumber(value, info);
        } else if (Array.isArray(value)) {
          query[key] = stringArrayToNumberArray(value, info);
        }
      } else if (tagCategory) {
        if (typeof value === 'string') {
          const tagNames = pickTagNames(value);
          const tags = allTags[tagCategory];
          const tagIds = tagNames
            .map((n) => tags.find((t) => t.name === n))
            .filter((t) => t)
            .map((t) => t!.id);
          query[key] = tagIds;
        }
      } else {
        if (typeof value === 'string') {
          query[key] = value;
        } else if (Array.isArray(value)) {
          query[key] = value.map((t: string) => t.trim()).filter((t) => t);
        }
      }
    }

    return query;
  };

  return {
    person: objectToQuery(data.person) as ImageSearchPersonQuery,
  };
};

const personSearchDataKeys = [
  'faceHorizontal',
  'faceVertical',
  'chestHorizontal',
  'chestVertical',
  'bodySpine',
  'bodySpineOrAnd',
  'bodyWear',
  'oppaiSize',
  'waistHorizontal',
];

const personSearchDataTextInputKeys = [];

const personSearchDataStringArrayKeys = [
  'faceHorizontal',
  'faceVertical',
  'chestHorizontal',
  'chestVertical',
  'bodySpine',
  'bodyWear',
  'oppaiSize',
  'waistHorizontal',
];

const PersonSearchInput: React.FC<{
  initialData?: Partial<ImageSearchPersonQueryData>;
  onChange?: (data: ImageSearchPersonQueryData, diff: { key: string; value: StateType }) => void;
}> = ({ initialData, onChange }) => {
  const states = generateStates(personSearchDataKeys, {
    defaultEmptyStringKeys: personSearchDataTextInputKeys,
    stringArrayKeys: personSearchDataStringArrayKeys,
  });

  const callbacks = generateCallbacks(personSearchDataKeys, states, undefined, onChange);

  useEffect(() => {
    updateInitialData(personSearchDataKeys, states, initialData);
  }, [initialData, states]);

  return (
    <div>
      <h3>顔</h3>
      <div className="searchpane__row">
        <SmallTextButtonGroupPicker
          items={verticalAngleInfoWithZero}
          values={states['faceVertical'].state}
          onChangeValues={callbacks['faceVertical']}
          multiple
        />
        <IconGroupPicker
          icons={faceIcons}
          values={states['faceHorizontal'].state}
          onChangeMultiple={callbacks['faceHorizontal']}
          multiple
        />
      </div>
      <h3>胴体</h3>
      <div className="searchpane__row">
        <SmallTextButtonGroupPicker
          items={verticalAngleInfoWithZero}
          values={states['chestVertical'].state}
          onChangeValues={callbacks['chestVertical']}
          multiple
        />
        <IconGroupPicker
          icons={cubeIcons}
          values={states['chestHorizontal'].state}
          onChangeMultiple={callbacks['chestHorizontal']}
          multiple
        />
      </div>
      <div className="searchpane__row">
        <SmallTextButtonGroupPicker
          items={orAndInfo}
          value={states['bodySpineOrAnd'].state}
          onChange={callbacks['bodySpineOrAnd']}
        />
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
          values={states['bodyWear'].state}
          onChangeMultiple={callbacks['bodyWear']}
          multiple
        />
      </div>
      <h3>おっぱい</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={oppaiIcons}
          values={states['oppaiSize'].state}
          onChangeMultiple={callbacks['oppaiSize']}
          multiple
        />
      </div>
      <h3>腰</h3>
      <div className="searchpane__row">
        <IconGroupPicker
          icons={cubeIcons}
          values={states['waistHorizontal'].state}
          onChangeMultiple={callbacks['waistHorizontal']}
          multiple
        />
      </div>
    </div>
  );
};

export const SearchPane: React.FC<{
  tab?: WindowTab;
}> = ({ tab: windowTab }) => {
  const [selectedTabId, setSelectedTabId] = useState('person');
  const [searchData, setSearchData] = useState(generateImageSearchQueryData());

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (windowTab?.type === 'image-list') {
      setSearchData(windowTab.data.searchData);
    }
  }, [windowTab, setSearchData]);

  const handleTabChange = useCallback((id: string) => setSelectedTabId(id), [setSelectedTabId]);

  const handlePersonChange = useCallback(
    (value: ImageSearchPersonQueryData) => {
      const newData = { ...searchData, person: value };
      setSearchData(newData);

      if (windowTab) {
        dispatch(updateTabData({ tabId: windowTab.id, data: { searchData: newData } }));
      }
    },
    [setSearchData, searchData, windowTab, dispatch],
  );

  const handleSearch = useCallback(() => {
    if (!windowTab) return;

    const query = searchDataToQuery(searchData);
    searchImage(query).then((imageIds) => {
      dispatch(updateTabData({ tabId: windowTab.id, data: { filteredImageIds: imageIds } }));
    });
  }, [searchData, dispatch, windowTab]);

  const tabs: TabHeaderItem[] = [
    {
      id: 'person',
      title: '人物',
    },
  ];

  return (
    <div className="searchpane pane">
      <h2>検索</h2>
      <div className="pane-contents">
        <TabHeaderGroup headers={tabs} selectedId={selectedTabId} onChange={handleTabChange} />
        <div className="tab-contents">
          <div className="search-query-input">
            <PersonSearchInput initialData={searchData.person} onChange={handlePersonChange} />
          </div>
          <div className="search-action">
            <button className="primary" onClick={handleSearch}>
              検索
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
