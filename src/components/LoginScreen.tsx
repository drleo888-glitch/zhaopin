import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../types';
import { useAppContext } from '../context/AppContext';
import { Users, User, Hospital, Stethoscope, Lock, ArrowLeft } from 'lucide-react';

const roles: { id: Role; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'HR', label: 'Nhân sự (HR) / 人事', icon: Users, description: 'Quản lý yêu cầu và kết quả / 管理要求和结果' },
  { id: 'CANDIDATE', label: 'Ứng viên / 候选人', icon: User, description: 'Xem lịch và kết quả khám / 查看预约和结果' },
  { id: 'HOSPITAL', label: 'Bệnh viện / 医院', icon: Hospital, description: 'Cập nhật kết quả khám / 更新体检结果' },
  { id: 'MEDICAL', label: 'Phòng Y tế / 医疗室', icon: Stethoscope, description: 'Đánh giá chuyên môn / 专业评估' },
];

const generateCandidatePassword = (name: string, dob: string) => {
  const nameParts = name.trim().split(' ');
  const firstName = nameParts[nameParts.length - 1];
  const normalizedFirstName = firstName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
  
  const [year, month, day] = dob.split('-');
  const dobString = `${day}${month}${year}`;
  
  return `${normalizedFirstName}${dobString}`;
};

export const LoginScreen: React.FC<{ initialRole?: Role }> = ({ initialRole }) => {
  const { login, records } = useAppContext();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<Role | null>(initialRole || null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedRole === 'HR' && password === 'hr') {
      login('HR');
      navigate('/hr');
    } else if (selectedRole === 'HOSPITAL' && password === 'bv') {
      login('HOSPITAL');
      navigate('/hospital');
    } else if (selectedRole === 'MEDICAL' && password === 'yte') {
      login('MEDICAL');
      navigate('/medical');
    } else if (selectedRole === 'CANDIDATE') {
      const matchedRecord = records.find(record => {
        const expectedPassword = generateCandidatePassword(record.candidate.name, record.candidate.dob);
        return password === expectedPassword;
      });

      if (matchedRecord) {
        login('CANDIDATE', matchedRecord.candidate.id);
        navigate('/candidate');
      } else {
        setError('Mật khẩu không đúng. Vui lòng thử lại. / 密码错误，请重试。');
      }
    } else {
      setError('Mật khẩu không đúng. Vui lòng thử lại. / 密码错误，请重试。');
    }
  };

  if (selectedRole) {
    const roleInfo = roles.find(r => r.id === selectedRole);
    const Icon = roleInfo?.icon || User;

    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Icon className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng nhập / 登录 {roleInfo?.label.split(' / ')[0]}
          </h2>
          {selectedRole === 'CANDIDATE' && (
            <p className="mt-2 text-center text-sm text-gray-600">
              Mật khẩu: Tên (không dấu) + DDMMYYYY<br/>
              密码：姓名（无符号）+ 日日月月年年年年<br/>
              VD: Nguyễn Thị Tú sinh 19/02/1990 → tu19021990
            </p>
          )}
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-200">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu / 密码
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2 border"
                    placeholder="Nhập mật khẩu... / 输入密码..."
                  />
                </div>
                {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                >
                  Đăng nhập / 登录
                </button>
              </div>
            </form>

            <div className="mt-6">
              <button
                onClick={() => {
                  if (initialRole) {
                    navigate('/');
                  } else {
                    setSelectedRole(null);
                  }
                  setPassword('');
                  setError('');
                }}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Quay lại chọn vai trò / 返回选择角色
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-3xl">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg mb-4">
            <span className="text-white font-bold text-3xl">H</span>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">
            Health Check Portal / 体检门户
          </h2>
          <p className="mt-2 text-lg text-gray-600">
            Hệ thống quản lý khám sức khỏe tuyển dụng<br/>
            招聘体检管理系统
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                onClick={() => setSelectedRole(role.id)}
                className="bg-white overflow-hidden shadow rounded-xl border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all group text-left p-6 flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Icon className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">{role.label}</h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
