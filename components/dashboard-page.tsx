"use client"

import { Star, TrendingUp } from "lucide-react"
import type { StoreData } from "@/lib/store-data"

interface DashboardPageProps {
  data: StoreData & { storeInfo?: { logo?: string } }
  onToggleStatus: () => void
  onNavigate: (page: string) => void
}

export function DashboardPage({ data, onToggleStatus, onNavigate }: DashboardPageProps) {
  const recentOrders = data.recentOrders.slice(0, 5)

  const logoUrl = data.storeInfo?.logo

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="bg-card px-4 pt-5 pb-4 shrink-0 relative overflow-hidden">
        {/* Blurred Logo Background - reduced blur for subtle glass effect */}
        {logoUrl && (
          <div
            className="absolute inset-0 z-0"
            style={{
              backgroundImage: `url(${logoUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              filter: "blur(6px)",
              opacity: 0.14,
              transform: "scale(1.05)",
            }}
          />
        )}
        {/* Store name + Revenue row */}
        <div className="flex items-start justify-between relative z-10">
          <div>
            <h1 className="text-xl font-bold text-card-foreground">{data.storeName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-muted-foreground">Store Status</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <button
                id="storeStatusToggle"
                onClick={onToggleStatus}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${data.storeStatus ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                role="switch"
                aria-checked={data.storeStatus}
                aria-label="Toggle store status"
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-card transition-transform duration-300 ${data.storeStatus ? "translate-x-6" : "translate-x-1"
                    }`}
                />
              </button>
              <span className={`text-sm font-medium flex items-center gap-1 ${data.storeStatus ? "text-[#22c55e]" : "text-destructive"}`}>
                <span className={`w-2 h-2 rounded-full ${data.storeStatus ? "bg-[#22c55e]" : "bg-destructive"}`} />
                {data.storeStatus ? "Open" : "Closed"}
              </span>
            </div>
          </div>
          <div id="revenueTodayCard" className="bg-card border border-border rounded-xl px-4 py-3 text-right shadow-sm">
            <p className="text-xs text-muted-foreground">Store Revenue Today</p>
            <p className="text-xl font-bold text-primary">ZMW {data.revenueToday.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
            <div className="flex items-center justify-end gap-1 text-[#22c55e]">
              <TrendingUp className="w-3 h-3" />
              <span className="text-xs font-medium">+12%</span>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 gap-3 mt-4 relative z-10">
          <div id="ordersTodayCard" className="bg-card border border-border rounded-xl p-3 shadow-sm transition-transform duration-200 active:scale-95">
            <p className="text-xs text-muted-foreground">Orders Today</p>
            <p className="text-2xl font-bold text-primary mt-1">{data.ordersToday}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {data.completedOrders} Completed / {data.pendingOrders} Pending
            </p>
          </div>
          <div id="pendingOrdersCard" className="bg-card border border-border rounded-xl p-3 shadow-sm transition-transform duration-200 active:scale-95">
            <p className="text-xs text-muted-foreground">Pending Orders</p>
            <p className="text-2xl font-bold text-[#f97316] mt-1">{data.pendingOrders}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Action Needed</p>
          </div>
          <div id="totalRevenueCard" className="bg-card border border-border rounded-xl p-3 shadow-sm transition-transform duration-200 active:scale-95">
            <p className="text-xs text-muted-foreground">Total Revenue</p>
            <p className="text-xl font-bold text-[#22c55e] mt-1">
              ZMW {data.weeklyRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">This Week</p>
          </div>
          <div id="customerRatingCard" className="bg-card border border-border rounded-xl p-3 shadow-sm transition-transform duration-200 active:scale-95">
            <p className="text-xs text-muted-foreground">Customer Rating</p>
            <div className="flex items-center gap-1 mt-1">
              <span className="text-2xl font-bold text-card-foreground">{data.customerRating}</span>
              <Star className="w-5 h-5 fill-[#eab308] text-[#eab308]" />
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{data.totalReviews} Reviews</p>
          </div>
        </div>

        {/* Recent Orders Header */}
        <div className="flex items-center justify-between mt-4 mb-2 relative z-10">
          <h2 className="text-base font-bold text-card-foreground">Recent Orders</h2>
          <button
            id="viewAllOrdersButton"
            onClick={() => onNavigate("orders")}
            className="text-sm font-medium text-primary transition-colors duration-200 hover:text-primary/80"
          >
            View All
          </button>
        </div>
      </div>

      {/* Scrollable Recent Orders */}
      <div id="recentOrdersList" className="flex-1 overflow-y-auto px-4 pb-2 scrollbar-hide">
        <div className="flex flex-col gap-3">
          {recentOrders.map((order) => (
            <div
              key={order.id}
              className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm transition-all duration-200 active:scale-[0.98]"
            >
              <img
                src={order.image}
                alt={`Order ${order.id}`}
                className="w-12 h-12 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-card-foreground">{order.id}</p>
                <p className="text-xs text-muted-foreground">{order.customerName}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-card-foreground">
                  ZMW {order.price.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">{order.time}</p>
              </div>
              <StatusBadge status={order.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-[#f97316]/15", text: "text-[#f97316]", label: "Pending" },
    accepted: { bg: "bg-primary/15", text: "text-primary", label: "Accepted" },
    completed: { bg: "bg-[#22c55e]/15", text: "text-[#22c55e]", label: "Completed" },
  }
  const c = config[status] || config.pending
  return (
    <span className={`${c.bg} ${c.text} text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap`}>
      {c.label}
    </span>
  )
}
