export class Passenger {
  // Private Properties
  private _id?: number;
  private _firstName: string;
  private _lastName: string;
  private _passportNumber: string;
  private _nationality: string;
  private _dateOfBirth: string;
  private _gender: string;
  private _email: string;
  private _phoneNumber: string;
  private _address: string;
  private _frequentFlyerNo: string;
  private _mealPreference: string;
  private _status: string;
  totalBookings?: number;
  loyaltyPoints?: number;

  constructor() {
    this._firstName = '';
    this._lastName = '';
    this._passportNumber = '';
    this._nationality = '';
    this._dateOfBirth = '';
    this._gender = '';
    this._email = '';
    this._phoneNumber = '';
    this._address = '';
    this._frequentFlyerNo = '';
    this._mealPreference = '';
    this._status = 'Active';
  }

  // Getters and Setters for ID
  get id(): number | undefined {
    return this._id;
  }
  set id(value: number | undefined) {
    this._id = value;
  }

  // Getters and Setters for First Name
  get firstName(): string {
    return this._firstName;
  }
  set firstName(value: string) {
    this._firstName = value;
  }

  // Getters and Setters for Last Name
  get lastName(): string {
    return this._lastName;
  }
  set lastName(value: string) {
    this._lastName = value;
  }

  // Getters and Setters for Passport Number
  get passportNumber(): string {
    return this._passportNumber;
  }
  set passportNumber(value: string) {
    this._passportNumber = value;
  }

  // Getters and Setters for Nationality
  get nationality(): string {
    return this._nationality;
  }
  set nationality(value: string) {
    this._nationality = value;
  }

  // Getters and Setters for Date of Birth
  get dateOfBirth(): string {
    return this._dateOfBirth;
  }
  set dateOfBirth(value: string) {
    this._dateOfBirth = value;
  }

  // Getters and Setters for Gender
  get gender(): string {
    return this._gender;
  }
  set gender(value: string) {
    this._gender = value;
  }

  // Getters and Setters for Email
  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
  }

  // Getters and Setters for Phone Number
  get phoneNumber(): string {
    return this._phoneNumber;
  }
  set phoneNumber(value: string) {
    this._phoneNumber = value;
  }

  // Getters and Setters for Address
  get address(): string {
    return this._address;
  }
  set address(value: string) {
    this._address = value;
  }

  // Getters and Setters for Frequent Flyer No
  get frequentFlyerNo(): string {
    return this._frequentFlyerNo;
  }
  set frequentFlyerNo(value: string) {
    this._frequentFlyerNo = value;
  }

  // Getters and Setters for Meal Preference
  get mealPreference(): string {
    return this._mealPreference;
  }
  set mealPreference(value: string) {
    this._mealPreference = value;
  }

  // Getters and Setters for Status
  get status(): string {
    return this._status;
  }
  set status(value: string) {
    this._status = value;
  }
}
