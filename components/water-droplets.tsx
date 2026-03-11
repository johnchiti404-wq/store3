"use client"

import { useEffect, useRef } from "react"

interface WaterDropletsProps {
  className?: string
}

export function WaterDroplets({ className = "" }: WaterDropletsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to window size
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener("resize", resize)

    // Droplet class
    class Droplet {
      x: number
      y: number
      size: number
      speed: number
      opacity: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1.5
        this.speed = Math.random() * 0.3 + 0.15
        this.opacity = Math.random() * 0.35 + 0.15
      }

      update() {
        this.y += this.speed
        if (this.y > canvas.height + this.size) {
          this.y = -this.size
          this.x = Math.random() * canvas.width
        }
      }

      draw(context: CanvasRenderingContext2D) {
        // Draw water droplet shape
        context.beginPath()
        context.save()
        context.translate(this.x, this.y)
        
        // Teardrop shape
        context.moveTo(0, -this.size * 1.5)
        context.bezierCurveTo(
          this.size * 0.8, -this.size * 0.5,
          this.size * 0.8, this.size * 0.5,
          0, this.size
        )
        context.bezierCurveTo(
          -this.size * 0.8, this.size * 0.5,
          -this.size * 0.8, -this.size * 0.5,
          0, -this.size * 1.5
        )
        
        // Create gradient for 3D effect
        const gradient = context.createRadialGradient(
          -this.size * 0.2, -this.size * 0.3, 0,
          0, 0, this.size * 1.5
        )
        gradient.addColorStop(0, `rgba(200, 230, 255, ${this.opacity * 1.2})`)
        gradient.addColorStop(0.5, `rgba(150, 200, 255, ${this.opacity})`)
        gradient.addColorStop(1, `rgba(100, 170, 230, ${this.opacity * 0.6})`)
        
        context.fillStyle = gradient
        context.fill()
        
        // Add highlight
        context.beginPath()
        context.arc(-this.size * 0.2, -this.size * 0.4, this.size * 0.25, 0, Math.PI * 2)
        context.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.8})`
        context.fill()
        
        context.restore()
      }
    }

    // Create droplets
    const droplets: Droplet[] = []
    const numDroplets = Math.min(80, Math.floor((canvas.width * canvas.height) / 15000))
    for (let i = 0; i < numDroplets; i++) {
      droplets.push(new Droplet())
    }

    // Animation loop
    let animationId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      droplets.forEach((droplet) => {
        droplet.update()
        droplet.draw(ctx)
      })

      animationId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener("resize", resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ opacity: 0.7 }}
    />
  )
}
