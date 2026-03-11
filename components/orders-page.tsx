"use client"

import { useState } from "react"
import { ChevronLeft, Bell } from "lucide-react"
import type { Order } from "@/lib/store-data"

interface OrdersPageProps {
  orders: Order[]
}

export function OrdersPage({ orders }: OrdersPageProps) {
  const [activeTab, setActiveTab] = useState<"today" | "past">("today")

  // {ordersTodayList} placeholder for Firebase binding
  const todayOrders = orders
  // {pastOrdersList} placeholder for Firebase binding - limit to 7 days
  const pastOrders = orders.filter((o) => o.status === "completed")

  const displayedOrders = activeTab === "today" ? todayOrders : pastOrders

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header with glassmorphism */}
      <div 
        className="px-4 pt-5 pb-0 shrink-0"
        style={{
          background: "rgba(255, 255, 255, 0.15)",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255, 255, 255, 0.25)",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button className="text-foreground" aria-label="Go back">
              <ChevronLeft className="w-6 h-6" />
            </button>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Orders</h1>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
              <img src="/images/food-1.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="relative">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/20">
          <button
            id="todayOrdersTab"
            onClick={() => setActiveTab("today")}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "today"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/60"
            }`}
          >
            {"Today's Orders"}
          </button>
          <button
            id="pastOrdersTab"
            onClick={() => setActiveTab("past")}
            className={`flex-1 pb-3 text-sm font-semibold transition-colors duration-200 ${
              activeTab === "past"
                ? "text-primary border-b-2 border-primary"
                : "text-foreground/60"
            }`}
          >
            Past Orders
          </button>
        </div>
      </div>

      {/* Scrollable Orders List */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scrollbar-hide">
        <div className="flex flex-col gap-3">
          {displayedOrders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  )
}

function OrderCard({ order }: { order: Order }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-sm transition-all duration-200 active:scale-[0.98]">
      <img
        src={order.image}
        alt={`Order ${order.id}`}
        className="w-14 h-14 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-card-foreground">{order.id}</p>
          <p className="text-sm font-bold text-card-foreground">
            ZMW {order.price.toFixed(2)}
          </p>
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-muted-foreground">{order.customerName}</p>
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{order.time}</p>
      </div>
    </div>
  )
}

function OrderStatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: "bg-[#f97316]/15", text: "text-[#f97316]", label: "Pending" },
    accepted: { bg: "bg-primary/15", text: "text-primary", label: "Accepted" },
    completed: { bg: "bg-[#22c55e]/15", text: "text-[#22c55e]", label: "Completed" },
  }
  const c = config[status] || config.pending
  return (
    <span className={`${c.bg} ${c.text} text-[10px] font-semibold px-2.5 py-1 rounded-full`}>
      {c.label}
    </span>
  )
}
