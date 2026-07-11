export interface User {
  id?: number;
  employeeCode: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber: string;
  role: string;
  department: string;
  station: string;
  status: string;
  profileImageUrl?: string;
  lastLoginAt?: string;
  createdAt?: string;
}
