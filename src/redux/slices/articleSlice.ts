import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Article } from '@/pages/management/article/entity';

const initialState: {
   articles: Article[];
   loading: boolean;
   error: string | null;
} = {
   articles: [],
   loading: false,
   error: null,
};

const articleSlice = createSlice({
   name: 'article',
   initialState,
   reducers: {
      setArticlesSlice: (state, action: PayloadAction<Article[]>) => {
         state.articles = action.payload;
      },
      clearArticle: (state) => {
         state.articles = [];
      },
      setLoading: (state, action: PayloadAction<boolean>) => {
         state.loading = action.payload;
      },
      setError: (state, action: PayloadAction<string | null>) => {
         state.error = action.payload;
      },
   },
});

export const { setArticlesSlice, clearArticle, setLoading, setError } = articleSlice.actions;
export const articleReducer = articleSlice.reducer;
