
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

    const role = context.authenticate(email, password);
    if (role) {
        onLogin(role);
    } else {
        alert("البريد الإلكتروني أو كلمة المرور غير صحيحة");
    }
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

        <div className="mt-6 border-t pt-4 text-xs text-gray-400 text-center">
            <p>للدعم الفني يرجى التواصل مع الإدارة</p>
        </div>
      </Card>
    </div>
  );
};

export default LoginScreen;
