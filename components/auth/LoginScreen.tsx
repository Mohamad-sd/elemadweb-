
import React, { useState, useContext } from 'react';
import { UserRole } from '../../types';
import Button from '../shared/Button';
import Card from '../shared/Card';
import Input from '../shared/Input';
import BuildingIcon from '../icons/BuildingIcon';
import { AppDataContext } from '../../App';

interface LoginScreenProps {
  onLogin: (role: UserRole) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [determinedRole, setDeterminedRole] = useState<UserRole | null>(null);
  const context = useContext(AppDataContext);

  const handleSendOtp = () => {
    if (phone.match(/^\d{10}$/)) { // Simple validation for 10 digit number
      const role = context?.getUserRoleByPhone(phone);
      if (role) {
        setDeterminedRole(role);
        setOtpSent(true);
      } else {
        alert("هذا الرقم غير مسجل في النظام.");
      }
    } else {
      alert("الرجاء إدخال رقم جوال صحيح (10 أرقام)");
    }
  };
  
  const handleLogin = () => {
    if (otp === '1234' && determinedRole) {
        onLogin(determinedRole);
    } else {
        alert("رمز التحقق غير صحيح. استخدم 1234");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <BuildingIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">تسجيل الدخول</h1>
          <p className="text-gray-600">نظام تحصيل الإيجارات</p>
        </div>
        {!otpSent ? (
          <div className="space-y-4">
            <Input 
              label="رقم الجوال" 
              id="phone" 
              type="tel" 
              placeholder="مثال: 05xxxxxxx" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-center text-xs text-gray-500 mt-2">
                للتجربة:<br/>
                محصل: <span className="font-mono">0511111111</span><br/>
                مدير: <span className="font-mono">0522222222</span>
            </p>
            <Button onClick={handleSendOtp} className="w-full">إرسال رمز التحقق</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-600">
                تم إرسال رمز التحقق إلى {phone}. <br/> (للتجربة، أدخل 1234)
                <span className="font-bold text-blue-600 mt-2 block">
                    سيتم تسجيل دخولك كـ: {determinedRole === UserRole.COLLECTOR ? 'محصل' : 'مدير'}
                </span>
            </p>
            <Input 
              label="رمز التحقق (OTP)" 
              id="otp" 
              type="text" 
              placeholder="xxxx" 
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <Button onClick={handleLogin} className="w-full" variant="primary">تسجيل الدخول</Button>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LoginScreen;