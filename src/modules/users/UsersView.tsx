"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  X,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  Mail,
  Phone as PhoneIcon,
  User as UserIcon,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

import SectionTitle from "@/components/common/SectionTitle";

// Type definitions for robust Next.js TypeScript support
export type UserRole = "USER" | "MANAGER" | "ADMIN" | "SUPPORT";
export type UserGroup =
  | "RETAILER"
  | "DISTRIBUTOR"
  | "WHOLESALER"
  | "ENTERPRISE";
export type UserStatus = "Active" | "Inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  group: UserGroup;
  status: UserStatus;
  locked: boolean;
  joined: string;
}

export interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

export interface UserFormData {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  group: UserGroup;
  status: UserStatus;
  locked: boolean;
}

export interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
}

// Pre-seeded high quality initial user data
const INITIAL_USERS: User[] = [
  {
    id: "1",
    name: "Vasudev Sharma",
    email: "vasu14082@gmail.com",
    phone: "8976352629",
    role: "USER",
    group: "RETAILER",
    status: "Active",
    locked: false,
    joined: "27 May 2026",
  },
  {
    id: "2",
    name: "Arjun Mehta",
    email: "arjun.mehta@nexus.com",
    phone: "9812345670",
    role: "ADMIN",
    group: "DISTRIBUTOR",
    status: "Active",
    locked: false,
    joined: "14 Feb 2026",
  },
  {
    id: "3",
    name: "Samantha Reed",
    email: "samantha.r@retailco.org",
    phone: "7654321098",
    role: "USER",
    group: "RETAILER",
    status: "Inactive",
    locked: true,
    joined: "03 Dec 2025",
  },
  {
    id: "4",
    name: "Priya Patel",
    email: "priya.patel@sharmagroup.in",
    phone: "9123456789",
    role: "MANAGER",
    group: "WHOLESALER",
    status: "Active",
    locked: false,
    joined: "18 Apr 2026",
  },
  {
    id: "5",
    name: "Marcus Aurelius",
    email: "marcus.philosophy@empire.it",
    phone: "8887776665",
    role: "USER",
    group: "RETAILER",
    status: "Active",
    locked: false,
    joined: "01 Jan 2026",
  },
];

export function UsersView() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);

  // Custom Toast Notification State
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Form states for Add/Edit
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    phone: "",
    role: "USER",
    group: "RETAILER",
    status: "Active",
    locked: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  // Trigger Toast Notification
  const showToast = (message: string, type: Toast["type"] = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Filter users based on search term (name or email)
  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  // Open Modal for creation
  const handleAddUserClick = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      role: "USER",
      group: "RETAILER",
      status: "Active",
      locked: false,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Open Modal for editing
  const handleEditUserClick = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      group: user.group,
      status: user.status,
      locked: user.locked,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  // Validate form inputs
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,12}$/.test(formData.phone.replace(/[\s-]/g, ""))) {
      newErrors.phone = "Please enter a valid phone number (10-12 digits)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit User Form (Create / Update)
  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (editingUser) {
      // Edit mode
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? {
                ...u,
                ...formData,
              }
            : u,
        ),
      );
      showToast(`User "${formData.name}" has been updated successfully!`);
    } else {
      // Add mode
      const newUser: User = {
        id: Date.now().toString(),
        ...formData,
        joined: new Date().toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      };
      setUsers((prev) => [newUser, ...prev]);
      showToast(`User "${formData.name}" has been successfully added!`);
    }
    setIsModalOpen(false);
  };

  // Quick Action: Toggle Lock
  const handleToggleLock = (userId: string, currentLockState: boolean) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId ? { ...u, locked: !currentLockState } : u,
      ),
    );
    showToast(
      currentLockState
        ? "User unlocked successfully"
        : "User locked successfully",
      currentLockState ? "success" : "info",
    );
  };

  // Safe Deletion with beautiful inline confirmation modal
  const handleConfirmDelete = () => {
    if (!deletingUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deletingUser.id));
    showToast(`User "${deletingUser.name}" has been removed.`, "error");
    setDeletingUser(null);
  };

  return (
    <>
      {/* Header Block matching visual layout */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <SectionTitle
          title="Users"
          paragraph={`${filteredUsers.length} ${filteredUsers.length === 1 ? "user" : "users"}`}
        />
        <div>
          <button
            onClick={handleAddUserClick}
            className="inline-flex items-center gap-2 rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-all duration-200 cursor-pointer group transform active:scale-[0.98]"
          >
            <Plus
              size={18}
              className="stroke-[3] transition-transform group-hover:rotate-90 duration-300"
            />
            <span>Add User</span>
          </button>
        </div>
      </div>
      {/* Dynamic Toast Container using Framer Motion Layout animations */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: 100 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className={`pointer-events-auto flex items-center justify-between p-4 rounded-xl shadow-lg border text-sm font-medium ${
                toast.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                  : toast.type === "error"
                    ? "bg-rose-50 text-rose-800 border-rose-100"
                    : "bg-blue-50 text-indigo-900 border-blue-100"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    toast.type === "success"
                      ? "bg-emerald-500"
                      : toast.type === "error"
                        ? "bg-rose-500"
                        : "bg-indigo-500"
                  }`}
                />
                <p>{toast.message}</p>
              </div>
              <button
                onClick={() =>
                  setToasts((prev) => prev.filter((t) => t.id !== toast.id))
                }
                className="text-slate-400 hover:text-slate-600 transition-colors ml-4"
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Search Bar Block with precision borders */}
        <div className="mb-6 relative max-w-sm">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">
            <Search size={17} />
          </span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-[14px] text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all shadow-sm"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Main Users Table Board Container */}
        <div className="bg-white dark:bg-dark rounded-xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[13px] font-semibold text-slate-500 select-none bg-slate-50/50">
                  <th className="py-4 px-6 font-semibold">Name</th>
                  <th className="py-4 px-4 font-semibold">Email</th>
                  <th className="py-4 px-4 font-semibold">Phone</th>
                  <th className="py-4 px-4 font-semibold">Role</th>
                  <th className="py-4 px-4 font-semibold">Group</th>
                  <th className="py-4 px-4 font-semibold">Status</th>
                  <th className="py-4 px-4 font-semibold">Lock</th>
                  <th className="py-4 px-4 font-semibold">Joined</th>
                  <th className="py-4 px-6 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 text-[14px]">
                <AnimatePresence initial={false}>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <motion.tr
                        key={user.id}
                        layoutId={`user-row-${user.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`hover:bg-slate-50/70 transition-colors ${
                          user.locked ? "bg-slate-50/30" : ""
                        }`}
                      >
                        {/* Name Column */}
                        <td className="py-4 px-6 font-bold text-slate-900">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-bold text-xs ${
                                user.locked
                                  ? "bg-slate-100 text-slate-400"
                                  : "bg-indigo-50 text-[#131553]"
                              }`}
                            >
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .substring(0, 2)
                                .toUpperCase()}
                            </div>
                            <span
                              className={
                                user.locked
                                  ? "line-through text-slate-400 font-medium"
                                  : ""
                              }
                            >
                              {user.name}
                            </span>
                          </div>
                        </td>

                        {/* Email Column */}
                        <td className="py-4 px-4 text-slate-600 font-medium">
                          {user.email}
                        </td>

                        {/* Phone Column */}
                        <td className="py-4 px-4 text-slate-600 tabular-nums">
                          {user.phone}
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center justify-center bg-slate-100 text-slate-600 font-bold text-[11px] px-2.5 py-0.5 rounded-md tracking-wider">
                            {user.role}
                          </span>
                        </td>

                        {/* Group Badge */}
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center justify-center bg-[#f0f2fe] text-[#5c69e5] font-bold text-[11px] px-2.5 py-1 rounded-full tracking-wider border border-[#e3e6fc]">
                            {user.group}
                          </span>
                        </td>

                        {/* Status Badge */}
                        <td className="py-4 px-4">
                          <span
                            className={`inline-flex items-center justify-center font-bold text-[11px] px-3 py-1 rounded-full ${
                              user.status === "Active"
                                ? "bg-[#131553] text-white"
                                : "bg-slate-200 text-slate-600"
                            }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {/* Lock Toggle Action & View */}
                        <td className="py-4 px-4">
                          <button
                            onClick={() =>
                              handleToggleLock(user.id, user.locked)
                            }
                            title={
                              user.locked
                                ? "Click to unlock user account"
                                : "Click to lock user account"
                            }
                            className={`flex items-center gap-1.5 font-medium transition-colors group ${
                              user.locked
                                ? "text-rose-500 hover:text-rose-600"
                                : "text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            {user.locked ? (
                              <>
                                <Lock size={14} className="stroke-[2.5]" />
                                <span className="text-xs font-semibold">
                                  Locked
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-400 font-semibold group-hover:text-slate-600">
                                —
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Joined Date */}
                        <td className="py-4 px-4 text-slate-500 font-medium">
                          {user.joined}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            <button
                              onClick={() => handleEditUserClick(user)}
                              title="Edit user details"
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                            >
                              <Edit2 size={16} className="stroke-[2.5]" />
                            </button>

                            <button
                              onClick={() => setDeletingUser(user)}
                              title="Delete user"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr key="no-results-row">
                      <td
                        colSpan={9}
                        className="py-12 text-center text-slate-400 bg-slate-50/20"
                      >
                        <div className="flex flex-col items-center justify-center gap-2">
                          <AlertTriangle className="text-slate-300" size={32} />
                          <p className="font-semibold text-slate-600">
                            No users found
                          </p>
                          <p className="text-xs text-slate-400">
                            Try modifying your search or add a new user.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {/* Footer of user summary inside listing box */}
          <div className="bg-slate-50/50 px-6 py-4 border-t border-slate-100 text-xs text-slate-400 flex items-center justify-between font-medium">
            <span>
              Showing {filteredUsers.length} of {users.length} total entries
            </span>
            <span>Active Dashboard Control Suite</span>
          </div>
        </div>
      </div>

      {/* Real Framer-Motion Animated Add/Edit User Modal Overlay */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            {/* Backdrop: Smoothly Fades In/Out */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* Modal Container: Smooth Spring-Loaded entry bounce */}
            <motion.div
              initial={{ opacity: 0, scale: 0.93, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 380,
                damping: 30,
                mass: 0.8,
                bounce: 0.15,
              }}
              className="bg-white rounded-2xl w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden relative z-10"
            >
              {/* Modal Header */}
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/40">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-[#131553]">
                    {editingUser ? (
                      <Edit2 size={18} className="stroke-[2.5]" />
                    ) : (
                      <UserPlusIcon size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {editingUser ? "Edit User Details" : "Add New User"}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {editingUser
                        ? "Update account parameters and credentials."
                        : "Create a fresh system-level operator record."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-4">
                  {/* Name Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                        <UserIcon size={16} />
                      </span>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        placeholder="e.g. Vasudev Sharma"
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                          errors.name
                            ? "border-rose-400 focus:border-rose-500"
                            : "border-slate-200 focus:border-indigo-500"
                        }`}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-xs text-rose-500 mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                        <Mail size={16} />
                      </span>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        placeholder="e.g. vasu14082@gmail.com"
                        className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                          errors.email
                            ? "border-rose-400 focus:border-rose-500"
                            : "border-slate-200 focus:border-indigo-500"
                        }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-rose-500 mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Grid layout for Phone & Role */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Phone Input */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Phone Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 pointer-events-none">
                          <PhoneIcon size={16} />
                        </span>
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          placeholder="e.g. 8976352629"
                          className={`w-full pl-10 pr-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-100 ${
                            errors.phone
                              ? "border-rose-400 focus:border-rose-500"
                              : "border-slate-200 focus:border-indigo-500"
                          }`}
                        />
                      </div>
                      {errors.phone && (
                        <p className="text-xs text-rose-500 mt-1">
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    {/* Role Dropdown */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        System Role
                      </label>
                      <select
                        value={formData.role}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            role: e.target.value as UserRole,
                          })
                        }
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                      >
                        <option value="USER">USER</option>
                        <option value="MANAGER">MANAGER</option>
                        <option value="ADMIN">ADMIN</option>
                        <option value="SUPPORT">SUPPORT</option>
                      </select>
                    </div>
                  </div>

                  {/* Grid layout for Group & Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Group Select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Commercial Group
                      </label>
                      <select
                        value={formData.group}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            group: e.target.value as UserGroup,
                          })
                        }
                        className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all font-semibold text-slate-700"
                      >
                        <option value="RETAILER">RETAILER</option>
                        <option value="DISTRIBUTOR">DISTRIBUTOR</option>
                        <option value="WHOLESALER">WHOLESALER</option>
                        <option value="ENTERPRISE">ENTERPRISE</option>
                      </select>
                    </div>

                    {/* Status Radio / Select */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                        Initial Status
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, status: "Active" })
                          }
                          className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                            formData.status === "Active"
                              ? "bg-[#131553] border-[#131553] text-white"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, status: "Inactive" })
                          }
                          className={`flex-1 py-2.5 rounded-lg border text-xs font-bold transition-all ${
                            formData.status === "Inactive"
                              ? "bg-slate-200 border-slate-300 text-slate-700"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          Inactive
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Quick Toggle: Locked State */}
                  <div className="p-3 bg-slate-50 rounded-xl flex items-center justify-between border border-slate-100 mt-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          formData.locked
                            ? "bg-rose-100 text-rose-600"
                            : "bg-slate-200/60 text-slate-500"
                        }`}
                      >
                        {formData.locked ? (
                          <Lock size={15} />
                        ) : (
                          <Unlock size={15} />
                        )}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-700">
                          Account Lock Restriction
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          Lock user access instantly from logging in.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, locked: !formData.locked })
                      }
                      className={`w-11 h-6 rounded-full transition-colors relative flex items-center ${
                        formData.locked ? "bg-rose-500" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform absolute ${
                          formData.locked ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Form Actions Footer */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg text-sm font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#131553] hover:bg-[#1f2275] text-white rounded-lg text-sm font-semibold transition-all shadow-sm active:scale-95"
                  >
                    {editingUser ? "Save Changes" : "Create User"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Real Premium Framer-Motion Animated Custom Deletion Confirmation Dialog */}
      <AnimatePresence>
        {deletingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeletingUser(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40"
            />

            {/* Confirmation Dialog Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="bg-white rounded-2xl w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-100 overflow-hidden relative z-50"
            >
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                    <HelpCircle size={24} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Remove Account Operator?
                    </h3>
                    <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
                      Are you sure you want to delete{" "}
                      <strong className="text-slate-800 font-bold">
                        {deletingUser.name}
                      </strong>
                      ? All parameters, associations, and credentials will be
                      permanently erased. This cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200/50 rounded-lg text-sm font-semibold transition-all"
                >
                  Keep Account
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold transition-all active:scale-95"
                >
                  Yes, Delete User
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// Inline Helper SVG Icon since lucide user-plus may vary in standard import paths
interface UserPlusIconProps {
  size?: number;
}
function UserPlusIcon({ size = 18 }: UserPlusIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}
