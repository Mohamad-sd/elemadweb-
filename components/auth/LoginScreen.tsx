
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const context = useContext(AppDataContext);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!context) return;

    if (!email || !password) {
        alert("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
        return;
    }

    // Trim whitespace from email and password to prevent common input errors
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    const role = context.authenticate(cleanEmail, cleanPassword);
    if (role) {
        onLogin(role);
    } else {
        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
  };

  const fillCredentials = (e: string, p: string) => {
      setEmail(e);
      setPassword(p);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <BuildingIcon className="mx-auto h-12 w-12 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-800 mt-2">تسجيل الدخول</h1>
          <p className="text-gray-600">نظام العماد لإدارة العقارات</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              label="البريد الإلكتروني" 
              id="email" 
              type="email" 
              placeholder="user@elemad.ae" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input 
              label="كلمة المرور" 
              id="password" 
              type="password" 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            <Button type="submit" className="w-full" variant="primary">تسجيل الدخول</Button>
        </form>

        {/* Demo Credentials Section */}
        <div className="mt-8 pt-4 border-t border-gray-100">
             <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                 <h3 className="text-sm font-bold text-blue-800 mb-3 text-center">بيانات الدخول التجريبية</h3>
                 <div className="space-y-2 text-xs text-blue-900">
                    <button 
                        onClick={() => fillCredentials('admin@elemad.ae', 'Omar@2018')}
                        className="w-full flex justify-between items-center p-2 hover:bg-blue-100 rounded transition-colors cursor-pointer text-right group"
                    >
                        <span className="font-bold">المدير (عمر)</span>
                        <span dir="ltr" className="font-mono text-gray-500 group-hover:text-blue-700">admin@elemad.ae</span>
                    </button>
                    
                    <button 
                        onClick={() => fillCredentials('user@elemad.ae', 'sameer@1234')}
                        className="w-full flex justify-between items-center p-2 hover:bg-blue-100 rounded transition-colors cursor-pointer text-right group"
                    >
                        <span className="font-bold">المحصل 1 (سمير)</span>
                        <span dir="ltr" className="font-mono text-gray-500 group-hover:text-blue-700">user@elemad.ae</span>
                    </button>

                    <button 
                        onClick={() => fillCredentials('user1@alemad.ae', 'user1@1234')}
                        className="w-full flex justify-between items-center p-2 hover:bg-blue-100 rounded transition-colors cursor-pointer text-right group"
                    >
                        <span className="font-bold">المحصل 2</span>
                        <span dir="ltr" className="font-mono text-gray-500 group-hover:text-blue-700">user1@alemad.ae</span>
                    </button>
                 </div>
             </div>
        </div>

        <div className="mt-6 border-t pt-4 text-xs text-gray-400 text-center">
            <p>للدعم الفني يرجى التواصل مع الإدارة</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginScreen;
