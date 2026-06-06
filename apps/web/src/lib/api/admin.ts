// Super admin dashboard API helper
import { admin, apiFetch } from "../api";

interface AdminDashboardStats {
  totalCompanies: number;
  totalUsers: number;
  totalPackages: number;
  totalModules: number;
  activeSubscriptions: number;
  storageConfigured: boolean;
  emailConfigured: boolean;
  paymentConfigured: boolean;
}

interface AdminSettings {
  id: string;
  storageProvider?: string;
  emailProvider?: string;
  paymentProvider?: string;
  createdAt: string;
  updatedAt: string;
}

export const adminDashboard = {
  // Get all companies
  getCompanies: () => admin.listCompanies(),

  // Get all users
  getUsers: () => admin.listUsers(),

  // Get all packages
  getPackages: () => admin.listPackages(),

  // Get all modules
  getModules: () => admin.listModules(),

  // Get admin settings
  async getSettings(): Promise<AdminSettings> {
    try {
      const data = await apiFetch<AdminSettings>("/admin/settings");
      return data;
    } catch (error) {
      console.error("Error fetching admin settings:", error);
      return {
        id: "",
        createdAt: "",
        updatedAt: "",
      };
    }
  },

  // Calculate dashboard stats
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [companies, users, packages, modules, settings] = await Promise.all([
        this.getCompanies(),
        this.getUsers(),
        this.getPackages(),
        this.getModules(),
        this.getSettings(),
      ]);

      return {
        totalCompanies: companies.length,
        totalUsers: users.length,
        totalPackages: packages.length,
        totalModules: modules.length,
        activeSubscriptions: companies.length,
        storageConfigured: !!settings.storageProvider,
        emailConfigured: !!settings.emailProvider,
        paymentConfigured: !!settings.paymentProvider,
      };
    } catch (error) {
      console.error("Error calculating dashboard stats:", error);
      return {
        totalCompanies: 0,
        totalUsers: 0,
        totalPackages: 0,
        totalModules: 0,
        activeSubscriptions: 0,
        storageConfigured: false,
        emailConfigured: false,
        paymentConfigured: false,
      };
    }
  },
};
