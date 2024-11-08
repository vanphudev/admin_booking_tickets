import { createGlobalStyle } from 'styled-components';

import { ThemeMode } from '#/enum';

const GlobalScrollbarStyle = createGlobalStyle<{ $themeMode?: ThemeMode }>`
   ::-webkit-scrollbar {
      width: 8px;
   }

   ::-webkit-scrollbar-track {
      border-radius: 8px;
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#2c2c2c' : '#FAFAFA')};
   }

   ::-webkit-scrollbar-thumb {
      border-radius: 10px;
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#6b6b6b' : '#C1C1C1')};
   }

   ::-webkit-scrollbar-thumb:hover {
      background: ${(props) => (props.$themeMode === ThemeMode.Dark ? '#939393' : '#7D7D7D')};
   }

   ::-webkit-scrollbar-corner {
      background: transparent;
   }
`;
export default GlobalScrollbarStyle;
