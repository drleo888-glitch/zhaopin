import React from 'react';
import { Status } from '../types';

const statusConfig: Record<Status, { label: string; color: string }> = {
  PENDING: { label: 'Chờ chọn BV / 待选医院', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  HOSPITAL_SELECTED: { label: 'Đã chọn BV / 已选医院', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  APPOINTMENT_CONFIRMED: { label: 'Đã xác nhận lịch / 已确认预约', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  RESULT_SUBMITTED: { label: 'Đã có kết quả / 已出结果', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  PASSED: { label: 'Đạt / 合格', color: 'bg-green-100 text-green-800 border-green-200' },
  FAILED: { label: 'Không đạt / 不合格', color: 'bg-red-100 text-red-800 border-red-200' },
  NOTIFIED: { label: 'Đã thông báo / 已通知', color: 'bg-purple-100 text-purple-800 border-purple-200' },
};

export const StatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const config = statusConfig[status];
  return (
    <span className={`px-2.5 py-1 text-xs font-medium rounded-full border ${config.color}`}>
      {config.label}
    </span>
  );
};
