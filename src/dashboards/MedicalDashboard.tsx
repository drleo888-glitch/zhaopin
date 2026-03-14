import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { CheckCircle, XCircle, FileText, User, Filter } from 'lucide-react';
import { RESULT_FLAGS } from '../types';

export const MedicalDashboard: React.FC = () => {
  const { records, hospitals, updateRecordStatus } = useAppContext();
  const [medicalNotes, setMedicalNotes] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [activeFlags, setActiveFlags] = useState<string[]>([]); // Filter đang chọn

  const reviewable = records.filter(r =>
    ['RESULT_SUBMITTED', 'PASSED', 'FAILED', 'NOTIFIED'].includes(r.status)
  );

  // Lọc theo flags: nếu không chọn gì → hiện tất cả; nếu có chọn → hiện người có ít nhất 1 flag khớp
  const filtered = activeFlags.length === 0
    ? reviewable
    : reviewable.filter(r => activeFlags.some(f => r.resultFlags?.includes(f)));

  // Đếm số người "cần duyệt" (RESULT_SUBMITTED)
  const pendingCount = reviewable.filter(r => r.status === 'RESULT_SUBMITTED').length;

  const handleReviewResult = async (e: React.FormEvent, status: 'PASSED' | 'FAILED') => {
    e.preventDefault();
    if (!selectedRecordId) return;
    await updateRecordStatus(selectedRecordId, status, { medicalNotes, finalResult: status });
    setSelectedRecordId(null);
    setMedicalNotes('');
  };

  const toggleFlag = (flagId: string) => {
    setActiveFlags(prev =>
      prev.includes(flagId) ? prev.filter(f => f !== flagId) : [...prev, flagId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Duyệt kết quả khám (Phòng Y tế) / 审核体检结果</h2>
          {pendingCount > 0 && (
            <p className="text-sm text-amber-600 mt-1 font-medium">
              {pendingCount} hồ sơ đang chờ duyệt
            </p>
          )}
        </div>
      </div>

      {/* Thanh filter theo chỉ tiêu */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center text-sm font-medium text-gray-600 shrink-0">
            <Filter className="w-4 h-4 mr-1" /> Lọc chỉ tiêu bất thường:
          </span>
          <button onClick={() => setActiveFlags([])}
            className={`px-3 py-1 text-sm rounded-full border transition-colors ${
              activeFlags.length === 0
                ? 'bg-indigo-600 text-white border-indigo-600'
                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400'
            }`}>
            Tất cả ({reviewable.length})
          </button>
          {RESULT_FLAGS.map(flag => {
            const count = reviewable.filter(r => r.resultFlags?.includes(flag.id)).length;
            const active = activeFlags.includes(flag.id);
            return (
              <button key={flag.id} onClick={() => toggleFlag(flag.id)}
                className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                  active
                    ? 'bg-red-500 text-white border-red-500'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-red-400'
                }`}>
                {flag.label} {count > 0 && <span className={`font-bold ${active ? '' : 'text-red-600'}`}>({count})</span>}
              </button>
            );
          })}
        </div>
        {activeFlags.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            Đang hiển thị {filtered.length} hồ sơ có: {activeFlags.map(f => RESULT_FLAGS.find(rf => rf.id === f)?.label).join(', ')}
          </p>
        )}
      </div>

      {/* Danh sách hồ sơ */}
      <div className="grid gap-4">
        {filtered.map(record => {
          const hospital = hospitals.find(h => h.id === record.hospitalId);
          const hasFlags = record.resultFlags && record.resultFlags.length > 0;

          return (
            <div key={record.id} className={`bg-white rounded-xl shadow-sm border p-6 ${
              hasFlags ? 'border-red-200' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start">
                  <div className={`p-2 rounded-full mr-4 ${hasFlags ? 'bg-red-100' : 'bg-indigo-100'}`}>
                    <User className={`w-6 h-6 ${hasFlags ? 'text-red-600' : 'text-indigo-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{record.candidate.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      CCCD: {record.candidate.cccd} &nbsp;|&nbsp; {hospital?.name}
                    </p>
                  </div>
                </div>
                <StatusBadge status={record.status} />
              </div>

              {/* Chỉ tiêu bất thường */}
              {hasFlags && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {record.resultFlags!.map(fId => {
                    const flag = RESULT_FLAGS.find(f => f.id === fId);
                    return flag ? (
                      <span key={fId} className="text-xs bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-full font-medium">
                        ⚠️ {flag.labelFull}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              {/* Ghi chú từ bệnh viện */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-gray-400" /> Ghi chú từ Bệnh viện:
                </h4>
                <p className="text-sm text-gray-700">{record.resultNotes || <span className="text-gray-400 italic">Không có ghi chú</span>}</p>
              </div>

              {/* Form duyệt — chỉ hiện với RESULT_SUBMITTED */}
              {record.status === 'RESULT_SUBMITTED' && (
                selectedRecordId === record.id ? (
                  <form className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú đánh giá của Phòng Y tế</label>
                      <textarea required rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        value={medicalNotes} onChange={e => setMedicalNotes(e.target.value)}
                        placeholder="Nhập ghi chú đánh giá..." />
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button type="button" onClick={() => setSelectedRecordId(null)}
                        className="px-4 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md text-sm">Hủy</button>
                      <button type="button" onClick={e => handleReviewResult(e, 'FAILED')}
                        className="flex items-center px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-md text-sm">
                        <XCircle className="w-4 h-4 mr-2" /> Không đạt
                      </button>
                      <button type="button" onClick={e => handleReviewResult(e, 'PASSED')}
                        className="flex items-center px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-md text-sm">
                        <CheckCircle className="w-4 h-4 mr-2" /> Đạt
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex justify-end">
                    <button onClick={() => setSelectedRecordId(record.id)}
                      className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors text-sm">
                      <CheckCircle className="w-4 h-4 mr-2" /> Duyệt kết quả
                    </button>
                  </div>
                )
              )}

              {/* Kết quả đã duyệt */}
              {record.medicalNotes && (
                <div className="mt-4 bg-indigo-50 p-3 rounded-lg border border-indigo-100">
                  <p className="text-xs font-medium text-indigo-700 mb-1">Ghi chú Phòng Y tế:</p>
                  <p className="text-sm text-indigo-800">{record.medicalNotes}</p>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            {activeFlags.length > 0 ? 'Không có hồ sơ nào khớp với bộ lọc.' : 'Chưa có kết quả nào cần duyệt.'}
          </div>
        )}
      </div>
    </div>
  );
};
