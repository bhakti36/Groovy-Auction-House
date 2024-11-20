export interface Item {
  id: number;
  name: string;
  description: string;
  image: string;
  value: string;
  timeLeft: string;
  status: string;
  startDate: string;
  durationDays: number;
  durationHours: number;
  durationMinutes: number;
  isPublished: boolean;
  isFrozen: boolean;
  actions: string[];
  bids: Bid[];
}

export interface Bid {
  id: number;
  buyerID: number;
  bidAmount: number;
  bidTimeStamp: string;
}
  
export interface ItemJson {
  ItemID: number;
  Name: string;
  Description: string;
  Images: string;
  InitialPrice: number;
  StartDate: string;
  DurationDays: number;
  DurationHours: number;
  DurationMinutes: number;
  IsComplete: boolean;
  IsFrozen: boolean;
  IsPublished: boolean;
  bids: BidJson[];
}

export interface BidJson {
  BidID: number;
  BuyerID: number;
  BidAmount: number;
  BidTimeStamp: string;
}