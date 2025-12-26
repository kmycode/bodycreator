import { AppSettings, DatabaseSettings, updateSettings } from '@renderer/models/entities/system_setting';
import { WindowTab } from '@renderer/models/entities/window_tab_group';
import { useAppDispatch, useAppSelector } from '@renderer/models/store';
import classNames from 'classnames';
import { ChangeEvent, useCallback, useState } from 'react';

type ConfigTabType = 'base';

export const ConfigPage: React.FC<{
  tab?: WindowTab;
}> = () => {
  const databaseSettings = useAppSelector((state) => state.systemSetting.databaseValues);
  // const appSettings = useAppSelector((state) => state.systemSetting.appValues);

  const dispatch = useAppDispatch();

  const [selectedTabId] = useState('base' as ConfigTabType);

  const saveSetting = useCallback(
    (diff: { database?: Partial<DatabaseSettings>; app?: Partial<AppSettings> }) => {
      const { database, app } = diff;

      dispatch(updateSettings({ databaseDiff: database, appDiff: app }));
    },
    [dispatch],
  );

  const handleCheckboxChange = useCallback(
    (ev: ChangeEvent<HTMLInputElement>) => {
      const element = ev.target as HTMLInputElement;

      saveSetting({ database: { sampleSetting: element.checked ? 1 : 0 } });
    },
    [saveSetting],
  );

  return (
    <div className="config-page">
      <div className="config-page__categories">
        <button
          className={classNames({
            'config-page__categories__item': true,
            selected: selectedTabId === 'base',
          })}
        >
          基本設定
        </button>
      </div>
      <div className="config-page__contents">
        {selectedTabId === 'base' && (
          <>
            <div className="title">
              <h2>基本設定</h2>
            </div>
            <div className="contents-container">
              <div className="contents">
                <label>
                  <input
                    type="checkbox"
                    checked={databaseSettings.sampleSetting !== 0}
                    onChange={handleCheckboxChange}
                  />
                  <span>サンプルの設定項目</span>
                </label>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
