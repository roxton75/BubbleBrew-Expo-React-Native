// constants/theme.ts
const theme = {
  colors: {
    primary: "#111827", // deep charcoal
    accent: "#007250ff", // teal (brand color)
    background: "#ebeae8ff", // light warm background
    surface: "#FFFFFF", // cards / sheets
    divider: "#E5E7EB",

    text: {
      primary: "#111827ff",
      secondary: "#6B7280",
      muted: "#9CA3AF",
    },

    danger: "#EF4444",

    status: {
      new: "#F8FAFC",   // subtle gray-blue
      preparing: "#FFF7ED",  // warm soft yellow
      ready: "#EFF6FF",      // soft blue
      paid: "#ECFDF5",       // soft green
      cancelled: "#FEF2F2",  // soft red
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  typography: {
    title: { fontSize: 20, fontWeight: "700" },
    h1: { fontSize: 18, fontWeight: "600" },
    h2: { fontSize: 16, fontWeight: "500" },
    body: { fontSize: 14, fontWeight: "400" },
    small: { fontSize: 12, fontWeight: "400" },
    button: { fontSize: 15, fontWeight: "700" },
  },

  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
  },

  shadows: {
    card: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
  },

  getStatusColor(status: string) {
    const key = status?.toLowerCase();
    const map: any = {
      assigned: theme.colors.status.new,
      preparing: theme.colors.status.preparing,
      ready: theme.colors.status.ready,
      paid: theme.colors.status.paid,
      cancelled: theme.colors.status.cancelled,
    };
    return map[key] ?? theme.colors.surface;
  },
};

export default theme;

export const Colors = {
  light: {
    primary: "#00A86B",
    background: "#F5F5F5",
  },
  dark: {
    primary: "#00A86B",
    background: "#000000",
  },
};
