export class Booking {
  id?: number;
  bookingReference: string;
  
  // Passenger Snapshot
  passengerId: number;
  passengerName: string;
  passportNumber: string;
  email: string;
  phone: string;

  // Flight Snapshot
  flightId: number;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  tripType?: string;
  returnDate?: string;
  departureTime: string;   // New
  arrivalTime: string;     // New
  totalDistance: number;   // New
  classType: string;
  seatNumber: string;
  adultCount?: number;
  childCount?: number;
  infantCount?: number;
  extraPassengerNames?: string;

  // Pricing
  baseFare: number;
  tax: number;
  discount: number;
  couponCode: string;
  couponDiscount: number;
  loyaltyMemberNumber: string;
  loyaltyPointsUsed: number;
  loyaltyDiscount: number;
  adultFareTotal?: number;
  childFareTotal?: number;
  infantFareTotal?: number;
  passengerFareTotal?: number;
  baggageFee?: number;
  specialServiceFee?: number;
  subTotalBeforeDiscount?: number;
  totalPrice: number;
  grandTotal?: number;
  checkedBags?: number;
  checkedWeightKg?: number;
  cabinWeightKg?: number;
  specialServices?: string;
  specialServiceNotes?: string;

  // Payment
  paymentMethod: string;
  paymentStatus: string;
  bookingDate: string;
  status: string;

  constructor() {
    this.bookingReference = '';
    this.passengerId = 0; this.passengerName = ''; this.passportNumber = ''; this.email = ''; this.phone = '';
    this.flightId = 0; this.flightNumber = ''; this.origin = ''; this.destination = ''; this.departureDate = '';
    this.tripType = 'ONE_WAY'; this.returnDate = '';
    this.departureTime = ''; this.arrivalTime = ''; this.totalDistance = 0;
    this.classType = 'ECONOMY'; this.seatNumber = '';
    this.adultCount = 1; this.childCount = 0; this.infantCount = 0;
    this.extraPassengerNames = '';
    this.baseFare = 0; this.tax = 0; this.discount = 0; this.couponCode = ''; this.couponDiscount = 0;
    this.loyaltyMemberNumber = ''; this.loyaltyPointsUsed = 0; this.loyaltyDiscount = 0;
    this.adultFareTotal = 0; this.childFareTotal = 0; this.infantFareTotal = 0; this.passengerFareTotal = 0;
    this.baggageFee = 0; this.specialServiceFee = 0; this.subTotalBeforeDiscount = 0; this.totalPrice = 0; this.grandTotal = 0;
    this.checkedBags = 0; this.checkedWeightKg = 0; this.cabinWeightKg = 0; this.specialServices = ''; this.specialServiceNotes = '';
    this.paymentMethod = 'PENDING'; this.paymentStatus = 'PENDING'; this.bookingDate = ''; this.status = 'PENDING_REVIEW';
  }
}
