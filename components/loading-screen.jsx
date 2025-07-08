"use client"

import { useEffect, useState } from "react"
import { Package, BarChart3, TrendingUp } from "lucide-react"

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prevProgress) => {
        const newProgress = prevProgress + 5
        return newProgress >= 100 ? 100 : newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-900 text-white">
      <div className="w-full max-w-md flex flex-col items-center">
        <div className="flex items-center mb-8">
          <Package className="h-12 w-12 mr-4" />
          <h1 className="text-4xl font-bold tracking-tight">TARGET JIT</h1>
        </div>

        <div className="text-xl mb-12 text-center">Intelligent Inventory Management System</div>

        <div className="w-full bg-white/20 rounded-full h-2.5 mb-6">
          <div
            className="bg-white h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <div className="text-sm mb-12">
          {progress < 30 && "Initializing system..."}
          {progress >= 30 && progress < 60 && "Loading inventory data..."}
          {progress >= 60 && progress < 90 && "Processing analytics..."}
          {progress >= 90 && "Preparing dashboard..."}
        </div>

        <div className="flex justify-center space-x-12 animate-pulse">
          <Package className="h-8 w-8" />
          <BarChart3 className="h-8 w-8" />
          <TrendingUp className="h-8 w-8" />
        </div>
      </div>

      <div className="absolute bottom-4 text-sm opacity-70">© 2025 TARGET JIT • v2.5.0</div>
    </div>
  )
}
