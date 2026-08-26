import { Routes, Route } from "react-router-dom";

import MainLayout from "../layouts/MainLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

import RoutePath from "../core/constants/routes.constant.js";
import { USER_ROLES } from "../core/constants/app.constants.js";

{/* ================= PUBLIC ROUTES ================= */}

import HomePage from "../modules/marketing/pages/HomePage.jsx";
import AboutPage from "../modules/marketing/pages/AboutPage.jsx";
import ContactPage from "../modules/marketing/pages/ContactPage.jsx";
import Features from "../modules/marketing/pages/Features.jsx";
import LoginPage from "../modules/auth/pages/LoginPage.jsx";
import SignupPage from "../modules/auth/pages/SignupPage.jsx";


import DashboardPage from "../modules/dashboard/pages/DashboardPage.jsx";
import FarmerDashboardPage from "../modules/dashboard/pages/FarmerDashboardPage.jsx";
import DoctorDashboardPage from "../modules/dashboard/pages/DoctorDashboardPage.jsx";
import SettingsPage from "../modules/dashboard/pages/SettingsPage.jsx";

import FarmersPage from "../modules/farmers/pages/FarmersPage.jsx";
import DoctorsPage from "../modules/doctors/pages/DoctorsPage.jsx";
import DoctorProfilePage from "../modules/doctors/pages/ProfilePage.jsx";
import FarmsPage from "../modules/farms/pages/FarmsPage.jsx";
import MyFarmPage from "../modules/farms/pages/MyFarmPage.jsx";
import MilkCentersPage from "../modules/milk-centers/pages/MilkCentersPage.jsx";
import AnimalsPage from "../modules/animals/pages/AnimalsPage.jsx";
import MilkProductionPage from "../modules/milk/pages/MilkProductionPage.jsx";
import FeedManagementPage from "../modules/feed/pages/FeedManagementPage.jsx";
import DmiCalculatorPage from "../modules/dmi/pages/DmiCalculatorPage.jsx";
import HealthRecordsPage from "../modules/health/pages/HealthRecordsPage.jsx";
import BreedingRecordsPage from "../modules/breeding/pages/BreedingRecordsPage.jsx";
import MastitisRecordsPage from "../modules/mastitis/pages/MastitisRecordsPage.jsx";
import FinanceManagementPage from "../modules/finance/pages/FinanceManagementPage.jsx";
import ReportsPage from "../modules/reports/pages/ReportsPage.jsx";
import MarketplacePage from "../modules/marketplace/pages/MarketplacePage.jsx";
import DoctorPortalLayout from "../layouts/DoctorPortalLayout.jsx";
import RequestsPage from "../modules/doctor-requests/pages/RequestsPage.jsx";

const AppRoutes = () => {
  return (
    <Routes>

      {/* ================= PUBLIC ROUTES ================= */}

      <Route element={<MainLayout />}>
        <Route path={RoutePath.HOME} element={<HomePage />} />
        <Route path={RoutePath.ABOUT} element={<AboutPage />} />
        <Route path={RoutePath.CONTACT} element={<ContactPage />} />
        <Route path={RoutePath.LOGIN} element={<LoginPage />} />
        <Route path={RoutePath.SIGNUP} element={<SignupPage />} />
        <Route path={RoutePath.FEATURES} element={<Features />} />
      </Route>

      {/* ================= DOCTOR PORTAL ================= */}

      <Route element={<DoctorPortalLayout />}>
        <Route
          path={RoutePath.DOCTOR_DASHBOARD}
          element={<DoctorDashboardPage />}
        />
        <Route path={RoutePath.DOCTOR_REQUESTS} element={<RequestsPage />} />
        <Route
          path={RoutePath.DOCTOR_ASSIGNED_ANIMALS}
          element={<AnimalsPage />}
        />
        <Route
          path={RoutePath.DOCTOR_HEALTH_RECORDS}
          element={<HealthRecordsPage />}
        />
        <Route
          path={RoutePath.DOCTOR_MASTITIS_CASES}
          element={<MastitisRecordsPage />}
        />
        <Route path={RoutePath.DOCTOR_PROFILE} element={<DoctorProfilePage />} />
      </Route>

      {/* ================= DASHBOARD LAYOUT (authenticated) ================= */}

        <Route element={<DashboardLayout />}>

          {/* ================= SUPER ADMIN ================= */}

          <Route
          //   element={
          //   <ProtectedRoute
          //     allowedRoles={[USER_ROLES.SUPER_ADMIN]}
          //   />
          // }
          >
            <Route
              path={RoutePath.ADMIN_DASHBOARD}
              element={<DashboardPage />}
            />
            <Route path={RoutePath.ADMIN_FARMERS} element={<FarmersPage />} />
            <Route path={RoutePath.ADMIN_DOCTORS} element={<DoctorsPage />} />
            <Route path={RoutePath.ADMIN_FARMS} element={<FarmsPage />} />
            <Route
              path={RoutePath.ADMIN_MILK_CENTERS}
              element={<MilkCentersPage />}
            />
            <Route path={RoutePath.ADMIN_SETTINGS} element={<SettingsPage />} />
          </Route>

          {/* ================= FARMER ================= */}

          <Route
            // element={
            //   <ProtectedRoute
            //     allowedRoles={[USER_ROLES.FARMER]}
            //   />
            // }
          >
            <Route
              path={RoutePath.FARMER_DASHBOARD}
              element={<FarmerDashboardPage />}
            />
            <Route path={RoutePath.FARMER_FARM} element={<MyFarmPage />} />
            <Route path={RoutePath.FARMER_ANIMALS} element={<AnimalsPage />} />
            <Route
              path={RoutePath.FARMER_MILK_PRODUCTION}
              element={<MilkProductionPage />}
            />
            <Route
              path={RoutePath.FARMER_FEED_MANAGEMENT}
              element={<FeedManagementPage />}
            />
            <Route
              path={RoutePath.FARMER_DMI_CALCULATOR}
              element={<DmiCalculatorPage />}
            />
            <Route
              path={RoutePath.FARMER_HEALTH_RECORDS}
              element={<HealthRecordsPage />}
            />
            <Route
              path={RoutePath.FARMER_BREEDING_RECORDS}
              element={<BreedingRecordsPage />}
            />
            <Route
              path={RoutePath.FARMER_MASTITIS_RECORDS}
              element={<MastitisRecordsPage />}
            />
            <Route
              path={RoutePath.FARMER_FINANCE_MANAGEMENT}
              element={<FinanceManagementPage />}
            />
            <Route path={RoutePath.FARMER_REPORTS} element={<ReportsPage />} />
            <Route
              path={RoutePath.FARMER_MARKETPLACE}
              element={<MarketplacePage />}
            />
            <Route path={RoutePath.FARMER_SETTINGS} element={<SettingsPage />} />
          </Route>

        </Route>

    </Routes>
  );
};

export default AppRoutes;

