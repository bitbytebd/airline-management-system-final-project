import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaggageSupportCase, BoardingPassRecord, SpecialAssistanceRequest } from '../models/airport-operations.model';

@Injectable({ providedIn: 'root' })
export class AirportOperationsService {
  private assistanceUrl = 'http://localhost:8080/api/special-assistance';
  private baggageUrl = 'http://localhost:8080/api/baggage-support';
  private boardingUrl = 'http://localhost:8080/api/boarding-passes';

  constructor(private http: HttpClient) {}

  getAssistanceRequests(): Observable<SpecialAssistanceRequest[]> {
    return this.http.get<SpecialAssistanceRequest[]>(this.assistanceUrl);
  }

  createAssistanceRequest(data: SpecialAssistanceRequest): Observable<SpecialAssistanceRequest> {
    return this.http.post<SpecialAssistanceRequest>(this.assistanceUrl, data);
  }

  completeAssistanceRequest(id: number): Observable<SpecialAssistanceRequest> {
    return this.http.patch<SpecialAssistanceRequest>(`${this.assistanceUrl}/${id}/complete`, {});
  }

  reopenAssistanceRequest(id: number): Observable<SpecialAssistanceRequest> {
    return this.http.patch<SpecialAssistanceRequest>(`${this.assistanceUrl}/${id}/reopen`, {});
  }

  deleteAssistanceRequest(id: number): Observable<void> {
    return this.http.delete<void>(`${this.assistanceUrl}/${id}`);
  }

  getBaggageCases(): Observable<BaggageSupportCase[]> {
    return this.http.get<BaggageSupportCase[]>(this.baggageUrl);
  }

  createBaggageCase(data: BaggageSupportCase): Observable<BaggageSupportCase> {
    return this.http.post<BaggageSupportCase>(this.baggageUrl, data);
  }

  resolveBaggageCase(id: number): Observable<BaggageSupportCase> {
    return this.http.patch<BaggageSupportCase>(`${this.baggageUrl}/${id}/resolve`, {});
  }

  deleteBaggageCase(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baggageUrl}/${id}`);
  }

  getBoardingPasses(): Observable<BoardingPassRecord[]> {
    return this.http.get<BoardingPassRecord[]>(this.boardingUrl);
  }

  issueBoardingPass(data: BoardingPassRecord): Observable<BoardingPassRecord> {
    return this.http.post<BoardingPassRecord>(this.boardingUrl, data);
  }
}
