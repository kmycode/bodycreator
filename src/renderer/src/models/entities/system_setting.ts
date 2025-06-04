import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DatabaseSettings {
  databaseVersion: number;
}

export interface AppSettings {}

export interface SystemSetting {
  databaseValues: DatabaseSettings;
  appValues: AppSettings;
}

interface NumberSettingEntity {
  numberValue: number;
  stringValue: '';
  valueType: 1;
}

interface StringSettingEntity {
  numberValue: 0;
  stringValue: string;
  valueType: 2;
}

export type SettingEntity = {
  id: number;
  key: keyof DatabaseSettings | keyof AppSettings;
} & (NumberSettingEntity | StringSettingEntity);

export const generateInitialSettingEntity = (): SettingEntity => {
  return {
    id: 0,
    key: 'databaseVersion',
    stringValue: '',
    numberValue: 0,
    valueType: 1,
  };
};

const initialState: SystemSetting = {
  databaseValues: {
    databaseVersion: 1,
  },
  appValues: {},
};

export const SystemSettingSlice = createSlice({
  name: 'SystemSetting',
  initialState,
  reducers: {
    setSettings: (state, action: PayloadAction<{ database?: SettingEntity[]; app?: SettingEntity[] }>) => {
      if (action.payload.database) {
        state.databaseValues = action.payload.database.reduce((obj, entity) => {
          obj[entity.key] = entity.valueType === 1 ? entity.numberValue : entity.stringValue;
          return obj;
        }, {}) as DatabaseSettings;
      }
      if (action.payload.app) {
        state.appValues = action.payload.app.reduce((obj, entity) => {
          obj[entity.key] = entity.valueType === 1 ? entity.numberValue : entity.stringValue;
          return obj;
        }, {}) as AppSettings;
      }
    },

    updateSettings: (
      state,
      action: PayloadAction<{
        databaseDiff?: { [key: string]: string | number };
        appDiff?: { [key: string]: string | number };
      }>,
    ) => {
      if (action.payload.databaseDiff) {
        const data = state.databaseValues;
        for (const [key, value] of Object.entries(action.payload.databaseDiff)) {
          data[key] = value;
        }
        state.databaseValues = data;
      }
      if (action.payload.appDiff) {
        const data = state.appValues;
        for (const [key, value] of Object.entries(action.payload.appDiff)) {
          data[key] = value;
        }
        state.appValues = data;
      }
    },
  },
});
export default SystemSettingSlice.reducer;
export const { setSettings, updateSettings } = SystemSettingSlice.actions;
