export type StudentStatus = 'active' | 'inactive' | 'expired' | 'suspended';

export interface Student {
  id: string; // e.g. STU-1001
  fullName: string;
  phone: string; // WhatsApp reachable (+91...)
  email: string;
  address: string;
  emergencyContact: string;
  isMinor: boolean;
  guardianConsent: boolean;
  joiningDate: string;
  planId: string;
  membershipStart: string;
  membershipExpiry: string;
  assignedSeat: string; // e.g. A04
  qrToken: string; // random secure token
  status: StudentStatus;
  notes?: string;
  photoAvatar?: string;
}

export type SeatStatus = 'available' | 'occupied' | 'reserved' | 'maintenance';

export interface Seat {
  id: string;
  seatNumber: string; // e.g. A01, A02...
  row: string; // 'A', 'B', 'C', 'D', 'E'
  col: number; // 1..6
  status: SeatStatus;
  assignedStudentId?: string; // statically assigned
  currentOccupantStudentId?: string; // physically inside right now
  lastOccupiedAt?: string;
}

export type AttendanceStatus = 'inside' | 'outside';

export interface AttendanceSession {
  id: string;
  studentId: string;
  studentName: string;
  seatNumber: string;
  checkInTime: string; // ISO string
  checkOutTime?: string; // ISO string
  durationMinutes?: number;
  status: AttendanceStatus;
  isManualOverride?: boolean;
  isOfflineSynced?: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string; // Daily, Weekly, Monthly, Quarterly, Custom
  price: number;
  durationDays: number;
  description: string;
  active: boolean;
}

export type PaymentMethod = 'cash' | 'upi' | 'bank_transfer' | 'other';
export type PaymentStatus = 'paid' | 'partial' | 'pending';

export interface PaymentRecord {
  id: string;
  receiptNo: string;
  studentId: string;
  studentName: string;
  planId: string;
  planName: string;
  amountPaid: number;
  pendingAmount: number;
  totalFee: number;
  paymentDate: string;
  dueDate: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'rent'
  | 'electricity'
  | 'internet'
  | 'cleaning'
  | 'maintenance'
  | 'furniture'
  | 'equipment'
  | 'stationery'
  | 'staff'
  | 'other';

export interface ExpenseRecord {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  paymentMethod: PaymentMethod;
  receiptRef?: string;
}

export interface BudgetCategory {
  category: ExpenseCategory;
  label: string;
  budgetedAmount: number;
  actualAmount: number;
}

export type ReminderChannel = 'whatsapp_cloud_api' | 'whatsapp_web';
export type DeliveryStatus = 'delivered' | 'read' | 'sent' | 'failed';

export interface ReminderLog {
  id: string;
  studentId: string;
  studentName: string;
  phone: string;
  channel: ReminderChannel;
  templateName: string; // e.g. "studyroom_fee_reminder_utility"
  triggerType: 'automated_cron' | 'manual_admin';
  sentAt: string; // ISO string
  deliveryStatus: DeliveryStatus;
  messageText: string;
  costEstimateInr: number; // e.g. ~₹0.35
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  adminName: string;
  user?: string;
  role: 'admin' | 'staff';
  action: string;
  targetType: 'student' | 'seat' | 'attendance' | 'payment' | 'expense' | 'reminder' | 'system';
  details: string;
}

export interface SystemSettings {
  libraryName: string;
  address: string;
  contactPhone: string;
  phone?: string;
  openingTime: string; // "06:00"
  closingTime: string; // "23:00"
  operatingHours?: string;
  totalSeats: number;
  gracePeriodDays: number;
  reminderDaysBeforeExpiry: number;
  reminderCronTime?: string;
  automatedRemindersEnabled?: boolean;
  audioFeedbackEnabled?: boolean;
  autoCloseSessionsAtMidnight: boolean;
  whatsAppApiKey?: string;
  whatsAppPhoneNumberId?: string;
  whatsAppMode: 'cloud_api_simulation' | 'direct_wa_me';
}

export type UserRole = 'admin' | 'staff';
