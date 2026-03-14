import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { HealthCheckRecord, Role, Hospital, Status, NewRecordInput } from '../types';

interface AppContextType {
  records: HealthCheckRecord[];
  hospitals: Hospital[];
  currentRole: Role;
  setCurrentRole: (role: Role) => void;
  isAuthenticated: boolean;
  loggedInCandidateId: string | null;
  login: (role: Role, candidateId?: string) => void;
  logout: () => void;
  addRecord: (data: NewRecordInput) => Promise<void>;
  addRecordBulk: (data: NewRecordInput[]) => Promise<void>;
  updateRecordStatus: (id: string, status: Status, extra?: Partial<HealthCheckRecord>) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialHospitals: Hospital[] = [
  { id: 'h1', name: 'Bệnh viện Đa khoa Quốc tế Vinmec / Vinmec 国际综合医院', address: '208 Nguyễn Hữu Cảnh, Bình Thạnh, TP.HCM' },
  { id: 'h2', name: 'Bệnh viện Chợ Rẫy / 大水镬医院', address: '201B Nguyễn Chí Thanh, Quận 5, TP.HCM' },
  { id: 'h3', name: 'Bệnh viện Đại học Y Dược / 医药大学医院', address: '215 Hồng Bàng, Quận 5, TP.HCM' },
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [records, setRecords] = useState<HealthCheckRecord[]>([]);
  const [hospitals] = useState<Hospital[]>(initialHospitals);
  const [currentRole, setCurrentRole] = useState<Role>('HR');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loggedInCandidateId, setLoggedInCandidateId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/records')
      .then(res => res.json())
      .then(data => setRecords(data))
      .catch(() => {
        console.warn('Backend chưa khởi động. Chạy: npm run server');
      });
  }, []);

  const login = (role: Role, candidateId?: string) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    setLoggedInCandidateId(candidateId ?? null);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setLoggedInCandidateId(null);
  };

  const addRecord = async (data: NewRecordInput) => {
    const res = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newRecord: HealthCheckRecord = await res.json();
    setRecords(prev => [newRecord, ...prev]);
  };

  const addRecordBulk = async (data: NewRecordInput[]) => {
    const res = await fetch('/api/records/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const newRecords: HealthCheckRecord[] = await res.json();
    setRecords(prev => [...newRecords, ...prev]);
  };

  const updateRecordStatus = async (id: string, status: Status, extra?: Partial<HealthCheckRecord>) => {
    const body: Record<string, unknown> = { status };
    if (extra?.hospitalId !== undefined) body.hospitalId = extra.hospitalId;
    if (extra?.appointmentDate !== undefined) body.appointmentDate = extra.appointmentDate;
    if (extra?.resultNotes !== undefined) body.resultNotes = extra.resultNotes;
    if (extra?.resultFlags !== undefined) body.resultFlags = extra.resultFlags;
    if (extra?.medicalNotes !== undefined) body.medicalNotes = extra.medicalNotes;
    if (extra?.finalResult !== undefined) body.finalResult = extra.finalResult;

    const res = await fetch(`/api/records/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const updatedRecord: HealthCheckRecord = await res.json();
    setRecords(prev => prev.map(r => r.id === id ? updatedRecord : r));
  };

  return (
    <AppContext.Provider value={{
      records, hospitals, currentRole, setCurrentRole,
      isAuthenticated, loggedInCandidateId, login, logout,
      addRecord, addRecordBulk, updateRecordStatus
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
