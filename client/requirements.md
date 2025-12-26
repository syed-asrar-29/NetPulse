## Packages
recharts | For visualizing real-time network metrics (LineChart, AreaChart)
clsx | Utility for conditional class names
tailwind-merge | Utility for merging tailwind classes

## Notes
Tailwind Config - extend fontFamily:
fontFamily: {
  display: ["var(--font-display)"],
  mono: ["var(--font-mono)"],
  sans: ["var(--font-sans)"],
}

Tailwind Config - extend colors for Cyber aesthetic:
colors: {
  cyan: {
    500: "#06b6d4",
    900: "#164e63",
  },
  emerald: {
    500: "#10b981",
    900: "#064e3b",
  },
  rose: {
    500: "#f43f5e",
    900: "#881337",
  }
}

Real-time connection:
WebSocket connects to /ws
Expects messages matching DashboardUpdate schema
