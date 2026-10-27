export type TransactionType = 'in' | 'out';

export type PaymentMethod = 
  | 'transfer_bsi'
  | 'transfer_bca'
  | 'transfer_mandiri'
  | 'transfer_bri'
  | 'cash'
  | 'qris';

export interface UmrohPackage {
  id: string;
  name: string;
  code: string;
  departureDate: string;
  returnDate: string;
  pricePerPax: number;
  hotelMakkah: string;
  hotelMadinah: string;
  airline: string;
  targetPax: number;
  active: boolean;
}

export interface Transaction {
  id: string;
  receiptNumber: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  amount: number;
  paymentMethod: PaymentMethod;
  packageId?: string;
  packageName?: string;
  jamaahName?: string;
  jamaahPhone?: string;
  passportNumber?: string;
  notes: string;
  handledBy: string;
  status: 'verified' | 'pending';
  createdAt: string;
}

export interface CategoryOption {
  id: string;
  name: string;
  type: TransactionType;
  iconName?: string;
  color?: string;
}
