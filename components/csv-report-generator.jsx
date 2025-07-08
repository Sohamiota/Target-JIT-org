"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Download } from "lucide-react"

export default function CsvReportGenerator({ reportData }) {
  const [activeTab, setActiveTab] = useState("summary")

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  // Function to download CSV report
  const downloadCsvReport = () => {
    if (!reportData) return

    // Create CSV content
    let csvContent = "CSV Import Report\n\n"

    // Summary section
    csvContent += "Summary:\n"
    csvContent += `Total Items,${reportData.summary.totalItems}\n`
    csvContent += `Total Stock,${reportData.summary.totalStock}\n`
    csvContent += `Average Stock per Item,${reportData.summary.avgStock}\n`
    csvContent += `Items Below Reorder Point,${reportData.summary.itemsBelowReorder}\n`
    csvContent += `Percentage Below Reorder Point,${reportData.summary.percentBelowReorder}%\n\n`

    // Category breakdown
    csvContent += "Category Breakdown:\n"
    csvContent += "Category,Item Count,Total Stock,Percentage\n"
    reportData.categoryData.forEach((cat) => {
      csvContent += `${cat.name},${cat.count},${cat.stock},${cat.percentage}%\n`
    })
    csvContent += "\n"

    // Stock distribution
    csvContent += "Stock Distribution:\n"
    csvContent += "Range,Count\n"
    reportData.stockDistribution.forEach((dist) => {
      csvContent += `${dist.name},${dist.value}\n`
    })
    csvContent += "\n"

    // Items needing reorder
    csvContent += "Top Items Needing Reorder:\n"
    csvContent += "SKU ID,Name,Category,Current Stock,Reorder Point,Shortage\n"
    reportData.reorderItems.forEach((item) => {
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
  }

  if (!reportData) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">No report data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalItems}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.totalStock.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Items Below Reorder Point</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.summary.itemsBelowReorder}</div>
            <p className="text-xs text-muted-foreground">
              {reportData.summary.percentBelowReorder}% of total inventory
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Breakdown of items by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="Item Count" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Stock Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Stock Level Distribution</CardTitle>
            <CardDescription>Distribution of items by stock level</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={reportData.stockDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {reportData.stockDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Download Button */}
      <div className="flex justify-end">
        <Button onClick={downloadCsvReport} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </Button>
      </div>
    </div>
  )
}
