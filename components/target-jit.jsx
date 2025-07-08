"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import {
  AlertCircle,
  Package,
  TrendingUp,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  X,
  Upload,
  Plus,
  Edit,
  Save,
  Trash2,
  FileText,
  Download,
  CheckCircle,
} from "lucide-react"
import SampleCsvGenerator from "./sample-csv-generator"

import { useState, useEffect, useRef } from "react"

export default function TargetJIT() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Simulated data - in a real app, this would come from the backend
  const [inventoryData, setInventoryData] = useState([])
  const [forecastData, setForecastData] = useState([])
  const [skuCategories, setSkuCategories] = useState({})
  const [alerts, setAlerts] = useState([])

  // Advanced alert states
  const [advancedAlerts, setAdvancedAlerts] = useState([])
  const [alertFilters, setAlertFilters] = useState({
    priority: "all",
    category: "all",
    riskLevel: "all",
  })

  // Advanced analysis states
  const [analysisData, setAnalysisData] = useState(null)
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(false)

  // CSV upload states
  const [csvFile, setCsvFile] = useState(null)
  const [csvError, setCsvError] = useState(null)
  const [csvSuccess, setCsvSuccess] = useState(false)
  const [csvPreviewData, setCsvPreviewData] = useState(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isReportOpen, setIsReportOpen] = useState(false)
  const [csvReport, setCsvReport] = useState(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef(null)

  // Manual entry states
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false)
  const [newItem, setNewItem] = useState({
    skuId: "",
    name: "",
    category: "",
    currentStock: 0,
    reorderPoint: 0,
  })
  const [formErrors, setFormErrors] = useState({})
  const [editingItem, setEditingItem] = useState(null)

  useEffect(() => {
    // Simulate loading data
    setLoading(true)

    // Generate sample inventory data
    const sampleInventoryData = generateSampleInventoryData()
    setInventoryData(sampleInventoryData)

    // Generate sample forecast data
    const sampleForecastData = generateSampleForecastData()
    setForecastData(sampleForecastData)

    // Generate sample SKU categories
    const sampleSkuCategories = {
      "fast-moving": sampleInventoryData.filter((item) => item.turnoverRate > 0.7).length,
      "medium-moving": sampleInventoryData.filter((item) => item.turnoverRate > 0.3 && item.turnoverRate <= 0.7).length,
      "slow-moving": sampleInventoryData.filter((item) => item.turnoverRate <= 0.3).length,
    }
    setSkuCategories(sampleSkuCategories)

    // Generate sample alerts
    const sampleAlerts = sampleInventoryData
      .filter((item) => item.currentStock < item.reorderPoint)
      .map((item) => ({
        id: item.skuId,
        name: item.name,
        currentStock: item.currentStock,
        reorderPoint: item.reorderPoint,
        timestamp: new Date().toISOString(),
      }))
    setAlerts(sampleAlerts)

    setLoading(false)
  }, [])

  // Fix the reorder point calculation issue by updating these functions

  // Update the calculateIntelligentReorderPoint function to produce more varied results
  const calculateIntelligentReorderPoint = (quantity, category) => {
    if (!quantity || quantity <= 0) return 10

    // Add randomness factor to create variation (±15%)
    const variationFactor = 0.85 + Math.random() * 0.3 // 0.85 to 1.15

    let baseMultiplier = 0.2 // Default 20%
    let minimum = 10

    switch (category) {
      case "Electronics":
        baseMultiplier = 0.15 // Electronics: 15%
        minimum = 5
        break
      case "Food":
        baseMultiplier = 0.3 // Food: 30% (higher turnover)
        minimum = 20
        break
      case "Office Supplies":
        baseMultiplier = 0.25 // Office supplies: 25%
        minimum = 15
        break
      case "Clothing":
        baseMultiplier = 0.2 // Clothing: 20%
        minimum = 12
        break
      case "Home Goods":
        baseMultiplier = 0.18 // Home goods: 18%
        minimum = 8
        break
      default:
        baseMultiplier = 0.2
        minimum = 10
    }

    // Apply variation factor to create diversity in reorder points
    const multiplier = baseMultiplier * variationFactor

    // Add some randomness to the minimum as well
    const adjustedMinimum = Math.floor(minimum * (0.9 + Math.random() * 0.2))
    

    const calculated = Math.floor(quantity * multiplier)
    return Math.max(calculated, adjustedMinimum)
  }

  // Update the calculateReorderPoint function to produce more varied results
  const calculateReorderPoint = (quantity, itemName) => {
    if (!quantity || quantity <= 0) return 10
    if (!itemName) return Math.max(Math.floor(quantity * 0.2 * (0.9 + Math.random() * 0.2)), 10)

    const name = itemName.toLowerCase()

    // Add randomness factor to create variation (±15%)
    const variationFactor = 0.85 + Math.random() * 0.3 // 0.85 to 1.15

    // Category-based reorder point calculation
    let baseMultiplier = 0.2 // Default 20%
    let minimum = 10

    if (name.includes("laptop") || name.includes("phone") || name.includes("computer") || name.includes("electronic")) {
      baseMultiplier = 0.15 // Electronics: 15%
      minimum = 5
    } else if (name.includes("food") || name.includes("perishable") || name.includes("snack")) {
      baseMultiplier = 0.3 // Food: 30% (higher turnover)
      minimum = 20
    } else if (
      name.includes("office") ||
      name.includes("stationery") ||
      name.includes("pen") ||
      name.includes("paper")
    ) {
      baseMultiplier = 0.25 // Office supplies: 25%
      minimum = 15
    } else if (name.includes("shirt") || name.includes("cloth") || name.includes("apparel")) {
      baseMultiplier = 0.2 // Clothing: 20%
      minimum = 12
    } else if (name.includes("chair") || name.includes("table") || name.includes("furniture")) {
      baseMultiplier = 0.18 // Home goods: 18%
      minimum = 8
    }

    // Apply variation factor to create diversity in reorder points
    const multiplier = baseMultiplier * variationFactor

    // For high-value or critical items, increase the reorder point
    if (name.includes("premium") || name.includes("critical") || name.includes("essential")) {
      minimum *= 1.5
    }

    // For seasonal items, adjust based on "seasonality"
    if (name.includes("seasonal") || name.includes("holiday") || name.includes("christmas")) {
      minimum *= 1.3
    }

    const calculated = Math.floor(quantity * multiplier)
    return Math.max(calculated, minimum)
  }

  // Update the generateSampleInventoryData function to ensure varied reorder points
  const generateSampleInventoryData = () => {
    const categories = ["Electronics", "Clothing", "Food", "Home Goods", "Office Supplies"]
    const data = []

    for (let i = 1; i <= 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]

      // Create more varied stock quantities
      const currentStock = Math.floor(Math.random() * 1000) + 50 + (i % 10) * 25

      // Calculate reorder point with variation
      const reorderPoint = calculateIntelligentReorderPoint(currentStock, category)

      const turnoverRate = 0.1 + Math.random() * 0.8 // 0.1 to 0.9

      data.push({
        skuId: `SKU-${i.toString().padStart(4, "0")}`,
        name: `Product ${i}`,
        category,
        currentStock,
        reorderPoint,
        turnoverRate,
        lastRestocked: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        predictedDemand: Math.floor(Math.random() * 500),
        rate: Math.floor(Math.random() * 10000) + 100,
        value: 0, // Will be calculated
      })
    }

    // Calculate values
    data.forEach((item) => {
      item.value = item.currentStock * item.rate
    })

    return data
  }

  // Function to generate sample forecast data
  const generateSampleForecastData = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const data = []

    for (let i = 0; i < 12; i++) {
      data.push({
        month: months[i],
        actual: Math.floor(Math.random() * 5000) + 1000,
        forecast: Math.floor(Math.random() * 5000) + 1000,
      })
    }

    return data
  }

  // Helper function to calculate intelligent reorder point

  // Helper function to calculate reorder point based on item name

  // Function to parse CSV data with enhanced error handling
  const parseCSV = (csvText) => {
    try {
      // Validate input
      if (!csvText || typeof csvText !== "string") {
        throw new Error("Invalid CSV content")
      }

      // Clean and split lines
      const lines = csvText
        .trim()
        .split(/\r\n|\n|\r/)
        .filter((line) => line.trim())

      if (lines.length < 2) {
        throw new Error("CSV file must contain at least a header row and one data row")
      }

      // Extract and clean headers
      const headerLine = lines[0]
      const headers = headerLine.split(",").map((header) => header.trim().replace(/['"]/g, ""))

      console.log("Headers found:", headers)

      // Map required fields to CSV headers
      const fieldMapping = {
        particulars: null,
        quantity: null,
        rate: null,
        value: null,
      }

      // Find matching headers (case-insensitive and flexible)
      headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().replace(/[^a-z0-9]/g, "")

        if (
          cleanHeader.includes("particular") ||
          cleanHeader.includes("name") ||
          cleanHeader.includes("item") ||
          cleanHeader.includes("product") ||
          cleanHeader.includes("description")
        ) {
          fieldMapping.particulars = index
        } else if (
          cleanHeader.includes("quantity") ||
          cleanHeader.includes("qty") ||
          cleanHeader.includes("stock") ||
          cleanHeader.includes("units")
        ) {
          fieldMapping.quantity = index
        } else if (
          cleanHeader.includes("rate") ||
          cleanHeader.includes("price") ||
          cleanHeader.includes("cost") ||
          cleanHeader.includes("unitprice") ||
          cleanHeader.includes("unit")
        ) {
          fieldMapping.rate = index
        } else if (
          cleanHeader.includes("value") ||
          cleanHeader.includes("total") ||
          cleanHeader.includes("amount") ||
          cleanHeader.includes("sum")
        ) {
          fieldMapping.value = index
        }
      })

      console.log("Field mapping:", fieldMapping)

      // Check if required fields are found
      const missingFields = Object.keys(fieldMapping).filter((field) => fieldMapping[field] === null)
      if (missingFields.length > 0) {
        throw new Error(
          `Missing required columns: ${missingFields.join(", ")}. Expected columns: Particulars/Name, Quantity, Rate/Price, Value/Total`,
        )
      }

      // Parse data rows
      const data = []
      const errors = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue // Skip empty lines

        try {
          // Enhanced CSV parsing to handle quoted fields and commas
          const values = parseCSVLine(line)

          if (values.length < headers.length) {
            errors.push(`Line ${i + 1}: Expected ${headers.length} columns, got ${values.length}`)
            continue
          }

          // Extract values using field mapping
          const particulars = values[fieldMapping.particulars]?.trim() || `Item ${i}`
          const quantityStr = values[fieldMapping.quantity]?.trim() || "0"
          const rateStr = values[fieldMapping.rate]?.trim() || "0"
          const valueStr = values[fieldMapping.value]?.trim() || "0"

          // Parse numbers with better error handling
          const quantity = parseNumber(quantityStr)
          const rate = parseNumber(rateStr)
          const value = parseNumber(valueStr)

          if (quantity <= 0) {
            errors.push(`Line ${i + 1}: Invalid quantity "${quantityStr}"`)
            continue
          }

          if (rate < 0) {
            errors.push(`Line ${i + 1}: Invalid rate "${rateStr}"`)
            continue
          }

          // Update the parseCSV function to ensure reorder points are calculated correctly
          // Find the section in parseCSV where items are created and update the reorder point calculation:
          // Look for this code block in the parseCSV function and replace it:

          // Inside parseCSV function, find and replace the item creation part with this:
          // Get the category based on the item name
          const category = categorizeItem(particulars)

          // Calculate reorder point with proper variation
          const reorderPoint = calculateIntelligentReorderPoint(quantity, category)

          // Create the item with the calculated reorder point
          const item = {
            skuId: `SKU-${String(i).padStart(4, "0")}`,
            name: particulars,
            category: category,
            currentStock: quantity,
            rate: rate,
            value: value || quantity * rate, // Calculate if not provided
            reorderPoint: reorderPoint, // Use the properly calculated reorder point
            turnoverRate: Math.random() * 0.8 + 0.1,
            lastRestocked: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000)
              .toISOString()
              .split("T")[0],
            predictedDemand: Math.floor(Math.random() * 500),
            leadTime: Math.floor(Math.random() * 14) + 1,
            averageDemand: Math.floor(Math.random() * 50) + 10,
            stockoutRisk: calculateStockoutRisk(quantity, reorderPoint),
          }

          data.push(item)
        } catch (lineError) {
          errors.push(`Line ${i + 1}: ${lineError.message}`)
        }
      }

      if (data.length === 0) {
        throw new Error(
          "No valid data rows found in CSV file. " +
            (errors.length > 0 ? "Errors: " + errors.slice(0, 3).join("; ") : ""),
        )
      }

      if (errors.length > 0) {
        console.warn("CSV parsing warnings:", errors)
      }

      console.log(`Successfully parsed ${data.length} items from CSV`)
      return data
    } catch (error) {
      console.error("CSV parsing error:", error)
      throw new Error(`Error parsing CSV: ${error.message}`)
    }
  }

  // Helper function to parse a CSV line handling quotes and commas
  const parseCSVLine = (line) => {
    const values = []
    let current = ""
    let inQuotes = false
    let i = 0

    while (i < line.length) {
      const char = line[i]

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"'
          i += 2
        } else {
          // Toggle quote state
          inQuotes = !inQuotes
          i++
        }
      } else if (char === "," && !inQuotes) {
        // Field separator
        values.push(current.trim())
        current = ""
        i++
      } else {
        current += char
        i++
      }
    }

    // Add the last field
    values.push(current.trim())
    return values
  }

  // Helper function to parse numbers from strings
  const parseNumber = (str) => {
    if (!str) return 0
    // Remove currency symbols, commas, and other non-numeric characters except decimal point
    const cleaned = str.replace(/[^\d.-]/g, "")
    const num = Number.parseFloat(cleaned)
    return isNaN(num) ? 0 : num
  }

  // Helper function to categorize items based on name
  const categorizeItem = (itemName) => {
    if (!itemName) return "General"

    const name = itemName.toLowerCase()

    if (name.includes("laptop") || name.includes("phone") || name.includes("computer") || name.includes("electronic")) {
      return "Electronics"
    } else if (name.includes("shirt") || name.includes("pant") || name.includes("cloth") || name.includes("apparel")) {
      return "Clothing"
    } else if (name.includes("food") || name.includes("snack") || name.includes("drink") || name.includes("beverage")) {
      return "Food"
    } else if (
      name.includes("chair") ||
      name.includes("table") ||
      name.includes("furniture") ||
      name.includes("home")
    ) {
      return "Home Goods"
    } else if (
      name.includes("pen") ||
      name.includes("paper") ||
      name.includes("office") ||
      name.includes("stationery")
    ) {
      return "Office Supplies"
    } else {
      return "General"
    }
  }

  // Helper function to calculate stockout risk
  const calculateStockoutRisk = (currentStock, reorderPoint) => {
    if (!currentStock || !reorderPoint) return "Low"

    const ratio = currentStock / reorderPoint
    if (ratio <= 0.5) return "High"
    if (ratio <= 1.0) return "Medium"
    if (ratio <= 1.5) return "Low"
    return "Very Low"
  }

  // Function to generate advanced reorder alerts
  const generateAdvancedAlerts = (data) => {
    const alerts = []

    data.forEach((item) => {
      const daysOfStock = Math.floor(item.currentStock / (item.averageDemand || 1))
      const priority =
        item.currentStock < item.reorderPoint
          ? item.currentStock < item.reorderPoint * 0.5
            ? "High"
            : "Medium"
          : "Low"

      // Critical stock alert
      if (item.currentStock < item.reorderPoint) {
        alerts.push({
          id: `critical-${item.skuId}`,
          type: "Critical Stock",
          skuId: item.skuId,
          name: item.name,
          category: item.category,
          priority: priority,
          message: `Stock level (${item.currentStock}) is below reorder point (${item.reorderPoint})`,
          currentStock: item.currentStock,
          reorderPoint: item.reorderPoint,
          daysOfStock: daysOfStock,
          recommendedAction: `Order ${Math.ceil(item.reorderPoint * 1.5)} units immediately`,
          riskLevel: item.stockoutRisk,
          timestamp: new Date().toISOString(),
        })
      }

      // Lead time risk alert
      if (daysOfStock <= item.leadTime && item.currentStock > 0) {
        alerts.push({
          id: `leadtime-${item.skuId}`,
          type: "Lead Time Risk",
          skuId: item.skuId,
          name: item.name,
          category: item.category,
          priority: "Medium",
          message: `Stock will run out in ${daysOfStock} days, but lead time is ${item.leadTime} days`,
          currentStock: item.currentStock,
          daysOfStock: daysOfStock,
          leadTime: item.leadTime,
          recommendedAction: `Place order now to avoid stockout`,
          riskLevel: "High",
          timestamp: new Date().toISOString(),
        })
      }

      // High value at risk alert
      const valueAtRisk = item.currentStock * item.rate
      if (valueAtRisk > 10000 && item.stockoutRisk === "High") {
        alerts.push({
          id: `value-${item.skuId}`,
          type: "High Value at Risk",
          skuId: item.skuId,
          name: item.name,
          category: item.category,
          priority: "High",
          message: `High value inventory (₹${valueAtRisk.toLocaleString()}) at risk of stockout`,
          valueAtRisk: valueAtRisk,
          recommendedAction: `Prioritize restocking - high financial impact`,
          riskLevel: item.stockoutRisk,
          timestamp: new Date().toISOString(),
        })
      }

      // Slow moving stock alert
      if (item.turnoverRate < 0.3 && item.currentStock > item.reorderPoint * 2) {
        alerts.push({
          id: `slowmoving-${item.skuId}`,
          type: "Slow Moving Stock",
          skuId: item.skuId,
          name: item.name,
          category: item.category,
          priority: "Low",
          message: `Slow moving item with excess stock (${item.currentStock} units)`,
          currentStock: item.currentStock,
          turnoverRate: item.turnoverRate,
          recommendedAction: `Consider promotional pricing or reduce future orders`,
          riskLevel: "Low",
          timestamp: new Date().toISOString(),
        })
      }
    })

    return alerts.sort((a, b) => {
      const priorityOrder = { High: 3, Medium: 2, Low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }

  // Function to generate advanced analysis
  const generateAdvancedAnalysis = (data) => {
    const totalValue = data.reduce((sum, item) => sum + item.currentStock * item.rate, 0)
    const avgTurnover = data.reduce((sum, item) => sum + item.turnoverRate, 0) / data.length

    // ABC Analysis
    const sortedByValue = [...data].sort((a, b) => b.currentStock * b.rate - a.currentStock * a.rate)
    const totalItems = data.length
    const aItems = sortedByValue.slice(0, Math.floor(totalItems * 0.2))
    const bItems = sortedByValue.slice(Math.floor(totalItems * 0.2), Math.floor(totalItems * 0.5))
    const cItems = sortedByValue.slice(Math.floor(totalItems * 0.5))

    // Risk analysis
    const riskDistribution = {
      High: data.filter((item) => item.stockoutRisk === "High").length,
      Medium: data.filter((item) => item.stockoutRisk === "Medium").length,
      Low: data.filter((item) => item.stockoutRisk === "Low").length,
      "Very Low": data.filter((item) => item.stockoutRisk === "Very Low").length,
    }

    // Category performance
    const categoryAnalysis = {}
    data.forEach((item) => {
      if (!categoryAnalysis[item.category]) {
        categoryAnalysis[item.category] = {
          count: 0,
          totalValue: 0,
          avgTurnover: 0,
          stockoutRisk: 0,
        }
      }
      categoryAnalysis[item.category].count++
      categoryAnalysis[item.category].totalValue += item.currentStock * item.rate
      categoryAnalysis[item.category].avgTurnover += item.turnoverRate
      if (item.stockoutRisk === "High") categoryAnalysis[item.category].stockoutRisk++
    })

    Object.keys(categoryAnalysis).forEach((category) => {
      categoryAnalysis[category].avgTurnover /= categoryAnalysis[category].count
    })

    return {
      summary: {
        totalValue,
        avgTurnover,
        totalItems: data.length,
        criticalItems: data.filter((item) => item.currentStock < item.reorderPoint).length,
      },
      abcAnalysis: {
        aItems: { count: aItems.length, value: aItems.reduce((sum, item) => sum + item.currentStock * item.rate, 0) },
        bItems: { count: bItems.length, value: bItems.reduce((sum, item) => sum + item.currentStock * item.rate, 0) },
        cItems: { count: cItems.length, value: cItems.reduce((sum, item) => sum + item.currentStock * item.rate, 0) },
      },
      riskDistribution,
      categoryAnalysis,
      recommendations: generateRecommendations(data),
    }
  }

  // Function to generate recommendations
  const generateRecommendations = (data) => {
    const recommendations = []

    // High priority recommendations
    const criticalItems = data.filter((item) => item.currentStock < item.reorderPoint * 0.5)
    if (criticalItems.length > 0) {
      recommendations.push({
        priority: "High",
        title: "Immediate Restocking Required",
        description: `${criticalItems.length} items are critically low on stock`,
        action: "Place emergency orders for critical items",
      })
    }

    // Medium priority recommendations
    const slowMovingItems = data.filter((item) => item.turnoverRate < 0.3 && item.currentStock > item.reorderPoint * 2)
    if (slowMovingItems.length > 0) {
      recommendations.push({
        priority: "Medium",
        title: "Optimize Slow Moving Inventory",
        description: `${slowMovingItems.length} items are slow moving with excess stock`,
        action: "Consider promotional strategies or reduce future orders",
      })
    }

    // Low priority recommendations
    const highValueItems = data.filter((item) => item.currentStock * item.rate > 10000)
    if (highValueItems.length > 0) {
      recommendations.push({
        priority: "Low",
        title: "Monitor High Value Items",
        description: `${highValueItems.length} items represent high inventory value`,
        action: "Implement closer monitoring and just-in-time ordering",
      })
    }

    return recommendations
  }

  // Function to generate report from CSV data
  const generateReportFromCsv = (data) => {
    // Calculate key metrics
    const totalItems = data.length
    const totalStock = data.reduce((sum, item) => sum + item.currentStock, 0)
    const avgStock = Math.round(totalStock / totalItems)

    // Calculate items below reorder point
    const itemsBelowReorder = data.filter((item) => item.currentStock < item.reorderPoint)
    const percentBelowReorder = Math.round((itemsBelowReorder.length / totalItems) * 100)

    // Calculate stock by category
    const categories = {}
    data.forEach((item) => {
      if (!categories[item.category]) {
        categories[item.category] = {
          count: 0,
          stock: 0,
        }
      }
      categories[item.category].count++
      categories[item.category].stock += item.currentStock
    })

    // Format category data for charts
    const categoryData = Object.keys(categories).map((category) => ({
      name: category,
      count: categories[category].count,
      stock: categories[category].stock,
      percentage: Math.round((categories[category].count / totalItems) * 100),
    }))

    // Calculate stock distribution
    const stockDistribution = [
      { name: "Low Stock (< 100)", value: data.filter((item) => item.currentStock < 100).length },
      {
        name: "Medium Stock (100-500)",
        value: data.filter((item) => item.currentStock >= 100 && item.currentStock <= 500).length,
      },
      { name: "High Stock (> 500)", value: data.filter((item) => item.currentStock > 500).length },
    ]

    // Return the report object
    return {
      summary: {
        totalItems,
        totalStock,
        avgStock,
        itemsBelowReorder: itemsBelowReorder.length,
        percentBelowReorder,
      },
      categoryData,
      stockDistribution,
      reorderItems: itemsBelowReorder.slice(0, 10), // Top 10 items needing reorder
    }
  }

  // Enhanced CSV file upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Reset states
    setCsvError(null)
    setCsvSuccess(false)
    setCsvPreviewData(null)
    setCsvReport(null)
    setIsUploading(true)

    try {
      // Validate file type
      if (!file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("Please select a CSV file (.csv extension required)")
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("File size too large. Please select a file smaller than 10MB")
      }

      console.log("Reading file:", file.name, "Size:", file.size, "bytes")

      // Read file content
      const csvText = await readFileAsText(file)

      if (!csvText || csvText.trim().length === 0) {
        throw new Error("CSV file appears to be empty")
      }

      console.log("File content length:", csvText.length)
      console.log("First 200 characters:", csvText.substring(0, 200))

      // Parse CSV data
      const csvData = parseCSV(csvText)

      if (csvData.length === 0) {
        throw new Error("No valid data found in CSV file")
      }

      console.log("Successfully parsed", csvData.length, "items")

      // Generate report from CSV data
      const report = generateReportFromCsv(csvData)
      setCsvReport(report)

      // Set preview data and show preview dialog
      setCsvPreviewData(csvData)
      setCsvSuccess(true)
      setIsPreviewOpen(true)

      // Clear any previous errors
      setCsvError(null)
    } catch (error) {
      console.error("CSV upload error:", error)
      setCsvError(error.message)
    } finally {
      setIsUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // Helper function to read file as text
  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = () => reject(new Error("Error reading file"))
      reader.readAsText(file)
    })
  }

  // Function to import CSV data after preview
  const importCsvData = () => {
    if (!csvPreviewData) {
      setCsvError("No preview data available")
      return
    }

    try {
      console.log("Importing", csvPreviewData.length, "items")

      // Update inventory data with CSV data
      setInventoryData(csvPreviewData)

      // Generate advanced alerts
      const newAdvancedAlerts = generateAdvancedAlerts(csvPreviewData)
      setAdvancedAlerts(newAdvancedAlerts)

      // Generate advanced analysis
      const newAnalysisData = generateAdvancedAnalysis(csvPreviewData)
      setAnalysisData(newAnalysisData)

      // Update SKU categories
      const newSkuCategories = {
        "fast-moving": csvPreviewData.filter((item) => item.turnoverRate > 0.7).length,
        "medium-moving": csvPreviewData.filter((item) => item.turnoverRate > 0.3 && item.turnoverRate <= 0.7).length,
        "slow-moving": csvPreviewData.filter((item) => item.turnoverRate <= 0.3).length,
      }
      setSkuCategories(newSkuCategories)

      // Update basic alerts
      const newAlerts = csvPreviewData
        .filter((item) => item.currentStock < item.reorderPoint)
        .map((item) => ({
          id: item.skuId,
          name: item.name,
          currentStock: item.currentStock,
          reorderPoint: item.reorderPoint,
          timestamp: new Date().toISOString(),
        }))
      setAlerts(newAlerts)

      setCsvSuccess(true)
      setIsPreviewOpen(false)

      // Show the report after importing
      setTimeout(() => {
        setIsReportOpen(true)
      }, 500)

      console.log("Import completed successfully")
    } catch (error) {
      console.error("Import error:", error)
      setCsvError(`Failed to import data: ${error.message}`)
    }
  }

  // Function to clear file upload
  const clearFileUpload = () => {
    setCsvFile(null)
    setCsvError(null)
    setCsvSuccess(false)
    setCsvPreviewData(null)
    setCsvReport(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // Function to handle manual item form input changes
  const handleItemInputChange = (e) => {
    const { name, value } = e.target

    // If editing an existing item
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        [name]: name === "currentStock" || name === "reorderPoint" ? Number(value) : value,
      })
    } else {
      // If adding a new item
      setNewItem({
        ...newItem,
        [name]: name === "currentStock" || name === "reorderPoint" ? Number(value) : value,
      })
    }
  }

  // Function to handle category selection
  const handleCategoryChange = (value) => {
    if (editingItem) {
      setEditingItem({
        ...editingItem,
        category: value,
      })
    } else {
      setNewItem({
        ...newItem,
        category: value,
      })
    }
  }

  // Function to validate item form
  const validateItemForm = (item) => {
    const errors = {}

    if (!item.skuId.trim()) {
      errors.skuId = "SKU ID is required"
    } else if (!editingItem && inventoryData.some((existingItem) => existingItem.skuId === item.skuId)) {
      errors.skuId = "SKU ID already exists"
    }

    if (!item.name.trim()) {
      errors.name = "Name is required"
    }

    if (!item.category) {
      errors.category = "Category is required"
    }

    if (item.currentStock < 0) {
      errors.currentStock = "Current stock cannot be negative"
    }

    if (item.reorderPoint < 0) {
      errors.reorderPoint = "Reorder point cannot be negative"
    }

    return errors
  }

  // Function to add a new item
  const addNewItem = () => {
    const errors = validateItemForm(newItem)

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Generate additional fields
    const newItemWithFields = {
      ...newItem,
      turnoverRate: Math.random(),
      lastRestocked: new Date().toISOString().split("T")[0],
      predictedDemand: Math.floor(Math.random() * 500),
      rate: Math.floor(Math.random() * 1000) + 100,
      value: 0,
    }

    // Calculate value
    newItemWithFields.value = newItemWithFields.currentStock * newItemWithFields.rate

    // Add to inventory data
    setInventoryData([newItemWithFields, ...inventoryData])

    // Update SKU categories
    const updatedInventory = [newItemWithFields, ...inventoryData]
    const newSkuCategories = {
      "fast-moving": updatedInventory.filter((item) => item.turnoverRate > 0.7).length,
      "medium-moving": updatedInventory.filter((item) => item.turnoverRate > 0.3 && item.turnoverRate <= 0.7).length,
      "slow-moving": updatedInventory.filter((item) => item.turnoverRate <= 0.3).length,
    }
    setSkuCategories(newSkuCategories)

    // Check if new item needs reordering
    if (newItemWithFields.currentStock < newItemWithFields.reorderPoint) {
      setAlerts([
        {
          id: newItemWithFields.skuId,
          name: newItemWithFields.name,
          currentStock: newItemWithFields.currentStock,
          reorderPoint: newItemWithFields.reorderPoint,
          timestamp: new Date().toISOString(),
        },
        ...alerts,
      ])
    }

    // Reset form and close dialog
    setNewItem({
      skuId: "",
      name: "",
      category: "",
      currentStock: 0,
      reorderPoint: 0,
    })
    setFormErrors({})
    setIsAddItemDialogOpen(false)
  }

  // Function to start editing an item
  const startEditItem = (item) => {
    setEditingItem(item)
    setFormErrors({})
  }

  // Function to save edited item
  const saveEditedItem = () => {
    if (!editingItem) return

    const errors = validateItemForm(editingItem)

    // Skip SKU ID uniqueness check when editing
    delete errors.skuId

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors)
      return
    }

    // Update inventory data
    const updatedInventory = inventoryData.map((item) => (item.skuId === editingItem.skuId ? editingItem : item))

    setInventoryData(updatedInventory)

    // Update SKU categories
    const newSkuCategories = {
      "fast-moving": updatedInventory.filter((item) => item.turnoverRate > 0.7).length,
      "medium-moving": updatedInventory.filter((item) => item.turnoverRate > 0.3 && item.turnoverRate <= 0.7).length,
      "slow-moving": updatedInventory.filter((item) => item.turnoverRate <= 0.3).length,
    }
    setSkuCategories(newSkuCategories)

    // Update alerts if needed
    const existingAlertIndex = alerts.findIndex((alert) => alert.id === editingItem.skuId)

    if (editingItem.currentStock < editingItem.reorderPoint) {
      // Should be in alerts
      if (existingAlertIndex >= 0) {
        // Update existing alert
        const updatedAlerts = [...alerts]
        updatedAlerts[existingAlertIndex] = {
          id: editingItem.skuId,
          name: editingItem.name,
          currentStock: editingItem.currentStock,
          reorderPoint: editingItem.reorderPoint,
          timestamp: new Date().toISOString(),
        }
        setAlerts(updatedAlerts)
      } else {
        // Add new alert
        setAlerts([
          {
            id: editingItem.skuId,
            name: editingItem.name,
            currentStock: editingItem.currentStock,
            reorderPoint: editingItem.reorderPoint,
            timestamp: new Date().toISOString(),
          },
          ...alerts,
        ])
      }
    } else if (existingAlertIndex >= 0) {
      // Remove from alerts
      const updatedAlerts = alerts.filter((alert) => alert.id !== editingItem.skuId)
      setAlerts(updatedAlerts)
    }

    // Reset editing state
    setEditingItem(null)
  }

  // Function to cancel editing
  const cancelEdit = () => {
    setEditingItem(null)
    setFormErrors({})
  }

  // Function to delete an item
  const deleteItem = (skuId) => {
    // Remove from inventory
    const updatedInventory = inventoryData.filter((item) => item.skuId !== skuId)
    setInventoryData(updatedInventory)

    // Update SKU categories
    const newSkuCategories = {
      "fast-moving": updatedInventory.filter((item) => item.turnoverRate > 0.7).length,
      "medium-moving": updatedInventory.filter((item) => item.turnoverRate > 0.3 && item.turnoverRate <= 0.7).length,
      "slow-moving": updatedInventory.filter((item) => item.turnoverRate <= 0.3).length,
    }
    setSkuCategories(newSkuCategories)

    // Remove from alerts if present
    const updatedAlerts = alerts.filter((alert) => alert.id !== skuId)
    setAlerts(updatedAlerts)

    // Cancel editing if deleting the item being edited
    if (editingItem && editingItem.skuId === skuId) {
      setEditingItem(null)
    }
  }

  // Function to download CSV report
  const downloadCsvReport = () => {
    if (!csvReport) return

    // Create CSV content
    let csvContent = "CSV Import Report\n\n"

    // Summary section
    csvContent += "Summary:\n"
    csvContent += `Total Items,${csvReport.summary.totalItems}\n`
    csvContent += `Total Stock,${csvReport.summary.totalStock}\n`
    csvContent += `Average Stock per Item,${csvReport.summary.avgStock}\n`
    csvContent += `Items Below Reorder Point,${csvReport.summary.itemsBelowReorder}\n`
    csvContent += `Percentage Below Reorder Point,${csvReport.summary.percentBelowReorder}%\n\n`

    // Category breakdown
    csvContent += "Category Breakdown:\n"
    csvContent += "Category,Item Count,Total Stock,Percentage\n"
    csvReport.categoryData.forEach((cat) => {
      csvContent += `${cat.name},${cat.count},${cat.stock},${cat.percentage}%\n`
    })
    csvContent += "\n"

    // Stock distribution
    csvContent += "Stock Distribution:\n"
    csvContent += "Range,Count\n"
    csvReport.stockDistribution.forEach((dist) => {
      csvContent += `${dist.name},${dist.value}\n`
    })
    csvContent += "\n"

    // Items needing reorder
    csvContent += "Top Items Needing Reorder:\n"
    csvContent += "SKU ID,Name,Category,Current Stock,Reorder Point,Shortage\n"
    csvReport.reorderItems.forEach((item) => {
      const shortage = item.reorderPoint - item.currentStock
      csvContent += `${item.skuId},${item.name},${item.category},${item.currentStock},${item.reorderPoint},${shortage}\n`
    })

    // Create and trigger download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "inventory_report.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Filter inventory data based on search term
  const filteredInventoryData = inventoryData.filter(
    (item) =>
      item.skuId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Enhanced colors for charts with better contrast
  const COLORS = ["#2563eb", "#16a34a", "#dc2626", "#ea580c", "#7c3aed", "#0891b2"]

  // Custom tooltip for better readability
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{`${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto p-4">
        <header className="mb-8 pt-6">
          <div className="flex items-center mb-2">
            <Package className="h-8 w-8 mr-3 text-blue-600" />
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">TARGET JIT</h1>
          </div>
          <p className="text-lg text-muted-foreground font-medium">Intelligent Inventory Management System</p>
        </header>

        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 h-12 text-base font-medium">
            <TabsTrigger value="dashboard" className="text-sm font-semibold">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="inventory" className="text-sm font-semibold">
              Inventory
            </TabsTrigger>
            <TabsTrigger value="forecasting" className="text-sm font-semibold">
              Forecasting
            </TabsTrigger>
            <TabsTrigger value="alerts" className="text-sm font-semibold">
              Alerts
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Total SKUs</CardTitle>
                  <Package className="h-5 w-5 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{inventoryData.length}</div>
                  <p className="text-sm text-muted-foreground font-medium">
                    Across {new Set(inventoryData.map((item) => item.category)).size} categories
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Fast-Moving Items</CardTitle>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{skuCategories["fast-moving"] || 0}</div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {Math.round(((skuCategories["fast-moving"] || 0) / inventoryData.length) * 100) || 0}% of total
                    inventory
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Slow-Moving Items</CardTitle>
                  <Clock className="h-5 w-5 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{skuCategories["slow-moving"] || 0}</div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {Math.round(((skuCategories["slow-moving"] || 0) / inventoryData.length) * 100) || 0}% of total
                    inventory
                  </p>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-bold text-gray-700">Reorder Alerts</CardTitle>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{alerts.length}</div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {alerts.length > 0 ? "Items below reorder point" : "No items need reordering"}
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card className="col-span-1 border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">SKU Categories</CardTitle>
                  <CardDescription className="text-base font-medium">
                    Distribution of inventory by movement speed
                  </CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart
                      data={[
                        { name: "Fast-Moving", value: skuCategories["fast-moving"] || 0 },
                        { name: "Medium-Moving", value: skuCategories["medium-moving"] || 0 },
                        { name: "Slow-Moving", value: skuCategories["slow-moving"] || 0 },
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                      <YAxis tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="col-span-1 border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Demand Forecast vs Actual</CardTitle>
                  <CardDescription className="text-base font-medium">Last 12 months performance</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                      <YAxis tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "14px", fontWeight: 600 }} />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#2563eb"
                        strokeWidth={3}
                        name="Actual"
                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#16a34a"
                        strokeWidth={3}
                        strokeDasharray="8 8"
                        name="Forecast"
                        dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Inventory Management</CardTitle>
                <CardDescription className="text-base font-medium">
                  View and manage your inventory items
                </CardDescription>

                <div className="mt-6 space-y-4">
                  <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex w-full max-w-sm items-center space-x-2">
                      <Input
                        type="search"
                        placeholder="Search by SKU, name, or category..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="text-base font-medium"
                      />
                      <Button type="submit" size="icon" className="bg-blue-600 hover:bg-blue-700">
                        <Search className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex gap-3">
                      {/* CSV Upload Button */}
                      <div className="relative">
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-2 font-semibold hover:bg-blue-50"
                          disabled={isUploading}
                        >
                          <Upload className="h-4 w-4" />
                          <span>{isUploading ? "Uploading..." : "Import CSV"}</span>
                          <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            ref={fileInputRef}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                            disabled={isUploading}
                          />
                        </Button>
                      </div>

                      {/* View Report Button - Only show if report exists */}
                      {csvReport && (
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-2 font-semibold hover:bg-green-50"
                          onClick={() => setIsReportOpen(true)}
                        >
                          <FileText className="h-4 w-4" />
                          <span>View Report</span>
                        </Button>
                      )}

                      {/* Advanced Analysis Button - Only show if analysis data exists */}
                      {analysisData && (
                        <Button
                          variant="outline"
                          className="flex items-center gap-2 border-2 font-semibold hover:bg-purple-50"
                          onClick={() => setIsAnalysisOpen(true)}
                        >
                          <TrendingUp className="h-4 w-4" />
                          <span>Advanced Analysis</span>
                        </Button>
                      )}

                      {/* Add Item Button */}
                      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
                        <DialogTrigger asChild>
                          <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold">
                            <Plus className="h-4 w-4" />
                            <span>Add Item</span>
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-bold">Add New Inventory Item</DialogTitle>
                            <DialogDescription className="text-base">
                              Enter the details for the new inventory item.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="skuId" className="text-right font-semibold text-sm">
                                SKU ID
                              </label>
                              <Input
                                id="skuId"
                                name="skuId"
                                value={newItem.skuId}
                                onChange={handleItemInputChange}
                                className="col-span-3 font-medium"
                              />
                              {formErrors.skuId && (
                                <p className="col-span-4 text-right text-sm text-red-500 font-medium">
                                  {formErrors.skuId}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="name" className="text-right font-semibold text-sm">
                                Name
                              </label>
                              <Input
                                id="name"
                                name="name"
                                value={newItem.name}
                                onChange={handleItemInputChange}
                                className="col-span-3 font-medium"
                              />
                              {formErrors.name && (
                                <p className="col-span-4 text-right text-sm text-red-500 font-medium">
                                  {formErrors.name}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="category" className="text-right font-semibold text-sm">
                                Category
                              </label>
                              <Select value={newItem.category} onValueChange={handleCategoryChange}>
                                <SelectTrigger className="col-span-3">
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Electronics">Electronics</SelectItem>
                                  <SelectItem value="Clothing">Clothing</SelectItem>
                                  <SelectItem value="Food">Food</SelectItem>
                                  <SelectItem value="Home Goods">Home Goods</SelectItem>
                                  <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                                </SelectContent>
                              </Select>
                              {formErrors.category && (
                                <p className="col-span-4 text-right text-sm text-red-500 font-medium">
                                  {formErrors.category}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="currentStock" className="text-right font-semibold text-sm">
                                Current Stock
                              </label>
                              <Input
                                id="currentStock"
                                name="currentStock"
                                type="number"
                                value={newItem.currentStock}
                                onChange={handleItemInputChange}
                                className="col-span-3 font-medium"
                              />
                              {formErrors.currentStock && (
                                <p className="col-span-4 text-right text-sm text-red-500 font-medium">
                                  {formErrors.currentStock}
                                </p>
                              )}
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                              <label htmlFor="reorderPoint" className="text-right font-semibold text-sm">
                                Reorder Point
                              </label>
                              <Input
                                id="reorderPoint"
                                name="reorderPoint"
                                type="number"
                                value={newItem.reorderPoint}
                                onChange={handleItemInputChange}
                                className="col-span-3 font-medium"
                              />
                              {formErrors.reorderPoint && (
                                <p className="col-span-4 text-right text-sm text-red-500 font-medium">
                                  {formErrors.reorderPoint}
                                </p>
                              )}
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="submit"
                              onClick={addNewItem}
                              className="bg-blue-600 hover:bg-blue-700 font-semibold"
                            >
                              Add Item
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Add the sample CSV generator here */}
                  <div className="flex justify-center">
                    <SampleCsvGenerator />
                  </div>

                  {csvError && (
                    <Alert variant="destructive" className="mt-4 border-2">
                      <AlertCircle className="h-5 w-5" />
                      <AlertTitle className="font-bold text-base">Import Error</AlertTitle>
                      <AlertDescription className="text-base font-medium">
                        {csvError}
                        <br />
                        <Button
                          variant="link"
                          className="p-0 h-auto text-red-800 underline mt-2 font-semibold"
                          onClick={() => setCsvError(null)}
                        >
                          Dismiss
                        </Button>
                      </AlertDescription>
                    </Alert>
                  )}

                  {csvSuccess && !csvError && (
                    <Alert className="mt-4 bg-green-50 text-green-800 border-green-200 border-2">
                      <CheckCircle className="h-5 w-5" />
                      <AlertTitle className="font-bold text-base">Import Successful!</AlertTitle>
                      <AlertDescription className="text-base font-medium">
                        {csvPreviewData?.length || 0} items imported successfully.
                        <div className="flex gap-3 mt-2">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-green-800 underline font-semibold"
                            onClick={() => setIsReportOpen(true)}
                          >
                            View Report
                          </Button>
                          {analysisData && (
                            <Button
                              variant="link"
                              className="p-0 h-auto text-green-800 underline font-semibold"
                              onClick={() => setIsAnalysisOpen(true)}
                            >
                              View Analysis
                            </Button>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border-2">
                  <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">SKU ID</th>
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Category</th>
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Current Stock</th>
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Reorder Point</th>
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Turnover Rate</th>
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Status</th>
                          <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredInventoryData.slice(0, 10).map((item) => (
                          <tr key={item.skuId} className="border-b hover:bg-gray-50">
                            <td className="p-4 align-middle font-semibold text-gray-900">{item.skuId}</td>
                            <td className="p-4 align-middle">
                              {editingItem && editingItem.skuId === item.skuId ? (
                                <Input
                                  name="name"
                                  value={editingItem.name}
                                  onChange={handleItemInputChange}
                                  className="h-8 py-1 font-medium"
                                />
                              ) : (
                                <span className="font-medium text-gray-900">{item.name}</span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {editingItem && editingItem.skuId === item.skuId ? (
                                <Select value={editingItem.category} onValueChange={handleCategoryChange}>
                                  <SelectTrigger className="h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Electronics">Electronics</SelectItem>
                                    <SelectItem value="Clothing">Clothing</SelectItem>
                                    <SelectItem value="Food">Food</SelectItem>
                                    <SelectItem value="Home Goods">Home Goods</SelectItem>
                                    <SelectItem value="Office Supplies">Office Supplies</SelectItem>
                                  </SelectContent>
                                </Select>
                              ) : (
                                <span className="font-medium text-gray-700">{item.category}</span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {editingItem && editingItem.skuId === item.skuId ? (
                                <Input
                                  name="currentStock"
                                  type="number"
                                  value={editingItem.currentStock}
                                  onChange={handleItemInputChange}
                                  className="h-8 py-1 w-24 font-medium"
                                />
                              ) : (
                                <span className="font-semibold text-gray-900">{item.currentStock}</span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {editingItem && editingItem.skuId === item.skuId ? (
                                <Input
                                  name="reorderPoint"
                                  type="number"
                                  value={editingItem.reorderPoint}
                                  onChange={handleItemInputChange}
                                  className="h-8 py-1 w-24 font-medium"
                                />
                              ) : (
                                <span className="font-semibold text-gray-900">{item.reorderPoint}</span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              <span className="font-medium text-gray-700">{item.turnoverRate.toFixed(2)}</span>
                            </td>
                            <td className="p-4 align-middle">
                              {item.currentStock < item.reorderPoint ? (
                                <span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-800">
                                  Reorder
                                </span>
                              ) : (
                                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-800">
                                  In Stock
                                </span>
                              )}
                            </td>
                            <td className="p-4 align-middle">
                              {editingItem && editingItem.skuId === item.skuId ? (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={saveEditedItem}
                                    className="hover:bg-green-100"
                                  >
                                    <Save className="h-4 w-4 text-green-600" />
                                  </Button>
                                  <Button variant="ghost" size="icon" onClick={cancelEdit} className="hover:bg-red-100">
                                    <X className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => startEditItem(item)}
                                    className="hover:bg-blue-100"
                                  >
                                    <Edit className="h-4 w-4 text-blue-600" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => deleteItem(item.skuId)}
                                    className="hover:bg-red-100"
                                  >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="flex justify-center mt-4">
                  <p className="text-base font-medium text-muted-foreground">
                    Showing 10 of {filteredInventoryData.length} items
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Forecasting Tab */}
          <TabsContent value="forecasting">
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">Demand Forecasting</CardTitle>
                <CardDescription className="text-base font-medium">
                  ML-powered demand predictions for your inventory
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2 text-gray-900">Forecast Accuracy</h3>
                  <div className="h-6 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: "87%" }}></div>
                  </div>
                  <p className="text-base font-medium text-muted-foreground mt-1">
                    87% accuracy over the last 12 months
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Monthly Demand Forecast</h3>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={forecastData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                      <YAxis tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: "14px", fontWeight: 600 }} />
                      <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#2563eb"
                        strokeWidth={3}
                        name="Actual Demand"
                        dot={{ fill: "#2563eb", strokeWidth: 2, r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#16a34a"
                        strokeWidth={3}
                        name="Forecasted Demand"
                        strokeDasharray="8 8"
                        dot={{ fill: "#16a34a", strokeWidth: 2, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div>
                  <h3 className="text-lg font-bold mb-4 text-gray-900">Top 5 Items by Predicted Demand</h3>
                  <div className="rounded-md border-2">
                    <div className="w-full overflow-auto">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">SKU ID</th>
                            <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Name</th>
                            <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Category</th>
                            <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">Current Stock</th>
                            <th className="h-12 px-4 text-left align-middle font-bold text-gray-900">
                              Predicted Demand
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {inventoryData
                            .sort((a, b) => b.predictedDemand - a.predictedDemand)
                            .slice(0, 5)
                            .map((item) => (
                              <tr key={item.skuId} className="border-b hover:bg-gray-50">
                                <td className="p-4 align-middle font-semibold text-gray-900">{item.skuId}</td>
                                <td className="p-4 align-middle font-medium text-gray-900">{item.name}</td>
                                <td className="p-4 align-middle font-medium text-gray-700">{item.category}</td>
                                <td className="p-4 align-middle font-semibold text-gray-900">{item.currentStock}</td>
                                <td className="p-4 align-middle font-semibold text-gray-900">{item.predictedDemand}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 font-semibold">
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh Forecasts
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts">
            <div className="space-y-6">
              {/* Alert Filters */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Alert Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Select
                      value={alertFilters.priority}
                      onValueChange={(value) => setAlertFilters({ ...alertFilters, priority: value })}
                    >
                      <SelectTrigger className="w-[180px] font-medium">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="High">High Priority</SelectItem>
                        <SelectItem value="Medium">Medium Priority</SelectItem>
                        <SelectItem value="Low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={alertFilters.riskLevel}
                      onValueChange={(value) => setAlertFilters({ ...alertFilters, riskLevel: value })}
                    >
                      <SelectTrigger className="w-[180px] font-medium">
                        <SelectValue placeholder="Risk Level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Risk Levels</SelectItem>
                        <SelectItem value="High">High Risk</SelectItem>
                        <SelectItem value="Medium">Medium Risk</SelectItem>
                        <SelectItem value="Low">Low Risk</SelectItem>
                        <SelectItem value="Very Low">Very Low Risk</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Alerts */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Advanced Reorder Alerts</CardTitle>
                  <CardDescription className="text-base font-medium">
                    Intelligent alerts with risk assessment and recommendations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {advancedAlerts.filter(
                    (alert) =>
                      (alertFilters.priority === "all" || alert.priority === alertFilters.priority) &&
                      (alertFilters.riskLevel === "all" || alert.riskLevel === alertFilters.riskLevel),
                  ).length > 0 ? (
                    <div className="space-y-4">
                      {advancedAlerts
                        .filter(
                          (alert) =>
                            (alertFilters.priority === "all" || alert.priority === alertFilters.priority) &&
                            (alertFilters.riskLevel === "all" || alert.riskLevel === alertFilters.riskLevel),
                        )
                        .map((alert) => (
                          <div
                            key={alert.id}
                            className={`flex items-start gap-4 rounded-lg border-2 p-4 ${
                              alert.priority === "High"
                                ? "border-red-200 bg-red-50"
                                : alert.priority === "Medium"
                                  ? "border-yellow-200 bg-yellow-50"
                                  : "border-blue-200 bg-blue-50"
                            }`}
                          >
                            <AlertCircle
                              className={`h-6 w-6 mt-0.5 ${
                                alert.priority === "High"
                                  ? "text-red-500"
                                  : alert.priority === "Medium"
                                    ? "text-yellow-500"
                                    : "text-blue-500"
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="text-base font-bold text-gray-900">{alert.type}</h4>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    alert.priority === "High"
                                      ? "bg-red-100 text-red-800"
                                      : alert.priority === "Medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {alert.priority} Priority
                                </span>
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    alert.riskLevel === "High"
                                      ? "bg-red-100 text-red-800"
                                      : alert.riskLevel === "Medium"
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {alert.riskLevel} Risk
                                </span>
                              </div>
                              <p className="text-base font-semibold text-gray-900">
                                {alert.name} ({alert.skuId})
                              </p>
                              <p className="text-base text-gray-700 font-medium">{alert.message}</p>
                              <p className="text-base text-blue-600 mt-2 font-semibold">
                                <strong>Recommended Action:</strong> {alert.recommendedAction}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1 font-medium">
                                Alert generated: {new Date(alert.timestamp).toLocaleString()}
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="font-semibold border-2">
                              Take Action
                            </Button>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-primary/10 p-3 mb-4">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">No alerts match your filters</h3>
                      <p className="text-base text-muted-foreground text-center mt-1 font-medium">
                        Adjust your filters to see more alerts.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Basic Alerts */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Basic Reorder Alerts</CardTitle>
                  <CardDescription className="text-base font-medium">Simple stock level alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  {alerts.length > 0 ? (
                    <div className="space-y-4">
                      {alerts.map((alert) => (
                        <div key={alert.id} className="flex items-start gap-4 rounded-lg border-2 p-4">
                          <AlertCircle className="h-6 w-6 text-red-500 mt-0.5" />
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-gray-900">
                              {alert.name} ({alert.id})
                            </h4>
                            <p className="text-base text-gray-700 font-medium">
                              Current stock: {alert.currentStock} | Reorder point: {alert.reorderPoint}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1 font-medium">
                              Alert generated: {new Date(alert.timestamp).toLocaleString()}
                            </p>
                          </div>
                          <Button variant="outline" size="sm" className="font-semibold border-2">
                            Reorder
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="rounded-full bg-primary/10 p-3 mb-4">
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">No basic alerts</h3>
                      <p className="text-base text-muted-foreground text-center mt-1 font-medium">
                        All inventory items are above their reorder points.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* CSV Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">CSV Import Preview</DialogTitle>
            <DialogDescription className="text-base font-medium">
              Review the data before importing. The first 5 rows are shown below.
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-auto max-h-[400px]">
            {csvPreviewData && csvPreviewData.length > 0 ? (
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border px-4 py-2 text-left font-bold text-gray-900">SKU ID</th>
                    <th className="border px-4 py-2 text-left font-bold text-gray-900">Name (Particulars)</th>
                    <th className="border px-4 py-2 text-left font-bold text-gray-900">Category</th>
                    <th className="border px-4 py-2 text-left font-bold text-gray-900">Quantity</th>
                    <th className="border px-4 py-2 text-left font-bold text-gray-900">Rate</th>
                    <th className="border px-4 py-2 text-left font-bold text-gray-900">Value</th>
                    <th className="border px-4 py-2 text-left font-bold text-gray-900">Reorder Point</th>
                  </tr>
                </thead>
                <tbody>
                  {csvPreviewData.slice(0, 5).map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="border px-4 py-2 font-semibold text-gray-900">{item.skuId}</td>
                      <td className="border px-4 py-2 font-medium text-gray-900">{item.name}</td>
                      <td className="border px-4 py-2 font-medium text-gray-700">{item.category}</td>
                      <td className="border px-4 py-2 font-semibold text-gray-900">{item.currentStock}</td>
                      <td className="border px-4 py-2 font-medium text-gray-900">₹{item.rate.toLocaleString()}</td>
                      <td className="border px-4 py-2 font-medium text-gray-900">₹{item.value.toLocaleString()}</td>
                      <td className="border px-4 py-2 font-semibold text-blue-600">{item.reorderPoint}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8">
                <p className="text-base text-muted-foreground font-medium">No preview data available</p>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-4">
            <p className="text-base text-muted-foreground font-medium">
              {csvPreviewData ? `${csvPreviewData.length} rows found in CSV file` : "No data available"}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)} className="font-semibold">
              Cancel
            </Button>
            <Button onClick={importCsvData} className="bg-blue-600 hover:bg-blue-700 font-semibold">
              Import Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CSV Report Dialog */}
      <Dialog open={isReportOpen} onOpenChange={setIsReportOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">CSV Import Report</DialogTitle>
            <DialogDescription className="text-base font-medium">
              Analysis of your imported inventory data
            </DialogDescription>
          </DialogHeader>

          {csvReport && (
            <div className="space-y-6">
              {/* Summary Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-gray-700">Total Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{csvReport.summary.totalItems}</div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-gray-700">Total Stock</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">
                      {csvReport.summary.totalStock.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-gray-700">Items Below Reorder Point</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-gray-900">{csvReport.summary.itemsBelowReorder}</div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {csvReport.summary.percentBelowReorder}% of total inventory
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Distribution */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900">Category Distribution</CardTitle>
                    <CardDescription className="text-base font-medium">Breakdown of items by category</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={csvReport.categoryData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                          <YAxis tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="count" fill="#2563eb" name="Item Count" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Stock Distribution */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold text-gray-900">Stock Level Distribution</CardTitle>
                    <CardDescription className="text-base font-medium">
                      Distribution of items by stock level
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex justify-center">
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={csvReport.stockDistribution}
                            cx="50%"
                            cy="50%"
                            labelLine={true}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                            nameKey="name"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {csvReport.stockDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Items Needing Reorder */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Items Needing Reorder</CardTitle>
                  <CardDescription className="text-base font-medium">
                    Top items that are below their reorder point
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {csvReport.reorderItems.length > 0 ? (
                    <div className="rounded-md border-2">
                      <table className="w-full caption-bottom text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="h-10 px-4 text-left align-middle font-bold text-gray-900">SKU ID</th>
                            <th className="h-10 px-4 text-left align-middle font-bold text-gray-900">Name</th>
                            <th className="h-10 px-4 text-left align-middle font-bold text-gray-900">Category</th>
                            <th className="h-10 px-4 text-left align-middle font-bold text-gray-900">Current Stock</th>
                            <th className="h-10 px-4 text-left align-middle font-bold text-gray-900">Reorder Point</th>
                            <th className="h-10 px-4 text-left align-middle font-bold text-gray-900">Shortage</th>
                          </tr>
                        </thead>
                        <tbody>
                          {csvReport.reorderItems.map((item) => (
                            <tr key={item.skuId} className="border-b hover:bg-gray-50">
                              <td className="p-2 align-middle font-semibold text-gray-900">{item.skuId}</td>
                              <td className="p-2 align-middle font-medium text-gray-900">{item.name}</td>
                              <td className="p-2 align-middle font-medium text-gray-700">{item.category}</td>
                              <td className="p-2 align-middle font-semibold text-gray-900">{item.currentStock}</td>
                              <td className="p-2 align-middle font-semibold text-blue-600">{item.reorderPoint}</td>
                              <td className="p-2 align-middle text-red-600 font-bold">
                                {item.reorderPoint - item.currentStock}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-base font-medium text-gray-700">No items are below their reorder point.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Download Report Button */}
              <div className="flex justify-end">
                <Button
                  onClick={downloadCsvReport}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 font-semibold"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReportOpen(false)} className="font-semibold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Advanced Analysis Dialog */}
      <Dialog open={isAnalysisOpen} onOpenChange={setIsAnalysisOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">Advanced Inventory Analysis</DialogTitle>
            <DialogDescription className="text-base font-medium">
              Comprehensive analysis of your inventory data
            </DialogDescription>
          </DialogHeader>

          {analysisData && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-gray-700">Total Inventory Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      ₹{analysisData.summary.totalValue.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-gray-700">Average Turnover Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">
                      {(analysisData.summary.avgTurnover * 100).toFixed(1)}%
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-gray-700">Critical Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{analysisData.summary.criticalItems}</div>
                    <p className="text-sm text-muted-foreground font-medium">
                      {((analysisData.summary.criticalItems / analysisData.summary.totalItems) * 100).toFixed(1)}% of
                      total
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-bold text-gray-700">Total Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-gray-900">{analysisData.summary.totalItems}</div>
                  </CardContent>
                </Card>
              </div>

              {/* ABC Analysis */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">ABC Analysis</CardTitle>
                  <CardDescription className="text-base font-medium">
                    Classification of items by value contribution
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border-2 rounded-lg">
                      <h3 className="font-bold text-lg text-gray-900">A Items (High Value)</h3>
                      <p className="text-3xl font-bold text-green-600">{analysisData.abcAnalysis.aItems.count}</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        ₹{analysisData.abcAnalysis.aItems.value.toLocaleString()} value
                      </p>
                    </div>
                    <div className="text-center p-4 border-2 rounded-lg">
                      <h3 className="font-bold text-lg text-gray-900">B Items (Medium Value)</h3>
                      <p className="text-3xl font-bold text-yellow-600">{analysisData.abcAnalysis.bItems.count}</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        ₹{analysisData.abcAnalysis.bItems.value.toLocaleString()} value
                      </p>
                    </div>
                    <div className="text-center p-4 border-2 rounded-lg">
                      <h3 className="font-bold text-lg text-gray-900">C Items (Low Value)</h3>
                      <p className="text-3xl font-bold text-blue-600">{analysisData.abcAnalysis.cItems.count}</p>
                      <p className="text-sm text-muted-foreground font-medium">
                        ₹{analysisData.abcAnalysis.cItems.value.toLocaleString()} value
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Risk Distribution */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Risk Distribution</CardTitle>
                  <CardDescription className="text-base font-medium">
                    Stockout risk assessment across inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={Object.entries(analysisData.riskDistribution).map(([risk, count]) => ({ risk, count }))}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="risk" tick={{ fontSize: 12, fontWeight: 600 }} stroke="#374151" />
                        <YAxis dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              <Card className="border-2">
                <CardHeader>
                  <CardTitle className="text-lg font-bold text-gray-900">Strategic Recommendations</CardTitle>
                  <CardDescription className="text-base font-medium">
                    AI-powered recommendations for inventory optimization
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisData.recommendations.map((rec, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border-2 ${
                          rec.priority === "High"
                            ? "border-red-200 bg-red-50"
                            : rec.priority === "Medium"
                              ? "border-yellow-200 bg-yellow-50"
                              : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              rec.priority === "High"
                                ? "bg-red-100 text-red-800"
                                : rec.priority === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {rec.priority} Priority
                          </span>
                          <h4 className="font-bold text-gray-900">{rec.title}</h4>
                        </div>
                        <p className="text-base text-gray-700 font-medium mb-2">{rec.description}</p>
                        <p className="text-base font-semibold text-gray-900">Action: {rec.action}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnalysisOpen(false)} className="font-semibold">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
