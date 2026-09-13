import React, { useState, useEffect, useCallback } from 'react';
import {
  Student,
  Seat,
  AttendanceSession,
  PaymentRecord,
  ExpenseRecord,
  BudgetCategory,
  MembershipPlan,
  ReminderLog,
  ActivityLog,
  SystemSettings,
  UserRole,
} from './types';
import {
  INITIAL_SETTINGS,
  INITIAL_PLANS,
  INITIAL_SEATS,
  INITIAL_STUDENTS,
  INITIAL_SESSIONS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_BUDGETS,
  INITIAL_REMINDER_LOGS,
  INITIAL_ACTIVITY_LOGS,
} from './data/initialData';
import { playCheckInSound, playCheckOutSound, playErrorSound } from './utils/audio';

// Firebase & Cloud Firestore
import {
  auth,
  testFirestoreConnection,
  loginWithGoogle,
  logoutUser,
  subscribeToAuth,
  subscribeToStudents,
  subscribeToSeats,
  subscribeToSessions,
  subscribeToPayments,
  subscribeToExpenses,
  subscribeToReminders,
  subscribeToActivityLogs,
  subscribeToSettings,
  saveStudentDoc,
  deleteStudentDoc,
  saveSeatDoc,
  saveSessionDoc,
  savePaymentDoc,
  saveExpenseDoc,
  saveReminderDoc,
  saveActivityLogDoc,
  saveSettingsDoc,
  seedFirestoreIfEmpty,
} from './firebase';
import { User } from 'firebase/auth';

// Components
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { SeatMapView } from './components/SeatMapView';
import { StudentsView } from './components/StudentsView';
import { AttendanceView } from './components/AttendanceView';
import { PaymentsView } from './components/PaymentsView';
import { ExpensesView } from './components/ExpensesView';
import { WhatsAppRemindersView } from './components/WhatsAppRemindersView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';

// Modals
import { ScannerModal } from './components/ScannerModal';
import { StudentCardModal } from './components/StudentCardModal';
import { ReceiptModal } from './components/ReceiptModal';
import { SeatActionModal } from './components/SeatActionModal';
import { StudentFormModal } from './components/StudentFormModal';
import { RecordPaymentModal } from './components/RecordPaymentModal';
import { AddExpenseModal } from './components/AddExpenseModal';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Load state from localStorage or initialize with seed data
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('study_room_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('study_room_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [seats, setSeats] = useState<Seat[]>(() => {
    const saved = localStorage.getItem('study_room_seats');
    return saved ? JSON.parse(saved) : INITIAL_SEATS;
  });

  const [sessions, setSessions] = useState<AttendanceSession[]>(() => {
    const saved = localStorage.getItem('study_room_sessions');
    return saved ? JSON.parse(saved) : INITIAL_SESSIONS;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem('study_room_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<ExpenseRecord[]>(() => {
    const saved = localStorage.getItem('study_room_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [budgets, setBudgets] = useState<BudgetCategory[]>(() => {
    const saved = localStorage.getItem('study_room_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [reminders, setReminders] = useState<ReminderLog[]>(() => {
    const saved = localStorage.getItem('study_room_reminders');
    return saved ? JSON.parse(saved) : INITIAL_REMINDER_LOGS;
  });

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>(() => {
    const saved = localStorage.getItem('study_room_activity_logs');
    return saved ? JSON.parse(saved) : INITIAL_ACTIVITY_LOGS;
  });

  const [plans] = useState<MembershipPlan[]>(INITIAL_PLANS);

  // Active navigation tab and user role
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [role, setRole] = useState<UserRole>('admin');

  // Firebase Auth and Connection State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Active Modals state
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [cardStudent, setCardStudent] = useState<Student | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
  const [paymentPreselectedStudent, setPaymentPreselectedStudent] = useState<Student | undefined>(undefined);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<PaymentRecord | null>(null);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Toast Notification state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(prev => (prev?.message === message ? null : prev));
    }, 4500);
  }, []);

  // Save to localStorage when state updates
  useEffect(() => {
    localStorage.setItem('study_room_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('study_room_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('study_room_seats', JSON.stringify(seats));
  }, [seats]);

  useEffect(() => {
    localStorage.setItem('study_room_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('study_room_payments', JSON.stringify(payments));
  }, [payments]);

  useEffect(() => {
    localStorage.setItem('study_room_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('study_room_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('study_room_reminders', JSON.stringify(reminders));
  }, [reminders]);

  useEffect(() => {
    localStorage.setItem('study_room_activity_logs', JSON.stringify(activityLogs));
  }, [activityLogs]);

  // Firebase Lifecycle & Firestore Synchronization
  useEffect(() => {
    testFirestoreConnection().then(ok => setIsFirebaseConnected(ok));

    const unsubscribeAuth = subscribeToAuth(user => {
      setCurrentUser(user);
      if (user) {
        // Automatically seed Firestore with initial records if collections are empty
        seedFirestoreIfEmpty(
          INITIAL_STUDENTS,
          INITIAL_SEATS,
          INITIAL_SESSIONS,
          INITIAL_PAYMENTS,
          INITIAL_EXPENSES,
          INITIAL_SETTINGS
        );
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    if (!currentUser) return;

    const unsubStudents = subscribeToStudents(cloudStudents => {
      if (cloudStudents && cloudStudents.length > 0) {
        setStudents(cloudStudents);
      }
    });

    const unsubSeats = subscribeToSeats(cloudSeats => {
      if (cloudSeats && cloudSeats.length > 0) {
        setSeats(cloudSeats);
      }
    });

    const unsubSessions = subscribeToSessions(cloudSessions => {
      if (cloudSessions && cloudSessions.length > 0) {
        setSessions(cloudSessions);
      }
    });

    const unsubPayments = subscribeToPayments(cloudPayments => {
      if (cloudPayments && cloudPayments.length > 0) {
        setPayments(cloudPayments);
      }
    });

    const unsubExpenses = subscribeToExpenses(cloudExpenses => {
      if (cloudExpenses && cloudExpenses.length > 0) {
        setExpenses(cloudExpenses);
      }
    });

    const unsubReminders = subscribeToReminders(cloudReminders => {
      if (cloudReminders && cloudReminders.length > 0) {
        setReminders(cloudReminders);
      }
    });

    const unsubActivityLogs = subscribeToActivityLogs(cloudLogs => {
      if (cloudLogs && cloudLogs.length > 0) {
        setActivityLogs(cloudLogs);
      }
    });

    const unsubSettings = subscribeToSettings(cloudSettings => {
      if (cloudSettings) {
        setSettings(cloudSettings);
      }
    });

    return () => {
      unsubStudents();
      unsubSeats();
      unsubSessions();
      unsubPayments();
      unsubExpenses();
      unsubReminders();
      unsubActivityLogs();
      unsubSettings();
    };
  }, [currentUser]);

  // Firebase Authentication Handlers
  const handleLogin = async () => {
    try {
      const user = await loginWithGoogle();
      showToast(`Welcome, ${user.displayName || user.email}! Connected to Firebase.`, 'success');
      addActivityLog('Admin Signed In', `Authenticated as ${user.email} with Google via Firebase.`, 'system', user.displayName || 'Admin');
    } catch (err: any) {
      console.error('Sign-in error:', err);
      showToast(err?.message || 'Failed to sign in with Google.', 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('Signed out of Firebase session.', 'info');
      addActivityLog('Admin Signed Out', 'Signed out of Firebase Authentication.', 'system');
    } catch (err: any) {
      console.error('Sign-out error:', err);
      showToast(err?.message || 'Failed to sign out.', 'error');
    }
  };

  const handleSyncToFirestore = async () => {
    if (!currentUser) {
      showToast('Please sign in with Google (using the button in the header) to sync data with Firestore.', 'info');
      return;
    }
    try {
      showToast('Syncing all records to Firestore cloud database...', 'info');
      for (const s of students) await saveStudentDoc(s);
      for (const st of seats) await saveSeatDoc(st);
      for (const se of sessions) await saveSessionDoc(se);
      for (const p of payments) await savePaymentDoc(p);
      for (const e of expenses) await saveExpenseDoc(e);
      for (const r of reminders) await saveReminderDoc(r);
      await saveSettingsDoc(settings);
      showToast('Successfully synchronized all records to Firestore (asia-south1)!', 'success');
    } catch (err: any) {
      console.error('Sync error:', err);
      showToast('Error syncing to Firestore: ' + (err?.message || 'Check connection'), 'error');
    }
  };

  // Log activity helper
  const addActivityLog = (
    action: string,
    details: string,
    targetType: ActivityLog['targetType'] = 'system',
    adminName = 'Desk Admin'
  ) => {
    const newLog: ActivityLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      adminName,
      user: adminName,
      role: 'admin',
      action,
      targetType,
      details,
    };
    setActivityLogs(prev => [newLog, ...prev]);
    saveActivityLogDoc(newLog).catch(() => {});
  };

  // --- ATTENDANCE & SCAN ENGINE (§8, §9, §10) ---
  const handleStudentScan = (student: Student) => {
    // Check if student's membership is expired
    const isExpired =
      student.status === 'expired' ||
      new Date(student.membershipExpiry).getTime() < Date.now() - 24 * 60 * 60 * 1000;

    if (isExpired) {
      playErrorSound();
      showToast(
        `Access Warning: ${student.fullName}'s membership expired on ${student.membershipExpiry}. Please renew dues at the desk.`,
        'error'
      );
      addActivityLog(
        'Expired Access Scan Alert',
        `${student.fullName} (${student.id}) scanned at kiosk with expired membership (${student.membershipExpiry}).`,
        'attendance'
      );
      return;
    }

    // Check if student is currently inside
    const existingSession = sessions.find(
      s => s.studentId === student.id && s.status === 'inside'
    );

    if (existingSession) {
      // PERFORM CHECK-OUT
      const checkInDate = new Date(existingSession.checkInTime);
      const now = new Date();
      const diffMins = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / (1000 * 60)));

      const updatedSession: AttendanceSession = {
        ...existingSession,
        checkOutTime: now.toISOString(),
        durationMinutes: diffMins,
        status: 'outside',
      };

      setSessions(prev =>
        prev.map(s => (s.id === existingSession.id ? updatedSession : s))
      );
      saveSessionDoc(updatedSession).catch(() => {});

      // Free seat occupant
      setSeats(prev =>
        prev.map(st => {
          if (st.currentOccupantStudentId === student.id) {
            // Keep assignedStudentId if dedicated, but clear current occupant and set available if no permanent reserve
            const isPermanentlyAssigned = st.assignedStudentId === student.id;
            const updatedSeat: Seat = {
              ...st,
              currentOccupantStudentId: undefined,
              status: isPermanentlyAssigned ? 'reserved' : 'available',
            };
            saveSeatDoc(updatedSeat).catch(() => {});
            return updatedSeat;
          }
          return st;
        })
      );

      playCheckOutSound();
      showToast(
        `Check-out Recorded: Good bye, ${student.fullName}! Session Duration: ${Math.floor(
          diffMins / 60
        )}h ${diffMins % 60}m. Desk released.`,
        'success'
      );
      addActivityLog(
        'Student Exit Recorded',
        `${student.fullName} checked out from Seat ${existingSession.seatNumber} (${diffMins} mins study).`,
        'attendance'
      );
    } else {
      // PERFORM CHECK-IN
      // Find assigned seat or first available seat
      let targetSeatNumber = student.assignedSeat;
      let targetSeat = seats.find(s => s.seatNumber === targetSeatNumber && s.status !== 'maintenance');

      if (!targetSeat || targetSeat.status === 'occupied') {
        // Fallback to first available desk
        targetSeat = seats.find(s => s.status === 'available');
        if (targetSeat) {
          targetSeatNumber = targetSeat.seatNumber;
        }
      }

      if (!targetSeat) {
        playErrorSound();
        showToast('Reading Hall Full: No available desks for check-in right now.', 'error');
        return;
      }

      const now = new Date();
      const newSession: AttendanceSession = {
        id: `sess_${Date.now()}`,
        studentId: student.id,
        studentName: student.fullName,
        seatNumber: targetSeatNumber || 'A01',
        checkInTime: now.toISOString(),
        status: 'inside',
      };

      setSessions(prev => [newSession, ...prev]);
      saveSessionDoc(newSession).catch(() => {});

      // Update seat status to occupied
      setSeats(prev =>
        prev.map(s => {
          if (s.seatNumber === targetSeatNumber) {
            const updatedSeat: Seat = {
              ...s,
              status: 'occupied',
              currentOccupantStudentId: student.id,
            };
            saveSeatDoc(updatedSeat).catch(() => {});
            return updatedSeat;
          }
          return s;
        })
      );

      playCheckInSound();
      showToast(
        `Welcome, ${student.fullName}! Check-in recorded at Desk ${targetSeatNumber}. Happy studying!`,
        'success'
      );
      addActivityLog(
        'Student Entry Recorded',
        `${student.fullName} checked in at Desk ${targetSeatNumber} via Kiosk QR.`,
        'attendance'
      );
    }
  };

  // Manual Check-out
  const handleCheckOut = (student: Student) => {
    handleStudentScan(student);
  };

  // Manual Override (§8)
  const handleManualOverride = (studentId: string, action: 'in' | 'out', notes?: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    if (action === 'in') {
      const targetSeatNumber = student.assignedSeat || 'A01';
      const now = new Date();
      const newSession: AttendanceSession = {
        id: `sess_${Date.now()}`,
        studentId: student.id,
        studentName: student.fullName,
        seatNumber: targetSeatNumber,
        checkInTime: now.toISOString(),
        status: 'inside',
        isManualOverride: true,
      };

      setSessions(prev => [newSession, ...prev]);
      saveSessionDoc(newSession).catch(() => {});
      setSeats(prev =>
        prev.map(s => {
          if (s.seatNumber === targetSeatNumber) {
            const updatedSeat: Seat = {
              ...s,
              status: 'occupied',
              currentOccupantStudentId: student.id,
            };
            saveSeatDoc(updatedSeat).catch(() => {});
            return updatedSeat;
          }
          return s;
        })
      );

      showToast(`Manual entry recorded for ${student.fullName} at Desk ${targetSeatNumber}.`, 'success');
      addActivityLog(
        'Manual Entry Override',
        `Admin performed manual entry override for ${student.fullName} at Desk ${targetSeatNumber}. Reason: ${notes || 'Not specified'}`,
        'attendance'
      );
    } else {
      const activeSession = sessions.find(s => s.studentId === student.id && s.status === 'inside');
      if (activeSession) {
        const checkInDate = new Date(activeSession.checkInTime);
        const now = new Date();
        const diffMins = Math.max(1, Math.round((now.getTime() - checkInDate.getTime()) / (1000 * 60)));

        const updatedSession: AttendanceSession = {
          ...activeSession,
          checkOutTime: now.toISOString(),
          durationMinutes: diffMins,
          status: 'outside',
          isManualOverride: true,
        };

        setSessions(prev =>
          prev.map(s => (s.id === activeSession.id ? updatedSession : s))
        );
        saveSessionDoc(updatedSession).catch(() => {});

        setSeats(prev =>
          prev.map(st => {
            if (st.currentOccupantStudentId === student.id) {
              const isPermanentlyAssigned = st.assignedStudentId === student.id;
              const updatedSeat: Seat = {
                ...st,
                currentOccupantStudentId: undefined,
                status: isPermanentlyAssigned ? 'reserved' : 'available',
              };
              saveSeatDoc(updatedSeat).catch(() => {});
              return updatedSeat;
            }
            return st;
          })
        );

        showToast(`Manual exit recorded for ${student.fullName}. Desk freed.`, 'success');
        addActivityLog(
          'Manual Exit Override',
          `Admin checked out ${student.fullName}. Notes: ${notes || 'Counter request'}`,
          'attendance'
        );
      }
    }
  };

  // --- STUDENT REGISTRATION & EDIT (§6) ---
  const handleSaveStudent = (studentData: Omit<Student, 'id' | 'qrToken'> & { id?: string }) => {
    if (studentData.id) {
      // Edit existing student
      const updatedStudent: Student = {
        ...(students.find(s => s.id === studentData.id) as Student),
        ...studentData,
        id: studentData.id,
      };

      setStudents(prev => prev.map(s => (s.id === studentData.id ? updatedStudent : s)));
      saveStudentDoc(updatedStudent).catch(() => {});

      // Sync assigned seat
      if (updatedStudent.assignedSeat) {
        setSeats(prev =>
          prev.map(seat => {
            if (seat.seatNumber === updatedStudent.assignedSeat) {
              const updated = { ...seat, assignedStudentId: updatedStudent.id };
              saveSeatDoc(updated).catch(() => {});
              return updated;
            }
            if (seat.assignedStudentId === updatedStudent.id && seat.seatNumber !== updatedStudent.assignedSeat) {
              const updated = { ...seat, assignedStudentId: undefined, status: seat.status === 'reserved' ? ('available' as const) : seat.status };
              saveSeatDoc(updated).catch(() => {});
              return updated;
            }
            return seat;
          })
        );
      }

      showToast(`Student profile updated for ${updatedStudent.fullName}.`, 'success');
      addActivityLog('Student Profile Updated', `Updated details for ${updatedStudent.fullName} (${updatedStudent.id}).`, 'student');
    } else {
      // Add new student
      const newId = `STU-${1000 + students.length + 1}`;
      const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
      const qrToken = `SRH-${newId}-${randomSuffix}`;

      const newStudent: Student = {
        ...studentData,
        id: newId,
        qrToken,
      };

      setStudents(prev => [newStudent, ...prev]);
      saveStudentDoc(newStudent).catch(() => {});

      // Assign seat if provided
      if (newStudent.assignedSeat) {
        setSeats(prev =>
          prev.map(seat => {
            if (seat.seatNumber === newStudent.assignedSeat) {
              const updated = { ...seat, assignedStudentId: newStudent.id, status: seat.status === 'available' ? ('reserved' as const) : seat.status };
              saveSeatDoc(updated).catch(() => {});
              return updated;
            }
            return seat;
          })
        );
      }

      showToast(`Student registered: ${newStudent.fullName} (${newStudent.id}). Digital QR pass generated!`, 'success');
      addActivityLog('New Student Enrolled', `Registered ${newStudent.fullName} (${newStudent.id}) with QR credential.`, 'student');
    }
  };

  // Renew Student Membership
  const handleRenewStudent = (student: Student) => {
    const currentExpiry = new Date(student.membershipExpiry);
    const newExpiry = new Date(currentExpiry);
    newExpiry.setDate(newExpiry.getDate() + 30);
    const newExpiryStr = newExpiry.toISOString().split('T')[0];

    const updatedStudent: Student = {
      ...student,
      status: 'active',
      membershipExpiry: newExpiryStr,
    };

    setStudents(prev =>
      prev.map(s => (s.id === student.id ? updatedStudent : s))
    );
    saveStudentDoc(updatedStudent).catch(() => {});

    // Open record payment modal pre-populated
    setPaymentPreselectedStudent(student);
    setIsRecordPaymentOpen(true);

    showToast(`Membership extended by 30 days for ${student.fullName} (New Expiry: ${newExpiryStr}).`, 'success');
    addActivityLog('Membership Renewed', `Extended membership for ${student.fullName} to ${newExpiryStr}.`, 'student');
  };

  // Toggle student status
  const handleToggleStudentStatus = (studentId: string, newStatus: Student['status']) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          const updated = { ...s, status: newStatus };
          saveStudentDoc(updated).catch(() => {});
          return updated;
        }
        return s;
      })
    );
    showToast(`Student status updated to ${newStatus}.`, 'info');
  };

  // --- SEAT MANAGEMENT (§7) ---
  const handleAssignSeat = (seatNumber: string, studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    // Update student's assigned seat
    const updatedStudent: Student = { ...student, assignedSeat: seatNumber };
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? updatedStudent : s))
    );
    saveStudentDoc(updatedStudent).catch(() => {});

    // Update seat
    setSeats(prev =>
      prev.map(s => {
        if (s.seatNumber === seatNumber) {
          const updatedSeat: Seat = {
            ...s,
            assignedStudentId: studentId,
            status: s.status === 'available' ? ('reserved' as const) : s.status,
          };
          saveSeatDoc(updatedSeat).catch(() => {});
          return updatedSeat;
        }
        return s;
      })
    );

    showToast(`Desk ${seatNumber} successfully allocated to ${student.fullName}.`, 'success');
    addActivityLog('Seat Allocated', `Assigned Desk ${seatNumber} to ${student.fullName} (${studentId}).`, 'seat');
  };

  const handleReleaseSeat = (seatNumber: string) => {
    const seat = seats.find(s => s.seatNumber === seatNumber);
    if (!seat) return;

    // Clear student assignment
    if (seat.assignedStudentId) {
      const assignedStudent = students.find(s => s.id === seat.assignedStudentId);
      if (assignedStudent) {
        const updatedStudent: Student = { ...assignedStudent, assignedSeat: undefined };
        setStudents(prev =>
          prev.map(s => (s.id === seat.assignedStudentId ? updatedStudent : s))
        );
        saveStudentDoc(updatedStudent).catch(() => {});
      }
    }

    setSeats(prev =>
      prev.map(s => {
        if (s.seatNumber === seatNumber) {
          const updatedSeat: Seat = {
            ...s,
            assignedStudentId: undefined,
            currentOccupantStudentId: undefined,
            status: 'available',
          };
          saveSeatDoc(updatedSeat).catch(() => {});
          return updatedSeat;
        }
        return s;
      })
    );

    showToast(`Desk ${seatNumber} released and is now Available.`, 'success');
    addActivityLog('Seat Released', `Desk ${seatNumber} released to Available pool.`, 'seat');
  };

  const handleToggleMaintenance = (seatNumber: string, isMaintenance: boolean) => {
    setSeats(prev =>
      prev.map(s => {
        if (s.seatNumber === seatNumber) {
          const updatedSeat: Seat = {
            ...s,
            status: isMaintenance ? 'maintenance' : 'available',
          };
          saveSeatDoc(updatedSeat).catch(() => {});
          return updatedSeat;
        }
        return s;
      })
    );

    showToast(
      `Desk ${seatNumber} ${isMaintenance ? 'marked Under Maintenance' : 'restored to Service'}.`,
      'info'
    );
    addActivityLog(
      'Seat Status Changed',
      `Desk ${seatNumber} status set to ${isMaintenance ? 'maintenance' : 'available'}.`,
      'seat'
    );
  };

  // --- PAYMENTS & RECEIPTS (§12, §13) ---
  const handleSavePayment = (paymentData: Omit<PaymentRecord, 'id' | 'receiptNo'>) => {
    const receiptNo = `REC-${new Date().getFullYear()}-${String(payments.length + 1).padStart(4, '0')}`;
    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay_${Date.now()}`,
      receiptNo,
    };

    setPayments(prev => [newPayment, ...prev]);
    savePaymentDoc(newPayment).catch(() => {});

    // Show receipt modal automatically
    setSelectedPaymentForReceipt(newPayment);

    showToast(`Fee Payment of ₹${newPayment.amountPaid} recorded. Receipt #${receiptNo} generated!`, 'success');
    addActivityLog(
      'Fee Payment Recorded',
      `Receipt #${receiptNo}: ₹${newPayment.amountPaid} collected from ${newPayment.studentName} via ${newPayment.paymentMethod}.`,
      'payment'
    );
  };

  // --- EXPENSES (§14, §15) ---
  const handleSaveExpense = (expenseData: Omit<ExpenseRecord, 'id'>) => {
    const newExpense: ExpenseRecord = {
      ...expenseData,
      id: `exp_${Date.now()}`,
    };

    setExpenses(prev => [newExpense, ...prev]);
    saveExpenseDoc(newExpense).catch(() => {});

    // Update actualAmount in corresponding budget category
    setBudgets(prev =>
      prev.map(b =>
        b.category === expenseData.category
          ? { ...b, actualAmount: b.actualAmount + expenseData.amount }
          : b
      )
    );

    showToast(`Expense of ₹${newExpense.amount} under "${newExpense.category}" recorded.`, 'success');
    addActivityLog(
      'Expense Recorded',
      `Added ₹${newExpense.amount} for ${newExpense.description} under ${newExpense.category}.`,
      'expense'
    );
  };

  // --- WHATSAPP REMINDERS & AUTOMATED BATCH (§17, §23a, §26) ---
  const handleTriggerDailyBatch = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const warningThreshold = new Date();
    warningThreshold.setDate(now.getDate() + settings.reminderDaysBeforeExpiry);

    // Identify eligible students
    const candidates = students.filter(s => {
      const exp = new Date(s.membershipExpiry);
      const payment = payments.find(p => p.studentId === s.id);
      const hasDues = payment && payment.pendingAmount > 0;
      return s.status === 'expired' || exp <= warningThreshold || hasDues;
    });

    let sentCount = 0;
    let skippedCount = 0;
    const newLogs: ReminderLog[] = [];

    for (const student of candidates) {
      // Deduplication check (§26): has a reminder already been logged for this student today?
      const alreadySentToday = reminders.some(r => {
        return r.studentId === student.id && r.sentAt.startsWith(todayStr);
      });

      if (alreadySentToday) {
        skippedCount++;
        continue;
      }

      const p = payments.find(pay => pay.studentId === student.id);
      const dueAmount = p ? p.pendingAmount : 1500;

      const log: ReminderLog = {
        id: `rem_${Date.now()}_${student.id}`,
        studentId: student.id,
        studentName: student.fullName,
        phone: student.phone,
        channel: 'whatsapp_cloud_api',
        templateName: 'studyroom_fee_reminder_utility',
        triggerType: 'automated_cron',
        sentAt: new Date().toISOString(),
        deliveryStatus: 'delivered',
        messageText: `Dear ${student.fullName}, your membership for ${settings.libraryName} is due for renewal on ${student.membershipExpiry}. Outstanding Dues: ₹${dueAmount}. Please renew to retain your desk. Thank you!`,
        costEstimateInr: 0.35,
      };

      newLogs.push(log);
      saveReminderDoc(log).catch(() => {});
      sentCount++;
    }

    if (newLogs.length > 0) {
      setReminders(prev => [...newLogs, ...prev]);
    }

    addActivityLog(
      'Automated WhatsApp Batch Job',
      `Daily batch executed: ${sentCount} reminders dispatched, ${skippedCount} skipped (deduplicated).`,
      'reminder',
      'Cron Job'
    );

    showToast(
      `WhatsApp Batch Run: ${sentCount} reminders dispatched via Meta Cloud API (${skippedCount} deduplicated).`,
      'success'
    );

    return { sentCount, skippedCount };
  };

  const handleSendSingleReminder = (student: Student, customNote?: string) => {
    const p = payments.find(pay => pay.studentId === student.id);
    const dueAmount = p ? p.pendingAmount : 1500;

    const log: ReminderLog = {
      id: `rem_${Date.now()}_${student.id}`,
      studentId: student.id,
      studentName: student.fullName,
      phone: student.phone,
      channel: 'whatsapp_cloud_api',
      templateName: 'studyroom_fee_reminder_utility',
      triggerType: 'manual_admin',
      sentAt: new Date().toISOString(),
      deliveryStatus: 'delivered',
      messageText: `Dear ${student.fullName}, reminder from ${settings.libraryName}: Your membership fee of ₹${dueAmount} is due. ${customNote ? `Note: ${customNote} ` : ''}Thank you!`,
      costEstimateInr: 0.35,
    };

    setReminders(prev => [log, ...prev]);
    saveReminderDoc(log).catch(() => {});

    showToast(`WhatsApp reminder dispatched to ${student.fullName} (${student.phone}).`, 'success');
    addActivityLog(
      'WhatsApp Reminder Sent',
      `Dispatched Meta Cloud API reminder to ${student.fullName} (${student.phone}).`,
      'reminder'
    );
  };

  // Reset to Demo Seed Data
  const handleResetData = () => {
    if (window.confirm('Reset all data to the default sample dataset? Current local changes will be replaced.')) {
      localStorage.clear();
      setSettings(INITIAL_SETTINGS);
      setStudents(INITIAL_STUDENTS);
      setSeats(INITIAL_SEATS);
      setSessions(INITIAL_SESSIONS);
      setPayments(INITIAL_PAYMENTS);
      setExpenses(INITIAL_EXPENSES);
      setBudgets(INITIAL_BUDGETS);
      setReminders(INITIAL_REMINDER_LOGS);
      setActivityLogs(INITIAL_ACTIVITY_LOGS);
      showToast('All system data reset to default demo dataset.', 'info');
    }
  };

  // Metrics for Header & Navigation badges
  const pendingPaymentCount = payments.filter(p => p.status === 'pending' || p.status === 'partial').length;
  const expiringCount = students.filter(s => {
    const exp = new Date(s.membershipExpiry);
    const warn = new Date();
    warn.setDate(warn.getDate() + 3);
    return s.status === 'expired' || exp <= warn;
  }).length;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Toast Notification Banner */}
      {toast && (
        <div
          id="global-toast-notification"
          className={`fixed top-4 right-4 z-50 max-w-md p-3.5 rounded-2xl shadow-xl border flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-950'
              : toast.type === 'info'
              ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === 'error' ? (
              <AlertCircle className="w-5 h-5 text-rose-600" />
            ) : toast.type === 'info' ? (
              <Info className="w-5 h-5 text-indigo-600" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            )}
          </div>
          <div className="text-xs font-medium leading-relaxed flex-1">
            {toast.message}
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-slate-600 p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <Header
        settings={settings}
        role={role}
        insideCount={sessions.filter(s => s.status === 'inside').length}
        totalSeats={seats.length}
        seats={seats}
        students={students}
        onRoleChange={setRole}
        onOpenScanner={() => setIsScannerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        currentUser={currentUser}
        isFirebaseConnected={isFirebaseConnected}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Navigation Bar */}
      <Navigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingPaymentCount={pendingPaymentCount}
        expiringCount={expiringCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            seats={seats}
            sessions={sessions}
            payments={payments}
            expenses={expenses}
            reminders={reminders}
            activityLogs={activityLogs}
            onOpenScanner={() => setIsScannerOpen(true)}
            onOpenAddStudent={() => {
              setEditingStudent(null);
              setIsAddStudentOpen(true);
            }}
            onOpenRecordPayment={() => {
              setPaymentPreselectedStudent(undefined);
              setIsRecordPaymentOpen(true);
            }}
            onOpenWhatsAppReminders={() => setActiveTab('whatsapp')}
            onCheckOut={handleCheckOut}
            onNavigateToTab={setActiveTab}
            onSendSingleReminder={handleSendSingleReminder}
          />
        )}

        {activeTab === 'seats' && (
          <SeatMapView
            seats={seats}
            students={students}
            sessions={sessions}
            onSelectSeat={seat => setSelectedSeat(seat)}
          />
        )}

        {activeTab === 'students' && (
          <StudentsView
            students={students}
            plans={plans}
            seats={seats}
            payments={payments}
            onOpenAddStudent={() => {
              setEditingStudent(null);
              setIsAddStudentOpen(true);
            }}
            onEditStudent={student => {
              setEditingStudent(student);
              setIsAddStudentOpen(true);
            }}
            onViewStudentCard={student => setCardStudent(student)}
            onSendWhatsAppReminder={student => handleSendSingleReminder(student)}
            onRenewStudent={handleRenewStudent}
            onToggleStatus={handleToggleStudentStatus}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceView
            students={students}
            sessions={sessions}
            seats={seats}
            onOpenScanner={() => setIsScannerOpen(true)}
            onCheckIn={handleStudentScan}
            onCheckOut={handleCheckOut}
            onManualOverride={handleManualOverride}
          />
        )}

        {activeTab === 'payments' && (
          <PaymentsView
            payments={payments}
            students={students}
            plans={plans}
            onOpenRecordPayment={() => {
              setPaymentPreselectedStudent(undefined);
              setIsRecordPaymentOpen(true);
            }}
            onViewReceipt={payment => setSelectedPaymentForReceipt(payment)}
            onSendReminder={handleSendSingleReminder}
          />
        )}

        {activeTab === 'expenses' && (
          <ExpensesView
            expenses={expenses}
            budgets={budgets}
            onOpenAddExpense={() => setIsAddExpenseOpen(true)}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppRemindersView
            students={students}
            payments={payments}
            reminders={reminders}
            settings={settings}
            onTriggerDailyBatch={handleTriggerDailyBatch}
            onSendSingleReminder={handleSendSingleReminder}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            students={students}
            seats={seats}
            sessions={sessions}
            payments={payments}
            expenses={expenses}
            budgets={budgets}
            reminders={reminders}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            activityLogs={activityLogs}
            onUpdateSettings={newSettings => {
              setSettings(newSettings);
              saveSettingsDoc(newSettings).catch(() => {});
            }}
            onResetData={handleResetData}
            onSyncToFirestore={handleSyncToFirestore}
            isFirebaseConnected={isFirebaseConnected}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            {settings.libraryName} • Automated Study Room Management System v3
          </span>
          <span className="text-[11px] text-slate-400">
            QR Kiosk Scanner • Visual Desks • Automated WhatsApp Utility Reminders
          </span>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. Kiosk QR Scanner Modal */}
      <ScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        students={students}
        sessions={sessions}
        libraryName={settings.libraryName}
        onCheckIn={handleStudentScan}
        onCheckOut={handleCheckOut}
        onScan={handleStudentScan}
      />

      {/* 2. Digital Student QR Pass Modal */}
      <StudentCardModal
        isOpen={!!cardStudent}
        onClose={() => setCardStudent(null)}
        student={cardStudent}
        libraryName={settings.libraryName}
        libraryAddress={settings.address}
      />

      {/* 3. Printable Fee Receipt Modal */}
      <ReceiptModal
        isOpen={!!selectedPaymentForReceipt}
        onClose={() => setSelectedPaymentForReceipt(null)}
        payment={selectedPaymentForReceipt}
        student={
          selectedPaymentForReceipt
            ? students.find(s => s.id === selectedPaymentForReceipt.studentId)
            : undefined
        }
        libraryName={settings.libraryName}
        libraryAddress={settings.address}
        libraryPhone={settings.contactPhone}
      />

      {/* 4. Desk Action Modal (Assign / Reassign / Release / Maintenance) */}
      <SeatActionModal
        isOpen={!!selectedSeat}
        onClose={() => setSelectedSeat(null)}
        seat={selectedSeat}
        students={students}
        sessions={sessions}
        onAssignStudent={(seatId, studentId) => {
          const seat = seats.find(s => s.id === seatId || s.seatNumber === seatId);
          if (seat) handleAssignSeat(seat.seatNumber, studentId);
        }}
        onAssign={handleAssignSeat}
        onReleaseSeat={seatId => {
          const seat = seats.find(s => s.id === seatId || s.seatNumber === seatId);
          if (seat) handleReleaseSeat(seat.seatNumber);
        }}
        onRelease={handleReleaseSeat}
        onToggleMaintenance={handleToggleMaintenance}
      />

      {/* 5. Add / Edit Student Registration Modal */}
      <StudentFormModal
        isOpen={isAddStudentOpen}
        onClose={() => {
          setIsAddStudentOpen(false);
          setEditingStudent(null);
        }}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
        plans={plans}
        seats={seats}
      />

      {/* 6. Record Fee Payment Modal */}
      <RecordPaymentModal
        isOpen={isRecordPaymentOpen}
        onClose={() => {
          setIsRecordPaymentOpen(false);
          setPaymentPreselectedStudent(undefined);
        }}
        onSave={handleSavePayment}
        students={students}
        plans={plans}
        preselectedStudent={paymentPreselectedStudent}
      />

      {/* 7. Add Operational Expense Modal */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => setIsAddExpenseOpen(false)}
        onSave={handleSaveExpense}
      />

      {/* 8. Global Spotlight & Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        students={students}
        seats={seats}
        sessions={sessions}
        payments={payments}
        onNavigateToTab={tab => {
          setActiveTab(tab);
          setIsCommandPaletteOpen(false);
        }}
        onSelectStudentCard={student => {
          setCardStudent(student);
          setIsCommandPaletteOpen(false);
        }}
        onSelectSeat={seat => {
          setActiveTab('seats');
          setSelectedSeat(seat);
          setIsCommandPaletteOpen(false);
        }}
        onCheckInStudent={student => {
          handleStudentScan(student);
        }}
        onCheckOutStudent={student => {
          handleCheckOut(student);
        }}
        onOpenRecordPayment={student => {
          setPaymentPreselectedStudent(student);
          setIsRecordPaymentOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onSendWhatsAppReminder={student => {
          handleSendSingleReminder(student);
        }}
        onOpenAddStudent={() => {
          setEditingStudent(null);
          setIsAddStudentOpen(true);
          setIsCommandPaletteOpen(false);
        }}
        onOpenScanner={() => {
          setIsScannerOpen(true);
          setIsCommandPaletteOpen(false);
        }}
      />
    </div>
  );
}
