import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  createApi,
  fetchBaseQuery,
} from "@reduxjs/toolkit/query/react";

import { prepareHeadersWithAuth } from "./prepareHeadersAuth";
import { logout } from "@/features/auth/slice";
import { clearStoredSession } from "@/auth/session";
import { API_BASE_URL } from "@/config/runtime";

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: prepareHeadersWithAuth,
});

const baseQueryWithAuthHandling: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    try {
      await clearStoredSession();
    } finally {
      api.dispatch(logout());
    }
  }

  return result;
};

export const api = createApi({
  reducerPath: "api",
  tagTypes: ["WalletBalance", "WalletTransactions", "Me"],
  baseQuery: baseQueryWithAuthHandling,
  keepUnusedDataFor: 60 * 20,
  refetchOnFocus: true,
  refetchOnReconnect: true,
  endpoints: () => ({}),
});
