import { api } from "@/api/api";
import { getItemAsync } from "@/auth/secureStorage";
import { REFRESH_TOKEN_KEY } from "./session";

type LogoutResponse = {
  message: string;
};

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    logout: builder.mutation<LogoutResponse, void>({
      queryFn: async (_arg, _api, _extraOptions, baseQuery) => {
        const refreshToken =
          (await getItemAsync(REFRESH_TOKEN_KEY)) ?? "";

        const result = await baseQuery({
          url: "/auth/logout",
          method: "POST",
          body: { refresh_token: refreshToken },
        });

        if (result.error) {
          return { error: result.error };
        }

        return { data: result.data as LogoutResponse };
      },
    }),
  }),
  overrideExisting: false,
});

export const { useLogoutMutation } = authApi;
