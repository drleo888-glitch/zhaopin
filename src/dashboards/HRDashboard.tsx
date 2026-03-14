import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useAppContext } from '../context/AppContext';
import { StatusBadge } from '../components/StatusBadge';
import { Plus, Bell, CheckCircle, XCircle, Download, Upload, AlertCircle } from 'lucide-react';
import { NewRecordInput } from '../types';

// Chuyển "DD/MM/YYYY" hoặc "YYYY-MM-DD" → "YYYY-MM-DD"
function parseExcelDate(val: any): string {
  if (!val) return '';
  const str = String(val).trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(str)) {
    const [d, m, y] = str.split('/');
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) return str.slice(0, 10);
  return str;
}

function parseGender(val: any): 'male' | 'female' {
  const s = String(val ?? '').toLowerCase().trim();
  return s.includes('nữ') || s.includes('nu') || s === 'f' || s === 'female' ? 'female' : 'male';
}

export const HRDashboard: React.FC = () => {
  const { records, addRecord, addRecordBulk, updateRecordStatus } = useAppContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState<NewRecordInput>({ name: '', gender: 'male', dob: '', cccd: '', deadline: '' });
  const [importPreview, setImportPreview] = useState<NewRecordInput[] | null>(null);
  const [importError, setImportError] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data: NewRecordInput = { ...formData };
    if (data.deadline) data.deadline = `${data.deadline}T16:30:00`;
    else delete data.deadline;
    await addRecord(data);
    setIsFormOpen(false);
    setFormData({ name: '', gender: 'male', dob: '', cccd: '', deadline: '' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const workbook = XLSX.read(evt.target?.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1, defval: '' });

        // Bỏ qua hàng tiêu đề (hàng 0)
        const parsed: NewRecordInput[] = rows.slice(1)
          .filter((row: any[]) => row[0]) // bỏ hàng trống
          .map((row: any[]) => {
            const deadline = parseExcelDate(row[4]);
            return {
              name: String(row[0]).trim(),
              gender: parseGender(row[1]),
              dob: parseExcelDate(row[2]),
              cccd: String(row[3]).trim(),
              deadline: deadline ? `${deadline}T16:30:00` : undefined,
            };
          });

        if (parsed.length === 0) {
          setImportError('File không có dữ liệu hoặc không đúng định dạng.');
          return;
        }
        setImportPreview(parsed);
      } catch {
        setImportError('Không thể đọc file. Vui lòng kiểm tra định dạng Excel.');
      }
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    setIsImporting(true);
    await addRecordBulk(importPreview);
    setImportPreview(null);
    setIsImporting(false);
  };

  const handleExport = () => window.open('/api/export', '_blank');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-900">Quản lý Khám sức khỏe (HR) / 体检管理 (HR)</h2>
        <div className="flex items-center gap-3">
          <button onClick={handleExport} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <Download className="w-4 h-4 mr-2" />
            Xuất kết quả CSV
          </button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm">
            <Upload className="w-4 h-4 mr-2" />
            Import Excel
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
          <button onClick={() => setIsFormOpen(true)} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Thêm 1 người
          </button>
        </div>
      </div>

      {/* Hướng dẫn định dạng Excel */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
        <strong>Định dạng file Excel / Excel文件格式:</strong> Cột A: Họ tên &nbsp;|&nbsp; B: Giới tính (Nam/Nữ) &nbsp;|&nbsp; C: Ngày sinh (DD/MM/YYYY) &nbsp;|&nbsp; D: CCCD &nbsp;|&nbsp; E: Hạn cuối (DD/MM/YYYY, tùy chọn)
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Họ tên / CCCD</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giới tính</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày sinh</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hạn cuối</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => {
              const deadlinePassed = record.deadline ? new Date() > new Date(record.deadline) : false;
              return (
                <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{record.candidate.name}</div>
                    <div className="text-sm text-gray-500">{record.candidate.cccd}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {record.candidate.gender === 'male' ? 'Nam' : 'Nữ'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.candidate.dob}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.deadline ? (
                      <span className={deadlinePassed ? 'text-red-600 font-medium' : 'text-gray-700'}>
                        {record.deadline.slice(0, 10)}
                        {deadlinePassed && ' ⚠️'}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <StatusBadge status={record.status} />
                      {record.status === 'NOTIFIED' && record.finalResult && (
                        <span className={`text-xs font-medium ${record.finalResult === 'PASSED' ? 'text-green-600' : 'text-red-600'}`}>
                          {record.finalResult === 'PASSED' ? '✅ Đạt' : '❌ Không đạt'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {(record.status === 'PASSED' || record.status === 'FAILED') && (
                      <button onClick={() => updateRecordStatus(record.id, 'NOTIFIED')}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full">
                        <Bell className="w-4 h-4 mr-1" /> Thông báo
                      </button>
                    )}
                    {record.status === 'NOTIFIED' && (
                      <span className="text-gray-400 flex items-center justify-end w-full">
                        <CheckCircle className="w-4 h-4 mr-1" /> Đã thông báo
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {records.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-500">Chưa có dữ liệu.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal form thêm 1 người */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Tạo yêu cầu khám mới</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input required type="text" value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giới tính</label>
                  <select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="male">Nam</option>
                    <option value="female">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày sinh</label>
                  <input required type="date" value={formData.dob}
                    onChange={e => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Căn cước công dân</label>
                <input required type="text" value={formData.cccd}
                  onChange={e => setFormData({ ...formData, cccd: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hạn cuối chọn lịch <span className="text-gray-400 font-normal">(mặc định 16:30, tùy chọn)</span>
                </label>
                <input type="date" value={formData.deadline ?? ''}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Hủy</button>
                <button type="submit" className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md">Tạo yêu cầu</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal preview import Excel */}
      {importPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Xem trước import — {importPreview.length} hồ sơ
              </h3>
              <button onClick={() => setImportPreview(null)} className="text-gray-400 hover:text-gray-600"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="overflow-auto flex-1 p-6">
              <table className="min-w-full text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">#</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Họ tên</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Giới tính</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Ngày sinh</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">CCCD</th>
                    <th className="px-3 py-2 text-left text-xs text-gray-500 uppercase">Hạn cuối</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {importPreview.map((row, i) => (
                    <tr key={i} className={!row.name || !row.cccd || !row.dob ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 text-gray-400">{i + 1}</td>
                      <td className="px-3 py-2 font-medium">{row.name || <span className="text-red-500">Thiếu</span>}</td>
                      <td className="px-3 py-2">{row.gender === 'male' ? 'Nam' : 'Nữ'}</td>
                      <td className="px-3 py-2">{row.dob || <span className="text-red-500">Thiếu</span>}</td>
                      <td className="px-3 py-2">{row.cccd || <span className="text-red-500">Thiếu</span>}</td>
                      <td className="px-3 py-2 text-gray-500">{row.deadline ? row.deadline.slice(0, 10) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-6 border-t flex justify-end space-x-3">
              <button onClick={() => setImportPreview(null)} className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md">Hủy</button>
              <button onClick={handleConfirmImport} disabled={isImporting}
                className="flex items-center px-4 py-2 text-white bg-amber-500 hover:bg-amber-600 disabled:opacity-50 rounded-md">
                <Upload className="w-4 h-4 mr-2" />
                {isImporting ? 'Đang import...' : `Xác nhận import ${importPreview.length} hồ sơ`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lỗi import */}
      {importError && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start shadow-lg z-50">
          <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">{importError}</p>
            <button onClick={() => setImportError('')} className="text-xs text-red-600 hover:underline mt-1">Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};
