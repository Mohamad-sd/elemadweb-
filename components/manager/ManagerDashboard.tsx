
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
import TrashIcon from '../icons/TrashIcon';
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
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isLocationModalOpen, setLocationModalOpen] = useState(false);
    
    // Form state for new house
    const [houseName, setHouseName] = useState('');
    const [locationId, setLocationId] = useState('');
    const [rentAmount, setRentAmount] = useState('');

    // Form state for new location
    const [newLocationName, setNewLocationName] = useState('');

    const filteredHouses = context?.houses.filter(h => !selectedLoc || h.locationId === selectedLoc);

    const handleAddHouse = () => {
        if (!houseName || !locationId || !rentAmount) {
             alert("الرجاء تعبئة جميع البيانات (الاسم، الموقع، الإيجار)");
             return;
        }

        context?.addHouse({
            name: houseName,
            locationId: locationId,
            rentAmount: parseFloat(rentAmount)
        });

        setAddModalOpen(false);
        // Reset form
        setHouseName('');
        setLocationId('');
        setRentAmount('');
        alert("تم إضافة العقار بنجاح");
    };

    const handleAddLocation = () => {
        if (!newLocationName.trim()) {
            alert("الرجاء إدخال اسم الموقع");
            return;
        }
        context?.addLocation(newLocationName);
        setNewLocationName('');
        // We keep the modal open to allow adding more or deleting existing
        alert("تم إضافة الموقع بنجاح");
    };

    const handleDeleteLocation = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا الموقع؟")) {
            context?.deleteLocation(id);
        }
    };

    const handleDeleteHouse = (id: string) => {
        if (confirm("هل أنت متأكد من حذف هذا العقار؟")) {
            context?.deleteHouse(id);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">إدارة العقارات</h2>
                <div className="flex gap-4">
                    <Select label="" value={selectedLoc} onChange={e => setSelectedLoc(e.target.value)}>
                        <option value="">كل المناطق</option>
                        {context?.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </Select>
                    <Button onClick={() => setLocationModalOpen(true)} variant="secondary">إدارة المواقع</Button>
                    <Button onClick={() => setAddModalOpen(true)} variant="primary">إضافة عقار +</Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredHouses?.map(house => (
                    <Card key={house.id} className="flex justify-between items-center border-l-4 border-gray-300">
                        <div className="flex-1">
                            <p className="font-bold text-lg">{house.name}</p>
                            <p className="text-xs text-gray-500">{context.locations.find(l=>l.id===house.locationId)?.name}</p>
                        </div>
                        <div className="text-left flex flex-col items-end gap-2">
                            <div>
                                <p className="text-xs text-gray-400">الإيجار</p>
                                <p className="font-bold text-blue-600">{house.rentAmount.toLocaleString()} ريال</p>
                            </div>
                            <button onClick={() => handleDeleteHouse(house.id)} className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded transition-colors" title="حذف العقار">
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} title="إضافة وحدة عقارية جديدة">
                <div className="space-y-4">
                    <Input 
                        label="اسم الوحدة (مثال: شقة 5، محل 3)" 
                        value={houseName} 
                        onChange={e => setHouseName(e.target.value)} 
                        placeholder="اسم الوحدة"
                    />
                    <Select label="الموقع / المبنى" value={locationId} onChange={e => setLocationId(e.target.value)}>
                        <option value="">اختر الموقع...</option>
                        {context?.locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </Select>
                    <Input 
                        label="قيمة الإيجار الافتراضية" 
                        type="number" 
                        value={rentAmount} 
                        onChange={e => setRentAmount(e.target.value)} 
                        placeholder="0"
                    />
                    <Button onClick={handleAddHouse} className="w-full" variant="success">حفظ العقار</Button>
                </div>
            </Modal>

            <Modal isOpen={isLocationModalOpen} onClose={() => setLocationModalOpen(false)} title="إدارة المواقع / المباني">
                <div className="space-y-6">
                    <div className="space-y-2 border-b pb-6">
                        <Input 
                            label="إضافة موقع جديد" 
                            value={newLocationName} 
                            onChange={e => setNewLocationName(e.target.value)} 
                            placeholder="مثال: مجمع العليا السكني"
                        />
                        <Button onClick={handleAddLocation} className="w-full" variant="success">حفظ الموقع الجديد</Button>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-700 mb-3">قائمة المواقع الحالية</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {context?.locations.map(loc => (
                                <div key={loc.id} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                                    <span className="font-medium text-gray-700">{loc.name}</span>
                                    <button 
                                        onClick={() => handleDeleteLocation(loc.id)} 
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                                        title="حذف الموقع"
                                    >
                                        <TrashIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                            {context?.locations.length === 0 && <p className="text-gray-400 text-sm text-center">لا توجد مواقع مضافة</p>}
                        </div>
                    </div>
                </div>
            </Modal>
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
