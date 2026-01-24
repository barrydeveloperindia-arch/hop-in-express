
import React, { useState, useMemo, useRef } from 'react';
import { read, utils } from 'xlsx';
import { StaffMember, AttendanceRecord, ViewType, UserRole, LeaveRequest, LeaveType, LeaveStatus } from '../types';
import { IDCard } from './IDCard';
import { AccessTerminal } from './AccessTerminal';

interface StaffViewProps {
  staff: StaffMember[];
  setStaff: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  attendance: AttendanceRecord[];
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  logAction: (action: string, module: ViewType, details: string, severity?: 'Info' | 'Warning' | 'Critical') => void;
  userRole: UserRole;
  currentStaffId: string;
}

import { auth } from '../lib/firebase';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { Users, Clock, Calendar, FolderOpen, FileText, Upload, Image as ImageIcon, LogOut, Mail, Phone } from 'lucide-react';
import { addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord, updateStaffMember, deleteStaffMember, subscribeToLeaves, addLeaveRequest, updateLeaveRequest } from '../lib/firestore';

const StaffView: React.FC<StaffViewProps> = ({ staff, attendance, setAttendance, logAction, userRole, currentStaffId }) => {
  const [activeTab, setActiveTab] = useState<'registry' | 'attendance' | 'calendar' | 'files'>('attendance');
  const [calendarMode, setCalendarMode] = useState<'individual' | 'roster'>('roster');
  const [viewPeriod, setViewPeriod] = useState<'week' | 'month' | 'year'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  const [dayDetails, setDayDetails] = useState<{ date: string, records: AttendanceRecord[] } | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>(currentStaffId || staff[0]?.id || '');
  const [editingRecord, setEditingRecord] = useState<AttendanceRecord | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

  const [addStaffModalOpen, setAddStaffModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({ name: '', role: 'Cashier' as UserRole, pin: '', niNumber: '', photo: '', email: '' });

  // STRICT ACCESS: Only Owner and Manager can manage staff
  const isAdmin = userRole === 'Owner' || userRole === 'Manager';

  // --- AUTO-ASSIGN AVATARS UTILITY (MIGRATION) ---
  const handleAutoAssignAvatars = async () => {
    if (!isAdmin) return;
    if (!confirm("⚠️ ADMIN ACTION: This will overwrite profile photos for ALL staff members with studio-quality avatars.\n\nProceed?")) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser?.uid;
    if (!userId) { alert("User ID missing"); return; }

    try {
      let count = 0;
      for (const s of staff) {
        let url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'; // Default Male

        const name = s.name.toUpperCase();

        // Specific Mappings
        if (name.includes('BHARAT')) url = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
        else if (name.includes('NISHA')) url = 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
        else if (name.includes('GAURAV') || name.includes('SALIL') || name.includes('SHIV')) url = 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
        else if (name.includes('HARSH') || name.includes('NARAYAN') || name.includes('PARAS') || name.includes('PARTH') || name.includes('SMIT')) url = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
        else if (name.includes('SHOP OWNER')) url = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';

        if (s.photo !== url) {
          await updateStaffMember(userId, s.id, { photo: url });
          count++;
        }
      }
      alert(`✅ Updated ${count} staff profiles with new avatars.`);
    } catch (e) {
      console.error(e);
      alert("Update failed: " + e);
    }
  };

  const handleCleanupTestStaff = async () => {
    if (!isAdmin) return;
    if (!confirm("⚠️ ADMIN ACTION: This will PERMANENTLY DELETE staff members with names like 'Test', 'Oooo', 'Shop Owner'.\n\nProceed?")) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser?.uid;
    if (!userId) { alert("User ID missing"); return; }

    const targets = staff.filter(s => {
      const n = s.name.toUpperCase();
      return n.includes('TEST') || n.includes('OOOO') || n.includes('SHOP OWNER') || n.includes('RECRUIT');
    });

    if (targets.length === 0) {
      alert("No test staff found matching criteria.");
      return;
    }

    try {
      let count = 0;
      for (const s of targets) {
        await deleteStaffMember(userId, s.id);
        count++;
      }
      alert(`✅ Deleted ${count} test staff records.`);
    } catch (e) {
      console.error(e);
      alert("Cleanup failed: " + e);
    }
  };

  // Auto-correct selectedStaffId if invalid (e.g. stale default)
  React.useEffect(() => {
    if (staff.length > 0) {
      const exists = staff.find(s => s.id === selectedStaffId);
      if (!exists) {
        console.log(`[StaffView] Auto-correcting selection from ${selectedStaffId} to ${staff[0].id}`);
        setSelectedStaffId(staff[0].id);
      }
    }
  }, [staff, selectedStaffId]);

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [idCardStaff, setIdCardStaff] = useState<StaffMember | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // --- Personal Dashboard State (New) ---
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Making work certificate John Doe', date: '30/06/2023', status: 'In progress', assignee: 'Binne', priority: 'High' },
    { id: 2, title: 'Call Jack Russel', date: '03/06/2023 10:30 am', status: 'Pending', assignee: 'Me', priority: 'Medium' },
    { id: 3, title: 'Interview with John Duboscok', date: '03/06/2023 10:30 am', status: 'Pending', assignee: 'Me', priority: 'High' }
  ]);
  const [notes, setNotes] = useState([
    { id: 1, title: 'Resilience in hospitals', date: '05/05/2023', content: 'Talking about resilience in nursing', pinned: true },
    { id: 2, title: 'The most important KPI', date: '30/06/2023', content: 'Rules about KPI', pinned: true }
  ]);
  const [breakActive, setBreakActive] = useState(false); // Local state for break UI

  // --- Leave Management State ---
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [leaveModalOpen, setLeaveModalOpen] = useState(false);
  const [newLeave, setNewLeave] = useState<Partial<LeaveRequest>>({ type: 'Annual', startDate: '', endDate: '' });

  // Leave Subscription
  React.useEffect(() => {
    const userId = import.meta.env.VITE_USER_ID || auth.currentUser?.uid;
    if (userId) {
      const unsub = subscribeToLeaves(userId, setLeaves);
      return () => unsub();
    }
  }, []);

  // --- Logic Helpers (Preserved) ---

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { compressImage } = await import('../lib/storage_utils');
      const compressedFile = await compressImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        if (isEdit && editingStaff) {
          setEditingStaff(prev => prev ? ({ ...prev, photo: base64String }) : null);
        } else {
          setNewStaffForm(prev => ({ ...prev, photo: base64String }));
        }
      };
      reader.readAsDataURL(compressedFile);
    } catch (err) {
      console.error("Photo processing failed", err);
      alert("Photo processing failed. Please try a smaller image.");
    }
  };

  const handleAddNewStaff = async () => {
    if (!auth.currentUser) return;
    if (!newStaffForm.name || !newStaffForm.pin) {
      alert("Name and PIN are required");
      return;
    }

    try {
      const { addStaffMember } = await import('../lib/firestore');
      const newId = crypto.randomUUID();
      const newStaff: StaffMember = {
        id: newId,
        name: newStaffForm.name.toUpperCase(),
        role: newStaffForm.role,
        pin: newStaffForm.pin,
        photo: newStaffForm.photo,
        email: newStaffForm.email,
        loginBarcode: `STAFF-${Math.floor(Math.random() * 10000)}`,
        status: 'Pending Approval',
        joinedDate: new Date().toISOString().split('T')[0],
        contractType: 'Full-time',
        niNumber: newStaffForm.niNumber || 'PENDING',
        taxCode: '1257L',
        rightToWork: true,
        emergencyContact: '',
        monthlyRate: 0, hourlyRate: 11.44, dailyRate: 0, advance: 0, holidayEntitlement: 28, accruedHoliday: 0
      };

      const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
      await addStaffMember(userId, newStaff);

      logAction('Recruitment', 'staff', `Authorized Enrollment: ${newStaff.name}`, 'Info');
      setAddStaffModalOpen(false);
      setNewStaffForm({ name: '', role: 'Cashier', pin: '', niNumber: '', photo: '', email: '' });
      alert("Staff Enrolled & Authorized Successfully!");

    } catch (e) {
      console.error(e);
      alert("Enrollment Error: " + e);
    }
  };

  const handleUpdateStaff = async () => {
    if (!auth.currentUser || !editingStaff) return;
    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
    try {
      const { updateStaffMember, addStaffMember } = await import('../lib/firestore');

      const updates = {
        name: editingStaff.name.toUpperCase(),
        role: editingStaff.role,
        pin: editingStaff.pin,
        niNumber: editingStaff.niNumber,
        status: editingStaff.status,
        photo: editingStaff.photo || '',
        email: editingStaff.email || ''
      };

      try {
        await updateStaffMember(userId, editingStaff.id, updates);
      } catch (innerErr: any) {
        if (innerErr.code === 'not-found' || innerErr.toString().includes('not-found')) {
          if (confirm(`Database Record Missing for "${editingStaff.name}".\n\nRe-create this personnel file?`)) {
            await addStaffMember(userId, editingStaff);
            logAction('Personnel Restore', 'staff', `Restored Ghost Record: ${editingStaff.name}`, 'Warning');
            alert("Record Restored & Updated.");
            setEditingStaff(null);
            return;
          }
        }
        throw innerErr;
      }

      logAction('Personnel Update', 'staff', `Updated Record: ${editingStaff.name}`, 'Warning');
      setEditingStaff(null);
      alert("Staff Record Updated Successfully");
    } catch (e) {
      console.error(e);
      alert("Update Failed: " + e);
    }
  };

  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(0, parseFloat((diff / 60).toFixed(2)));
  };

  const handleAttendanceAction = async (type: 'IN' | 'OUT') => {
    if (!auth.currentUser) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    const nowObj = new Date();
    const time = `${nowObj.getHours().toString().padStart(2, '0')}:${nowObj.getMinutes().toString().padStart(2, '0')}`;
    const targetStaff = staff.find(s => s.id === selectedStaffId);

    if (!targetStaff) return;

    if (type === 'IN') {
      const alreadyIn = attendance.some(a => a.staffId === selectedStaffId && a.date === today && !a.clockOut);
      if (alreadyIn) {
        showNotification(`${targetStaff.name} is already checked in.`, 'error');
        return;
      }
      const newRecord: AttendanceRecord = {
        id: crypto.randomUUID(),
        staffId: selectedStaffId,
        date: today,
        status: 'Present',
        clockIn: time,
        notes: 'Manual Console Entry'
      };

      try {
        await addAttendanceRecord(userId, newRecord);
        logAction('Staff Check-in', 'staff', `Authorized entry for ${targetStaff.name} at ${time}`, 'Info');
        showNotification(`✅ Check-In Successful: ${targetStaff.name} at ${time}`, 'success');
      } catch (err) {
        console.error("Error checking in:", err);
        showNotification("Failed to check in " + err, 'error');
      }

    } else {
      const recordToUpdate = attendance.find(a => a.staffId === selectedStaffId && a.date === today && !a.clockOut);
      if (!recordToUpdate) {
        showNotification(`No active shift found for ${targetStaff.name}`, 'error');
        return;
      }

      const updates = {
        clockOut: time,
        hoursWorked: calculateHours(recordToUpdate.clockIn || '00:00', time)
      };

      try {
        await updateAttendanceRecord(userId, recordToUpdate.id, updates);
        logAction('Staff Check-out', 'staff', `Authorized exit for ${targetStaff.name} at ${time}`, 'Info');
        showNotification(`✅ Check-Out Successful: ${targetStaff.name} at ${time}`, 'success');
      } catch (err) {
        console.error("Error checking out:", err);
        showNotification("Failed to check out.", 'error');
      }
    }
  };

  const handleTerminalAuth = async (staffId: string, method: 'QR' | 'BIO' | 'FACE' | 'PIN', proof?: string) => {
    const s = staff.find(st => st.id === staffId);
    if (!s || !auth.currentUser) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const openShift = attendance.find(a => a.staffId === staffId && a.date === today && !a.clockOut);

    try {
      if (openShift) {
        const hours = calculateHours(openShift.clockIn || '00:00', time);
        await updateAttendanceRecord(userId, openShift.id, {
          clockOut: time,
          hoursWorked: hours,
          notes: `[${method}] Verified Checkout`
        });
        logAction('Terminal Exit', 'staff', `${s.name} clocked OUT via ${method}`, 'Info');
      } else {
        const newId = crypto.randomUUID();
        await addAttendanceRecord(userId, {
          id: newId,
          staffId: s.id,
          date: today,
          status: 'Present',
          clockIn: time,
          notes: `[${method}] Verified Entry`
        });
        logAction('Terminal Entry', 'staff', `${s.name} clocked IN via ${method}`, 'Info');
      }
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const saveRecordUpdate = async () => {
    if (!editingRecord || !auth.currentUser) return;
    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;

    let updatedRecord = { ...editingRecord };
    if (updatedRecord.clockIn && updatedRecord.clockOut) {
      updatedRecord.hoursWorked = calculateHours(updatedRecord.clockIn, updatedRecord.clockOut);
    }

    try {
      if (isAddMode) {
        await addAttendanceRecord(userId, updatedRecord);
        logAction('Attendance Update', 'staff', `Manually created record for ${staff.find(s => s.id === updatedRecord.staffId)?.name || 'Unknown'} on ${updatedRecord.date}`, 'Warning');
      } else {
        await updateAttendanceRecord(userId, updatedRecord.id, updatedRecord);
        logAction('Attendance Update', 'staff', `Modified record #${updatedRecord.id.slice(0, 8)} for ${staff.find(s => s.id === updatedRecord.staffId)?.name}`, 'Warning');
      }

      setEditingRecord(null);
      setIsAddMode(false);
    } catch (err) {
      console.error("Error saving attendance record:", err);
      alert("Failed to save record. Please try again.");
    }
  };

  const formatTime = (isoDateStr: string | undefined) => {
    if (!isoDateStr) return '--:--';
    if (isoDateStr.includes(':') && isoDateStr.length === 5) return isoDateStr;
    return '--:--';
  }

  const getTargetStaff = () => staff.find(s => s.id === selectedStaffId);

  const getTodayRecord = () => {
    const today = new Date().toISOString().split('T')[0];
    const todays = attendance.filter(a => a.staffId === selectedStaffId && a.date === today);
    const active = todays.find(a => !a.clockOut);
    const last = [...todays].sort((a, b) => (b.clockIn || '').localeCompare(a.clockIn || ''))[0];
    return active || last;
  };

  const getStaffStats = () => {
    const sId = selectedStaffId;
    const myRecs = attendance.filter(a => a.staffId === sId);
    if (myRecs.length === 0) return { avgHours: '0h 0m', avgIn: '--:--', avgOut: '--:--', onTime: '0%' };

    const totalHours = myRecs.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0);
    const avgH = myRecs.length ? totalHours / myRecs.length : 0;
    const h = Math.floor(avgH);
    const m = Math.round((avgH - h) * 60);

    const inTimes = myRecs.map(r => r.clockIn).filter(Boolean) as string[];
    let avgInStr = '--:--';
    if (inTimes.length) {
      const totalInMins = inTimes.reduce((acc, t) => {
        const [hh, mm] = t.split(':').map(Number);
        return acc + (hh * 60) + mm;
      }, 0);
      const avgInMins = totalInMins / inTimes.length;
      const ih = Math.floor(avgInMins / 60);
      const im = Math.round(avgInMins % 60);
      avgInStr = `${ih.toString().padStart(2, '0')}:${im.toString().padStart(2, '0')}`;
    }

    const onTimeCount = myRecs.filter(r => {
      if (!r.clockIn) return false;
      const [hh, mm] = r.clockIn.split(':').map(Number);
      return (hh < 9) || (hh === 9 && mm <= 15);
    }).length;
    const onTimePct = ((onTimeCount / myRecs.length) * 100).toFixed(1);

    return {
      avgHours: `${h}h ${m}m`,
      avgIn: avgInStr,
      avgOut: '--',
      onTime: `${onTimePct}%`
    };
  };

  const sortedAttendance = useMemo(() => {
    const getSortValue = (rec: AttendanceRecord) => {
      let val = new Date(rec.date).getTime();
      if (isNaN(val)) val = 0;
      const timeStr = (rec.clockIn || '00:00').trim().toUpperCase();
      let hours = 0; let minutes = 0;
      try {
        const parts = timeStr.split(':');
        hours = parseInt(parts[0]) || 0;
        minutes = parseInt(parts[1]) || 0;
      } catch (e) { }
      val += (hours * 3600000) + (minutes * 60000);
      return val;
    };
    return [...attendance].sort((a, b) => getSortValue(b) - getSortValue(a));
  }, [attendance]);

  const dashboardStats = useMemo(() => getStaffStats(), [attendance, selectedStaffId]);
  const targetStaffName = getTargetStaff()?.name || 'Staff';
  const todayRecord = getTodayRecord();
  const isCheckedIn = !!(todayRecord && !todayRecord.clockOut);

  const renderDashboard = () => {
    // Metrics Calculation
    const myRecords = attendance.filter(a => a.staffId === selectedStaffId);
    const totalWorkingDays = 20; // Assumption for calculation (e.g. business days)
    const presentDays = myRecords.filter(r => r.status === 'Present').length;
    const attendanceRate = Math.min(100, Math.round((presentDays / totalWorkingDays) * 100));

    const lateArrivals = myRecords.filter(r => {
      if (!r.clockIn) return false;
      const [h, m] = r.clockIn.split(':').map(Number);
      return h > 9 || (h === 9 && m > 0);
    }).length;
    const delayRate = myRecords.length ? Math.round((lateArrivals / myRecords.length) * 100) : 0;

    let overtimeMins = 0;
    let negativeMins = 0;
    myRecords.forEach(r => {
      if (r.hoursWorked) {
        const diff = r.hoursWorked - 8;
        if (diff > 0) overtimeMins += diff * 60;
        else negativeMins += Math.abs(diff) * 60;
      }
    });
    const formatDuration = (mins: number) => {
      const h = Math.floor(mins / 60);
      const m = Math.round(mins % 60);
      return `${h}:${m.toString().padStart(2, '0')}`;
    };

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
        <div className="flex justify-between items-end mb-4">
          <h1 className="text-3xl font-black text-slate-900">Personal Dashboard</h1>
          <button className="text-xs font-bold bg-white border border-slate-200 px-4 py-2 rounded-xl text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-2">
            <span className="text-lg">::</span> Manage widgets
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Column 1: Calendar & Schedule */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-lg text-slate-900">{new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                <div className="flex gap-2">
                  <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">←</button>
                  <button className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400">→</button>
                </div>
              </div>
              <div className="grid grid-cols-7 text-center gap-y-4 text-sm mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => <span key={d} className="font-bold text-slate-300">{d}</span>)}
              </div>
              <div className="grid grid-cols-7 text-center gap-y-4 text-sm font-bold text-slate-700">
                {Array.from({ length: 31 }, (_, i) => i + 1).map(d => {
                  const isToday = d === new Date().getDate();
                  return (
                    <div key={d} className={`w-8 h-8 mx-auto flex items-center justify-center rounded-full ${isToday ? 'bg-black text-white' : 'hover:bg-slate-50'}`}>
                      {d}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900">Schedule (3)</h3>
              </div>
              <div className="space-y-3">
                {tasks.slice(1).map(t => (
                  <div key={t.id} className="p-3 rounded-2xl border border-slate-100 flex items-start gap-3 hover:border-indigo-100 transition-colors cursor-pointer group">
                    <div className="mt-1 w-4 h-4 rounded-full border-2 border-slate-200 group-hover:border-indigo-500 transition-colors"></div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 line-clamp-1">{t.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{t.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 2: Tasks & Notes */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 min-h-[300px]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Tasks ({tasks.length})</h3>
                <button className="text-slate-400 hover:text-black transition-colors">+</button>
              </div>
              <div className="space-y-4">
                {tasks.map((task, i) => (
                  <div key={i} className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${i === 0 ? 'bg-orange-100/50 border-orange-100' : 'bg-white border-slate-50 hover:bg-slate-50'}`}>
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${i === 0 ? 'border-orange-400' : 'border-slate-200'}`}>
                        {i === 0 && <div className="w-2.5 h-2.5 bg-orange-400 rounded-full"></div>}
                      </div>
                      <div>
                        <p className={`text-xs font-black ${i === 0 ? 'text-orange-900' : 'text-slate-900'} line-clamp-2`}>{task.title}</p>
                        <p className={`text-[10px] mt-1 ${i === 0 ? 'text-orange-700' : 'text-slate-400'}`}>{task.date}</p>
                        {i === 0 && (
                          <div className="flex items-center gap-4 mt-3">
                            <span className="text-[10px] font-bold flex items-center gap-1"><span className="text-orange-500">👤</span> {task.assignee}</span>
                            <span className="text-[10px] font-bold flex items-center gap-1"><span className="text-orange-500">⚡</span> In progress</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-900">Notes ({notes.length})</h3>
                <span className="text-[10px] uppercase font-black text-slate-400">Pinned</span>
              </div>
              <div className="space-y-4">
                {notes.map((note, i) => (
                  <div key={i} className="flex gap-4 group cursor-pointer">
                    <div className="mt-1 text-slate-400 group-hover:text-indigo-500 transition-colors">📌</div>
                    <div>
                      <p className="text-xs font-black text-slate-900">{note.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 mt-0.5">{note.date} • {note.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Column 3 (Double Width): Clock & Graph */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clock Widget */}
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 relative overflow-hidden">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <h3 className="font-bold text-slate-900">Clock In / Out</h3>
                  <div className="flex items-center gap-2 mt-2 text-slate-400 text-xs font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </div>
                </div>
                {/* Visual Connector from Screenshot */}
                <div className="hidden md:flex gap-4">
                  <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Clock In</p>
                    <p className="text-lg font-black text-slate-900">{todayRecord?.clockIn || '--:--'}</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Clock Out</p>
                    <p className="text-lg font-black text-slate-900">{todayRecord?.clockOut || '--:--'}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center mb-10">
                <p className="text-5xl font-black text-slate-900 tabular-nums tracking-tight">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Current Time</p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => handleAttendanceAction(isCheckedIn ? 'OUT' : 'IN')}
                  className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 ${isCheckedIn ? 'bg-slate-900 hover:bg-black' : 'bg-primary hover:bg-primary-hover'}`}
                >
                  {isCheckedIn ? 'Clock Out' : 'Clock In'} <span>{isCheckedIn ? '→' : '←'}</span>
                </button>
                <button
                  onClick={() => setBreakActive(!breakActive)}
                  className={`flex-1 py-4 rounded-xl text-sm font-black uppercase tracking-widest border transition-all active:scale-95 flex items-center justify-center gap-2 ${breakActive ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-slate-900 border-slate-200 hover:border-slate-300'}`}
                >
                  {breakActive ? 'End Break' : 'Start Break'} <span className="text-lg">☕</span>
                </button>
              </div>
            </div>

            {/* Attendance Chart Widget */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 min-h-[300px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-bold text-slate-900">Attendance Overview</h3>
                <div className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 text-xs font-bold text-slate-600 flex items-center gap-2">
                  Week {Math.ceil(new Date().getDate() / 7)} <span className="text-slate-400">▼</span>
                </div>
              </div>

              {/* Real Chart Visualization */}
              {(() => {
                const days = Array.from({ length: 7 }, (_, i) => {
                  const d = new Date();
                  d.setDate(d.getDate() - (6 - i));
                  return d;
                });

                const points = days.map((d, i) => {
                  const dateStr = d.toISOString().split('T')[0];
                  const rec = attendance.find(a => a.staffId === selectedStaffId && a.date === dateStr);

                  if (!rec || !rec.clockIn) return { x: i * 100, y: 80, hasData: false, date: d };

                  const [h, m] = rec.clockIn.split(':').map(Number);
                  const mins = h * 60 + m;
                  // Map 06:00 (360m) to 12:00 (720m) -> 10px to 80px
                  let y = ((mins - 360) / 360) * 70 + 10;
                  y = Math.max(10, Math.min(80, y));
                  return { x: i * 100, y, hasData: true, date: d, time: rec.clockIn };
                });

                const pathD = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
                const lastPoint = points.filter(p => p.hasData).pop();

                return (
                  <div className="h-40 w-full relative mt-8">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="absolute w-full h-px bg-slate-100 border-b border-dashed border-slate-200" style={{ bottom: `${i * 33}%` }}></div>
                    ))}

                    <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 600 80" preserveAspectRatio="none">
                      <path d={pathD} fill="none" stroke="#1e1b4b" strokeWidth="3" strokeLinecap="round" vectorEffect="non-scaling-stroke" />

                      {points.filter(p => p.hasData).map((p, i) => (
                        <circle key={i} cx={p.x} cy={p.y} r="4" fill="white" stroke="#1e1b4b" strokeWidth="3" />
                      ))}

                      {lastPoint && (
                        <foreignObject x={Math.min(500, lastPoint.x - 60)} y={Math.max(0, lastPoint.y - 70)} width="120" height="60">
                          <div className="bg-orange-100 p-2 rounded-lg border border-orange-200 shadow-sm animate-in fade-in zoom-in duration-300">
                            <p className="text-[10px] font-bold text-orange-800 flex items-center gap-1">📅 {lastPoint.date.getDate()} {lastPoint.date.toLocaleString('default', { month: 'short' })}</p>
                            <p className="text-[10px] font-bold text-orange-800 flex items-center gap-1">⏰ {lastPoint.time}</p>
                          </div>
                        </foreignObject>
                      )}
                    </svg>

                    <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs font-black text-slate-400 uppercase">
                      {days.map(d => <span key={d.toString()}>{d.toLocaleString('default', { weekday: 'short' }).slice(0, 2)}</span>)}
                    </div>
                  </div>
                );
              })()}

              <div className="flex gap-6 mt-12 justify-center">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div> Clock In
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div> Absent
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-2"><Clock className="w-4 h-4" /> Delay Rate</span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">↗ +2%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 w-[20%]"></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{delayRate}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-2"><Users className="w-4 h-4" /> Attendance Rate</span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">↗ +2%</span>
            </div>
            <div className="space-y-2">
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-slate-300 w-[45%]"></div>
              </div>
              <p className="text-3xl font-black text-slate-900">{attendanceRate}%</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-2"><Clock className="w-4 h-4" /> Overtime</span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">↗ +2%</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-6">{formatDuration(overtimeMins)}</p>
          </div>

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-black uppercase text-slate-900 flex items-center gap-2"><LogOut className="w-4 h-4" /> Negative Hours</span>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">↗ +2%</span>
            </div>
            <p className="text-3xl font-black text-slate-900 mt-6">{formatDuration(negativeMins)}</p>
          </div>
        </div>
      </div>
    );
  };

  const renderRegistry = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center mb-6 px-2">
        <div>
          <h3 className="font-black text-2xl text-slate-900 tracking-tight">Personnel Registry</h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Active Staff Members</p>
        </div>
        <div className="flex items-center">
          {isAdmin && <button onClick={handleAutoAssignAvatars} className="bg-white text-slate-400 hover:text-indigo-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-indigo-100 mr-2 transition-all">Sync Photos</button>}
          {isAdmin && <button onClick={handleCleanupTestStaff} className="bg-white text-rose-400 hover:text-rose-600 px-4 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 hover:border-rose-100 mr-2 transition-all">Cleanup Data</button>}
          <button onClick={() => { setEditingStaff(null); setAddStaffModalOpen(true); }} className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all active:scale-95 flex items-center gap-2">
            <span>+</span> Recruit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map(s => {
          const isOnline = attendance.some(a => a.staffId === s.id && a.date === new Date().toISOString().split('T')[0] && !a.clockOut);

          // Randomly assign a "Dept" color for the badge based on role
          const badgeColor = s.role === 'Manager' ? 'bg-rose-100 text-rose-600' : s.role === 'Owner' ? 'bg-indigo-100 text-indigo-600' : 'bg-orange-100 text-orange-600';
          const badgeLabel = s.role === 'Owner' ? 'Director' : s.role;

          return (
            <div key={s.id} className="bg-white rounded-[2.5rem] p-6 relative group border border-slate-100 hover:border-indigo-100 transition-all hover:shadow-2xl hover:shadow-slate-200/50">

              {/* Status Icon */}
              <div className={`absolute top-8 right-8 ${isOnline ? 'text-emerald-500' : 'text-slate-300'}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-current ${isOnline ? 'shadow-[0_0_10px_currentColor] animate-pulse' : 'opacity-30'}`}></div>
              </div>

              <div className="flex items-start gap-5">
                {/* Photo */}
                <div className="w-24 h-24 rounded-[1.5rem] bg-slate-100 overflow-hidden shadow-inner shrink-0 relative order-1">
                  {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-3xl">👤</div>}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 pt-1 order-2">
                  <h4 className="font-black text-lg text-slate-900 leading-tight truncate">{s.name}</h4>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wide">{s.role}</p>

                  {/* Actions (Floating near text) */}
                  <div className="flex items-center gap-2 mt-4">
                    <button className="w-9 h-9 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all" title="Email">
                      <Mail className="w-4 h-4" />
                    </button>
                    <button className="w-9 h-9 rounded-full border border-slate-100 flex items-center justify-center text-slate-400 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all" title="Call">
                      <Phone className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer / Badge */}
              <div className="flex justify-between items-center mt-6 pl-1">
                <button onClick={() => { setEditingStaff(s); setAddStaffModalOpen(true); }} className="text-[10px] font-black uppercase text-slate-300 hover:text-indigo-600 transition-colors">
                  View Profile
                </button>
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${badgeColor}`}>
                  {badgeLabel}
                </span>
              </div>

              {/* ID Card Shortcut */}
              <button onClick={() => setIdCardStaff(s)} className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-all p-2 text-slate-300 hover:text-indigo-600">
                <span className="text-xs">🪪</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );

  const handleLeaveSubmit = async () => {
    if (!auth.currentUser || !newLeave.startDate || !newLeave.endDate) return;
    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;

    // Validate
    const start = new Date(newLeave.startDate);
    const end = new Date(newLeave.endDate);
    if (end < start) { alert("End date cannot be before start date"); return; }

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const req: LeaveRequest = {
      id: crypto.randomUUID(),
      staffId: selectedStaffId,
      type: newLeave.type as LeaveType,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      totalDays: diffDays,
      status: 'Pending',
      reason: newLeave.reason || '',
      approvedBy: '',
      approvedAt: '',
      createdAt: new Date().toISOString()
    };

    try {
      await addLeaveRequest(userId, req);
      alert("Leave Request Submitted");
      setLeaveModalOpen(false);
      setNewLeave({ type: 'Annual', startDate: '', endDate: '' });
    } catch (e) {
      console.error(e);
      alert("Failed to submit request");
    }
  };

  const renderLeaveModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
        <h3 className="text-xl font-black text-slate-900 mb-6">Request Time Off</h3>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Leave Type</label>
            <div className="flex gap-2 mt-2">
              {['Annual', 'Sick', 'Unpaid'].map(t => (
                <button
                  key={t}
                  onClick={() => setNewLeave(p => ({ ...p, type: t as any }))}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${newLeave.type === t ? 'bg-primary text-white border-primary' : 'bg-white text-slate-600 border-slate-200'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">Start Date</label>
              <input type="date" value={newLeave.startDate || ''} onChange={e => setNewLeave(p => ({ ...p, startDate: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold mt-1" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase">End Date</label>
              <input type="date" value={newLeave.endDate || ''} onChange={e => setNewLeave(p => ({ ...p, endDate: e.target.value }))} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold mt-1" />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-400 uppercase">Reason (Optional)</label>
            <textarea
              value={newLeave.reason || ''}
              onChange={e => setNewLeave(p => ({ ...p, reason: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold mt-1 h-20 resize-none"
              placeholder="Family vacation, appointment, etc..."
            />
          </div>

          <button onClick={handleLeaveSubmit} className="w-full bg-primary hover:bg-primary-hover text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg mt-4">
            Submit Request
          </button>
          <button onClick={() => setLeaveModalOpen(false)} className="w-full text-slate-400 font-bold text-xs uppercase tracking-widest mt-4">Cancel</button>
        </div>
      </div>
    </div>
  );

  const renderCalendar = () => {

    const getDates = () => {
      const d = [];
      const start = new Date(currentDate);

      if (viewPeriod === 'week') {
        const day = start.getDay();
        const diff = start.getDate() - day + (day === 0 ? -6 : 1);
        start.setDate(diff);
        for (let i = 0; i < 7; i++) {
          d.push(new Date(start));
          start.setDate(start.getDate() + 1);
        }
      } else if (viewPeriod === 'month') {
        start.setDate(1);
        const month = start.getMonth();
        while (start.getMonth() === month) {
          d.push(new Date(start));
          start.setDate(start.getDate() + 1);
        }
      }
      return d;
    };

    const dates = getDates();

    const handlePrev = () => {
      const newDa = new Date(currentDate);
      if (viewPeriod === 'week') newDa.setDate(newDa.getDate() - 7);
      if (viewPeriod === 'month') newDa.setMonth(newDa.getMonth() - 1);
      if (viewPeriod === 'year') newDa.setFullYear(newDa.getFullYear() - 1);
      setCurrentDate(newDa);
    };

    const handleNext = () => {
      const newDa = new Date(currentDate);
      if (viewPeriod === 'week') newDa.setDate(newDa.getDate() + 7);
      if (viewPeriod === 'month') newDa.setMonth(newDa.getMonth() + 1);
      if (viewPeriod === 'year') newDa.setFullYear(newDa.getFullYear() + 1);
      setCurrentDate(newDa);
    };

    return (
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">

          <div className="flex bg-slate-50 p-1 rounded-xl">
            <button onClick={() => setCalendarMode('individual')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${calendarMode === 'individual' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>My Schedule</button>
            <button onClick={() => setCalendarMode('roster')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${calendarMode === 'roster' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>Team Roster</button>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={handlePrev} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100">←</button>
            <div className="text-center min-w-[120px]">
              <span className="block text-sm font-black uppercase text-slate-900">{viewPeriod === 'year' ? currentDate.getFullYear() : currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
              {viewPeriod === 'week' && <span className="block text-[10px] font-bold text-slate-400">Week {Math.ceil(currentDate.getDate() / 7)}</span>}
            </div>
            <button onClick={handleNext} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center hover:bg-slate-100">→</button>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setLeaveModalOpen(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:bg-indigo-700 transition-all">+ Request Leave</button>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              {['week', 'month', 'year'].map(v => (
                <button key={v} onClick={() => setViewPeriod(v as any)} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewPeriod === v ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden p-6 relative min-h-[400px]">
          {viewPeriod === 'year' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left min-w-[200px] sticky left-0 bg-white z-10">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Personnel</span>
                    </th>
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                      <th key={i} className="p-2 text-center min-w-[60px] border-l border-slate-50">
                        <span className="text-[10px] font-black uppercase text-slate-300">{m}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(calendarMode === 'roster' ? staff : [staff.find(s => s.id === selectedStaffId) || staff[0]]).map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                            {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : null}
                          </div>
                          <span className="text-xs font-black uppercase text-slate-900">{s.name.split(' ')[0]}</span>
                        </div>
                      </td>
                      {Array.from({ length: 12 }).map((_, monthIdx) => {
                        const count = attendance.filter(a => {
                          const d = new Date(a.date);
                          return a.staffId === s.id && d.getMonth() === monthIdx && d.getFullYear() === currentDate.getFullYear();
                        }).length;

                        return (
                          <td key={monthIdx} className="p-2 border-l border-slate-50 text-center">
                            {count > 0 ? (
                              <div className={`text-[10px] font-black px-2 py-1 rounded-lg ${count > 20 ? 'bg-emerald-100 text-emerald-700' : count > 10 ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                                {count}d
                              </div>
                            ) : <span className="text-slate-200">-</span>}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {viewPeriod !== 'year' && (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-4 text-left min-w-[150px] sticky left-0 bg-white z-10">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Personnel</span>
                    </th>
                    {dates.map((d, i) => (
                      <th key={i} className={`p-2 text-center min-w-[100px] border-l border-slate-50 ${d.toDateString() === new Date().toDateString() ? 'bg-indigo-50/50' : ''}`}>
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] font-black uppercase text-slate-300">{d.toLocaleString('default', { weekday: 'short' })}</span>
                          <span className={`text-sm font-black ${d.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-slate-700'}`}>{d.getDate()}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {(calendarMode === 'roster' ? staff : [staff.find(s => s.id === selectedStaffId) || staff[0]]).map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50/50 transition-colors z-10 border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
                            {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : null}
                          </div>
                          <div>
                            <p className="text-xs font-black uppercase text-slate-900">{s.name.split(' ')[0]}</p>
                            <p className="text-[9px] font-bold text-slate-400">{s.role}</p>
                          </div>
                        </div>
                      </td>
                      {dates.map((d, i) => {
                        const dateStr = d.toISOString().split('T')[0];
                        const record = attendance.find(a => a.staffId === s.id && a.date === dateStr);
                        const isToday = dateStr === new Date().toISOString().split('T')[0];

                        // Check Leave
                        const leave = leaves.find(l => {
                          const start = new Date(l.startDate);
                          const end = new Date(l.endDate);
                          start.setHours(0, 0, 0, 0);
                          end.setHours(23, 59, 59, 999);
                          const check = new Date(d);
                          check.setHours(12, 0, 0, 0);

                          return l.staffId === s.id && l.status === 'Approved' && check >= start && check <= end;
                        });

                        return (
                          <td key={i} className={`p-2 border-l border-slate-50 text-center relative ${isToday ? 'bg-indigo-50/30' : ''}`}>
                            {leave ? (
                              <div className={`px-2 py-1.5 rounded-lg inline-flex flex-col items-center w-full max-w-[80px] ${leave.type === 'Sick' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700'}`}>
                                <span className="text-[10px] font-black uppercase">{leave.type}</span>
                              </div>
                            ) : record ? (
                              <div className="bg-emerald-100 text-emerald-700 px-2 py-1.5 rounded-lg inline-flex flex-col items-center w-full max-w-[80px]">
                                <span className="text-[10px] font-black uppercase">Present</span>
                                <span className="text-[9px] font-mono opacity-80">{record.clockIn} - {record.clockOut || 'Now'}</span>
                              </div>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-100 inline-block"></span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 relative selection:bg-indigo-100">
      {/* Toast */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right-10 duration-300 ${notification.type === 'success' ? 'bg-emerald-600' : notification.type === 'error' ? 'bg-rose-600' : 'bg-indigo-600'} text-white`}>
          <span className="text-xl">{notification.type === 'success' ? '✅' : notification.type === 'error' ? '⚠️' : 'ℹ️'}</span>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{notification.type === 'success' ? 'Success' : notification.type === 'error' ? 'Alert' : 'Info'}</p>
            <p className="font-bold text-sm">{notification.message}</p>
          </div>
        </div>
      )}

      {/* Top Navigation */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 mb-8">
        <div className="flex bg-white px-2 py-2 rounded-2xl shadow-sm border border-slate-100">
          {[{ id: 'attendance', label: 'Dashboard' }, { id: 'registry', label: 'Registry' }, { id: 'calendar', label: 'Calendar' }].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === tab.id ? 'bg-primary text-white shadow-md' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedStaffId}
              onChange={e => setSelectedStaffId(e.target.value)}
              disabled={!isAdmin}
              className="bg-white border border-slate-200 pl-4 pr-10 py-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 appearance-none shadow-sm min-w-[200px]"
            >
              {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
          </div>
          {isAdmin && <button onClick={() => setTerminalOpen(true)} className="w-10 h-10 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-black transition-all">🛂</button>}
          {isAdmin && <button onClick={() => { setEditingStaff(null); setIsAddMode(true); }} className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-primary-hover transition-all">+</button>}
        </div>
      </div>

      {activeTab === 'attendance' && renderDashboard()}
      {activeTab === 'registry' && renderRegistry()}
      {activeTab === 'calendar' && renderCalendar()}

      {/* Modals */}
      {terminalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-5xl">
            <button onClick={() => setTerminalOpen(false)} className="absolute -top-12 right-0 text-white font-black uppercase">Close</button>
            <AccessTerminal isOpen={terminalOpen} onAuthenticate={handleTerminalAuth} staff={staff} onClose={() => setTerminalOpen(false)} />
          </div>
        </div>
      )}

      {(isAddMode || editingRecord) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">{isAddMode ? 'Quick Entry' : 'Edit Entry'}</h3>
            {/* Logic for quick entry form here if needed, or re-use editingRecord fields */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase">Staff Member</label>
                <select
                  disabled={!isAddMode}
                  value={editingRecord?.staffId}
                  onChange={e => setEditingRecord(prev => prev ? ({ ...prev, staffId: e.target.value }) : null)}
                  className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-900 outline-primary mt-1"
                >
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Clock In</label>
                  <input
                    type="time"
                    value={editingRecord?.clockIn || ''}
                    onChange={e => setEditingRecord(prev => prev ? ({ ...prev, clockIn: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-primary mt-1"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Clock Out</label>
                  <input
                    type="time"
                    value={editingRecord?.clockOut || ''}
                    onChange={e => setEditingRecord(prev => prev ? ({ ...prev, clockOut: e.target.value }) : null)}
                    className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-sm font-bold outline-primary mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={() => { setIsAddMode(false); setEditingRecord(null); }} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold">Close</button>
              <button onClick={saveRecordUpdate} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold shadow-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      {addStaffModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-black text-slate-900 mb-6">{editingStaff ? 'Edit Personnel' : 'Recruit Personnel'}</h3>
            <div className="space-y-4">
              <input placeholder="Full Name" className="w-full bg-slate-50 border-slate-200 p-3 rounded-xl outline-primary font-bold" value={editingStaff ? editingStaff.name : newStaffForm.name} onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, name: e.target.value }) : setNewStaffForm({ ...newStaffForm, name: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="PIN" className="w-full bg-slate-50 border-slate-200 p-3 rounded-xl outline-primary font-bold" value={editingStaff ? editingStaff.pin : newStaffForm.pin} onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, pin: e.target.value }) : setNewStaffForm({ ...newStaffForm, pin: e.target.value })} />
                <select
                  className="w-full bg-slate-50 border-slate-200 p-3 rounded-xl outline-primary font-bold"
                  value={editingStaff ? editingStaff.role : newStaffForm.role}
                  onChange={e => editingStaff ? setEditingStaff({ ...editingStaff, role: e.target.value as any }) : setNewStaffForm({ ...newStaffForm, role: e.target.value as any })}
                >
                  <option value="Cashier">Cashier</option>
                  <option value="Manager">Manager</option>
                  <option value="Owner">Owner</option>
                </select>
              </div>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center cursor-pointer hover:border-primary transition-colors relative">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={e => handlePhotoUpload(e, !!editingStaff)} />
                <p className="text-xs font-bold text-slate-400 uppercase">Upload Profile Photo</p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => { setAddStaffModalOpen(false); setEditingStaff(null); }} className="flex-1 py-3 text-slate-400 font-bold">Cancel</button>
              <button onClick={editingStaff ? handleUpdateStaff : handleAddNewStaff} className="flex-1 py-3 bg-primary text-white rounded-xl font-bold">{editingStaff ? 'Update' : 'Confirm'}</button>
            </div>
          </div>
        </div>
      )}

      {idCardStaff && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="relative">
            <button onClick={() => setIdCardStaff(null)} className="absolute -top-12 right-0 text-white font-bold">Close</button>
            <IDCard staff={idCardStaff} onClose={() => setIdCardStaff(null)} />
          </div>
        </div>
      )}
      {/* Leave Booking Modal */}
      {leaveModalOpen && renderLeaveModal()}
    </div>
  );
};

export default StaffView;
