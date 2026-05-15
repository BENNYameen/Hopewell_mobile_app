import { api } from "@/api/api";

export type MeResponse = {
  id: string;
  full_name: string;
  email: string | null;
  phone_number: string;
  auth_provider: string;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  status: string;
  timezone: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  icon: string;
  read_at: string | null;
  created_at: string;
};

export type Offer = {
  id: string;
  title: string;
  subtitle: string;
  details: string;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type SupportConfig = {
  support: { phone: string; email: string };
  franchisee: { phone: string; email: string };
};

export type UpdateProfileRequest = {
  full_name: string;
  email?: string;
};

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: "/me", method: "GET" }),
      providesTags: ["Me"],
    }),
    updateProfile: builder.mutation<MeResponse, UpdateProfileRequest>({
      query: (body) => ({ url: "/me", method: "PATCH", body }),
      invalidatesTags: ["Me"],
    }),
    getNotifications: builder.query<Notification[], void>({
      query: () => ({ url: "/notifications", method: "GET" }),
    }),
    getOffers: builder.query<Offer[], void>({
      query: () => ({ url: "/offers", method: "GET" }),
    }),
    getSupportConfig: builder.query<SupportConfig, void>({
      query: () => ({ url: "/config/support", method: "GET" }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useUpdateProfileMutation,
  useGetNotificationsQuery,
  useGetOffersQuery,
  useGetSupportConfigQuery,
} = profileApi;
