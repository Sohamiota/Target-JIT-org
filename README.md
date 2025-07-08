📦 **TargetJit – Inventory Intelligence Simplified**

TargetJit is a smart web-based tool that helps dealerships efficiently **categorize**, **track**, and **analyze thousands of SKUs** (Stock Keeping Units). It transforms manual inventory headaches into simple, insightful dashboards.

Live Demo: [https://targetjit.vercel.app](https://targetjit.vercel.app)

---

**What Does It Do?**

TargetJit was built to solve a real-world problem faced by L\&T dealerships — managing more than 2000 SKUs spread across different categories. This platform provides:

• Easy classification of **Fast-Moving** vs. **Slow-Moving Items**
• Real-time dashboard for sales trends and inventory status
• Intelligent tracking for efficient stock rotation and replenishment
• Actionable insights that support smarter purchase decisions

---

**Who Is It For?**

Dealers, distributors, and warehouse managers who want a **quick overview of stock performance** and **data-driven categorization** without spending hours in Excel sheets.

---

**Tech Stack Used**

• Frontend Framework: **Next.js 14** with App Router
• Language: **TypeScript**
• UI: **Tailwind CSS** for responsive design
• Charts and Graphs: **Recharts** (for visualizing inventory behavior)
• Hosting: **Vercel**
• State Management: Local state and hooks
• Data: JSON/Mock Data (for current demo; scalable to backend APIs)

---

**Folder Structure Overview**

targetjit
│
├── app → Contains main pages and routing logic
│   └── layout.tsx → Sets global layout
│   └── dashboard → Core interface showing charts and stats
│
├── components → Modular UI components like cards, graphs, filters
├── lib → Helper utilities for data analysis and classification
├── public → Static files (icons, images)
├── styles → Custom Tailwind or global styles
├── .env → (for future API integrations)
├── tailwind.config.ts → Tailwind setup
└── tsconfig.json → TypeScript configurations

---

**How to Run Locally**

Step 1: Clone the project
› git clone [https://github.com/Sohamiota/targetjit.git](https://github.com/Sohamiota/targetjit.git)
› cd targetjit

Step 2: Install dependencies
› pnpm install

Step 3: Start the development server
› pnpm dev

(Optional) You can later integrate APIs and real-time databases for production-level tracking.

---

**Key Features**

• Categorization of over 2000+ SKUs
• Visual separation of slow- vs. fast-moving items
• Dynamic graphs showing trends and sales activity
• Scalable UI for real-time data integrations
• Clean and accessible dashboard for non-tech users

---

**Planned Improvements**

• Integration with real-time inventory databases
• Downloadable reports (PDF/Excel)
• Advanced filters for categories, price, stock levels
• User authentication and multi-role support

---

**Author**

Developed by Sohamiota
GitHub: [https://github.com/Sohamiota](https://github.com/Sohamiota)

---

Let me know if you'd like this exported as a `.docx`, `.pdf`, or combined with your other project READMEs in one file.
