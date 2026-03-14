import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { MapPin, Calendar, CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { records, hospitals, updateRecordStatus, loggedInCandidateId } = useAppContext();
  const [selectedHospital, setSelectedHospital] = useState<string>('');
  const [appointmentDate, setAppointmentDate] = useState<string>('');

  const candidateRecords = records.filter(r => r.candidate.id === loggedInCandidateId);

  const handleSelectHospital = (recordId: string) => {
    if (!selectedHospital || !appointmentDate) return;
    updateRecordStatus(recordId, 'HOSPITAL_SELECTED', {
      hospitalId: selectedHospital,
      appointmentDate: new Date(appointmentDate).toISOString(),
    });
    setSelectedHospital('');
    setAppointmentDate('');
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Hồ sơ khám sức khỏe của bạn / 您的体检档案</h2>

      <div className="grid gap-6">
        {candidateRecords.map((record) => {
          const hospital = hospitals.find(h => h.id === record.hospitalId);

          // Kiểm tra hạn cuối
          const now = new Date();
          const deadline = record.deadline ? new Date(record.deadline) : null;
          const isDeadlinePassed = deadline ? now > deadline : false;
          const isDeadlineSoon = deadline && !isDeadlinePassed
            ? (deadline.getTime() - now.getTime()) < 24 * 60 * 60 * 1000
            : false;

          return (
            <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Yêu cầu khám sức khỏe tuyển dụng</h3>
                  <p className="text-sm text-gray-500 mt-1">CCCD: {record.candidate.cccd}</p>
                </div>
                <StatusBadge status={(record.status === 'PASSED' || record.status === 'FAILED') ? 'RESULT_SUBMITTED' : record.status} />
              </div>

              {/* Thông tin hạn cuối */}
              {deadline && (
                <div className={`mb-4 flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
                  isDeadlinePassed
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : isDeadlineSoon
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                }`}>
                  {isDeadlinePassed ? (
                    <><AlertTriangle className="w-4 h-4 shrink-0" /> Đã hết hạn chọn lịch khám (hạn: {deadline.toLocaleDateString('vi-VN')} 16:30)</>
                  ) : isDeadlineSoon ? (
                    <><AlertTriangle className="w-4 h-4 shrink-0" /> Sắp hết hạn! Vui lòng chọn lịch trước {deadline.toLocaleDateString('vi-VN')} 16:30</>
                  ) : (
                    <><Clock className="w-4 h-4 shrink-0" /> Hạn cuối chọn lịch: {deadline.toLocaleDateString('vi-VN')} lúc 16:30</>
                  )}
                </div>
              )}

              {/* Chọn bệnh viện — chỉ hiện khi PENDING và chưa quá hạn */}
              {record.status === 'PENDING' && !isDeadlinePassed && (
                <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-4">Vui lòng chọn Bệnh viện và Thời gian khám:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Bệnh viện</label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        value={selectedHospital} onChange={e => setSelectedHospital(e.target.value)}>
                        <option value="">-- Chọn bệnh viện --</option>
                        {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-700 mb-1">Ngày giờ dự kiến</label>
                      <input type="datetime-local"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        value={appointmentDate}
                        min={new Date().toISOString().slice(0, 16)}
                        max={deadline ? deadline.toISOString().slice(0, 16) : undefined}
                        onChange={e => setAppointmentDate(e.target.value)} />
                    </div>
                  </div>
                  <button onClick={() => handleSelectHospital(record.id)}
                    disabled={!selectedHospital || !appointmentDate}
                    className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm">
                    Xác nhận chọn
                  </button>
                </div>
              )}

              {/* Quá hạn mà chưa chọn */}
              {record.status === 'PENDING' && isDeadlinePassed && (
                <div className="mt-4 bg-red-50 p-4 rounded-lg border border-red-200 flex items-start">
                  <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-700">
                    Đã hết hạn chọn lịch khám. Vui lòng liên hệ HR để được hỗ trợ.
                  </p>
                </div>
              )}

              {/* Thông tin lịch đã chọn */}
              {record.hospitalId && (
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                    <div>
                      <span className="font-medium text-gray-900">{hospital?.name}</span>
                      <br />{hospital?.address}
                    </div>
                  </div>
                  {record.appointmentDate && (
                    <div className="flex items-start text-sm text-gray-600">
                      <Calendar className="w-4 h-4 mr-2 mt-0.5 text-gray-400 shrink-0" />
                      <div>
                        <span className="font-medium text-gray-900">Lịch khám:</span>
                        <br />{new Date(record.appointmentDate).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Kết quả PASSED */}
              {record.status === 'NOTIFIED' && record.finalResult === 'PASSED' && (
                <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200 flex items-start">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-green-900">Thông báo từ HR</h4>
                    <p className="text-sm font-bold text-green-800 mt-2">Kết quả khám: Đạt ✅</p>
                    <p className="text-sm text-green-800 mt-1">
                      Chúc mừng! Bạn đã hoàn thành quy trình khám sức khỏe. Vui lòng kiểm tra email để nhận thông tin ngày nhận việc.
                    </p>
                  </div>
                </div>
              )}

              {/* Kết quả FAILED */}
              {record.status === 'NOTIFIED' && record.finalResult === 'FAILED' && (
                <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200 flex items-start">
                  <XCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 shrink-0" />
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Thông báo từ HR</h4>
                    <p className="text-sm font-bold text-red-800 mt-2">Kết quả khám: Không đạt ❌</p>
                    <p className="text-sm text-red-800 mt-1">
                      Cảm ơn bạn đã tham gia tuyển dụng. Hi vọng chúng ta có thể hợp tác trong tương lai.
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {candidateRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
            Bạn chưa có yêu cầu khám sức khỏe nào.
          </div>
        )}
      </div>
    </div>
  );
};
