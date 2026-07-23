/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InstallmentScheduleItem {
  date: string; // YYYY-MM-DD
  amount: number;
  status: 'paid' | 'unpaid';
  paymentDate?: string; // YYYY-MM-DD when paid
  originalAmount?: number;
}

export interface ActiveCustomer {
  id: string;
  name: string;
  product: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  startDate: string; // YYYY-MM-DD
  monthsCount: number;
  monthlyAmount: number;
  schedule: InstallmentScheduleItem[];
  phone?: string;
  notes?: string;
  type: 'incoming' | 'outgoing'; // incoming = installment to collect, outgoing = AC etc.
}

export interface QuickInstallment {
  id: string;
  name: string;
  amount: number;
  status: 'paid' | 'unpaid';
  notes?: string;
  phone?: string;
}

export interface MoneyCircle {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
  monthsCount: number;
  startDate: string; // YYYY-MM-DD
  collectedMonth?: string; // Month they are scheduled to get paid
  schedule: {
    date: string;
    paid: boolean;
    amount: number;
    datePaid?: string;
  }[];
  status: 'active' | 'completed';
  notes?: string;
}

export interface Invoice {
  id: string; // e.g. "947"
  date: string; // YYYY-MM-DD
  clientName: string;
  itemName: string;
  serialNumber?: string;
  amount: number;
  storeName: string;
  address?: string;
  status: 'paid' | 'pending';
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'rent' | 'internet' | 'electricity' | 'salary' | 'maintenance' | 'other';
  dueDate: string;
  status: 'paid' | 'unpaid';
  paymentDate?: string;
  recurring: 'one-time' | 'monthly' | 'yearly';
  notes?: string;
}

export interface Purchase {
  id: string;
  itemName: string;
  category: 'iphone' | 'accessory' | 'charger' | 'screen' | 'other';
  quantity: number;
  costPrice: number;
  totalCost: number;
  salePrice?: number;
  purchaseDate: string; // YYYY-MM-DD
  supplierName?: string;
  notes?: string;
}

export interface InstallmentData {
  activeCustomers: ActiveCustomer[];
  quickInstallments: QuickInstallment[];
  moneyCircles: MoneyCircle[];
  invoices: Invoice[];
  expenses: Expense[];
  purchases: Purchase[];
  lastUpdated: string;
}
