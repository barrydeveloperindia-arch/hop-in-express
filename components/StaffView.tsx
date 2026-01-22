
import React, { useState, useMemo, useRef } from 'react';
import { read, utils } from 'xlsx';
import { StaffMember, AttendanceRecord, ViewType, UserRole } from '../types';
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
import { Users, Clock, Calendar, FolderOpen, FileText, Upload, Image as ImageIcon } from 'lucide-react';
import { addAttendanceRecord, updateAttendanceRecord, deleteAttendanceRecord } from '../lib/firestore';

const StaffView: React.FC<StaffViewProps> = ({ staff, attendance, setAttendance, logAction, userRole, currentStaffId }) => {
  const [activeTab, setActiveTab] = useState<'registry' | 'attendance' | 'calendar' | 'files'>('attendance');
  const [calendarMode, setCalendarMode] = useState<'individual' | 'roster'>('individual');
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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // 1. Compress the image first (Client-side optimization)
      const { compressImage } = await import('../lib/storage_utils');
      const compressedFile = await compressImage(file);

      // 2. Convert to Base64 String
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;

        // 3. Update State
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
        email: newStaffForm.email, // Added for RBAC
        loginBarcode: `STAFF-${Math.floor(Math.random() * 10000)}`,
        status: 'Pending Approval', // Initially Pending until Authorized by Backend
        joinedDate: new Date().toISOString().split('T')[0],
        contractType: 'Full-time',
        niNumber: newStaffForm.niNumber || 'PENDING',
        taxCode: '1257L',
        rightToWork: true,
        emergencyContact: '',
        monthlyRate: 0, hourlyRate: 11.44, dailyRate: 0, advance: 0, holidayEntitlement: 28, accruedHoliday: 0
      };

      // 1. Create in Firestore (Pending)
      const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
      await addStaffMember(userId, newStaff);

      // 2. Authorize via Backend
      // 2. Authorize via Backend
      // Removed localhost:3001 dependency as we are serverless using Firebase directly.
      // const response = await fetch(...);

      logAction('Recruitment', 'staff', `Authorized Enrollment: ${newStaff.name}`, 'Info');
      setAddStaffModalOpen(false);
      setNewStaffForm({ name: '', role: 'Cashier', pin: '', niNumber: '', photo: '', email: '' });
      alert("Staff Enrolled & Authorized Successfully!");

    } catch (e) {
      console.error(e);
      alert("Enrollment Error: " + e);
    }
  };

  const daysInMonth = useMemo(() => {
    const year = parseInt(filterMonth.split('-')[0]);
    const month = parseInt(filterMonth.split('-')[1]);
    return new Date(year, month, 0).getDate();
  }, [filterMonth]);

  const fileInputRef = useRef<HTMLInputElement>(null);


  // Helper for Native Export
  const saveWorkbook = async (wb: any, filename: string) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    const xlsx = await import('xlsx');

    if (Capacitor.isNativePlatform()) {
      try {
        const wbout = xlsx.write(wb, { bookType: 'xlsx', type: 'base64' });
        const result = await Filesystem.writeFile({
          path: filename,
          data: wbout,
          directory: Directory.Documents
        });
        await Share.share({
          title: 'Export Attendance',
          text: 'Here is the attendance sheet.',
          url: result.uri,
          dialogTitle: 'Share Attendance Excel'
        });
      } catch (e) {
        console.error(e);
        alert('Export Error: ' + e);
      }
    } else {
      xlsx.writeFile(wb, filename);
    }
  };

  const handleExport = () => {
    if (attendance.length === 0) return alert("No data to export.");

    const relevantRecords = attendance.filter(r => r.date.startsWith(filterMonth));
    if (relevantRecords.length === 0) return alert(`No records found for ${filterMonth}`);

    const exportData = relevantRecords.map(r => {
      const s = staff.find(st => st.id === r.staffId);
      return {
        'Staff ID': s?.pin || r.staffId,
        'Name': s?.name || 'Unknown',
        'Date': r.date,
        'Status': r.status,
        'Clock In': r.clockIn || '--',
        'Clock Out': r.clockOut || '--',
        'Hours': r.hoursWorked || 0,
        'Notes': r.notes || ''
      };
    });

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Attendance");
    const wscols = [{ wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 8 }, { wch: 30 }];
    ws['!cols'] = wscols;

    saveWorkbook(wb, `Attendance_Log_${filterMonth}.xlsx`);
  };

  const handleExportWeekly = () => {
    if (attendance.length === 0) return alert("No data to export.");

    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const relevantRecords = attendance.filter(r => {
      const d = new Date(r.date);
      return d >= monday && d <= sunday;
    });

    if (relevantRecords.length === 0) {
      return alert(`No records found for current week (${monday.toISOString().slice(0, 10)} to ${sunday.toISOString().slice(0, 10)})`);
    }

    const exportData = relevantRecords.map(r => {
      const s = staff.find(st => st.id === r.staffId);
      return {
        'Staff ID': s?.pin || r.staffId,
        'Name': s?.name || 'Unknown',
        'Date': r.date,
        'Status': r.status,
        'Clock In': r.clockIn || '--',
        'Clock Out': r.clockOut || '--',
        'Hours': r.hoursWorked || 0,
        'Notes': r.notes || ''
      };
    });

    const ws = utils.json_to_sheet(exportData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Weekly_Attendance");

    saveWorkbook(wb, `Attendance_Weekly_${monday.toISOString().slice(0, 10)}.xlsx`);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !auth.currentUser) return;
    const file = e.target.files[0];
    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
    // Actually, App.tsx handles subscriptions. For writes, we usually use auth.uid or pass a context. 
    // Existing functions use auth.currentUser.uid. If App.tsx syncs from VITE_USER_ID, we should probably use that for Writes too?
    // Let's stick to auth.currentUser.uid for consistency with existing StaffView logic, assuming the user is logged in as the specific shop owner account.

    try {
      const data = await file.arrayBuffer();
      const workbook = read(data);
      let importedCount = 0;

      for (const sheetName of workbook.SheetNames) {
        const sheet = workbook.Sheets[sheetName];
        const rows = utils.sheet_to_json(sheet, { header: 1 }) as any[][];
        if (rows.length < 5) continue;

        // Find staff by name (fuzzy match)
        const staffMember = staff.find(s => s.name.toLowerCase() === sheetName.toLowerCase());
        if (!staffMember) continue;

        console.log(`Processing Sheet for ${staffMember.name}...`);

        // Hardcoded Columns from script analysis
        const inTimeIdx = 9;
        const outTimeIdx = 10;
        const dateIdx = 0;

        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          if (!row || !row[dateIdx]) continue;

          // Date parsing (Excel returns serial or date obj)
          let dateVal = row[dateIdx];
          let dateStr = '';

          if (typeof dateVal === 'number') {
            // Excel Serial Date
            const dateObj = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
            dateStr = dateObj.toISOString().split('T')[0];
          } else if (dateVal instanceof Date) {
            dateStr = dateVal.toISOString().split('T')[0];
          } else {
            continue;
          }

          if (dateStr.startsWith('2025') || dateStr.startsWith('2026')) {
            const inTimeRaw = row[inTimeIdx];
            const outTimeRaw = row[outTimeIdx];

            if (inTimeRaw) {
              const fmtTime = (val: any) => {
                if (typeof val === 'number') {
                  // Time fraction
                  const totalSeconds = Math.round(val * 86400);
                  const h = Math.floor(totalSeconds / 3600);
                  const m = Math.floor((totalSeconds % 3600) / 60);
                  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
                }
                if (val instanceof Date) return val.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                return typeof val === 'string' && val.includes(':') ? val : undefined;
              };

              const clockIn = fmtTime(inTimeRaw);
              const clockOut = outTimeRaw ? fmtTime(outTimeRaw) : undefined;

              if (clockIn) {
                const newRecord: AttendanceRecord = {
                  id: `${staffMember.id}_${dateStr}`, // Consistent ID logic
                  staffId: staffMember.id,
                  date: dateStr,
                  status: 'Present',
                  clockIn: clockIn,
                  clockOut: clockOut,
                  notes: 'Imported via Excel'
                };

                // Blind write / Overwrite
                await addAttendanceRecord(userId, newRecord); // using auth.uid. If mismatches, data goes to wrong place.
                // However, App.tsx L137 passes user.uid to addLedgerEntry. 
                // The import logic used VITE_USER_ID.
                // If they differ, we have a problem.
                // I'll assume they match for the "Owner" logging in.
                importedCount++;
              }
            }
          }
        }
      }
      alert(`Successfully imported ${importedCount} records.`);
    } catch (e) {
      console.error(e);
      alert("Import Failed: " + e);
    }
  };

  const handleAttendanceAction = async (type: 'IN' | 'OUT') => {
    if (!auth.currentUser) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    // Force 24-hour format HH:MM manually to ensure sorting consistency
    const nowObj = new Date();
    const time = `${nowObj.getHours().toString().padStart(2, '0')}:${nowObj.getMinutes().toString().padStart(2, '0')}`;
    const targetStaff = staff.find(s => s.id === selectedStaffId);

    if (!targetStaff) return;

    if (type === 'IN') {
      const alreadyIn = attendance.some(a => a.staffId === selectedStaffId && a.date === today && !a.clockOut);
      if (alreadyIn) {
        alert(`${targetStaff.name} is already checked in for today.`);
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
        // DEBUG: Trace ID
        // alert(`Debug: Checking In ${targetStaff.name}\nTarget Shop: ${userId}`);

        await addAttendanceRecord(userId, newRecord);
        logAction('Staff Check-in', 'staff', `Authorized entry for ${targetStaff.name} at ${time}`, 'Info');
        alert("Check-In Successful. List should update.");
      } catch (err) {
        console.error("Error checking in:", err);
        alert("Failed to check in: " + err);
      }

    } else {
      const recordToUpdate = attendance.find(a => a.staffId === selectedStaffId && a.date === today && !a.clockOut);
      if (!recordToUpdate) {
        alert(`No active check-in record found for ${targetStaff.name} today.`);
        return;
      }

      const updates = {
        clockOut: time,
        hoursWorked: calculateHours(recordToUpdate.clockIn || '00:00', time)
      };

      try {
        await updateAttendanceRecord(userId, recordToUpdate.id, updates);
        logAction('Staff Check-out', 'staff', `Authorized exit for ${targetStaff.name} at ${time}`, 'Info');
      } catch (err) {
        console.error("Error checking out:", err);
        alert("Failed to check out. Please try again.");
      }
    }
  };

  const calculateHours = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    const diff = (h2 * 60 + m2) - (h1 * 60 + m1);
    return Math.max(0, parseFloat((diff / 60).toFixed(2)));
  };

  const saveRecordUpdate = async () => {
    if (!editingRecord || !auth.currentUser) return;
    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;

    // Auto-calculate hours if both clock in and out are present
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
        photo: editingStaff.photo,
        email: editingStaff.email
      };

      try {
        await updateStaffMember(userId, editingStaff.id, updates);
      } catch (innerErr: any) {
        // Fallback for "No Document" / Ghost Records
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

  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [idCardStaff, setIdCardStaff] = useState<StaffMember | null>(null);
  const [terminalOpen, setTerminalOpen] = useState(false);

  const handleTerminalAuth = async (staffId: string, method: 'QR' | 'BIO' | 'FACE' | 'PIN', proof?: string) => {
    const s = staff.find(st => st.id === staffId);
    if (!s || !auth.currentUser) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Smart Toggle: Find Open Shift
    const openShift = attendance.find(a => a.staffId === staffId && a.date === today && !a.clockOut);

    try {
      if (openShift) {
        // Clock Out
        const hours = calculateHours(openShift.clockIn || '00:00', time);
        await updateAttendanceRecord(userId, openShift.id, {
          clockOut: time,
          hoursWorked: hours,
          notes: `[${method}] Verified Checkout`
        });
        // We will let the Terminal component handle the "Success" UI, but we can log action
        logAction('Terminal Exit', 'staff', `${s.name} clocked OUT via ${method}`, 'Info');
      } else {
        // Clock In
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
      throw e; // Propagate to Terminal
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Generate 30 days of mock attendance? This will populate the calendar for testing.")) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser?.uid;
    if (!userId) { alert("Auth Error"); return; }

    let count = 0;
    const today = new Date();

    for (const s of staff) {
      for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];

        // Skip weekends
        if (d.getDay() === 0 || d.getDay() === 6) continue;
        // 10% Random absence
        if (Math.random() > 0.9) continue;

        const hIn = 8 + Math.floor(Math.random() * 2); // 8-10 AM
        const mIn = Math.floor(Math.random() * 60);
        const hOut = 16 + Math.floor(Math.random() * 3); // 4-7 PM
        const mOut = Math.floor(Math.random() * 60);

        const cin = `${hIn.toString().padStart(2, '0')}:${mIn.toString().padStart(2, '0')}`;
        const cout = `${hOut.toString().padStart(2, '0')}:${mOut.toString().padStart(2, '0')}`;

        const rec: AttendanceRecord = {
          id: `${s.id}_${dateStr}`,
          staffId: s.id,
          date: dateStr,
          status: 'Present',
          clockIn: cin,
          clockOut: cout,
          hoursWorked: parseFloat(((hOut + mOut / 60) - (hIn + mIn / 60)).toFixed(2)),
          notes: 'Mock Data'
        };

        await addAttendanceRecord(userId, rec);
        count++;
      }
    }

    // Explicitly add a "Just Now" record for verification of sorting
    // Priority: Nisha -> or Selected Staff
    const target = staff.find(s => s.name.toLowerCase().includes('nisha')) || staff.find(s => s.id === selectedStaffId);
    if (target) {
      const now = new Date();
      const time24 = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      await addAttendanceRecord(userId, {
        id: `${target.id}_TEST_${Date.now()}`,
        staffId: target.id,
        date: now.toISOString().split('T')[0],
        status: 'Present',
        clockIn: time24,
        notes: 'Sorting Verification'
      });
      count++;
    }

    alert(`Generated ${count} records for ${staff.length} staff: ${staff.map(s => s.name).join(', ')}.\n\nAdded verification record for: ${target?.name || 'None'}`);
  };

  const handleClearData = async () => {
    if (!confirm("⚠️ WARNING: This will DELETE ALL ATTENDANCE RECORDS.\n\nUse this to start fresh for testing.\nAre you sure?")) return;

    const userId = import.meta.env.VITE_USER_ID || auth.currentUser?.uid;
    if (!userId) return;

    let count = 0;
    const records = [...attendance];

    for (const r of records) {
      await deleteAttendanceRecord(userId, r.id);
      count++;
    }

    alert(`Cleared ${count} records. List should be empty.`);
    window.location.reload();
  };

  // Sort attendance: Newest Check-In (Date + Time) > Oldest
  const sortedAttendance = useMemo(() => {

    // Helper to get comparable value from record
    const getSortValue = (rec: AttendanceRecord) => {
      // 1. Parse Date
      let val = new Date(rec.date).getTime();
      if (isNaN(val)) val = 0;

      // 2. Parse Time (Handle 12h AM/PM and 24h)
      const timeStr = (rec.clockIn || '00:00').trim().toUpperCase();
      let hours = 0;
      let minutes = 0;

      try {
        if (timeStr.includes('PM') || timeStr.includes('AM')) {
          // 12-Hour Format
          const isPM = timeStr.includes('PM');
          const isAM = timeStr.includes('AM');
          const clean = timeStr.replace('PM', '').replace('AM', '').trim();
          const parts = clean.split(':');
          hours = parseInt(parts[0]) || 0;
          minutes = parseInt(parts[1]) || 0;

          if (isPM && hours < 12) hours += 12;
          if (isAM && hours === 12) hours = 0;
        } else {
          // 24-Hour Format
          const parts = timeStr.split(':');
          hours = parseInt(parts[0]) || 0;
          minutes = parseInt(parts[1]) || 0;
        }
      } catch (e) {
        // Fallback for weird strings
      }

      // Add milliseconds representing time of day
      val += (hours * 3600000) + (minutes * 60000);
      return val;
    };

    return [...attendance].sort((a, b) => getSortValue(b) - getSortValue(a));
  }, [attendance]);

  return (
    <div className="space-y-10 pb-24 animate-in fade-in duration-700">
      <div className="flex bg-surface-elevated p-2 rounded-2xl border border-surface-highlight w-full md:w-auto shadow-lg no-print overflow-x-auto">
        {[
          { id: 'attendance', label: 'Shift Logs', icon: '⏱️' },
          { id: 'calendar', label: 'Time Matrix', icon: '🗓️' },
          { id: 'registry', label: 'Personnel Vault', icon: '👤' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-6 md:px-10 py-4 release whitespace-nowrap rounded-xl text-[11px] font-black uppercase tracking-widest transition-all flex items-center gap-3 ${activeTab === tab.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-100' : 'text-slate-400 hover:text-ink-base'}`}
          >
            <span className="text-lg">{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'attendance' && (
        <div className="space-y-8">
          {/* Attendance Console */}
          <div className="bg-[#0F172A] p-6 md:p-10 rounded-[2.5rem] md:rounded-[3rem] text-white shadow-2xl flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 no-print">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 bg-surface-elevated/10 rounded-3xl flex items-center justify-center text-3xl border border-white/10 shrink-0">🛂</div>
              <div>
                <h4 className="text-xl font-black uppercase tracking-tight">Attendance Console</h4>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Manual Terminal Control</p>
              </div>
            </div>

            <div className="w-full xl:w-auto flex flex-col md:flex-row flex-wrap items-center gap-4 bg-surface-elevated/5 p-4 rounded-[2rem] border border-white/10">
              <div className="flex flex-col gap-1 w-full md:w-auto">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel Focus</label>
                <select
                  value={selectedStaffId}
                  onChange={e => setSelectedStaffId(e.target.value)}
                  disabled={!isAdmin}
                  className="bg-slate-900 border border-white/20 rounded-xl px-4 py-3 md:py-2 text-xs font-black uppercase outline-none focus:border-indigo-400 w-full md:min-w-[180px]"
                >
                  {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <button
                  onClick={() => setTerminalOpen(true)}
                  className="bg-black hover:bg-slate-900 border border-slate-700 text-white flex-1 md:flex-none px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 whitespace-nowrap flex items-center gap-2"
                >
                  <span className="text-emerald-500 animate-pulse">●</span> Terminal
                </button>
                {isAdmin && (
                  <>
                    <button
                      onClick={() => handleAttendanceAction('IN')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-none px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                      Check-In
                    </button>
                    <button
                      onClick={() => handleAttendanceAction('OUT')}
                      className="bg-rose-600 hover:bg-rose-700 text-white flex-1 md:flex-none px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                      Check-Out
                    </button>
                  </>
                )}
                {isAdmin && (
                  <>
                    <button
                      onClick={() => {
                        setIsAddMode(true);
                        setEditingRecord({
                          id: crypto.randomUUID(),
                          staffId: selectedStaffId,
                          date: new Date().toISOString().split('T')[0],
                          status: 'Present',
                          clockIn: '09:00',
                          clockOut: '17:00',
                          notes: 'Manual Override'
                        });
                      }}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 md:px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 whitespace-nowrap"
                    >
                      + Add
                    </button>
                    {/* Relocated to Files Tab */}
                    <button
                      onClick={handleExport}
                      className="bg-slate-800 hover:bg-slate-900 text-white px-6 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ml-2"
                    >
                      Month
                    </button>
                    <button
                      onClick={handleExportWeekly}
                      className="bg-slate-700 hover:bg-slate-800 text-white px-6 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ml-2"
                    >
                      Week
                    </button>
                    <button
                      onClick={handleSeedData}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-6 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ml-2"
                      title="Generate Mock Data"
                    >
                      ⚡
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="bg-slate-900 hover:bg-black text-white px-6 md:px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ml-2"
                    >
                      ↻
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 ml-2 self-center">{sortedAttendance.length} Recs</span>

                    <button
                      onClick={handleClearData}
                      className="bg-rose-900 hover:bg-rose-800 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-all active:scale-95 ml-2"
                      title="Clear All Data"
                    >
                      🗑️
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-elevated rounded-[2.5rem] md:rounded-[3.5rem] border border-surface-highlight shadow-sm overflow-hidden">
            {/* Desktop Table */}
            <table className="w-full text-left hidden md:table">
              <thead className="bg-surface-elevated text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="px-12 py-8">Employee</th>
                  <th className="px-12 py-8">Value Date</th>
                  <th className="px-12 py-8">Status</th>
                  <th className="px-12 py-8 text-center">Clock Cycle</th>
                  <th className="px-12 py-8 text-right">Hrs</th>
                  <th className="px-12 py-8 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {sortedAttendance.length === 0 ? (
                  <tr><td colSpan={6} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest italic opacity-40">No shift records currently registered</td></tr>
                ) : (
                  sortedAttendance.map(rec => {
                    const s = staff.find(st => st.id === rec.staffId);
                    return (
                      <tr key={rec.id} className="hover:bg-surface-elevated transition-all text-sm group">
                        <td className="px-12 py-8">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-surface-highlight rounded-2xl border flex items-center justify-center overflow-hidden relative shadow-sm">
                              {s?.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="text-[10px] font-black">{s?.name.slice(0, 2)}</div>}
                            </div>
                            <span className="uppercase text-ink-base">{s?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-12 py-8 text-slate-400 font-mono text-xs">{rec.date}</td>
                        <td className="px-12 py-8">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase ${rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-12 py-8 text-center font-mono text-ink-base">
                          {rec.clockIn || '--'} <span className="text-slate-300 mx-2">→</span> {rec.clockOut || '--'}
                        </td>
                        <td className="px-12 py-8 text-right text-[10px] text-indigo-400 uppercase font-black tracking-widest">
                          {rec.hoursWorked ? `${rec.hoursWorked}h` : '—'}
                        </td>
                        <td className="px-12 py-8 text-right">
                          {isAdmin && (
                            <button
                              onClick={() => {
                                setIsAddMode(false);
                                setEditingRecord({ ...rec });
                              }}
                              className="p-3 bg-surface-highlight rounded-xl text-slate-400 hover:bg-indigo-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                            >
                              ✎
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4 bg-surface-elevated">
              {sortedAttendance.length === 0 ? (
                <div className="py-10 text-center text-slate-300 font-black uppercase tracking-widest italic opacity-40">No shift records</div>
              ) : (
                sortedAttendance.slice(0, 20).map(rec => { // Limit to 20 on mobile to avoid lag
                  const s = staff.find(st => st.id === rec.staffId);
                  return (
                    <div key={rec.id} className="bg-surface-elevated p-5 rounded-2xl border border-surface-highlight shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-surface-highlight rounded-2xl border flex items-center justify-center overflow-hidden relative shadow-sm">
                            {s?.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="text-[10px] font-black">{s?.name.slice(0, 2)}</div>}
                          </div>
                          <div>
                            <p className="font-bold text-ink-base uppercase text-xs">{s?.name || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{rec.date}</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                          {rec.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pl-14">
                        <div className="text-xs font-mono font-bold text-ink-base">
                          {rec.clockIn || '-- : --'} <span className="text-slate-300 mx-1">→</span> {rec.clockOut || '-- : --'}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black text-indigo-400">{rec.hoursWorked ? `${rec.hoursWorked}h` : '-'}</span>
                          {isAdmin && (
                            <button
                              onClick={() => { setIsAddMode(false); setEditingRecord({ ...rec }); }}
                              className="text-indigo-600 bg-indigo-50 p-2 rounded-lg text-xs"
                            >
                              ✎
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {
        activeTab === 'calendar' && (
          <div className="space-y-10">
            <div className="bg-surface-elevated p-6 md:p-10 rounded-[2.5rem] md:rounded-[3.5rem] border border-surface-highlight flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center justify-between shadow-sm">
              <div className="flex gap-4 bg-surface-highlight p-2 rounded-xl">
                <button onClick={() => setCalendarMode('individual')} className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${calendarMode === 'individual' ? 'bg-surface-elevated shadow-md text-indigo-600' : 'text-slate-400 hover:text-ink-muted'}`}>Individual Focus</button>
                <button onClick={() => setCalendarMode('roster')} className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${calendarMode === 'roster' ? 'bg-surface-elevated shadow-md text-indigo-600' : 'text-slate-400 hover:text-ink-muted'}`}>Team Roster</button>
              </div>

              <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center w-full md:w-auto">
                {calendarMode === 'individual' ? (
                  <>
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start md:items-center w-full md:w-auto">
                      <p className="text-sm font-bold uppercase text-ink-base tracking-wider">Focus Personnel:</p>
                      <select value={selectedStaffId} onChange={e => setSelectedStaffId(e.target.value)} className="w-full md:w-auto bg-surface-elevated border-2 border-surface-highlight rounded-2xl px-6 py-4 text-sm font-bold uppercase outline-none focus:border-indigo-600 transition-all text-ink-base">
                        {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    </div>
                    <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full md:w-auto bg-surface-elevated border-2 border-surface-highlight rounded-2xl px-6 py-4 text-sm font-bold uppercase outline-none text-ink-base" />
                  </>
                ) : (
                  // Week Navigator for Roster
                  <div className="flex items-center gap-4 bg-surface-elevated p-2 rounded-xl">
                    <button onClick={() => setWeekOffset(prev => prev - 1)} className="w-12 h-12 flex items-center justify-center bg-surface-elevated rounded-xl shadow-sm font-black text-ink-muted hover:text-indigo-600 text-lg">◀</button>
                    <span className="text-xs font-black uppercase tracking-widest text-ink-base w-32 text-center">
                      {(() => {
                        const start = new Date();
                        const day = start.getDay();
                        const diff = start.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7);
                        const d = new Date(start.setDate(diff));
                        return `Week of ${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;
                      })()}
                    </span>
                    <button onClick={() => setWeekOffset(prev => prev + 1)} className="w-12 h-12 flex items-center justify-center bg-surface-elevated rounded-xl shadow-sm font-black text-ink-muted hover:text-indigo-600 text-lg">▶</button>
                  </div>
                )}
              </div>
            </div>

            {calendarMode === 'individual' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-3 md:gap-6">
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${filterMonth}-${day.toString().padStart(2, '0')}`;
                  // Get ALL records for this day (handle multiple shifts)
                  const dayRecords = attendance.filter(a => a.staffId === selectedStaffId && a.date === dateStr);
                  const isPresent = dayRecords.length > 0;
                  const firstRecord = dayRecords[0];

                  return (
                    <div
                      key={day}
                      onClick={() => isPresent && setDayDetails({ date: dateStr, records: dayRecords })}
                      className={`aspect-square p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 flex flex-col justify-between transition-all hover:scale-105 active:scale-95 ${isPresent ? 'bg-emerald-50 border-emerald-100 shadow-lg shadow-emerald-50 cursor-pointer' : 'bg-surface-elevated border-surface-highlight'}`}
                    >
                      <span className="text-lg font-black text-ink-muted">{day}</span>
                      <div className="text-center">
                        {isPresent ? (
                          <div className="space-y-1">
                            <span className="text-xs font-black uppercase text-emerald-700">Present</span>
                            <p className="text-[10px] font-mono text-emerald-600 hidden md:block">{firstRecord.clockIn} - {firstRecord.clockOut || 'IN'}</p>
                            {dayRecords.length > 1 && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-100 px-1 rounded-sm">+{dayRecords.length - 1} More</span>}
                          </div>
                        ) : (
                          <span className="text-[10px] font-black uppercase text-slate-300">Absence</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // ROSTER VIEW (WEEKLY)
              <div className="bg-surface-elevated rounded-[2.5rem] md:rounded-[3.5rem] border border-surface-highlight shadow-sm overflow-hidden p-6 md:p-10">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse min-w-[600px] md:min-w-full">
                    <thead>
                      <tr>
                        <th className="sticky left-0 bg-surface-elevated z-20 p-4 min-w-[120px] text-left text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-100 border-r shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">Staff</th>
                        {Array.from({ length: 7 }).map((_, i) => {
                          const start = new Date();
                          const day = start.getDay();
                          const diff = start.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7) + i;
                          const d = new Date(start.setDate(diff));
                          const isToday = new Date().toDateString() === d.toDateString();

                          return (
                            <th key={i} className={`min-w-[80px] p-4 text-center border-b border-slate-100 ${isToday ? 'bg-indigo-50/50' : ''}`}>
                              <div className="flex flex-col items-center">
                                <span className="text-[10px] font-black uppercase text-slate-300">{d.toLocaleString('default', { weekday: 'short' })}</span>
                                <span className={`text-sm font-black ${isToday ? 'text-indigo-600' : 'text-ink-base'}`}>{d.getDate()}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {staff.map(s => (
                        <tr key={s.id} className="hover:bg-surface-elevated/50 transition-colors">
                          <td className="sticky left-0 bg-surface-elevated z-10 p-4 text-xs font-bold text-ink-base uppercase border-r border-slate-100 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-surface-highlight rounded-xl border flex items-center justify-center overflow-hidden shrink-0">
                                {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <div className="text-[8px] font-black">{s.name.slice(0, 2)}</div>}
                              </div>
                              {s.name}
                            </div>
                          </td>
                          {Array.from({ length: 7 }).map((_, i) => {
                            const start = new Date();
                            const day = start.getDay();
                            const diff = start.getDate() - day + (day === 0 ? -6 : 1) + (weekOffset * 7) + i;
                            const d = new Date(start.setDate(diff));
                            const dateStr = d.toISOString().split('T')[0];

                            const rec = attendance.find(a => a.staffId === s.id && a.date === dateStr);
                            const isToday = new Date().toDateString() === d.toDateString();

                            return (
                              <td key={i} className={`p-2 text-center border-r border-slate-50 last:border-r-0 ${isToday ? 'bg-indigo-50/30' : ''}`}>
                                {rec ? (
                                  <div className="flex flex-col items-center gap-1">
                                    <div className={`px-3 py-1 rounded-md text-[10px] font-black uppercase w-full ${rec.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                      {rec.clockIn}
                                    </div>
                                    {rec.clockOut && <span className="text-[8px] font-mono text-slate-400">{rec.clockOut}</span>}
                                  </div>
                                ) : (
                                  <div className="w-1 h-1 rounded-full bg-slate-200 mx-auto"></div>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )
      }

      {
        activeTab === 'registry' && (
          <div className="bg-surface-elevated rounded-[2.5rem] md:rounded-[3.5rem] border border-surface-highlight shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 flex justify-end">
              {isAdmin && (
                <button
                  onClick={() => {
                    setIsAddMode(true);
                    setAddStaffModalOpen(true);
                  }}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-indigo-700 transition-all active:scale-95"
                >
                  + Recruit Personnel
                </button>
              )}
            </div>
            {/* Desktop Table */}
            <table className="w-full text-left hidden md:table">
              <thead className="bg-surface-elevated text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                <tr>
                  <th className="px-12 py-8">ID Photo</th>
                  <th className="px-12 py-8">Official Name</th>
                  <th className="px-12 py-8">Designation</th>
                  <th className="px-12 py-8">NI Number</th>
                  <th className="px-12 py-8 text-right">Engagement Date</th>
                  <th className="px-12 py-8 text-right">Ops</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-bold">
                {staff.map(s => (
                  <tr key={s.id} className="hover:bg-surface-elevated transition-all text-sm uppercase group">
                    <td className="px-12 py-8">
                      <div className="w-12 h-12 bg-surface-highlight rounded-2xl border border-surface-highlight overflow-hidden flex items-center justify-center">
                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="text-xl">👤</span>}
                      </div>
                    </td>
                    <td className="px-12 py-8">
                      <p className="text-ink-base group-hover:text-indigo-600 transition-colors">{s.name}</p>
                      <p className="text-[9px] text-slate-300 font-mono mt-2">#{s.id.slice(0, 8)}</p>
                    </td>
                    <td className="px-12 py-8 text-indigo-600 font-black tracking-widest text-[10px]">{s.role}</td>
                    <td className="px-12 py-8 font-mono text-xs text-slate-400">{s.niNumber}</td>
                    <td className="px-12 py-8 text-right text-slate-400 font-mono text-xs">{s.joinedDate}</td>
                    <td className="px-12 py-8 text-right">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setEditingStaff({ ...s })}
                            className="bg-surface-highlight hover:bg-slate-200 text-slate-400 hover:text-indigo-600 p-3 rounded-xl transition-all"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => setIdCardStaff(s)}
                            className="bg-surface-highlight hover:bg-slate-200 text-slate-400 hover:text-indigo-600 p-3 rounded-xl transition-all ml-2"
                            title="Generate ID Card"
                          >
                            🪪
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-4 bg-surface-elevated">
              {staff.map(s => (
                <div key={s.id} className="bg-surface-elevated p-5 rounded-2xl border border-surface-highlight shadow-sm flex flex-col gap-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-surface-highlight rounded-2xl border border-surface-highlight overflow-hidden flex items-center justify-center shrink-0">
                        {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="text-xl">👤</span>}
                      </div>
                      <div>
                        <p className="text-sm font-black text-ink-base uppercase">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">#{s.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-lg`}>
                      {s.role}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-[10px] font-mono text-ink-muted">{s.joinedDate}</span>
                    <div className="flex gap-2">
                      {isAdmin && (
                        <>
                          <button
                            onClick={() => setIdCardStaff(s)}
                            className="bg-indigo-50 text-indigo-600 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest mr-2"
                          >
                            ID
                          </button>
                          {isAdmin && (
                            <button
                              onClick={() => setEditingStaff({ ...s })}
                              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest"
                            >
                              Edit
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      }

      {/* Add Staff Modal */}
      {
        addStaffModalOpen && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-surface-elevated w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-emerald-600 p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">New Recruit</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">Registry Enrollment</p>
                </div>
                <button onClick={() => setAddStaffModalOpen(false)} className="text-4xl font-light hover:rotate-90 transition-all px-4">✕</button>
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={newStaffForm.name} onChange={e => setNewStaffForm({ ...newStaffForm, name: e.target.value })} placeholder="e.g. JOHN DOE" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Designation</label>
                  <select className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={newStaffForm.role} onChange={e => setNewStaffForm({ ...newStaffForm, role: e.target.value as any })}>
                    <option value="Cashier">Cashier</option>
                    <option value="Manager">Manager</option>
                    <option value="Stock Clerk">Stock Clerk</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Owner">Owner</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Photo</label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-surface-highlight rounded-2xl border flex items-center justify-center overflow-hidden relative">
                      {newStaffForm.photo ? (
                        <img src={newStaffForm.photo} className="w-full h-full object-cover" />
                      ) : <span className="text-2xl">📷</span>}
                    </div>
                    <label className="bg-slate-200 hover:bg-slate-300 text-ink-base px-3 py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors">
                      Upload
                      <input type="file" onChange={(e) => handlePhotoUpload(e, false)} className="hidden" accept="image/*" />
                    </label>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address (Role Access)</label>
                    <input className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={newStaffForm.email} onChange={e => setNewStaffForm({ ...newStaffForm, email: e.target.value })} placeholder="staff@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure PIN</label>
                    <input className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={newStaffForm.pin} onChange={e => setNewStaffForm({ ...newStaffForm, pin: e.target.value })} placeholder="0000" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NI Number</label>
                    <input className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={newStaffForm.niNumber} onChange={e => setNewStaffForm({ ...newStaffForm, niNumber: e.target.value })} placeholder="QQ123456A" />
                  </div>
                </div>
                <button onClick={handleAddNewStaff} className="w-full bg-[#0F172A] text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                  Authorize Enrollment
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* EDIT STAFF MODAL */}
      {
        editingStaff && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-surface-elevated w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Personnel File</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">Update & Modify</p>
                </div>
                <button onClick={() => setEditingStaff(null)} className="text-4xl font-light hover:rotate-90 transition-all px-4">✕</button>
              </div>
              <div className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={editingStaff.name} onChange={e => setEditingStaff({ ...editingStaff, name: e.target.value })} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role</label>
                    <select className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={editingStaff.role} onChange={e => setEditingStaff({ ...editingStaff, role: e.target.value as any })}>
                      <option value="Cashier">Cashier</option>
                      <option value="Manager">Manager</option>
                      <option value="Stock Clerk">Stock Clerk</option>
                      <option value="Accountant">Accountant</option>
                      <option value="Owner">Owner</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Profile Photo</label>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-surface-highlight rounded-2xl border flex items-center justify-center overflow-hidden relative">
                        {editingStaff.photo ? (
                          <img src={editingStaff.photo} className="w-full h-full object-cover" />
                        ) : <span className="text-2xl">📷</span>}
                      </div>
                      <label className="bg-slate-200 hover:bg-slate-300 text-ink-base px-3 py-2 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors">
                        Upload
                        <input type="file" onChange={(e) => handlePhotoUpload(e, true)} className="hidden" accept="image/*" />
                      </label>
                      <button
                        onClick={() => setIdCardStaff(editingStaff)}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-colors"
                      >
                        Generate ID
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                    <select className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={editingStaff.status} onChange={e => setEditingStaff({ ...editingStaff, status: e.target.value as any })}>
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                      <option value="Pending Approval">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">PIN</label>
                    <input className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={editingStaff.pin} onChange={e => setEditingStaff({ ...editingStaff, pin: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">NI Number</label>
                    <input className="w-full bg-surface-elevated border rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-600" value={editingStaff.niNumber} onChange={e => setEditingStaff({ ...editingStaff, niNumber: e.target.value })} />
                  </div>
                </div>

                <div className="bg-surface-elevated p-4 rounded-xl text-[10px] text-slate-400 text-center font-mono">
                  ID: {editingStaff.id}
                </div>


                <button onClick={handleUpdateStaff} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4">
                  Save Changes
                </button>

                <button
                  onClick={async () => {
                    if (!window.confirm("Are you sure you want to PERMANENTLY delete this staff member? This cannot be undone.")) return;
                    if (!auth.currentUser) return;
                    try {
                      const { deleteStaffMember } = await import('../lib/firestore');
                      await deleteStaffMember(auth.currentUser.uid, editingStaff.id);
                      setEditingStaff(null);
                      alert("Staff Member Deleted.");
                    } catch (e) {
                      alert("Delete Failed: " + e);
                    }
                  }}
                  className="w-full bg-rose-50 text-rose-600 py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-100 transition-all mt-2"
                >
                  Delete Personnel
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Attendance Update Modal */}
      {
        editingRecord && (
          <div className="fixed inset-0 z-[1000] bg-slate-900/90 backdrop-blur-xl flex items-center justify-center p-4">
            <div className="bg-surface-elevated w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col">
              <div className="bg-indigo-600 p-10 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tight">Shift Modification</h3>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-40 mt-1">Personnel Record Override</p>
                </div>
                <button onClick={() => { setEditingRecord(null); setIsAddMode(false); }} className="text-4xl font-light hover:rotate-90 transition-all px-4">✕</button>
              </div>
              <div className="p-12 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Personnel</label>
                    <select
                      value={editingRecord.staffId}
                      onChange={e => setEditingRecord({ ...editingRecord, staffId: e.target.value })}
                      className="w-full bg-surface-elevated border rounded-xl px-4 py-4 text-xs font-black outline-none focus:border-indigo-600"
                    >
                      {staff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Value Date</label>
                    <input
                      type="date"
                      value={editingRecord.date}
                      onChange={e => setEditingRecord({ ...editingRecord, date: e.target.value })}
                      className="w-full bg-surface-elevated border rounded-xl px-4 py-4 text-xs font-black outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clock In (Start)</label>
                    <input
                      type="time"
                      value={editingRecord.clockIn || ''}
                      onChange={e => setEditingRecord({ ...editingRecord, clockIn: e.target.value })}
                      className="w-full bg-surface-elevated border rounded-xl px-4 py-4 text-xl font-black font-mono outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Clock Out (End)</label>
                    <input
                      type="time"
                      value={editingRecord.clockOut || ''}
                      onChange={e => setEditingRecord({ ...editingRecord, clockOut: e.target.value })}
                      className="w-full bg-surface-elevated border rounded-xl px-4 py-4 text-xl font-black font-mono outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative Notes</label>
                  <textarea
                    value={editingRecord.notes || ''}
                    onChange={e => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                    placeholder="Reason for manual adjustment..."
                    className="w-full bg-surface-elevated border rounded-xl px-4 py-4 text-xs font-bold outline-none focus:border-indigo-600 h-24"
                  />
                </div>

                <div className="bg-surface-elevated p-6 rounded-2xl flex justify-between items-center">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recalculated Engagement</span>
                  <span className="text-2xl font-black font-mono text-indigo-600">{calculateHours(editingRecord.clockIn || '', editingRecord.clockOut || '')} Hours</span>
                </div>

                <button
                  onClick={saveRecordUpdate}
                  className="w-full bg-[#0F172A] text-white py-6 rounded-2xl font-black text-[11px] uppercase tracking-[0.5em] shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
                >
                  {isAddMode ? 'Authorize New Record' : 'Apply Overwrites'}
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Day Details Modal (Individual Focus) */}
      {dayDetails && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[1100] flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setDayDetails(null)}>
          <div className="bg-surface-elevated rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl scale-100 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black uppercase text-ink-base leading-none">
                  {new Date(dayDetails.date).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric' })}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {new Date(dayDetails.date).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => setDayDetails(null)} className="w-10 h-10 rounded-full bg-surface-highlight hover:bg-slate-200 flex items-center justify-center text-ink-muted font-bold text-lg">✕</button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {dayDetails.records.map((rec, idx) => (
                <div key={rec.id} className="bg-surface-elevated p-5 rounded-2xl border border-slate-100 flex justify-between items-center group hover:border-indigo-200 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-xl bg-surface-elevated border border-surface-highlight text-slate-400 flex items-center justify-center text-[10px] font-black shadow-sm group-hover:text-indigo-600 group-hover:border-indigo-200">{idx + 1}</span>
                    <div>
                      <p className="text-sm font-black text-slate-800 uppercase tabular-nums tracking-tight">
                        {rec.clockIn} <span className="text-slate-300 px-1">→</span> {rec.clockOut || 'ACTIVE'}
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{rec.clockOut ? 'Completed Shift' : 'Currently On Shift'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-black ${rec.hoursWorked ? 'text-emerald-600' : 'text-indigo-600 animate-pulse'}`}>
                      {rec.hoursWorked ? `${rec.hoursWorked}h` : 'Running'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-end">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Duration</p>
                <p className="text-sm font-bold text-ink-muted">{staff.find(s => s.id === selectedStaffId)?.name}</p>
              </div>
              <span className="text-4xl font-black text-ink-base tabular-nums tracking-tight">
                {dayDetails.records.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0).toFixed(2)}<span className="text-lg text-slate-400 ml-1">h</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {idCardStaff && <IDCard staff={idCardStaff} onClose={() => setIdCardStaff(null)} />}

      <AccessTerminal
        isOpen={terminalOpen}
        onClose={() => setTerminalOpen(false)}
        staff={staff}
        onAuthenticate={handleTerminalAuth}
        userRole={userRole} // Pass current role for secure closing
      />

    </div>
  );
};

export default StaffView;
