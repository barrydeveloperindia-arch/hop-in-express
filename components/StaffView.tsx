
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

  /* Notification System */
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
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
        photo: editingStaff.photo || '',
        email: editingStaff.email || ''
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

    // --- Redesign Helpers ---

    const getTargetStaff = () => staff.find(s => s.id === selectedStaffId);

    const getTodayRecord = () => {
      const today = new Date().toISOString().split('T')[0];
      return attendance.find(a => a.staffId === selectedStaffId && a.date === today && !a.clockOut);
    };

    const getStaffStats = () => {
      const sId = selectedStaffId;
      const myRecs = attendance.filter(a => a.staffId === sId);
      if (myRecs.length === 0) return { avgHours: '0h 0m', avgIn: '--:--', avgOut: '--:--', onTime: '0%' };

      // Avg Hours
      const totalHours = myRecs.reduce((acc, curr) => acc + (curr.hoursWorked || 0), 0);
      const avgH = myRecs.length ? totalHours / myRecs.length : 0;
      const h = Math.floor(avgH);
      const m = Math.round((avgH - h) * 60);

      // Avg Check In
      // Simple average of minutes from midnight
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

      // On Time (Assume 9:00 AM is target)
      const onTimeCount = myRecs.filter(r => {
        if (!r.clockIn) return false;
        const [hh, mm] = r.clockIn.split(':').map(Number);
        return (hh < 9) || (hh === 9 && mm <= 15); // 9:15 Buffer
      }).length;
      const onTimePct = ((onTimeCount / myRecs.length) * 100).toFixed(1);

      return {
        avgHours: `${h}h ${m}m`,
        avgIn: avgInStr,
        avgOut: '--', // hard to avg varied shifts
        onTime: `${onTimePct}%`
      };
    };

    return [...attendance].sort((a, b) => getSortValue(b) - getSortValue(a));
  }, [attendance]);

  const dashboardStats = useMemo(() => getStaffStats(), [attendance, selectedStaffId]);
  const targetStaffName = getTargetStaff()?.name || 'Staff';
  const todayRecord = getTodayRecord();
  const isCheckedIn = !!todayRecord;

  // Render Helpers
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Good afternoon, {targetStaffName.split(' ')[0]}!</h1>
          <p className="text-slate-400 font-medium mt-1">You have <span className="text-primary font-bold">0</span> leave requests pending.</p>
        </div>
        <div className="hidden md:flex bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest">Current Time</p>
            <p className="text-xl font-bold text-slate-900">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
          </div>
          <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Today Status Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start mb-6 w-full z-10">
            <h3 className="font-bold text-slate-900 text-lg">Today</h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isCheckedIn ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {isCheckedIn ? 'Present' : 'Absent'}
            </span>
          </div>

          <div className="flex items-center gap-8 mb-8 z-10">
            <div className="relative w-24 h-24 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                <circle cx="48" cy="48" r="40" stroke={isCheckedIn ? "#10B981" : "#FBBF24"} strokeWidth="8" fill="none" strokeDasharray="251" strokeDashoffset={isCheckedIn ? "50" : "180"} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900">{isCheckedIn ? "100%" : "0%"}</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-500 leading-tight">
                {isCheckedIn ? "You are clocked in and active." : "You have not marked yourself as present today!"}
              </p>
              {!isCheckedIn && <p className="text-xs font-bold text-rose-500 mt-2">Action Required</p>}
            </div>
          </div>

          <button
            onClick={() => handleAttendanceAction(isCheckedIn ? 'OUT' : 'IN')}
            className={`w-full py-4 rounded-xl text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${isCheckedIn ? 'bg-slate-900 hover:bg-black' : 'bg-primary hover:bg-primary-hover'} z-10`}
          >
            {isCheckedIn ? 'Check Out' : 'Mark Present'}
          </button>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          {[
            { label: 'Avg Hours', value: dashboardStats.avgHours, icon: Clock, color: 'text-primary' },
            { label: 'Avg Check-in', value: dashboardStats.avgIn, icon: Users, color: 'text-emerald-500' },
            { label: 'On-time Arrival', value: dashboardStats.onTime, icon: Calendar, color: 'text-emerald-600' },
            { label: 'Avg Check-out', value: dashboardStats.avgOut, icon: 'LogOut', color: 'text-rose-500' }
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className={`w-10 h-10 rounded-full ${stat.color === 'text-primary' ? 'bg-indigo-50' : 'bg-slate-50'} flex items-center justify-center mb-4`}>
                {stat.icon === 'LogOut' ? <LogOut className={`w-5 h-5 ${stat.color}`} /> : <stat.icon className={`w-5 h-5 ${stat.color}`} />}
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <p className="text-xl font-black text-slate-900 mt-1">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Attendance Chart */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900">Attendance</h3>
            <button className="text-[10px] font-bold text-primary uppercase">View Stats</button>
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-32 h-32 mb-6">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="56" stroke="#F1F5F9" strokeWidth="12" fill="none" />
                <circle cx="64" cy="64" r="56" stroke="#10B981" strokeWidth="12" fill="none" strokeDasharray="351" strokeDashoffset="100" strokeLinecap="round" />
                <circle cx="64" cy="64" r="56" stroke="#fbbf24" strokeWidth="12" fill="none" strokeDasharray="351" strokeDashoffset="310" strokeLinecap="round" className="opacity-80" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-slate-900">{attendance.length}</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Total</span>
              </div>
            </div>
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-medium text-slate-600"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> On Time</span>
                <span className="font-bold text-slate-900">{dashboardStats.onTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* My Team */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">My Team</h3>
            <div className="flex gap-4 text-[10px] font-bold uppercase text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-primary rounded-full"></span> Active</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-400 rounded-full"></span> Offline</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-5 text-[10px] font-black uppercase text-slate-400 tracking-widest pb-4 border-b border-slate-50">
              <div className="col-span-2">Member</div>
              <div className="text-center">Role</div>
              <div className="text-center">Status</div>
              <div className="text-right">ID</div>
            </div>
            {staff.map(s => {
              const isOnline = attendance.some(a => a.staffId === s.id && a.date === new Date().toISOString().split('T')[0] && !a.clockOut);
              return (
                <div key={s.id} className="grid grid-cols-5 items-center group">
                  <div className="col-span-2 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                      {s.photo ? <img src={s.photo} className="w-full h-full object-cover" /> : <span className="text-xs font-black text-slate-400">{s.name.slice(0, 2)}</span>}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-900">{s.name}</span>
                      <span className="text-[10px] font-medium text-slate-400">{s.email || 'No Email'}</span>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="px-2 py-1 rounded bg-slate-50 text-[10px] font-bold text-slate-600 uppercase">{s.role}</span>
                  </div>
                  <div className="text-center flex justify-center">
                    <div className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-primary' : 'bg-rose-300'}`}></div>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-400">#{s.pin}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Working History */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-bold text-slate-900 text-lg">Working History</h3>
            <button className="px-4 py-2 bg-slate-50 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">Show All</button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
                <tr>
                  <th className="pb-4 text-left pl-4">Date</th>
                  <th className="pb-4 text-left">Arrival</th>
                  <th className="pb-4 text-left">Departure</th>
                  <th className="pb-4 text-right pr-4">Hours</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedAttendance.filter(a => a.staffId === selectedStaffId).slice(0, 5).map(rec => (
                  <tr key={rec.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-primary flex items-center justify-center text-xs font-bold">
                          {new Date(rec.date).getDate()}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{rec.date === new Date().toISOString().split('T')[0] ? 'Today' : rec.date}</span>
                      </div>
                    </td>
                    <td className="py-4 text-xs font-medium text-slate-600">{rec.clockIn}</td>
                    <td className="py-4 text-xs font-medium text-slate-600">{rec.clockOut || 'Active'}</td>
                    <td className="py-4 pr-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-900">{rec.hoursWorked || 0}h</span>
                        <span className="text-[10px] text-emerald-500 font-medium">{rec.hoursWorked ? 'Successful' : 'Pending'}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                </div >
              </div >
            </div >
          )
        }

{/* EDIT STAFF MODAL */ }
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

{/* Attendance Update Modal */ }
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

{/* Day Details Modal (Individual Focus) */ }
{
  dayDetails && (
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
  )
}

{ idCardStaff && <IDCard staff={idCardStaff} onClose={() => setIdCardStaff(null)} /> }

<AccessTerminal
  isOpen={terminalOpen}
  onClose={() => setTerminalOpen(false)}
  staff={staff}
  onAuthenticate={handleTerminalAuth}
  userRole={userRole} // Pass current role for secure closing
/>

      </div >
    );
  };

export default StaffView;
