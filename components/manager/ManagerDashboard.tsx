
import React, { useState, useContext, useMemo } from 'react';
import { AppDataContext } from '../../App';
import { House, NewLeaseRequest, Location } from '../../types';
import Button from '../shared/Button';
import Card from '../shared/Card';
import Modal from '../shared/Modal';
import Input from '../shared/Input';
import Select from '../shared/Select';
import BuildingIcon from '../icons/BuildingIcon';
import HomeIcon from '../icons/HomeIcon';
import DollarSignIcon from '../icons/DollarSignIcon';
import CheckCircleIcon from '../icons/CheckCircleIcon';
import XCircleIcon from '../icons/XCircleIcon';
import ReportIcon from '../icons/ReportIcon';
// Add UserIcon import to fix the "Cannot find name 'UserIcon'" error
import UserIcon from '../icons/UserIcon';

type ManagerView = 'dashboard' | 'management' | 'approvals' | 'handovers';

const ManagerDashboard: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<ManagerView>('dashboard');
  const context = useContext(AppDataContext);

  if (!context || !context.isLoaded) return <div className="flex items-center justify-center h-screen">جاري التحميل...</div>;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard': return <DashboardStats />;
      case 'management': return <PropertyManagementScreen />;
      case 'approvals': return <ApprovalsScreen />;
      case 'handovers': return <CashHandoverScreen />;
      default: return <DashboardStats />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <aside className="w-72 bg-gray-900 text-white flex flex-col shadow-2xl z-10">
        <div className="p-6 border-b border-gray-800 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg"><BuildingIcon className="w-6 h-6"/></div>
          <h1 className="text-xl font-bold tracking-tight">لوحة الإدارة</h1>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <SidebarLink active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} label="نظرة عامة" icon={<DollarSignIcon className="w-5 h-5"/>} />
          <SidebarLink active={currentView === 'management'} onClick={() => setCurrentView('management')} label="إدارة العقارات" icon={<HomeIcon className="w-5 h-5"/>} />
          <SidebarLink active={currentView === 'approvals'} onClick={() => setCurrentView('approvals')} label="الموافقات" icon={<CheckCircleIcon className="w-5 h-5"/>} badge={context.leaseRequests.filter(r => r.status === 'pending').length} />
          <SidebarLink active={currentView === 'handovers'} onClick={() => setCurrentView('handovers')} label="تسليم المبالغ" icon={<ReportIcon className="w-5 h-5"/>} />
        </nav>
        <div className="p-4 border-t border-gray-800">
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white transition-all font-bold">تسجيل الخروج</button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
        {renderCurrentView()}
      </main>
    </div>
  );
};

const SidebarLink = ({ active, onClick, label, icon, badge }: any) => (
    <button onClick={onClick} className={`flex items-center justify-between p-3 rounded-xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}>
        <div className="flex items-center gap-3">
            {icon}
            <span className="font-medium">{label}</span>
        </div>
        {badge > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{badge}</span>}
    </button>
);

const DashboardStats = () => {
    const context = useContext(AppDataContext);
    const stats = useMemo(() => {
        const houses = context?.houses || [];
        const payments = context?.payments || [];
        const rentedCount = houses.filter(h => h.tenantId).length;
        const totalCollected = payments.reduce((s, p) => s + p.amount, 0);
        const totalDue = houses.reduce((s, h) => s + h.dueAmount, 0);
        return { rentedCount, vacantCount: houses.length - rentedCount, totalCollected, totalDue };
    }, [context]);

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">ملخص الأعمال اليوم</h2>
                <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm">{new Date().toLocaleDateString('ar-SA')}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatBox label="إجمالي المحصل" value={`${stats.totalCollected.toLocaleString()} ر.س`} color="blue" />
                <StatBox label="إجمالي المستحق" value={`${stats.totalDue.toLocaleString()} ر.س`} color="red" />
                <StatBox label="عقارات مؤجرة" value={stats.rentedCount} color="green" />
                <StatBox label="عقارات شاغرة" value={stats.vacantCount} color="yellow" />
            </div>

            <Card title="آخر المدفوعات المستلمة">
                <div className="overflow-x-auto">
                    <table className="w-full text-right">
                        <thead className="text-gray-400 text-xs uppercase border-b">
                            <tr>
                                <th className="pb-3">الشقة</th>
                                <th className="pb-3">المبلغ</th>
                                <th className="pb-3">التاريخ</th>
                                <th className="pb-3">المحصل</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {context?.payments.slice(-5).reverse().map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 font-medium">{context.houses.find(h => h.id === p.houseId)?.name}</td>
                                    <td className="py-4 text-green-600 font-bold">{p.amount.toLocaleString()} ريال</td>
                                    <td className="py-4 text-xs text-gray-500">{p.date.toLocaleDateString('ar-SA')}</td>
                                    <td className="py-4 text-xs">أحمد (محصل 1)</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const StatBox = ({ label, value, color }: any) => {
    const colors: any = {
        blue: 'from-blue-500 to-blue-700',
        red: 'from-red-500 to-red-700',
        green: 'from-green-500 to-green-700',
        yellow: 'from-yellow-500 to-yellow-700',
    };
    return (
        <div className={`p-6 rounded-2xl bg-gradient-to-br ${colors[color]} text-white shadow-xl transform transition hover:-translate-y-1`}>
            <p className="text-xs opacity-80 mb-1">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
        </div>
    );
};

const PropertyManagementScreen = () => {
    const context = useContext(AppDataContext);
    const [selectedLoc, setSelectedLoc] = useState('');
    const filteredHouses = context?.houses.filter(h => !selectedLoc || h.locationId === selectedLoc);

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">إدارة العقارات</h2>
                <div className="flex gap-4">
                    <Select label="" value={selectedLoc} onChange={e => setSelectedLoc(e.target.value)}>
                        <option value="">كل المناطق</option>
                        {context?.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </Select>
                    <Button onClick={() => alert("ميزة إضافة عقار قيد التطوير")} variant="primary">إضافة عقار +</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHouses?.map(house => (
                    <Card key={house.id} className="flex justify-between items-center border-l-4 border-gray-300">
                        <div>
                            <p className="font-bold text-lg">{house.name}</p>
                            <p className="text-xs text-gray-500">{context.locations.find(l=>l.id===house.locationId)?.name}</p>
                        </div>
                        <div className="text-left">
                            <p className="text-xs text-gray-400">الإيجار</p>
                            <p className="font-bold text-blue-600">{house.rentAmount}</p>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

const ApprovalsScreen = () => {
    const context = useContext(AppDataContext);
    const pending = context?.leaseRequests.filter(r => r.status === 'pending') || [];

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold">طلبات التعاقد الجديدة</h2>
            {pending.map(req => (
                <Card key={req.id} className="flex items-center justify-between shadow-md">
                    <div className="flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full text-blue-600"><UserIcon /></div>
                        <div>
                            <p className="font-bold">{req.tenantName}</p>
                            <p className="text-xs text-gray-500">طلب استئجار: {context?.houses.find(h=>h.id===req.houseId)?.name}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                         <Button variant="danger" onClick={() => context?.rejectLeaseRequest(req.id)}><XCircleIcon className="w-4 h-4"/> رفض</Button>
                         <Button variant="success" onClick={() => context?.approveLeaseRequest(req.id)}><CheckCircleIcon className="w-4 h-4"/> اعتماد</Button>
                    </div>
                </Card>
            ))}
            {pending.length === 0 && <div className="text-center py-20 text-gray-400">لا توجد طلبات معلقة حالياً</div>}
        </div>
    );
};

const CashHandoverScreen = () => {
    const context = useContext(AppDataContext);
    const [amount, setAmount] = useState(0);

    return (
        <div className="space-y-6 animate-fadeIn">
            <h2 className="text-2xl font-bold">تسليم المبالغ النقدية</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="تسجيل عملية استلام">
                    <Input label="المبلغ المستلم من المحصل" type="number" value={amount} onChange={e => setAmount(parseFloat(e.target.value))} />
                    <Button className="w-full mt-4" onClick={() => {
                        if(amount > 0) { context?.addCashHandover(amount); setAmount(0); alert("تم الحفظ"); }
                    }}>تأكيد استلام المبلغ</Button>
                </Card>
                <Card title="تاريخ التسليمات">
                    <div className="space-y-3">
                        {context?.handovers.map(h => (
                            <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <span className="text-sm font-bold">{h.amount.toLocaleString()} ريال</span>
                                <span className="text-xs text-gray-400">{h.date.toLocaleDateString('ar-SA')}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default ManagerDashboard;
