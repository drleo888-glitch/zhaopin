export type Role = 'HR' | 'CANDIDATE' | 'HOSPITAL' | 'MEDICAL';

export type Status =
  | 'PENDING'
  | 'HOSPITAL_SELECTED'
  | 'APPOINTMENT_CONFIRMED'
  | 'RESULT_SUBMITTED'
  | 'PASSED'
  | 'FAILED'
  | 'NOTIFIED';

export interface Candidate {
  id: string;
  name: string;
  gender: 'male' | 'female';
  dob: string;
  cccd: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
}

export interface HealthCheckRecord {
  id: string;
  candidate: Candidate;
  status: Status;
  deadline?: string;         // Hạn cuối NLĐ chọn lịch khám (YYYY-MM-DDT16:30:00)
  hospitalId?: string;
  appointmentDate?: string;
  resultNotes?: string;
  resultFlags?: string[];    // Các chỉ tiêu bất thường từ bệnh viện
  medicalNotes?: string;
  finalResult?: 'PASSED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

// Dữ liệu đầu vào khi tạo hồ sơ mới (từ form hoặc import Excel)
export type NewRecordInput = Omit<Candidate, 'id'> & { deadline?: string };

// Danh sách chỉ tiêu dị thường — dùng chung cho Bệnh viện và Phòng Y tế
export const RESULT_FLAGS = [
  { id: 'hbsag',          label: 'HBsAg (+)',        labelFull: 'HBsAg dương tính / HBsAg阳性' },
  { id: 'blood_pressure', label: 'Huyết áp',          labelFull: 'Huyết áp cao / 高血压' },
  { id: 'ecg',            label: 'Tim mạch',           labelFull: 'Tim mạch bất thường / 心电图异常' },
  { id: 'vision',         label: 'Thị lực',            labelFull: 'Thị lực không đạt / 视力不达标' },
  { id: 'xray',           label: 'X-quang',            labelFull: 'X-quang phổi bất thường / 胸片异常' },
  { id: 'blood_test',     label: 'Xét nghiệm máu',    labelFull: 'Xét nghiệm máu bất thường / 血液检查异常' },
  { id: 'other',          label: 'Bất thường khác',   labelFull: 'Bất thường khác / 其他异常' },
] as const;
