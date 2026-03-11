"use client"

import { useState, useCallback, useEffect } from "react"
import { onAuthStateChanged, signOut, type User } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { auth, db } from "@/lib/firebase"
import { WelcomePage } from "@/components/welcome-page"
import { LoginPage } from "@/components/login-page"
import { SignupPage } from "@/components/signup-page"
import { DashboardPage } from "@/components/dashboard-page"
import { WaterDroplets } from "@/components/water-droplets"
import { OrdersPage } from "@/components/orders-page"
import { NotificationsPage } from "@/components/notifications-page"
import { SettingsPage } from "@/components/settings-page"
import { ProductsPage } from "@/components/products-page"
import { AddProductPage } from "@/components/add-product-page"
import { OpeningHoursPage } from "@/components/opening-hours-page"
import { StoreInfoPage } from "@/components/store-info-page"
import { BottomNavigation } from "@/components/bottom-navigation"
import { placeholderStoreData } from "@/lib/store-data"
import type { StoreData, Product, OpeningHour, StoreInfo } from "@/lib/store-data"

type AuthPage = "welcome" | "login" | "signup"

export default function MerchantApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [authPage, setAuthPage] = useState<AuthPage>("welcome")
  const [activePage, setActivePage] = useState("dashboard")
  const [storeData, setStoreData] = useState<StoreData>(placeholderStoreData)
  const [direction, setDirection] = useState<"left" | "right">("right")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const pageOrder = ["dashboard", "orders", "notifications", "settings"]

  // Fetch store data from Firestore
  const fetchStoreData = useCallback(async (uid: string) => {
    try {
      const storeDoc = await getDoc(doc(db, "stores", uid))
      if (storeDoc.exists()) {
        const data = storeDoc.data()
        setStoreData((prev) => ({
          ...prev,
          storeName: data.storeName || prev.storeName,
          storeInfo: {
            ...prev.storeInfo,
            name: data.storeName || prev.storeInfo.name,
            address: data.address || prev.storeInfo.address,
            phone: data.phone || prev.storeInfo.phone,
            logo: data.logo || prev.storeInfo.logo,
          },
          // Load any other stored fields
          openingHours: data.openingHours?.length > 0 ? data.openingHours : prev.openingHours,
          products: data.products?.length > 0 ? data.products : prev.products,
        }))
      }
    } catch (error) {
      console.error("Error fetching store data:", error)
    }
  }, [])

  // Check authentication state on mount and handle persistence
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        // User is logged in - fetch their store data from Firestore
        await fetchStoreData(user.uid)
        setIsAuthenticated(true)
        setAuthPage("welcome")
      } else {
        // User is not logged in
        setIsAuthenticated(false)
        setAuthPage("welcome")
        // Reset store data to placeholder
        setStoreData(placeholderStoreData)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [fetchStoreData])

  // Handle successful signup
  const handleSignupSuccess = useCallback((userData: {
    uid: string
    firstName: string
    surname: string
    storeName: string
    phone: string
    email: string
    address: string
  }) => {
    // Update store data with user's info
    setStoreData((prev) => ({
      ...prev,
      storeName: userData.storeName,
      storeInfo: {
        ...prev.storeInfo,
        name: userData.storeName,
        address: userData.address,
        phone: userData.phone,
      },
    }))
    setIsAuthenticated(true)
  }, [])

  // Handle successful login
  const handleLoginSuccess = useCallback(() => {
    // Auth state change listener will handle fetching data
    setIsAuthenticated(true)
  }, [])

  // Check if store should be open based on opening hours
  const checkStoreOpenStatus = useCallback(() => {
    if (storeData.storeStatusManualOverride) return // Don't auto-update if manual override is active

    const now = new Date()
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const currentDay = dayNames[now.getDay()]
    const currentHour = storeData.openingHours.find((h) => h.day === currentDay)

    if (!currentHour || !currentHour.isOpen) {
      setStoreData((prev) => ({ ...prev, storeStatus: false }))
      return
    }

    const [openH, openM] = currentHour.openTime.split(":").map(Number)
    const [closeH, closeM] = currentHour.closeTime.split(":").map(Number)
    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    const isWithinHours = currentMinutes >= openMinutes && currentMinutes < closeMinutes
    setStoreData((prev) => ({ ...prev, storeStatus: isWithinHours }))
  }, [storeData.openingHours, storeData.storeStatusManualOverride])

  // Check store status on mount and when opening hours change
  useEffect(() => {
    if (isAuthenticated) {
      checkStoreOpenStatus()
      const interval = setInterval(checkStoreOpenStatus, 60000) // Check every minute
      return () => clearInterval(interval)
    }
  }, [isAuthenticated, checkStoreOpenStatus])

  const handleNavigate = useCallback(
    (page: string) => {
      const currentIdx = pageOrder.indexOf(activePage)
      const nextIdx = pageOrder.indexOf(page)
      if (nextIdx !== -1 && currentIdx !== -1) {
        setDirection(nextIdx >= currentIdx ? "right" : "left")
      } else {
        setDirection("right")
      }
      setActivePage(page)
    },
    [activePage]
  )

  const handleToggleStatus = useCallback(() => {
    setStoreData((prev) => ({
      ...prev,
      storeStatus: !prev.storeStatus,
      storeStatusManualOverride: true, // Enable manual override when toggled
    }))
  }, [])

  const handleMarkAllRead = useCallback(() => {
    setStoreData((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }))
  }, [])

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth)
      setIsAuthenticated(false)
      setAuthPage("welcome")
      setActivePage("dashboard")
      setStoreData(placeholderStoreData)
    } catch (error) {
      console.error("Logout error:", error)
    }
  }, [])

  // Settings navigation handlers
  const handleSettingsNavigate = useCallback((page: string) => {
    setDirection("right")
    setActivePage(page)
  }, [])

  // Product handlers
  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setActivePage("addProduct")
  }, [])

  const handleDeleteProduct = useCallback((productId: string) => {
    setStoreData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== productId),
    }))
  }, [])

  const handleToggleProductAvailability = useCallback((productId: string) => {
    setStoreData((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.id === productId ? { ...p, available: !p.available } : p
      ),
    }))
  }, [])

  const handleSaveProduct = useCallback(
    (product: Omit<Product, "id"> & { id?: string }) => {
      if (product.id) {
        // Update existing product
        setStoreData((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p.id === product.id ? { ...p, ...product } as Product : p
          ),
        }))
      } else {
        // Add new product
        const newProduct: Product = {
          ...product,
          id: `p${Date.now()}`,
        }
        setStoreData((prev) => ({
          ...prev,
          products: [...prev.products, newProduct],
        }))
      }
      setEditingProduct(null)
      setActivePage("products")
    },
    []
  )

  // Opening hours handler
  const handleSaveOpeningHours = useCallback((hours: OpeningHour[]) => {
    setStoreData((prev) => ({
      ...prev,
      openingHours: hours,
      storeStatusManualOverride: false, // Reset manual override when hours are saved
    }))
    setActivePage("settings")
  }, [])

  // Store info handler
  const handleSaveStoreInfo = useCallback((info: StoreInfo) => {
    setStoreData((prev) => ({
      ...prev,
      storeInfo: info,
      storeName: info.name || prev.storeName,
    }))
    setActivePage("settings")
  }, [])

  const handleBack = useCallback(() => {
    setDirection("left")
    if (activePage === "addProduct") {
      setEditingProduct(null)
      setActivePage("products")
    } else if (["products", "openingHours", "storeInfo"].includes(activePage)) {
      setActivePage("settings")
    } else {
      setActivePage("dashboard")
    }
  }, [activePage])

  const unreadCount = storeData.notifications.filter((n) => !n.read).length

  // Determine if bottom nav should be hidden
  const hideBottomNav = ["products", "addProduct", "openingHours", "storeInfo"].includes(activePage)

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-dvh w-full bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    )
  }

  // Show authentication flow if not authenticated
  if (!isAuthenticated) {
    if (authPage === "welcome") {
      return (
        <>
          <WaterDroplets />
          <WelcomePage 
            onSignIn={() => setAuthPage("login")} 
            onSignUp={() => setAuthPage("signup")} 
          />
        </>
      )
    }
    
    if (authPage === "login") {
      return (
        <>
          <WaterDroplets />
          <LoginPage 
            onLoginSuccess={handleLoginSuccess}
            onSignUp={() => setAuthPage("signup")}
          />
        </>
      )
    }
    
    if (authPage === "signup") {
      return (
        <>
          <WaterDroplets />
          <SignupPage 
            onSignupSuccess={handleSignupSuccess}
            onSignIn={() => setAuthPage("login")}
          />
        </>
      )
    }
  }

  // Show main dashboard app
  return (
    <>
      <WaterDroplets />
      <div className="relative z-10 flex flex-col h-dvh w-full max-w-[1200px] mx-auto bg-transparent">
      {/* Page Content */}
      <div className="flex-1 overflow-hidden relative">
        <div
          key={activePage}
          className="absolute inset-0 animate-in fade-in duration-200"
          style={{
            animationName: direction === "right" ? "slideInFromRight" : "slideInFromLeft",
            animationDuration: "250ms",
            animationTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
          }}
        >
          {activePage === "dashboard" && (
            <DashboardPage
              data={storeData}
              onToggleStatus={handleToggleStatus}
              onNavigate={handleNavigate}
            />
          )}
          {activePage === "orders" && <OrdersPage orders={storeData.recentOrders} />}
          {activePage === "notifications" && (
            <NotificationsPage
              notifications={storeData.notifications}
              onMarkAllRead={handleMarkAllRead}
            />
          )}
          {activePage === "settings" && (
            <SettingsPage
              onLogout={handleLogout}
              onNavigate={handleSettingsNavigate}
            />
          )}
          {activePage === "products" && (
            <ProductsPage
              products={storeData.products}
              onBack={handleBack}
              onEditProduct={handleEditProduct}
              onDeleteProduct={handleDeleteProduct}
              onToggleAvailability={handleToggleProductAvailability}
            />
          )}
          {activePage === "addProduct" && (
            <AddProductPage
              product={editingProduct}
              onBack={handleBack}
              onSave={handleSaveProduct}
            />
          )}
          {activePage === "openingHours" && (
            <OpeningHoursPage
              openingHours={storeData.openingHours}
              onBack={handleBack}
              onSave={handleSaveOpeningHours}
            />
          )}
          {activePage === "storeInfo" && (
            <StoreInfoPage
              storeInfo={storeData.storeInfo}
              onBack={handleBack}
              onSave={handleSaveStoreInfo}
            />
          )}
        </div>
      </div>

      {/* Fixed Bottom Navigation - hidden on sub-pages */}
      {!hideBottomNav && (
        <BottomNavigation
          activePage={activePage}
          onNavigate={handleNavigate}
          notificationCount={unreadCount}
        />
      )}

      {/* Page transition keyframes */}
      <style jsx>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideInFromLeft {
          from {
            transform: translateX(-30px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
    </>
  )
}
