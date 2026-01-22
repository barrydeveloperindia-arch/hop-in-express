
import React, { useState, useMemo } from 'react';
import { SalaryRecord, StaffMember, AttendanceRecord, ViewType, AuditEntry, UserRole } from '../types';
import { SHOP_INFO } from '../constants';

interface SalaryViewProps {
   salaries: SalaryRecord[];
   setSalaries: React.Dispatch<React.SetStateAction<SalaryRecord[]>>;
   staff: StaffMember[];
   attendance: AttendanceRecord[];
   logAction: (action: string, module: ViewType, details: string, severity?: AuditEntry['severity']) => void;
   userRole: UserRole;
   currentStaffId: string;
}

const SalaryView: React.FC<SalaryViewProps> = ({ salaries, setSalaries, staff, attendance, logAction, userRole, currentStaffId }) => {
   const [filterMonth, setFilterMonth] = useState<string>(new Date().toISOString().slice(0, 7));
   const [selectedPayslip, setSelectedPayslip] = useState<SalaryRecord | null>(null);

   const isAdmin = userRole === 'Owner' || userRole === 'Manager';

   const visibleSalaries = useMemo(() => {
      const monthSalaries = salaries.filter(s => s.month === filterMonth);
      if (isAdmin) return monthSalaries;
      return monthSalaries.filter(s => s.staffId === currentStaffId);
   }, [salaries, filterMonth, isAdmin, currentStaffId]);

   /**
    * HMRC 2024/25 UK PAYROLL CORE
    */
   const calculateUKPayroll = (gross: number, taxCode: string) => {
      // 1. PAYE Income Tax (Personal Allowance £12,570)
      let allowance = 1047.50; // Monthly
      if (taxCode.toUpperCase() === 'BR') allowance = 0;

      const taxable = Math.max(0, gross - allowance);
      const tax = taxable * 0.20; // Simplified Basic Rate

      // 2. National Insurance (EE 8% Class 1)
      let ni = 0;
      if (gross > 1048) {
         ni = (gross - 1048) * 0.08;
      }

      // 3. Pension (Auto-Enrolment Employee 5%)
      let pension = 0;
      if (gross > 520) {
         pension = (gross - 520) * 0.05;
      }

      return { tax, ni, pension };
   };

   const runPayrollCycle = () => {
      if (!isAdmin) return;

      const newRecords: SalaryRecord[] = [];
      const today = new Date().toISOString().split('T')[0];

      staff.filter(s => s.status === 'Active').forEach(member => {
         const monthAttendance = attendance.filter(a => a.staffId === member.id && a.date.startsWith(filterMonth));

         const totalHours = monthAttendance.reduce((acc, a) => acc + (a.hoursWorked || 0), 0);
         const totalOT = monthAttendance.reduce((acc, a) => acc + (a.overtime || 0), 0);

         // Calculate Holiday & Sick
         const holidayDays = monthAttendance.filter(a => a.status === 'Holiday').length;
         const sickDays = monthAttendance.filter(a => a.status === 'Sick').length;

         let basePay = 0;
         if (member.hourlyRate > 0) {
            basePay = (totalHours - totalOT) * member.hourlyRate;
         } else if (member.dailyRate > 0) {
            const workingDays = monthAttendance.filter(a => a.status === 'Present' || a.status === 'Late').length;
            basePay = workingDays * member.dailyRate;
         }

         const overtimePay = totalOT * (member.hourlyRate * 1.5 || 15);
         const holidayPay = holidayDays * (member.hourlyRate * 8); // Assuming 8h day
         const sickPay = sickDays > 3 ? (sickDays - 3) * 23.35 : 0; // Simplified SSP (£116.75/5 days)

         const grossPay = basePay + overtimePay + holidayPay + sickPay;
         const deductions = calculateUKPayroll(grossPay, member.taxCode);

         const netPay = grossPay - deductions.tax - deductions.ni - deductions.pension - member.advance;

         // YTD Calcs (Simplified for demo)
         const ytdGross = grossPay * (parseInt(filterMonth.split('-')[1]) - 3); // Approx since April start

         newRecords.push({
            id: crypto.randomUUID(),
            staffId: member.id,
            employeeName: member.name,
            month: filterMonth,
            payDate: today,
            taxCode: member.taxCode,
            niNumber: member.niNumber,
            basePay,
            overtimePay,
            holidayPay,
            sickPay,
            totalHours,
            totalOvertime: totalOT,
            incomeTax: deductions.tax,
            nationalInsurance: deductions.ni,
            pension: deductions.pension,
            deductions: member.advance,
            grossPay,
            totalAmount: netPay,
            ytdGross: Math.max(grossPay, ytdGross),
            ytdTax: deductions.tax * 2,
            ytdNI: deductions.ni * 2,
            ytdPension: deductions.pension * 2,
            status: 'Pending',
            generatedAt: new Date().toISOString()
         });
      });

      setSalaries(prev => [...prev.filter(s => s.month !== filterMonth), ...newRecords]);
      logAction('Payroll Batch Finalized', 'salary', `Generated HMRC records for ${filterMonth}`, 'Warning');
      alert(`Cycle Complete: ${newRecords.length} payslips generated.`);
   };

   return (
      <div className="space-y-8 pb-24">
         <div className="bg-surface-elevated p-6 md:p-8 rounded-3xl border border-surface-highlight shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl">💷</div>
               <div>
                  <h4 className="text-sm font-black text-ink-base uppercase">HMRC Payroll Protocol</h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">PAYE & NI Digital Ledger</p>
               </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
               <input type="month" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} className="w-full sm:w-auto bg-surface-elevated border border-surface-highlight rounded-xl px-4 py-3 text-xs font-black uppercase outline-none focus:border-indigo-600" />
               {isAdmin && (
                  <button onClick={runPayrollCycle} className="w-full sm:w-auto bg-indigo-600 text-white px-8 py-3.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all whitespace-nowrap">Calculate Cycle</button>
               )}
            </div>
         </div>

         <div className="bg-surface-elevated rounded-[2.5rem] border border-surface-highlight shadow-sm overflow-hidden">
            <table className="w-full text-left hidden md:table">
               <thead className="bg-surface-elevated text-slate-400 text-[9px] font-black uppercase tracking-widest border-b">
                  <tr>
                     <th className="px-10 py-6">Employee</th>
                     <th className="px-10 py-6">Gross Accrual</th>
                     <th className="px-10 py-6">UK Tax / NI</th>
                     <th className="px-10 py-6">Net Remittance</th>
                     <th className="px-10 py-6 text-right">Payslip</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {visibleSalaries.length === 0 ? (
                     <tr><td colSpan={5} className="py-20 text-center text-slate-300 font-black uppercase tracking-widest italic">No records for selected period</td></tr>
                  ) : (
                     visibleSalaries.map(sal => (
                        <tr key={sal.id} className="hover:bg-surface-elevated transition-all group">
                           <td className="px-10 py-7">
                              <p className="font-black text-ink-base text-sm uppercase">{sal.employeeName}</p>
                              <p className="text-[9px] text-slate-400 font-bold uppercase mt-1">Code: {sal.taxCode} • NI: {sal.niNumber}</p>
                           </td>
                           <td className="px-10 py-7">
                              <span className="font-black text-ink-base">£{sal.grossPay.toFixed(2)}</span>
                              {sal.totalOvertime > 0 && <span className="ml-2 text-[8px] font-black text-rose-600">+{sal.totalOvertime.toFixed(1)} OT</span>}
                           </td>
                           <td className="px-10 py-7">
                              <p className="text-[10px] font-bold text-rose-600 uppercase">PAYE: £{sal.incomeTax.toFixed(2)}</p>
                              <p className="text-[10px] font-bold text-indigo-600 uppercase">NI: £{sal.nationalInsurance.toFixed(2)}</p>
                           </td>
                           <td className="px-10 py-7">
                              <span className="text-xl font-black font-mono text-[#0F172A]">£{sal.totalAmount.toFixed(2)}</span>
                           </td>
                           <td className="px-10 py-7 text-right">
                              <button onClick={() => setSelectedPayslip(sal)} className="bg-slate-900 text-white px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all hover:bg-black">View Slip</button>
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>

            {/* Mobile Salary Cards */}
            <div className="md:hidden p-4 space-y-4 bg-surface-elevated">
               {visibleSalaries.length === 0 ? (
                  <div className="text-center py-10 text-slate-400 font-black uppercase text-xs tracking-widest">No records found</div>
               ) : (
                  visibleSalaries.map(sal => (
                     <div key={sal.id} className="bg-surface-elevated p-5 rounded-2xl border border-surface-highlight shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="font-black text-ink-base uppercase text-xs">{sal.employeeName}</p>
                              <p className="text-[10px] text-slate-400 font-mono mt-1">Code: {sal.taxCode}</p>
                           </div>
                           <span className="text-xl font-black font-mono text-ink-base">£{sal.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3">
                           <div>
                              <p className="text-[8px] font-black uppercase text-slate-400">Gross</p>
                              <p className="font-black text-ink-base">£{sal.grossPay.toFixed(2)}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-[8px] font-black uppercase text-slate-400">Deductions</p>
                              <p className="font-black text-rose-600">£{(sal.incomeTax + sal.nationalInsurance).toFixed(2)}</p>
                           </div>
                        </div>
                        <button onClick={() => setSelectedPayslip(sal)} className="w-full bg-slate-900 text-white py-3 rounded-xl text-[9px] font-black uppercase tracking-widest">View Payslip</button>
                     </div>
                  ))
               )}
            </div>
         </div>

         {selectedPayslip && (
            <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
               <div className="bg-surface-elevated w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2rem] shadow-2xl p-6 md:p-16 relative">
                  <button onClick={() => setSelectedPayslip(null)} className="absolute top-6 right-6 md:top-10 md:right-10 text-3xl font-light text-slate-300 hover:text-rose-500 transition-colors">✕</button>

                  <div className="flex flex-col md:flex-row justify-between items-start border-b-2 border-slate-900 pb-10 mb-12 gap-8">
                     <div>
                        <h1 className="text-4xl font-black text-ink-base tracking-tighter uppercase leading-none">{SHOP_INFO.name}</h1>
                        <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest mt-4 max-w-[200px] leading-relaxed">{SHOP_INFO.address}</p>
                        <div className="mt-6 flex gap-3">
                           <span className="text-[8px] font-black bg-slate-900 text-white px-3 py-1 rounded uppercase">HMRC PAYE REGISTERED</span>
                        </div>
                     </div>
                     <div className="text-left md:text-right">
                        <div className="bg-slate-900 text-white px-10 py-4 text-2xl font-black uppercase tracking-widest inline-block shadow-xl">PAYSLIP</div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em] mt-4">Confidential Document</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 mb-12">
                     <div className="bg-surface-elevated p-8 rounded-2xl border border-surface-highlight">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Employee Personal Record</p>
                        <h2 className="text-xl font-black text-ink-base uppercase tracking-tight">{selectedPayslip.employeeName}</h2>
                        <div className="grid grid-cols-2 gap-4 mt-6">
                           <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">NI Number</p>
                              <p className="text-xs font-black font-mono mt-1">{selectedPayslip.niNumber}</p>
                           </div>
                           <div>
                              <p className="text-[8px] font-bold text-slate-400 uppercase">Tax Code</p>
                              <p className="text-xs font-black font-mono mt-1">{selectedPayslip.taxCode}</p>
                           </div>
                        </div>
                     </div>
                     <div className="text-right space-y-4 py-4">
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Pay Period Ending</p>
                           <p className="text-xl font-black text-ink-base uppercase">{selectedPayslip.month}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payment Date</p>
                           <p className="text-base font-black text-ink-base">{selectedPayslip.payDate}</p>
                        </div>
                     </div>
                  </div>

                  <div className="mb-12 overflow-x-auto">
                     <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest">
                           <tr>
                              <th className="py-4 px-8">Earnings & Benefits</th>
                              <th className="py-4 px-8 text-right">Payments (£)</th>
                              <th className="py-4 px-8 text-right">Deductions (£)</th>
                           </tr>
                        </thead>
                        <tbody className="text-[11px] font-bold divide-y divide-slate-100">
                           <tr>
                              <td className="py-5 px-8 uppercase">Basic Monthly Remuneration</td>
                              <td className="py-5 px-8 text-right font-mono">£{selectedPayslip.basePay.toFixed(2)}</td>
                              <td className="py-5 px-8 text-right font-mono">—</td>
                           </tr>
                           {selectedPayslip.overtimePay > 0 && (
                              <tr>
                                 <td className="py-5 px-8 uppercase text-rose-600">Overtime Premium (1.5x)</td>
                                 <td className="py-5 px-8 text-right font-mono text-rose-600">£{selectedPayslip.overtimePay.toFixed(2)}</td>
                                 <td className="py-5 px-8 text-right font-mono">—</td>
                              </tr>
                           )}
                           {selectedPayslip.holidayPay > 0 && (
                              <tr>
                                 <td className="py-5 px-8 uppercase text-indigo-600">Statutory Holiday Pay</td>
                                 <td className="py-5 px-8 text-right font-mono text-indigo-600">£{selectedPayslip.holidayPay.toFixed(2)}</td>
                                 <td className="py-5 px-8 text-right font-mono">—</td>
                              </tr>
                           )}
                           <tr className="bg-red-50/20 text-red-600">
                              <td className="py-5 px-8 uppercase">PAYE Income Tax (24/25)</td>
                              <td className="py-5 px-8 text-right font-mono">—</td>
                              <td className="py-5 px-8 text-right font-mono">£{selectedPayslip.incomeTax.toFixed(2)}</td>
                           </tr>
                           <tr className="bg-indigo-50/20 text-indigo-600">
                              <td className="py-5 px-8 uppercase">Employee NI (Class 1)</td>
                              <td className="py-5 px-8 text-right font-mono">—</td>
                              <td className="py-5 px-8 text-right font-mono">£{selectedPayslip.nationalInsurance.toFixed(2)}</td>
                           </tr>
                           <tr className="bg-surface-elevated text-ink-muted">
                              <td className="py-5 px-8 uppercase">Standard Pension Contribution</td>
                              <td className="py-5 px-8 text-right font-mono">—</td>
                              <td className="py-5 px-8 text-right font-mono">£{selectedPayslip.pension.toFixed(2)}</td>
                           </tr>
                        </tbody>
                     </table>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                     <div className="bg-surface-elevated p-8 rounded-xl border border-surface-highlight">
                        <h4 className="text-[10px] font-black uppercase tracking-widest border-b border-surface-highlight pb-3 mb-4">Cumulative YTD Balances</h4>
                        <div className="space-y-3">
                           <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400 uppercase">Gross Pay YTD</span>
                              <span className="font-mono">£{selectedPayslip.ytdGross.toFixed(2)}</span>
                           </div>
                           <div className="flex justify-between text-[11px] font-bold">
                              <span className="text-slate-400 uppercase">Tax Paid YTD</span>
                              <span className="font-mono text-rose-600">£{selectedPayslip.ytdTax.toFixed(2)}</span>
                           </div>
                        </div>
                     </div>
                     <div className="bg-slate-900 p-8 md:p-10 rounded-2xl text-white shadow-2xl flex flex-col justify-center text-center relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12 scale-150">🇬🇧</div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-300 mb-4">Total Net Remittance</p>
                        <p className="text-4xl md:text-6xl font-black font-mono tracking-tighter">£{selectedPayslip.totalAmount.toFixed(2)}</p>
                     </div>
                  </div>

                  <div className="mt-16 pt-10 border-t border-slate-100 text-center space-y-3">
                     <p className="text-[9px] font-black uppercase tracking-[0.5em] text-slate-300">HMRC DIGITAL SENTRY RECORD • HOP IN EXPRESS OS</p>
                     <div className="flex justify-center gap-6 no-print">
                        <button onClick={() => window.print()} className="bg-slate-900 text-white px-10 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest">Download PDF Statement</button>
                        <button onClick={() => setSelectedPayslip(null)} className="text-slate-400 font-black text-[10px] uppercase">Discard View</button>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </div>
   );
};

export default SalaryView;
