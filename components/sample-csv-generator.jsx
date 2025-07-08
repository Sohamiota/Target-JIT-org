"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Download, FileText } from "lucide-react"

export default function SampleCsvGenerator() {
  const generateSampleCsv = () => {
    const sampleData = [
      ["Particulars", "Quantity", "Rate", "Value"],
      ["Laptop Dell XPS 13", "150", "75000", "11250000"],
      ["Office Chair Ergonomic", "45", "8500", "382500"],
      ["Smartphone Galaxy S21", "85", "55000", "4675000"],
      ["Wireless Mouse Logitech", "200", "1500", "300000"],
      ["Monitor 24 inch LED", "75", "15000", "1125000"],
      ["Keyboard Mechanical", "120", "3500", "420000"],
      ["Printer Laser HP", "25", "25000", "625000"],
      ["Tablet iPad Air", "60", "45000", "2700000"],
      ["Headphones Sony WH", "90", "8000", "720000"],
      ["USB Drive 32GB", "300", "800", "240000"],
    ]

    const csvContent = sampleData.map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", "sample_inventory.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Sample CSV File
        </CardTitle>
        <CardDescription>Download a sample CSV file to see the correct format</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={generateSampleCsv} className="w-full flex items-center gap-2">
          <Download className="h-4 w-4" />
          Download Sample CSV
        </Button>
        <p className="text-xs text-muted-foreground mt-2">
          This sample file contains the exact format required: Particulars, Quantity, Rate, Value
        </p>
      </CardContent>
    </Card>
  )
}
