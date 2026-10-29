/**
 * Centralized Role-Based Theme Configuration
 * Strict separation of color palettes per user role:
 * - Student: Blue Theme (#2563EB)
 * - Staff: Purple Theme (#7C3AED)
 * - Admin: Emerald Theme (#059669)
 */

export const roleThemes = {
  student: {
    role: 'student',
    roleLabel: 'Student Portal',
    portalTagline: 'PLACEMENT READINESS & PRACTICE',
    colors: {
      primary: '#2563EB',
      primaryHover: '#1D4ED8',
      secondary: '#DBEAFE',
      secondaryHover: '#BFDBFE',
      accent: '#06B6D4',
      pageBackground: '#F8FAFC',
      cardBackground: '#FFFFFF',
      text: '#0F172A',
      mutedText: '#64748B',
      border: '#E2E8F0',
    },
    classes: {
      // Sidebar & Navigation
      sidebarBrandBg: 'bg-blue-600',
      sidebarBrandText: 'text-blue-600',
      navActiveBg: 'bg-blue-50',
      navActiveText: 'text-blue-700 font-semibold shadow-xs',
      navActiveIcon: 'text-blue-600',
      navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
      badgePrimary: 'bg-blue-600 text-white',
      badgeRole: 'bg-blue-50 text-blue-700 border-blue-200',
      avatarBg: 'bg-blue-600 text-white',
      avatarSoftBg: 'bg-blue-100 text-blue-700',
      
      // Buttons & Interactive
      btnPrimary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-100',
      btnSecondary: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200',
      btnGhost: 'text-blue-600 hover:underline',
      
      // Accent & Status
      focusRing: 'focus:border-blue-500 focus:ring-blue-100',
      accentBorder: 'border-blue-200',
      accentBg: 'bg-blue-50/70',
      statCardBorder: 'border-slate-200/80 hover:border-blue-300',
      statColor: 'blue',
      heroGradient: 'bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600',
      
      // Charts
      chartColor1: '#2563EB',
      chartColor2: '#06B6D4',
    },
  },

  staff: {
    role: 'staff',
    roleLabel: 'Staff Coordinator Portal',
    portalTagline: 'COORDINATION & STUDENT MENTORING',
    colors: {
      primary: '#7C3AED',
      primaryHover: '#6D28D9',
      secondary: '#EDE9FE',
      secondaryHover: '#DDD6FE',
      accent: '#8B5CF6',
      pageBackground: '#F8FAFC',
      cardBackground: '#FFFFFF',
      text: '#0F172A',
      mutedText: '#64748B',
      border: '#E2E8F0',
    },
    classes: {
      // Sidebar & Navigation
      sidebarBrandBg: 'bg-purple-600',
      sidebarBrandText: 'text-purple-600',
      navActiveBg: 'bg-purple-50',
      navActiveText: 'text-purple-700 font-semibold shadow-xs',
      navActiveIcon: 'text-purple-600',
      navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
      badgePrimary: 'bg-purple-600 text-white',
      badgeRole: 'bg-purple-50 text-purple-700 border-purple-200',
      avatarBg: 'bg-purple-600 text-white',
      avatarSoftBg: 'bg-purple-100 text-purple-700',
      
      // Buttons & Interactive
      btnPrimary: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-100',
      btnSecondary: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200',
      btnGhost: 'text-purple-600 hover:underline',
      
      // Accent & Status
      focusRing: 'focus:border-purple-500 focus:ring-purple-100',
      accentBorder: 'border-purple-200',
      accentBg: 'bg-purple-50/70',
      statCardBorder: 'border-slate-200/80 hover:border-purple-300',
      statColor: 'purple',
      heroGradient: 'bg-gradient-to-r from-purple-700 via-purple-600 to-violet-600',
      
      // Charts
      chartColor1: '#7C3AED',
      chartColor2: '#8B5CF6',
    },
  },

  admin: {
    role: 'admin',
    roleLabel: 'Administrator Portal',
    portalTagline: 'INSTITUTIONAL PLACEMENT GOVERNANCE',
    colors: {
      primary: '#059669',
      primaryHover: '#047857',
      secondary: '#D1FAE5',
      secondaryHover: '#A7F3D0',
      accent: '#10B981',
      pageBackground: '#F8FAFC',
      cardBackground: '#FFFFFF',
      text: '#0F172A',
      mutedText: '#64748B',
      border: '#E2E8F0',
    },
    classes: {
      // Sidebar & Navigation
      sidebarBrandBg: 'bg-emerald-600',
      sidebarBrandText: 'text-emerald-600',
      navActiveBg: 'bg-emerald-50',
      navActiveText: 'text-emerald-700 font-semibold shadow-xs',
      navActiveIcon: 'text-emerald-600',
      navInactiveText: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80',
      badgePrimary: 'bg-emerald-600 text-white',
      badgeRole: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      avatarBg: 'bg-emerald-600 text-white',
      avatarSoftBg: 'bg-emerald-100 text-emerald-700',
      
      // Buttons & Interactive
      btnPrimary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100',
      btnSecondary: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200',
      btnGhost: 'text-emerald-600 hover:underline',
      
      // Accent & Status
      focusRing: 'focus:border-emerald-500 focus:ring-emerald-100',
      accentBorder: 'border-emerald-200',
      accentBg: 'bg-emerald-50/70',
      statCardBorder: 'border-slate-200/80 hover:border-emerald-300',
      statColor: 'emerald',
      heroGradient: 'bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600',
      
      // Charts
      chartColor1: '#059669',
      chartColor2: '#10B981',
    },
  },
};

/**
 * Helper to get theme by role (defaults strictly to student)
 */
export const getRoleTheme = (role) => {
  if (role === 'admin') return roleThemes.admin;
  if (role === 'staff') return roleThemes.staff;
  return roleThemes.student;
};
