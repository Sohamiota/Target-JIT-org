"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
} from "recharts"
import { AlertCircle, Package, TrendingUp, Clock, AlertTriangle, Search, RefreshCw } from "lucide-react"

export default function TargetJIT() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)

  // Simulated data - in a real app, this would come from the backend
  const [inventoryData, setInventoryData] = useState([])
  const [forecastData, setForecastData] = useState([])
  const [skuCategories, setSkuCategories] = useState({})
  const [alerts, setAlerts] = useState([])

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

  // Function to generate sample inventory data
  const generateSampleInventoryData = () => {
    const categories = ["Electronics", "Clothing", "Food", "Home Goods", "Office Supplies"]
    const data = []

    for (let i = 1; i <= 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)]
      const currentStock = Math.floor(Math.random() * 1000)
      const reorderPoint = Math.floor(Math.random() * 200) + 50
      const turnoverRate = Math.random()

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
      })
    }

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

  // Filter inventory data based on search term
  const filteredInventoryData = inventoryData.filter(
    (item) =>
      item.skuId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TARGET JIT</h1>
        <p className="text-muted-foreground">Intelligent Inventory Management System</p>
      </header>

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{inventoryData.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across {new Set(inventoryData.map((item) => item.category)).size} categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Fast-Moving Items</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skuCategories["fast-moving"] || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(((skuCategories["fast-moving"] || 0) / inventoryData.length) * 100)}% of total inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Slow-Moving Items</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{skuCategories["slow-moving"] || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(((skuCategories["slow-moving"] || 0) / inventoryData.length) * 100)}% of total inventory
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reorder Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alerts.length}</div>
                <p className="text-xs text-muted-foreground">
                  {alerts.length > 0 ? "Items below reorder point" : "No items need reordering"}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>SKU Categories</CardTitle>
                <CardDescription>Distribution of inventory by movement speed</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: "Fast-Moving", value: skuCategories["fast-moving"] || 0 },
                      { name: "Medium-Moving", value: skuCategories["medium-moving"] || 0 },
                      { name: "Slow-Moving", value: skuCategories["slow-moving"] || 0 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Demand Forecast vs Actual</CardTitle>
                <CardDescription>Last 12 months performance</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual" />
                    <Line type="monotone" dataKey="forecast" stroke="#82ca9d" name="Forecast" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Inventory Management</CardTitle>
              <CardDescription>View and manage your inventory items</CardDescription>
              <div className="flex w-full max-w-sm items-center space-x-2 mt-4">
                <Input
                  type="search"
                  placeholder="Search by SKU, name, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button type="submit" size="icon">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="w-full overflow-auto">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="h-12 px-4 text-left align-middle font-medium">SKU ID</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Current Stock</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Reorder Point</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Turnover Rate</th>
                        <th className="h-12 px-4 text-left align-middle font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventoryData.slice(0, 10).map((item) => (
                        <tr key={item.skuId} className="border-b">
                          <td className="p-4 align-middle">{item.skuId}</td>
                          <td className="p-4 align-middle">{item.name}</td>
                          <td className="p-4 align-middle">{item.category}</td>
                          <td className="p-4 align-middle">{item.currentStock}</td>
                          <td className="p-4 align-middle">{item.reorderPoint}</td>
                          <td className="p-4 align-middle">{item.turnoverRate.toFixed(2)}</td>
                          <td className="p-4 align-middle">
                            {item.currentStock < item.reorderPoint ? (
                              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                                Reorder
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                In Stock
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="flex justify-center mt-4">
                <p className="text-sm text-muted-foreground">Showing 10 of {filteredInventoryData.length} items</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Forecasting Tab */}
        <TabsContent value="forecasting">
          <Card>
            <CardHeader>
              <CardTitle>Demand Forecasting</CardTitle>
              <CardDescription>ML-powered demand predictions for your inventory</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">Forecast Accuracy</h3>
                <div className="h-4 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: "87%" }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">87% accuracy over the last 12 months</p>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-medium mb-4">Monthly Demand Forecast</h3>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={forecastData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="actual" stroke="#8884d8" name="Actual Demand" />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="#82ca9d"
                      name="Forecasted Demand"
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Top 5 Items by Predicted Demand</h3>
                <div className="rounded-md border">
                  <div className="w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium">SKU ID</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Category</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Current Stock</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Predicted Demand</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventoryData
                          .sort((a, b) => b.predictedDemand - a.predictedDemand)
                          .slice(0, 5)
                          .map((item) => (
                            <tr key={item.skuId} className="border-b">
                              <td className="p-4 align-middle">{item.skuId}</td>
                              <td className="p-4 align-middle">{item.name}</td>
                              <td className="p-4 align-middle">{item.category}</td>
                              <td className="p-4 align-middle">{item.currentStock}</td>
                              <td className="p-4 align-middle">{item.predictedDemand}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" /> Refresh Forecasts
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Reorder Alerts</CardTitle>
              <CardDescription>Items that need attention</CardDescription>
            </CardHeader>
            <CardContent>
              {alerts.length > 0 ? (
                <div className="space-y-4">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="flex items-start gap-4 rounded-lg border p-4">
                      <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="text-sm font-semibold">
                          {alert.name} ({alert.id})
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Current stock: {alert.currentStock} | Reorder point: {alert.reorderPoint}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Alert generated: {new Date(alert.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        Reorder
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="rounded-full bg-primary/10 p-3 mb-4">
                    <Package className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium">No alerts</h3>
                  <p className="text-sm text-muted-foreground text-center mt-1">
                    All inventory items are above their reorder points.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
