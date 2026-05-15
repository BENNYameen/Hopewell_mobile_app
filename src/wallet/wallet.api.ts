import { api } from "@/api/api";

type WalletBalance = {
  balance: number;
  currency: string;
  status: string;
  locked_amount: number;
};

type WalletTransaction = {
  id: string;
  wallet_id: string;
  transaction_type: "CREDIT" | "DEBIT";
  amount: number;
  currency: string;
  source: string;
  reference_id: string;
  idempotency_key: string;
  status: string;
  description: string;
  created_at: string;
};

type InitiateTopupRequest = {
  amount: number;
};

type InitiateTopupResponse = {
  order_id: string;
  amount: number;
  currency: string;
  key: string;
};

export const walletApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getWalletBalance: builder.query<WalletBalance, void>({
      query: () => ({ url: "/wallet/balance", method: "GET" }),
      providesTags: ["WalletBalance"],
    }),
    getWalletTransactions: builder.query<WalletTransaction[], number | void>({
      query: (limit = 50) => ({
        url: `/wallet/transactions?limit=${limit}`,
        method: "GET",
      }),
      providesTags: ["WalletTransactions"],
    }),
    initiateTopup: builder.mutation<
      InitiateTopupResponse,
      InitiateTopupRequest
    >({
      query: (body) => ({
        url: "/wallet/topup/initiate",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetWalletBalanceQuery,
  useGetWalletTransactionsQuery,
  useInitiateTopupMutation,
} = walletApi;
