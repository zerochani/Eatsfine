type QueryParamsValue = string | number | boolean | null;
type Params = Readonly<Record<string, QueryParamsValue>>;

export const queryKeys = {
  auth: {
    all: ["auth"] as const,
    me: () => ["auth", "me"] as const,
  },

  user: {
    all: ["user"] as const,
    me: () => ["user", "me"] as const,
    detail: (userId: string | number) => ["user", "detail", userId] as const,
  },

  restaurant: {
    all: ["restaurant"] as const,

    lists: () => ["restaurant", "list"] as const,
    list: (params?: Params) => ["restaurant", "list", params ?? {}] as const,

    details: () => ["restaurant", "detail"] as const,
    detail: (restaurantId: string | number) =>
      ["restaurant", "detail", restaurantId] as const,

    menus: (restaurantId: string | number) =>
      ["restaurant", restaurantId, "menus"] as const,
    seats: (restaurantId: string | number) =>
      ["restaurant", restaurantId, "seats"] as const,
  },
  reservation: {
    all: ["reservation"] as const,

    lists: () => ["reservation", "list"] as const,
    list: (params?: Params) => ["reservation", "list", params ?? {}] as const,

    details: () => ["reservation", "detail"] as const,
    detail: (reservationId: string | number) =>
      ["reservation", "detail", reservationId] as const,

    availableTimes: (storeId: string | number, params?: Params) =>
      ["reservation", "availableTimes", storeId, params ?? {}] as const,

    availableTables: (storeId: string | number, params?: Params) =>
      ["reservation", "availableTables", storeId, params ?? {}] as const,
  },
  payment: {
    all: ["payment"] as const,
    detail: (paymentId: string | number) =>
      ["payment", "detail", paymentId] as const,
  },
  owner: {
    all: ["owner"] as const,
    restaurants: () => ["owner", "restaurants"] as const,
    restaurant: (restaurantId: string | number) =>
      ["owner", "restaurant", restaurantId] as const,

    menus: () => ["owner", "menus"] as const,
    menuList: (restaurantId: string | number) =>
      ["owner", "menus", restaurantId] as const,

    reservations: () => ["owner", "reservations"] as const,
    reservationList: (restaurantId: string | number, params?: Params) =>
      ["owner", "reservations", restaurantId, params ?? {}] as const,

    seats: (restaurantId: string | number) =>
      ["owner", "seats", restaurantId] as const,
  },
} as const;
