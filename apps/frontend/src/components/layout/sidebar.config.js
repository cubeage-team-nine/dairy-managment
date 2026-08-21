import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Warehouse,
  Milk,
  Home,
  PawPrint,
  Wheat,
  Calculator,
  HeartPulse,
  Dna,
  Syringe,
  Wallet,
  BarChart3,
  Store,
  Settings,
  Inbox,
  UserCircle,
} from "lucide-react";

import { USER_ROLES } from "../../core/constants/app.constants";
import RoutePath from "../../core/constants/routes.constant";

export const sidebarMenus = {
  [USER_ROLES.SUPER_ADMIN]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: RoutePath.ADMIN_DASHBOARD,
    },

    {
      label: "Farmers",
      icon: Users,
      path: RoutePath.ADMIN_FARMERS,
    },

    {
      label: "Doctors",
      icon: Stethoscope,
      path: RoutePath.ADMIN_DOCTORS,
    },

    {
      label: "Farms",
      icon: Warehouse,
      path: RoutePath.ADMIN_FARMS,
    },

    {
      label: "Milk Centers",
      icon: Milk,
      path: RoutePath.ADMIN_MILK_CENTERS,
    },

    {
      label: "Settings",
      icon: Settings,
      path: RoutePath.ADMIN_SETTINGS,
    },
  ],

  [USER_ROLES.FARMER]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: RoutePath.FARMER_DASHBOARD,
    },

    {
      label: "My Farm",
      icon: Home,
      path: RoutePath.FARMER_FARM,
    },

    {
      label: "Animals",
      icon: PawPrint,
      path: RoutePath.FARMER_ANIMALS,
    },

    {
      label: "Milk Production",
      icon: Milk,
      path: RoutePath.FARMER_MILK_PRODUCTION,
    },

    {
      label: "Feed Management",
      icon: Wheat,
      path: RoutePath.FARMER_FEED_MANAGEMENT,
    },

    {
      label: "DMI Calculator",
      icon: Calculator,
      path: RoutePath.FARMER_DMI_CALCULATOR,
    },

    {
      label: "Health Records",
      icon: HeartPulse,
      path: RoutePath.FARMER_HEALTH_RECORDS,
    },

    {
      label: "Breeding Records",
      icon: Dna,
      path: RoutePath.FARMER_BREEDING_RECORDS,
    },

    {
      label: "Mastities Records",
      icon: Syringe,
      path: RoutePath.FARMER_MASTITIS_RECORDS,
    },

    {
      label: "Finance Management",
      icon: Wallet,
      path: RoutePath.FARMER_FINANCE_MANAGEMENT,
    },

    {
      label: "Reports",
      icon: BarChart3,
      path: RoutePath.FARMER_REPORTS,
    },

    {
      label: "Marketplace",
      icon: Store,
      path: RoutePath.FARMER_MARKETPLACE,
    },

    {
      label: "Settings",
      icon: Settings,
      path: RoutePath.FARMER_SETTINGS,
    },
  ],

  [USER_ROLES.DOCTOR]: [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: RoutePath.DOCTOR_DASHBOARD,
    },

    {
      label: "Requests",
      icon: Inbox,
      path: RoutePath.DOCTOR_REQUESTS,
    },

    {
      label: "Assigned Animals",
      icon: PawPrint,
      path: RoutePath.DOCTOR_ASSIGNED_ANIMALS,
    },

    {
      label: "Health Records",
      icon: HeartPulse,
      path: RoutePath.DOCTOR_HEALTH_RECORDS,
    },

    {
      label: "Mastitis Cases",
      icon: Syringe,
      path: RoutePath.DOCTOR_MASTITIS_CASES,
    },

    {
      label: "Profile",
      icon: UserCircle,
      path: RoutePath.DOCTOR_PROFILE,
    },
  ],
};
