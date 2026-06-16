import { api } from "@/api/api";

/** Matches `models.User` JSON from Vajrabackend `GET /me`. */
export type MeResponse = {
  id: string;
  full_name: string;
  email: string;
  phone_number: string;
  id_tag?: string;
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

const STATIC_SUPPORT_CONFIG: SupportConfig = {
  support: { phone: "+91 88831 61155", email: "care@vajarvolt.com" },
  franchisee: { phone: "+91 80154 53161", email: "franchisee@vajarvolt.com" },
};

export const profileApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<MeResponse, void>({
      query: () => ({ url: "/me", method: "GET" }),
      providesTags: ["Me"],
    }),
    /** Vajrabackend has no notifications API yet — empty list until shipped. */
    getNotifications: builder.query<Notification[], void>({
      queryFn: async () => ({ data: [] }),
    }),
    /** Vajrabackend has no offers API yet — empty list until shipped. */
    getOffers: builder.query<Offer[], void>({
      queryFn: async () => ({ data: [] }),
    }),
    /** Vajrabackend has no `/config/support` — use bundled defaults (same as Help fallbacks). */
    getSupportConfig: builder.query<SupportConfig, void>({
      queryFn: async () => ({ data: STATIC_SUPPORT_CONFIG }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetMeQuery,
  useGetNotificationsQuery,
  useGetOffersQuery,
  useGetSupportConfigQuery,
} = profileApi;
