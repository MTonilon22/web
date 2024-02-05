import type { RouteRecordRaw } from "vue-router";
import { createRouter, createWebHistory } from "vue-router";
import { setPageTitle, getHistoryLength } from "~/utils/page";
import { validateLogin } from "~/utils/network";
import { useStore } from "~/store";
import { Config } from "~/config";
import { AuthType } from "~/types/enums";
import { toast } from "vue3-toastify";
import { getStore } from "~/utils/storage";

/**
 * The routes of the application.
 */
const routes: RouteRecordRaw[] = [
  {
    path: `/${Config.ICN}`,
    name: "ICT Congress 2024",
    component: () => import("../pages/ictcongress/ICTCongress.vue"),
  },
  {
    path: `/${Config.ICN}/admin`,
    name: "Admin - ICT Congress 2024",
    component: () => import("../pages/ictcongress/ICTAdmin.vue"),
  },
  {
    path: `/${Config.ICN}/admin/login`,
    name: "Login - ICT Congress 2024",
    component: () => import("../pages/ictcongress/ICTLogin.vue"),
  },
  {
    path: "/",
    name: "Home",
    component: () => import("../pages/home/HomePage.vue"),
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("../pages/login/LoginPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/merch",
    name: "Merch",
    component: () => import("../pages/merch/MerchPage.vue"),
  },
  {
    path: "/orders",
    name: "My Orders",
    component: () => import("../pages/orders/OrdersPage.vue"),
  },
  {
    path: "/orders/:uniqueId",
    name: "My Order",
    component: () => import("../pages/orders/OrdersInfo.vue"),
  },
  {
    path: "/merch/:slug",
    name: "Product",
    component: () => import("../pages/merch/MerchProductPage.vue"),
  },
  {
    path: "/merch/:slug/checkout",
    name: "Checkout",
    component: () => import("../pages/merch/MerchCheckoutPage.vue"),
  },
  {
    path: "/bulletin",
    name: "Bulletin",
    component: () => import("../pages/bulletin/BulletinPage.vue"),
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../pages/about/AboutPage.vue"),
  },
  {
    path: "/forum",
    name: "Forum",
    component: () => import("../pages/forum/ForumPage.vue"),
  },
  {
    path: "/profile",
    name: "Profile",
    component: () => import("../pages/profile/ProfilePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/reset/:token",
    name: "Reset password",
    component: () => import("../pages/reset/ResetPage.vue"),
  },
  {
    path: "/admin",
    redirect: "/admin/dashboard",
  },
  {
    path: "/admin/:tab",
    name: "Admin",
    component: () => import("../pages/admin/AdminPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/orders/:reference",
    name: "Order",
    component: () => import("../pages/orders/OrdersInfo.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/admin/login",
    name: "Admin Login",
    component: () => import("../pages/admin/AdminLogin.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/:pathMatch(.*)",
    name: "404 Not Found",
    component: () => import("../pages/NotFound.vue"),
  },
];

// Set initial history length
Config.initialHistoryLength = getHistoryLength();

/**
 * Creates a new router instance.
 */
const router = createRouter({
  history: createWebHistory("./"),
  routes,
});

/**
 * Executes after each route change.
 */
router.beforeEach(async (to, _from, next) => {
  // Set loading to true
  const store = useStore();

  if (!store.isMaintenance) {
    store.isLoading = true;
  }

  if (to.path.includes(Config.ICN as string)) {
    // If going to login page
    const isLoginPage = to.path.includes("login");
    const isRegistrationPage = !to.path.includes("admin");
    const isAdminPage = !isLoginPage && !isRegistrationPage;

    // If has session
    if (!!getStore("iat") && !!getStore("irt")) {
      // If going to login page
      if (isLoginPage) {
        // Redirect to admin page
        return next(`/${Config.ICN}/admin`);
      }

      return next();
    }
 
    if (isAdminPage) {
      return next(`/${Config.ICN}/admin/login`)
    }

    return next();
  }
  
  // If going to route that requres auth
  if (to.meta.requiresAuth) {
    // Is login valid
    const isLoginValid = await validateLogin();

    // If is valid
    if (isLoginValid) {
      // If going to admin page with student role
      if (
        (to.name === "Admin" || to.name === "Admin Login") &&
        store.role === AuthType.STUDENT
      ) {
        toast.warning("You are not allowed to access this page.");
        return next({ name: "Home" });
      }

      // If going to login pages with an admin role
      if (
        (to.name === "Login" || to.name === "Admin Login") &&
        store.role === AuthType.ADMIN
      ) {
        return next({ name: "Admin", params: { tab: "dashboard" } });
      }

      // If going to home and has student role
      if (to.name === "Login" && store.role === AuthType.STUDENT) {
        return next({ name: "Home" });
      }

      // If going to profile and has admin role
      if (to.name === "Profile" && store.role === AuthType.ADMIN) {
        return next({ name: "Home" });
      }

      return next();
    }

    // If going to admin page with no role
    if (to.name === "Admin") {
      return next({ name: "Admin Login" });
    }

    // If going to login
    if (to.name === "Login" || to.name === "Admin Login") return next();
    // Otherwise, return to login
    next({ name: "Login" });
  }

  // If checking out and no checkout details or product is not available
  if (
    to.name === "Checkout" &&
    (!store.checkoutDetails || !store.checkoutDetails?.product.is_available)
  ) {
    // if has previous page
    if (_from.name) {
      // Go to previous page
      return next({ name: _from.name as string });
    }

    // Otherwise, go to merch
    return next({ name: "Merch" });
  }

  next();
});

/**
 * Executes after each route change.
 */
router.afterEach((to, from) => {
  // Get store
  const store = useStore();
  // Set page title
  setPageTitle(
    to.name === "Profile"
      ? store.user.first_name + " " + store.user.last_name
      : (to.name as string)
  );
  // Set loading to false
  store.isLoading = false;

  // If not on page load
  if (!from.name) return;
  // If not on the same page
  if (to.path === from.path) return;

  // Set back button visibility
  store.isShowBackButton =
    window.history.state.position -
      (Config.initialHistoryLength
        ? (Config.initialHistoryLength as number)
        : 0) >
    0;
});

export default router;
