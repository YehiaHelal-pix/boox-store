import React, { useState, useEffect } from "react";
import { 
  Plus, 
  Trash2, 
  Printer, 
  RotateCw, 
  Search, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  FileText, 
  Calendar, 
  TrendingUp, 
  TrendingDown,
  User, 
  Phone, 
  MapPin, 
  CreditCard, 
  ArrowLeftRight, 
  FileSpreadsheet, 
  X,
  Check,
  ShieldCheck,
  Building,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Pencil,
  Bell,
  MessageSquare,
  Smartphone,
  Sparkles,
  Download,
  Moon,
  Sun,
  Paperclip,
  Image
} from "lucide-react";
import { initAuth, googleSignIn, logout, getAccessToken } from "./firebase";
import { InstallmentData, ActiveCustomer, QuickInstallment, MoneyCircle, Invoice, InstallmentScheduleItem, Expense } from "./types";

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Authentication states
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Data states
  const [data, setData] = useState<InstallmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ url: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Filter/Search states
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState<'active' | 'quick' | 'circles' | 'invoices' | 'expenses' | 'purchases' | 'reports'>('active');
  const [selectedCustomer, setSelectedCustomer] = useState<ActiveCustomer | null>(null);
  const [invoiceToPrint, setInvoiceToPrint] = useState<Invoice | null>(null);
  const [receiptToPrint, setReceiptToPrint] = useState<{ customer: ActiveCustomer; installment: InstallmentScheduleItem } | null>(null);

  // Expense filter states
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<'all' | 'paid' | 'unpaid'>('all');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<'all' | 'rent' | 'internet' | 'electricity' | 'salary' | 'maintenance' | 'other'>('all');

  // Custom Toast & Confirm Dialog State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{ message: string; onConfirm: () => void } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Form states (Add New Modal)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addType, setAddType] = useState<'active' | 'quick' | 'circle' | 'invoice' | 'expense'>('active');
  
  // Active Customer Form Fields
  const [cName, setCName] = useState("");
  const [cProduct, setCProduct] = useState("");
  const [cTotal, setCTotal] = useState("");
  const [cPaid, setCPaid] = useState("");
  const [cMonths, setCMonths] = useState("6");
  const [cMonthly, setCMonthly] = useState("");
  const [cPhone, setCPhone] = useState("");
  const [cNotes, setCNotes] = useState("");
  const [cType, setCType] = useState<'incoming' | 'outgoing'>('incoming');
  const [cStartDate, setCStartDate] = useState("2026-07-21");

  // Quick Installment Fields
  const [qName, setQName] = useState("");
  const [qAmount, setQAmount] = useState("");
  const [qNotes, setQNotes] = useState("");
  const [qPhone, setQPhone] = useState("");

  // Money Circle Fields
  const [circleName, setCircleName] = useState("");
  const [circleTotal, setCircleTotal] = useState("");
  const [circleMonths, setCircleMonths] = useState("1");
  const [circleMonthly, setCircleMonthly] = useState("");
  const [circleStart, setCircleStart] = useState("2026-07-21");
  const [circleNotes, setCircleNotes] = useState("");

  // Invoice Fields
  const [invId, setInvId] = useState("");
  const [invClient, setInvClient] = useState("");
  const [invItem, setInvItem] = useState("");
  const [invSerial, setInvSerial] = useState("");
  const [invAmount, setInvAmount] = useState("");
  const [invStore, setInvStore] = useState("بوكس ستور (Box Store)");
  const [invAddress, setInvAddress] = useState("9 ش ترعه السواحل / الوراق، الجيزة");
  const [invDate, setInvDate] = useState("2026-07-21");

  // Expense Fields
  const [expTitle, setExpTitle] = useState("");
  const [expAmount, setExpAmount] = useState("");
  const [expCategory, setExpCategory] = useState<'rent' | 'internet' | 'electricity' | 'salary' | 'maintenance' | 'other'>('other');
  const [expDueDate, setExpDueDate] = useState(new Date().toISOString().slice(0, 10));
  const [expStatus, setExpStatus] = useState<'paid' | 'unpaid'>('unpaid');
  const [expRecurring, setExpRecurring] = useState<'one-time' | 'monthly' | 'yearly'>('monthly');
  const [expNotes, setExpNotes] = useState("");

  // Edit Active Customer States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editCustomerId, setEditCustomerId] = useState("");
  const [editCustomerName, setEditCustomerName] = useState("");
  const [editCustomerProduct, setEditCustomerProduct] = useState("");
  const [editCustomerPhone, setEditCustomerPhone] = useState("");
  const [editCustomerNotes, setEditCustomerNotes] = useState("");
  const [editCustomerType, setEditCustomerType] = useState<'incoming' | 'outgoing'>('incoming');
  const [editCustomerSchedule, setEditCustomerSchedule] = useState<InstallmentScheduleItem[]>([]);

  // WhatsApp Automation States
  const [gatewayType, setGatewayType] = useState<'browser' | 'ultramsg' | 'whapi' | 'greenapi'>('greenapi');
  const [instanceId, setInstanceId] = useState("7107663251");
  const [authToken, setAuthToken] = useState("baa8297f1c34472cad34a24d2745fcd885f882e61011406881");
  const [myNumber, setMyNumber] = useState("01113614021");
  const [isAutomationConfigOpen, setIsAutomationConfigOpen] = useState(false);
  const [automationStatus, setAutomationStatus] = useState<{[key: string]: 'idle' | 'sending' | 'success' | string}>({});
  const [isCampaignRunning, setIsCampaignRunning] = useState(false);
  const [campaignProgress, setCampaignProgress] = useState({ current: 0, total: 0 });
  const [isQuickCampaignRunning, setIsQuickCampaignRunning] = useState(false);
  const [quickCampaignProgress, setQuickCampaignProgress] = useState({ current: 0, total: 0 });
  const [quickAutomationStatus, setQuickAutomationStatus] = useState<{[key: string]: 'idle' | 'sending' | 'success' | string}>({});

  const handleSaveAutomationConfig = (gt: 'browser' | 'ultramsg' | 'whapi' | 'greenapi', inst: string, tok: string, num: string) => {
    localStorage.setItem("whatsapp_automation_config", JSON.stringify({
      gatewayType: gt,
      instanceId: inst,
      token: tok,
      myNumber: num
    }));
    setGatewayType(gt);
    setInstanceId(inst);
    setAuthToken(tok);
    setMyNumber(num);
    showToast("تم حفظ إعدادات الأتمتة والتشغيل الآلي بنجاح! ⚙️", "success");
    setIsAutomationConfigOpen(false);
  };

  // --- AI ASSISTANT CHATBOT STATES ---
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: string;
    attachments?: Array<{ name: string; type: string; base64: string }>;
  }>>([
    {
      id: 'welcome',
      role: 'model',
      text: "أهلاً بك يا غالي! أنا مساعدك الذكي \"بوكسي\" 🤖. يمكنني مساعدتك في معرفة الأقساط المستحقة، إضافة عملاء جدد، تسجيل عمليات الدفع، وتعديل أي بيانات بالأوامر الصوتية أو الكتابية. جرب تضغط على زر الميكروفون وتكلم! يمكنك أيضاً إرفاق صور للفواتير، كشوفات مديونية، أو أي مستند مالي وسأقوم بتحليله وتحديث البيانات فوراً! 📸📁",
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatAttachments, setChatAttachments] = useState<Array<{ name: string; type: string; base64: string }>>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleChatFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file: any) => {
      if (file.size > 5 * 1024 * 1024) {
        showToast(`الملف ${file.name} حجمه كبير جداً (أقصى حد هو 5 ميجابايت).`, "error");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setChatAttachments(prev => [
          ...prev,
          {
            name: file.name,
            type: file.type || "application/octet-stream",
            base64: base64String
          }
        ]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  };

  const removeChatAttachment = (index: number) => {
    setChatAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Speech Recognition API setup
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.lang = 'ar-EG';
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        showToast(`تم التعرف: "${transcript}"`, "info");
      };

      rec.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
        showToast("فشل في التقاط الصوت، جرب المحاولة مرة أخرى.", "error");
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, []);

  const startListening = () => {
    if (!recognition) {
      showToast("عذراً، متصفحك لا يدعم الإدخال الصوتي بالكامل. جرب متصفح Google Chrome.", "error");
      return;
    }
    try {
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const sendChatMessage = async (textToSend?: string) => {
    const text = textToSend || chatInput;
    if (!text.trim() && chatAttachments.length === 0) return;

    const userMsgId = `user_${Date.now()}`;
    const newUserMessage = {
      id: userMsgId,
      role: "user" as const,
      text: text || `[أرفق ${chatAttachments.length} ملف/ملفات]`,
      attachments: [...chatAttachments],
      timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newUserMessage]);
    setChatInput("");
    setChatAttachments([]); // Clear attachments
    setChatLoading(true);

    setTimeout(() => {
      const thread = document.getElementById("chat-thread");
      if (thread) thread.scrollTop = thread.scrollHeight;
    }, 50);

    try {
      const history = [...chatMessages, newUserMessage].map(msg => {
        const parts: any[] = [];
        if (msg.text) {
          parts.push({ text: msg.text });
        }
        if (msg.role === "user" && msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach(att => {
            parts.push({
              inlineData: {
                mimeType: att.type,
                data: att.base64
              }
            });
          });
        }
        return {
          role: msg.role === "user" ? "user" : "model",
          parts: parts
        };
      });

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history })
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل الاتصال بمساعد الذكاء الاصطناعي");
      }

      const result = await res.json();
      
      setChatMessages(prev => [...prev, {
        id: `boxy_${Date.now()}`,
        role: "model" as const,
        text: result.text,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);

      if (result.dataUpdated) {
        showToast("تم تحديث البيانات تلقائياً بواسطة مساعدك الذكي! 🔄", "success");
        await fetchLocalData();
      }

    } catch (err: any) {
      console.error("Chat error:", err);
      setChatMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: "model" as const,
        text: `حدث خطأ: ${err.message || "فشلت العملية"}. برجاء التأكد من توصيل مفتاح Gemini API.`,
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setChatLoading(false);
      setTimeout(() => {
        const thread = document.getElementById("chat-thread");
        if (thread) thread.scrollTop = thread.scrollHeight;
      }, 50);
    }
  };

  // --- BACKUP & CSV EXPORT STATES & HANDLERS ---
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isImportingBackup, setIsImportingBackup] = useState(false);

  const downloadCSV = (filename: string, headers: string[], rows: string[][]) => {
    try {
      const csvContent = "\uFEFF" + [
        headers.join(","),
        ...rows.map(row => row.map(cell => {
          const str = cell === null || cell === undefined ? "" : String(cell);
          const escaped = str.replace(/"/g, '""');
          return `"${escaped}"`;
        }).join(","))
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("تم تصدير ملف Excel (CSV) بنجاح! 📊", "success");
    } catch (err: any) {
      showToast("حدث خطأ أثناء تصدير ملف CSV", "error");
    }
  };

  const handleExportBackupJSON = async () => {
    try {
      const response = await fetch("/api/backup/export");
      if (!response.ok) throw new Error("فشل الاتصال بالسيرفر");
      const backupData = await response.json();
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `boxstore_backup_${new Date().toISOString().slice(0, 10)}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("تم تحميل ملف النسخة الاحتياطية بنجاح! 💾 Keep it safe.", "success");
    } catch (err: any) {
      // Fallback to local state if server fails or offline
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `boxstore_backup_local_${new Date().toISOString().slice(0, 10)}.json`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast("تم تحميل النسخة الاحتياطية المحلية بنجاح! 💾", "success");
    }
  };

  const handleImportBackupJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImportingBackup(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.activeCustomers && !parsed.quickInstallments && !parsed.moneyCircles && !parsed.invoices) {
          throw new Error("تنسيق ملف غير صالح. لا يحتوي على بيانات النظام الأساسية.");
        }

        const response = await fetch("/api/backup/import", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(parsed)
        });

        if (!response.ok) {
          const errRes = await response.json();
          throw new Error(errRes.error || "فشل التحديث في السيرفر");
        }

        setData(parsed);
        showToast("تهانينا! تم استعادة النسخة الاحتياطية وتحديث النظام بنسبة 100% 🎉", "success");
        setIsBackupModalOpen(false);
      } catch (err: any) {
        showToast(`فشل استيراد الملف: ${err.message}`, "error");
      } finally {
        setIsImportingBackup(false);
        e.target.value = ""; // Reset file input
      }
    };
    reader.readAsText(file);
  };

  // --- IPHONE SYNC STATES & HANDLERS ---
  const [isIphoneModalOpen, setIsIphoneModalOpen] = useState(false);
  const [iphoneNoteText, setIphoneNoteText] = useState("");
  const [isParsingNote, setIsParsingNote] = useState(false);
  const [parsedNoteResult, setParsedNoteResult] = useState<{
    name: string;
    product: string;
    totalAmount: number;
    monthsCount: number;
    monthlyAmount: number;
    startDate: string;
    paidAmount: number;
    remainingAmount: number;
    notes: string;
    type: 'incoming';
  } | null>(null);

  const handleParseIphoneNote = async () => {
    if (!iphoneNoteText.trim()) {
      showToast("برجاء إدخال نص الملاحظة أولاً!", "error");
      return;
    }
    setIsParsingNote(true);
    setParsedNoteResult(null);
    try {
      const res = await fetch("/api/gemini/parse-iphone-note", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: iphoneNoteText })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشل تحليل الملاحظة");
      }
      const data = await res.json();
      if (data.success && data.data) {
        setParsedNoteResult(data.data);
        showToast("تم تحليل نص الملاحظة بنجاح بواسطة الذكاء الاصطناعي! 🤖✨", "success");
      } else {
        throw new Error("لم يتم استخلاص أي بيانات صالحة.");
      }
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "حدث خطأ أثناء تحليل الملاحظة", "error");
    } finally {
      setIsParsingNote(false);
    }
  };

  const handleImportParsedNote = async () => {
    if (!parsedNoteResult || !data) return;
    try {
      const months = Number(parsedNoteResult.monthsCount) || 1;
      const total = Number(parsedNoteResult.totalAmount) || 0;
      const monthly = Number(parsedNoteResult.monthlyAmount) || Math.round(total / months);
      const startD = parsedNoteResult.startDate || new Date().toISOString().slice(0, 10);
      const paid = Number(parsedNoteResult.paidAmount) || 0;
      const remaining = Math.max(0, total - paid);
      
      const schedule: InstallmentScheduleItem[] = [];
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

        const isPaid = paid >= (j + 1) * monthly;

        schedule.push({
          date: dateStr,
          amount: amount,
          status: (isPaid ? 'paid' : 'unpaid') as 'paid' | 'unpaid',
          paymentDate: isPaid ? new Date().toISOString().slice(0, 10) : undefined
        });
      }

      const newId = `active_${Date.now()}`;
      const newCust: ActiveCustomer = {
        id: newId,
        name: parsedNoteResult.name,
        product: parsedNoteResult.product || "قسط عام",
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        startDate: startD,
        monthsCount: months,
        monthlyAmount: monthly,
        phone: "",
        notes: parsedNoteResult.notes || "مستورد من الآيفون",
        type: "incoming",
        schedule: schedule
      };

      const updatedData = {
        ...data,
        activeCustomers: [newCust, ...data.activeCustomers]
      };

      await saveAllData(updatedData);
      showToast(`تم استيراد قسط العميل "${parsedNoteResult.name}" بنجاح! 🎉`, "success");
      setIsIphoneModalOpen(false);
      setIphoneNoteText("");
      setParsedNoteResult(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "فشل استيراد القسط المفسر", "error");
    }
  };

  const openEditCustomerModal = (customer: ActiveCustomer) => {
    setEditCustomerId(customer.id);
    setEditCustomerName(customer.name);
    setEditCustomerProduct(customer.product);
    setEditCustomerPhone(customer.phone || "");
    setEditCustomerNotes(customer.notes || "");
    setEditCustomerType(customer.type || "incoming");
    setEditCustomerSchedule(JSON.parse(JSON.stringify(customer.schedule))); // deep copy
    setIsEditModalOpen(true);
  };

  const handleAddEditInstallmentRow = () => {
    // Generate next date if possible, otherwise use today
    let nextDate = new Date().toISOString().slice(0, 10);
    if (editCustomerSchedule.length > 0) {
      const lastDateStr = editCustomerSchedule[editCustomerSchedule.length - 1].date;
      const lastDate = new Date(lastDateStr);
      if (!isNaN(lastDate.getTime())) {
        lastDate.setMonth(lastDate.getMonth() + 1);
        nextDate = lastDate.toISOString().slice(0, 10);
      }
    }
    
    // Default amount can be the last amount or a default 1000
    const lastAmount = editCustomerSchedule.length > 0 ? editCustomerSchedule[editCustomerSchedule.length - 1].amount : 1000;

    setEditCustomerSchedule([
      ...editCustomerSchedule,
      {
        date: nextDate,
        amount: lastAmount,
        status: 'unpaid'
      }
    ]);
  };

  const handleUpdateEditScheduleRow = (index: number, field: keyof InstallmentScheduleItem, value: any) => {
    const updated = editCustomerSchedule.map((item, idx) => {
      if (idx !== index) return item;
      const newItem = { ...item, [field]: value };
      if (field === 'status') {
        newItem.paymentDate = value === 'paid' ? new Date().toISOString().slice(0, 10) : undefined;
      }
      return newItem;
    });
    setEditCustomerSchedule(updated);
  };

  const handleRemoveEditScheduleRow = (index: number) => {
    const updated = editCustomerSchedule.filter((_, idx) => idx !== index);
    setEditCustomerSchedule(updated);
  };

  const handlePayAllRemainingInEdit = () => {
    const updated = editCustomerSchedule.map(item => ({
      ...item,
      status: 'paid' as const,
      paymentDate: item.status === 'unpaid' ? new Date().toISOString().slice(0, 10) : item.paymentDate
    }));
    setEditCustomerSchedule(updated);
    showToast("تم تحديد جميع الأقساط كمدفوعة", "info");
  };

  const handleSaveCustomerEdit = () => {
    if (!data) return;
    if (!editCustomerName.trim()) {
      showToast("اسم العميل مطلوب", "error");
      return;
    }
    
    // Recalculate amounts
    const total = editCustomerSchedule.reduce((sum, item) => sum + Number(item.amount), 0);
    const paid = editCustomerSchedule
      .filter(item => item.status === 'paid')
      .reduce((sum, item) => sum + Number(item.amount), 0);
    const remaining = Math.max(0, total - paid);
    
    const updatedCustomers = (data.activeCustomers || []).map(c => {
      if (c.id !== editCustomerId) return c;
      return {
        ...c,
        name: editCustomerName,
        product: editCustomerProduct,
        phone: editCustomerPhone,
        notes: editCustomerNotes,
        type: editCustomerType,
        schedule: editCustomerSchedule.map(item => ({
          ...item,
          amount: Number(item.amount)
        })),
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: remaining,
        monthsCount: editCustomerSchedule.length
      };
    });
    
    const updatedData = {
      ...data,
      activeCustomers: updatedCustomers
    };
    
    saveAllData(updatedData);
    setIsEditModalOpen(false);
    
    // Also update selectedCustomer details view if open
    if (selectedCustomer && selectedCustomer.id === editCustomerId) {
      const updatedSelect = updatedCustomers.find(c => c.id === editCustomerId);
      if (updatedSelect) setSelectedCustomer(updatedSelect);
    }
    
    showToast("تم تحديث بيانات العميل والأقساط بنجاح! 💾", "success");
  };

  // Load data from backend on mount
  const fetchLocalData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/installments");
      if (!res.ok) throw new Error("فشل تحميل البيانات من السيرفر");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("خطأ في الاتصال بالسيرفر، جاري استخدام بيانات محلية احتياطية");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocalData();
    
    // Load automation config from localStorage
    const saved = localStorage.getItem("whatsapp_automation_config");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.gatewayType) setGatewayType(parsed.gatewayType);
        if (parsed.instanceId) setInstanceId(parsed.instanceId);
        if (parsed.token) setAuthToken(parsed.token);
        if (parsed.myNumber) setMyNumber(parsed.myNumber);
      } catch (e) {
        console.error("Error loading automation config", e);
      }
    } else {
      localStorage.setItem("whatsapp_automation_config", JSON.stringify({
        gatewayType: "greenapi",
        instanceId: "7107663251",
        token: "baa8297f1c34472cad34a24d2745fcd885f882e61011406881",
        myNumber: "01113614021"
      }));
    }

    // Initialize Google OAuth State Listener
    initAuth(
      (user, token) => {
        setUser(user);
        setToken(token);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setToken(null);
        setNeedsAuth(true);
      }
    );
  }, []);

  // Save all data to backend
  const saveAllData = async (newData: InstallmentData) => {
    try {
      const res = await fetch("/api/installments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newData)
      });
      if (!res.ok) throw new Error("فشل حفظ التعديلات");
      setData(newData);
    } catch (err: any) {
      console.error(err);
      showToast("حدث خطأ أثناء حفظ التعديلات على السيرفر", "error");
    }
  };

  // Google Sign-In handler
  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error("Google login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Logout handler
  const handleLogout = async () => {
    await logout();
    setUser(null);
    setToken(null);
    setNeedsAuth(true);
    setSyncResult(null);
  };

  // Google Sheets Synchronization
  const handleSyncSheets = async () => {
    if (!token) {
      showToast("برجاء تسجيل الدخول بحساب Google للمزامنة", "info");
      return;
    }
    setSyncing(true);
    try {
      const res = await fetch("/api/sync/sheets", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "فشلت المزامنة مع Google Sheets");
      }
      const result = await res.json();
      setSyncResult({ url: result.url, id: result.spreadsheetId });
      showToast("تمت المزامنة بنجاح وإنشاء/تحديث جدول البيانات على Google Drive الخاص بك! 🎉", "success");
    } catch (err: any) {
      console.error(err);
      showToast(`فشلت المزامنة: ${err.message}`, "error");
    } finally {
      setSyncing(false);
    }
  };

  // Toggle individual installment payment status
  const handleToggleInstallment = (customerId: string, installmentDate: string) => {
    if (!data) return;
    
    const updatedCustomers = (data.activeCustomers || []).map(customer => {
      if (customer.id !== customerId) return customer;
      
      let updatedSchedule = customer.schedule.map(item => {
        if (item.date !== installmentDate) return item;
        const newStatus: "paid" | "unpaid" = item.status === "paid" ? "unpaid" : "paid";
        return {
          ...item,
          status: newStatus,
          paymentDate: newStatus === "paid" ? new Date().toISOString().slice(0, 10) : undefined
        };
      });

      // Recalculate total paid & remaining amount
      const paidTotal = updatedSchedule
        .filter(item => item.status === "paid")
        .reduce((sum, item) => sum + item.amount, 0);

      // Include initial down-payment if it was recorded separate
      const remainingTotal = Math.max(0, customer.totalAmount - paidTotal);

      return {
        ...customer,
        schedule: updatedSchedule,
        paidAmount: paidTotal,
        remainingAmount: remainingTotal
      };
    });

    const updatedData = {
      ...data,
      activeCustomers: updatedCustomers
    };
    
    saveAllData(updatedData);
    
    // Update active details view if currently showing
    if (selectedCustomer && selectedCustomer.id === customerId) {
      const updatedSelect = updatedCustomers.find(c => c.id === customerId);
      if (updatedSelect) setSelectedCustomer(updatedSelect);
    }
  };

  // Toggle quick installment list status
  const handleToggleQuickInstallment = (id: string) => {
    if (!data) return;
    const updatedQuick = (data.quickInstallments || []).map(q => {
      if (q.id !== id) return q;
      return { ...q, status: q.status === "paid" ? "unpaid" : "paid" as 'paid' | 'unpaid' };
    });
    const updatedData = { ...data, quickInstallments: updatedQuick };
    saveAllData(updatedData);
  };

  // Create customized schedule generator
  const generateSchedule = (startDate: string, months: number, monthlyAmt: number, totalAmt: number): InstallmentScheduleItem[] => {
    const schedule: InstallmentScheduleItem[] = [];
    const baseDate = new Date(startDate);
    
    for (let i = 0; i < months; i++) {
      const current = new Date(baseDate);
      current.setMonth(baseDate.getMonth() + i);
      const dateStr = current.toISOString().slice(0, 10);
      
      // Handle potential final month discrepancy
      let amount = monthlyAmt;
      if (i === months - 1) {
        const precedingTotal = monthlyAmt * (months - 1);
        if (precedingTotal + monthlyAmt !== totalAmt) {
          amount = totalAmt - precedingTotal;
        }
      }

      schedule.push({
        date: dateStr,
        amount: amount,
        status: 'unpaid'
      });
    }
    return schedule;
  };

  // Create new Client / Installment Record
  const handleCreateRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!data) return;

    const idPrefix = addType === 'active' ? 'active_' : addType === 'quick' ? 'quick_' : addType === 'circle' ? 'circle_' : addType === 'expense' ? 'exp_' : 'inv_';
    const newId = `${idPrefix}${Date.now()}`;

    let updatedData = { ...data };

    if (addType === 'active') {
      const total = parseFloat(cTotal);
      const paid = parseFloat(cPaid) || 0;
      const months = parseInt(cMonths);
      const monthly = parseFloat(cMonthly) || Math.round((total - paid) / months);

      const generatedSched = generateSchedule(cStartDate, months, monthly, total);
      // If down-payment was paid, we inject it as first item or log it
      if (paid > 0) {
        generatedSched.unshift({
          date: cStartDate,
          amount: paid,
          status: 'paid',
          paymentDate: cStartDate
        });
      }

      const newCust: ActiveCustomer = {
        id: newId,
        name: cName,
        product: cProduct || "قسط عام",
        totalAmount: total,
        paidAmount: paid,
        remainingAmount: total - paid,
        startDate: cStartDate,
        monthsCount: months,
        monthlyAmount: monthly,
        phone: cPhone,
        notes: cNotes,
        type: cType,
        schedule: generatedSched
      };

      updatedData.activeCustomers.push(newCust);
    } 
    else if (addType === 'quick') {
      const newQuick: QuickInstallment = {
        id: newId,
        name: qName,
        amount: parseFloat(qAmount),
        status: 'unpaid',
        notes: qNotes,
        phone: qPhone
      };
      updatedData.quickInstallments.push(newQuick);
    } 
    else if (addType === 'circle') {
      const total = parseFloat(circleTotal);
      const months = parseInt(circleMonths);
      const payment = parseFloat(circleMonthly) || total;

      const newCircle: MoneyCircle = {
        id: newId,
        name: circleName,
        totalAmount: total,
        monthlyPayment: payment,
        monthsCount: months,
        startDate: circleStart,
        status: 'active',
        notes: circleNotes,
        schedule: [
          { date: circleStart, paid: false, amount: payment }
        ]
      };
      updatedData.moneyCircles.push(newCircle);
    } 
    else if (addType === 'invoice') {
      const newInv: Invoice = {
        id: invId || `inv_${Math.floor(Math.random() * 1000)}`,
        date: invDate,
        clientName: invClient,
        itemName: invItem,
        serialNumber: invSerial,
        amount: parseFloat(invAmount),
        storeName: invStore,
        address: invAddress,
        status: 'paid'
      };
      updatedData.invoices.push(newInv);
    }
    else if (addType === 'expense') {
      const newExpense: Expense = {
        id: newId,
        title: expTitle,
        amount: parseFloat(expAmount),
        category: expCategory,
        dueDate: expDueDate,
        status: expStatus,
        recurring: expRecurring,
        notes: expNotes,
        paymentDate: expStatus === 'paid' ? expDueDate : undefined
      };
      if (!updatedData.expenses) {
        updatedData.expenses = [];
      }
      updatedData.expenses.push(newExpense);
    }

    saveAllData(updatedData);
    setIsAddModalOpen(false);
    resetFormFields();
    showToast("تم إضافة السجل بنجاح! 💾", "success");
  };

  const resetFormFields = () => {
    setCName(""); setCProduct(""); setCTotal(""); setCPaid(""); setCMonthly(""); setCPhone(""); setCNotes("");
    setQName(""); setQAmount(""); setQNotes(""); setQPhone("");
    setCircleName(""); setCircleTotal(""); setCircleMonthly(""); setCircleNotes("");
    setInvId(""); setInvClient(""); setInvItem(""); setInvSerial(""); setInvAmount("");
    setExpTitle(""); setExpAmount(""); setExpCategory("other"); setExpDueDate(new Date().toISOString().slice(0, 10)); setExpStatus("unpaid"); setExpRecurring("monthly"); setExpNotes("");
  };

  const askConfirmation = (message: string, onConfirm: () => void) => {
    setConfirmConfig({ message, onConfirm });
  };

  // Delete customer / installment record
  const handleDeleteCustomer = (customerId: string) => {
    if (!data) return;
    askConfirmation("هل أنت متأكد من حذف هذا العميل وسجل أقساطه بالكامل؟", () => {
      const updatedCustomers = (data.activeCustomers || []).filter(c => c.id !== customerId);
      const updatedData = { ...data, activeCustomers: updatedCustomers };
      saveAllData(updatedData);
      setSelectedCustomer(null);
      showToast("تم حذف العميل بنجاح", "info");
    });
  };

  const handleDeleteQuick = (id: string) => {
    if (!data) return;
    askConfirmation("هل تريد حذف هذا السجل السريع؟", () => {
      const updatedQuick = (data.quickInstallments || []).filter(q => q.id !== id);
      saveAllData({ ...data, quickInstallments: updatedQuick });
      showToast("تم حذف السجل بنجاح", "info");
    });
  };

  const handleDeleteCircle = (id: string) => {
    if (!data) return;
    askConfirmation("هل تريد حذف هذه الجمعية؟", () => {
      const updatedCircles = (data.moneyCircles || []).filter(c => c.id !== id);
      saveAllData({ ...data, moneyCircles: updatedCircles });
      showToast("تم حذف الجمعية بنجاح", "info");
    });
  };

  const handleDeleteInvoice = (id: string) => {
    if (!data) return;
    askConfirmation("هل تريد حذف هذه الفاتورة؟", () => {
      const updatedInvoices = (data.invoices || []).filter(i => i.id !== id);
      saveAllData({ ...data, invoices: updatedInvoices });
      showToast("تم حذف الفاتورة بنجاح", "info");
    });
  };

  const handleDeleteExpense = (id: string) => {
    if (!data) return;
    askConfirmation("هل تريد حذف هذا المصروف نهائياً؟", () => {
      const updatedExpenses = (data.expenses || []).filter(e => e.id !== id);
      saveAllData({ ...data, expenses: updatedExpenses });
      showToast("تم حذف المصروف بنجاح", "info");
    });
  };

  const handleDeletePurchase = (id: string) => {
    if (!data) return;
    askConfirmation("هل تريد حذف هذا السجل من المشتريات نهائياً؟", () => {
      const updatedPurchases = (data.purchases || []).filter(p => p.id !== id);
      saveAllData({ ...data, purchases: updatedPurchases });
      showToast("تم حذف البضاعة/المشتريات بنجاح", "info");
    });
  };

  const handleToggleExpenseStatus = (id: string) => {
    if (!data) return;
    const updatedExpenses = (data.expenses || []).map(e => {
      if (e.id !== id) return e;
      const newStatus: 'paid' | 'unpaid' = e.status === 'paid' ? 'unpaid' : 'paid';
      return {
        ...e,
        status: newStatus,
        paymentDate: newStatus === 'paid' ? new Date().toISOString().slice(0, 10) : undefined
      };
    });
    saveAllData({ ...data, expenses: updatedExpenses });
    showToast("تم تحديث حالة المصروف بنجاح", "success");
  };

  // PRINTING HELPERS
  const triggerPrintReceipt = (customer: ActiveCustomer, installment: InstallmentScheduleItem) => {
    setReceiptToPrint({ customer, installment });
    setTimeout(() => {
      window.print();
    }, 300);
  };

  const triggerPrintInvoice = (invoice: Invoice) => {
    setInvoiceToPrint(invoice);
    setTimeout(() => {
      window.print();
    }, 300);
  };

  // EXPORT SINGLE CUSTOMER TO FILE (.txt Format)
  const exportCustomerAccountToFile = (customer: ActiveCustomer) => {
    const title = `كشف حساب العميل: ${customer.name}\n`;
    const separator = `==================================================\n`;
    const info = [
      `المنتج / البيان: ${customer.product || "غير محدد"}`,
      `رقم الهاتف: ${customer.phone || "غير مسجل"}`,
      `تاريخ البدء: ${customer.startDate || "غير محدد"}`,
      `إجمالي المبلغ الكلي بعد الفائدة: ${customer.totalAmount.toLocaleString()} ج.م.`,
      `المدفوع حالياً: ${customer.paidAmount.toLocaleString()} ج.م.`,
      `المبلغ المتبقي: ${customer.remainingAmount.toLocaleString()} ج.م.`,
      `عدد شهور الأقساط: ${customer.monthsCount} أشهر`,
      `قيمة القسط الشهري: ${customer.monthlyAmount.toLocaleString()} ج.م.`,
      `ملاحظات الحساب: ${customer.notes || "لا يوجد"}`
    ].join("\n") + "\n";

    const scheduleHeader = `\nجدول الأقساط الشهرية وتواريخ السداد:\n` + separator;
    const scheduleRows = customer.schedule.map((item, idx) => {
      return `${idx + 1}. تاريخ الاستحقاق: ${item.date} | القيمة: ${item.amount.toLocaleString()} ج.م. | الحالة: ${item.status === 'paid' ? 'مدفوع ✅' : 'غير مدفوع ❌'}${item.paymentDate ? ' (تم تحصيله بتاريخ: ' + item.paymentDate + ')' : ''}`;
    }).join("\n");

    const fullText = title + separator + info + scheduleHeader + scheduleRows + `\n\n${separator}تم التصدير تلقائياً من برنامج إدارة الأقساط لـ بوكس ستور (Box Store).`;

    const blob = new Blob(["\uFEFF" + fullText], { type: "text/plain;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `كشف_حساب_${customer.name}.txt`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`تم تصدير كشف حساب العميل ${customer.name} كملف بنجاح! 📄`, "success");
  };

  // Calculations for dashboard
  const getTotals = () => {
    if (!data) return { 
      totalIncoming: 0, 
      collectedThisMonth: 0, 
      pendingThisMonth: 0, 
      outgoingTotal: 0, 
      totalExpensesAndPurchases: 0,
      quickPendingTotal: 0,
      collectionRate: 0,
      currentMonthLabel: "الحالي" 
    };

    // 1. Detailed incoming remaining + quick unpaid
    const detailedIncoming = (data.activeCustomers || [])
      .filter(c => c.type === 'incoming')
      .reduce((sum, c) => sum + (c.remainingAmount || 0), 0);

    const quickPendingTotal = (data.quickInstallments || [])
      .filter(q => q.status === 'unpaid')
      .reduce((sum, q) => sum + (q.amount || 0), 0);

    const totalIncoming = detailedIncoming + quickPendingTotal;

    // 2. Outgoing commitments (obligations to suppliers/others)
    const outgoingTotal = (data.activeCustomers || [])
      .filter(c => c.type === 'outgoing')
      .reduce((sum, c) => sum + (c.remainingAmount || 0), 0);

    // 3. Operating Expenses & Inventory Purchases
    const totalPaidExpenses = (data.expenses || [])
      .filter(e => e.status === 'paid')
      .reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalPurchasesCost = (data.purchases || [])
      .reduce((sum, p) => sum + (p.totalCost || ((p.costPrice || 0) * (p.quantity || 1))), 0);

    const totalExpensesAndPurchases = totalPaidExpenses + totalPurchasesCost;

    // 4. Current Month Analysis
    const now = new Date();
    const activeMonthPrefix = now.toISOString().slice(0, 7);

    let collectedThisMonth = 0;
    let pendingThisMonth = 0;

    // Detailed Customers
    (data.activeCustomers || []).forEach(c => {
      if (c.type === 'incoming') {
        (c.schedule || []).forEach(item => {
          if (item.status === 'paid') {
            const paymentMonth = item.paymentDate ? item.paymentDate.slice(0, 7) : (item.date ? item.date.slice(0, 7) : "");
            if (paymentMonth === activeMonthPrefix) {
              collectedThisMonth += item.amount || 0;
            }
          } else {
            // Unpaid items due this month or earlier (overdue)
            if (item.date && item.date.slice(0, 7) <= activeMonthPrefix) {
              pendingThisMonth += item.amount || 0;
            }
          }
        });
      }
    });

    // Sales Invoices for current month
    (data.invoices || []).forEach(inv => {
      if (inv.date && inv.date.slice(0, 7) === activeMonthPrefix) {
        collectedThisMonth += inv.amount || 0;
      }
    });

    const totalTargetThisMonth = collectedThisMonth + pendingThisMonth;
    const collectionRate = totalTargetThisMonth > 0 ? Math.round((collectedThisMonth / totalTargetThisMonth) * 100) : 0;

    const [y, m] = activeMonthPrefix.split('-');
    const monthNames = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
    const monthName = monthNames[parseInt(m, 10) - 1] || m;
    const currentMonthLabel = `${monthName} ${y}`;

    return {
      totalIncoming,
      collectedThisMonth,
      pendingThisMonth,
      outgoingTotal,
      totalExpensesAndPurchases,
      quickPendingTotal,
      collectionRate,
      currentMonthLabel
    };
  };

  const totals = getTotals();

  const getUpcomingInstallments = () => {
    if (!data) return [];
    let today = new Date();
    const currentYear = today.getFullYear();
    const hasCurrentYearInstallments = (data.activeCustomers || []).some(c => 
      c.schedule.some(item => item.date.startsWith(currentYear.toString()))
    );

    if (!hasCurrentYearInstallments) {
      today = new Date("2025-06-15");
    }

    const startOfPeriod = new Date(today);
    startOfPeriod.setHours(0, 0, 0, 0);

    const endOfPeriod = new Date(startOfPeriod);
    endOfPeriod.setDate(startOfPeriod.getDate() + 7);

    const upcoming: Array<{
      customer: ActiveCustomer;
      installment: InstallmentScheduleItem;
      daysRemaining: number;
    }> = [];

    (data.activeCustomers || []).forEach(c => {
      c.schedule.forEach(item => {
        if (item.status === 'unpaid') {
          const dueDate = new Date(item.date);
          dueDate.setHours(0, 0, 0, 0);
          
          const diffTime = dueDate.getTime() - startOfPeriod.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= -7 && diffDays <= 7) {
            upcoming.push({
              customer: c,
              installment: item,
              daysRemaining: diffDays
            });
          }
        }
      });
    });

    return upcoming.sort((a, b) => a.daysRemaining - b.daysRemaining);
  };

  const getWhatsAppLink = (type: 'incoming' | 'outgoing', phone: string, customerName: string, itemAmount: number, dueDate: string, productName: string) => {
    let targetPhone = phone;
    let message = "";

    if (type === 'outgoing') {
      targetPhone = myNumber || "01113614021";
      message = `تنبيه سداد مستحق عليك يا صاحب بوكس ستور! 📱\n\nعليك دفع قسط مستحق بقيمة *${itemAmount.toLocaleString()} ج.م.* لصالح *${customerName}* بخصوص *${productName}* المستحق بتاريخ *${dueDate}*.`;
    } else {
      message = `السلام عليكم يا أستاذ ${customerName}،\n\nتذكير لطيف من محل *بوكس ستور (Box Store)* 📱\nمستحق عليكم قسط بقيمة *${itemAmount.toLocaleString()} ج.م.* بخصوص *${productName}* بتاريخ *${dueDate}*.\n\nبرجاء التكرم بالسداد في أقرب وقت أو عبر وسائل الدفع المتاحة.\nشكراً لتعاملكم معنا! 🙏`;
    }

    let cleaned = targetPhone.replace(/\D/g, "");
    if (cleaned.startsWith("01") && cleaned.length === 11) {
      cleaned = "2" + cleaned;
    } else if (cleaned.startsWith("1") && cleaned.length === 10) {
      cleaned = "20" + cleaned;
    }
    return `https://api.whatsapp.com/send?phone=${cleaned}&text=${encodeURIComponent(message)}`;
  };

  const sendGatewayMessage = async (
    type: 'incoming' | 'outgoing',
    phone: string,
    customerName: string,
    itemAmount: number,
    dueDate: string,
    productName: string
  ): Promise<boolean> => {
    let targetPhone = phone;
    let message = "";

    if (type === 'outgoing') {
      targetPhone = myNumber || "01113614021";
      message = `تنبيه سداد مستحق عليك يا صاحب بوكس ستور! 📱\n\nعليك دفع قسط مستحق بقيمة *${itemAmount.toLocaleString()} ج.م.* لصالح *${customerName}* بخصوص *${productName}* المستحق بتاريخ *${dueDate}*.`;
    } else {
      message = `السلام عليكم يا أستاذ ${customerName}،\n\nتذكير لطيف من محل *بوكس ستور (Box Store)* 📱\nمستحق عليكم قسط بقيمة *${itemAmount.toLocaleString()} ج.م.* بخصوص *${productName}* بتاريخ *${dueDate}*.\n\nبرجاء التكرم بالسداد في أقرب وقت أو عبر وسائل الدفع المتاحة.\nشكراً لتعاملكم معنا! 🙏`;
    }

    let cleaned = targetPhone.replace(/\D/g, "");
    if (cleaned.startsWith("01") && cleaned.length === 11) {
      cleaned = "2" + cleaned;
    } else if (cleaned.startsWith("1") && cleaned.length === 10) {
      cleaned = "20" + cleaned;
    }

    if (gatewayType === 'ultramsg') {
      if (!instanceId || !authToken) {
        throw new Error("برجاء إدخال الـ Instance ID والـ Token الخاص بـ UltraMsg أولاً");
      }
      const url = `https://api.ultramsg.com/${instanceId}/messages/chat`;
      const params = new URLSearchParams();
      params.append("token", authToken);
      params.append("to", cleaned);
      params.append("body", message);

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "فشلت عملية الإرسال عبر UltraMsg");
      }
      const resJson = await res.json();
      if (resJson.sent === "true" || resJson.success || resJson.id) {
        return true;
      } else {
        throw new Error(resJson.error || "استجابة غير صالحة من UltraMsg");
      }
    } else if (gatewayType === 'whapi') {
      if (!authToken) {
        throw new Error("برجاء إدخال الـ API Token لـ Whapi أولاً");
      }
      const url = `https://gate.whapi.cloud/messages/text`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          to: cleaned + "@s.whatsapp.net",
          body: message
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "فشلت عملية الإرسال عبر Whapi");
      }
      return true;
    } else if (gatewayType === 'greenapi') {
      if (!instanceId || !authToken) {
        throw new Error("برجاء إدخال الـ ID Instance والـ API Token Instance لـ Green API أولاً");
      }
      const url = `https://api.green-api.com/waInstance${instanceId}/sendMessage/${authToken}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chatId: cleaned + "@c.us",
          message: message
        })
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "فشلت عملية الإرسال عبر Green API");
      }
      const resJson = await res.json();
      if (resJson.idMessage) {
        return true;
      } else {
        throw new Error("استجابة غير متوقعة من Green API");
      }
    } else {
      throw new Error("بوابة الويب العادية تتطلب الإرسال اليدوي أو التتابعي التلقائي بالمتصفح");
    }
  };

  const runAutoCampaign = async () => {
    const upcoming = getUpcomingInstallments();
    if (upcoming.length === 0) {
      showToast("لا يوجد أقساط مستحقة للمتابعة حالياً", "info");
      return;
    }

    setIsCampaignRunning(true);
    setCampaignProgress({ current: 0, total: upcoming.length });

    // Initialize status of each
    const initialStatus: {[key: string]: string} = {};
    upcoming.forEach(({ customer, installment }) => {
      const key = `${customer.id}-${installment.date}`;
      initialStatus[key] = 'idle';
    });
    setAutomationStatus(initialStatus);

    let successCount = 0;

    for (let i = 0; i < upcoming.length; i++) {
      const { customer, installment } = upcoming[i];
      const key = `${customer.id}-${installment.date}`;

      setAutomationStatus(prev => ({ ...prev, [key]: 'sending' }));
      setCampaignProgress({ current: i + 1, total: upcoming.length });

      const phone = customer.type === 'outgoing' ? myNumber : (customer.phone || "");

      if (gatewayType === 'browser') {
        try {
          const url = getWhatsAppLink(customer.type, phone, customer.name, installment.amount, installment.date, customer.product);
          window.open(url, '_blank');
          setAutomationStatus(prev => ({ ...prev, [key]: 'success' }));
          successCount++;
        } catch (e) {
          setAutomationStatus(prev => ({ ...prev, [key]: 'failed' }));
        }
        // Delay to allow popup
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        try {
          if (customer.type === 'incoming' && !phone) {
            throw new Error("رقم الهاتف غير مسجل للعميل");
          }
          await sendGatewayMessage(customer.type, phone, customer.name, installment.amount, installment.date, customer.product);
          setAutomationStatus(prev => ({ ...prev, [key]: 'success' }));
          successCount++;
        } catch (err: any) {
          setAutomationStatus(prev => ({ ...prev, [key]: err.message || "خطأ مجهول" }));
        }
        // Safe spacing
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsCampaignRunning(false);
    showToast(`اكتملت حملة الأتمتة المباشرة! نجح إرسال ${successCount} تذكير من إجمالي ${upcoming.length}`, successCount === upcoming.length ? 'success' : 'info');
  };

  const runQuickAutoCampaign = async () => {
    const unpaidQuick = (data?.quickInstallments || []).filter(q => q.status === 'unpaid' && q.phone) || [];
    if (unpaidQuick.length === 0) {
      showToast("لا يوجد أقساط سريعة غير مدفوعة تملك أرقام هواتف مسجلة حالياً! يرجى كتابة الأرقام أولاً في جدول الأقساط السريعة بالأسفل.", "info");
      return;
    }

    setIsQuickCampaignRunning(true);
    setQuickCampaignProgress({ current: 0, total: unpaidQuick.length });

    // Initialize status of each
    const initialStatus: {[key: string]: string} = {};
    unpaidQuick.forEach(q => {
      initialStatus[q.id] = 'idle';
    });
    setQuickAutomationStatus(initialStatus);

    let successCount = 0;

    for (let i = 0; i < unpaidQuick.length; i++) {
      const q = unpaidQuick[i];
      setQuickAutomationStatus(prev => ({ ...prev, [q.id]: 'sending' }));
      setQuickCampaignProgress({ current: i + 1, total: unpaidQuick.length });

      if (gatewayType === 'browser') {
        try {
          const url = getWhatsAppLink('incoming', q.phone!, q.name, q.amount, "الشهر الجاري", q.notes || "قسط جاري");
          window.open(url, '_blank');
          setQuickAutomationStatus(prev => ({ ...prev, [q.id]: 'success' }));
          successCount++;
        } catch (e) {
          setQuickAutomationStatus(prev => ({ ...prev, [q.id]: 'failed' }));
        }
        await new Promise(resolve => setTimeout(resolve, 1500));
      } else {
        try {
          await sendGatewayMessage('incoming', q.phone!, q.name, q.amount, "الشهر الجاري", q.notes || "قسط جاري");
          setQuickAutomationStatus(prev => ({ ...prev, [q.id]: 'success' }));
          successCount++;
        } catch (err: any) {
          setQuickAutomationStatus(prev => ({ ...prev, [q.id]: err.message || "خطأ" }));
        }
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    setIsQuickCampaignRunning(false);
    showToast(`اكتملت حملة الأقساط السريعة! نجح إرسال ${successCount} تذكير من إجمالي ${unpaidQuick.length}`, 'success');
  };

  const handleSendIndividualReminder = async (customer: ActiveCustomer, installment: InstallmentScheduleItem) => {
    const cardStatusKey = `${customer.id}-${installment.date}`;
    const phone = customer.type === 'outgoing' ? myNumber : (customer.phone || "");
    
    if (!phone && customer.type === 'incoming') {
      showToast("يرجى إضافة رقم الهاتف للعميل أولاً", "error");
      return;
    }

    if (gatewayType === 'browser') {
      const url = getWhatsAppLink(customer.type, phone, customer.name, installment.amount, installment.date, customer.product);
      window.open(url, '_blank');
      setAutomationStatus(prev => ({ ...prev, [cardStatusKey]: 'success' }));
    } else {
      setAutomationStatus(prev => ({ ...prev, [cardStatusKey]: 'sending' }));
      try {
        await sendGatewayMessage(customer.type, phone, customer.name, installment.amount, installment.date, customer.product);
        setAutomationStatus(prev => ({ ...prev, [cardStatusKey]: 'success' }));
        showToast(`تم إرسال تذكير واتساب تلقائياً للعميل ${customer.name}! 🚀`, "success");
      } catch (err: any) {
        setAutomationStatus(prev => ({ ...prev, [cardStatusKey]: err.message || "فشلت العملية" }));
        showToast(`فشل إرسال التذكير: ${err.message || "خطأ غير معروف"}`, "error");
      }
    }
  };

  // Search filter
  const filteredActiveCustomers = (data?.activeCustomers || []).filter(c => 
    c.name.includes(searchTerm) || (c.product && c.product.includes(searchTerm))
  ) || [];

  const filteredQuickInstallments = (data?.quickInstallments || []).filter(q => 
    q.name.includes(searchTerm) || (q.notes && q.notes.includes(searchTerm))
  ) || [];

  const filteredMoneyCircles = (data?.moneyCircles || []).filter(c => 
    c.name.includes(searchTerm) || (c.notes && c.notes.includes(searchTerm))
  ) || [];

  const filteredInvoices = (data?.invoices || []).filter(i => 
    i.clientName.includes(searchTerm) || i.itemName.includes(searchTerm) || i.id.includes(searchTerm)
  ) || [];

  const filteredExpenses = (data?.expenses || []).filter(e => {
    const matchesSearch = e.title.includes(searchTerm) || (e.notes && e.notes.includes(searchTerm));
    const matchesStatus = expenseStatusFilter === 'all' || e.status === expenseStatusFilter;
    const matchesCategory = expenseCategoryFilter === 'all' || e.category === expenseCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans" dir="rtl">
      
      {/* 1. PRINT RECEIPT ONLY (Hidden from standard view) */}
      {receiptToPrint && (
        <div className="print-only p-8 max-w-lg mx-auto bg-white border border-slate-300 rounded-lg text-slate-900 leading-relaxed text-right">
          <div className="text-center mb-6 border-b pb-4 border-slate-200">
            <h1 className="text-2xl font-bold text-slate-900">BOX STORE</h1>
            <p className="text-xs text-slate-500">بوكس ستور للهواتف الذكية والأجهزة الإلكترونية</p>
            <p className="text-xs text-slate-400 mt-1">9 ش ترعه السواحل / الوراق، الجيزة</p>
          </div>

          <div className="flex justify-between items-center mb-6 border-b pb-4 border-slate-100">
            <span className="text-sm font-semibold bg-slate-100 px-3 py-1 rounded">وصل استلام نقدية</span>
            <span className="text-xs text-slate-500">التاريخ: {receiptToPrint.installment.paymentDate || new Date().toISOString().slice(0, 10)}</span>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-slate-500">استلمنا من السيد/ة:</span>
              <span className="font-bold">{receiptToPrint.customer.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">مبلغ وقدره:</span>
              <span className="font-bold">{receiptToPrint.installment.amount.toLocaleString()} ج.م.</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">وذلك سداداً لقسط شهر:</span>
              <span className="font-bold">{receiptToPrint.installment.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">نوع المعاملة / المنتج:</span>
              <span className="font-medium">{receiptToPrint.customer.product}</span>
            </div>
            <div className="flex justify-between border-t pt-3 border-dashed border-slate-200">
              <span className="text-slate-600 font-semibold">إجمالي المتبقي على العميل:</span>
              <span className="font-bold text-slate-950">{(receiptToPrint.customer.remainingAmount).toLocaleString()} ج.م.</span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-100">
            <div className="text-center w-1/2">
              <p className="text-xs text-slate-400">توقيع المستلم</p>
              <p className="mt-6 font-semibold">بوكس ستور (Box Store)</p>
            </div>
            <div className="text-center w-1/2 border-r border-slate-100">
              <p className="text-xs text-slate-400">توقيع العميل</p>
              <p className="mt-8">...................</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRINT INVOICE ONLY (Hidden from standard view) */}
      {invoiceToPrint && (
        <div className="print-only p-8 bg-white text-slate-900 text-right text-xs leading-relaxed max-w-4xl mx-auto">
          <div className="flex justify-between items-center border-b pb-6 border-slate-300 mb-6">
            <div>
              <h1 className="text-3xl font-black tracking-wider text-slate-950">BOX STORE</h1>
              <p className="text-xs text-slate-500 mt-1">9 ش ترعه السواحل / الوراق، الجيزة</p>
              <p className="text-xs text-slate-500">مصر | هاتف: 01148426034</p>
            </div>
            <div className="text-left">
              <h2 className="text-xl font-bold text-slate-800">فاتورة مبيعات</h2>
              <p className="text-xs text-slate-500">رقم الفاتورة: #{invoiceToPrint.id}</p>
              <p className="text-xs text-slate-500">تاريخ الإصدار: {invoiceToPrint.date}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 rounded-lg">
            <div>
              <h3 className="font-bold text-slate-900 mb-2 border-b pb-1 border-slate-200">المُستلم:</h3>
              <p className="font-semibold text-sm">{invoiceToPrint.clientName}</p>
              <p className="text-slate-500 mt-1">العميل المعتمد لـ بوكس ستور (Box Store)</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 border-b pb-1 border-slate-200">صادرة من:</h3>
              <p className="font-semibold text-sm">{invoiceToPrint.storeName}</p>
              <p className="text-slate-500 mt-1">{invoiceToPrint.address}</p>
            </div>
          </div>

          <table className="w-full text-right mb-8 border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white font-bold">
                <th className="p-3 rounded-r-lg">الوصف والبيان</th>
                <th className="p-3">الرقم التسلسلي (S/N)</th>
                <th className="p-3 text-left rounded-l-lg">المبلغ الكلي (ج.م.)</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-slate-200">
                <td className="p-4 font-semibold">{invoiceToPrint.itemName}</td>
                <td className="p-4 font-mono">{invoiceToPrint.serialNumber || "N/A"}</td>
                <td className="p-4 text-left font-bold">{invoiceToPrint.amount.toLocaleString()} ج.م.</td>
              </tr>
            </tbody>
          </table>

          <div className="flex justify-between items-center bg-amber-50 p-4 rounded-lg border border-amber-200 mb-8">
            <span className="font-bold text-amber-900 text-sm">القيمة الكلية (EGP):</span>
            <span className="text-xl font-black text-amber-950">{invoiceToPrint.amount.toLocaleString()} ج.م.</span>
          </div>

          <div className="border-t pt-6 text-slate-500 space-y-2 text-[10px] leading-relaxed">
            <h4 className="font-bold text-slate-900 mb-2 text-xs">سياسة الاستبدال والضمان:</h4>
            <p>• خلال 14 يوماً إذا شاب السلعة عيب أو كانت غير مطابقة للمواصفات أو الغرض الذي تم التعاقد عليه.</p>
            <p>• للأجهزة المستعملة لا يوجد استرجاع، وفي حالة طلب العميل الاسترجاع يتم خصم من 5% لـ 10% من إجمالي الفاتورة.</p>
            <p>• في حالة وجود عيب صناعة في الجهاز المستعمل يستبدل بجهاز مماثل له بشرط توافر أصل الفاتورة مع العميل وباسمه.</p>
            <p>• مدة الضمان للآيفون المستعمل 30 يوماً (آيفون 6G إلى Xs Max) وثلاثة شهور لآيفون (11 إلى 15 برو ماكس).</p>
            <p>• الشركة غير مسؤولة عن فقدان أو نسيان كلمة المرور أو الدخول للحساب الشخصي للمستخدم تطبيقاً لحماية الملكية الفكرية.</p>
          </div>

          <div className="mt-12 text-center text-slate-400">
            توقيع العميل: .......................................
          </div>
        </div>
      )}


      {/* 3. MAIN WEB APPLICATION SCREEN (Visible in UI) */}
      <div className="app-workspace no-print min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
        
        {/* Navigation / Header */}
        <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Store Branding */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-slate-900 font-black text-xl shadow-md">
                B
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">برنامج إدارة الأقساط والجمعيات</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">بوكس ستور (Box Store) للهواتف والأقساط</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors border border-transparent cursor-pointer"
                aria-label="Toggle Dark Mode"
                title={isDarkMode ? "الوضع الفاتح" : "الوضع الداكن"}
              >
                {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-500" />}
              </button>

              {/* Backup & Excel Sync Controller */}
              <button
                onClick={() => setIsBackupModalOpen(true)}
                className="text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm border border-slate-700 dark:border-slate-600"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>النسخ الاحتياطي وتصدير Excel 💾</span>
              </button>

              {/* iPhone Sync Button */}
              <button
                onClick={() => setIsIphoneModalOpen(true)}
                className="text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-2 px-3.5 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-sm border border-slate-700 dark:border-slate-600"
              >
                <Smartphone className="w-4 h-4 text-sky-400" />
                <span>مزامنة الآيفون والتقويم 📱</span>
              </button>

              {/* Google Sheets Sync Controller */}
              <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto justify-between md:justify-start">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>تم ربط: {user.email}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center gap-1 bg-white dark:bg-slate-900 hover:bg-red-50 dark:hover:bg-red-950 transition px-2.5 py-1 rounded-lg border border-red-200 dark:border-red-900"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>خروج</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleGoogleLogin}
                  disabled={isLoggingIn}
                  className="w-full md:w-auto text-xs bg-slate-950 hover:bg-slate-800 text-white transition py-1.5 px-3 rounded-lg font-semibold flex items-center justify-center gap-2"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{isLoggingIn ? "جاري الاتصال..." : "ربط مع Google Drive"}</span>
                </button>
              )}

              <button
                onClick={handleSyncSheets}
                disabled={syncing || !user}
                className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition ${
                  user 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer" 
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
                title={!user ? "يجب ربط حساب Google أولاً للمزامنة" : "مزامنة البيانات الحالية مع جدول Google Sheets"}
              >
                <RotateCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                <span>{syncing ? "جاري المزامنة..." : "تحديث Google Sheets"}</span>
              </button>
            </div>
          </div>

          </div>
        </header>

        {/* Sync Success Result Panel */}
        {syncResult && (
          <div className="bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800 p-3 text-center text-xs text-emerald-800 dark:text-emerald-300 flex flex-col sm:flex-row items-center justify-center gap-2 animate-pulse">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">تمت مزامنة كافة جداول الأقساط والجمعيات والفواتير إلى Google Sheets بنجاح!</span>
            <a 
              href={syncResult.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline font-bold text-emerald-900 dark:text-emerald-100 bg-emerald-100 dark:bg-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-700 px-3 py-1 rounded-full transition inline-flex items-center gap-1"
            >
              فتح ملف Google Sheets الآن 🔗
            </a>
          </div>
        )}

        {/* Main Workspace Body */}
        <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
          
          {/* A. Top Financial Dashboard Metrics (Rebuilt & Redesigned) */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white/60 dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 backdrop-blur-sm shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    الإحصائيات المالية والحركات التفاعلية 📊
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                      تزامن لحظي
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">تحديث مباشر وتلقائي لأرقام الأقساط، التحصيلات، الالتزامات والمصروفات</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  شهر {totals.currentMonthLabel || "الحالي"}
                </span>
              </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              
              {/* Card 1: Total Receivables */}
              <div className="relative group overflow-hidden bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-5 rounded-2xl border border-slate-800 shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 text-white">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                      إجمالي مستحقات الأقساط
                    </span>
                    <p className="text-2xl font-black tracking-tight text-white">
                      {totals.totalIncoming.toLocaleString()} <span className="text-xs font-semibold text-emerald-400">ج.م.</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
                    <TrendingUp className="w-5.5 h-5.5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400">شامل التفصيلية والسريعة</span>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">إيراد قادم</span>
                </div>
              </div>

              {/* Card 2: Collected This Month */}
              <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500"></div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      التحصيل لشهر {totals.currentMonthLabel}
                    </span>
                    <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
                      {totals.collectedThisMonth.toLocaleString()} <span className="text-xs font-semibold text-slate-500">ج.م.</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <CheckCircle2 className="w-5.5 h-5.5" />
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-emerald-700 dark:text-emerald-300">نسبة التحصيل الشهري</span>
                    <span className="text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded">{totals.collectionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min(100, Math.max(0, totals.collectionRate))}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Card 3: Remaining Due */}
              <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-amber-200/80 dark:border-amber-900/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      المتبقي للتحصيل هذا الشهر
                    </span>
                    <p className="text-2xl font-black tracking-tight text-amber-600 dark:text-amber-400">
                      {totals.pendingThisMonth.toLocaleString()} <span className="text-xs font-semibold text-slate-500">ج.م.</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <AlertCircle className="w-5.5 h-5.5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500">مطلوب سداده حالياً</span>
                  <span className="font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">مستحق / متأخر</span>
                </div>
              </div>

              {/* Card 4: Outgoing Obligations */}
              <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-rose-200/80 dark:border-rose-900/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500"></div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      أقساط والتزامات خارجة (للغير)
                    </span>
                    <p className="text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
                      {totals.outgoingTotal.toLocaleString()} <span className="text-xs font-semibold text-slate-500">ج.م.</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <ArrowUpRight className="w-5.5 h-5.5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500">ديون والتزامات المحل</span>
                  <span className="font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded-md">التزام للخارج</span>
                </div>
              </div>

              {/* Card 5: Expenses & Purchases */}
              <div className="relative group overflow-hidden bg-white dark:bg-slate-900 p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-900/60 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      المصروفات ومشتريات البضاعة
                    </span>
                    <p className="text-2xl font-black tracking-tight text-indigo-600 dark:text-indigo-400">
                      {totals.totalExpensesAndPurchases.toLocaleString()} <span className="text-xs font-semibold text-slate-500">ج.م.</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                    <FileText className="w-5.5 h-5.5" />
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 dark:text-slate-500">مصاريف التشغيل وتكلفة المخزون</span>
                  <span className="font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded-md">مدفوعات</span>
                </div>
              </div>

            </section>
          </div>

{/* Upcoming Collections Notifications Panel */}
          {false && getUpcomingInstallments().length > 0 && (
            <section className="bg-gradient-to-l from-slate-50 to-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-4" dir="rtl">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center animate-bounce">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">مواعيد التحصيل القريبة والحرجة (الأسبوع الحالي) ⏰</h3>
                    <p className="text-xs text-slate-500">متابعة تلقائية للأقساط المستحقة خلال 7 أيام القادمة، أو الأقساط المتأخرة حديثاً.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full font-sans">
                    يوجد {getUpcomingInstallments().length} أقساط بحاجة للمتابعة
                  </span>

                  <button
                    onClick={() => setIsAutomationConfigOpen(!isAutomationConfigOpen)}
                    className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                    title="إعدادات بوابة واتساب للإرسال الآلي"
                  >
                    ⚙️ إعدادات الأتمتة
                  </button>

                  <button
                    onClick={runAutoCampaign}
                    disabled={isCampaignRunning}
                    className={`py-1 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isCampaignRunning 
                        ? 'bg-amber-100 text-amber-700 cursor-not-allowed' 
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    {isCampaignRunning ? (
                      <>
                        <RotateCw className="w-3 h-3 animate-spin" />
                        جاري الإرسال الآلي ({campaignProgress.current}/{campaignProgress.total})
                      </>
                    ) : (
                      <>
                        🚀 تشغيل الأتمتة وإرسال الكل تلقائياً
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* WhatsApp Automation API Configuration Form */}
              {isAutomationConfigOpen && (
                <div className="p-5 bg-slate-100/70 rounded-xl border border-slate-200 space-y-4 text-right" dir="rtl">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                    <h4 className="font-bold text-sm text-slate-950">⚙️ ربط وإعدادات بوابة الـ WhatsApp لإرسال التذكيرات الحقيقية تلقائياً</h4>
                    <span className="text-xs text-slate-500">مخزنة محلياً في جهازك بأمان</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Gateway Type Selection */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نوع بوابة الواتساب المستخدمة:</label>
                      <select
                        value={gatewayType}
                        onChange={(e) => setGatewayType(e.target.value as any)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold"
                      >
                        <option value="browser">بوابة ويب مجانية (فتح نوافذ WhatsApp وتفعيل التذكير اليدوي)</option>
                        <option value="greenapi">أوتوميشن Green API (إرسال تلقائي ومجاني بالكامل من رقم الواتساب الشخصي الخاص بك 🟢)</option>
                        <option value="ultramsg">أوتوميشن UltraMsg (إرسال تلقائي سحابي كامل وصامت بالخلفية 🟢)</option>
                        <option value="whapi">أوتوميشن Whapi API Cloud (إرسال تلقائي سحابي كامل وصامت بالخلفية 🟢)</option>
                      </select>
                      <p className="text-[10px] text-slate-500 mt-1">
                        * بوابات الأتمتة السحابية (Green API / UltraMsg / Whapi) تسمح للنظام بإرسال الرسالة الحقيقية تلقائياً في الخلفية تماماً دون فتح نوافذ جديدة.
                      </p>
                    </div>

                    {/* Owner Phone number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رقم هاتف صاحب المحل (لتلقي إشعارات "الالتزامات المستحقة عليك"):</label>
                      <input
                        type="text"
                        value={myNumber}
                        onChange={(e) => setMyNumber(e.target.value)}
                        placeholder="مثال: 01113614021"
                        className="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs font-semibold text-left font-mono"
                      />
                      <p className="text-[10px] text-slate-500 mt-1">
                        عندما يكون عليك قسط (مشتريات/خارج)، يقوم النظام بإرسال تذكير حقيقي تلقائياً إلى هذا الرقم المحدد بدلاً من رقم العميل.
                      </p>
                    </div>
                  </div>

                  {/* Green API Integration Guide */}
                  {gatewayType === 'greenapi' && (
                    <div className="p-4 bg-gradient-to-br from-indigo-50 to-emerald-50/20 border border-indigo-100 rounded-xl space-y-2 text-xs text-indigo-950 leading-relaxed">
                      <div className="flex items-center gap-1.5 font-extrabold text-indigo-900 pb-1 border-b border-indigo-100">
                        <Sparkles className="w-4 h-4 text-indigo-500" />
                        <span>دليلك لتشغيل الأوتوميشن التلقائي والمجاني عبر رقم الواتساب الشخصي الخاص بك:</span>
                      </div>
                      <p className="font-medium">
                        تتيح لك بوابة <strong className="font-extrabold text-slate-900">Green API</strong> ربط رقمك الشخصي مجاناً تماماً لتتمكن من إرسال تنبيهات الأقساط بشكل آلي تماماً في الخلفية. اتبع الخطوات البسيطة التالية:
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-700 font-medium pl-2">
                        <li>اذهب إلى موقع <a href="https://green-api.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-black hover:underline">green-api.com</a> وسجل حساب مطور مجاني (Developer Free Account).</li>
                        <li>من لوحة التحكم، ستجد مثيلاً (Instance) مجانياً تم إنشاؤه لك. اضغط عليه وافتح <strong className="font-bold">QR Code</strong>.</li>
                        <li>افتح تطبيق <strong className="font-bold">WhatsApp</strong> على هاتفك 📱 &gt; الإعدادات &gt; الأجهزة المرتبطة &gt; <strong className="font-bold">ربط جهاز</strong>، وامسح الـ QR Code بكاميرا هاتفك.</li>
                        <li>بعد ربط الهاتف، انسخ معرف الـ <strong className="font-extrabold text-indigo-700 font-mono text-[11px]">idInstance</strong> والـ <strong className="font-extrabold text-indigo-700 font-mono text-[11px]">apiTokenInstance</strong> والصقهما في الحقول بالأسفل تماماً!</li>
                      </ol>
                    </div>
                  )}

                  {/* API Credentials based on type */}
                  {gatewayType !== 'browser' && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          {gatewayType === 'greenapi' ? "مفتاح الـ apiTokenInstance السري:" : "الـ API Token / المفتاح السري:"}
                        </label>
                        <input
                          type="password"
                          value={authToken}
                          onChange={(e) => setAuthToken(e.target.value)}
                          placeholder={gatewayType === 'greenapi' ? "مثال: d311...c361" : "أدخل رمز الـ Token السري هنا..."}
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-left font-mono"
                        />
                      </div>

                      {(gatewayType === 'ultramsg' || gatewayType === 'greenapi') && (
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            {gatewayType === 'greenapi' ? "معرف الـ Instance (idInstance):" : "معرف الـ Instance (Instance ID):"}
                          </label>
                          <input
                            type="text"
                            value={instanceId}
                            onChange={(e) => setInstanceId(e.target.value)}
                            placeholder={gatewayType === 'greenapi' ? "مثال: 1101923485" : "مثال: instance9948"}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-left font-mono"
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Actions for Config Form */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setIsAutomationConfigOpen(false)}
                      className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold transition cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={() => handleSaveAutomationConfig(gatewayType, instanceId, authToken, myNumber)}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-850 text-white rounded-lg text-xs font-black transition cursor-pointer"
                    >
                      حفظ وتطبيق التغييرات 💾
                    </button>
                  </div>
                </div>
              )}

              {/* Live Automation Queue Logs */}
              {isCampaignRunning && (
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 text-right space-y-2" dir="rtl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                      جاري إرسال التذكيرات التلقائية بالخلفية... لا تغلق المتصفح
                    </span>
                    <span className="text-xs font-black text-emerald-950 font-mono">
                      {campaignProgress.current} / {campaignProgress.total} ( {Math.round((campaignProgress.current / campaignProgress.total) * 100)}% )
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full transition-all duration-300"
                      style={{ width: `${(campaignProgress.current / campaignProgress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" dir="rtl">
                {getUpcomingInstallments().map(({ customer, installment, daysRemaining }, idx) => {
                  const isOverdue = daysRemaining < 0;
                  const isToday = daysRemaining === 0;
                  const isOutgoing = customer.type === 'outgoing';
                  
                  // Automation State Status for this card
                  const cardStatusKey = `${customer.id}-${installment.date}`;
                  const autoStatus = automationStatus[cardStatusKey];

                  return (
                    <div 
                      key={idx}
                      className={`p-4 rounded-xl border transition shadow-xs flex flex-col justify-between gap-3 ${
                        autoStatus === 'success'
                          ? 'bg-emerald-50/50 border-emerald-200 hover:border-emerald-300'
                          : autoStatus === 'sending'
                            ? 'bg-amber-50/60 border-amber-300 animate-pulse'
                            : isOverdue 
                              ? 'bg-rose-50/50 border-rose-200 hover:border-rose-300' 
                              : isToday 
                                ? 'bg-amber-50/50 border-amber-200 hover:border-amber-300'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Status Badge & Days Left */}
                        <div className="flex justify-between items-center">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                            isOverdue 
                              ? 'bg-rose-100 text-rose-800' 
                              : isToday 
                                ? 'bg-amber-100 text-amber-800 animate-pulse'
                                : 'bg-blue-100 text-blue-800'
                          }`}>
                            {isOverdue 
                              ? `متأخر منذ ${Math.abs(daysRemaining)} أيام ⚠️` 
                              : isToday 
                                ? 'مستحق اليوم! 🚨'
                                : `متبقي ${daysRemaining} أيام ⏳`
                            }
                          </span>
                          <span className="text-xs font-bold text-slate-500 font-mono">
                            {installment.date}
                          </span>
                        </div>

                        {/* Account state labels (عليه vs ليه) */}
                        <div className="flex items-center gap-1.5 mt-1">
                          {isOutgoing ? (
                            <span className="text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                              ليه قسط علينا (دفع / مدين) 💸
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md">
                              عليه قسط للمحل (تحصيل / مديون) 📥
                            </span>
                          )}
                        </div>

                        {/* Customer & Product details */}
                        <div>
                          <h4 
                            onClick={() => {
                              setSelectedCustomer(customer);
                              setTimeout(() => {
                                const element = document.getElementById("customer-details-section");
                                if (element) {
                                  element.scrollIntoView({ behavior: "smooth" });
                                }
                              }, 100);
                            }}
                            className="font-bold text-slate-900 hover:text-slate-700 cursor-pointer hover:underline text-sm"
                          >
                            {customer.name}
                          </h4>
                          <p className="text-xs text-slate-500 mt-0.5 font-sans truncate">
                            {customer.product || "جهاز غير محدد"}
                          </p>
                        </div>

                        {/* Installment Amount */}
                        <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400 font-semibold">مبلغ القسط:</span>
                          <span className="text-sm font-black text-slate-950">
                            {installment.amount.toLocaleString()} ج.م.
                          </span>
                        </div>

                        {/* Live Dispatch Feedback */}
                        {autoStatus && (
                          <div className={`mt-2 p-1.5 rounded text-[11px] font-bold text-center ${
                            autoStatus === 'success'
                              ? 'bg-emerald-100 text-emerald-800'
                              : autoStatus === 'sending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                          }`}>
                            {autoStatus === 'success' && '✓ تم إرسال تذكير واتساب حقيقي! ✅'}
                            {autoStatus === 'sending' && '⏳ جاري الإرسال التلقائي...'}
                            {autoStatus !== 'success' && autoStatus !== 'sending' && `✕ فشل: ${autoStatus}`}
                          </div>
                        )}
                      </div>

                      {/* Reminder Actions */}
                      <div className="flex gap-2 pt-2 border-t border-slate-100">
                        <button
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setTimeout(() => {
                              const element = document.getElementById("customer-details-section");
                              if (element) {
                                element.scrollIntoView({ behavior: "smooth" });
                              }
                            }, 100);
                          }}
                          className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] rounded-lg transition text-center cursor-pointer"
                        >
                          عرض الملف 📂
                        </button>

                        {isOutgoing ? (
                          <button
                            onClick={() => handleSendIndividualReminder(customer, installment)}
                            className="flex-1 py-1.5 px-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            تذكير لنفسي 💬
                          </button>
                        ) : customer.phone ? (
                          <button
                            onClick={() => handleSendIndividualReminder(customer, installment)}
                            className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg transition text-center flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            تذكير واتساب 💬
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              openEditCustomerModal(customer);
                              showToast("برجاء إضافة رقم الهاتف للعميل لإرسال تذكير واتساب", "info");
                            }}
                            className="flex-1 py-1.5 px-2 bg-slate-50 hover:bg-slate-100 text-slate-400 font-bold text-[11px] rounded-lg border border-slate-150 transition text-center cursor-pointer"
                            title="اضغط لإضافة رقم الهاتف للعميل"
                          >
                            بلا هاتف ⚠️
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* B. Control Panel & Tab Switcher */}
          <section className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4 transition-colors duration-300">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 dark:text-slate-500">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text" 
                placeholder="ابحث باسم العميل أو المنتج..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-10 py-2 text-sm border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900"
              />
              {searchTerm && (
                <button onClick={() => setSearchTerm("")} className="absolute inset-y-0 left-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Tab Swappers */}
            <div className="flex flex-wrap gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto text-xs sm:text-sm">
              <button 
                onClick={() => { setActiveTab('active'); setSelectedCustomer(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'active' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                الأقساط التفصيلية ({(data?.activeCustomers || []).length || 0})
              </button>
              <button 
                onClick={() => { setActiveTab('quick'); setSelectedCustomer(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'quick' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                الأقساط الجارية السريعة ({(data?.quickInstallments || []).length || 0})
              </button>
              <button 
                onClick={() => { setActiveTab('circles'); setSelectedCustomer(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'circles' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                الجمعيات ({(data?.moneyCircles || []).length || 0})
              </button>
              <button 
                onClick={() => { setActiveTab('invoices'); setSelectedCustomer(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'invoices' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                الفواتير والمبيعات ({(data?.invoices || []).length || 0})
              </button>
              <button 
                onClick={() => { setActiveTab('expenses'); setSelectedCustomer(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'expenses' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                المصروفات ({(data?.expenses || []).length || 0})
              </button>
              <button 
                onClick={() => { setActiveTab('purchases'); setSelectedCustomer(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'purchases' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                📦 البضاعة والمشتريات ({(data?.purchases || []).length || 0})
              </button>
              <button 
                onClick={() => { setActiveTab('reports'); setSelectedCustomer(null); }}
                className={`px-4 py-2 rounded-lg font-bold transition whitespace-nowrap ${activeTab === 'reports' ? 'bg-white dark:bg-slate-700 text-slate-950 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
              >
                📊 التقارير والأرباح
              </button>
            </div>

            {/* Quick Add Button */}
            <button 
              onClick={() => { setIsAddModalOpen(true); setAddType(activeTab === 'circles' ? 'circle' : activeTab === 'invoices' ? 'invoice' : activeTab === 'expenses' ? 'expense' : activeTab === 'purchases' ? 'purchase' : (activeTab as any)); }}
              className="w-full sm:w-auto bg-slate-950 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-5 py-2 rounded-xl transition text-sm flex items-center justify-center gap-2 shadow-sm border border-transparent dark:border-slate-700"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سجل جديد</span>
            </button>

          </section>

          {/* C. Dynamic Lists & Detailed Workspace Panels */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left/Middle Column - Content List depending on active tab */}
            <div className="lg:col-span-3 space-y-6">
              
              {loading ? (
                <div className="bg-white dark:bg-slate-900 p-12 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-3 transition-colors duration-300">
                  <RotateCw className="w-8 h-8 animate-spin mx-auto text-slate-400 dark:text-slate-500" />
                  <p className="text-slate-500 dark:text-slate-400 text-sm">جاري تحميل كشوفات الأقساط والبيانات...</p>
                </div>
              ) : error ? (
                <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800 p-6 rounded-2xl text-center space-y-2 transition-colors duration-300">
                  <AlertCircle className="w-8 h-8 mx-auto text-rose-500 dark:text-rose-400" />
                  <p className="text-rose-700 dark:text-rose-300 font-bold text-sm">{error}</p>
                  <button onClick={fetchLocalData} className="text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-4 py-1.5 rounded-lg border dark:border-slate-700 shadow-sm transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700">إعادة المحاولة 🔄</button>
                </div>
              ) : (
                <>
                  
                  {/* TAB 1: DETAILED ACTIVE CUSTOMERS */}
                  {activeTab === 'active' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">جدول كشوف الأقساط الشهرية التفصيلية</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">اضغط على العميل لمشاهدة تفاصيل أقساطه الفردية وتحصيلها أو طباعتها.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                              <th className="p-4">الاسم</th>
                              <th className="p-4">المنتج / البيان</th>
                              <th className="p-4">إجمالي المبلغ</th>
                              <th className="p-4">المدفوع</th>
                              <th className="p-4">المتبقي</th>
                              <th className="p-4">معدل السداد</th>
                              <th className="p-4">النوع</th>
                              <th className="p-4 text-center">حذف</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredActiveCustomers.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">لا توجد سجلات مطابقة لعملية البحث</td>
                              </tr>
                            ) : (
                              filteredActiveCustomers.map((c) => {
                                const completionRate = Math.round((c.paidAmount / c.totalAmount) * 100) || 0;
                                return (
                                  <tr 
                                    key={c.id} 
                                    onClick={() => setSelectedCustomer(c)}
                                    className={`border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition cursor-pointer ${selectedCustomer?.id === c.id ? 'bg-slate-50 dark:bg-slate-800 font-semibold' : ''}`}
                                  >
                                    <td className="p-4 font-bold text-slate-950 dark:text-slate-100">{c.name}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">{c.product}</td>
                                    <td className="p-4 font-bold text-slate-800 dark:text-slate-200">{c.totalAmount.toLocaleString()} ج.م.</td>
                                    <td className="p-4 text-emerald-600 dark:text-emerald-500 font-semibold">{c.paidAmount.toLocaleString()} ج.م.</td>
                                    <td className="p-4 text-slate-900 dark:text-slate-100 font-bold">{c.remainingAmount.toLocaleString()} ج.م.</td>
                                    <td className="p-4">
                                      <div className="flex items-center gap-2">
                                        <div className="w-16 bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                                          <div className="bg-emerald-600 dark:bg-emerald-500 h-1.5" style={{ width: `${completionRate}%` }}></div>
                                        </div>
                                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{completionRate}%</span>
                                      </div>
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${c.type === 'incoming' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'}`}>
                                        {c.type === 'incoming' ? "عليه (مديون)" : "ليه (مستحق سداد)"}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                                      <button 
                                        onClick={() => handleDeleteCustomer(c.id)}
                                        className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition"
                                      >
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: QUICK WHATSAPP LIST */}
                  {activeTab === 'quick' && (
                    <div className="space-y-4">

                      {/* Quick Campaign Trigger */}
                      <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl flex items-center justify-between flex-wrap gap-4 transition-colors duration-300">
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">🤖 تشغيل الأتمتة الشاملة لدفعة الأقساط السريعة</h4>
                          <p className="text-xs text-slate-500 dark:text-slate-400">يقوم بإرسال رسائل تذكير حقيقية عبر الواتساب لجميع العملاء غير المدفوعين الذين تملك أرقام هواتفهم.</p>
                        </div>
                        <button
                          onClick={runQuickAutoCampaign}
                          disabled={isQuickCampaignRunning}
                          className={`py-2 px-4 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                            isQuickCampaignRunning
                              ? 'bg-amber-100 text-amber-700 cursor-not-allowed animate-pulse'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                          }`}
                        >
                          {isQuickCampaignRunning ? (
                            <>
                              <RotateCw className="w-3.5 h-3.5 animate-spin" />
                              جاري الإرسال ({quickCampaignProgress.current}/{quickCampaignProgress.total})
                            </>
                          ) : (
                            <>
                              🚀 إرسال التذكيرات للكل تلقائياً
                            </>
                          )}
                        </button>
                      </div>

                      {/* Quick Campaign Progress Logs */}
                      {isQuickCampaignRunning && (
                        <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100 space-y-2 text-right animate-pulse" dir="rtl">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                              جاري إرسال تذكيرات الأقساط السريعة تلقائياً بالخلفية...
                            </span>
                            <span className="text-xs font-black text-emerald-950 font-mono">
                              {quickCampaignProgress.current} / {quickCampaignProgress.total} ( {Math.round((quickCampaignProgress.current / quickCampaignProgress.total) * 100)}% )
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full transition-all duration-300"
                              style={{ width: `${(quickCampaignProgress.current / quickCampaignProgress.total) * 100}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4">اسم العميل</th>
                                <th className="p-4">المبلغ المستحق (ج.م.)</th>
                                <th className="p-4">رقم الهاتف (واتساب)</th>
                                <th className="p-4">تذكير ذكي</th>
                                <th className="p-4">البيان / الملاحظات</th>
                                <th className="p-4 text-center">حالة التحصيل الحالي</th>
                                <th className="p-4 text-center">حذف</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredQuickInstallments.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">لا توجد سجلات مطابقة</td>
                                </tr>
                              ) : (
                                filteredQuickInstallments.map((q) => (
                                  <tr key={q.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4 font-bold text-slate-900 dark:text-slate-100">{q.name}</td>
                                    <td className="p-4 font-extrabold text-slate-950 dark:text-white text-sm">{q.amount.toLocaleString()} ج.م.</td>
                                    <td className="p-4">
                                      <input 
                                        type="text" 
                                        placeholder="اضغط لكتابة الهاتف 📱"
                                        value={q.phone || ""}
                                        onChange={(e) => {
                                          const updatedQuick = data!.quickInstallments.map(item => 
                                            item.id === q.id ? { ...item, phone: e.target.value } : item
                                          );
                                          saveAllData({ ...data!, quickInstallments: updatedQuick });
                                        }}
                                        className="w-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg py-1 px-2 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 transition text-center text-slate-900 dark:text-slate-100"
                                      />
                                    </td>
                                    <td className="p-4">
                                      <button
                                        onClick={async () => {
                                          if (!q.phone) {
                                            showToast("يرجى كتابة رقم الهاتف أولاً لإرسال تذكير!", "info");
                                            return;
                                          }
                                          try {
                                            if (gatewayType === 'browser') {
                                              const url = getWhatsAppLink('incoming', q.phone, q.name, q.amount, "الشهر الجاري", q.notes || "قسط جاري");
                                              window.open(url, '_blank');
                                            } else {
                                              showToast(`جاري إرسال تذكير إلى ${q.name}...`, "info");
                                              await sendGatewayMessage('incoming', q.phone, q.name, q.amount, "الشهر الجاري", q.notes || "قسط جاري");
                                              showToast(`تم إرسال تذكير واتساب بنجاح لـ ${q.name}! ✅`, "success");
                                            }
                                          } catch (err: any) {
                                            showToast(`فشل الإرسال: ${err.message || err}`, "error");
                                          }
                                        }}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg py-1 px-2.5 text-[11px] transition inline-flex items-center gap-1"
                                      >
                                        <span>تذكير 📱</span>
                                      </button>
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">{q.notes || "قسط جاري شهري"}</td>
                                    <td className="p-4 text-center">
                                      <button 
                                        onClick={() => handleToggleQuickInstallment(q.id)}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition inline-flex items-center gap-1.5 ${
                                          q.status === 'paid' 
                                            ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' 
                                            : 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                                        }`}
                                      >
                                        <Check className={`w-3.5 h-3.5 ${q.status === 'paid' ? 'opacity-100' : 'opacity-30'}`} />
                                        <span>{q.status === 'paid' ? "تم التحصيل" : "غير مدفوع / قيد الانتظار"}</span>
                                      </button>
                                    </td>
                                    <td className="p-4 text-center">
                                      <button 
                                        onClick={() => handleDeleteQuick(q.id)}
                                        className="text-red-500 hover:text-red-400 p-1 rounded-lg transition"
                                      >
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 3: MONEY CIRCLES */}
                  {activeTab === 'circles' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">سجل الجمعيات (Money Circles)</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">إدارة الجمعيات والمبالغ المدفوعة شهرياً ومواعيد الاستحقاق والقبض.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                              <th className="p-4">اسم العضو / الجمعية</th>
                              <th className="p-4">المبلغ الإجمالي</th>
                              <th className="p-4">القسط الشهري</th>
                              <th className="p-4">تاريخ البدء</th>
                              <th className="p-4">المدة بالشهور</th>
                              <th className="p-4">الحالة</th>
                              <th className="p-4">ملاحظات الجمعية</th>
                              <th className="p-4 text-center">حذف</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredMoneyCircles.length === 0 ? (
                              <tr>
                                <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">لا توجد سجلات جمعيات حالياً</td>
                              </tr>
                            ) : (
                              filteredMoneyCircles.map((c) => (
                                <tr key={c.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                  <td className="p-4 font-bold text-slate-950 dark:text-slate-100">{c.name}</td>
                                  <td className="p-4 font-extrabold text-slate-800 dark:text-slate-200">{c.totalAmount.toLocaleString()} ج.م.</td>
                                  <td className="p-4 text-slate-600 dark:text-slate-400">{c.monthlyPayment.toLocaleString()} ج.م.</td>
                                  <td className="p-4 text-slate-500 dark:text-slate-400">{c.startDate}</td>
                                  <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{c.monthsCount} شهر</td>
                                  <td className="p-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800">
                                      {c.status === 'active' ? "نشط" : "مكتمل"}
                                    </span>
                                  </td>
                                  <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">{c.notes}</td>
                                  <td className="p-4 text-center">
                                    <button 
                                      onClick={() => handleDeleteCircle(c.id)}
                                      className="text-red-500 hover:text-red-400 p-1 rounded-lg transition"
                                    >
                                      <Trash2 className="w-4 h-4 mx-auto" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: INVOICES & PRINT layouts */}
                  {activeTab === 'invoices' && (
                    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                      <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <h3 className="font-bold text-slate-900 dark:text-slate-100">سجل فواتير المبيعات الصادرة</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">إدارة فواتير المبيعات المعتمدة وتوليد نسخ الفواتير الرسمية للطباعة المباشرة.</p>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse text-xs sm:text-sm">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                              <th className="p-4">رقم الفاتورة</th>
                              <th className="p-4">تاريخ البيع</th>
                              <th className="p-4">اسم العميل المستلم</th>
                              <th className="p-4">الوصف والبيان</th>
                              <th className="p-4">الرقم التسلسلي (S/N)</th>
                              <th className="p-4">القيمة الكلية</th>
                              <th className="p-4">الجهة المصدرة</th>
                              <th className="p-4 text-center">طباعة</th>
                              <th className="p-4 text-center">حذف</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredInvoices.length === 0 ? (
                              <tr>
                                <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-slate-500">لا توجد فواتير مبيعات مسجلة</td>
                              </tr>
                            ) : (
                              filteredInvoices.map((inv) => (
                                <tr key={inv.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                  <td className="p-4 font-mono font-bold text-slate-950 dark:text-slate-100">#{inv.id}</td>
                                  <td className="p-4 text-slate-500 dark:text-slate-400">{inv.date}</td>
                                  <td className="p-4 font-semibold text-slate-900 dark:text-slate-200">{inv.clientName}</td>
                                  <td className="p-4 text-slate-600 dark:text-slate-400 text-xs font-semibold">{inv.itemName}</td>
                                  <td className="p-4 font-mono text-xs dark:text-slate-300">{inv.serialNumber || "لا يوجد"}</td>
                                  <td className="p-4 font-black text-slate-900 dark:text-slate-100">{inv.amount.toLocaleString()} ج.م.</td>
                                  <td className="p-4 text-slate-500 dark:text-slate-400 text-xs">{inv.storeName}</td>
                                  <td className="p-4 text-center">
                                    <button 
                                      onClick={() => triggerPrintInvoice(inv)}
                                      className="bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 p-2 rounded-lg transition inline-flex items-center justify-center"
                                      title="طباعة الفاتورة الرسمية"
                                    >
                                      <Printer className="w-4 h-4" />
                                    </button>
                                  </td>
                                  <td className="p-4 text-center">
                                    <button 
                                      onClick={() => handleDeleteInvoice(inv.id)}
                                      className="text-red-500 hover:text-red-400 p-1 rounded-lg transition"
                                    >
                                      <Trash2 className="w-4 h-4 mx-auto" />
                                    </button>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 5: EXPENSES */}
                  {activeTab === 'expenses' && (
                    <div className="space-y-6">
                      
                      {/* Financial Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        
                        {/* Unpaid Expenses Card */}
                        <div className="bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900 rounded-2xl border border-rose-100 dark:border-rose-900/30 p-5 shadow-sm transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-rose-600 dark:text-rose-400 font-bold">إجمالي المصروفات المعلقة</p>
                              <h3 className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">
                                {(data?.expenses || [])
                                  .filter(e => e.status === 'unpaid')
                                  .reduce((sum, e) => sum + e.amount, 0)
                                  .toLocaleString()}{" "}
                                <span className="text-xs font-bold">ج.م</span>
                              </h3>
                            </div>
                            <span className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                              <TrendingDown className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">مجموع كافة الفواتير والالتزامات المستحقة الدفع</p>
                        </div>

                        {/* Paid Expenses Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5 shadow-sm transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">إجمالي المصروفات المدفوعة</p>
                              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                                {(data?.expenses || [])
                                  .filter(e => e.status === 'paid')
                                  .reduce((sum, e) => sum + e.amount, 0)
                                  .toLocaleString()}{" "}
                                <span className="text-xs font-bold">ج.م</span>
                              </h3>
                            </div>
                            <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400">
                              <TrendingUp className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">إجمالي ما تم سداده من مصاريف تشغيل ومشتريات</p>
                        </div>

                        {/* Pending Bills Count Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5 shadow-sm transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">الفواتير المعلقة</p>
                              <h3 className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                                {(data?.expenses || []).filter(e => e.status === 'unpaid').length}{" "}
                                <span className="text-xs font-bold">فواتير</span>
                              </h3>
                            </div>
                            <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                              <FileText className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">عدد الالتزامات المالية التي لم تسدد بعد</p>
                        </div>

                      </div>

                      {/* Filters & Control bar */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm transition-colors duration-300">
                        <div className="flex flex-wrap gap-2 items-center text-xs">
                          
                          {/* Filter by Status */}
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 dark:text-slate-400">الحالة:</span>
                            <div className="flex bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/50 dark:border-slate-700">
                              {(['all', 'paid', 'unpaid'] as const).map((st) => (
                                <button
                                  key={st}
                                  onClick={() => setExpenseStatusFilter(st)}
                                  className={`px-3 py-1 rounded-md font-bold transition-all ${expenseStatusFilter === st ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                                >
                                  {st === 'all' ? 'الكل' : st === 'paid' ? 'مدفوعة' : 'غير مدفوعة'}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Filter by Category */}
                          <div className="flex items-center gap-1.5 sm:mr-4">
                            <span className="text-slate-500 dark:text-slate-400">التصنيف:</span>
                            <select
                              value={expenseCategoryFilter}
                              onChange={(e) => setExpenseCategoryFilter(e.target.value as any)}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700 font-bold focus:outline-hidden"
                            >
                              <option value="all">كل التصنيفات</option>
                              <option value="rent">إيجار المحل</option>
                              <option value="internet">فاتورة النت</option>
                              <option value="electricity">كهرباء</option>
                              <option value="salary">المرتبات</option>
                              <option value="maintenance">صيانة وتجهيز</option>
                              <option value="other">أخرى</option>
                            </select>
                          </div>

                        </div>

                        {/* Export/Add Shortcut */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const headers = ["المصروف", "المبلغ", "التصنيف", "تاريخ الاستحقاق", "الحالة", "التكرار", "تاريخ السداد", "ملاحظات"];
                              const rows = filteredExpenses.map(e => [
                                e.title,
                                e.amount.toString() + " ج.م",
                                e.category === 'rent' ? 'إيجار' : e.category === 'internet' ? 'إنترنت' : e.category === 'electricity' ? 'كهرباء' : e.category === 'salary' ? 'مرتبات' : e.category === 'maintenance' ? 'صيانة' : 'أخرى',
                                e.dueDate,
                                e.status === 'paid' ? 'مدفوع' : 'غير مدفوع',
                                e.recurring === 'monthly' ? 'شهري' : e.recurring === 'yearly' ? 'سنوي' : 'مرة واحدة',
                                e.paymentDate || "",
                                e.notes || ""
                              ]);
                              downloadCSV("كشف_المصروفات.csv", headers, rows);
                            }}
                            className="px-3.5 py-1.5 border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            تصدير المصاريف 📊
                          </button>
                        </div>
                      </div>

                      {/* Expenses Table */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">سجل المصروفات والمشتريات</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">عرض وإدارة فواتير إيجار المحل، النت، الكهرباء والالتزامات الدورية.</p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4">المصروف</th>
                                <th className="p-4">التصنيف</th>
                                <th className="p-4">القيمة بالجنيه</th>
                                <th className="p-4">تاريخ الاستحقاق</th>
                                <th className="p-4">تكرار المصروف</th>
                                <th className="p-4">الحالة</th>
                                <th className="p-4">ملاحظات</th>
                                <th className="p-4 text-center">تحديث الحالة</th>
                                <th className="p-4 text-center">حذف</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredExpenses.length === 0 ? (
                                <tr>
                                  <td colSpan={9} className="p-8 text-center text-slate-400 dark:text-slate-500">لا توجد سجلات مصروفات مطابقة للبحث أو الفلتر حالياً</td>
                                </tr>
                              ) : (
                                filteredExpenses.map((exp) => (
                                  <tr key={exp.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4 font-bold text-slate-950 dark:text-slate-100">{exp.title}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                      <span className={`px-2 py-0.5 rounded text-xxs font-extrabold ${
                                        exp.category === 'rent' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800' :
                                        exp.category === 'internet' ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800' :
                                        exp.category === 'electricity' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800' :
                                        exp.category === 'salary' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800' :
                                        exp.category === 'maintenance' ? 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border border-orange-100 dark:border-orange-800' :
                                        'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                      }`}>
                                        {exp.category === 'rent' ? 'إيجار' :
                                         exp.category === 'internet' ? 'إنترنت' :
                                         exp.category === 'electricity' ? 'كهرباء' :
                                         exp.category === 'salary' ? 'مرتبات' :
                                         exp.category === 'maintenance' ? 'صيانة' : 'أخرى'}
                                      </span>
                                    </td>
                                    <td className="p-4 font-extrabold text-slate-900 dark:text-slate-100">{exp.amount.toLocaleString()} ج.م.</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 font-mono text-xs">{exp.dueDate}</td>
                                    <td className="p-4 text-slate-600 dark:text-slate-400">
                                      {exp.recurring === 'monthly' ? 'شهرياً' : exp.recurring === 'yearly' ? 'سنوياً' : 'مرة واحدة'}
                                    </td>
                                    <td className="p-4">
                                      <span className={`px-2.5 py-0.5 rounded-full text-xxs font-bold ${
                                        exp.status === 'paid' 
                                          ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30' 
                                          : 'bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-800/30'
                                      }`}>
                                        {exp.status === 'paid' ? `تم الدفع (${exp.paymentDate || ''})` : 'غير مدفوع'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-slate-500 dark:text-slate-400 text-xs max-w-[200px] truncate" title={exp.notes}>
                                      {exp.notes || "-"}
                                    </td>
                                    <td className="p-4 text-center">
                                      <button 
                                        onClick={() => handleToggleExpenseStatus(exp.id)}
                                        className={`p-1 rounded-lg transition inline-flex items-center justify-center cursor-pointer ${
                                          exp.status === 'paid' ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 hover:bg-emerald-100'
                                        }`}
                                        title={exp.status === 'paid' ? "تعليم كغير مدفوع" : "تعليم كمدفوع"}
                                      >
                                        {exp.status === 'paid' ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                      </button>
                                    </td>
                                    <td className="p-4 text-center">
                                      <button 
                                        onClick={() => handleDeleteExpense(exp.id)}
                                        className="text-red-500 hover:text-red-400 p-1 rounded-lg transition cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                      </button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                </>
              )}

            </div>

          
                  {/* TAB 6: PURCHASES & INVENTORY */}
                  {activeTab === 'purchases' && (
                    <div className="space-y-6">
                      
                      {/* Inventory Summary Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        
                        {/* Total Spent Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-5 shadow-sm transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">إجمالي تكلفة المشتريات</p>
                              <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                                {(data?.purchases || [])
                                  .reduce((sum, p) => sum + p.totalCost, 0)
                                  .toLocaleString()}{" "}
                                <span className="text-xs font-bold">ج.م</span>
                              </h3>
                            </div>
                            <span className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                              <CreditCard className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">إجمالي تكلفة شراء السلع والمخزون</p>
                        </div>

                        {/* iPhones Count Card */}
                        <div className="bg-gradient-to-br from-cyan-50 to-white dark:from-cyan-950/20 dark:to-slate-900 rounded-2xl border border-cyan-100 dark:border-cyan-900/30 p-5 shadow-sm transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-bold">الأيفونات المشتراة</p>
                              <h3 className="text-2xl font-black text-cyan-700 dark:text-cyan-300 mt-1">
                                {(data?.purchases || [])
                                  .filter(p => p.category === 'iphone')
                                  .reduce((sum, p) => sum + p.quantity, 0)}{" "}
                                <span className="text-xs font-bold">قطع</span>
                              </h3>
                            </div>
                            <span className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-900/50 text-cyan-600 dark:text-cyan-400">
                              <Smartphone className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">إجمالي أجهزة أيفون في المخزون والمشتريات</p>
                        </div>

                        {/* Accessories/Screens Card */}
                        <div className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 p-5 shadow-sm transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">الجرابات والاسكرينات</p>
                              <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                                {(data?.purchases || [])
                                  .filter(p => p.category === 'accessory' || p.category === 'screen')
                                  .reduce((sum, p) => sum + p.quantity, 0)}{" "}
                                <span className="text-xs font-bold">قطع</span>
                              </h3>
                            </div>
                            <span className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-450">
                              <Sparkles className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">الجرابات، الاسكرينات، والشاشات</p>
                        </div>

                        {/* Chargers and Cables Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5 shadow-sm transition-all duration-300">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">شواحن وكابلات</p>
                              <h3 className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                                {(data?.purchases || [])
                                  .filter(p => p.category === 'charger')
                                  .reduce((sum, p) => sum + p.quantity, 0)}{" "}
                                <span className="text-xs font-bold">قطع</span>
                              </h3>
                            </div>
                            <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                              <RotateCw className="w-5 h-5" />
                            </span>
                          </div>
                          <p className="text-xxs text-slate-400 dark:text-slate-500 mt-2">الشواحن، الوصلات والكابلات</p>
                        </div>

                      </div>

                      {/* Control bar */}
                      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm transition-colors duration-300">
                        <div className="flex flex-wrap gap-4 items-center text-xs">
                          {/* Search */}
                          <div className="relative">
                            <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <Search className="h-4 w-4 text-slate-400" />
                            </span>
                            <input
                              type="text"
                              placeholder="البحث في المشتريات..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="bg-slate-100 dark:bg-slate-800 text-slate-850 dark:text-slate-100 pr-9 pl-4 py-1.5 w-48 sm:w-64 rounded-xl border border-slate-200/50 dark:border-slate-700 font-bold focus:outline-hidden focus:ring-2 focus:ring-slate-950 dark:focus:ring-slate-500 transition text-xs"
                            />
                          </div>
                        </div>

                        {/* Export Button */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              const headers = ["المنتج/السلعة", "التصنيف", "الكمية", "سعر الشراء", "إجمالي التكلفة", "سعر البيع المتوقع", "تاريخ الشراء", "المورد", "ملاحظات"];
                              const rows = (data?.purchases || []).map(p => [
                                p.itemName,
                                p.category === 'iphone' ? 'أيفون' : p.category === 'accessory' ? 'إكسسوار' : p.category === 'charger' ? 'شاحن' : p.category === 'screen' ? 'اسكرينة' : 'أخرى',
                                p.quantity.toString(),
                                p.costPrice.toString() + " ج.م",
                                p.totalCost.toString() + " ج.م",
                                p.salePrice ? p.salePrice.toString() + " ج.م" : "",
                                p.purchaseDate,
                                p.supplierName || "",
                                p.notes || ""
                              ]);
                              downloadCSV("مشتريات_المحل_والمخزون.csv", headers, rows);
                            }}
                            className="px-3.5 py-1.5 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg transition text-xs flex items-center gap-1.5 shadow-xs cursor-pointer animate-pulse"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                            تصدير المشتريات 📊
                          </button>
                        </div>
                      </div>

                      {/* Purchases Table */}
                      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                          <h3 className="font-bold text-slate-900 dark:text-slate-100">سجل بضائع ومشتريات المحل</h3>
                          <p className="text-xs text-slate-550 dark:text-slate-400">سجل المشتريات من جرابات، شاشات، اسكرينات، أجهزة أيفون ومتابعة المخزون.</p>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-right border-collapse text-xs sm:text-sm">
                            <thead>
                              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                <th className="p-4">اسم المنتج/السلعة</th>
                                <th className="p-4">التصنيف</th>
                                <th className="p-4 text-center">الكمية</th>
                                <th className="p-4">سعر الشراء للقطعة</th>
                                <th className="p-4">إجمالي التكلفة</th>
                                <th className="p-4">سعر البيع المتوقع</th>
                                <th className="p-4">تاريخ الشراء</th>
                                <th className="p-4">المورد</th>
                                <th className="p-4">ملاحظات</th>
                                <th className="p-4 text-center">حذف</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(() => {
                                const list = (data?.purchases || []).filter(p => 
                                  p.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  (p.supplierName && p.supplierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                                  (p.notes && p.notes.toLowerCase().includes(searchTerm.toLowerCase()))
                                );

                                if (list.length === 0) {
                                  return (
                                    <tr>
                                      <td colSpan={10} className="p-8 text-center text-slate-400 dark:text-slate-500">لا توجد بضائع مشتراة مسجلة حالياً</td>
                                    </tr>
                                  );
                                }

                                return list.map((pur) => (
                                  <tr key={pur.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                    <td className="p-4 font-bold text-slate-950 dark:text-slate-100">{pur.itemName}</td>
                                    <td className="p-4">
                                      <span className={`px-2 py-0.5 rounded text-xxs font-extrabold ${
                                        pur.category === 'iphone' ? 'bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800' :
                                        pur.category === 'accessory' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' :
                                        pur.category === 'charger' ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-800' :
                                        pur.category === 'screen' ? 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800' :
                                        'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                      }`}>
                                        {pur.category === 'iphone' ? 'أيفون' :
                                         pur.category === 'accessory' ? 'جراب/إكسسوار' :
                                         pur.category === 'charger' ? 'شاحن' :
                                         pur.category === 'screen' ? 'اسكرينة/شاشة' : 'أخرى'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-center font-bold text-slate-800 dark:text-slate-200">{pur.quantity}</td>
                                    <td className="p-4 font-extrabold text-slate-700 dark:text-slate-300">{pur.costPrice.toLocaleString()} ج.م</td>
                                    <td className="p-4 font-black text-slate-900 dark:text-slate-100">{(pur.quantity * pur.costPrice).toLocaleString()} ج.م</td>
                                    <td className="p-4 text-emerald-600 dark:text-emerald-450 font-bold">{pur.salePrice ? `${pur.salePrice.toLocaleString()} ج.م` : "-"}</td>
                                    <td className="p-4 font-mono text-xs text-slate-500">{pur.purchaseDate}</td>
                                    <td className="p-4 text-slate-650 dark:text-slate-350">{pur.supplierName || "-"}</td>
                                    <td className="p-4 text-slate-500 dark:text-slate-450 max-w-[150px] truncate" title={pur.notes}>{pur.notes || "-"}</td>
                                    <td className="p-4 text-center">
                                      <button 
                                        onClick={() => handleDeletePurchase(pur.id)}
                                        className="text-red-500 hover:text-red-400 p-1 rounded-lg transition cursor-pointer"
                                      >
                                        <Trash2 className="w-4 h-4 mx-auto" />
                                      </button>
                                    </td>
                                  </tr>
                                ));
                              })()}
                            </tbody>
                          </table>
                        </div>
                      </div>

                    </div>
                  )}

                  {/* TAB 7: REPORTS & PROFITS */}
                  {activeTab === 'reports' && (() => {
                    if (!data) return null;
                    const d = data;
                    const getFinancialReports = () => {
                      // 1. Calculate Revenues
                      let collectedInstallments = 0;
                      let expectedFutureInstallments = 0;
                      d.activeCustomers.forEach(c => {
                        if (c.type === 'incoming') {
                          c.schedule.forEach(item => {
                            if (item.status === 'paid') {
                              collectedInstallments += item.amount;
                            } else {
                              expectedFutureInstallments += item.amount;
                            }
                          });
                        }
                      });

                      let collectedQuick = 0;
                      let pendingQuick = 0;
                      d.quickInstallments.forEach(q => {
                        if (q.status === 'paid') {
                          collectedQuick += q.amount;
                        } else {
                          pendingQuick += q.amount;
                        }
                      });

                      const totalInvoices = d.invoices.reduce((sum, inv) => sum + inv.amount, 0);
                      const totalRevenues = collectedInstallments + collectedQuick + totalInvoices;

                      // 2. Calculate Expenses and Purchases
                      const totalExpenses = (d.expenses || [])
                        .filter(e => e.status === 'paid')
                        .reduce((sum, e) => sum + e.amount, 0);

                      const totalPurchases = (d.purchases || [])
                        .reduce((sum, p) => sum + p.totalCost, 0);

                      let paidOutgoing = 0;
                      d.activeCustomers.forEach(c => {
                        if (c.type === 'outgoing') {
                          c.schedule.forEach(item => {
                            if (item.status === 'paid') {
                              paidOutgoing += item.amount;
                            }
                          });
                        }
                      });

                      const totalOutflow = totalExpenses + totalPurchases + paidOutgoing;
                      const netProfit = totalRevenues - totalOutflow;
                      const expectedFutureProfit = expectedFutureInstallments + pendingQuick;

                      // 3. Monthly Breakdown
                      const monthlyMap: { [key: string]: { revenue: number, expense: number, purchase: number, profit: number } } = {};

                      const getMonthKey = (dateStr: string) => {
                        if (!dateStr) return '';
                        return dateStr.substring(0, 7); // "YYYY-MM"
                      };

                      // Add Invoices
                      d.invoices.forEach(inv => {
                        const month = getMonthKey(inv.date);
                        if (month) {
                          if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expense: 0, purchase: 0, profit: 0 };
                          monthlyMap[month].revenue += inv.amount;
                        }
                      });

                      // Add Paid Installments
                      d.activeCustomers.forEach(c => {
                        if (c.type === 'incoming') {
                          c.schedule.forEach(item => {
                            if (item.status === 'paid') {
                              const date = item.paymentDate || item.date;
                              const month = getMonthKey(date);
                              if (month) {
                                if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expense: 0, purchase: 0, profit: 0 };
                                monthlyMap[month].revenue += item.amount;
                              }
                            }
                          });
                        } else if (c.type === 'outgoing') {
                          c.schedule.forEach(item => {
                            if (item.status === 'paid') {
                              const date = item.paymentDate || item.date;
                              const month = getMonthKey(date);
                              if (month) {
                                if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expense: 0, purchase: 0, profit: 0 };
                                monthlyMap[month].expense += item.amount;
                              }
                            }
                          });
                        }
                      });

                      // Add Paid Expenses
                      (d.expenses || []).forEach(e => {
                        if (e.status === 'paid') {
                          const date = e.paymentDate || e.dueDate;
                          const month = getMonthKey(date);
                          if (month) {
                            if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expense: 0, purchase: 0, profit: 0 };
                            monthlyMap[month].expense += e.amount;
                          }
                        }
                      });

                      // Add Purchases
                      (d.purchases || []).forEach(p => {
                        const month = getMonthKey(p.purchaseDate);
                        if (month) {
                          if (!monthlyMap[month]) monthlyMap[month] = { revenue: 0, expense: 0, purchase: 0, profit: 0 };
                          monthlyMap[month].purchase += p.totalCost;
                        }
                      });

                      // Compute profit per month
                      Object.keys(monthlyMap).forEach(month => {
                        const m = monthlyMap[month];
                        m.profit = m.revenue - (m.expense + m.purchase);
                      });

                      const sortedMonths = Object.keys(monthlyMap).sort().reverse();

                      // Category breakdowns
                      const expensesByCategory: { [key: string]: number } = {};
                      (d.expenses || []).filter(e => e.status === 'paid').forEach(e => {
                        expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
                      });

                      const purchasesByCategory: { [key: string]: number } = {};
                      (d.purchases || []).forEach(p => {
                        purchasesByCategory[p.category] = (purchasesByCategory[p.category] || 0) + p.totalCost;
                      });

                      return {
                        totalRevenues,
                        totalExpenses,
                        totalPurchases,
                        totalOutflow,
                        netProfit,
                        expectedFutureProfit,
                        monthlyMap,
                        sortedMonths,
                        expensesByCategory,
                        purchasesByCategory,
                        collectedInstallments,
                        collectedQuick,
                        totalInvoices,
                        paidOutgoing
                      };
                    };

                    const r = getFinancialReports();

                    const handleExportMonthCSV = (month: string) => {
                      if (!data) return;
                      const headers = ["التاريخ", "النوع", "البيان / الاسم", "التفاصيل / السلعة", "المبلغ الكلي", "تفاصيل إضافية"];
                      const rows: string[][] = [];

                      d.invoices.forEach(inv => {
                        if (inv.date.startsWith(month)) {
                          rows.push([
                            inv.date,
                            "إيراد - بيع كاش",
                            inv.clientName,
                            inv.itemName,
                            inv.amount.toString(),
                            `فاتورة رقم ${inv.id}`
                          ]);
                        }
                      });

                      d.activeCustomers.forEach(c => {
                        c.schedule.forEach(item => {
                          if (item.status === 'paid') {
                            const date = item.paymentDate || item.date;
                            if (date.startsWith(month)) {
                              rows.push([
                                date,
                                c.type === 'incoming' ? "إيراد - تحصيل قسط" : "مصروف - دفع قسط خارج",
                                c.name,
                                c.product,
                                item.amount.toString(),
                                c.type === 'incoming' ? `تحصيل قسط شهري` : `سداد قسط`
                              ]);
                            }
                          }
                        });
                      });

                      (d.expenses || []).forEach(e => {
                        if (e.status === 'paid') {
                          const date = e.paymentDate || e.dueDate;
                          if (date.startsWith(month)) {
                            rows.push([
                              date,
                              "مصروف - تشغيل",
                              e.title,
                              e.category === 'rent' ? 'إيجار' : e.category === 'electricity' ? 'كهرباء' : e.category === 'internet' ? 'إنترنت' : e.category === 'salary' ? 'رواتب' : e.category === 'maintenance' ? 'صيانة' : 'أخرى',
                              e.amount.toString(),
                              e.notes || ""
                            ]);
                          }
                        }
                      });

                      (d.purchases || []).forEach(p => {
                        if (p.purchaseDate.startsWith(month)) {
                          rows.push([
                            p.purchaseDate,
                            "تكلفة - شراء بضاعة",
                            p.itemName,
                            `الكمية: ${p.quantity} - سعر القطعة: ${p.costPrice}`,
                            p.totalCost.toString(),
                            `المورد: ${p.supplierName || ''}`
                          ]);
                        }
                      });

                      rows.sort((a, b) => a[0].localeCompare(b[0]));
                      downloadCSV(`تقرير_أرباح_ومصاريف_شهر_${month}.csv`, headers, rows);
                    };

                    const getCategoryLabel = (cat: string) => {
                      switch(cat) {
                        case 'rent': return 'إيجار المحل';
                        case 'electricity': return 'فاتورة الكهرباء';
                        case 'internet': return 'فاتورة الإنترنت';
                        case 'salary': return 'مرتبات الموظفين';
                        case 'maintenance': return 'صيانة وإصلاحات';
                        case 'iphone': return 'هواتف أيفون';
                        case 'accessory': return 'جرابات وإكسسوارات';
                        case 'charger': return 'شواحن وكابلات';
                        case 'screen': return 'اسكرينات وشاشات';
                        default: return 'أخرى / تصنيفات متنوعة';
                      }
                    };

                    const formatArabicMonth = (ymStr: string) => {
                      const [y, m] = ymStr.split('-');
                      const months = [
                        'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
                        'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
                      ];
                      const idx = parseInt(m) - 1;
                      return `${months[idx]} ${y}`;
                    };

                    const totalRevenuesVal = r.totalRevenues || 1;
                    const expensePercent = Math.min(100, Math.round((r.totalExpenses / totalRevenuesVal) * 100));
                    const purchasePercent = Math.min(100 - expensePercent, Math.round((r.totalPurchases / totalRevenuesVal) * 100));
                    const netPercent = Math.max(0, 100 - expensePercent - purchasePercent);

                    return (
                      <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-sm transition-colors duration-300">
                          <div>
                            <h3 className="font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                              <TrendingUp className="w-5 h-5 text-emerald-500" />
                              <span>التحليلات والتقارير المالية المفصلة</span>
                            </h3>
                            <p className="text-xs text-slate-550 dark:text-slate-400 mt-1">تحليل شامل للأرباح والخسائر وحساب التدفق النقدي الفعلي للمحل.</p>
                          </div>
                          
                          <button
                            onClick={() => {
                              const headers = ["الشهر", "إجمالي الإيرادات", "المصاريف التشغيلية", "مشتريات البضائع", "صافي الأرباح/الخسائر"];
                              const rows = r.sortedMonths.map(m => {
                                const val = r.monthlyMap[m];
                                return [
                                  formatArabicMonth(m),
                                  val.revenue.toString() + " ج.م",
                                  val.expense.toString() + " ج.م",
                                  val.purchase.toString() + " ج.م",
                                  val.profit.toString() + " ج.م"
                                ];
                              });
                              downloadCSV("التقرير_المالي_الشهري_العام.csv", headers, rows);
                            }}
                            className="text-xs bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-xl flex items-center gap-2 transition cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                            <span>تصدير التقرير المالي العام 📊</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className={`rounded-2xl border p-5 shadow-sm transition-all duration-300 ${
                            r.netProfit >= 0 
                              ? 'bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-slate-900 border-emerald-100 dark:border-emerald-900/30' 
                              : 'bg-gradient-to-br from-rose-50 to-white dark:from-rose-950/20 dark:to-slate-900 border-rose-100 dark:border-rose-900/30'
                          }`}>
                            <div className="flex justify-between items-start">
                              <div>
                                <p className={`text-xs font-bold ${r.netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                  صافي الأرباح المحققة (كاش)
                                </p>
                                <h3 className={`text-2xl font-black mt-1 ${r.netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
                                  {r.netProfit.toLocaleString()}{" "}
                                  <span className="text-xs font-bold">ج.م</span>
                                </h3>
                              </div>
                              <span className={`p-2.5 rounded-xl ${
                                r.netProfit >= 0 
                                  ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-450' 
                                  : 'bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-450'
                              }`}>
                                {r.netProfit >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                              </span>
                            </div>
                            <p className="text-xxs text-slate-400 dark:text-slate-500 mt-3">
                              طرح إجمالي التكاليف والمشتريات من الإيرادات المحصلة
                            </p>
                          </div>

                          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-indigo-950/20 dark:to-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/30 p-5 shadow-sm transition-all duration-300">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">إجمالي الإيرادات (المحصلة)</p>
                                <h3 className="text-2xl font-black text-indigo-700 dark:text-indigo-300 mt-1">
                                  {r.totalRevenues.toLocaleString()}{" "}
                                  <span className="text-xs font-bold">ج.م</span>
                                </h3>
                              </div>
                              <span className="p-2.5 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                                <ArrowUpRight className="w-5 h-5" />
                              </span>
                            </div>
                            <div className="text-xxs text-slate-500 dark:text-slate-450 mt-2 space-y-0.5">
                              <div>• أقساط محصلة: {r.collectedInstallments.toLocaleString()} ج.م</div>
                              <div>• بيع كاش (فواتير): {r.totalInvoices.toLocaleString()} ج.م</div>
                              <div>• أقساط سريعة: {r.collectedQuick.toLocaleString()} ج.م</div>
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-slate-900 rounded-2xl border border-amber-100 dark:border-amber-900/30 p-5 shadow-sm transition-all duration-300">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs text-amber-600 dark:text-amber-400 font-bold">إجمالي المصروفات والمشتريات</p>
                                <h3 className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">
                                  {r.totalOutflow.toLocaleString()}{" "}
                                  <span className="text-xs font-bold">ج.م</span>
                                </h3>
                              </div>
                              <span className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                                <ArrowDownLeft className="w-5 h-5" />
                              </span>
                            </div>
                            <div className="text-xxs text-slate-500 dark:text-slate-450 mt-2 space-y-0.5">
                              <div>• مشتريات بضاعة: {r.totalPurchases.toLocaleString()} ج.م</div>
                              <div>• مصاريف المحل: {r.totalExpenses.toLocaleString()} ج.م</div>
                              {r.paidOutgoing > 0 && <div>• أقساط خارجة مدفوعة: {r.paidOutgoing.toLocaleString()} ج.م</div>}
                            </div>
                          </div>

                          <div className="bg-gradient-to-br from-sky-50 to-white dark:from-sky-950/20 dark:to-slate-900 rounded-2xl border border-sky-100 dark:border-sky-900/30 p-5 shadow-sm transition-all duration-300">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-xs text-sky-600 dark:text-sky-400 font-bold">أرباح وديون مستحقة (بالخارج)</p>
                                <h3 className="text-2xl font-black text-sky-700 dark:text-sky-300 mt-1">
                                  {r.expectedFutureProfit.toLocaleString()}{" "}
                                  <span className="text-xs font-bold">ج.م</span>
                                </h3>
                              </div>
                              <span className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400">
                                <CreditCard className="w-5 h-5" />
                              </span>
                            </div>
                            <p className="text-xxs text-slate-400 dark:text-slate-500 mt-3">
                              الأقساط المتبقية طرف العملاء والجمعيات (مستحقات آجلة)
                            </p>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 mb-3">شريط التوزيع المالي والتدفق النقدي</h4>
                          <div className="h-6 w-full rounded-xl overflow-hidden flex text-xxs font-bold text-white">
                            {r.totalRevenues > 0 ? (
                              <>
                                {expensePercent > 0 && (
                                  <div 
                                    style={{ width: `${expensePercent}%` }} 
                                    className="bg-red-500 flex items-center justify-center transition-all duration-500"
                                    title={`المصاريف التشغيلية: ${expensePercent}%`}
                                  >
                                    مصاريف ({expensePercent}%)
                                  </div>
                                )}
                                {purchasePercent > 0 && (
                                  <div 
                                    style={{ width: `${purchasePercent}%` }} 
                                    className="bg-amber-500 flex items-center justify-center transition-all duration-500 border-r border-amber-600/20"
                                    title={`المشتريات والبضائع: ${purchasePercent}%`}
                                  >
                                    مشتريات ({purchasePercent}%)
                                  </div>
                                )}
                                {netPercent > 0 && r.netProfit >= 0 && (
                                  <div 
                                    style={{ width: `${netPercent}%` }} 
                                    className="bg-emerald-500 flex items-center justify-center transition-all duration-500 border-r border-emerald-600/20"
                                    title={`صافي الأرباح: ${netPercent}%`}
                                  >
                                    صافي الربح ({netPercent}%)
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className="w-full bg-slate-200 dark:bg-slate-800 text-slate-400 flex items-center justify-center">
                                لا توجد بيانات تدفق نقدي كافية
                              </div>
                            )}
                          </div>
                          
                          <div className="flex justify-between items-center text-xxs text-slate-500 dark:text-slate-400 mt-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
                              <span>صافي الأرباح المحققة</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                              <span>مشتريات البضاعة والمخزون</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded bg-red-500"></span>
                              <span>المصاريف والالتزامات التشغيلية</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b pb-3 mb-4">تحليل المصروفات التشغيلية حسب الفئة</h4>
                            <div className="space-y-4">
                              {(() => {
                                const categories = Object.keys(r.expensesByCategory);
                                if (categories.length === 0) {
                                  return <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">لا توجد مصاريف مدفوعة مسجلة</p>;
                                }
                                
                                const maxExp = Math.max(...categories.map(c => r.expensesByCategory[c]));

                                return categories.map(cat => {
                                  const amt = r.expensesByCategory[cat];
                                  const percent = maxExp > 0 ? Math.round((amt / maxExp) * 100) : 0;
                                  return (
                                    <div key={cat} className="space-y-1.5">
                                      <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{getCategoryLabel(cat)}</span>
                                        <span className="font-black text-slate-950 dark:text-white">{amt.toLocaleString()} ج.م</span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div 
                                          style={{ width: `${percent}%` }} 
                                          className="bg-rose-500 dark:bg-rose-600 h-full rounded-full transition-all duration-500"
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>

                          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm transition-colors duration-300">
                            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 border-b pb-3 mb-4">توزيع رأس المال في بضاعة ومخزون المحل</h4>
                            <div className="space-y-4">
                              {(() => {
                                const categories = Object.keys(r.purchasesByCategory);
                                if (categories.length === 0) {
                                  return <p className="text-xs text-slate-400 dark:text-slate-500 text-center py-6">لا توجد بضائع ومشتريات مسجلة</p>;
                                }
                                
                                const maxPur = Math.max(...categories.map(c => r.purchasesByCategory[c]));

                                return categories.map(cat => {
                                  const amt = r.purchasesByCategory[cat];
                                  const percent = maxPur > 0 ? Math.round((amt / maxPur) * 100) : 0;
                                  return (
                                    <div key={cat} className="space-y-1.5">
                                      <div className="flex justify-between text-xs">
                                        <span className="font-bold text-slate-800 dark:text-slate-200">{getCategoryLabel(cat)}</span>
                                        <span className="font-black text-slate-950 dark:text-white">{amt.toLocaleString()} ج.م</span>
                                      </div>
                                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                                        <div 
                                          style={{ width: `${percent}%` }} 
                                          className="bg-indigo-500 dark:bg-indigo-600 h-full rounded-full transition-all duration-500"
                                        ></div>
                                      </div>
                                    </div>
                                  );
                                });
                              })()}
                            </div>
                          </div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
                          <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold text-slate-900 dark:text-slate-100">الأداء المالي وحركة الأرباح شهرياً</h3>
                            <p className="text-xs text-slate-550 dark:text-slate-400">جدول تفصيلي يوضح الإيرادات، المصاريف، المشتريات، وصافي الأرباح لكل شهر بشكل منفصل.</p>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-right border-collapse text-xs sm:text-sm">
                              <thead>
                                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700">
                                  <th className="p-4">الشهر</th>
                                  <th className="p-4 text-center">إجمالي الإيرادات</th>
                                  <th className="p-4 text-center">المصاريف التشغيلية</th>
                                  <th className="p-4 text-center">مشتريات البضائع</th>
                                  <th className="p-4 text-center">إجمالي التكاليف</th>
                                  <th className="p-4 text-center">صافي الأرباح / الخسائر</th>
                                  <th className="p-4 text-center">تحميل تقرير الشهر</th>
                                </tr>
                              </thead>
                              <tbody>
                                {r.sortedMonths.length === 0 ? (
                                  <tr>
                                    <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">لا توجد سجلات مالية مسجلة بعد</td>
                                  </tr>
                                ) : (
                                  r.sortedMonths.map(month => {
                                    const item = r.monthlyMap[month];
                                    const totalCosts = item.expense + item.purchase;
                                    const isProfit = item.profit >= 0;
                                    return (
                                      <tr key={month} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                                        <td className="p-4 font-bold text-slate-950 dark:text-slate-150">{formatArabicMonth(month)}</td>
                                        <td className="p-4 text-center font-bold text-emerald-600 dark:text-emerald-450">{item.revenue.toLocaleString()} ج.م</td>
                                        <td className="p-4 text-center text-rose-500 font-medium">{item.expense.toLocaleString()} ج.م</td>
                                        <td className="p-4 text-center text-indigo-500 font-medium">{item.purchase.toLocaleString()} ج.م</td>
                                        <td className="p-4 text-center text-amber-600 dark:text-amber-500 font-bold">{totalCosts.toLocaleString()} ج.م</td>
                                        <td className="p-4 text-center">
                                          <span className={`px-2.5 py-1 rounded-full text-xxs font-extrabold flex items-center justify-center gap-1 mx-auto w-24 ${
                                            isProfit 
                                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800' 
                                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-450 border border-rose-100 dark:border-rose-800'
                                          }`}>
                                            {isProfit ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                                            <span>{item.profit.toLocaleString()} ج.م</span>
                                          </span>
                                        </td>
                                        <td className="p-4 text-center">
                                          <button
                                            onClick={() => handleExportMonthCSV(month)}
                                            className="px-2.5 py-1 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-bold transition text-xxs inline-flex items-center gap-1 cursor-pointer"
                                            title="تحميل كشف حساب تفصيلي عن معاملات هذا الشهر"
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                            <span>تصدير الشهر 📊</span>
                                          </button>
                                        </td>
                                      </tr>
                                    );
                                  })
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
                    );
                  })()}


          </section>

        </main>

        {/* E. NEW CUSTOMER DETAILS POPUP MODAL (Rapid Modal Launch) */}
        {selectedCustomer && (() => {
          const todayStr = new Date().toISOString().slice(0, 10);
          const schedule = selectedCustomer.schedule || [];
          const hasInstallmentToday = schedule.some(
            item => item && item.status === 'unpaid' && (item.date === todayStr || (item.date && item.date.slice(8, 10) === todayStr.slice(8, 10)))
          );
          const currentInstallmentAmount = selectedCustomer.monthlyAmount || (schedule[0]?.amount || 0);

          return (
            <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in no-print" dir="rtl">
              <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-right flex flex-col font-sans transition-colors duration-300">
                
                {/* Header */}
                <div className="p-6 border-b border-slate-150 dark:border-slate-800 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 text-slate-950 dark:text-white flex items-center justify-center font-black text-xl shadow-md transition-colors duration-300">
                      B
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base">كشف الحساب التفصيلي والأقساط 📋</h3>
                      <p className="text-xs text-slate-300 dark:text-slate-400">العميل: <span className="text-white font-extrabold underline">{selectedCustomer.name}</span></p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1.5 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body Grid */}
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                  
                  {/* Column 1: Customer Info & Export/Due Date Templates */}
                  <div className="space-y-6">
                    
                    {/* Block A: Profile Overview */}
                    <div className="bg-slate-50 dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 shadow-sm transition-colors duration-300">
                      <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm border-b dark:border-slate-700 pb-2">بيانات العميل والمعاملة</h4>
                      
                      <div className="space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">حالة الحساب الجاري:</span>
                          <span className={`font-black ${selectedCustomer.type === 'outgoing' ? 'text-amber-700 dark:text-amber-500' : 'text-emerald-700 dark:text-emerald-500'}`}>
                            {selectedCustomer.type === 'outgoing' ? "ليه (مستحق سداد علينا) 💸" : "عليه (مطلوب منه تحصيل) 📥"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">المنتج / البيان:</span>
                          <span className="font-bold text-slate-900 dark:text-slate-100">{selectedCustomer.product}</span>
                        </div>
                        {selectedCustomer.phone && (
                          <div className="flex justify-between">
                            <span className="text-slate-500 dark:text-slate-400">رقم الهاتف للعميل:</span>
                            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">{selectedCustomer.phone}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">مجموع المبلغ الكلي:</span>
                          <span className="font-extrabold text-slate-950 dark:text-white">{(selectedCustomer.totalAmount || 0).toLocaleString()} ج.م.</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 dark:text-slate-400">المدفوع حالياً:</span>
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-500">{(selectedCustomer.paidAmount || 0).toLocaleString()} ج.م.</span>
                        </div>
                        <div className="flex justify-between border-t dark:border-slate-700 pt-2.5 border-slate-200">
                          <span className="text-slate-600 dark:text-slate-300 font-bold">المبلغ المتبقي:</span>
                          <span className="font-black text-rose-700 dark:text-rose-500 text-base">{(selectedCustomer.remainingAmount || 0).toLocaleString()} ج.م.</span>
                        </div>
                        {selectedCustomer.notes && (
                          <div className="border-t dark:border-slate-700 pt-2.5 border-slate-200 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            <span className="font-bold block text-slate-700 dark:text-slate-300">ملاحظات الحساب:</span>
                            {selectedCustomer.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Block B: Export Tools (Fulfilling Client Request) */}
                    <div className="bg-gradient-to-br from-indigo-50/50 to-slate-50 dark:from-indigo-900/20 dark:to-slate-800 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-900/50 space-y-3.5 shadow-sm transition-colors duration-300">
                      <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-sm flex items-center gap-2">
                        <span>تصدير وطباعة الحساب 💾</span>
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">يمكنك حفظ كشف الحساب بالكامل للعميل في ملف نصي لمشاركته معه عبر الواتساب أو حفظه للطباعة السريعة.</p>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => exportCustomerAccountToFile(selectedCustomer)}
                          className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer border border-transparent dark:border-indigo-500"
                        >
                          <FileText className="w-4 h-4" />
                          تصدير كشف الحساب لملف 📄
                        </button>
                      </div>
                    </div>

                    {/* Block C: Due Date WhatsApp Template Generator */}
                    <div className={`p-5 rounded-2xl border space-y-3.5 shadow-sm transition-all duration-300 ${
                      hasInstallmentToday 
                        ? 'bg-rose-50/60 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800/50' 
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}>
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm flex items-center gap-1.5">
                          <span>🔔 قالب استحقاق اليوم (موعد القسط)</span>
                        </h4>
                        {hasInstallmentToday ? (
                          <span className="bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-400 text-[10px] font-black px-2.5 py-0.5 rounded-full animate-pulse border border-rose-200 dark:border-rose-800">
                            اليوم موعد قسط 🚨
                          </span>
                        ) : (
                          <span className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            قالب التذكير جاهز
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] text-slate-500 leading-normal">
                        صيغة جاهزة للتواصل السريع والمهذب مع العميل في يوم قسطه الشهري لإشعاره بالاستحقاق وقيمة المبلغ المطلوب.
                      </p>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-sans select-all relative group">
                        {`السلام عليكم يا غالي ومساء الفل مع حضرتك "بوكس ستور" 🌹. بنفكرك يا طيب إن النهاردة هو موعد استحقاق قسطك الخاص بـ (${selectedCustomer.product || "الأجهزة"}) وقيمته ${currentInstallmentAmount.toLocaleString()} ج.م. يشرفنا سدادك في الفرع أو عبر فودافون كاش، ونسعد دائماً بخدمتك! 🤖💳`}
                        
                        <div className="mt-3 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(
                                `السلام عليكم يا غالي ومساء الفل مع حضرتك "بوكس ستور" 🌹. بنفكرك يا طيب إن النهاردة هو موعد استحقاق قسطك الخاص بـ (${selectedCustomer.product || "الأجهزة"}) وقيمته ${currentInstallmentAmount.toLocaleString()} ج.م. يشرفنا سدادك في الفرع أو عبر فودافون كاش، ونسعد دائماً بخدمتك! 🤖💳`
                              );
                              showToast("تم نسخ رسالة التذكير بنجاح! 📋", "success");
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          >
                            <span>نسخ القالب 📋</span>
                          </button>
                          
                          {selectedCustomer.phone && (
                            <a
                              href={`https://wa.me/${selectedCustomer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                                `السلام عليكم يا غالي ومساء الفل مع حضرتك "بوكس ستور" 🌹. بنفكرك يا طيب إن النهاردة هو موعد استحقاق قسطك الخاص بـ (${selectedCustomer.product || "الأجهزة"}) وقيمته ${currentInstallmentAmount.toLocaleString()} ج.م. يشرفنا سدادك في الفرع أو عبر فودافون كاش، ونسعد دائماً بخدمتك! 🤖💳`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                            >
                              <span>إرسال واتساب مباشرة 💬</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Column 2: Installment Schedule List */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm">جدول الأقساط والمواعيد الشهرية:</h4>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 font-bold transition-colors duration-300">
                        المتبقي: {schedule.filter(i => i && i.status === 'unpaid').length} شهر
                      </span>
                    </div>

                    <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                      {schedule.map((item, idx) => (
                        <div 
                          key={idx} 
                          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs transition-colors duration-300 ${
                            item.status === 'paid' 
                              ? 'bg-emerald-50/60 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 shadow-sm' 
                              : 'bg-white dark:bg-slate-800 border-slate-150 dark:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input 
                              type="checkbox" 
                              checked={item.status === 'paid'}
                              onChange={() => handleToggleInstallment(selectedCustomer.id, item.date)}
                              className="w-4.5 h-4.5 rounded border-slate-300 dark:border-slate-600 text-slate-900 focus:ring-slate-900 cursor-pointer accent-emerald-600 dark:bg-slate-700"
                            />
                            <div className="space-y-0.5">
                              <span className="font-black text-slate-900 dark:text-slate-100 block text-xs">{item.date}</span>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {item.status === 'paid' ? `تم السداد في: ${item.paymentDate || item.date} ✅` : "قيد الانتظار ❌"}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-black text-slate-950 dark:text-white text-sm">{(item.amount || 0).toLocaleString()} ج.م.</span>
                            
                            {/* Print mini-receipt button if paid */}
                            {item.status === 'paid' && (
                              <button 
                                onClick={() => triggerPrintReceipt(selectedCustomer, item)}
                                className="text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg p-1.5 transition cursor-pointer hover:shadow-sm"
                                title="طباعة وصل استلام نقدية"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                        </div>
                      ))}
                    </div>

                    {/* Quick Full Settlement Block */}
                    <div className="pt-4 border-t border-slate-150 dark:border-slate-700 flex flex-col gap-2 transition-colors duration-300">
                      <button
                        onClick={() => {
                          if (selectedCustomer.remainingAmount === 0) {
                            showToast("العميل مسدد بالكامل بالفعل", "info");
                            return;
                          }
                          askConfirmation("هل تريد تسديد كامل المتبقي على هذا العميل؟", () => {
                            const updatedCustomers = data!.activeCustomers.map(c => {
                              if (c.id !== selectedCustomer.id) return c;
                              const updatedSchedule = c.schedule.map(item => ({
                                ...item,
                                status: 'paid' as const,
                                paymentDate: item.status === 'unpaid' ? new Date().toISOString().slice(0, 10) : item.paymentDate
                              }));
                              return {
                                ...c,
                                schedule: updatedSchedule,
                                paidAmount: c.totalAmount,
                                remainingAmount: 0
                              };
                            });
                            saveAllData({ ...data!, activeCustomers: updatedCustomers });
                            const updatedSelect = updatedCustomers.find(c => c.id === selectedCustomer.id);
                            if (updatedSelect) setSelectedCustomer(updatedSelect);
                            showToast("تم تسديد كامل المبلغ المتبقي بنجاح! 🎉", "success");
                          });
                        }}
                        className="w-full flex items-center justify-center gap-1.5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition shadow-sm cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        تسديد كامل المبلغ المتبقي للعميل ✅
                      </button>
                    </div>

                  </div>

                </div>

                {/* Footer Controls */}
                <div className="p-6 border-t border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex flex-wrap justify-between items-center rounded-b-2xl gap-3 transition-colors duration-300">
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditCustomerModal(selectedCustomer)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs transition shadow-sm cursor-pointer border border-transparent dark:border-slate-600"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      تعديل الحساب والأقساط ✏️
                    </button>
                    
                    <button
                      onClick={() => {
                        askConfirmation(`هل أنت متأكد من حذف كشف حساب العميل "${selectedCustomer.name}" نهائياً من السيستم؟`, () => {
                          const updatedCustomers = data!.activeCustomers.filter(c => c.id !== selectedCustomer.id);
                          saveAllData({ ...data!, activeCustomers: updatedCustomers });
                          setSelectedCustomer(null);
                          showToast("تم حذف كشف حساب العميل بنجاح.", "success");
                        });
                      }}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-400 font-bold text-xs transition border border-rose-250 dark:border-rose-800/50 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      حذف الحساب بالكامل 🗑️
                    </button>
                  </div>

                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="px-6 py-2.5 border border-slate-250 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition text-xs cursor-pointer"
                  >
                    إغلاق النافذة ✕
                  </button>
                </div>

              </div>
            </div>
          );
        })()}

        {/* D. Collapsible Create/Add Modal Frame */}
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl border border-slate-200 dark:border-slate-800 text-right transition-colors duration-300">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">إضافة سجل مالي جديد</h3>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Type Tab Toggles */}
              <div className="p-6 pb-0 flex gap-2 border-b border-slate-100 dark:border-slate-800 overflow-x-auto hide-scrollbar">
                <button 
                  onClick={() => setAddType('active')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${addType === 'active' ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  عميل قسط تفصيلي
                </button>
                <button 
                  onClick={() => setAddType('quick')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${addType === 'quick' ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  قسط جاري سريع
                </button>
                <button 
                  onClick={() => setAddType('circle')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${addType === 'circle' ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  جمعية شهرية
                </button>
                <button 
                  onClick={() => setAddType('invoice')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${addType === 'invoice' ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  فاتورة مبيعات
                </button>
                <button 
                  onClick={() => setAddType('expense')}
                  className={`pb-3 px-4 text-xs font-bold border-b-2 transition whitespace-nowrap ${addType === 'expense' ? 'border-slate-900 dark:border-slate-100 text-slate-900 dark:text-slate-100' : 'border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  مصروف / فاتورة المحل
                </button>
              </div>

              {/* Dynamic Form content */}
              <form onSubmit={handleCreateRecord} className="p-6 space-y-4">
                
                {/* 1. Active Customer fields */}
                {addType === 'active' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">اسم العميل بالكامل *</label>
                        <input 
                          type="text" 
                          required
                          value={cName} 
                          onChange={(e) => setCName(e.target.value)} 
                          placeholder="مثال: يوسف غريب"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">رقم الهاتف</label>
                        <input 
                          type="text" 
                          value={cPhone} 
                          onChange={(e) => setCPhone(e.target.value)} 
                          placeholder="مثال: 01119757425"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">البيان / المنتج المستلم *</label>
                        <input 
                          type="text" 
                          required
                          value={cProduct} 
                          onChange={(e) => setCProduct(e.target.value)} 
                          placeholder="مثال: iphone 13 Pro Max"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">نوع المعاملة *</label>
                        <select 
                          value={cType} 
                          onChange={(e) => setCType(e.target.value as 'incoming' | 'outgoing')}
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        >
                          <option value="incoming">عليه (عميل مديون لنا - وارد للمحل)</option>
                          <option value="outgoing">ليه (جهة دائنة لنا - مستحق علينا سداد)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">القيمة الإجمالية (ج.م.) *</label>
                        <input 
                          type="number" 
                          required
                          value={cTotal} 
                          onChange={(e) => setCTotal(e.target.value)} 
                          placeholder="19200"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">الدفعة المقدمة (ج.م.)</label>
                        <input 
                          type="number" 
                          value={cPaid} 
                          onChange={(e) => setCPaid(e.target.value)} 
                          placeholder="0"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">عدد شهور التقسيط *</label>
                        <input 
                          type="number" 
                          required
                          value={cMonths} 
                          onChange={(e) => setCMonths(e.target.value)} 
                          placeholder="6"
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">تاريخ بدء أول قسط *</label>
                        <input 
                          type="date" 
                          required
                          value={cStartDate} 
                          onChange={(e) => setCStartDate(e.target.value)} 
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 transition-colors"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">قيمة القسط الشهري (اختياري)</label>
                        <input 
                          type="number" 
                          value={cMonthly} 
                          onChange={(e) => setCMonthly(e.target.value)} 
                          placeholder="سيتم حسابها تلقائياً إن تركت فارغة"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">ملاحظات وشروط القسط</label>
                      <textarea 
                        value={cNotes} 
                        onChange={(e) => setCNotes(e.target.value)} 
                        rows={3}
                        placeholder="دون هنا أي ملاحظات أخرى بخصوص الضمان أو التبديل"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* 2. Quick Installment Fields */}
                {addType === 'quick' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">اسم العميل ثنائي/ثلاثي *</label>
                      <input 
                        type="text" 
                        required
                        value={qName} 
                        onChange={(e) => setQName(e.target.value)} 
                        placeholder="مثال: يوسف بدر"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">قيمة القسط الشهري (ج.م.) *</label>
                      <input 
                        type="number" 
                        required
                        value={qAmount} 
                        onChange={(e) => setQAmount(e.target.value)} 
                        placeholder="1300"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">رقم الهاتف (واتساب)</label>
                      <input 
                        type="text" 
                        value={qPhone} 
                        onChange={(e) => setQPhone(e.target.value)} 
                        placeholder="مثال: 01119757425"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">البيان / ملاحظات سريعة</label>
                      <input 
                        type="text" 
                        value={qNotes} 
                        onChange={(e) => setQNotes(e.target.value)} 
                        placeholder="قسط شهري عادي"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* 3. Money Circle Fields */}
                {addType === 'circle' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">اسم العضو / اسم الجمعية *</label>
                      <input 
                        type="text" 
                        required
                        value={circleName} 
                        onChange={(e) => setCircleName(e.target.value)} 
                        placeholder="مثال: جمعية الـ 5000"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">قيمة المبلغ الكلي *</label>
                        <input 
                          type="number" 
                          required
                          value={circleTotal} 
                          onChange={(e) => setCircleTotal(e.target.value)} 
                          placeholder="5000"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">القسط الشهري *</label>
                        <input 
                          type="number" 
                          required
                          value={circleMonthly} 
                          onChange={(e) => setCircleMonthly(e.target.value)} 
                          placeholder="5000"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">المدة بالشهور *</label>
                        <input 
                          type="number" 
                          required
                          value={circleMonths} 
                          onChange={(e) => setCircleMonths(e.target.value)} 
                          placeholder="1"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">تاريخ بدء الجمعية *</label>
                      <input 
                        type="date" 
                        required
                        value={circleStart} 
                        onChange={(e) => setCircleStart(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">ملاحظات الجمعية</label>
                      <textarea 
                        value={circleNotes} 
                        onChange={(e) => setCircleNotes(e.target.value)} 
                        rows={2}
                        placeholder="دفعت أول الجمعية..."
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* 4. Invoice fields */}
                {addType === 'invoice' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">رقم الفاتورة *</label>
                        <input 
                          type="text" 
                          required
                          value={invId} 
                          onChange={(e) => setInvId(e.target.value)} 
                          placeholder="مثال: 947"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">تاريخ الفاتورة *</label>
                        <input 
                          type="date" 
                          required
                          value={invDate} 
                          onChange={(e) => setInvDate(e.target.value)} 
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">اسم العميل بالكامل *</label>
                      <input 
                        type="text" 
                        required
                        value={invClient} 
                        onChange={(e) => setInvClient(e.target.value)} 
                        placeholder="احمد حلمي محمد متولي"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">الوصف / البيان المستلم *</label>
                        <input 
                          type="text" 
                          required
                          value={invItem} 
                          onChange={(e) => setInvItem(e.target.value)} 
                          placeholder="iphone 13 Pro Max 256G 100% Black"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">الرقم التسلسلي الجهاز (S/N)</label>
                        <input 
                          type="text" 
                          value={invSerial} 
                          onChange={(e) => setInvSerial(e.target.value)} 
                          placeholder="356514418587283"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">القيمة الكلية (ج.م.) *</label>
                        <input 
                          type="number" 
                          required
                          value={invAmount} 
                          onChange={(e) => setInvAmount(e.target.value)} 
                          placeholder="37000"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600">اسم المتجر الصادر منه الفاتورة</label>
                        <input 
                          type="text" 
                          required
                          value={invStore} 
                          onChange={(e) => setInvStore(e.target.value)} 
                          placeholder="بوكس ستور (Box Store)"
                          className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">عنوان المتجر</label>
                      <input 
                        type="text" 
                        required
                        value={invAddress} 
                        onChange={(e) => setInvAddress(e.target.value)} 
                        placeholder="9 ش ترعه السواحل / الوراق، الجيزة"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                )}

                {/* 5. Expense fields */}
                {addType === 'expense' && (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">عنوان المصروف / الالتزام *</label>
                      <input 
                        type="text" 
                        required
                        value={expTitle} 
                        onChange={(e) => setExpTitle(e.target.value)} 
                        placeholder="مثال: إيجار المحل، فاتورة النت، فاتورة كهرباء"
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">القيمة بالجنيه *</label>
                        <input 
                          type="number" 
                          required
                          value={expAmount} 
                          onChange={(e) => setExpAmount(e.target.value)} 
                          placeholder="4000"
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">تاريخ الاستحقاق *</label>
                        <input 
                          type="date" 
                          required
                          value={expDueDate} 
                          onChange={(e) => setExpDueDate(e.target.value)} 
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">التصنيف *</label>
                        <select
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value as any)}
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                        >
                          <option value="rent">إيجار المحل</option>
                          <option value="internet">فاتورة النت</option>
                          <option value="electricity">فاتورة كهرباء</option>
                          <option value="salary">مرتبات</option>
                          <option value="maintenance">صيانة وتجهيز</option>
                          <option value="other">أخرى</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">تكرار المصروف *</label>
                        <select
                          value={expRecurring}
                          onChange={(e) => setExpRecurring(e.target.value as any)}
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                        >
                          <option value="one-time">مرة واحدة</option>
                          <option value="monthly">شهرياً</option>
                          <option value="yearly">سنوياً</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-600 dark:text-slate-400">حالة الدفع *</label>
                        <select
                          value={expStatus}
                          onChange={(e) => setExpStatus(e.target.value as any)}
                          className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                        >
                          <option value="unpaid">غير مدفوع (معلق)</option>
                          <option value="paid">مدفوع</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">ملاحظات</label>
                      <textarea 
                        value={expNotes} 
                        onChange={(e) => setExpNotes(e.target.value)} 
                        placeholder="أدخل أي ملاحظات إضافية حول المصروف هنا..."
                        rows={2}
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Footer Buttons */}
                <div className="border-t pt-4 border-slate-100 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
                  >
                    إلغاء
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition shadow-sm"
                  >
                    حفظ المستند 💾
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

        {/* E. Collapsible Edit Active Customer Modal */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800 text-right flex flex-col transition-colors duration-300">
              
              {/* Modal Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <Pencil className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-slate-100">تعديل بيانات العميل والأقساط</h3>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Section 1: Customer Info */}
                <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-xl border border-slate-150 dark:border-slate-700 space-y-4">
                  <h4 className="font-extrabold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">البيانات الأساسية للعميل</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">اسم العميل بالكامل *</label>
                      <input 
                        type="text" 
                        required
                        value={editCustomerName} 
                        onChange={(e) => setEditCustomerName(e.target.value)} 
                        className="w-full border border-slate-200 dark:border-slate-700 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600 dark:text-slate-400">رقم الهاتف</label>
                      <input 
                        type="text" 
                        value={editCustomerPhone} 
                        onChange={(e) => setEditCustomerPhone(e.target.value)} 
                        placeholder="01xxxxxxxxx"
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white font-mono text-left"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">البيان / نوع الجهاز *</label>
                      <input 
                        type="text" 
                        required
                        value={editCustomerProduct} 
                        onChange={(e) => setEditCustomerProduct(e.target.value)} 
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-600">نوع العملية</label>
                      <select
                        value={editCustomerType}
                        onChange={(e) => setEditCustomerType(e.target.value as 'incoming' | 'outgoing')}
                        className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                      >
                        <option value="incoming">عليه (عميل مديون لنا - وارد للمحل)</option>
                        <option value="outgoing">ليه (جهة دائنة لنا - مستحق علينا سداد)</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600">ملاحظات إضافية</label>
                    <textarea 
                      value={editCustomerNotes} 
                      onChange={(e) => setEditCustomerNotes(e.target.value)} 
                      rows={2}
                      className="w-full border border-slate-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                    />
                  </div>
                </div>

                {/* Section 2: Manage Schedule (Installments) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">جدول الأقساط الشهرية</h4>
                      <p className="text-xs text-slate-500">يمكنك تعديل تواريخ الأقساط، قيمتها، أو حذف وإضافة أقساط جديدة.</p>
                    </div>
                    <div className="flex gap-2 font-sans">
                      <button
                        type="button"
                        onClick={handlePayAllRemainingInEdit}
                        className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition cursor-pointer"
                      >
                        تسديد الكل 💸
                      </button>
                      <button
                        type="button"
                        onClick={handleAddEditInstallmentRow}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        إضافة قسط إضافي ➕
                      </button>
                    </div>
                  </div>

                  {/* Table list of editCustomerSchedule */}
                  <div className="border border-slate-150 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold text-[11px] border-b border-slate-150">
                          <th className="p-3 text-center w-12">#</th>
                          <th className="p-3">تاريخ الاستحقاق</th>
                          <th className="p-3">المبلغ المستحق (ج.م.)</th>
                          <th className="p-3">حالة السداد</th>
                          <th className="p-3 text-center w-16">إجراء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editCustomerSchedule.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                              لا توجد أقساط مسجلة حالياً للعميل. اضغط على "إضافة قسط إضافي" للبدء.
                            </td>
                          </tr>
                        ) : (
                          editCustomerSchedule.map((item, index) => (
                            <tr key={index} className="border-b border-slate-100 last:border-b-0 text-xs hover:bg-slate-50/50 transition">
                              <td className="p-3 text-center text-slate-400 font-semibold">{index + 1}</td>
                              <td className="p-3">
                                <input 
                                  type="date" 
                                  required
                                  value={item.date} 
                                  onChange={(e) => handleUpdateEditScheduleRow(index, 'date', e.target.value)}
                                  className="border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-mono"
                                />
                              </td>
                              <td className="p-3">
                                <input 
                                  type="number" 
                                  required
                                  value={item.amount} 
                                  onChange={(e) => handleUpdateEditScheduleRow(index, 'amount', Number(e.target.value))}
                                  className="border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white font-semibold w-28"
                                />
                              </td>
                              <td className="p-3">
                                <select
                                  value={item.status}
                                  onChange={(e) => handleUpdateEditScheduleRow(index, 'status', e.target.value as 'paid' | 'unpaid')}
                                  className={`border rounded-lg px-2 py-1 font-bold focus:outline-none focus:ring-1 focus:ring-slate-900 cursor-pointer ${
                                    item.status === 'paid' 
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                      : 'bg-rose-50 text-rose-800 border-rose-200'
                                  }`}
                                >
                                  <option value="unpaid">قيد الانتظار ⏳</option>
                                  <option value="paid">تم السداد ✅</option>
                                </select>
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveEditScheduleRow(index)}
                                  className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                  title="حذف القسط"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Realtime Summary Card */}
                  <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap gap-4 justify-between items-center">
                    <div className="flex gap-4 flex-wrap">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-semibold">إجمالي الأقساط (الكلي):</span>
                        <span className="text-sm font-bold">
                          {editCustomerSchedule.reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()} ج.م.
                        </span>
                      </div>
                      <div className="border-r border-slate-700 pr-4">
                        <span className="text-[10px] text-slate-400 block font-semibold">إجمالي المسدد:</span>
                        <span className="text-sm font-bold text-emerald-400">
                          {editCustomerSchedule.filter(item => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0).toLocaleString()} ج.م.
                        </span>
                      </div>
                      <div className="border-r border-slate-700 pr-4">
                        <span className="text-[10px] text-slate-400 block font-semibold">المتبقي المطلوب:</span>
                        <span className="text-sm font-bold text-rose-400">
                          {Math.max(0, editCustomerSchedule.reduce((sum, item) => sum + Number(item.amount), 0) - editCustomerSchedule.filter(item => item.status === 'paid').reduce((sum, item) => sum + Number(item.amount), 0)).toLocaleString()} ج.م.
                        </span>
                      </div>
                    </div>
                    <span className="text-xs bg-slate-800 px-3 py-1 rounded-full text-slate-300">
                      عدد الدفعات: {editCustomerSchedule.length} أشهر
                    </span>
                  </div>

                </div>

              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-slate-100 flex justify-end gap-3 bg-slate-50 rounded-b-2xl">
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl transition cursor-pointer"
                >
                  إلغاء التراجع
                </button>
                <button 
                  type="button" 
                  onClick={handleSaveCustomerEdit}
                  className="px-5 py-2 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white rounded-xl transition shadow-sm cursor-pointer"
                >
                  حفظ التعديلات بالكامل 💾
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* Custom Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 left-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border text-sm ${
          toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
          toast.type === 'error' ? 'bg-rose-50 text-rose-800 border-rose-200' :
          'bg-blue-50 text-blue-800 border-blue-200'
        }`}>
          {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-600" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
          <span className="font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Custom Confirm Dialog Modal */}
      {confirmConfig && (
        <div className="fixed inset-0 bg-slate-900/55 backdrop-blur-sm flex items-center justify-center p-4 z-50" dir="rtl">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <h3 className="font-bold text-lg text-slate-900">تأكيد الإجراء</h3>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed font-sans">
              {confirmConfig.message}
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setConfirmConfig(null)}
                className="px-4 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
              >
                تراجع
              </button>
              <button 
                onClick={() => {
                  confirmConfig.onConfirm();
                  setConfirmConfig(null);
                }}
                className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition"
              >
                تأكيد الحذف 🗑️
              </button>
            </div>
          </div>
        </div>
      )}

      {/* G. BACKUP & EXCEL EXPORT/IMPORT SYSTEM MODAL */}
      {isBackupModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in no-print" dir="rtl">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-right flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-emerald-400" />
                <div>
                  <h3 className="font-extrabold text-base">مركز إدارة واستيراد البيانات والنسخ الاحتياطي 💾</h3>
                  <p className="text-[10px] text-slate-300">تصدير كافة الحسابات والجداول والأقساط كملفات Excel أو نسخ احتياطية كاملة</p>
                </div>
              </div>
              <button 
                onClick={() => setIsBackupModalOpen(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto text-sm">
              
              {/* Part 1: Full System Backup (JSON) */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/20 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2 border-slate-200">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black">١</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">النسخ الاحتياطي الكامل للسيستم واسترجاعه (JSON Backup)</h4>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  يقوم هذا الخيار بحفظ نسخة مشفرة كاملة من جميع قواعد بيانات البرنامج (الأقساط التفصيلية، الأقساط السريعة، مبيعات الفواتير، الجمعيات) في ملف واحد. يمكنك تحميله والاحتفاظ به واسترجاعه في أي وقت على أي جهاز آخر بنسبة 100%.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={handleExportBackupJSON}
                    className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    تصدير وحفظ النسخة الاحتياطية الآن 📤
                  </button>

                  <label className="flex-1">
                    <div className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center">
                      <RotateCw className={`w-4 h-4 ${isImportingBackup ? 'animate-spin' : ''}`} />
                      <span>{isImportingBackup ? 'جاري استيراد الحسابات...' : 'استيراد واستعادة نسخة احتياطية 📥'}</span>
                    </div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackupJSON}
                      disabled={isImportingBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Part 2: Microsoft Excel Exports (CSV) */}
              <div className="bg-gradient-to-br from-slate-50 to-sky-50/20 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2 border-b pb-2 border-slate-200">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black">٢</span>
                  <h4 className="font-extrabold text-slate-900 text-sm">تصدير جداول الحسابات إلى ملفات Excel (CSV)</h4>
                </div>
                
                <p className="text-xs text-slate-600 leading-relaxed">
                  تصدير كشوفات الحسابات المحددة إلى صيغة CSV المتوافقة بالكامل مع Microsoft Excel والهواتف الذكية مع الحفاظ على الحروف العربية سليمة 100%:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  
                  {/* Table 1: Active customers */}
                  <button
                    onClick={() => {
                      if (!data || !data.activeCustomers) return;
                      const headers = ["الاسم بالكامل", "المنتج / المعاملة", "رقم الهاتف", "المبلغ الكلي", "المدفوع", "المتبقي", "عدد الشهور", "القسط الشهري", "تاريخ البدء", "نوع المعاملة", "ملاحظات"];
                      const rows = (data.activeCustomers || []).map(c => [
                        c.name,
                        c.product,
                        c.phone || "غير مسجل",
                        c.totalAmount.toString() + " ج.م",
                        c.paidAmount.toString() + " ج.م",
                        c.remainingAmount.toString() + " ج.م",
                        c.monthsCount.toString(),
                        c.monthlyAmount.toString() + " ج.م",
                        c.startDate,
                        c.type === 'incoming' ? 'مطلوب تحصيل' : 'مستحق علينا',
                        c.notes || ""
                      ]);
                      downloadCSV("جدول_كشوفات_الأقساط_التفصيلية.csv", headers, rows);
                    }}
                    className="py-3 px-4 bg-white border border-slate-250 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    تصدير الأقساط التفصيلية 📊
                  </button>

                  {/* Table 2: Quick installments */}
                  <button
                    onClick={() => {
                      if (!data || !data.quickInstallments) return;
                      const headers = ["الاسم", "رقم الهاتف", "التاريخ والوقت", "المبلغ المستحق", "حالة القسط", "ملاحظات"];
                      const rows = (data.quickInstallments || []).map(q => [
                        q.name,
                        q.phone || "غير مسجل",
                        "",
                        q.amount.toString() + " ج.م",
                        q.status === 'paid' ? 'تم الدفع' : 'غير مدفوع',
                        q.notes || ""
                      ]);
                      downloadCSV("جدول_الأقساط_السريعة.csv", headers, rows);
                    }}
                    className="py-3 px-4 bg-white border border-slate-250 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    تصدير الأقساط السريعة 📊
                  </button>

                  {/* Table 3: Money Circles */}
                  <button
                    onClick={() => {
                      if (!data || !data.moneyCircles) return;
                      const headers = ["اسم الجمعية", "رئيس الجمعية", "قيمة القسط", "المبلغ الإجمالي الكلي", "الحد الأقصى للمشتركين", "تاريخ البدء", "حالة الجمعية"];
                      const rows = (data.moneyCircles || []).map(c => [
                        c.name,
                        "",
                        c.monthlyPayment.toString() + " ج.م",
                        c.totalAmount.toString() + " ج.م",
                        c.monthsCount.toString(),
                        c.startDate,
                        c.status === 'active' ? 'نشطة' : 'منتهية'
                      ]);
                      downloadCSV("جدول_الجمعيات_الشهرية.csv", headers, rows);
                    }}
                    className="py-3 px-4 bg-white border border-slate-250 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    تصدير سجل الجمعيات 📊
                  </button>

                  {/* Table 4: Invoices */}
                  <button
                    onClick={() => {
                      if (!data || !data.invoices) return;
                      const headers = ["رقم الفاتورة", "العميل", "الهاتف", "المنتج المباع", "الرقم التسلسلي S/N", "التاريخ", "المبلغ الكلي للمبيعات"];
                      const rows = (data.invoices || []).map(inv => [
                        inv.id,
                        inv.clientName,
                        "غير مسجل",
                        inv.itemName,
                        inv.serialNumber || "N/A",
                        inv.date,
                        inv.amount.toString() + " ج.م"
                      ]);
                      downloadCSV("جدول_مبيعات_الفواتير.csv", headers, rows);
                    }}
                    className="py-3 px-4 bg-white border border-slate-250 hover:bg-slate-50 text-slate-800 font-extrabold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    تصدير فواتير المبيعات 📊
                  </button>

                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setIsBackupModalOpen(false)}
                className="px-6 py-2.5 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                إغلاق مركز البيانات ✕
              </button>
            </div>

          </div>
        </div>
      )}

      {/* F. IPHONE SYNC & NOTE PARSER MODAL */}
      {isIphoneModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" dir="rtl">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 text-right flex flex-col font-sans">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-150 flex justify-between items-center bg-slate-900 text-white rounded-t-2xl sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <Smartphone className="w-6 h-6 text-sky-400" />
                <div>
                  <h3 className="font-extrabold text-base">بوابة المزامنة والربط مع الآيفون 📱</h3>
                  <p className="text-[10px] text-slate-300">طرق سهلة وحقيقية لعرض ومزامنة أقساطك من وإلى جهاز الآيفون الخاص بك</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setIsIphoneModalOpen(false);
                  setIphoneNoteText("");
                  setParsedNoteResult(null);
                }}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8 overflow-y-auto">
              
              {/* Option 1: PWA Installation Guide */}
              <div className="bg-gradient-to-br from-slate-50 to-sky-50/30 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black">١</span>
                  <h4 className="font-black text-slate-900 text-sm">تثبيت التطبيق كبرنامج مستقل على شاشة الآيفون</h4>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  يمكنك تصفح وإدارة البرنامج من جهاز الآيفون الخاص بك في أي مكان وبسرعة البرق، ليظهر كأيقونة على شاشتك الرئيسية كأنه تطبيق حقيقي:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px] font-bold text-slate-700">
                  <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col justify-between gap-1.5">
                    <span className="text-sky-600">الخطوة الأولى 🌐</span>
                    <p className="font-medium text-slate-600 leading-normal">افتح هذا الرابط من متصفح <span className="font-extrabold text-slate-800">Safari</span> على الآيفون.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col justify-between gap-1.5">
                    <span className="text-sky-600">الخطوة الثانية 📤</span>
                    <p className="font-medium text-slate-600 leading-normal">اضغط على زر <span className="font-extrabold text-slate-800">المشاركة (Share)</span> الموجود في شريط متصفح سفاري بالأسفل.</p>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-150 flex flex-col justify-between gap-1.5">
                    <span className="text-sky-600">الخطوة الثالثة 📲</span>
                    <p className="font-medium text-slate-600 leading-normal">اختر <span className="font-extrabold text-slate-800">"إضافة إلى الشاشة الرئيسية" (Add to Home Screen)</span> ثم اضغط إضافة.</p>
                  </div>
                </div>
              </div>

              {/* Option 2: Apple Calendar Sync (.ics) */}
              <div className="bg-gradient-to-br from-slate-50 to-emerald-50/30 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black">٢</span>
                    <h4 className="font-black text-slate-900 text-sm">مزامنة الأقساط مع تقويم الآيفون (Apple Calendar)</h4>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-2 py-0.5 rounded-md">جديد وحصري 📅</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  احصل على مواعيد استحقاق الأقساط والتحصيل مباشرة على تقويم جهاز الآيفون الخاص بك لتلقي تنبيهات وإشعارات دورية دون الحاجة لفتح البرنامج:
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="text-[11px] text-slate-500 max-w-sm">
                    عند تحميل الملف، سيقوم الآيفون بفتح تطبيق التقويم الرسمي لدمج كافة تواريخ الأقساط غير المدفوعة تلقائياً.
                  </div>
                  <a
                    href="/api/installments/ical"
                    className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition shadow-sm border border-slate-700 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>تحميل ملف تقويم الأقساط للآيفون (.ics)</span>
                  </a>
                </div>
              </div>

              {/* Option 3: Intelligent Note Parser */}
              <div className="bg-gradient-to-br from-slate-50 to-indigo-50/30 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-black">٣</span>
                    <h4 className="font-black text-slate-900 text-sm">مستورد ومحلل ملاحظات الآيفون بالذكاء الاصطناعي</h4>
                  </div>
                  <span className="bg-slate-900 text-indigo-400 text-[9px] font-black px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> جيميناي 3.5
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  انسخ أي نص ملاحظة مكتوبة أو عشوائية من تطبيق الملاحظات الخاص بك (مثل: "التكييف جاي يوم ٧/٧ وقسط ١١٠٠ على ١٢ شهر...") والزقها هنا وسيقوم الذكاء الاصطناعي باستخراج كافة تفاصيلها فوراً!
                </p>
                
                <div className="space-y-3">
                  <textarea
                    value={iphoneNoteText}
                    onChange={(e) => setIphoneNoteText(e.target.value)}
                    placeholder="الصق نص الملاحظة المنسوخ من آيفونك هنا..."
                    rows={4}
                    className="w-full p-4 border border-slate-250 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-950 bg-white text-xs font-medium leading-relaxed"
                  />
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleParseIphoneNote}
                      disabled={isParsingNote || !iphoneNoteText.trim()}
                      className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer disabled:bg-slate-100 disabled:text-slate-400"
                    >
                      {isParsingNote ? (
                        <>
                          <RotateCw className="w-4 h-4 animate-spin text-sky-400" />
                          <span>جاري الفك والتحليل الذكي...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
                          <span>تحليل وفك نص الملاحظة 🤖</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Parsed Note Result Preview */}
                {parsedNoteResult && (
                  <div className="mt-4 bg-white p-5 rounded-xl border border-indigo-200 shadow-md space-y-4 animate-fade-in text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-900 font-extrabold pb-2 border-b border-indigo-100">
                      <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                      <span>البيانات المستخلصة من الملاحظة:</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">اسم العميل المقترح</span>
                        <p className="font-extrabold text-slate-800">{parsedNoteResult.name}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">المنتج</span>
                        <p className="font-extrabold text-slate-800">{parsedNoteResult.product || "غير محدد"}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">إجمالي المبلغ</span>
                        <p className="font-extrabold text-emerald-700">{parsedNoteResult.totalAmount?.toLocaleString()} ج.م.</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">مدة الأقساط</span>
                        <p className="font-extrabold text-slate-800">{parsedNoteResult.monthsCount} شهور</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">القسط الشهري</span>
                        <p className="font-extrabold text-slate-800">{parsedNoteResult.monthlyAmount?.toLocaleString()} ج.م.</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">تاريخ البداية</span>
                        <p className="font-extrabold text-slate-800">{parsedNoteResult.startDate}</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">المبلغ المدفوع</span>
                        <p className="font-extrabold text-slate-800">{parsedNoteResult.paidAmount?.toLocaleString() || 0} ج.م.</p>
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 font-bold">المبلغ المتبقي</span>
                        <p className="font-extrabold text-slate-800">{parsedNoteResult.remainingAmount?.toLocaleString() || 0} ج.م.</p>
                      </div>
                    </div>

                    <div className="bg-indigo-50 p-3 rounded-lg text-indigo-900 border border-indigo-100 font-medium whitespace-pre-wrap leading-relaxed text-[11px]">
                      <span className="font-bold text-xs block mb-1">الملاحظة الكاملة المستوردة:</span>
                      {parsedNoteResult.notes}
                    </div>

                    <div className="flex gap-2 justify-end pt-2">
                      <button
                        onClick={() => setParsedNoteResult(null)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition text-[11px] cursor-pointer"
                      >
                        إعادة المحاولة ✕
                      </button>
                      <button
                        onClick={handleImportParsedNote}
                        className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white font-extrabold rounded-lg transition text-[11px] flex items-center gap-1.5 shadow-sm border border-slate-800 cursor-pointer"
                      >
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span>تأكيد واستيراد القسط فوراً 📥</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setIsIphoneModalOpen(false);
                  setIphoneNoteText("");
                  setParsedNoteResult(null);
                }}
                className="px-6 py-2 border border-slate-250 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl transition text-xs cursor-pointer"
              >
                إغلاق البوابة ✕
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. FLOATING AI ASSISTANT (BOXY) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3.5 font-sans no-print" dir="rtl">
        {/* Chat Window */}
        {isChatOpen && (
          <div className="w-[360px] md:w-[400px] h-[540px] bg-white/70 backdrop-blur-2xl border border-white/40 rounded-2xl shadow-[0_20px_50px_rgba(15,23,42,0.15)] flex flex-col overflow-hidden transition-all duration-300 transform scale-100 origin-bottom-right">
            
            {/* Header */}
            <div className="bg-slate-950/85 text-white px-4.5 py-3.5 flex justify-between items-center border-b border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-400 to-teal-500 flex items-center justify-center text-slate-950 font-black text-base relative shadow-md">
                  B
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-ping"></span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full"></span>
                </div>
                <div>
                  <h3 className="font-bold text-xs text-white">مساعد بوكسي الذكي 🤖</h3>
                  <p className="text-[9px] text-emerald-400 flex items-center gap-1 font-semibold">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span> متصل وجاهز للخدمة
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsChatOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Thread */}
            <div id="chat-thread" className="flex-1 overflow-y-auto p-4 bg-transparent space-y-4 flex flex-col scrollbar-thin">
              {chatMessages.map(msg => (
                <div 
                  key={msg.id}
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-sm transition-all duration-200 transform hover:scale-[1.01] ${
                    msg.role === 'user' 
                      ? 'bg-slate-900/90 text-white rounded-tl-none border border-white/10 self-end' 
                      : 'bg-white/80 backdrop-blur-md text-slate-800 border border-white/60 rounded-tr-none self-start shadow-sm shadow-slate-100/50'
                  }`}
                >
                  {/* Attachments rendering */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.attachments.map((att, idx) => {
                        const isImg = att.type.startsWith("image/");
                        return (
                          <div 
                            key={idx} 
                            className="relative rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 bg-white/10 max-w-[150px] shadow-sm"
                          >
                            {isImg ? (
                              <img 
                                src={`data:${att.type};base64,${att.base64}`} 
                                alt={att.name} 
                                referrerPolicy="no-referrer"
                                className="w-full max-h-24 object-cover rounded cursor-zoom-in"
                                onClick={() => {
                                  const win = window.open();
                                  if (win) {
                                    win.document.write(`<img src="data:${att.type};base64,${att.base64}" style="max-width:100%; max-height:100vh; display:block; margin:auto; border-radius:8px;" />`);
                                  }
                                }}
                              />
                            ) : (
                              <div className="p-2 flex items-center gap-1.5 text-[10px] text-slate-700 dark:text-slate-200 truncate">
                                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                                <span className="truncate max-w-[100px]" title={att.name}>{att.name}</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <p className="whitespace-pre-line font-medium leading-normal">{msg.text}</p>
                  <span className={`block text-[9px] mt-1 text-right font-medium ${msg.role === 'user' ? 'text-slate-300' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {chatLoading && (
                <div className="bg-white/80 backdrop-blur-md text-slate-800 border border-white/65 rounded-2xl rounded-tr-none px-4 py-3 text-xs self-start max-w-[85%] shadow-sm flex items-center gap-2.5">
                  <span className="font-semibold text-slate-600 text-[10px]">بوكسي يفكر ويكتب...</span>
                  <div className="flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions Chips */}
            <div className="px-3 py-2 bg-white/40 backdrop-blur-md border-t border-white/30 overflow-x-auto flex gap-1.5 scrollbar-none">
              <button 
                onClick={() => sendChatMessage("ما هي الأقساط المستحقة هذا الشهر؟")}
                className="text-[10px] font-bold text-slate-800 bg-white hover:bg-white border border-white/85 px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition shadow-sm"
              >
                ما المستحق هذا الشهر؟ 📅
              </button>
              <button 
                onClick={() => sendChatMessage("سجل أن إبراهيم سواده سدد قسط شهر يوليو")}
                className="text-[10px] font-bold text-slate-800 bg-white hover:bg-white border border-white/85 px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition shadow-sm"
              >
                سداد قسط إبراهيم سواده 💳
              </button>
              <button 
                onClick={() => sendChatMessage("عرض تقرير عام للمحل")}
                className="text-[10px] font-bold text-slate-800 bg-white hover:bg-white border border-white/85 px-3 py-1 rounded-full whitespace-nowrap cursor-pointer transition shadow-sm"
              >
                تقرير الأقساط بالكامل 📊
              </button>
            </div>

            {/* Input Form */}
            {chatAttachments.length > 0 && (
              <div className="px-3 py-2 bg-slate-50/95 dark:bg-slate-900/95 border-t border-white/20 flex flex-wrap gap-2">
                {chatAttachments.map((att, idx) => {
                  const isImg = att.type.startsWith("image/");
                  return (
                    <div 
                      key={idx} 
                      className="relative rounded-lg border border-slate-300 dark:border-slate-700 p-1 bg-white dark:bg-slate-800 flex items-center gap-1.5 shadow-sm pr-6 max-w-[150px] truncate"
                    >
                      {isImg ? (
                        <img 
                           src={`data:${att.type};base64,${att.base64}`} 
                           alt={att.name} 
                           className="w-8 h-8 object-cover rounded" 
                        />
                      ) : (
                        <FileText className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                      )}
                      <span className="text-[10px] truncate max-w-[80px]" title={att.name}>{att.name}</span>
                      <button 
                        onClick={() => removeChatAttachment(idx)}
                        className="absolute top-0.5 right-0.5 p-0.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 transition cursor-pointer"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="p-3 bg-white/65 backdrop-blur-md border-t border-white/40 flex gap-2 items-center">
              {/* Hidden File Input */}
              <input 
                type="file" 
                id="chat-file-upload" 
                multiple 
                accept="image/*,application/pdf,text/plain,text/csv,application/json"
                className="hidden" 
                onChange={handleChatFileChange} 
              />

              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => document.getElementById("chat-file-upload")?.click()}
                className="p-2.5 rounded-xl border bg-white/70 border-white/85 text-slate-600 hover:bg-white shadow-sm flex-shrink-0 transition-all cursor-pointer"
                title="إرفاق صورة أو مستند 📎"
              >
                <Paperclip className="w-5 h-5 text-slate-600" />
              </button>

              {/* Mic / Voice Input Button */}
              <button
                type="button"
                onClick={startListening}
                className={`p-2.5 rounded-xl border flex-shrink-0 transition-all cursor-pointer ${
                  isListening 
                    ? 'bg-rose-500/90 border-rose-400 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                    : 'bg-white/70 border-white/85 text-slate-600 hover:bg-white shadow-sm'
                }`}
                title="تحدث لتسجيل طلبك بالصوت 🎙️"
              >
                <div className="relative">
                  {isListening && (
                    <span className="absolute -inset-1.5 bg-rose-400 rounded-full opacity-35 animate-ping"></span>
                  )}
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 relative" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </button>

              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendChatMessage();
                }}
                placeholder={isListening ? "جاري الاستماع لصوتك..." : "اكتب طلبك أو اسأل بوكسي..."}
                disabled={chatLoading}
                className={`flex-1 px-3.5 py-2.5 border rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  isListening ? 'bg-rose-50 border-rose-200 text-rose-900 italic font-bold' : 'bg-white/50 border-white/80 text-slate-800'
                }`}
              />

              <button 
                onClick={() => sendChatMessage()}
                disabled={chatLoading || (!chatInput.trim() && chatAttachments.length === 0)}
                className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-slate-100/50 disabled:text-slate-400 transition cursor-pointer flex-shrink-0 shadow-md shadow-indigo-600/10 border border-indigo-500/30"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        )}

        {/* Float Activation Button */}
        <button
          onClick={() => {
            setIsChatOpen(!isChatOpen);
            if (!isChatOpen) {
              setTimeout(() => {
                const thread = document.getElementById("chat-thread");
                if (thread) thread.scrollTop = thread.scrollHeight;
              }, 100);
            }
          }}
          className="w-14 h-14 bg-gradient-to-tr from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white rounded-full shadow-[0_8px_30px_rgba(99,102,241,0.4)] hover:shadow-[0_8px_35px_rgba(99,102,241,0.6)] flex items-center justify-center cursor-pointer transition-all duration-300 transform hover:scale-110 active:scale-95 group relative border border-indigo-400/30"
          title="افتح مساعد الذكاء الاصطناعي 💬"
        >
          {isChatOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <span className="absolute -top-1 -left-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-slate-900 animate-pulse"></span>
              <span className="absolute -top-1 -left-1 w-4.5 h-4.5 bg-emerald-500 rounded-full border-2 border-slate-900 flex items-center justify-center text-[8px] text-white font-extrabold shadow-sm">1</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
