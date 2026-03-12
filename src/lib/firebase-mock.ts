
export type User = {
  id: string; // 10-digit unique ID
  name: string;
  address: string;
  zone: string;
  phone: string;
  rationCard: string;
  registeredAt: string;
  tokenToday?: number;
  tokenSlot?: string;
};

export type Admin = {
  id: string;
  name: string;
  role: string;
  lastActive: string;
};

export type Stock = {
  rice: number;
  wheat: number;
  dhal: number;
  sugar: number;
  oil: number;
  kerosene: number;
};

let users: User[] = [
  {
    id: "4474475108",
    name: "Shalini",
    address: "Anna Nagar",
    zone: "Zone A",
    phone: "7904700757",
    rationCard: "TN123456",
    registeredAt: "22-02-2026",
    tokenToday: 1,
    tokenSlot: "09:00 AM - 10:00 AM"
  }
];

let admins: Admin[] = [
  { id: "ADM001", name: "District Collector", role: "Super Admin", lastActive: "Just now" },
  { id: "ADM002", name: "Ration Officer", role: "Warehouse Manager", lastActive: "2 hours ago" }
];

let stock: Stock = {
  rice: 500,
  wheat: 300,
  dhal: 150,
  sugar: 100,
  oil: 200,
  kerosene: 80
};

export const db = {
  getUsers: () => users,
  addUser: (user: User) => { 
    const existingName = users.find(u => u.name.trim().toLowerCase() === user.name.trim().toLowerCase());
    if (existingName) throw new Error(`Household '${user.name}' is already registered.`);
    
    users.push(user); 
    return user; 
  },
  deleteUser: (userId: string) => { 
    users = users.filter(u => u.id !== userId); 
    return users; 
  },
  getUserByPhone: (phone: string) => {
    const clean = phone.replace(/\D/g, '').slice(-10);
    const matches = users.filter(u => u.phone.replace(/\D/g, '').slice(-10) === clean);
    return matches.length > 0 ? matches[matches.length - 1] : undefined;
  },
  updateUserToken: (userId: string, slot: string, token: number) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      user.tokenToday = token;
      user.tokenSlot = slot;
    }
    return user;
  },
  getAdmins: () => admins,
  getStock: () => stock,
  updateStock: (newStock: Partial<Stock>) => { 
    stock = { ...stock, ...newStock }; 
    return stock; 
  },
  decrementStock: () => {
    // Step 6: Update stock (decrement by 1 for ALL items)
    stock.rice = Math.max(0, stock.rice - 1);
    stock.wheat = Math.max(0, stock.wheat - 1);
    stock.dhal = Math.max(0, stock.dhal - 1);
    stock.sugar = Math.max(0, stock.sugar - 1);
    stock.oil = Math.max(0, stock.oil - 1);
    stock.kerosene = Math.max(0, stock.kerosene - 1);
    return stock;
  },
  isNameTaken: (name: string) => users.some(u => u.name.trim().toLowerCase() === name.trim().toLowerCase())
};
