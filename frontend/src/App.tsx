import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  type RouteObject,
} from "react-router-dom";
import NotFound from "./pages/NotFound";
import Intro from "./pages/Intro";
import SearchPage from "./pages/SearchPage";
import CustomerSupportPage from "./pages/CustomerSupportPage";
import PublicLayout from "./layouts/PublicLayout";
import StoreRegistrationPage from "./pages/myPage/StoreRegistrationPage";
import MyPageLayout from "./layouts/myPageLayout";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import LoginErrorPage from "./pages/LoginErrorPage";
import SuccessPage from "./pages/payment/SuccessPage";
import FailPage from "./pages/payment/FailPage";
import ReservationCompletePage from "./pages/ReservationCompletePage";
import { PrivateRoute } from "./components/RouteGuards";
import ReservationPage from "./pages/myPage/reservationPage";
import SettingsPage from "./pages/myPage/settingPage";
import SubscriptionPage from "./pages/myPage/subscriptionPage";
import StorePage from "./pages/myPage/storePage";
import OwnerPage from "./pages/ownerPage";
import MyInfoPage from "./pages/myPage/MyInfoPage";

const myPageRoutes: RouteObject = {
  path: "/mypage",
  element: <MyPageLayout />,
  children: [
    { index: true, element: <Navigate to="info" replace /> },
    { path: "info", element: <MyInfoPage /> },
    { path: "settings", element: <SettingsPage /> },
    { path: "subscription", element: <SubscriptionPage /> },
    { path: "reservations", element: <ReservationPage /> },
    { path: "store", element: <StorePage /> },
  ],
};

const privateRoutes: RouteObject = {
  element: <PrivateRoute />,
  errorElement: <NotFound />,
  children: [
    myPageRoutes,
    { path: "/mypage/store/register", element: <StoreRegistrationPage /> },
    { path: "/mypage/store/:storeId", element: <OwnerPage /> },
    { path: "/payment/success", element: <SuccessPage /> },
    { path: "/payment/fail", element: <FailPage /> },
    { path: "/reservation/complete", element: <ReservationCompletePage /> },
  ],
};

const publicLayoutRoutes: RouteObject = {
  element: <PublicLayout />,
  errorElement: <NotFound />,
  children: [{ path: "/search", element: <SearchPage /> }, privateRoutes],
};

const routes: RouteObject[] = [
  { path: "/", element: <Intro />, errorElement: <NotFound /> },
  { path: "/oauth/callback", element: <OAuthCallbackPage /> },
  { path: "/login/error", element: <LoginErrorPage /> },
  {
    path: "/customer-support",
    element: <CustomerSupportPage />,
    errorElement: <NotFound />,
  },

  publicLayoutRoutes,

  { path: "*", element: <NotFound /> },
];

const router = createBrowserRouter(routes);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  );
}
