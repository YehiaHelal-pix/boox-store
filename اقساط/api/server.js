// server.ts
import express from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
var app = express();
var PORT = 3e3;
app.use(express.json({ limit: "10mb" }));
var DATA_DIR = path.join(process.cwd(), "data");
var DATA_FILE = path.join(DATA_DIR, "installments.json");
var defaultData = {
  activeCustomers: [
    {
      id: "active_1",
      name: "\u062F\u0633\u0648\u0642\u064A",
      product: "\u0639\u0645\u0644\u064A\u0629 \u0634\u0631\u0627\u0621 \u0623\u062C\u0647\u0632\u0629 / 13 \u0639\u0627\u062F\u064A",
      totalAmount: 14500,
      paidAmount: 2e3,
      remainingAmount: 12500,
      startDate: "2025-06-01",
      monthsCount: 6,
      monthlyAmount: 2100,
      phone: "",
      notes: "\u062F\u0633\u0648\u0642\u064A \u0648\u0627\u062E\u062F 13 \u0639\u0627\u062F\u064A \u0648\u0628\u0627\u0642\u064A \u0639\u0644\u064A\u0647 12500 \u0639\u0644\u0649 6 \u0634\u0647\u0648\u0631 \u0643\u0644 \u0634\u0647\u0631 2100",
      type: "incoming",
      schedule: [
        { date: "2025-06-01", amount: 2e3, status: "paid", paymentDate: "2025-06-01" },
        { date: "2025-07-01", amount: 2100, status: "unpaid" },
        { date: "2025-08-01", amount: 2100, status: "unpaid" },
        { date: "2025-09-01", amount: 2100, status: "unpaid" },
        { date: "2025-10-01", amount: 2100, status: "unpaid" },
        { date: "2025-11-01", amount: 2100, status: "unpaid" }
      ]
    },
    {
      id: "active_2",
      name: "\u0627\u0644\u0632\u0628\u0648\u0646 \u0632\u0648",
      product: "\u0642\u0633\u0637 \u0639\u0627\u0645",
      totalAmount: 16370,
      paidAmount: 3170,
      remainingAmount: 13200,
      startDate: "2025-03-25",
      monthsCount: 12,
      monthlyAmount: 1060,
      phone: "",
      notes: "\u0628\u0627\u0642\u064A \u0639\u0644\u064A\u0647 13200 \u0644\u0645\u062F\u0629 12 \u0634\u0647\u0631 \u0643\u0644 \u0634\u0647\u0631 1060",
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
      name: "\u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0633\u0648\u0627\u062F\u0647",
      product: "\u0642\u0633\u0637 \u0645\u062A\u0628\u0642\u064A \u062C\u0647\u0627\u0632",
      totalAmount: 13e3,
      paidAmount: 2e3,
      remainingAmount: 11e3,
      startDate: "2025-06-01",
      monthsCount: 4,
      monthlyAmount: 2750,
      phone: "",
      notes: "\u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0633\u0648\u0627\u062F\u0647 \u0639\u0644\u064A\u0647 11 \u0627\u0644\u0641 \u0628\u0627\u0642\u064A \u062C\u0647\u0627\u0632 \u0639\u0644\u0649 4 \u0634\u0647\u0648\u0631 \u0643\u0644 \u0634\u0647\u0631 2750 - \u062A\u0645 \u062F\u0641\u0639 \u0623\u0648\u0644 \u062F\u0641\u0639\u0629 2000 \u0628\u062A\u0627\u0631\u064A\u062E 22/5",
      type: "incoming",
      schedule: [
        { date: "2025-06-01", amount: 2e3, status: "paid", paymentDate: "2025-05-22" },
        { date: "2025-07-01", amount: 2750, status: "unpaid" },
        { date: "2025-08-01", amount: 2750, status: "unpaid" },
        { date: "2025-09-01", amount: 2750, status: "unpaid" },
        { date: "2025-10-01", amount: 2750, status: "unpaid" }
      ]
    },
    {
      id: "active_4",
      name: "\u0645\u0631\u0648\u0627\u0646 \u0633\u0645\u064A\u0631",
      product: "\u0647\u0627\u062A\u0641 7+",
      totalAmount: 3300,
      paidAmount: 300,
      remainingAmount: 3e3,
      startDate: "2025-06-01",
      monthsCount: 10,
      monthlyAmount: 300,
      phone: "01119757425",
      notes: "\u0645\u0631\u0648\u0627\u0646 \u0633\u0645\u064A\u0631 7+ \u0628\u0627\u0642\u064A 3000 \u0639\u0644\u0649 10 \u0634\u0647\u0648\u0631 \u0643\u0644 \u0634\u0647\u0631 300\u062C. \u0647\u0627\u062A\u0641 \u0628\u062F\u064A\u0644: 01148426034",
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
      name: "\u0639\u0644\u064A (\u062A\u0628\u0639 \u0645\u062D\u0645\u062F \u0637\u0627\u0631\u0642)",
      product: "\u0642\u0633\u0637 \u0639\u0627\u0645",
      totalAmount: 19e3,
      paidAmount: 6e3,
      remainingAmount: 13e3,
      startDate: "2025-03-25",
      monthsCount: 6,
      monthlyAmount: 2e3,
      phone: "",
      notes: "\u0639\u0644\u064A\u0647 13 \u0627\u0644\u0641 \u0644\u0645\u062F\u0629 6 \u0634\u0647\u0648\u0631 \u0643\u0644 \u0634\u0647\u0631 2000 \u0648\u0627\u062E\u0631 \u0634\u0647\u0631 3000",
      type: "incoming",
      schedule: [
        { date: "2025-03-25", amount: 2e3, status: "paid", paymentDate: "2025-03-25" },
        { date: "2025-04-25", amount: 2e3, status: "paid", paymentDate: "2025-04-25" },
        { date: "2025-05-25", amount: 2e3, status: "paid", paymentDate: "2025-05-25" },
        { date: "2025-06-25", amount: 2e3, status: "unpaid" },
        { date: "2025-07-25", amount: 2e3, status: "unpaid" },
        { date: "2025-08-25", amount: 3e3, status: "unpaid" }
      ]
    },
    {
      id: "active_6",
      name: "\u0625\u064A\u0647\u0627\u0628",
      product: "\u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062C\u0647\u0627\u0632 \u0648\u0645\u0628\u0644\u063A",
      totalAmount: 22400,
      paidAmount: 3200,
      remainingAmount: 19200,
      startDate: "2025-06-01",
      monthsCount: 6,
      monthlyAmount: 3200,
      phone: "",
      notes: "\u0625\u064A\u0647\u0627\u0628 \u0645\u0628\u062F\u0644 \u0648\u0639\u0644\u064A\u0647 16 \u0642\u0628\u0644 \u0627\u0644\u0641\u0627\u064A\u062F\u0629 \u0648\u0628\u0639\u062F 19200 \u0639\u0644\u0649 6 \u0634\u0647\u0648\u0631 \u0643\u0644 \u0634\u0647\u0631 3200",
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
      name: "\u0641\u0627\u062F\u064A",
      product: "\u0641\u0631\u0642 \u0627\u0633\u062A\u0628\u062F\u0627\u0644 \u062C\u0647\u0627\u0632",
      totalAmount: 3e4,
      paidAmount: 0,
      remainingAmount: 3e4,
      startDate: "2025-06-25",
      monthsCount: 12,
      monthlyAmount: 2500,
      phone: "",
      notes: "\u0641\u0627\u062F\u064A \u0639\u0644\u064A\u0647 \u0641\u0631\u0642 \u062C\u0647\u0627\u0632 30 \u0627\u0644\u0641 \u0628\u0639\u062F \u0627\u0644\u0641\u0627\u064A\u062F\u0629 \u0643\u0644 \u0634\u0647\u0631 2500 \u0639\u0644\u0649 12 \u0634\u0647\u0631",
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
      name: "\u0642\u0633\u0637 \u062A\u0643\u064A\u064A\u0641 \u0627\u0644\u0645\u062D\u0644",
      product: "\u062A\u0643\u064A\u064A\u0641 \u062C\u062F\u064A\u062F",
      totalAmount: 23500,
      paidAmount: 13500,
      remainingAmount: 1e4,
      startDate: "2025-10-01",
      monthsCount: 12,
      monthlyAmount: 1100,
      phone: "",
      notes: "\u0627\u0644\u062A\u0643\u064A\u064A\u0641 \u062C\u0627\u064A \u064A\u0648\u0645 9/9 \u0623\u0648\u0644 \u0642\u0633\u0637 \u0647\u064A\u0628\u0642\u0649 \u064A\u0648\u0645 10/1 \u0643\u0644 \u0634\u0647\u0631 1100 \u0639\u0644\u0649 12 \u0634\u0647\u0631. \u0627\u0644\u0645\u062F\u0641\u0648\u0639 \u0645\u0642\u062F\u0645: 13500 \u0627\u0644\u0645\u062A\u0628\u0642\u064A: 10000",
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
    { id: "quick_1", name: "\u064A\u0648\u0633\u0641 \u0634\u0639\u0628\u0627\u0646", amount: 2250, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_2", name: "\u0631\u0645\u0627\u0646\u0629", amount: 3100, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_3", name: "\u0633\u0644\u064A\u0645\u0627\u0646", amount: 1250, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_4", name: "\u0645\u062D\u0645\u062F \u0633\u064A\u062F", amount: 1500, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_5", name: "\u0645\u062D\u0645\u062F \u0641\u0631\u062C", amount: 1500, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_6", name: "\u0637\u0627\u0631\u0642", amount: 1100, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_7", name: "\u064A\u0648\u0633\u0641 \u0628\u062F\u0631", amount: 1300, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_8", name: "\u0634\u0627\u062F\u064A", amount: 800, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_9", name: "\u0645\u062D\u0645\u0648\u062F \u0643\u064A\u0644\u0627\u0646\u064A", amount: 1100, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_10", name: "\u062E\u0627\u0644\u062F \u0639\u0628\u062F\u0627\u0644\u0646\u0628\u064A", amount: 850, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_11", name: "\u062D\u0633\u0627\u0645 \u0633\u0627\u0645\u064A", amount: 1850, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_12", name: "\u0645\u062D\u0645\u062F \u0625\u0645\u0627\u0645", amount: 1300, status: "unpaid", notes: "\u0642\u0633\u0637 \u0634\u0647\u0631\u064A" },
    { id: "quick_13", name: "\u064A\u0648\u0633\u0641 \u063A\u0631\u064A\u0628", amount: 2800, status: "unpaid", notes: "\u0642\u0633\u0637 \u0639\u0644\u0649 6 \u0634\u0647\u0648\u0631" },
    { id: "quick_14", name: "\u0633\u0643\u0631\u0627\u0646", amount: 10500, status: "unpaid", notes: "\u0645\u0633\u062A\u062D\u0642 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0627\u0644\u0634\u0647\u0631 \u0627\u0644\u062C\u0627\u064A" }
  ],
  moneyCircles: [
    {
      id: "circle_1",
      name: "\u062C\u0645\u0639\u064A\u0629 \u0627\u0644\u0640 5000",
      totalAmount: 5e3,
      monthlyPayment: 5e3,
      monthsCount: 1,
      startDate: "2025-03-10",
      status: "active",
      notes: "\u062F\u0641\u0639\u062A \u0627\u0648\u0644 \u0627\u0644\u062C\u0645\u0639\u064A\u0629 5 \u062A\u0644\u0627\u0641 \u0628\u062A\u0627\u0631\u064A\u062E 10/3 (10 \u0631\u0645\u0636\u0627\u0646)",
      schedule: [
        { date: "2025-03-10", paid: true, amount: 5e3, datePaid: "2025-03-10" }
      ]
    }
  ],
  invoices: [
    {
      id: "947",
      date: "2025-05-02",
      clientName: "\u0627\u062D\u0645\u062F \u062D\u0644\u0645\u064A \u0645\u062D\u0645\u062F \u0645\u062A\u0648\u0644\u064A",
      itemName: "iphone 13 Pro Max 256G 100% Black",
      serialNumber: "356514418587283",
      amount: 37e3,
      storeName: "\u0628\u0648\u0643\u0633 \u0633\u062A\u0648\u0631 (Box Store)",
      address: "9 \u0634 \u062A\u0631\u0639\u0647 \u0627\u0644\u0633\u0648\u0627\u062D\u0644 / \u0627\u0644\u0648\u0631\u0627\u0642\u060C \u0627\u0644\u062C\u064A\u0632\u0629",
      status: "paid"
    }
  ],
  expenses: [
    {
      id: "exp_1",
      title: "\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u062D\u0644",
      amount: 4e3,
      category: "rent",
      dueDate: "2025-07-01",
      status: "unpaid",
      recurring: "monthly",
      notes: "\u0625\u064A\u062C\u0627\u0631 \u0645\u062D\u0644 \u0628\u0648\u0643\u0633 \u0633\u062A\u0648\u0631 \u0627\u0644\u0634\u0647\u0631\u064A"
    },
    {
      id: "exp_2",
      title: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0646\u062A",
      amount: 400,
      category: "internet",
      dueDate: "2025-07-05",
      status: "unpaid",
      recurring: "monthly",
      notes: "\u0627\u0634\u062A\u0631\u0627\u0643 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0627\u0644\u0623\u0631\u0636\u064A \u0644\u0644\u0645\u062D\u0644"
    },
    {
      id: "exp_3",
      title: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0643\u0647\u0631\u0628\u0627\u0621",
      amount: 850,
      category: "electricity",
      dueDate: "2025-06-25",
      status: "paid",
      paymentDate: "2025-06-24",
      recurring: "monthly",
      notes: "\u0641\u0627\u062A\u0648\u0631\u0629 \u0643\u0647\u0631\u0628\u0627\u0621 \u0634\u0647\u0631 \u064A\u0648\u0646\u064A\u0648"
    }
  ],
  purchases: [],
  lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
};
if (!process.env.VERCEL) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2), "utf8");
  }
}
dotenv.config();
dotenv.config({ path: path.join(process.cwd(), "../.env.local") });
var supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
var supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.warn("Supabase credentials not found in env. Falling back to local file storage only.");
}
var supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
async function readData() {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("smart_installment_data").select("*").eq("id", 1);
      if (!error && data && data.length > 0) {
        const row = data[0];
        const formattedData = {
          activeCustomers: row.active_customers || [],
          quickInstallments: row.quick_installments || [],
          moneyCircles: row.money_circles || [],
          invoices: row.invoices || [],
          expenses: row.expenses || [],
          purchases: row.purchases || [],
          lastUpdated: row.last_updated || (/* @__PURE__ */ new Date()).toISOString()
        };
        if (!process.env.VERCEL) {
          fs.writeFile(DATA_FILE, JSON.stringify(formattedData, null, 2), "utf8", (err) => {
            if (err) console.error("Error updating local cache file:", err);
          });
        }
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
      const parsed = JSON.parse(raw);
      return {
        activeCustomers: parsed.activeCustomers || [],
        quickInstallments: parsed.quickInstallments || [],
        moneyCircles: parsed.moneyCircles || [],
        invoices: parsed.invoices || [],
        expenses: parsed.expenses || [],
        purchases: parsed.purchases || [],
        lastUpdated: parsed.lastUpdated || (/* @__PURE__ */ new Date()).toISOString()
      };
    }
  } catch (err) {
    console.error("Error reading data file:", err);
  }
  return defaultData;
}
async function saveData(data) {
  data.lastUpdated = (/* @__PURE__ */ new Date()).toISOString();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing local backup file:", err);
  }
  if (supabase) {
    try {
      const { error } = await supabase.from("smart_installment_data").upsert({
        id: 1,
        active_customers: data.activeCustomers,
        quick_installments: data.quickInstallments,
        money_circles: data.moneyCircles,
        invoices: data.invoices,
        expenses: data.expenses,
        purchases: data.purchases || [],
        last_updated: data.lastUpdated,
        updated_at: (/* @__PURE__ */ new Date()).toISOString()
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
app.get("/api/installments", async (req, res) => {
  res.json(await readData());
});
app.post("/api/installments", async (req, res) => {
  try {
    await saveData(req.body);
    res.json({ success: true, message: "\u062A\u0645 \u062D\u0641\u0638 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/installments/customer", async (req, res) => {
  try {
    const data = await readData();
    const updatedCustomer = req.body;
    const index = data.activeCustomers.findIndex((c) => c.id === updatedCustomer.id);
    if (index >= 0) {
      data.activeCustomers[index] = updatedCustomer;
    } else {
      data.activeCustomers.push(updatedCustomer);
    }
    await saveData(data);
    res.json({ success: true, customer: updatedCustomer });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.delete("/api/installments/customer/:id", async (req, res) => {
  try {
    const data = await readData();
    data.activeCustomers = data.activeCustomers.filter((c) => c.id !== req.params.id);
    await saveData(data);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
app.post("/api/sync/sheets", async (req, res) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Access token is required" });
  }
  try {
    const data = await readData();
    let spreadsheetId = "";
    let spreadsheetUrl = "";
    const searchRes = await fetch(
      "https://www.googleapis.com/drive/v3/files?q=name%3D%27%D8%A5%D8%AF%D8%A7%D8%B1%D8%A9%20%D8%A7%D9%84%D8%A3%D9%82%D8%B3%D8%A7%D8%B7%20%D9%88%D8%A7%D9%84%D8%AC%D9%85%D9%81%D9%8A%D8%A7%D8%AA%27%20and%20mimeType%3D%27application%2Fvnd.google-apps.spreadsheet%27%20and%20trashed%3Dfalse",
      { headers: { Authorization: token } }
    );
    if (searchRes.ok) {
      const searchData = await searchRes.json();
      if (searchData.files && searchData.files.length > 0) {
        spreadsheetId = searchData.files[0].id;
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
      }
    }
    if (!spreadsheetId) {
      const createRes = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: {
          Authorization: token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: "\u0625\u062F\u0627\u0631\u0629 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0648\u0627\u0644\u062C\u0645\u0639\u064A\u0627\u062A",
          mimeType: "application/vnd.google-apps.spreadsheet"
        })
      });
      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Failed to create spreadsheet: ${errText}`);
      }
      const createData = await createRes.json();
      spreadsheetId = createData.id;
      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`;
    }
    const activeHeaders = ["\u0643\u0648\u062F \u0627\u0644\u0639\u0645\u064A\u0644", "\u0627\u0644\u0627\u0633\u0645", "\u0646\u0648\u0639 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 / \u0627\u0644\u0645\u0646\u062A\u062C", "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A", "\u0627\u0644\u0645\u062F\u0641\u0648\u0639", "\u0627\u0644\u0645\u062A\u0628\u0642\u064A", "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0621", "\u0639\u062F\u062F \u0627\u0644\u0623\u0642\u0633\u0627\u0637", "\u0642\u064A\u0645\u0629 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0634\u0647\u0631\u064A", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A"];
    const activeRows = data.activeCustomers.map((c) => [
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
    const quickHeaders = ["\u0643\u0648\u062F \u0627\u0644\u0642\u0633\u0637", "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644", "\u0642\u064A\u0645\u0629 \u0627\u0644\u0642\u0633\u0637", "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A"];
    const quickRows = data.quickInstallments.map((q) => [
      q.id,
      q.name,
      q.amount,
      q.status === "paid" ? "\u062A\u0645 \u0627\u0644\u062F\u0641\u0639" : "\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639",
      q.notes || ""
    ]);
    const circleHeaders = ["\u0643\u0648\u062F \u0627\u0644\u062C\u0645\u0639\u064A\u0629", "\u0627\u0633\u0645 \u0627\u0644\u0639\u0636\u0648 / \u0627\u0644\u062C\u0645\u0639\u064A\u0629", "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0643\u0644\u064A", "\u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0634\u0647\u0631\u064A", "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0621", "\u0639\u062F\u062F \u0627\u0644\u0634\u0647\u0648\u0631", "\u0627\u0644\u062D\u0627\u0644\u0629", "\u0645\u0644\u0627\u062D\u0638\u0627\u062A"];
    const circleRows = data.moneyCircles.map((c) => [
      c.id,
      c.name,
      c.totalAmount,
      c.monthlyPayment,
      c.startDate,
      c.monthsCount,
      c.status === "active" ? "\u0646\u0634\u0637" : "\u0645\u0643\u062A\u0645\u0644",
      c.notes || ""
    ]);
    const invoiceHeaders = ["\u0631\u0642\u0645 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629", "\u0627\u0644\u062A\u0627\u0631\u064A\u062E", "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644", "\u0627\u0644\u0628\u064A\u0627\u0646 / \u0627\u0644\u0648\u0635\u0641", "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u062A\u0633\u0644\u0633\u0644\u064A", "\u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u0643\u0644\u064A\u0629 (\u062C.\u0645.)", "\u0627\u0644\u0645\u062D\u0644", "\u0627\u0644\u0639\u0646\u0648\u0627\u0646", "\u062D\u0627\u0644\u0629 \u0627\u0644\u0633\u062F\u0627\u062F"];
    const invoiceRows = data.invoices.map((i) => [
      i.id,
      i.date,
      i.clientName,
      i.itemName,
      i.serialNumber || "",
      i.amount,
      i.storeName,
      i.address || "",
      i.status === "paid" ? "\u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644" : "\u0645\u0639\u0644\u0642\u0629"
    ]);
    await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: token,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          { addSheet: { properties: { title: "\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u0646\u0634\u0637\u0629" } } },
          { addSheet: { properties: { title: "\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u062C\u0627\u0631\u064A\u0629" } } },
          { addSheet: { properties: { title: "\u0627\u0644\u062C\u0645\u0639\u064A\u0627\u062A" } } },
          { addSheet: { properties: { title: "\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A" } } }
        ]
      })
    }).catch(() => {
    });
    const writeSheetData = async (sheetName, headers, rows) => {
      const values = [headers, ...rows];
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: {
            Authorization: token,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ values })
        }
      );
    };
    await writeSheetData("\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u0646\u0634\u0637\u0629", activeHeaders, activeRows);
    await writeSheetData("\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u062C\u0627\u0631\u064A\u0629", quickHeaders, quickRows);
    await writeSheetData("\u0627\u0644\u062C\u0645\u0639\u064A\u0627\u062A", circleHeaders, circleRows);
    await writeSheetData("\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0648\u0627\u0644\u0645\u0628\u064A\u0639\u0627\u062A", invoiceHeaders, invoiceRows);
    res.json({ success: true, spreadsheetId, url: spreadsheetUrl });
  } catch (err) {
    console.error("Sheets sync error:", err);
    res.status(500).json({ error: err.message });
  }
});
var aiClient = null;
function getGeminiClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("\u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0640 API \u0644\u0640 Gemini \u063A\u064A\u0631 \u0645\u062A\u0648\u0641\u0631. \u064A\u0631\u062C\u0649 \u062A\u0647\u064A\u0626\u062A\u0647 \u0641\u064A Settings > Secrets.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build"
        }
      }
    });
  }
  return aiClient;
}
var tool_get_current_date = {
  name: "get_current_date",
  description: "\u0627\u0644\u062D\u0635\u0648\u0644 \u0639\u0644\u0649 \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0644\u0645\u0637\u0627\u0628\u0642\u0629 \u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E \u0648\u0645\u0639\u0631\u0641\u0629 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0629 \u0648\u0627\u0644\u062C\u0627\u0631\u064A\u0629 \u0648\u062D\u0633\u0627\u0628 \u0627\u0644\u0641\u062A\u0631\u0627\u062A.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};
var tool_get_all_data = {
  name: "get_all_data",
  description: "\u0639\u0631\u0636 \u0643\u0627\u0641\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u062C\u0627\u0631\u064A\u0629 \u0648\u0627\u0644\u0646\u0634\u0637\u0629 \u0648\u0627\u0644\u062C\u0645\u0639\u064A\u0627\u062A \u0648\u0627\u0644\u0641\u0648\u0627\u062A\u064A\u0631 \u0644\u0640 Box Store \u0644\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0644\u0644\u0639\u0645\u0644\u0627\u0621 \u0648\u062D\u0633\u0627\u0628\u0627\u062A\u0647\u0645 \u0627\u0644\u0625\u062C\u0645\u0627\u0644\u064A\u0629 \u0648\u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629 \u0648\u062A\u0648\u0627\u0631\u064A\u062E \u0627\u0644\u0633\u062F\u0627\u062F \u0648\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0648\u0627\u0644\u062C\u0645\u0639\u064A\u0627\u062A.",
  parameters: {
    type: Type.OBJECT,
    properties: {}
  }
};
var tool_add_customer = {
  name: "add_customer",
  description: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0637 \u0646\u0634\u0637 \u062C\u062F\u064A\u062F \u0648\u062A\u0648\u0644\u064A\u062F \u062C\u062F\u0648\u0644 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0628\u0627\u0644\u0634\u0647\u0648\u0631.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0627\u0644\u0643\u0627\u0645\u0644" },
      product: { type: Type.STRING, description: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0646\u062A\u062C \u0623\u0648 \u0648\u0635\u0641 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 (\u0645\u062B\u0627\u0644: \u0622\u064A\u0641\u0648\u0646 13 \u0639\u0627\u062F\u064A)" },
      totalAmount: { type: Type.NUMBER, description: "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u0642\u0633\u0637" },
      monthsCount: { type: Type.INTEGER, description: "\u0639\u062F\u062F \u0627\u0644\u0634\u0647\u0648\u0631 \u0644\u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0639\u0644\u064A\u0647\u0627" },
      monthlyAmount: { type: Type.NUMBER, description: "\u0645\u0628\u0644\u063A \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0634\u0647\u0631\u064A (\u0625\u0630\u0627 \u0644\u0645 \u064A\u062D\u062F\u062F\u060C \u0633\u064A\u062A\u0645 \u062A\u0648\u0632\u064A\u0639\u0647 \u0628\u0627\u0644\u062A\u0633\u0627\u0648\u064A \u0628\u0642\u0633\u0645\u0629 \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0643\u0644\u064A \u0639\u0644\u0649 \u0627\u0644\u0634\u0647\u0648\u0631)" },
      startDate: { type: Type.STRING, description: "\u062A\u0627\u0631\u064A\u062E \u0628\u062F\u0627\u064A\u0629 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0628\u0635\u064A\u063A\u0629 YYYY-MM-DD" },
      phone: { type: Type.STRING, description: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0627\u0644\u0639\u0645\u064A\u0644 \u0644\u0644\u062A\u0648\u0627\u0635\u0644 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" },
      notes: { type: Type.STRING, description: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u0642\u0633\u0637 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" },
      type: { type: Type.STRING, description: "\u0646\u0648\u0639 \u0627\u0644\u0642\u0633\u0637: incoming \u0644\u0644\u062A\u062D\u0635\u064A\u0644/\u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0623\u0648 outgoing \u0644\u0644\u0645\u0635\u0627\u0631\u064A\u0641/\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u062D\u0644 (\u0627\u0641\u062A\u0631\u0627\u0636\u064A incoming)" }
    },
    required: ["name", "totalAmount", "monthsCount"]
  }
};
var tool_record_payment = {
  name: "record_payment",
  description: "\u062A\u0633\u062C\u064A\u0644 \u0642\u0633\u0637 \u0634\u0647\u0631\u064A \u0645\u0639\u064A\u0646 \u0644\u0639\u0645\u064A\u0644 \u0646\u0634\u0637 \u0643\u0645\u062F\u0641\u0648\u0639 (paid) \u0623\u0648 \u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639 (unpaid) \u0648\u062A\u0639\u062F\u064A\u0644 \u062D\u0633\u0627\u0628\u0627\u062A\u0647.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "\u0643\u0648\u062F \u0627\u0644\u0639\u0645\u064A\u0644 (\u0645\u062B\u0627\u0644: active_1)" },
      date: { type: Type.STRING, description: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0645\u062D\u062F\u062F \u0627\u0644\u0645\u0631\u0627\u062F \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u062A\u0647 \u0628\u0635\u064A\u063A\u0629 YYYY-MM-DD" },
      status: { type: Type.STRING, description: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0644\u0644\u0642\u0633\u0637: paid (\u0645\u062F\u0641\u0648\u0639) \u0623\u0648 unpaid (\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639)" }
    },
    required: ["customerId", "date", "status"]
  }
};
var tool_add_quick_installment = {
  name: "add_quick_installment",
  description: "\u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0637 \u0634\u0647\u0631\u064A \u0633\u0631\u064A\u0639 \u062C\u0627\u0631\u064A \u0644\u0639\u0645\u064A\u0644 \u062E\u0627\u0631\u062C\u064A.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      name: { type: Type.STRING, description: "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644" },
      amount: { type: Type.NUMBER, description: "\u0642\u064A\u0645\u0629 \u0627\u0644\u0642\u0633\u0637" },
      notes: { type: Type.STRING, description: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u062D\u0648\u0644 \u0627\u0644\u0642\u0633\u0637" },
      phone: { type: Type.STRING, description: "\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062A\u0641 \u0644\u0644\u0639\u0645\u064A\u0644 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" }
    },
    required: ["name", "amount"]
  }
};
var tool_toggle_quick_installment_status = {
  name: "toggle_quick_installment_status",
  description: "\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0633\u0631\u064A\u0639 \u0643\u0645\u062F\u0641\u0648\u0639 (paid) \u0623\u0648 \u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639 (unpaid).",
  parameters: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: "\u0643\u0648\u062F \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0633\u0631\u064A\u0639 (\u0645\u062B\u0627\u0644: quick_1)" },
      status: { type: Type.STRING, description: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629: paid \u0623\u0648 unpaid" }
    },
    required: ["id", "status"]
  }
};
var tool_update_customer_notes = {
  name: "update_customer_notes",
  description: "\u062A\u0639\u062F\u064A\u0644 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0639\u0645\u064A\u0644 \u0646\u0634\u0637 \u0645\u0639\u064A\u0646.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "\u0643\u0648\u062F \u0627\u0644\u0639\u0645\u064A\u0644 (\u0645\u062B\u0627\u0644: active_1)" },
      notes: { type: Type.STRING, description: "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0627\u0644\u062C\u062F\u064A\u062F\u0629 \u0628\u0627\u0644\u0643\u0627\u0645\u0644" }
    },
    required: ["customerId", "notes"]
  }
};
var tool_delete_customer = {
  name: "delete_customer",
  description: "\u062D\u0630\u0641 \u0633\u062C\u0644 \u0627\u0644\u0639\u0645\u064A\u0644 \u0648\u0623\u0642\u0633\u0627\u0637\u0647 \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0646\u0647\u0627\u0626\u064A\u0627\u064B.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      customerId: { type: Type.STRING, description: "\u0643\u0648\u062F \u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062D\u0630\u0641\u0647" }
    },
    required: ["customerId"]
  }
};
var tool_add_expense = {
  name: "add_expense",
  description: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0635\u0631\u0648\u0641 \u062C\u062F\u064A\u062F \u0644\u0644\u0646\u0638\u0627\u0645 \u0645\u062B\u0644 \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u062D\u0644 \u0623\u0648 \u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621 \u0623\u0648 \u0627\u0644\u0625\u0646\u062A\u0631\u0646\u062A \u0623\u0648 \u0645\u0631\u062A\u0628\u0627\u062A \u0627\u0644\u0645\u0648\u0638\u0641\u064A\u0646.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      title: { type: Type.STRING, description: "\u0639\u0646\u0648\u0627\u0646 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 (\u0645\u062B\u0627\u0644: \u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u062D\u0644\u060C \u0641\u0627\u062A\u0648\u0631\u0629 \u0643\u0647\u0631\u0628\u0627\u0621)" },
      amount: { type: Type.NUMBER, description: "\u0642\u064A\u0645\u0629 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0628\u0627\u0644\u062C\u0646\u064A\u0647" },
      category: {
        type: Type.STRING,
        description: "\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0645\u0635\u0631\u0648\u0641: rent (\u0625\u064A\u062C\u0627\u0631) | internet (\u0625\u0646\u062A\u0631\u0646\u062A) | electricity (\u0643\u0647\u0631\u0628\u0627\u0621) | salary (\u0645\u0631\u062A\u0628\u0627\u062A) | maintenance (\u0635\u064A\u0627\u0646\u0629) | other (\u0623\u062E\u0631\u0649)"
      },
      dueDate: { type: Type.STRING, description: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642 \u0628\u0635\u064A\u063A\u0629 YYYY-MM-DD" },
      status: { type: Type.STRING, description: "\u062D\u0627\u0644\u0629 \u0627\u0644\u062F\u0641\u0639: paid (\u062A\u0645 \u0627\u0644\u062F\u0641\u0639) \u0623\u0648 unpaid (\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639\u060C \u0648\u0647\u064A \u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A\u0629)" },
      recurring: { type: Type.STRING, description: "\u062A\u0643\u0631\u0627\u0631 \u0627\u0644\u0645\u0635\u0631\u0648\u0641: one-time (\u0645\u0631\u0629 \u0648\u0627\u062D\u062F\u0629) | monthly (\u0634\u0647\u0631\u064A) | yearly (\u0633\u0646\u0648\u064A)" },
      notes: { type: Type.STRING, description: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u062D\u0648\u0644 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" }
    },
    required: ["title", "amount", "category", "dueDate"]
  }
};
var tool_pay_expense = {
  name: "pay_expense",
  description: "\u062A\u0633\u062C\u064A\u0644 \u062F\u0641\u0639 \u0645\u0635\u0631\u0648\u0641 \u0645\u0639\u064A\u0646 \u0648\u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u062A\u0647 \u0648\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0633\u062F\u0627\u062F.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      expenseId: { type: Type.STRING, description: "\u0643\u0648\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641 (\u0645\u062B\u0627\u0644: exp_1)" },
      status: { type: Type.STRING, description: "\u0627\u0644\u062D\u0627\u0644\u0629 \u0627\u0644\u062C\u062F\u064A\u062F\u0629: paid (\u062A\u0645 \u0627\u0644\u062F\u0641\u0639) \u0623\u0648 unpaid (\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639)" },
      paymentDate: { type: Type.STRING, description: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u062F\u0641\u0639 \u0628\u0635\u064A\u063A\u0629 YYYY-MM-DD (\u0627\u062E\u062A\u064A\u0627\u0631\u064A\u060C \u064A\u062A\u0645 \u0636\u0628\u0637\u0647 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0644\u0644\u064A\u0648\u0645 \u0639\u0646\u062F \u0627\u0644\u062F\u0641\u0639)" }
    },
    required: ["expenseId", "status"]
  }
};
var tool_delete_expense = {
  name: "delete_expense",
  description: "\u062D\u0630\u0641 \u0645\u0635\u0631\u0648\u0641 \u0645\u0646 \u0627\u0644\u0646\u0638\u0627\u0645 \u0646\u0647\u0627\u0626\u064A\u0627\u064B.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      expenseId: { type: Type.STRING, description: "\u0643\u0648\u062F \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062D\u0630\u0641\u0647" }
    },
    required: ["expenseId"]
  }
};
var tool_add_purchase = {
  name: "add_purchase",
  description: "\u0625\u0636\u0627\u0641\u0629 \u0645\u0634\u062A\u0631\u064A\u0627\u062A \u062C\u062F\u064A\u062F\u0629 \u0644\u0644\u0645\u062D\u0644 (\u0645\u062B\u0644 \u062C\u0631\u0627\u0628\u0627\u062A\u060C \u0627\u064A\u0641\u0648\u0646\u0627\u062A\u060C \u0627\u0633\u0643\u0631\u064A\u0646\u0627\u062A\u060C \u0634\u0648\u0627\u062D\u0646) \u0644\u062A\u062F\u062E\u0644 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemName: { type: Type.STRING, description: "\u0627\u0633\u0645 \u0627\u0644\u0633\u0644\u0639\u0629 \u0623\u0648 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u0634\u062A\u0631\u0627\u0629 (\u0645\u062B\u0627\u0644: \u0627\u064A\u0641\u0648\u0646 13 \u0639\u0627\u062F\u064A\u060C \u062C\u0631\u0627\u0628 \u0633\u064A\u0644\u064A\u0643\u0648\u0646 14 \u0628\u0631\u0648\u060C \u0627\u0633\u0643\u0631\u064A\u0646\u0629 \u0632\u062C\u0627\u062C)" },
      category: {
        type: Type.STRING,
        description: "\u062A\u0635\u0646\u064A\u0641 \u0627\u0644\u0633\u0644\u0639\u0629: iphone (\u0623\u064A\u0641\u0648\u0646\u0627\u062A) | accessory (\u062C\u0631\u0627\u0628\u0627\u062A \u0648\u0625\u0643\u0633\u0633\u0648\u0627\u0631\u0627\u062A) | charger (\u0634\u0648\u0627\u062D\u0646 \u0648\u0643\u0627\u0628\u0644\u0627\u062A) | screen (\u0627\u0633\u0643\u0631\u064A\u0646\u0627\u062A \u0648\u0634\u0627\u0634\u0627\u062A) | other (\u0623\u062E\u0631\u0649)"
      },
      quantity: { type: Type.NUMBER, description: "\u0627\u0644\u0643\u0645\u064A\u0629 \u0627\u0644\u0645\u0634\u062A\u0631\u0627\u0629 (\u0645\u062B\u0627\u0644: 5)" },
      costPrice: { type: Type.NUMBER, description: "\u0633\u0639\u0631 \u0627\u0644\u0634\u0631\u0627\u0621 \u0644\u0644\u0642\u0637\u0639\u0629 \u0627\u0644\u0648\u0627\u062D\u062F\u0629 \u0628\u0627\u0644\u062C\u0646\u064A\u0647" },
      salePrice: { type: Type.NUMBER, description: "\u0633\u0639\u0631 \u0627\u0644\u0628\u064A\u0639 \u0627\u0644\u0645\u062A\u0648\u0642\u0639 \u0644\u0644\u0642\u0637\u0639\u0629 \u0627\u0644\u0648\u0627\u062D\u062F\u0629 \u0628\u0627\u0644\u062C\u0646\u064A\u0647 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" },
      purchaseDate: { type: Type.STRING, description: "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0634\u0631\u0627\u0621 \u0628\u0635\u064A\u063A\u0629 YYYY-MM-DD" },
      supplierName: { type: Type.STRING, description: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0648\u0631\u062F \u0623\u0648 \u0627\u0644\u062A\u0627\u062C\u0631 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" },
      notes: { type: Type.STRING, description: "\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0625\u0636\u0627\u0641\u064A\u0629 \u062D\u0648\u0644 \u0627\u0644\u0634\u0631\u0648\u0629 (\u0627\u062E\u062A\u064A\u0627\u0631\u064A)" }
    },
    required: ["itemName", "category", "quantity", "costPrice", "purchaseDate"]
  }
};
var tool_delete_purchase = {
  name: "delete_purchase",
  description: "\u062D\u0630\u0641 \u0641\u0627\u062A\u0648\u0631\u0629/\u0639\u0645\u0644\u064A\u0629 \u0634\u0631\u0627\u0621 \u0645\u0646 \u0627\u0644\u0646\u0638\u0627\u0645 \u0646\u0647\u0627\u0626\u064A\u0627\u064B.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      purchaseId: { type: Type.STRING, description: "\u0643\u0648\u062F \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u062D\u0630\u0641\u0647\u0627" }
    },
    required: ["purchaseId"]
  }
};
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "messages array is required" });
    }
    const runLocalAssistant = async (msgs) => {
      const lastUserMsg = [...msgs].reverse().find((m) => m.role === "user");
      const userText = lastUserMsg?.parts?.[0]?.text || lastUserMsg?.text || "";
      const data = await readData();
      let responseText = "";
      let dataUpdated = false;
      const query = userText.toLowerCase().trim();
      if (query.includes("\u0645\u0633\u062A\u062D\u0642") || query.includes("\u062F\u064A\u0646") || query.includes("\u062A\u0627\u0631\u064A\u062E") || query.includes("\u0639\u0644\u064A \u0645\u064A\u0646") || query.includes("\u0645\u062A\u0627\u062E\u0631")) {
        const unpaidActive = data.activeCustomers.filter((c) => c.remainingAmount > 0);
        const unpaidQuick = data.quickInstallments.filter((q) => q.status === "unpaid");
        responseText = `\u062D\u0627\u0636\u0631 \u064A\u0627 \u0641\u0646\u062F\u0645! \u062C\u0644\u0628\u0646\u0627 \u0643\u0634\u0641 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u0645\u0633\u062A\u062D\u0642\u0629 \u0648\u0627\u0644\u063A\u064A\u0631 \u0645\u062F\u0641\u0648\u0639\u0629 \u062D\u0627\u0644\u064A\u0627\u064B:expenses: row.expenses || [], purchases: row.purchases || []nexpenses: row.expenses || [], purchases: row.purchases || []n`;
        if (unpaidActive.length > 0) {
          responseText += `*\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u0646\u0634\u0637\u0629 \u0627\u0644\u0645\u0639\u0644\u0642\u0629:*expenses: row.expenses || [], purchases: row.purchases || []n`;
          unpaidActive.forEach((c) => {
            const nextInst = c.schedule.find((s) => s.status === "unpaid");
            responseText += `- *${c.name}*: \u0645\u062A\u0628\u0642\u064A \u0639\u0644\u064A\u0647 ${c.remainingAmount} \u062C (\u0642\u0633\u0637\u0647 \u0627\u0644\u062A\u0627\u0644\u064A: ${nextInst ? nextInst.amount + " \u062C \u0628\u062A\u0627\u0631\u064A\u062E " + nextInst.date : "\u0644\u0627 \u064A\u0648\u062C\u062F \u0642\u0633\u0637 \u0645\u062D\u062F\u062F"}).expenses: row.expenses || [], purchases: row.purchases || []n`;
          });
        } else {
          responseText += `\u0644\u0627 \u062A\u0648\u062C\u062F \u0623\u0642\u0633\u0627\u0637 \u0646\u0634\u0637\u0629 \u0645\u062A\u0623\u062E\u0631\u0629 \u062D\u0627\u0644\u064A\u0627\u064B! \u0627\u0644\u0643\u0644 \u062A\u0645\u0627\u0645.expenses: row.expenses || [], purchases: row.purchases || []n`;
        }
        if (unpaidQuick.length > 0) {
          responseText += `expenses: row.expenses || [], purchases: row.purchases || []n*\u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u0645\u0639\u0644\u0642\u0629:*expenses: row.expenses || [], purchases: row.purchases || []n`;
          unpaidQuick.forEach((q) => {
            responseText += `- *${q.name}*: \u0642\u0633\u0637 \u0628\u0642\u064A\u0645\u0629 ${q.amount} \u062C (${q.notes || "\u0628\u062F\u0648\u0646 \u0645\u0644\u0627\u062D\u0638\u0627\u062A"}).expenses: row.expenses || [], purchases: row.purchases || []n`;
          });
        }
      } else if (query.includes("\u0633\u062F\u062F") || query.includes("\u062F\u0641\u0639") || query.includes("\u062A\u0633\u062C\u064A\u0644 \u062F\u0641\u0639") || query.includes("\u0633\u062F\u062F \u0642\u0633\u0637")) {
        const foundCustomer = data.activeCustomers.find((c) => query.includes(c.name.toLowerCase()) || c.name.toLowerCase().includes(query.replace("\u0633\u062F\u062F \u0642\u0633\u0637", "").trim()));
        const foundQuick = data.quickInstallments.find((q) => query.includes(q.name.toLowerCase()) || q.name.toLowerCase().includes(query.replace("\u0633\u062F\u062F \u0642\u0633\u0637", "").trim()));
        if (foundCustomer) {
          const nextUnpaid = foundCustomer.schedule.find((s) => s.status === "unpaid");
          if (nextUnpaid) {
            nextUnpaid.status = "paid";
            nextUnpaid.paymentDate = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
            const paid = foundCustomer.schedule.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
            foundCustomer.paidAmount = paid;
            foundCustomer.remainingAmount = Math.max(0, foundCustomer.totalAmount - paid);
            await saveData(data);
            dataUpdated = true;
            responseText = `\u064A\u0627 \u0645\u0633\u0647\u0644 \u0627\u0644\u062D\u0627\u0644! \u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0633\u062F\u0627\u062F \u0642\u0633\u0637 \u0627\u0644\u0639\u0645\u064A\u0644 *${foundCustomer.name}* \u0644\u0634\u0647\u0631 ${nextUnpaid.date} \u0628\u0642\u064A\u0645\u0629 ${nextUnpaid.amount} \u062C\u0646\u064A\u0647 \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u062D\u062F\u064A\u062B \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B. \u{1F4B3}\u2728`;
          } else {
            responseText = `\u0627\u0644\u0639\u0645\u064A\u0644 *${foundCustomer.name}* \u0633\u062F\u062F \u0643\u0644 \u0623\u0642\u0633\u0627\u0637\u0647 \u0628\u0627\u0644\u0641\u0639\u0644 \u064A\u0627 \u0628\u0627\u0634\u0627! \u0645\u0641\u064A\u0634 \u0623\u0642\u0633\u0627\u0637 \u0645\u0633\u062A\u062D\u0642\u0629 \u0639\u0644\u064A\u0647 \u062D\u0627\u0644\u064A\u0627\u064B. \u{1F44D}`;
          }
        } else if (foundQuick) {
          if (foundQuick.status === "unpaid") {
            foundQuick.status = "paid";
            await saveData(data);
            dataUpdated = true;
            responseText = `\u062A\u0645\u0627\u0645 \u064A\u0627 \u063A\u0627\u0644\u064A\u060C \u062A\u0645 \u0633\u062F\u0627\u062F \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0633\u0631\u064A\u0639 \u0644\u0644\u0639\u0645\u064A\u0644 *${foundQuick.name}* \u0628\u0642\u064A\u0645\u0629 ${foundQuick.amount} \u062C\u0646\u064A\u0647 \u0628\u0646\u062C\u0627\u062D. \u2705`;
          } else {
            responseText = `\u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0633\u0631\u064A\u0639 \u0644\u0644\u0639\u0645\u064A\u0644 *${foundQuick.name}* \u0645\u062F\u0641\u0648\u0639 \u0628\u0627\u0644\u0641\u0639\u0644 \u0645\u0633\u0628\u0642\u0627\u064B.`;
          }
        } else {
          responseText = `\u0639\u0627\u064A\u0632 \u062A\u0633\u062C\u0644 \u0633\u062F\u0627\u062F \u0642\u0633\u0637 \u0644\u0645\u064A\u0646 \u0628\u0627\u0644\u0638\u0628\u0637\u061F \u0627\u0643\u062A\u0628\u0644\u064A \u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0648\u0636\u0648\u062D \u0632\u064A \u0645\u0627 \u0647\u0648 \u0645\u0633\u062C\u0644 \u0641\u064A \u0627\u0644\u0633\u064A\u0633\u062A\u0645 \u0639\u0634\u0627\u0646 \u0623\u0642\u062F\u0631 \u0623\u062D\u062F\u062B\u0647\u0648\u0644\u0643 \u0641\u0648\u0631\u0627\u064B. (\u0645\u062B\u0627\u0644: "\u0633\u062F\u062F \u0642\u0633\u0637 \u062F\u0633\u0648\u0642\u064A")`;
        }
      } else if (query.includes("\u062A\u0643\u064A\u064A\u0641") || query.includes("\u0627\u0644\u062A\u0643\u064A\u064A\u0641") || query.includes("\u062A\u0643\u064A\u0641")) {
        const acCust = data.activeCustomers.find((c) => c.name.includes("\u062A\u0643\u064A\u064A\u0641") || c.product.includes("\u062A\u0643\u064A\u064A\u0641") || c.notes && c.notes.includes("\u062A\u0643\u064A\u064A\u0641"));
        if (acCust) {
          responseText = `\u0628\u062E\u0635\u0648\u0635 *\u062D\u0633\u0627\u0628 \u0627\u0644\u062A\u0643\u064A\u064A\u0641\u0627\u062A*:expenses: row.expenses || [], purchases: row.purchases || []n- \u0627\u0644\u0639\u0645\u064A\u0644: *${acCust.name}*expenses: row.expenses || [], purchases: row.purchases || []n- \u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0643\u0644\u064A \u0628\u0639\u062F \u0627\u0644\u0641\u0627\u0626\u062F\u0629: ${acCust.totalAmount} \u062Cexpenses: row.expenses || [], purchases: row.purchases || []n- \u0627\u0644\u0645\u062F\u0641\u0648\u0639: ${acCust.paidAmount} \u062Cexpenses: row.expenses || [], purchases: row.purchases || []n- \u0627\u0644\u0645\u062A\u0628\u0642\u064A: ${acCust.remainingAmount} \u062Cexpenses: row.expenses || [], purchases: row.purchases || []n- \u062A\u0648\u0632\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637: ${acCust.monthsCount} \u0634\u0647\u0631\u060C \u0643\u0644 \u0634\u0647\u0631 ${acCust.monthlyAmount} \u062C.expenses: row.expenses || [], purchases: row.purchases || []n- \u0645\u0644\u0627\u062D\u0638\u0627\u062A: ${acCust.notes}expenses: row.expenses || [], purchases: row.purchases || []nexpenses: row.expenses || [], purchases: row.purchases || []n\u0627\u0644\u062D\u0633\u0627\u0628 \u0645\u0633\u062C\u0644 \u0648\u062C\u0627\u0647\u0632 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645 \u0648\u0645\u0641\u062A\u0648\u062D \u0644\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u062F\u0641\u0639\u0627\u062A!`;
        } else {
          responseText = `\u0645\u0634 \u0644\u0627\u0642\u064A \u062D\u0633\u0627\u0628 \u062A\u0643\u064A\u064A\u0641 \u0645\u0633\u062C\u0644 \u062D\u0627\u0644\u064A\u0627\u064B \u0628\u0627\u0644\u0627\u0633\u0645 \u062F\u0647. \u0644\u0648 \u062A\u062D\u0628 \u0623\u0636\u064A\u0641\u0647\u0648\u0644\u0643 \u0627\u0643\u062A\u0628\u0644\u064A \u062A\u0641\u0627\u0635\u064A\u0644\u0647 \u0628\u0648\u0636\u0648\u062D\u060C \u0623\u0648 \u0627\u0633\u062A\u062E\u062F\u0645 \u0632\u0631 \u0625\u0636\u0627\u0641\u0629 \u0639\u0645\u064A\u0644.`;
        }
      } else if (query.includes("\u0645\u0635\u0631\u0648\u0641") || query.includes("\u0645\u0635\u0627\u0631\u064A\u0641") || query.includes("\u0641\u0627\u062A\u0648\u0631\u0629 \u0643\u0647\u0631\u0628\u0627\u0621") || query.includes("\u0641\u0627\u062A\u0648\u0631\u0629 \u0627\u0644\u0646\u062A") || query.includes("\u0625\u064A\u062C\u0627\u0631 \u0627\u0644\u0645\u062D\u0644") || query.includes("\u0627\u064A\u062C\u0627\u0631")) {
        const unpaidExpenses = (data.expenses || []).filter((e) => e.status === "unpaid");
        const paidExpenses = (data.expenses || []).filter((e) => e.status === "paid");
        responseText = `\u062D\u0627\u0636\u0631 \u064A\u0627 \u0641\u0646\u062F\u0645! \u062C\u0644\u0628\u0646\u0627 \u0643\u0634\u0641 \u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0648\u0627\u0644\u0627\u0644\u062A\u0632\u0627\u0645\u0627\u062A \u0644\u0640 Box Store:expenses: row.expenses || [], purchases: row.purchases || []nexpenses: row.expenses || [], purchases: row.purchases || []n`;
        if (unpaidExpenses.length > 0) {
          responseText += `*\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u063A\u064A\u0631 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0629 \u0645\u0639\u0644\u0642\u0629:*expenses: row.expenses || [], purchases: row.purchases || []n`;
          unpaidExpenses.forEach((e) => {
            responseText += `- *${e.title}*: ${e.amount} \u062C (\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0627\u0633\u062A\u062D\u0642\u0627\u0642: ${e.dueDate})expenses: row.expenses || [], purchases: row.purchases || []n`;
          });
        } else {
          responseText += `\u0644\u0627 \u062A\u0648\u062C\u062F \u0645\u0635\u0627\u0631\u064A\u0641 \u0645\u0639\u0644\u0642\u0629 \u062D\u0627\u0644\u064A\u0627\u064B! \u0627\u0644\u0643\u0644 \u062A\u0645\u0627\u0645.expenses: row.expenses || [], purchases: row.purchases || []n`;
        }
        if (paidExpenses.length > 0) {
          responseText += `expenses: row.expenses || [], purchases: row.purchases || []n*\u0627\u0644\u0645\u0635\u0627\u0631\u064A\u0641 \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0629 \u0645\u0624\u062E\u0631\u0627\u064B:*expenses: row.expenses || [], purchases: row.purchases || []n`;
          paidExpenses.forEach((e) => {
            responseText += `- *${e.title}*: \u062A\u0645 \u062F\u0641\u0639 ${e.amount} \u062C \u0628\u062A\u0627\u0631\u064A\u062E ${e.paymentDate || e.dueDate}expenses: row.expenses || [], purchases: row.purchases || []n`;
          });
        }
      } else if (query.includes("\u0645\u062C\u0645\u0648\u0639") || query.includes("\u0625\u062C\u0645\u0627\u0644\u064A") || query.includes("\u0627\u062D\u0635\u0627\u0626\u064A\u0627\u062A") || query.includes("\u062A\u0642\u0631\u064A\u0631") || query.includes("\u0634\u063A\u0627\u0644") || query.includes("\u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0642\u0633\u0627\u0637")) {
        const totalActiveAmount = data.activeCustomers.reduce((sum, c) => sum + c.totalAmount, 0);
        const totalRemaining = data.activeCustomers.reduce((sum, c) => sum + c.remainingAmount, 0);
        const totalPaid = totalActiveAmount - totalRemaining;
        responseText = `\u0623\u0647\u0644\u0627\u064B \u0628\u0643 \u064A\u0627 \u063A\u0627\u0644\u064A! \u0625\u0644\u064A\u0643 \u062A\u0642\u0631\u064A\u0631 \u0633\u0631\u064A\u0639 \u0639\u0646 \u0627\u0644\u0645\u062D\u0644 \u0644\u0644\u064A\u0648\u0645:expenses: row.expenses || [], purchases: row.purchases || []nexpenses: row.expenses || [], purchases: row.purchases || []n\u{1F4CA} *\u0639\u062F\u062F \u0627\u0644\u0639\u0645\u0644\u0627\u0621 \u0627\u0644\u0646\u0634\u0637\u064A\u0646:* ${data.activeCustomers.length} \u0639\u0645\u0644\u0627\u0621expenses: row.expenses || [], purchases: row.purchases || []n\u{1F4B0} *\u0625\u062C\u0645\u0627\u0644\u064A \u0645\u0628\u064A\u0639\u0627\u062A \u0627\u0644\u0623\u0642\u0633\u0627\u0637:* ${totalActiveAmount.toLocaleString("ar-EG")} \u062C.\u0645.expenses: row.expenses || [], purchases: row.purchases || []n\u{1F4B5} *\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0627\u0644\u063A \u0627\u0644\u0645\u062D\u0635\u0644\u0629:* ${totalPaid.toLocaleString("ar-EG")} \u062C.\u0645.expenses: row.expenses || [], purchases: row.purchases || []n\u{1F4C9} *\u0627\u0644\u0645\u0628\u0627\u0644\u063A \u0627\u0644\u0645\u062A\u0628\u0642\u064A\u0629 \u0641\u064A \u0627\u0644\u0633\u0648\u0642:* ${totalRemaining.toLocaleString("ar-EG")} \u062C.\u0645.expenses: row.expenses || [], purchases: row.purchases || []n\u{1F5D3}\uFE0F *\u0639\u062F\u062F \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u0633\u0631\u064A\u0639\u0629 \u0627\u0644\u062C\u0627\u0631\u064A\u0629:* ${data.quickInstallments.length} \u0623\u0642\u0633\u0627\u0637expenses: row.expenses || [], purchases: row.purchases || []nexpenses: row.expenses || [], purchases: row.purchases || []n\u0623\u0646\u0627 \u0634\u063A\u0627\u0644 \u062D\u0627\u0644\u064A\u0627\u064B \u0641\u064A \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0645\u062D\u0644\u064A \u0627\u0644\u0630\u0643\u064A \u0648\u0628\u0642\u062F\u0631 \u0623\u0633\u0627\u0639\u062F\u0643 \u0641\u064A \u062C\u0644\u0628 \u0627\u0644\u062A\u0642\u0627\u0631\u064A\u0631 \u0648\u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0633\u062F\u0627\u062F\u0627\u062A \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0633\u0648\u0642 \u0628\u0643\u0644 \u062F\u0642\u0629!`;
      } else {
        responseText = `\u064A\u0627 \u0645\u0631\u062D\u0628 \u0628\u064A\u0643 \u0641\u064A "\u0628\u0648\u0643\u0633 \u0633\u062A\u0648\u0631" \u064A\u0627 \u0637\u064A\u0628! \u{1F916} \u0623\u0646\u0627 "\u0628\u0648\u0643\u0633\u064A" \u0645\u0633\u0627\u0639\u062F\u0643 \u0627\u0644\u0645\u0627\u0644\u064A \u0627\u0644\u0630\u0643\u064A.expenses: row.expenses || [], purchases: row.purchases || []nexpenses: row.expenses || [], purchases: row.purchases || []n\u0623\u0646\u0627 \u0634\u063A\u0627\u0644 \u0648\u062C\u0627\u0647\u0632 \u0644\u0645\u0633\u0627\u0639\u062F\u062A\u0643 \u0641\u064A \u0643\u0644 \u0627\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0648\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0623\u0642\u0633\u0627\u0637. \u062A\u0642\u062F\u0631 \u062A\u0633\u0623\u0644\u0646\u064A \u0623\u0633\u0626\u0644\u0629 \u0632\u064A:expenses: row.expenses || [], purchases: row.purchases || []n- "\u0645\u064A\u0646 \u0627\u0644\u0644\u064A \u0639\u0644\u064A\u0647 \u0641\u0644\u0648\u0633 \u0645\u0633\u062A\u062D\u0642\u0629\u061F" \u{1F4C5}expenses: row.expenses || [], purchases: row.purchases || []n- "\u0633\u062F\u062F \u0642\u0633\u0637 [\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644]" \u0644\u0634\u0647\u0631 \u064A\u0648\u0644\u064A\u0648 \u{1F4B3}expenses: row.expenses || [], purchases: row.purchases || []n- "\u0639\u0631\u0636 \u062A\u0642\u0631\u064A\u0631 \u0639\u0627\u0645 \u0644\u0644\u0645\u062D\u0644" \u{1F4CA}expenses: row.expenses || [], purchases: row.purchases || []n- "\u062A\u0641\u0627\u0635\u064A\u0644 \u0642\u0633\u0637 \u0627\u0644\u062A\u0643\u064A\u064A\u0641" \u2744\uFE0Fexpenses: row.expenses || [], purchases: row.purchases || []nexpenses: row.expenses || [], purchases: row.purchases || []n\u0642\u0648\u0644\u064A \u062D\u0627\u0628\u0628 \u0646\u0639\u0645\u0644 \u0625\u064A\u0647 \u0633\u0648\u0627 \u0648\u0628\u0625\u0630\u0646 \u0627\u0644\u0644\u0647 \u0647\u062E\u0644\u0635\u0644\u0643 \u0643\u0644 \u0627\u0644\u062D\u0633\u0627\u0628\u0627\u062A \u0628\u0644\u0645\u0633\u0629 \u0648\u0627\u062D\u062F\u0629!`;
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
      const calledTools = /* @__PURE__ */ new Set();
      for (let i = 0; i < 15; i++) {
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents,
          config: {
            systemInstruction: `\u0623\u0646\u062A "\u0628\u0648\u0643\u0633\u064A" (Boxy)\u060C \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0627\u0644\u0630\u0643\u064A \u0644\u0640 "\u0628\u0648\u0643\u0633 \u0633\u062A\u0648\u0631" (Box Store). 
\u0645\u0647\u0645\u062A\u0643 \u0647\u064A \u0645\u0633\u0627\u0639\u062F\u0629 \u0635\u0627\u062D\u0628 \u0627\u0644\u0645\u062D\u0644 \u0641\u064A \u0625\u062F\u0627\u0631\u0629 \u0643\u0627\u0641\u0629 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0648\u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0648\u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0628\u062F\u0642\u0629 \u0641\u0627\u0626\u0642\u0629.
\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u062D\u0627\u0644\u064A \u0647\u0648: ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 10)}.
\u062A\u0643\u0644\u0645 \u062F\u0627\u0626\u0645\u0627\u064B \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0628\u0623\u0633\u0644\u0648\u0628 \u0648\u062F\u0648\u062F \u0648\u0645\u062D\u062A\u0631\u0641 \u0644\u0644\u063A\u0627\u064A\u0629 \u0648\u0628\u0644\u0647\u062C\u0629 \u0645\u0635\u0631\u064A\u0629 \u0645\u062D\u0628\u0628\u0629 \u0648\u0648\u0627\u0636\u062D\u0629 \u062C\u062F\u0627\u064B.

\u0635\u0644\u0627\u062D\u064A\u0627\u062A\u0643 \u0648\u0642\u062F\u0631\u0627\u062A\u0643:
1. \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0639\u0646 \u0623\u064A \u062A\u0633\u0627\u0624\u0644 \u0628\u062E\u0635\u0648\u0635 \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0627\u0644\u062C\u0627\u0631\u064A\u0629 \u0623\u0648 \u0627\u0644\u0645\u062A\u0623\u062E\u0631\u0629\u060C \u0623\u0648 \u0627\u0644\u0645\u0635\u0631\u0648\u0641\u0627\u062A\u060C \u0623\u0648 \u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0627\u0644\u0645\u062D\u0644 \u0648\u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0627\u0644\u062D\u0627\u0644\u064A.
2. \u0625\u0636\u0627\u0641\u0629 \u0642\u0633\u0637 \u062C\u062F\u064A\u062F \u0644\u0639\u0645\u064A\u0644 \u0648\u062A\u0648\u0644\u064A\u062F \u0627\u0644\u0634\u0647\u0648\u0631 \u0628\u062F\u0642\u0629 \u0628\u0645\u062C\u0631\u062F \u0623\u062E\u0630 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646\u0647.
3. \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0628\u0627\u0644\u063A \u0627\u0644\u0645\u062F\u0641\u0648\u0639\u0629 (\u062A\u0639\u062F\u064A\u0644 \u062D\u0627\u0644\u0629 \u0642\u0633\u0637 \u0644\u0639\u0645\u064A\u0644 \u0644\u0640 paid \u0623\u0648 \u0633\u062F\u0627\u062F \u0642\u0633\u0637 \u0633\u0631\u064A\u0639 \u0623\u0648 \u0633\u062F\u0627\u062F \u0645\u0635\u0631\u0648\u0641).
4. \u0625\u0636\u0627\u0641\u0629/\u062A\u062D\u062F\u064A\u062B/\u062D\u0630\u0641 \u0645\u0635\u0631\u0648\u0641\u0627\u062A \u0627\u0644\u0645\u062D\u0644 (\u0645\u062B\u0644 \u0627\u0644\u0625\u064A\u062C\u0627\u0631\u060C \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621\u060C \u0627\u0644\u0646\u062A\u060C \u0627\u0644\u0631\u0648\u0627\u062A\u0628)\u060C \u0648\u0625\u0636\u0627\u0641\u0629/\u062D\u0630\u0641 \u0639\u0645\u0644\u064A\u0627\u062A \u0634\u0631\u0627\u0621 \u0628\u0636\u0627\u0626\u0639 \u0644\u0644\u0645\u062D\u0644 (\u062C\u0631\u0627\u0628\u0627\u062A\u060C \u0627\u064A\u0641\u0648\u0646\u0627\u062A\u060C \u0627\u0633\u0643\u0631\u064A\u0646\u0627\u062A\u060C \u0634\u0648\u0627\u062D\u0646 \u0625\u0644\u062E) \u0644\u062A\u062F\u062E\u0644 \u0641\u064A \u0627\u0644\u0645\u062E\u0632\u0648\u0646 \u0648\u062D\u0633\u0627\u0628 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A.
5. \u0642\u0631\u0627\u0621\u0629 \u0648\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0635\u0648\u0631 \u0648\u0627\u0644\u0645\u0644\u0641\u0627\u062A \u0627\u0644\u0645\u0631\u0641\u0642\u0629 (\u0645\u062B\u0644 \u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A\u060C \u0641\u0648\u0627\u062A\u064A\u0631 \u0627\u0644\u0643\u0647\u0631\u0628\u0627\u0621/\u0627\u0644\u0646\u062A\u060C \u0635\u0648\u0631 \u0643\u0631\u0648\u062A \u0645\u062F\u064A\u0648\u0646\u064A\u0629\u060C \u0644\u0642\u0637\u0627\u062A \u0634\u0627\u0634\u0629). \u0642\u0645 \u0628\u0627\u0633\u062A\u062E\u0631\u0627\u062C \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0627\u0644\u064A\u0629 \u0645\u0646\u0647\u0627 \u0628\u062F\u0642\u0629 (\u0627\u0644\u0633\u0644\u0639\u060C \u0627\u0644\u0643\u0645\u064A\u0627\u062A\u060C \u0627\u0644\u0623\u0633\u0639\u0627\u0631\u060C \u0627\u0644\u062A\u0648\u0627\u0631\u064A\u062E) \u0648\u0627\u0642\u062A\u0631\u062D \u0623\u0648 \u0646\u0641\u0630 \u062A\u0644\u0642\u0627\u0626\u064A\u0627\u064B \u0627\u0644\u0625\u062F\u062E\u0627\u0644 \u0627\u0644\u0645\u0646\u0627\u0633\u0628 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645 (\u0633\u0648\u0627\u0621 \u0643\u0645\u0635\u0631\u0648\u0641 \u0644\u0644\u0645\u062D\u0644 \u0623\u0648 \u0643\u0628\u0636\u0627\u0639\u0629 \u0645\u0634\u062A\u0631\u0627\u0629 \u0644\u0644\u0645\u062E\u0632\u0648\u0646) \u0628\u0646\u0627\u0621\u064B \u0639\u0644\u0649 \u0637\u0628\u064A\u0639\u0629 \u0627\u0644\u0641\u0627\u062A\u0648\u0631\u0629 \u0644\u062A\u0633\u0647\u064A\u0644 \u0627\u0644\u0639\u0645\u0644 \u0639\u0644\u0649 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645.

\u0623\u0631\u0634\u062F \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u062F\u0627\u0626\u0645\u0627\u064B \u0644\u062E\u0637\u0648\u0627\u062A\u0647 \u0627\u0644\u0642\u0627\u062F\u0645\u0629\u060C \u0648\u0627\u0639\u0631\u0636 \u0645\u0644\u062E\u0635\u0627\u062A \u0645\u0646\u0638\u0645\u0629 \u0628\u0627\u0644\u0646\u0642\u0627\u0637 \u0648\u0627\u0644\u062C\u062F\u0627\u0648\u0644 \u0627\u0644\u0645\u0646\u0633\u0642\u0629 \u0644\u0633\u0647\u0648\u0644\u0629 \u0627\u0644\u0642\u0631\u0627\u0621\u0629.
\u0639\u0646\u062F \u062D\u062F\u0648\u062B \u0623\u064A \u062A\u0639\u062F\u064A\u0644 \u0641\u064A \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0623\u062F\u0648\u0627\u062A\u060C \u0623\u062E\u0628\u0631 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0646\u062C\u0627\u062D \u0627\u0644\u0639\u0645\u0644\u064A\u0629 (\u0645\u062B\u0627\u0644: "\u062A\u0645 \u0633\u062F\u0627\u062F \u0642\u0633\u0637 \u062F\u0633\u0648\u0642\u064A \u0644\u0634\u0647\u0631 \u064A\u0648\u0644\u064A\u0648 \u0628\u0646\u062C\u0627\u062D!").`,
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
                tool_delete_expense,
                tool_add_purchase,
                tool_delete_purchase
              ]
            }],
            toolConfig: { includeServerSideToolInvocations: true }
          }
        });
        const functionCalls = response.functionCalls;
        if (!functionCalls || functionCalls.length === 0) {
          return res.json({
            success: true,
            text: response.text || "\u062A\u0645 \u062A\u0646\u0641\u064A\u0630 \u0637\u0644\u0628\u0643 \u0628\u0646\u062C\u0627\u062D.",
            dataUpdated
          });
        }
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
                parts: [{ text: "\u0628\u0631\u062C\u0627\u0621 \u0627\u0644\u062A\u0648\u0642\u0641 \u0639\u0646 \u0627\u0633\u062A\u062F\u0639\u0627\u0621 \u0627\u0644\u0623\u062F\u0648\u0627\u062A \u0648\u062A\u0644\u062E\u064A\u0635 \u0627\u0644\u0631\u062F \u0627\u0644\u0646\u0647\u0627\u0626\u064A \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0645\u0628\u0627\u0634\u0631\u0629 \u0628\u0645\u0627 \u0644\u062F\u064A\u0643 \u0645\u0646 \u0645\u0639\u0644\u0648\u0645\u0627\u062A." }]
              }
            ],
            config: {
              systemInstruction: `\u0623\u0646\u062A "\u0628\u0648\u0643\u0633\u064A" \u0627\u0644\u0645\u0633\u0627\u0639\u062F \u0627\u0644\u0645\u0627\u0644\u064A \u0648\u0627\u0644\u0630\u0643\u064A. \u0644\u0627 \u062A\u0633\u062A\u062F\u0639\u064A \u0623\u064A \u0623\u062F\u0648\u0627\u062A \u0627\u0644\u0622\u0646 \u0625\u0637\u0644\u0627\u0642\u0627\u064B. \u0623\u062C\u0628 \u0639\u0644\u0649 \u0637\u0644\u0628 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0628\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629 \u0628\u0644\u0647\u062C\u062A\u0643 \u0627\u0644\u0645\u0639\u062A\u0627\u062F\u0629 \u0628\u0627\u0633\u062A\u062E\u062F\u0627\u0645 \u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062A \u0627\u0644\u0645\u062A\u0648\u0641\u0631\u0629 \u0644\u062F\u064A\u0643 \u062D\u0627\u0644\u064A\u0627\u064B.`
            }
          });
          return res.json({
            success: true,
            text: finalResponse.text || "\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628\u0643 \u0648\u0639\u0631\u0636 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 \u0628\u0646\u062C\u0627\u062D.",
            dataUpdated
          });
        }
        contents.push(response.candidates?.[0]?.content);
        const toolResponseParts = [];
        for (const call of functionCalls) {
          const { name, args, id } = call;
          let result;
          try {
            if (name === "get_current_date") {
              result = { date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) };
            } else if (name === "get_all_data") {
              result = await readData();
            } else if (name === "add_customer") {
              const currentData = await readData();
              const { name: cName, product, totalAmount, monthsCount, monthlyAmount, startDate, phone, notes, type } = args;
              const total = parseFloat(totalAmount);
              const months = parseInt(monthsCount) || 1;
              const startD = startDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
              const monthly = parseFloat(monthlyAmount) || Math.round(total / months);
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
                  amount,
                  status: "unpaid"
                });
              }
              const newId = `active_${Date.now()}`;
              const newCust = {
                id: newId,
                name: cName,
                product: product || "\u0642\u0633\u0637 \u0639\u0627\u0645",
                totalAmount: total,
                paidAmount: 0,
                remainingAmount: total,
                startDate: startD,
                monthsCount: months,
                monthlyAmount: monthly,
                phone: phone || "",
                notes: notes || "",
                type: type || "incoming",
                schedule
              };
              currentData.activeCustomers.push(newCust);
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: "\u062A\u0645 \u0625\u0636\u0627\u0641\u0629 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0646\u062C\u0627\u062D", customerId: newId };
            } else if (name === "record_payment") {
              const currentData = await readData();
              const { customerId, date, status } = args;
              const customer = currentData.activeCustomers.find((c) => c.id === customerId);
              if (customer) {
                customer.schedule = customer.schedule.map((item) => {
                  if (item.date === date) {
                    return {
                      ...item,
                      status: status || "paid",
                      paymentDate: status === "paid" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : void 0
                    };
                  }
                  return item;
                });
                const paid = customer.schedule.filter((item) => item.status === "paid").reduce((sum, item) => sum + item.amount, 0);
                customer.paidAmount = paid;
                customer.remainingAmount = Math.max(0, customer.totalAmount - paid);
                await saveData(currentData);
                dataUpdated = true;
                result = { success: true, message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0642\u0633\u0637 \u062A\u0627\u0631\u064A\u062E ${date} \u0625\u0644\u0649 ${status}` };
              } else {
                result = { success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0645\u064A\u0644" };
              }
            } else if (name === "add_quick_installment") {
              const currentData = await readData();
              const { name: qName, amount, notes, phone } = args;
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
              result = { success: true, message: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0633\u0631\u064A\u0639 \u0628\u0646\u062C\u0627\u062D", id: newId };
            } else if (name === "toggle_quick_installment_status") {
              const currentData = await readData();
              const { id: id2, status } = args;
              const qi = currentData.quickInstallments.find((q) => q.id === id2);
              if (qi) {
                qi.status = status || "paid";
                await saveData(currentData);
                dataUpdated = true;
                result = { success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0633\u0631\u064A\u0639 \u0628\u0646\u062C\u0627\u062D" };
              } else {
                result = { success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0637" };
              }
            } else if (name === "update_customer_notes") {
              const currentData = await readData();
              const { customerId, notes } = args;
              const customer = currentData.activeCustomers.find((c) => c.id === customerId);
              if (customer) {
                customer.notes = notes;
                await saveData(currentData);
                dataUpdated = true;
                result = { success: true, message: "\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u0628\u0646\u062C\u0627\u062D" };
              } else {
                result = { success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0639\u0645\u064A\u0644" };
              }
            } else if (name === "delete_customer") {
              const currentData = await readData();
              const { customerId } = args;
              const initialCount = currentData.activeCustomers.length;
              currentData.activeCustomers = currentData.activeCustomers.filter((c) => c.id !== customerId);
              if (currentData.activeCustomers.length < initialCount) {
                await saveData(currentData);
                dataUpdated = true;
                result = { success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0639\u0645\u064A\u0644 \u0628\u0646\u062C\u0627\u062D" };
              } else {
                result = { success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0639\u0645\u064A\u0644 \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0630\u0641\u0647" };
              }
            } else if (name === "add_expense") {
              const currentData = await readData();
              if (!currentData.expenses) currentData.expenses = [];
              const { title, amount, category, dueDate, status, recurring, notes } = args;
              const newId = `exp_${Date.now()}`;
              const newExpense = {
                id: newId,
                title,
                amount: parseFloat(amount),
                category: category || "other",
                dueDate,
                status: status || "unpaid",
                paymentDate: status === "paid" ? (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : void 0,
                recurring: recurring || "one-time",
                notes: notes || ""
              };
              currentData.expenses.push(newExpense);
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0628\u0646\u062C\u0627\u062D", id: newId };
            } else if (name === "pay_expense") {
              const currentData = await readData();
              if (!currentData.expenses) currentData.expenses = [];
              const { expenseId, status, paymentDate } = args;
              const expense = currentData.expenses.find((e) => e.id === expenseId);
              if (expense) {
                expense.status = status || "paid";
                expense.paymentDate = status === "paid" ? paymentDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) : void 0;
                await saveData(currentData);
                dataUpdated = true;
                result = { success: true, message: `\u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u062D\u0627\u0644\u0629 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0628\u0646\u062C\u0627\u062D \u0625\u0644\u0649 ${status}` };
              } else {
                result = { success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0647\u0630\u0627 \u0627\u0644\u0645\u0635\u0631\u0648\u0641" };
              }
            } else if (name === "delete_expense") {
              const currentData = await readData();
              if (!currentData.expenses) currentData.expenses = [];
              const { expenseId } = args;
              const initialCount = currentData.expenses.length;
              currentData.expenses = currentData.expenses.filter((e) => e.id !== expenseId);
              if (currentData.expenses.length < initialCount) {
                await saveData(currentData);
                dataUpdated = true;
                result = { success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0628\u0646\u062C\u0627\u062D" };
              } else {
                result = { success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0645\u0635\u0631\u0648\u0641 \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0630\u0641\u0647" };
              }
            } else if (name === "add_purchase") {
              const currentData = await readData();
              if (!currentData.purchases) currentData.purchases = [];
              const { itemName, category, quantity, costPrice, salePrice, purchaseDate, supplierName, notes } = args;
              const newId = `pur_${Date.now()}`;
              const qty = parseInt(quantity) || 1;
              const cost = parseFloat(costPrice) || 0;
              const newPurchase = {
                id: newId,
                itemName,
                category: category || "other",
                quantity: qty,
                costPrice: cost,
                totalCost: qty * cost,
                salePrice: salePrice ? parseFloat(salePrice) : void 0,
                purchaseDate: purchaseDate || (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
                supplierName: supplierName || "",
                notes: notes || ""
              };
              currentData.purchases.push(newPurchase);
              await saveData(currentData);
              dataUpdated = true;
              result = { success: true, message: "\u062A\u0645 \u062A\u0633\u062C\u064A\u0644 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0634\u0631\u0627\u0621 \u0648\u0625\u0636\u0627\u0641\u062A\u0647\u0627 \u0644\u0644\u0645\u062E\u0632\u0648\u0646 \u0628\u0646\u062C\u0627\u062D", id: newId };
            } else if (name === "delete_purchase") {
              const currentData = await readData();
              if (!currentData.purchases) currentData.purchases = [];
              const { purchaseId } = args;
              const initialCount = currentData.purchases.length;
              currentData.purchases = currentData.purchases.filter((p) => p.id !== purchaseId);
              if (currentData.purchases.length < initialCount) {
                await saveData(currentData);
                dataUpdated = true;
                result = { success: true, message: "\u062A\u0645 \u062D\u0630\u0641 \u0627\u0644\u0645\u0634\u062A\u0631\u064A\u0627\u062A \u0628\u0646\u062C\u0627\u062D" };
              } else {
                result = { success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0639\u0645\u0644\u064A\u0629 \u0627\u0644\u0634\u0631\u0627\u0621 \u0627\u0644\u0645\u0631\u0627\u062F \u062D\u0630\u0641\u0647\u0627" };
              }
            } else {
              result = { error: `\u0627\u0644\u0623\u062F\u0627\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645\u0629 \u062D\u0627\u0644\u064A\u0627\u064B: ${name}` };
            }
          } catch (err) {
            result = { error: err.message };
          }
          toolResponseParts.push({
            functionResponse: {
              name,
              response: result,
              id
            }
          });
        }
        contents.push({
          role: "user",
          parts: toolResponseParts
        });
      }
      res.json({
        success: true,
        text: "\u0639\u0630\u0631\u0627\u064B\u060C \u0627\u0633\u062A\u063A\u0631\u0642\u062A \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0648\u0642\u062A\u0627\u064B \u0623\u0637\u0648\u0644 \u0645\u0646 \u0627\u0644\u0645\u062A\u0648\u0642\u0639. \u064A\u0631\u062C\u0649 \u062A\u062C\u0631\u0628\u0629 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0637\u0644\u0628.",
        dataUpdated
      });
    } catch (geminiErr) {
      console.warn("Gemini execution error, falling back to local assistant:", geminiErr);
      const fallbackResult = await runLocalAssistant(messages);
      return res.json(fallbackResult);
    }
  } catch (err) {
    console.error("Gemini Chat Route Level Error:", err);
    res.status(500).json({ error: err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0637\u0644\u0628\u0643 \u0627\u0644\u0630\u0643\u064A." });
  }
});
app.get("/api/backup/export", async (req, res) => {
  try {
    const data = await readData();
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=boxstore_backup.json");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/backup/import", async (req, res) => {
  try {
    const backupData = req.body;
    if (!backupData || !backupData.activeCustomers && !backupData.quickInstallments && !backupData.moneyCircles && !backupData.invoices) {
      return res.status(400).json({ error: "\u0635\u064A\u063A\u0629 \u0645\u0644\u0641 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
    }
    const normalizedData = {
      activeCustomers: backupData.activeCustomers || [],
      quickInstallments: backupData.quickInstallments || [],
      moneyCircles: backupData.moneyCircles || [],
      invoices: backupData.invoices || [],
      expenses: backupData.expenses || [],
      purchases: backupData.purchases || [],
      lastUpdated: backupData.lastUpdated || (/* @__PURE__ */ new Date()).toISOString()
    };
    await saveData(normalizedData);
    res.json({ success: true, message: "\u062A\u0645 \u0627\u0633\u062A\u064A\u0631\u0627\u062F \u0648\u0627\u0633\u062A\u0639\u0627\u062F\u0629 \u0627\u0644\u0646\u0633\u062E\u0629 \u0627\u0644\u0627\u062D\u062A\u064A\u0627\u0637\u064A\u0629 \u0628\u0646\u062C\u0627\u062D \u0628\u0646\u0633\u0628\u0629 100%" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/installments/ical", async (req, res) => {
  try {
    const data = await readData();
    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//BoxStore//InstallmentsCalendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:\u0623\u0642\u0633\u0627\u0637 \u0628\u0648\u0643\u0633 \u0633\u062A\u0648\u0631",
      "X-WR-TIMEZONE:Africa/Cairo"
    ].join("expenses: row.expenses || [], purchases: row.purchases || []rexpenses: row.expenses || [], purchases: row.purchases || []n") + "expenses: row.expenses || [], purchases: row.purchases || []rexpenses: row.expenses || [], purchases: row.purchases || []n";
    const nowStr = (/* @__PURE__ */ new Date()).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    data.activeCustomers.forEach((cust) => {
      cust.schedule.forEach((inst, index) => {
        if (inst.status === "unpaid") {
          const dateClean = inst.date.replace(/-/g, "");
          const uid = `inst_${cust.id}_${index}_${dateClean}@boxstore.app`;
          icsContent += [
            "BEGIN:VEVENT",
            `UID:${uid}`,
            `DTSTAMP:${nowStr}`,
            `DTSTART;VALUE=DATE:${dateClean}`,
            `SUMMARY:\u0642\u0633\u0637 ${cust.name} - ${inst.amount} \u062C`,
            `DESCRIPTION:\u0642\u0633\u0637 \u0639\u0645\u064A\u0644: ${cust.name}expenses: row.expenses || [], purchases: row.purchases || []expenses: row.expenses || [], purchases: row.purchases || []n\u0627\u0644\u0645\u0646\u062A\u062C: ${cust.product}expenses: row.expenses || [], purchases: row.purchases || []expenses: row.expenses || [], purchases: row.purchases || []n\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0633\u062A\u062D\u0642: ${inst.amount} \u062C\u0646\u064A\u0647 \u0645\u0635\u0631\u064Aexpenses: row.expenses || [], purchases: row.purchases || []expenses: row.expenses || [], purchases: row.purchases || []n\u0645\u0644\u0627\u062D\u0638\u0627\u062A: ${cust.notes || "\u0644\u0627 \u064A\u0648\u062C\u062F"}`,
            "STATUS:CONFIRMED",
            "TRANSP:TRANSPARENT",
            "END:VEVENT"
          ].join("expenses: row.expenses || [], purchases: row.purchases || []rexpenses: row.expenses || [], purchases: row.purchases || []n") + "expenses: row.expenses || [], purchases: row.purchases || []rexpenses: row.expenses || [], purchases: row.purchases || []n";
        }
      });
    });
    icsContent += "END:VCALENDARexpenses: row.expenses || [], purchases: row.purchases || []rexpenses: row.expenses || [], purchases: row.purchases || []n";
    res.setHeader("Content-Type", "text/calendar; charset=utf-8");
    res.setHeader("Content-Disposition", "attachment; filename=boxstore_installments.ics");
    res.send(icsContent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/gemini/parse-iphone-note", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "\u0628\u0631\u062C\u0627\u0621 \u062A\u0648\u0641\u064A\u0631 \u0646\u0635 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0644\u062A\u062D\u0644\u064A\u0644\u0647\u0627." });
    }
    const ai = getGeminiClient();
    const prompt = `\u0623\u0646\u062A \u062E\u0628\u064A\u0631 \u0645\u0627\u0644\u064A \u0645\u062A\u062E\u0635\u0635 \u0641\u064A \u062A\u062D\u0644\u064A\u0644 \u0648\u0641\u0643 \u0646\u0635\u0648\u0635 \u0627\u0644\u062C\u062F\u0627\u0648\u0644 \u0648\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A \u063A\u064A\u0631 \u0627\u0644\u0645\u0646\u0638\u0645\u0629 \u0627\u0644\u062E\u0627\u0635\u0629 \u0628\u0623\u0642\u0633\u0627\u0637 "\u0628\u0648\u0643\u0633 \u0633\u062A\u0648\u0631".
\u0642\u0645 \u0628\u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0646\u0635 \u0627\u0644\u062A\u0627\u0644\u064A \u0627\u0644\u0645\u0633\u062A\u062E\u0631\u062C \u0645\u0646 \u062A\u0637\u0628\u064A\u0642 iCloud Notes \u0639\u0644\u0649 \u0627\u0644\u0622\u064A\u0641\u0648\u0646 \u0628\u062F\u0642\u0629 \u0634\u062F\u064A\u062F\u0629 \u0648\u0627\u0633\u062A\u062E\u0644\u0635 \u062A\u0641\u0627\u0635\u064A\u0644 \u0627\u0644\u0642\u0633\u0637:
---
${text}
---

\u062A\u0648\u062C\u064A\u0647\u0627\u062A \u0645\u0647\u0645\u0629 \u0644\u0644\u0627\u0633\u062A\u062E\u0644\u0627\u0635:
1. "\u0627\u0644\u0627\u0633\u0645" (name): \u0627\u0628\u062D\u062B \u0639\u0646 \u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644 \u0623\u0648 \u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 (\u0645\u062B\u0644: \u0625\u0628\u0631\u0627\u0647\u064A\u0645 \u0633\u0648\u0627\u062F\u0647\u060C \u062F\u0633\u0648\u0642\u064A\u060C \u0627\u0644\u062A\u0643\u064A\u064A\u0641\u060C \u0627\u0644\u062E). \u0625\u0630\u0627 \u0644\u0645 \u062A\u0643\u0646 \u0645\u062A\u0623\u0643\u062F\u0627\u064B\u060C \u0636\u0639 \u0627\u0633\u0645\u0627\u064B \u0645\u0646\u0627\u0633\u0628\u0627\u064B \u0643\u0640 "\u0639\u0645\u064A\u0644 \u0622\u064A\u0641\u0648\u0646".
2. "\u0627\u0644\u0645\u0646\u062A\u062C" (product): \u0627\u0633\u0645 \u0627\u0644\u062C\u0647\u0627\u0632 \u0623\u0648 \u0627\u0644\u0645\u0646\u062A\u062C \u0627\u0644\u0645\u0630\u0643\u0648\u0631 (\u0645\u062B\u0627\u0644: \u062A\u0643\u064A\u064A\u0641\u060C \u0622\u064A\u0641\u0648\u0646 13 \u0639\u0627\u062F\u064A\u060C \u0627\u0644\u062E).
3. "\u0625\u062C\u0645\u0627\u0644\u064A \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u0637\u0644\u0648\u0628" (totalAmount): \u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0643\u0644\u064A \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0644\u0644\u0642\u0633\u0637 \u0628\u0639\u062F \u0627\u0644\u0641\u0627\u064A\u062F\u0629 \u0623\u0648 \u0627\u0644\u0643\u0644\u064A (\u0627\u0628\u062D\u062B \u0639\u0646 \u0623\u0631\u0642\u0627\u0645 \u0645\u062B\u0644 "13500"\u060C "12500"\u060C \u0627\u0644\u062E).
4. "\u0639\u062F\u062F \u0627\u0644\u0634\u0647\u0648\u0631" (monthsCount): \u0639\u062F\u062F \u0627\u0644\u0623\u0642\u0633\u0627\u0637 \u0623\u0648 \u0627\u0644\u0634\u0647\u0648\u0631 (\u0645\u062B\u0627\u0644: "12 \u0634\u0647\u0631"\u060C "6 \u0634\u0647\u0648\u0631"\u060C \u0627\u0644\u062E).
5. "\u0645\u0628\u0644\u063A \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0634\u0647\u0631\u064A" (monthlyAmount): \u0645\u0628\u0644\u063A \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0645\u0633\u062A\u062D\u0642 \u0644\u0643\u0644 \u0634\u0647\u0631 (\u0645\u062B\u0627\u0644: "\u0643\u0644 \u0634\u0647\u0631 1100"\u060C "\u0643\u0644 \u0634\u0647\u0631 2000"\u060C \u0627\u0644\u062E).
6. "\u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0628\u062F\u0627\u064A\u0629" (startDate): \u062A\u0627\u0631\u064A\u062E \u0627\u0644\u0642\u0633\u0637 \u0627\u0644\u0623\u0648\u0644 \u0628\u0635\u064A\u063A\u0629 YYYY-MM-DD. \u0625\u0630\u0627 \u062A\u0645 \u0630\u0643\u0631 \u062A\u0627\u0631\u064A\u062E \u0645\u062B\u0644 "7/7" \u0623\u0648 "8/10"\u060C \u0627\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0633\u0646\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629 2025 \u0623\u0648 2026 \u062D\u0633\u0628 \u0627\u0644\u0633\u064A\u0627\u0642. \u0627\u0644\u064A\u0648\u0645 \u0627\u0644\u0627\u0641\u062A\u0631\u0627\u0636\u064A \u0647\u0648 2025-06-01 \u0625\u0630\u0627 \u0644\u0645 \u064A\u0630\u0643\u0631 \u062A\u0627\u0631\u064A\u062E \u0648\u0627\u0636\u062D.
7. "\u0627\u0644\u0645\u0628\u0644\u063A \u0627\u0644\u0645\u062F\u0641\u0648\u0639 \u0645\u0642\u062F\u0645\u0627\u064B" (paidAmount): \u0623\u064A \u0645\u0628\u0627\u0644\u063A \u0645\u062F\u0641\u0648\u0639\u0629 \u062A\u0645 \u0630\u0643\u0631\u0647\u0627 (\u0645\u062B\u0627\u0644: "\u062F\u0641\u0639\u062A 13500" \u0623\u0648 "\u062A\u0645 \u0633\u062F\u0627\u062F \u062F\u0641\u0639\u0629").
8. "\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A" (notes): \u0627\u0643\u062A\u0628 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0627\u0644\u0623\u0635\u0644\u064A\u0629 \u0643\u0627\u0645\u0644\u0629 \u0644\u062A\u0633\u0647\u064A\u0644 \u0627\u0644\u0631\u062C\u0648\u0639 \u0625\u0644\u064A\u0647\u0627.

\u064A\u062C\u0628 \u0623\u0646 \u062A\u0639\u064A\u062F \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0641\u064A \u0635\u064A\u063A\u0629 JSON \u0635\u0627\u0644\u062D\u0629 \u062A\u0645\u0627\u0645\u0627\u064B\u060C \u0628\u062F\u0648\u0646 \u0623\u064A \u0646\u0635\u0648\u0635 \u062A\u0645\u0647\u064A\u062F\u064A\u0629 \u0623\u0648 \u062E\u062A\u0627\u0645\u064A\u0629 (\u0641\u0642\u0637 \u0643\u0648\u062F JSON)\u060C \u0628\u0627\u0644\u0647\u064A\u0643\u0644 \u0627\u0644\u062A\u0627\u0644\u064A:
{
  "name": "\u0627\u0633\u0645 \u0627\u0644\u0639\u0645\u064A\u0644",
  "product": "\u0627\u0644\u0645\u0646\u062A\u062C",
  "totalAmount": 13500,
  "monthsCount": 12,
  "monthlyAmount": 1100,
  "startDate": "YYYY-MM-DD",
  "paidAmount": 0,
  "remainingAmount": 13500,
  "notes": "\u0627\u0644\u0646\u0635 \u0627\u0644\u0623\u0635\u0644\u064A \u0648\u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0627\u062A",
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
  } catch (err) {
    console.error("Parse Note Error:", err);
    res.status(500).json({ error: err.message || "\u0641\u0634\u0644 \u062A\u062D\u0644\u064A\u0644 \u0627\u0644\u0645\u0644\u0627\u062D\u0638\u0629 \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0630\u0643\u0627\u0621 \u0627\u0644\u0627\u0635\u0637\u0646\u0627\u0639\u064A" });
  }
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
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
var server_default = app;
export {
  server_default as default
};
//# sourceMappingURL=server.js.map
