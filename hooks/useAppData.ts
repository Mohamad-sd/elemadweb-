
import { useState, useCallback, useEffect } from 'react';
import { Location, House, Tenant, Payment, NewLeaseRequest, CashHandover, UserRole } from '../types';
import { RentService } from '../services/rentService';

export const useAppData = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  const [houses, setHouses] = useState<House[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [leaseRequests, setLeaseRequests] = useState<NewLeaseRequest[]>([]);
  const [handovers, setHandovers] = useState<CashHandover[]>([]);

  // Initialize and Fetch Data
  useEffect(() => {
    const loadData = async () => {
        await RentService.init();
        const data = await RentService.getDatabase();
        if (data) {
            setLocations(data.locations);
            setHouses(data.houses);
            setTenants(data.tenants);
            setPayments(data.payments);
            setLeaseRequests(data.leaseRequests);
            setHandovers(data.handovers);
        }
        setIsLoaded(true);
    };
    loadData();
  }, []);

  const refreshData = async () => {
      const data = await RentService.getDatabase();
      if (data) {
          setLocations(data.locations);
          setHouses(data.houses);
          setTenants(data.tenants);
          setPayments(data.payments);
          setLeaseRequests(data.leaseRequests);
          setHandovers(data.handovers);
      }
  };

  const getUserRoleByPhone = useCallback((phone: string): UserRole | null => {
    return RentService.getUserRole(phone);
  }, []);

  const addPayment = useCallback(async (paymentData: any) => {
    const result = await RentService.addPayment(paymentData);
    setPayments(prev => [...prev, result.payment]);
    setHouses(result.houses);
  }, []);

  const addLeaseRequest = useCallback(async (requestData: any) => {
      const newReq = await RentService.addLeaseRequest(requestData);
      setLeaseRequests(prev => [...prev, newReq]);
  }, []);

  const approveLeaseRequest = useCallback(async (requestId: string) => {
    const result = await RentService.approveLeaseRequest(requestId);
    if (result) {
        setTenants(result.tenants);
        setHouses(result.houses);
        setLeaseRequests(result.leaseRequests);
    }
  }, []);

  const rejectLeaseRequest = useCallback(async (requestId: string) => {
      const updatedRequests = await RentService.rejectLeaseRequest(requestId);
      setLeaseRequests(updatedRequests);
  }, []);

  const vacateHouse = useCallback(async (houseId: string) => {
      const updatedHouses = await RentService.vacateHouse(houseId);
      setHouses(updatedHouses);
  }, []);
  
  const addCashHandover = useCallback(async (amount: number) => {
    const newHandover = await RentService.addCashHandover(amount);
    setHandovers(prev => [...prev, newHandover]);
  }, []);

  const addLocation = useCallback(async (name: string) => {
    const updated = await RentService.addLocation(name);
    setLocations(updated);
  }, []);

  const updateLocation = useCallback(async (id: string, name: string) => {
    const updated = await RentService.updateLocation(id, name);
    setLocations(updated);
  }, []);

  const deleteLocation = useCallback(async (id: string) => {
    try {
        const updated = await RentService.deleteLocation(id);
        setLocations(updated);
    } catch (e: any) {
        alert(e.message);
    }
  }, []);

  const addHouse = useCallback(async (data: any) => {
    const updated = await RentService.addHouse(data);
    setHouses(updated);
  }, []);

  // Placeholders for features not fully moved to service yet, keeping interface compatible
  const updateHouse = useCallback((id: string, data: Partial<House>) => {
    setHouses(prev => prev.map(h => (h.id === id ? { ...h, ...data } : h)));
    // In a real app, this would also call RentService.updateHouse
  }, []);

  const deleteHouse = useCallback((id: string) => {
    setHouses(prev => prev.filter(h => h.id !== id));
  }, []);

  return { 
      locations, houses, tenants, payments, leaseRequests, handovers, isLoaded,
      getUserRoleByPhone, addPayment, addLeaseRequest, approveLeaseRequest, rejectLeaseRequest,
      vacateHouse, addCashHandover, addLocation, updateLocation, deleteLocation,
      addHouse, updateHouse, deleteHouse, refreshData
    };
};
