import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { InstallmentData } from "./src/types";
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "installments.json");

// Default Pre-populated Data based strictly on user images & text
const defaultData: InstallmentData = {
  activeCustomers: [
    {
      id: "active_1",
      name: "دسوقي",
      product: "عملية شراء أجهزة / 13 عادي",
      totalAmount: 14500,
      paidAmount: 2000,
      remainingAmount: 12500,
      startDate: "2025-06-01",
      monthsCount: 6,
      monthlyAmount: 2100,
      phone: "",
      notes: "دسوقي واخد 13 عادي وباقي عليه 12500 على 6 شهور كل شهر 2100",
      type: "incoming",
      schedule: [
        { date: "2025-06-01", amount: 2000, status: "paid", paymentDate: "2025-06-01" },
        { date: "2025-07-01", amount: 2100, status: "unpaid" },
        { date: "2025-08-01", amount: 2100, status: "unpaid" },
        { date: "2025-09-01", amount: 2100, status: "unpaid" },
        { date: "2025-10-01", amount: 2100, status: "unpaid" },
        { date: "2025-11-01", amount: 2100, status: "unpaid" }
      ]
    },
    {
      id: "active_2",
      name: "الزبون زو",
      product: "قسط عام",
      totalAmount: 16370,
      paidAmount: 3170,
      remainingAmount: 13200,
      startDate: "2025-03-25",
      monthsCount: 12,
      monthlyAmount: 1060,
      phone: "",
      notes: "باقي عليه 13200 لمدة 12 شهر كل شهر 1060",
      type: "incoming",
      schedule: [
        { date: "2025-03-25", amount: 1060, status: "paid", paymentDate: "2025-03-25" },
        { date: "2025-04-25", amount: 1060, status: "paid", paymentDate: "2025-04-25" },
        { date: "2025-05-25", amount: 1050, status: "paid", paymentDate: "2025-05-25" },
        { date: "2025-06-25", amount: 1060, status: "unpaid" },
        { date: "2025-07-25", amount: 1060, status: "unpaid" },
        { date: "2025-08-25", amount: 1060, status: "unpaid" },
        { date: "2025-09-25", amount: 1060, status: "unpaid" },
        { date: "2025-10-25", amount: 1060, status: "unpaid" },
        { date: "2025-11-25", amount: 1060, status: "unpaid" },
        { date: "2025-12-25", amount: 1060, status: "unpaid" },
        { date: "2026-01-25", amount: 1060, status: "unpaid" },
        { date: "2026-02-25", amount: 1060, status: "unpaid" }
      ]
    },
    {
      id: "active_3",
      name: "إبراهيم سواده",
      product: "قسط متبقي جهاز",
      totalAmount: 13000,
      paidAmount: 2000,
      remainingAmount: 11000,
      startDate: "2025-06-01",
      monthsCount: 4,
      monthlyAmount: 2750,
      phone: "",
      notes: "إبراهيم سواده عليه 11 الف باقي جهاز على 4 شهور كل شهر 2750 - تم دفع أول دفعة 2000 بتاريخ 22/5",
      type: "incoming",
      schedule: [
        { date: "2025-06-01", amount: 2000, status: "paid", paymentDate: "2025-05-22" },
        { date: "2025-07-01", amount: 2750, status: "unpaid" },
        { date: "2025-08-01", amount: 2750, status: "unpaid" },
        { date: "2025-09-01", amount: 2750, status: "unpaid" },
        { date: "2025-10-01", amount: 2750, status: "unpaid" }
      ]
    },
    {
      id: "active_4",
      name: "مروان سمير",
      product: "هاتف 7+",
      totalAmount: 3300,
      paidAmount: 300,
      remainingAmount: 3000,
      startDate: "2025-06-01",
      monthsCount: 10,
      monthlyAmount: 300,
      phone: "01119757425",
      notes: "مروان سمير 7+ باقي 3000 على 10 شهور كل شهر 300ج. هاتف بديل: 01148426034",
      type: "incoming",
      schedule: [
        { date: "2025-06-01", amount: 300, status: "paid", paymentDate: "2025-06-01" },
        { date: "2025-07-01", amount: 300, status: "unpaid" },
        { date: "2025-08-01", amount: 300, status: "unpaid" },
        { date: "2025-09-01", amount: 300, status: "unpaid" },
        { date: "2025-10-01", amount: 300, status: "unpaid" },
        { date: "2025-11-01", amount: 300, status: "unpaid" },
        { date: "2025-12-01", amount: 300, status: "unpaid" },
        { date: "2026-01-01", amount: 300, status: "unpaid" },
        { date: "2026-02-01", amount: 300, status: "unpaid" },
        { date: "2026-03-01", amount: 300, status: "unpaid" }
      ]
    },
    {
      id: "active_5",
      name: "علي (تبع محمد طارق)",
      product: "قسط عام",
      totalAmount: 19000,
      paidAmount: 6000,
      remainingAmount: 13000,
      startDate: "2025-03-25",
      monthsCount: 6,
      monthlyAmount: 2000,
      phone: "",
      notes: "عليه 13 الف لمدة 6 شهور كل شهر 2000 واخر شهر 3000",
      type: "incoming",
      schedule: [
        { date: "2025-03-25", amount: 2000, status: "paid", paymentDate: "2025-03-25" },
        { date: "2025-04-25", amount: 2000, status: "paid", paymentDate: "2025-04-25" },
        { date: "2025-05-25", amount: 2000, status: "paid", paymentDate: "2025-05-25" },
        { date: "2025-06-25", amount: 2000, status: "unpaid" },
        { date: "2025-07-25", amount: 2000, status: "unpaid" },
        { date: "2025-08-25", amount: 3000, status: "unpaid" }
      ]
    },
    {
      id: "active_6",
      name: "إيهاب",
      product: "استبدال جهاز ومبلغ",
      totalAmount: 22400,
      paidAmount: 3200,
      remainingAmount: 19200,
      startDate: "2025-06-01",
      monthsCount: 6,
      monthlyAmount: 3200,
      phone: "",
      notes: "إيهاب مبدل وعليه 16 قبل الفايدة وبعد 19200 على 6 شهور كل شهر 3200",
      type: "incoming",
      schedule: [
        { date: "2025-06-01", amount: 3200, status: "paid", paymentDate: "2025-06-01" },
        { date: "2025-07-01", amount: 3200, status: "unpaid" },
        { date: "2025-08-01", amount: 3200, status: "unpaid" },
        { date: "2025-09-01", amount: 3200, status: "unpaid" },
        { date: "2025-10-01", amount: 3200, status: "unpaid" },
        { date: "2025-11-01", amount: 3200, status: "unpaid" }
      ]
    },
    {
      id: "active_7",
      name: "فادي",
      product: "فرق استبدال جهاز",
      totalAmount: 30000,
      paidAmount: 0,
      remainingAmount: 30000,
      startDate: "2025-06-25",
      monthsCount: 12,
      monthlyAmount: 2500,
      phone: "",
      notes: "فادي عليه فرق جهاز 30 الف بعد الفايدة كل شهر 2500 على 12 شهر",
      type: "incoming",
      schedule: [
        { date: "2025-06-25", amount: 2500, status: "unpaid" },
        { date: "2025-07-25", amount: 2500, status: "unpaid" },
        { date: "2025-08-25", amount: 2500, status: "unpaid" },
        { date: "2025-09-25", amount: 2500, status: "unpaid" },
        { date: "2025-10-25", amount: 2500, status: "unpaid" },
        { date: "2025-11-25", amount: 2500, status: "unpaid" },
        { date: "2025-12-25", amount: 2500, status: "unpaid" },
        { date: "2026-01-25", amount: 2500, status: "unpaid" },
        { date: "2026-02-25", amount: 2500, status: "unpaid" },
        { date: "2026-03-25", amount: 2500, status: "unpaid" },
        { date: "2026-04-25", amount: 2500, status: "unpaid" },
        { date: "2026-05-25", amount: 2500, status: "unpaid" }
      ]
    },
    {
      id: "active_8",
      name: "قسط تكييف المحل",
      product: "تكييف جديد",
      totalAmount: 23500,
      paidAmount: 13500,
      remainingAmount: 10000,
      startDate: "2025-10-01",
      monthsCount: 12,
      monthlyAmount: 1100,
      phone: "",
      notes: "التكييف جاي يوم 9/9 أول قسط هيبقى يوم 10/1 كل شهر 1100 على 12 شهر. المدفوع مقدم: 13500 المتبقي: 10000",
      type: "outgoing",
      schedule: [
        { date: "2025-10-01", amount: 1100, status: "unpaid" },
        { date: "2025-11-01", amount: 1100, status: "unpaid" },
        { date: "2025-12-01", amount: 1100, status: "unpaid" },
        { date: "2026-01-01", amount: 1100, status: "unpaid" },
        { date: "2026-02-01", amount: 1100, status: "unpaid" },
        { date: "2026-03-01", amount: 1100, status: "unpaid" },
        { date: "2026-04-01", amount: 1100, status: "unpaid" },
        { date: "2026-05-01", amount: 1100, status: "unpaid" },
        { date: "2026-06-01", amount: 1100, status: "unpaid" },
        { date: "2026-07-01", amount: 1100, status: "unpaid" },
        { date: "2026-08-01", amount: 1100, status: "unpaid" },
        { date: "2026-09-01", amount: 1100, status: "unpaid" }
      ]
    }
  ],
  quickInstallments: [
    { id: "quick_1", name: "يوسف شعبان", amount: 2250, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_2", name: "رمانة", amount: 3100, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_3", name: "سليمان", amount: 1250, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_4", name: "محمد سيد", amount: 1500, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_5", name: "محمد فرج", amount: 1500, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_6", name: "طارق", amount: 1100, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_7", name: "يوسف بدر", amount: 1300, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_8", name: "شادي", amount: 800, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_9", name: "محمود كيلاني", amount: 1100, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_10", name: "خالد عبدالنبي", amount: 850, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_11", name: "حسام سامي", amount: 1850, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_12", name: "محمد إمام", amount: 1300, status: "unpaid", notes: "قسط شهري" },
    { id: "quick_13", name: "يوسف غريب", amount: 2800, status: "unpaid", notes: "قسط على 6 شهور" },
    { id: "quick_14", name: "سكران", amount: 10500, status: "unpaid", notes: "مستحق بالكامل الشهر الجاي" }
  ],
  moneyCircles: [
    {
      id: "circle_1",
      name: "جمعية الـ 5000",
      totalAmount: 5000,
      monthlyPayment: 5000,
      monthsCount: 1,
      startDate: "2025-03-10",
      status: "active",
      notes: "دفعت اول الجمعية 5 تلاف بتاريخ 10/3 (10 رمضان)",
      schedule: [
        { date: "2025-03-10", paid: true, amount: 5000, datePaid: "2025-03-10" }
      ]
    }
  ],
  invoices: [
    {
      id: "947",
      date: "2025-05-02",
      clientName: "احمد حلمي محمد متولي",
      itemName: "iphone 13 Pro Max 256G 100% Black",
      serialNumber: "356514418587283",
      amount: 37000,
      storeName: "بوكس ستور (Box Store)",
      address: "9 ش ترعه السواحل / الوراق، الجيزة",
      status: "paid"
    }
  ],
  expenses: [
    {
      id: "exp_1",
      title: "إيجار المحل",
      amount: 4000,
      category: "rent",
      dueDate: "2025-07-01",
      status: "unpaid",
      recurring: "monthly",
      notes: "إيجار محل بوكس ستور الشهري"
    },
    {
      id: "exp_2",
      title: "فاتورة النت",
      amount: 400,
      category: "internet",
      dueDate: "2025-07-05",
      status: "unpaid",
      recurring: "monthly",
      notes: "اشتراك الإنترنت الأرضي للمحل"
    },
    {
      id: "exp_3",
      title: "فاتورة كهرباء",
      amount: 850,
      category: "electricity",
      dueDate: "2025-06-25",
      status: "paid",
      paymentDate: "2025-06-24",
      recurring: "monthly",
      notes: "فاتورة كهرباء شهر يونيو"
    }
  ],
  lastUpdated: new Date().toISOString()
};

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Write default data if file doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
}

// Load environment variables
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "../.env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found in env. Falling back to local file storage only.");
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Load current data helper
async function readData(): Promise<InstallmentData> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("smart_installment_data")
        .select("*")
        .eq("id", 1);
      
      if (!error && data && data.length > 0) {
        const row = data[0];
        const formattedData: InstallmentData = {
          activeCustomers: row.active_customers || [],
          quickInstallments: row.quick_installments || [],
          moneyCircles: row.money_circles || [],
          invoices: row.invoices || [],
          expenses: row.expenses || [],
          lastUpdated: row.last_updated || new Date().toISOString()
        };
        // Update local cache in background (silent cache refresh)
        fs.writeFile(DATA_FILE, JSON.stringify(formattedData, null, 2), "utf8", (err) => {
          if (err) console.error("Error updating local cache file:", err);
        });
        return formattedData;
      } else {
        console.warn("Supabase read error or empty table, falling back to local file:", error?.message || "No data");
      }
    } catch (dbErr) {
      console.error("Failed to fetch from Supabase:", dbErr);
    }
  }

  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Error reading data file:", err);
  }
  return defaultData;
}

// Save data helper
async function saveData(data: InstallmentData) {
  data.lastUpdated = new Date().toISOString();
  
  // Save to local file as backup first
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing local backup file:", err);
  }

  // Save to Supabase
  if (supabase) {
    try {
      const { error } = await supabase
        .from("smart_installment_data")
        .upsert({
          id: 1,
          active_customers: data.activeCustomers,
          quick_installments: data.quickInstallments,
          money_circles: data.moneyCircles,
          invoices: data.invoices,
          expenses: data.expenses,
          last_updated: data.lastUpdated,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error("Failed to save to Supabase, local backup saved:", error.message);
      } else {
        console.log("Successfully saved data to Supabase and local backup.");
      }
    } catch (dbErr) {
      console.error("Database upsert error during saveData:", dbErr);
    }
  }
}

// --- API ROUTES ---

// GET: All data
app.get("/api/installments", async (req, res) => {
  res.json(await readData());
});

// POST: Save all data (override or full sync)
app.post("/api/installments", async (req, res) => {
  try {
    await saveData(req.body);
    res.json({ success: true, message: "تم حفظ البيانات بنجاح" });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST: Add or update active customer
app.post("/api/installments/customer", async (req, res) => {
  try {
    const data = await readData();
    const updatedCustomer = req.body;
    
    const index = data.activeCustomers.findIndex(c => c.id === updatedCustomer.id);
    if (index >= 0) {
      data.activeCustomers[index] = updatedCustomer;
    } else {
      data.activeCustomers.push(updatedCustomer);
    }
    
    await saveData(data);
    res.json({ success: true, customer: updatedCustomer });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE: Active customer
app.delete("/api/installments/customer/:id", async (req, res) => {
  try {
    const data = await readData();
    data.activeCustomers = data.activeCustomers.filter(c => c.id !== req.params.id);
    await saveData(data);
    res.json({ success: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// POST: Google Sheets Sync Engine
app.post("/api/sync/sheets", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Access token is required" });
  }

  try {
    const data = await readData();

    // 1. Check if spreadsheet already exists in user's Drive
    let spreadsheetId = "";
    let spreadsheetUrl = "";

    const searchRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name%3D%27%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9%20%D8%A7%D9%84%D8%A3%D9%82%D8%B3%D8%A7%D8%B7%20%D9%88%D8%A7%D9%84%D8%AC%D9%85%D9%81%D9%8A%D8%A7%D8%AA%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27%20and%20trashed%3Dfalse",
      { headers: { Authorization: token } }
    );

    if (searchRes.ok) {
      const searchData: any = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        spreadsheetId = searchData.files[0].id;
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      }
    }

    // 2. If not found, create new spreadsheet
    if (!spreadsheetId) {
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: "إدارة الأقساط والجمعيات",
          mimeType: "application/vnd.google-apps.spreadsheet",
        }),
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to create spreadsheet: ${errText}`);
      }

      const createData: any = await createRes.json();
      spreadsheetId = createData.id;
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    }

    // 3. Prepare data sheets values
    
    // Tab 1: Active Customers
    const activeHeaders = ["كود العميل", "الاسم", "نوع العملية / المنتج", "إجمالي المبلغ", "المدفوع", "المتبقي", "تاريخ البدء", "عدد الأقساط", "قيمة القسط الشهري", "ملاحظات"];
    const activeRows = data.activeCustomers.map(c => [
      c.id,
      c.name,
      c.product,
      c.totalAmount,
      c.paidAmount,
      c.remainingAmount,
      c.startDate,
      c.monthsCount,
      c.monthlyAmount,
      c.notes || ""
    ]);

    // Tab 2: Quick Installments
    const quickHeaders = ["كود القسط", "اسم العميل", "قيمة القسط", "حالة الدفع", "ملاحظات"];
    const quickRows = data.quickInstallments.map(q => [
      q.id,
      q.name,
      q.amount,
      q.status === "paid" ? "تم الدفع" : "غير مدفوع",
      q.notes || ""
    ]);

    // Tab 3: Assemblies
    const circleHeaders = ["كود الجمعية", "اسم العضو / الجمعية", "المبلغ الكلي", "القسط الشهري", "تاريخ البدء", "عدد الشهور", "الحالة", "ملاحظات"];
    const circleRows = data.moneyCircles.map(c => [
      c.id,
      c.name,
      c.totalAmount,
      c.monthlyPayment,
      c.startDate,
      c.monthsCount,
      c.status === "active" ? "نشط" : "مكتمل",
      c.notes || ""
    ]);

    // Tab 4: Invoices
    const invoiceHeaders = ["رقم الفاتورة", "التاريخ", "اسم العميل", "البيان / الوصف", "الرقم التسلسلي", "القيمة الكلية (ج.م.)", "المحل", "العنوان", "حالة السداد"];
    const invoiceRows = data.invoices.map(i => [
      i.id,
      i.date,
      i.clientName,
      i.itemName,
      i.serialNumber || "",
      i.amount,
      i.storeName,
      i.address || "",
      i.status === "paid" ? "مدفوعة بالكامل" : "معلقة"
    ]);

    // We can write updates using spreadsheets.values.batchUpdate to ensure tabs are populated
    // Since batchUpdate requires range references, we will update the default tabs.
    // If the spreadsheet is brand new, they might write directly to "Sheet1" or we can write to specific ranges.
    // To keep it highly compatible and avoid sheet-not-found errors, we can write values to range names like "الأقساط النشطة", etc.
    // First, let's create the sheets/tabs if we can, or just write to specific grid ranges.
    // Let's call the batchUpdate endpoint to create sheets first to be fully professional!
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          { addSheet: { properties: { title: "الأقساط النشطة" } } },
          { addSheet: { properties: { title: "الأقساط الجارية" } } },
          { addSheet: { properties: { title: "الجمعيات" } } },
          { addSheet: { properties: { title: "الفواتير والمبيعات" } } }
        ]
      })
    }).catch(() => {
      // Ignore if sheets already exist
    });

    // Write values to each sheet
    const writeSheetData = async (sheetName: string, headers: string[], rows: any[][]) => {
      const values = [headers, ...rows];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ values })
        }
      );
    };

    await writeSheetData("الأقساط النشطة", activeHeaders, activeRows);
    await writeSheetData("الأقساط الجارية", quickHeaders, quickRows);
    await writeSheetData("الجمعيات", circleHeaders, circleRows);
    await writeSheetData("الفواتير والمبيعات", invoiceHeaders, invoiceRows);

    res.json({ success: true, spreadsheetId, url: spreadsheetUrl });
  } catch (err: any) {
    console.error("Sheets sync error:", err);
    res.status(500).json({ error: err.message });
  }
});

// --- GEMINI AI ASSISTANT CONFIG & TOOLS ---

let aiClient: GoogleGenAI | null = null;

function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("مفتاح الـ API لـ Gemini غير متوفر. يرجى تهيئته في Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const tool_get_current_date: FunctionDeclaration = {
  name: "get_current_date",
  description: "الحصول على تاريخ اليوم الحالي لمطابقة التواريخ ومعرفة الأقساط المتأخرة والجارية وحساب الفترات.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const tool_get_all_data: FunctionDeclaration = {
  name: "get_all_data",
  description: "عرض كافة بيانات الأقساط الجارية والنشطة والجمعيات والفواتير لـ Box Store لاستخراج المعلومات للعملاء وحساباتهم الإجمالية والمتبقية وتواريخ السداد والملاحظات والجمعيات.",
  parameters: {
    type: Type.OBJECT,
    properties: {},
  }
};

const tool_add_customer: FunctionDeclaration = {
  name: "add_customer",
  description: "إضافة قسط نشط جديد وتوليد جدول الأقساط بالشهور.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "اسم العميل بالكامل" },
      product: { type: Type.STRING, description: "اسم المنتج أو وصف العملية (مثال: آيفون 13 عادي)" },
      totalAmount: { type: Type.NUMBER, description: "إجمالي المبلغ المطلوب للقسط" },
      monthsCount: { type: Type.INTEGER, description: "عدد الشهور لتوزيع الأقساط عليها" },
      monthlyAmount: { type: Type.NUMBER, description: "مبلغ القسط الشهري (إذا لم يحدد، سيتم توزيعه بالتساوي بقسمة المبلغ الكلي على الشهور)" },
      startDate: { type: Type.STRING, description: "تاريخ بداية الأقساط بصيغة YYYY-MM-DD" },
      phone: { type: Type.STRING, description: "رقم هاتف العميل للتواصل (اختياري)" },
      notes: { type: Type.STRING, description: "ملاحظات إضافية بخصوص القسط (اختياري)" },
      type: { type: Type.STRING, description: "نوع القسط: incoming للتحصيل/العملاء أو outgoing للمصاريف/مشتريات المحل (افتراضي incoming)" }
    },
    required: ["name", "totalAmount", "monthsCount"]
  }
};

const tool_record_payment: FunctionDeclaration = {
  name: "record_payment",
  description: "تسجيل قسط شهري معين لعميل نشط كمدفوع (paid) أو غير مدفوع (unpaid) وتعديل حساباته.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "كود العميل (مثال: active_1)" },
      date: { type: Type.STRING, description: "تاريخ القسط المحدد المراد تحديث حالته بصيغة YYYY-MM-DD" },
      status: { type: Type.STRING, description: "الحالة الجديدة للقسط: paid (مدفوع) أو unpaid (غير مدفوع)" }
    },
    required: ["customerId", "date", "status"]
  }
};

const tool_add_quick_installment: FunctionDeclaration = {
  name: "add_quick_installment",
  description: "إضافة قسط شهري سريع جاري لعميل خارجي.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "اسم العميل" },
      amount: { type: Type.NUMBER, description: "قيمة القسط" },
      notes: { type: Type.STRING, description: "ملاحظات حول القسط" },
      phone: { type: Type.STRING, description: "رقم الهاتف للعميل (اختياري)" }
    },
    required: ["name", "amount"]
  }
};

const tool_toggle_quick_installment_status: FunctionDeclaration = {
  name: "toggle_quick_installment_status",
  description: "تحديث حالة القسط السريع كمدفوع (paid) أو غير مدفوع (unpaid).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "كود القسط السريع (مثال: quick_1)" },
      status: { type: Type.STRING, description: "الحالة الجديدة: paid أو unpaid" }
    },
    required: ["id", "status"]
  }
};

const tool_update_customer_notes: FunctionDeclaration = {
  name: "update_customer_notes",
  description: "تعديل الملاحظات الخاصة بعميل نشط معين.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "كود العميل (مثال: active_1)" },
      notes: { type: Type.STRING, description: "الملاحظات الجديدة بالكامل" }
    },
    required: ["customerId", "notes"]
  }
};

const tool_delete_customer: FunctionDeclaration = {
  name: "delete_customer",
  description: "حذف سجل العميل وأقساطه بالكامل نهائياً.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "كود العميل المطلوب حذفه" }
    },
    required: ["customerId"]
  }
};

const tool_add_expense: FunctionDeclaration = {
  name: "add_expense",
  description: "إضافة مصروف جديد للنظام مثل إيجار المحل أو فواتير الكهرباء أو الإنترنت أو مرتبات الموظفين.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "عنوان المصروف (مثال: إيجار المحل، فاتورة كهرباء)" },
      amount: { type: Type.NUMBER, description: "قيمة المصروف بالجنيه" },
      category: { 
        type: Type.STRING, 
        description: "تصنيف المصروف: rent (إيجار) | internet (إنترنت) | electricity (كهرباء) | salary (مرتبات) | maintenance (صيانة) | other (أخرى)" 
      },
      dueDate: { type: Type.STRING, description: "تاريخ الاستحقاق بصيغة YYYY-MM-DD" },
      status: { type: Type.STRING, description: "حالة الدفع: paid (تم الدفع) أو unpaid (غير مدفوع، وهي الحالة الافتراضية)" },
      recurring: { type: Type.STRING, description: "تكرار المصروف: one-time (مرة واحدة) | monthly (شهري) | yearly (سنوي)" },
      notes: { type: Type.STRING, description: "ملاحظات إضافية حول المصروف (اختياري)" }
    },
    required: ["title", "amount", "category", "dueDate"]
  }
};

const tool_pay_expense: FunctionDeclaration = {
  name: "pay_expense",
  description: "تسجيل دفع مصروف معين وتحديث حالته وتاريخ السداد.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      expenseId: { type: Type.STRING, description: "كود المصروف (مثال: exp_1)" },
      status: { type: Type.STRING, description: "الحالة الجديدة: paid (تم الدفع) أو unpaid (غير مدفوع)" },
      paymentDate: { type: Type.STRING, description: "تاريخ الدفع بصيغة YYYY-MM-DD (اختياري، يتم ضبطه تلقائياً لليوم عند الدفع)" }
    },
    required: ["expenseId", "status"]
  }
};

const tool_delete_expense: FunctionDeclaration = {
  name: "delete_expense",
  description: "حذف مصروف من النظام نهائياً.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      expenseId: { type: Type.STRING, description: "كود المصروف المطلوب حذفه" }
    },
    required: ["expenseId"]
  }
};

// POST: Gemini Chat endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }

    // Smart Local Fallback Function if Gemini API Key is missing or throws error
    const runLocalAssistant = async (msgs: any[]) => {
      const lastUserMsg = [...msgs].reverse().find(m => m.role === 'user');
      const userText = lastUserMsg?.parts?.[0]?.text || lastUserMsg?.text || "";
      const data = await readData();
      
      let responseText = "";
      let dataUpdated = false;
      const query = userText.toLowerCase().trim();

      if (query.includes("مستحق") || query.includes("دين") || query.includes("تاريخ") || query.includes("علي مين") || query.includes("متاخر")) {
        const unpaidActive = data.activeCustomers.filter(c => c.remainingAmount > 0);
        const unpaidQuick = data.quickInstallments.filter(q => q.status === "unpaid");
        
        responseText = `حاضر يا فندم! جلبنا كشف الأقساط المستحقة والغير مدفوعة حالياً:\n\n`;
        if (unpaidActive.length > 0) {
          responseText += `*الأقساط النشطة المعلقة:*\n`;
          unpaidActive.forEach(c => {
            const nextInst = c.schedule.find(s => s.status === "unpaid");
            responseText += `- *${c.name}*: متبقي عليه ${c.remainingAmount} ج (قسطه التالي: ${nextInst ? nextInst.amount + ' ج بتاريخ ' + nextInst.date : 'لا يوجد قسط محدد'}).\n`;
          });
        } else {
          responseText += `لا توجد أقساط نشطة متأخرة حالياً! الكل تمام.\n`;
        }

        if (unpaidQuick.length > 0) {
          responseText += `\n*الأقساط السريعة المعلقة:*\n`;
          unpaidQuick.forEach(q => {
            responseText += `- *${q.name}*: قسط بقيمة ${q.amount} ج (${q.notes || 'بدون ملاحظات'}).\n`;
          });
        }
      } else if (query.includes("سدد") || query.includes("دفع") || query.includes("تسجيل دفع") || query.includes("سدد قسط")) {
        const foundCustomer = data.activeCustomers.find(c => query.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(query.replace("سدد قسط", "").trim()));
        const foundQuick = data.quickInstallments.find(q => query.includes(q.name.toLowerCase()) || q.name.toLowerCase().includes(query.replace("سدد قسط", "").trim()));

        if (foundCustomer) {
          const nextUnpaid = foundCustomer.schedule.find(s => s.status === "unpaid");
          if (nextUnpaid) {
            nextUnpaid.status = "paid";
            nextUnpaid.paymentDate = new Date().toISOString().slice(0, 10);
            
            const paid = foundCustomer.schedule
              .filter(item => item.status === "paid")
              .reduce((sum, item) => sum + item.amount, 0);
            foundCustomer.paidAmount = paid;
            foundCustomer.remainingAmount = Math.max(0, foundCustomer.totalAmount - paid);

            await saveData(data);
            dataUpdated = true;
            responseText = `يا مسهل الحال! تم تسجيل سداد قسط العميل *${foundCustomer.name}* لشهر ${nextUnpaid.date} بقيمة ${nextUnpaid.amount} جنيه بنجاح وتحديث الحسابات تلقائياً. 💳✨`;
          } else {
            responseText = `العميل *${foundCustomer.name}* سدد كل أقساطه بالفعل يا باشا! مفيش أقساط مستحقة عليه حالياً. 👍`;
          }
        } else if (foundQuick) {
          if (foundQuick.status === "unpaid") {
            foundQuick.status = "paid";
            await saveData(data);
            dataUpdated = true;
            responseText = `تمام يا غالي، تم سداد القسط السريع للعميل *${foundQuick.name}* بقيمة ${foundQuick.amount} جنيه بنجاح. ✅`;
          } else {
            responseText = `القسط السريع للعميل *${foundQuick.name}* مدفوع بالفعل مسبقاً.`;
          }
        } else {
          responseText = `عايز تسجل سداد قسط لمين بالظبط؟ اكتبلي اسم العميل بوضوح زي ما هو مسجل في السيستم عشان أقدر أحدثهولك فوراً. (مثال: "سدد قسط دسوقي")`;
        }
      } else if (query.includes("تكييف") || query.includes("التكييف") || query.includes("تكيف")) {
        const acCust = data.activeCustomers.find(c => c.name.includes("تكييف") || c.product.includes("تكييف") || (c.notes && c.notes.includes("تكييف")));
        if (acCust) {
          responseText = `بخصوص *حساب التكييفات*:\n- العميل: *${acCust.name}*\n- إجمالي المبلغ الكلي بعد الفائدة: ${acCust.totalAmount} ج\n- المدفوع: ${acCust.paidAmount} ج\n- المتبقي: ${acCust.remainingAmount} ج\n- توزيع الأقساط: ${acCust.monthsCount} شهر، كل شهر ${acCust.monthlyAmount} ج.\n- ملاحظات: ${acCust.notes}\n\nالحساب مسجل وجاهز في النظام ومفتوح لمتابعة الدفعات!`;
        } else {
          responseText = `مش لاقي حساب تكييف مسجل حالياً بالاسم ده. لو تحب أضيفهولك اكتبلي تفاصيله بوضوح، أو استخدم زر إضافة عميل.`;
        }
      } else if (query.includes("مصروف") || query.includes("مصاريف") || query.includes("فاتورة كهرباء") || query.includes("فاتورة النت") || query.includes("إيجار المحل") || query.includes("ايجار")) {
        const unpaidExpenses = (data.expenses || []).filter(e => e.status === "unpaid");
        const paidExpenses = (data.expenses || []).filter(e => e.status === "paid");
        
        responseText = `حاضر يا فندم! جلبنا كشف المصاريف والالتزامات لـ Box Store:\n\n`;
        if (unpaidExpenses.length > 0) {
          responseText += `*المصاريف غير المدفوعة معلقة:*\n`;
          unpaidExpenses.forEach(e => {
            responseText += `- *${e.title}*: ${e.amount} ج (تاريخ الاستحقاق: ${e.dueDate})\n`;
          });
        } else {
          responseText += `لا توجد مصاريف معلقة حالياً! الكل تمام.\n`;
        }

        if (paidExpenses.length > 0) {
          responseText += `\n*المصاريف المدفوعة مؤخراً:*\n`;
          paidExpenses.forEach(e => {
            responseText += `- *${e.title}*: تم دفع ${e.amount} ج بتاريخ ${e.paymentDate || e.dueDate}\n`;
          });
        }
      } else if (query.includes("مجموع") || query.includes("إجمالي") || query.includes("احصائيات") || query.includes("تقرير") || query.includes("شغال") || query.includes("جميع الأقساط")) {
        const totalActiveAmount = data.activeCustomers.reduce((sum, c) => sum + c.totalAmount, 0);
        const totalRemaining = data.activeCustomers.reduce((sum, c) => sum + c.remainingAmount, 0);
        const totalPaid = totalActiveAmount - totalRemaining;
        
        responseText = `أهلاً بك يا غالي! إليك تقرير سريع عن المحل لليوم:\n\n` +
          `📊 *عدد العملاء النشطين:* ${data.activeCustomers.length} عملاء\n` +
          `💰 *إجمالي مبيعات الأقساط:* ${totalActiveAmount.toLocaleString('ar-EG')} ج.م.\n` +
          `💵 *إجمالي المبالغ المحصلة:* ${totalPaid.toLocaleString('ar-EG')} ج.م.\n` +
          `📉 *المبالغ المتبقية في السوق:* ${totalRemaining.toLocaleString('ar-EG')} ج.م.\n` +
          `🗓️ *عدد الأقساط السريعة الجارية:* ${data.quickInstallments.length} أقساط\n\n` +
          `أنا شغال حالياً في الوضع المحلي الذكي وبقدر أساعدك في جلب التقارير وتسجيل السدادات ومتابعة السوق بكل دقة!`;
      } else {
        responseText = `يا مرحب بيك في "بوكس ستور" يا طيب! 🤖 أنا "بوكسي" مساعدك المالي الذكي.\n\n` +
          `أنا شغال وجاهز لمساعدتك في كل العمليات المالية ومتابعة الأقساط. تقدر تسألني أسئلة زي:\n` +
          `- "مين اللي عليه فلوس مستحقة؟" 📅\n` +
          `- "سدد قسط [اسم العميل]" لشهر يوليو 💳\n` +
          `- "عرض تقرير عام للمحل" 📊\n` +
          `- "تفاصيل قسط التكييف" ❄️\n\n` +
          `قولي حابب نعمل إيه سوا وبإذن الله هخلصلك كل الحسابات بلمسة واحدة!`;
      }

      return { success: true, text: responseText, dataUpdated };
    };

    let ai;
    let useFallback = false;
    try {
      ai = getGeminiClient();
    } catch (err) {
      useFallback = true;
    }

    if (useFallback || !ai) {
      const fallbackResult = runLocalAssistant(messages);
      return res.json(fallbackResult);
    }

    try {
      let contents = [...messages];
    let dataUpdated = false;
    const calledTools = new Set<string>();

    // Agentic loop to resolve function calls
    for (let i = 0; i < 15; i++) {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: contents,
        config: {
          systemInstruction: `أنت "بوكسي" (Boxy)، المساعد المالي والذكي لـ "بوكس ستور" (Box Store). 
مهمتك هي مساعدة صاحب المحل أو العميل في إدارة كافة الأقساط والجمعيات والفواتير والمصروفات بدقة فائقة.
تاريخ اليوم الحالي هو: ${new Date().toISOString().slice(0, 10)}.
تكلم دائماً باللغة العربية بأسلوب ودود ومحترف للغاية وبلهجة مصرية محببة وواضحة جداً.

صلاحياتك وقدراتك:
1. الإجابة عن أي تساؤل بخصوص الأقساط الجارية أو المتأخرة أو تواريخها أو الجمعيات أو الفواتير أو المصروفات بمجرد جلب البيانات.
2. إضافة قسط جديد لعميل وتوليد الشهور بدقة بمجرد أخذ البيانات منه.
3. تسجيل المبالغ المدفوعة (تعديل حالة قسط لعميل معين لـ paid أو سداد قسط سريع أو سداد مصروف).
4. حذف عملاء، وتعديل الملاحظات بدقة بالغة، وإضافة/تحديث/حذف مصروفات المحل.
5. قراءة وتحليل الصور والملفات المرفقة (مثل فواتير مبيعات، صور كروت مديونية، كشوفات حساب ورقية، أو لقطات شاشة). قم باستخراج البيانات المالية منها بدقة (مثل الأسماء، المبالغ، السلع، والتواريخ) واقترح أو نفذ تلقائياً الإدخالات المناسبة في النظام بناءً عليها لتسهيل العمل على المستخدم.

أرشد المستخدم دائماً لخطواته القادمة، واعرض ملخصات منظمة بالنقاط والجداول المنسقة لسهولة القراءة.
عند حدوث أي تعديل في البيانات باستخدام الأدوات، أخبر المستخدم بنجاح العملية (مثال: "تم سداد قسط دسوقي لشهر يوليو بنجاح!").`,
          tools: [{
            functionDeclarations: [
              tool_get_current_date,
              tool_get_all_data,
              tool_add_customer,
              tool_record_payment,
              tool_add_quick_installment,
              tool_toggle_quick_installment_status,
              tool_update_customer_notes,
              tool_delete_customer,
              tool_add_expense,
              tool_pay_expense,
              tool_delete_expense
            ]
          }],
          toolConfig: { includeServerSideToolInvocations: true }
        }
      });

      const functionCalls = response.functionCalls;
      if (!functionCalls || functionCalls.length === 0) {
        // No function calls or completed, return final text
        return res.json({
          success: true,
          text: response.text || "تم تنفيذ طلبك بنجاح.",
          dataUpdated: dataUpdated
        });
      }

      // Detect repeating tool calls to prevent infinite loops
      let hasDuplicates = false;
      for (const call of functionCalls) {
        const key = `${call.name}:${JSON.stringify(call.args)}`;
        if (calledTools.has(key)) {
          hasDuplicates = true;
          break;
        }
        calledTools.add(key);
      }

      if (hasDuplicates) {
        console.log("Detected duplicate or repeating tool call. Forcing textual final response.");
        const finalResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: [
            ...contents,
            {
              role: "user",
              parts: [{ text: "برجاء التوقف عن استدعاء الأدوات وتلخيص الرد النهائي للمستخدم مباشرة بما لديك من معلومات." }]
            }
          ],
          config: {
            systemInstruction: `أنت "بوكسي" المساعد المالي والذكي. لا تستدعي أي أدوات الآن إطلاقاً. أجب على طلب المستخدم باللغة العربية بلهجتك المعتادة باستخدام المعلومات المتوفرة لديك حالياً.`
          }
        });
        return res.json({
          success: true,
          text: finalResponse.text || "تم معالجة طلبك وعرض البيانات المتاحة بنجاح.",
          dataUpdated: dataUpdated
        });
      }

      // Add model's intermediate response to history
      contents.push(response.candidates?.[0]?.content);

      const toolResponseParts = [];

      for (const call of functionCalls) {
        const { name, args, id } = call;
        let result;
        try {
          if (name === "get_current_date") {
            result = { date: new Date().toISOString().slice(0, 10) };
          } else if (name === "get_all_data") {
            result = await readData();
          } else if (name === "add_customer") {
            const currentData = await readData();
            const { name: cName, product, totalAmount, monthsCount, monthlyAmount, startDate, phone, notes, type } = args as any;
            
            const total = parseFloat(totalAmount);
            const months = parseInt(monthsCount) || 1;
            const startD = startDate || new Date().toISOString().slice(0, 10);
            const monthly = parseFloat(monthlyAmount) || Math.round(total / months);

            // Generate schedule
            const schedule = [];
            const baseDate = new Date(startD);
            for (let j = 0; j < months; j++) {
              const current = new Date(baseDate);
              current.setMonth(baseDate.getMonth() + j);
              const dateStr = current.toISOString().slice(0, 10);

              let amount = monthly;
              if (j === months - 1) {
                const precedingTotal = monthly * (months - 1);
                if (precedingTotal + monthly !== total) {
                  amount = total - precedingTotal;
                }
              }

              schedule.push({
                date: dateStr,
                amount: amount,
                status: 'unpaid' as const
              });
            }

            const newId = `active_${Date.now()}`;
            const newCust = {
              id: newId,
              name: cName,
              product: product || "قسط عام",
              totalAmount: total,
              paidAmount: 0,
              remainingAmount: total,
              startDate: startD,
              monthsCount: months,
              monthlyAmount: monthly,
              phone: phone || "",
              notes: notes || "",
              type: (type || "incoming") as 'incoming' | 'outgoing',
              schedule: schedule
            };

            currentData.activeCustomers.push(newCust);
            await saveData(currentData);
            dataUpdated = true;
            result = { success: true, message: "تم إضافة العميل بنجاح", customerId: newId };
          } else if (name === "record_payment") {
            const currentData = await readData();
            const { customerId, date, status } = args as any;
            const customer = currentData.activeCustomers.find(c => c.id === customerId);
            if (customer) {
              customer.schedule = customer.schedule.map(item => {
                if (item.date === date) {
                  return {
                    ...item,
                    status: (status || "paid") as 'paid' | 'unpaid',
                    paymentDate: status === "paid" ? new Date().toISOString().slice(0, 10) : undefined
                  };
                }
                return item;
              });

              // Recalculate amounts
              const paid = customer.schedule
                .filter(item => item.status === "paid")
                .reduce((sum, item) => sum + item.amount, 0);
              customer.paidAmount = paid;
              customer.remainingAmount = Math.max(0, customer.totalAmount - paid);

              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: `تم تحديث قسط تاريخ ${date} إلى ${status}` };
            } else {
              result = { success: false, error: "لم يتم العثور على هذا العميل" };
            }
          } else if (name === "add_quick_installment") {
            const currentData = await readData();
            const { name: qName, amount, notes, phone } = args as any;
            const newId = `quick_${Date.now()}`;
            currentData.quickInstallments.push({
              id: newId,
              name: qName,
              amount: parseFloat(amount),
              status: "unpaid",
              notes: notes || "",
              phone: phone || ""
            });
            await saveData(currentData);
            dataUpdated = true;
            result = { success: true, message: "تم تسجيل القسط السريع بنجاح", id: newId };
          } else if (name === "toggle_quick_installment_status") {
            const currentData = await readData();
            const { id, status } = args as any;
            const qi = currentData.quickInstallments.find(q => q.id === id);
            if (qi) {
              qi.status = (status || "paid") as 'paid' | 'unpaid';
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: "تم تحديث حالة القسط السريع بنجاح" };
            } else {
              result = { success: false, error: "لم يتم العثور على هذا القسط" };
            }
          } else if (name === "update_customer_notes") {
            const currentData = await readData();
            const { customerId, notes } = args as any;
            const customer = currentData.activeCustomers.find(c => c.id === customerId);
            if (customer) {
              customer.notes = notes;
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: "تم تحديث الملاحظات بنجاح" };
            } else {
              result = { success: false, error: "لم يتم العثور على هذا العميل" };
            }
          } else if (name === "delete_customer") {
            const currentData = await readData();
            const { customerId } = args as any;
            const initialCount = currentData.activeCustomers.length;
            currentData.activeCustomers = currentData.activeCustomers.filter(c => c.id !== customerId);
            if (currentData.activeCustomers.length < initialCount) {
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: "تم حذف العميل بنجاح" };
            } else {
              result = { success: false, error: "لم يتم العثور على العميل المراد حذفه" };
            }
          } else if (name === "add_expense") {
            const currentData = await readData();
            if (!currentData.expenses) currentData.expenses = [];
            const { title, amount, category, dueDate, status, recurring, notes } = args as any;
            const newId = `exp_${Date.now()}`;
            const newExpense = {
              id: newId,
              title,
              amount: parseFloat(amount),
              category: category || "other",
              dueDate,
              status: (status || "unpaid") as 'paid' | 'unpaid',
              paymentDate: status === "paid" ? new Date().toISOString().slice(0, 10) : undefined,
              recurring: (recurring || "one-time") as 'one-time' | 'monthly' | 'yearly',
              notes: notes || ""
            };
            currentData.expenses.push(newExpense);
            await saveData(currentData);
            dataUpdated = true;
            result = { success: true, message: "تم تسجيل المصروف بنجاح", id: newId };
          } else if (name === "pay_expense") {
            const currentData = await readData();
            if (!currentData.expenses) currentData.expenses = [];
            const { expenseId, status, paymentDate } = args as any;
            const expense = currentData.expenses.find(e => e.id === expenseId);
            if (expense) {
              expense.status = (status || "paid") as 'paid' | 'unpaid';
              expense.paymentDate = status === "paid" ? (paymentDate || new Date().toISOString().slice(0, 10)) : undefined;
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: `تم تحديث حالة المصروف بنجاح إلى ${status}` };
            } else {
              result = { success: false, error: "لم يتم العثور على هذا المصروف" };
            }
          } else if (name === "delete_expense") {
            const currentData = await readData();
            if (!currentData.expenses) currentData.expenses = [];
            const { expenseId } = args as any;
            const initialCount = currentData.expenses.length;
            currentData.expenses = currentData.expenses.filter(e => e.id !== expenseId);
            if (currentData.expenses.length < initialCount) {
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: "تم حذف المصروف بنجاح" };
            } else {
              result = { success: false, error: "لم يتم العثور على المصروف المراد حذفه" };
            }
          } else {
            result = { error: `الأداة المطلوبة غير مدعومة حالياً: ${name}` };
          }
        } catch (err: any) {
          result = { error: err.message };
        }

        toolResponseParts.push({
          functionResponse: {
            name: name,
            response: result,
            id: id
          }
        });
      }

      // Feed function results back to history
      contents.push({
        role: "user",
        parts: toolResponseParts
      });
    }

      res.json({
        success: true,
        text: "عذراً، استغرقت العملية وقتاً أطول من المتوقع. يرجى تجربة إعادة الطلب.",
        dataUpdated: dataUpdated
      });
    } catch (geminiErr: any) {
      console.warn("Gemini execution error, falling back to local assistant:", geminiErr);
      const fallbackResult = await runLocalAssistant(messages);
      return res.json(fallbackResult);
    }

  } catch (err: any) {
    console.error("Gemini Chat Route Level Error:", err);
    res.status(500).json({ error: err.message || "حدث خطأ غير متوقع أثناء معالجة طلبك الذكي." });
  }
});

// GET: Export entire system backup as JSON
app.get("/api/backup/export", async (req, res) => {
  try {
    const data = await readData();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=boxstore_backup.json");
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Import entire system backup from JSON
app.post("/api/backup/import", async (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData || (!backupData.activeCustomers && !backupData.quickInstallments && !backupData.moneyCircles && !backupData.invoices)) {
      return res.status(400).json({ error: "صيغة ملف النسخة الاحتياطية غير صالحة" });
    }

    // Ensure array properties exist
    const normalizedData = {
      activeCustomers: backupData.activeCustomers || [],
      quickInstallments: backupData.quickInstallments || [],
      moneyCircles: backupData.moneyCircles || [],
      invoices: backupData.invoices || [],
      expenses: backupData.expenses || [],
      lastUpdated: backupData.lastUpdated || new Date().toISOString()
    };

    await saveData(normalizedData);
    res.json({ success: true, message: "تم استيراد واستعادة النسخة الاحتياطية بنجاح بنسبة 100%" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Apple iCal (.ics) export to synchronize with iPhone Calendar
app.get("/api/installments/ical", async (req, res) => {
  try {
    const data = await readData();
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BoxStore//InstallmentsCalendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:أقساط بوكس ستور",
      "X-WR-TIMEZONE:Africa/Cairo"
    ].join("\r\n") + "\r\n";

    const nowStr = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    data.activeCustomers.forEach(cust => {
      cust.schedule.forEach((inst, index) => {
        if (inst.status === "unpaid") {
          const dateClean = inst.date.replace(/-/g, "");
          const uid = `inst_${cust.id}_${index}_${dateClean}@boxstore.app`;
          
          icsContent += [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${nowStr}`,
            `DTSTART;VALUE=DATE:${dateClean}`,
            `SUMMARY:قسط ${cust.name} - ${inst.amount} ج`,
            `DESCRIPTION:قسط عميل: ${cust.name}\\nالمنتج: ${cust.product}\\nالمبلغ المستحق: ${inst.amount} جنيه مصري\\nملاحظات: ${cust.notes || 'لا يوجد'}`,
            "STATUS:CONFIRMED",
            "TRANSP:TRANSPARENT",
            "END:VEVENT"
          ].join("\r\n") + "\r\n";
        }
      });
    });

    icsContent += "END:VCALENDAR\r\n";

    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=boxstore_installments.ics");
    res.send(icsContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Parse iPhone iCloud Notes text intelligently using Gemini 3.5 Flash
app.post("/api/gemini/parse-iphone-note", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "برجاء توفير نص الملاحظة لتحليلها." });
    }

    const ai = getGeminiClient();
    const prompt = `أنت خبير مالي متخصص في تحليل وفك نصوص الجداول والملاحظات غير المنظمة الخاصة بأقساط "بوكس ستور".
قم بتحليل النص التالي المستخرج من تطبيق iCloud Notes على الآيفون بدقة شديدة واستخلص تفاصيل القسط:
---
${text}
---

توجيهات مهمة للاستخلاص:
1. "الاسم" (name): ابحث عن اسم العميل أو اسم العملية (مثل: إبراهيم سواده، دسوقي، التكييف، الخ). إذا لم تكن متأكداً، ضع اسماً مناسباً كـ "عميل آيفون".
2. "المنتج" (product): اسم الجهاز أو المنتج المذكور (مثال: تكييف، آيفون 13 عادي، الخ).
3. "إجمالي المبلغ المطلوب" (totalAmount): المبلغ الكلي المستحق للقسط بعد الفايدة أو الكلي (ابحث عن أرقام مثل "13500"، "12500"، الخ).
4. "عدد الشهور" (monthsCount): عدد الأقساط أو الشهور (مثال: "12 شهر"، "6 شهور"، الخ).
5. "مبلغ القسط الشهري" (monthlyAmount): مبلغ القسط المستحق لكل شهر (مثال: "كل شهر 1100"، "كل شهر 2000"، الخ).
6. "تاريخ البداية" (startDate): تاريخ القسط الأول بصيغة YYYY-MM-DD. إذا تم ذكر تاريخ مثل "7/7" أو "8/10"، استخدم السنة الحالية 2025 أو 2026 حسب السياق. اليوم الافتراضي هو 2025-06-01 إذا لم يذكر تاريخ واضح.
7. "المبلغ المدفوع مقدماً" (paidAmount): أي مبالغ مدفوعة تم ذكرها (مثال: "دفعت 13500" أو "تم سداد دفعة").
8. "الملاحظات" (notes): اكتب الملاحظة الأصلية كاملة لتسهيل الرجوع إليها.

يجب أن تعيد النتيجة في صيغة JSON صالحة تماماً، بدون أي نصوص تمهيدية أو ختامية (فقط كود JSON)، بالهيكل التالي:
{
  "name": "اسم العميل",
  "product": "المنتج",
  "totalAmount": 13500,
  "monthsCount": 12,
  "monthlyAmount": 1100,
  "startDate": "YYYY-MM-DD",
  "paidAmount": 0,
  "remainingAmount": 13500,
  "notes": "النص الأصلي والملاحظات",
  "type": "incoming"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const resultText = response.text || "{}";
    const parsedData = JSON.parse(resultText.trim());

    res.json({ success: true, data: parsedData });
  } catch (err: any) {
    console.error("Parse Note Error:", err);
    res.status(500).json({ error: err.message || "فشل تحليل الملاحظة بواسطة الذكاء الاصطناعي" });
  }
});

// --- VITE MIDDLEWARE AND SPA FALLBACK ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
