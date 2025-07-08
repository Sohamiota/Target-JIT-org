// This is an example CSV structure for importing inventory data
// You can use this as a template for creating your own CSV files

/*
skuId,name,category,currentStock,reorderPoint
SKU-0001,Laptop Dell XPS 13,Electronics,150,50
SKU-0002,T-shirt Basic Black L,Clothing,300,100
SKU-0003,Coffee Beans Arabica 1kg,Food,75,25
SKU-0004,Office Chair Ergonomic,Home Goods,45,15
SKU-0005,Notebook Premium A4,Office Supplies,200,50
SKU-0006,Smartphone Galaxy S21,Electronics,85,30
SKU-0007,Jeans Blue Denim 32/34,Clothing,120,40
SKU-0008,Pasta Spaghetti 500g,Food,250,100
SKU-0009,Desk Lamp LED,Home Goods,60,20
SKU-0010,Printer Paper A4 500 sheets,Office Supplies,180,60
*/

export default function CsvExample() {
  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <h3 className="font-medium mb-2">CSV Format Example</h3>
      <pre className="text-xs overflow-auto p-2 bg-white border rounded">
        {`skuId,name,category,currentStock,reorderPoint
SKU-0001,Laptop Dell XPS 13,Electronics,150,50
SKU-0002,T-shirt Basic Black L,Clothing,300,100
SKU-0003,Coffee Beans Arabica 1kg,Food,75,25
SKU-0004,Office Chair Ergonomic,Home Goods,45,15
SKU-0005,Notebook Premium A4,Office Supplies,200,50`}
      </pre>
    </div>
  )
}
