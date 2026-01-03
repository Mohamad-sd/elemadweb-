
import { Location, House, Tenant, Payment, NewLeaseRequest, CashHandover, UserRole } from '../types';

const STORAGE_KEY = 'rent_app_db_production_v1';

// --- Initial Seed Data (Simulating a fresh database) ---
const initialLocations: Location[] = [
  { id: 'loc1', name: 'مجمع الرياض السكني' },
  { id: 'loc2', name: 'أبراج جدة' },
  { id: 'loc3', name: 'حي الدمام النموذجي' },
];

const initialTenants: Tenant[] = [
    { id: 'ten1', name: 'عبدالله محمد', idNumber: '1234567890', idPhotoUrl: 'https://picsum.photos/200/300' },
    { id: 'ten2', name: 'فاطمة علي', idNumber: '0987654321', idPhotoUrl: 'https://picsum.photos/200/300' },
];

const initialHouses: House[] = [
  { id: 'house1', locationId: 'loc1', name: 'شقة 101', tenantId: 'ten1', rentAmount: 2500, dueAmount: 2500, unpaidAmount: 0 },
  { id: 'house2', locationId: 'loc1', name: 'شقة 102', tenantId: 'ten2', rentAmount: 2800, dueAmount: 5600, unpaidAmount: 2800 },
  { id: 'house3', locationId: 'loc1', name: 'شقة 103', tenantId: null, rentAmount: 2600, dueAmount: 0, unpaidAmount: 0 },
  { id: 'house4', locationId: 'loc2', name: 'فيلا A', tenantId: null, rentAmount: 5000, dueAmount: 0, unpaidAmount: 0 },
];

// Updated users with specific credentials
const initialUsers = [
  { email: 'user@elemad.ae', password: 'sameer@1234', role: UserRole.COLLECTOR, name: 'المحصل سمير' },
  { email: 'user1@alemad.ae', password: 'user1@1234', role: UserRole.COLLECTOR, name: 'المحصل 2' },
  { email: 'admin@elemad.ae', password: 'Omar@2018', role: UserRole.MANAGER, name: 'المدير عمر' },
];

// --- Interface for Database ---
interface DatabaseSchema {
    locations: Location[];
    houses: House[];
    tenants: Tenant[];
    payments: Payment[];
    leaseRequests: NewLeaseRequest[];
    handovers: CashHandover[];
}

export const RentService = {
  // Simulate a small network delay for realism (optional)
  async _delay(ms = 100) {
      return new Promise(resolve => setTimeout(resolve, ms));
  },

  async init(): Promise<void> {
    if (!localStorage.getItem(STORAGE_KEY)) {
        const initialData: DatabaseSchema = {
            locations: initialLocations,
            houses: initialHouses,
            tenants: initialTenants,
            payments: [],
            leaseRequests: [],
            handovers: []
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
    }
  },

  async getDatabase(): Promise<DatabaseSchema> {
      await this._delay(50); // Fast response
      const str = localStorage.getItem(STORAGE_KEY);
      const data = str ? JSON.parse(str) : null;
      
      // Re-hydrate Date objects from JSON strings
      if (data) {
          data.payments = (data.payments || []).map((p: any) => ({ ...p, date: new Date(p.date) }));
          data.handovers = (data.handovers || []).map((h: any) => ({ ...h, date: new Date(h.date) }));
      }
      return data;
  },

  async saveDatabase(data: DatabaseSchema): Promise<void> {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  // --- Auth Service ---
  authenticate(email: string, password: string): UserRole | null {
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();
      
      const user = initialUsers.find(u => 
        u.email.toLowerCase() === cleanEmail && 
        u.password === cleanPassword
      );
      return user ? user.role : null;
  },

  // --- Transactional Methods (Business Logic) ---
  
  async addPayment(paymentData: Omit<Payment, 'id' | 'date' | 'collectorId'>) {
      const db = await this.getDatabase();
      
      const newPayment: Payment = { 
          ...paymentData, 
          id: `pay${Date.now()}`, 
          date: new Date(), 
          collectorId: 'collector1' 
      };
      
      db.payments.push(newPayment);

      // Backend Logic: Update House Balance
      db.houses = db.houses.map(h => {
          if (h.id === paymentData.houseId) {
              const newDueAmount = Math.max(0, h.dueAmount - paymentData.amount);
              return { ...h, dueAmount: newDueAmount };
          }
          return h;
      });

      await this.saveDatabase(db);
      return { payment: newPayment, houses: db.houses };
  },

  async addLeaseRequest(requestData: Omit<NewLeaseRequest, 'id' | 'status'>) {
      const db = await this.getDatabase();
      const newRequest: NewLeaseRequest = {
          ...requestData,
          id: `req${Date.now()}`,
          status: 'pending'
      };
      db.leaseRequests.push(newRequest);
      await this.saveDatabase(db);
      return newRequest;
  },

  async approveLeaseRequest(requestId: string) {
      const db = await this.getDatabase();
      const requestIndex = db.leaseRequests.findIndex(r => r.id === requestId);
      if (requestIndex === -1) return null;

      const request = db.leaseRequests[requestIndex];
      request.status = 'approved';

      // Create new tenant
      const newTenant: Tenant = {
          id: `ten${Date.now()}`,
          name: request.tenantName,
          idNumber: request.tenantIdNumber,
          idPhotoUrl: 'https://picsum.photos/200/300',
      };
      db.tenants.push(newTenant);

      // Assign tenant to house
      db.houses = db.houses.map(house => {
          if (house.id === request.houseId) {
              return {
                  ...house,
                  tenantId: newTenant.id,
                  rentAmount: request.rentAmount,
                  dueAmount: request.rentAmount,
                  unpaidAmount: 0,
              };
          }
          return house;
      });

      await this.saveDatabase(db);
      return { tenants: db.tenants, houses: db.houses, leaseRequests: db.leaseRequests };
  },

  async rejectLeaseRequest(requestId: string) {
      const db = await this.getDatabase();
      const request = db.leaseRequests.find(r => r.id === requestId);
      if (request) {
          request.status = 'rejected';
          await this.saveDatabase(db);
      }
      return db.leaseRequests;
  },

  async vacateHouse(houseId: string) {
      const db = await this.getDatabase();
      db.houses = db.houses.map(h => {
          if (h.id === houseId) {
              return { ...h, tenantId: null, dueAmount: 0, unpaidAmount: 0 };
          }
          return h;
      });
      await this.saveDatabase(db);
      return db.houses;
  },

  async addCashHandover(amount: number) {
      const db = await this.getDatabase();
      const newHandover: CashHandover = {
          id: `hand${Date.now()}`,
          collectorId: 'collector1',
          amount,
          date: new Date()
      };
      db.handovers.push(newHandover);
      await this.saveDatabase(db);
      return newHandover;
  },

  // --- Locations Management ---
  async addLocation(name: string) {
    const db = await this.getDatabase();
    db.locations.push({ id: `loc${Date.now()}`, name });
    await this.saveDatabase(db);
    return db.locations;
  },

  async updateLocation(id: string, name: string) {
      const db = await this.getDatabase();
      db.locations = db.locations.map(l => l.id === id ? { ...l, name } : l);
      await this.saveDatabase(db);
      return db.locations;
  },

  async deleteLocation(id: string) {
      const db = await this.getDatabase();
      const hasHouses = db.houses.some(h => h.locationId === id);
      if (hasHouses) throw new Error("لا يمكن حذف موقع يحتوي على عقارات");
      
      db.locations = db.locations.filter(l => l.id !== id);
      await this.saveDatabase(db);
      return db.locations;
  },

  // --- House Management ---
  async addHouse(houseData: any) {
      const db = await this.getDatabase();
      const newHouse = {
          id: `house${Date.now()}`,
          tenantId: null,
          dueAmount: 0,
          unpaidAmount: 0,
          ...houseData
      };
      db.houses.push(newHouse);
      await this.saveDatabase(db);
      return db.houses;
  }
};
