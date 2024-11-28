import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ArticleType } from '@/pages/management/articleType/entity';
import articleTypeAPI from '../api/services/articleTypeAPI';

const initialState: {
   articleTypes: ArticleType[];
   loading: boolean;
   error: string | null;
} = {
   articleTypes: [],
   loading: false,
   error: null,
};

const articleTypeSlice = createSlice({
   name: 'office',
   initialState,
   reducers: {
      setArticleTypesSlice: (state, action: PayloadAction<ArticleType[]>) => {
         state.articleTypes = action.payload;
      },
      clearArticleTypes: (state) => {
         state.articleTypes = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setArticleTypesSlice, clearArticleTypes, setLoading, setError } = articleTypeSlice.actions;
export const articleTypeReducer = articleTypeSlice.reducer;
