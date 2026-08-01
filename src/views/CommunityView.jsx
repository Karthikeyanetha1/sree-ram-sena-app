import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  PackageCheck, 
  Award, 
  Users, 
  Calendar,
  CheckCircle2,
  MapPin,
  Phone,
  FileText,
  Clock,
  UserCheck
} from 'lucide-react';

export const CommunityView = () => {
  const { t, inventory, sponsors, volunteers, events, meetings } = useApp();
  const [activeTab, setActiveTab] = useState('inventory');
  const [attendance, setAttendance] = useState({
    'VOL-1': true,
    'VOL-2': true,
    'VOL-3': false,
    'VOL-4': true
  });

  const safeInventory = inventory || [];
  const safeSponsors = sponsors || [];
  const safeVolunteers = volunteers || [];
  const safeEvents = events || [];
  const safeMeetings = meetings || [];

  const toggleAttendance = (id) => {
    setAttendance({ ...attendance, [id]: !attendance[id] });
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {t.navCommunity} & Committee Notes
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Manage festival assets, sponsors directory, volunteer attendance, and meeting minutes.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: 'inventory', label: t.inventory, icon: PackageCheck },
          { id: 'volunteers', label: "Volunteers & Attendance", icon: Users },
          { id: 'meetings', label: "Meeting Notes & Minutes", icon: FileText },
          { id: 'sponsors', label: t.sponsors, icon: Award },
          { id: 'events', label: t.events, icon: Calendar },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition flex-shrink-0 ${
                activeTab === tab.id
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT: INVENTORY */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft-card space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Committee Asset & Inventory Register</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeInventory.map((inv) => (
              <div key={inv.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{inv.item}</h4>
                    <span className="text-[11px] text-slate-500 font-medium">Location: {inv.location}</span>
                  </div>
                  <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-xl">
                    Qty: {inv.qty}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 pt-2 border-t border-slate-200/60">
                  <div><strong>Assigned To:</strong> {inv.assignedTo}</div>
                  <div><strong>Purchase Date:</strong> {inv.purchaseDate} (₹{inv.cost.toLocaleString('en-IN')})</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: VOLUNTEERS & ATTENDANCE */}
      {activeTab === 'volunteers' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900">Volunteer Roster & Live Attendance</h3>
            <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
              Vinayaka Chavithi Crew
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {safeVolunteers.map((vol) => {
              const isPresent = attendance[vol.id];
              return (
                <div key={vol.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{vol.name}</h4>
                    <p className="text-xs font-bold text-emerald-700">{vol.role}</p>
                    <span className="text-[10px] text-slate-400">📞 {vol.mobile} • {vol.village}</span>
                  </div>

                  <button
                    onClick={() => toggleAttendance(vol.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition flex items-center space-x-1 ${
                      isPresent
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{isPresent ? 'Present' : 'Absent'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT: MEETING NOTES */}
      {activeTab === 'meetings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft-card space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Committee Meeting Minutes</h3>
          <div className="space-y-3">
            {safeMeetings.map((m) => (
              <div key={m.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-slate-900">{m.title}</h4>
                  <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">{m.date}</span>
                </div>
                <p className="text-xs text-slate-700 font-medium leading-snug">{m.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: SPONSORS */}
      {activeTab === 'sponsors' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft-card space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Festival Benefactors & Sponsors</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {safeSponsors.map((sp) => (
              <div key={sp.id} className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2">
                <span className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider bg-emerald-100 px-2 py-0.5 rounded">
                  {sp.category}
                </span>
                <h4 className="font-extrabold text-sm text-slate-900">{sp.name}</h4>
                <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200/60">
                  <span className="font-semibold text-slate-500">{sp.contact}</span>
                  <span className="font-black text-emerald-950">₹{sp.amount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: EVENTS */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-soft-card space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">Festival Schedule</h3>
          <div className="space-y-3">
            {safeEvents.map((ev) => (
              <div key={ev.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">{ev.title}</h4>
                  <p className="text-xs text-slate-500 font-medium">{ev.venue}</p>
                </div>
                <div className="text-right sm:text-right">
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-xl inline-block">
                    {ev.date} • {ev.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
