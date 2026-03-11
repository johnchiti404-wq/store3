"use client"

import { Home, ClipboardList, Bell, Settings } from "lucide-react"

interface BottomNavigationProps {
  activePage: string
  onNavigate: (page: string) => void
  notificationCount?: number
}

const navItems = [
  { id: "navDashboard", page: "dashboard", label: "Dashboard", icon: Home },
  { id: "navOrders", page: "orders", label: "Orders", icon: ClipboardList },
  { id: "navNotifications", page: "notifications", label: "Notifications", icon: Bell },
  { id: "navSettings", page: "settings", label: "Settings", icon: Settings },
]

export function BottomNavigation({ activePage, onNavigate, notificationCount = 0 }: BottomNavigationProps) {
  return (
    <nav 
      className="px-2 py-2 shrink-0" 
      role="navigation" 
      aria-label="Main navigation"
      style={{
        background: "rgba(255, 255, 255, 0.15)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.25)",
      }}
    >
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activePage === item.page
          return (
            <button
              key={item.id}
              id={item.id}
              onClick={() => onNavigate(item.page)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-all duration-200 ${
                isActive ? "text-primary" : "text-foreground/70"
              }`}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <div className="relative">
                <item.icon className={`w-5 h-5 transition-all duration-200 ${isActive ? "stroke-[2.5]" : ""}`} />
                {item.page === "notifications" && notificationCount > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-destructive text-destructive-foreground text-[8px] font-bold rounded-full flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-all duration-200 ${isActive ? "font-semibold" : ""}`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
