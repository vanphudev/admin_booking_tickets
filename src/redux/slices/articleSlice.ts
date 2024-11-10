import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Article } from '@/pages/management/article/entity';
import articleAPI from '../api/services/articleAPI';

interface ArticleState {
   articles: Article[];
   loading: boolean;
   error: string | null;
}

const initialState: ArticleState = {
   articles: [],
   loading: false,
   error: null,
};

export const fetchArticles = createAsyncThunk('article/getArticles', async () => {
   const response = await articleAPI.getArticles();
   return response;
});

const articleSlice = createSlice({
   name: 'article',
   initialState,
   reducers: {
      setArticles: (state, action: PayloadAction<Article[]>) => {
         state.articles = action.payload;
      },
      clearArticles: (state) => {
         state.articles = [];
      },
   },
   extraReducers: (builder) => {
      builder.addCase(fetchArticles.pending, (state) => {
         state.loading = true;
      });
      builder.addCase(fetchArticles.fulfilled, (state, action) => {
         state.articles = action.payload.data;
         state.loading = false;
      });
      builder.addCase(fetchArticles.rejected, (state, action) => {
         state.error = action.error.message || null;
         state.loading = false;
      });
   },
});

export const { setArticles, clearArticles } = articleSlice.actions;
export const articleReducer = articleSlice.reducer;

// Selectors
export const selectArticles = (state: { article: ArticleState }) => state.article.articles;
export const selectArticleLoading = (state: { article: ArticleState }) => state.article.loading;
export const selectArticleError = (state: { article: ArticleState }) => state.article.error;