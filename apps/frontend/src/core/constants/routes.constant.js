// src/core/constants/routes.constant.js
import { USER_ROLES } from './app.constants';

class RoutePath {
  // ==================== BASE ROUTES ====================
  static SUPER_ADMIN_BASE = "/admin";
  static FARMER_BASE = "/farmer";
  static DOCTOR_BASE = "/doctor";

  // ==================== PUBLIC ROUTES ====================
  static HOME = "/";
  static ABOUT = "/about";
  static FEATURES = "/features";
  static CONTACT = "/contact";
  static LOGIN = "/login";
  static SIGNUP = "/signup";
  static FORGOT_PASSWORD = "/forgot-password";

  // ======================================================
  // SUPER ADMIN
  // ======================================================

  static ADMIN_DASHBOARD = `${this.SUPER_ADMIN_BASE}/dashboard`;
  static ADMIN_FARMERS = `${this.SUPER_ADMIN_BASE}/farmers`;
  static ADMIN_DOCTORS = `${this.SUPER_ADMIN_BASE}/doctors`;
  static ADMIN_FARMS = `${this.SUPER_ADMIN_BASE}/farms`;
  static ADMIN_MILK_CENTERS = `${this.SUPER_ADMIN_BASE}/milk-centers`;
  static ADMIN_SETTINGS = `${this.SUPER_ADMIN_BASE}/settings`;

  // ======================================================
  // FARMER
  // ======================================================

  static FARMER_DASHBOARD = `${this.FARMER_BASE}/dashboard`;
  static FARMER_FARM = `${this.FARMER_BASE}/farm`;
  static FARMER_ANIMALS = `${this.FARMER_BASE}/animals`;
  static FARMER_MILK_PRODUCTION = `${this.FARMER_BASE}/milk-production`;
  static FARMER_FEED_MANAGEMENT = `${this.FARMER_BASE}/feed-management`;
  static FARMER_DMI_CALCULATOR = `${this.FARMER_BASE}/dmi-calculator`;
  static FARMER_HEALTH_RECORDS = `${this.FARMER_BASE}/health-records`;
  static FARMER_BREEDING_RECORDS = `${this.FARMER_BASE}/breeding-records`;
  static FARMER_MASTITIS_RECORDS = `${this.FARMER_BASE}/mastitis-records`;
  static FARMER_FINANCE_MANAGEMENT = `${this.FARMER_BASE}/finance-management`;
  static FARMER_REPORTS = `${this.FARMER_BASE}/reports`;
  static FARMER_MARKETPLACE = `${this.FARMER_BASE}/marketplace`;
  static FARMER_SETTINGS = `${this.FARMER_BASE}/settings`;

  // ======================================================
  // DOCTOR
  // ======================================================

  static DOCTOR_DASHBOARD = `${this.DOCTOR_BASE}/dashboard`;
  static DOCTOR_REQUESTS = `${this.DOCTOR_BASE}/requests`;
  static DOCTOR_ASSIGNED_ANIMALS = `${this.DOCTOR_BASE}/assigned-animals`;
  static DOCTOR_HEALTH_RECORDS = `${this.DOCTOR_BASE}/health-records`;
  static DOCTOR_MASTITIS_CASES = `${this.DOCTOR_BASE}/mastitis-cases`;
  static DOCTOR_PROFILE = `${this.DOCTOR_BASE}/profile`;
  static DOCTOR_SETTINGS = `${this.DOCTOR_BASE}/settings`;

  // ======================================================
  // COMMON
  // ======================================================

  static UNAUTHORIZED = "/unauthorized";

  static NOT_FOUND = "*";
}

export const ROLE_HOME_ROUTE = {
  [USER_ROLES.SUPER_ADMIN]: RoutePath.ADMIN_DASHBOARD,
  [USER_ROLES.FARMER]: RoutePath.FARMER_DASHBOARD,
  [USER_ROLES.DOCTOR]: RoutePath.DOCTOR_DASHBOARD,
};

export const ROLE_SETTINGS_ROUTE = {
  [USER_ROLES.SUPER_ADMIN]: RoutePath.ADMIN_SETTINGS,
  [USER_ROLES.FARMER]: RoutePath.FARMER_SETTINGS,
  [USER_ROLES.DOCTOR]: RoutePath.DOCTOR_SETTINGS,
};

export default RoutePath;
