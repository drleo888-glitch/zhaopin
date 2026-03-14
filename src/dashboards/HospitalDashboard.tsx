import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle, FileText, Users, ClipboardList, Archive } from 'lucide-react';
import { HealthCheckRecord, RESULT_FLAGS } from '../types';

type Tab = 'confirm' | 'submit' | 'done';

interface SessionGroup {
  date: string;
  session: 'morning' | 'afternoon';
  records: HealthCheckRecord[];
}

function getSession(dateTimeStr: string): 'morning' | 'afternoon' {
  const hour = new Date(dateTimeStr).getHours();
  return hour < 12 ? 'morning' : 'afternoon';
}

function groupBySession(records: HealthCheckRecord[]): SessionGroup[] {
  const map = new Map<string, SessionGroup>();
  records.forEach(r => {
    const dt = r.appointmentDate ?? '';
    const date = dt.slice(0, 10);
    const session = dt ? getSession(dt) : 'morning';
    const key = `${date}_${session}`;
    if (!map.has(key)) map.set(key, { date, session, records: [] });
    map.get(key)!.records.push(r);
  });
  return Array.from(map.values()).sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    return d !== 0 ? d : (a.session === 'morning' ? -1 : 1);
  });
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
}

export const HospitalDashboard: React.FC = () => {
  const { records, hospitals, updateRecordStatus } = useAppContext();
  const [activeTab, setActiveTab] = useState<Tab>('confirm');
  const [submitting, setSubmitting] = useState<string | null>(null); // recordId đang mở form nhập kết quả
  const [resultNotes, setResultNotes] = useState('');
  const [selectedFlags, setSelectedFlags] = useState<string[]>([]);

  const withHospital = records.filter(r => r.hospitalId);
  const toConfirm = withHospital.filter(r => r.status === 'HOSPITAL_SELECTED');
  const toSubmit = withHospital.filter(r => r.status === 'APPOINTMENT_CONFIRMED');
  const done = withHospital.filter(r => ['RESULT_SUBMITTED', 'PASSED', 'FAILED', 'NOTIFIED'].includes(r.status));

  // Xác nhận cả buổi
  const handleBatchConfirm = async (group: SessionGroup) => {
    await Promise.all(group.records.map(r => updateRecordStatus(r.id, 'APPOINTMENT_CONFIRMED')));
  };

  // Gửi kết quả từng người
  const handleSubmitResult = async (e: React.FormEvent, recordId: string) => {
    e.preventDefault();
    await updateRecordStatus(recordId, 'RESULT_SUBMITTED', {
      resultNotes,
      resultFlags: selectedFlags,
    });
    setSubmitting(null);
    setResultNotes('');
    setSelectedFlags([]);
  };

  const toggleFlag = (flagId: string) => {
    setSelectedFlags(prev =>
      prev.includes(flagId) ? prev.filter(f => f !== flagId) : [...prev, flagId]
    );
  };

  const openSubmitForm = (recordId: string) => {
    setSubmitting(recordId);
    setResultNotes('');
    setSelectedFlags([]);
  };

  const tabs: { id: Tab; label: string; count: number; icon: React.ElementType }[] = [
    { id: 'confirm', label: 'Chờ xác nhận', count: toConfirm.length, icon: ClipboardList },
    { id: 'submit', label: 'Nhập kết quả', count: toSubmit.length, icon: FileText },
    { id: 'done', label: 'Đã hoàn thành', count: done.length, icon: Archive },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Quản lý Khám sức khỏe (Bệnh viện) / 体检管理 (医院)</h2>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'
              }`}>
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-600'
                }`}>{tab.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: Chờ xác nhận — nhóm theo buổi */}
      {activeTab === 'confirm' && (
        <div className="space-y-4">
          {toConfirm.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              Không có lịch nào chờ xác nhận.
            </div>
          )}
          {groupBySession(toConfirm).map(group => {
            const hospital = hospitals.find(h => h.id === group.records[0]?.hospitalId);
            return (
              <div key={`${group.date}_${group.session}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Header nhóm */}
                <div className="bg-indigo-50 px-6 py-3 flex justify-between items-center border-b border-indigo-100">
                  <div>
                    <span className="font-medium text-indigo-900">
                      {group.session === 'morning' ? '🌅 Buổi sáng (07:30 – 11:30)' : '🌇 Buổi chiều (13:00 – 16:30)'}
                      &nbsp;—&nbsp;{formatDate(group.date)}
                    </span>
                    {hospital && <span className="text-xs text-indigo-600 ml-3">{hospital.name}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-indigo-700 font-medium">
                      <Users className="w-4 h-4 inline mr-1" />{group.records.length} người
                    </span>
                    <button onClick={() => handleBatchConfirm(group)}
                      className="flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Xác nhận cả buổi
                    </button>
                  </div>
                </div>
                {/* Danh sách người */}
                <table className="min-w-full divide-y divide-gray-100">
                  <tbody>
                    {group.records.map(r => (
                      <tr key={r.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
                        <td className="px-6 py-3 flex-1">
                          <span className="font-medium text-gray-900 text-sm">{r.candidate.name}</span>
                          <span className="text-gray-400 text-xs ml-3">CCCD: {r.candidate.cccd}</span>
                        </td>
                        <td className="px-6 py-3 text-sm text-gray-500">
                          {r.appointmentDate ? new Date(r.appointmentDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 2: Nhập kết quả — từng người */}
      {activeTab === 'submit' && (
        <div className="space-y-4">
          {toSubmit.length === 0 && (
            <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
              Không có hồ sơ nào cần nhập kết quả.
            </div>
          )}
          {toSubmit.map(record => {
            const hospital = hospitals.find(h => h.id === record.hospitalId);
            return (
              <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{record.candidate.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      CCCD: {record.candidate.cccd} &nbsp;|&nbsp;
                      {hospital?.name} &nbsp;|&nbsp;
                      {record.appointmentDate ? new Date(record.appointmentDate).toLocaleString('vi-VN') : ''}
                    </p>
                  </div>
                  <StatusBadge status={record.status} />
                </div>

                {submitting === record.id ? (
                  <form onSubmit={e => handleSubmitResult(e, record.id)} className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                    {/* Chỉ tiêu dị thường */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Chỉ tiêu có kết quả bất thường / 异常指标
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {RESULT_FLAGS.map(flag => (
                          <button key={flag.id} type="button" onClick={() => toggleFlag(flag.id)}
                            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                              selectedFlags.includes(flag.id)
                                ? 'bg-red-100 border-red-400 text-red-700 font-medium'
                                : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'
                            }`}>
                            {selectedFlags.includes(flag.id) ? '✓ ' : ''}{flag.labelFull}
                          </button>
                        ))}
                      </div>
                    </div>
                    {/* Ghi chú thêm */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú / kết luận bổ sung</label>
                      <textarea rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={resultNotes} onChange={e => setResultNotes(e.target.value)}
                        placeholder="Ghi chú thêm của bác sĩ (không bắt buộc)..." />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button type="button" onClick={() => setSubmitting(null)} className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md text-sm">Hủy</button>
                      <button type="submit" className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm">Gửi kết quả</button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-end">
                    <button onClick={() => openSubmitForm(record.id)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Nhập kết quả
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Đã hoàn thành */}
      {activeTab === 'done' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Ứng viên</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Ngày khám</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Chỉ tiêu bất thường</th>
                <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {done.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{r.candidate.name}</div>
                    <div className="text-xs text-gray-500">{r.candidate.cccd}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {r.appointmentDate ? new Date(r.appointmentDate).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="px-6 py-4">
                    {r.resultFlags && r.resultFlags.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {r.resultFlags.map(fId => {
                          const flag = RESULT_FLAGS.find(f => f.id === fId);
                          return flag ? (
                            <span key={fId} className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{flag.label}</span>
                          ) : null;
                        })}
                      </div>
                    ) : <span className="text-xs text-gray-400">Không có</span>}
                  </td>
                  <td className="px-6 py-4"><StatusBadge status={r.status} /></td>
                </tr>
              ))}
              {done.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-500">Chưa có hồ sơ hoàn thành.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
