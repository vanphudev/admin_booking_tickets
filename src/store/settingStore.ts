import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

import { StorageEnum, ThemeColorPresets, ThemeLayout, ThemeMode } from '#/enum';

type SettingsType = {
   themeColorPresets: ThemeColorPresets;
   themeMode: ThemeMode;
   themeLayout: ThemeLayout;
   themeStretch: boolean;
   breadCrumb: boolean;
   multiTab: boolean;
};
type SettingStore = {
   settings: SettingsType;

   actions: {
      setSettings: (settings: SettingsType) => void;
      clearSettings: () => void;
   };
};

const useSettingStore = create<SettingStore>()(
   persist(
      (set) => ({
         settings: {
            themeColorPresets: ThemeColorPresets.Default,
            themeMode: ThemeMode.Light,
            themeLayout: ThemeLayout.Vertical,
            themeStretch: false,
            breadCrumb: true,
            multiTab: true,
         },
         actions: {
            setSettings: (settings) => {
               set({ settings });
            },
            clearSettings() {
               useSettingStore.persist.clearStorage();
            },
         },
      }),
      {
         name: StorageEnum.Settings, // name of the item in the storage (must be unique)
         storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
         partialize: (state) => ({ [StorageEnum.Settings]: state.settings }),
      },
   ),
);

export const useSettings = () => useSettingStore((state) => state.settings);
export const useSettingActions = () => useSettingStore((state) => state.actions);
