import { render, screen } from "@testing-library/react-native";

import { useGetNotificationsQuery } from "@/profile/profile.api";

import Notification from "./notification";

jest.mock("@/profile/profile.api", () => ({
  useGetNotificationsQuery: jest.fn(),
}));

jest.mock("@/hooks/use-pull-to-refresh", () => ({
  usePullToRefresh: (refetch: () => void) => ({
    refreshing: false,
    refreshControl: undefined,
    onRefresh: refetch,
  }),
}));

const mockUseGetNotificationsQuery = jest.mocked(useGetNotificationsQuery);

describe("Notification", () => {
  const refetch = jest.fn();

  beforeEach(() => {
    refetch.mockReset();
    mockUseGetNotificationsQuery.mockReturnValue({
      data: [
        {
          id: "1",
          user_id: "u1",
          title:
            "Your charging session has ended due to power fluctuation or current cut",
          icon: "bolt.fill",
          read_at: null,
          created_at: "2024-01-15T12:00:00.000Z",
        },
      ],
      refetch,
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      currentData: undefined,
      isPending: false,
      status: "fulfilled",
      endpointName: "getNotifications",
      requestId: "r1",
      startedTimeStamp: 0,
      fulfilledTimeStamp: 0,
      originalArgs: undefined,
    } as ReturnType<typeof useGetNotificationsQuery>);
  });

  it("renders notification titles from the API hook", () => {
    render(<Notification />);

    expect(
      screen.getByText(
        "Your charging session has ended due to power fluctuation or current cut",
      ),
    ).toBeTruthy();
  });

  it("shows empty state when there are no notifications", () => {
    mockUseGetNotificationsQuery.mockReturnValue({
      data: [],
      refetch,
      isUninitialized: false,
      isLoading: false,
      isFetching: false,
      isSuccess: true,
      isError: false,
      currentData: undefined,
      isPending: false,
      status: "fulfilled",
      endpointName: "getNotifications",
      requestId: "r2",
      startedTimeStamp: 0,
      fulfilledTimeStamp: 0,
      originalArgs: undefined,
    } as ReturnType<typeof useGetNotificationsQuery>);

    render(<Notification />);

    expect(screen.getByText("No notifications yet")).toBeTruthy();
  });
});
