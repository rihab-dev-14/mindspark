import { User, Task } from '../types';

const USERS_KEY = 'mindspark_users';
const TASKS_KEY = 'mindspark_tasks';
const SESSION_KEY = 'mindspark_session';

// Helper to simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const storageService = {
  // User Management
  getUsers: (): User[] => {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  },

  register: async (user: User, password?: string): Promise<User> => {
    await delay(800); // Simulate API call
    const users = storageService.getUsers();
    
    if (users.find(u => u.email === user.email)) {
      throw new Error('User with this email already exists.');
    }

    // In a real app, we would hash the password. 
    // Here we just store the user object.
    const newUser = { ...user, id: crypto.randomUUID(), plan: 'Free' as const };
    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    storageService.setSession(newUser);
    return newUser;
  },

  login: async (email: string, password?: string): Promise<User> => {
    await delay(800); // Simulate API call
    const users = storageService.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      throw new Error('Invalid email or password.');
    }
    
    // Note: We are skipping real password validation for this demo
    storageService.setSession(user);
    return user;
  },

  loginWithProvider: async (provider: string, userData: { name: string; email: string; avatar?: string }): Promise<User> => {
    await delay(1200); // Simulate OAuth popup delay
    const users = storageService.getUsers();
    let user = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());

    if (!user) {
      // Auto-register if not exists
      user = {
        id: crypto.randomUUID(),
        name: userData.name,
        email: userData.email,
        avatar: userData.avatar,
        plan: 'Free' as const
      };
      users.push(user);
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
      
      // Mock Notify Admin
      const note = storageService.notifyAdmin(user, 'signup');
      console.log(note);
    } else {
      // Mock Notify Admin
      const note = storageService.notifyAdmin(user, 'login');
      console.log(note);
    }

    storageService.setSession(user);
    return user;
  },

  updateUserPlan: async (userId: string, newPlan: 'Free' | 'Pro' | 'Premium'): Promise<User> => {
    await delay(1000); // Simulate transaction verification
    const users = storageService.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");
    
    const updatedUser = { ...users[userIndex], plan: newPlan };
    users[userIndex] = updatedUser;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    storageService.setSession(updatedUser);
    
    // Notify admin of sale
    console.log(`[PAYMENT SUCCESS] User ${updatedUser.email} upgraded to ${newPlan}`);
    
    return updatedUser;
  },

  updateUserProfile: async (userId: string, updates: Partial<User>): Promise<User> => {
    await delay(600); 
    const users = storageService.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) throw new Error("User not found");
    
    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;
    
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    storageService.setSession(updatedUser);
    
    return updatedUser;
  },

  // Session Management
  setSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },
  
  getSession: (): User | null => {
    const data = localStorage.getItem(SESSION_KEY);
    return data ? JSON.parse(data) : null;
  },
  
  logout: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  // Task Management
  getTasks: (userId: string): Task[] => {
    const data = localStorage.getItem(TASKS_KEY);
    const allTasks: Record<string, Task[]> = data ? JSON.parse(data) : {};
    return allTasks[userId] || [];
  },

  saveTask: async (userId: string, task: Task) => {
    const data = localStorage.getItem(TASKS_KEY);
    const allTasks: Record<string, Task[]> = data ? JSON.parse(data) : {};
    
    if (!allTasks[userId]) allTasks[userId] = [];
    
    // Add new task to beginning
    allTasks[userId] = [task, ...allTasks[userId]];
    
    localStorage.setItem(TASKS_KEY, JSON.stringify(allTasks));
    await delay(300); // Simulate save delay
  },

  // Mock Notification Service
  notifyAdmin: (user: User, action: 'login' | 'signup') => {
    const message = `
      [MOCK NOTIFICATION SYSTEM]
      --------------------------
      Action: ${action.toUpperCase()} WITH GOOGLE
      User: ${user.name} (${user.email})
      Time: ${new Date().toLocaleString()}
      
      Sending to Admin WhatsApp... [SUCCESS]
      Sending to Admin Gmail... [SUCCESS]
    `;
    console.log(message);
    
    // Return a message to display to the user
    return `Admin has been notified of your ${action} via secure channels.`;
  }
};