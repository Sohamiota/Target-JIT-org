"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

export default function CsvFormatGuide() {
  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>CSV Format Guide</CardTitle>
        <CardDescription>Required format for importing inventory data</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Your CSV file must follow the exact format shown below with these column headers:
          </AlertDescription>
        </Alert>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="border px-4 py-2 text-left font-medium">Particulars</th>
                <th className="border px-4 py-2 text-left font-medium">Quantity</th>
                <th className="border px-4 py-2 text-left font-medium">Rate</th>
                <th className="border px-4 py-2 text-left font-medium">Value</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border px-4 py-2">Laptop Dell XPS 13</td>
                <td className="border px-4 py-2">150</td>
                <td className="border px-4 py-2">75000</td>
                <td className="border px-4 py-2">11250000</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Office Chair Ergonomic</td>
                <td className="border px-4 py-2">45</td>
                <td className="border px-4 py-2">8500</td>
                <td className="border px-4 py-2">382500</td>
              </tr>
              <tr>
                <td className="border px-4 py-2">Smartphone Galaxy S21</td>
                <td className="border px-4 py-2">85</td>
                <td className="border px-4 py-2">55000</td>
                <td className="border px-4 py-2">4675000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Column Descriptions:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>
              <strong>Particulars:</strong> Item name or description
            </li>
            <li>
              <strong>Quantity:</strong> Current stock quantity
            </li>
            <li>
              <strong>Rate:</strong> Price per unit
            </li>
            <li>
              <strong>Value:</strong> Total value (Quantity × Rate)
            </li>
          </ul>
        </div>

        <Alert>
          <AlertDescription>
            The system will automatically generate SKU IDs, categorize items, and calculate reorder points based on your
            data.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
