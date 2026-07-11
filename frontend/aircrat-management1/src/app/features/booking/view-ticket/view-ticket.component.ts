import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BookingService } from 'src/app/core/services/booking.service';
import { Booking } from 'src/app/core/models/booking.model';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

@Component({
  selector: 'app-ticket-view',
  templateUrl: './view-ticket.component.html',
  styleUrls: ['./view-ticket.component.css']
})
export class TicketViewComponent implements OnInit {
  @ViewChild('ticketContent') ticketElement!: ElementRef;
  booking: Booking | undefined;

  constructor(
    private route: ActivatedRoute,
    private service: BookingService
  ) {}

  ngOnInit(): void {
    const ref = this.route.snapshot.paramMap.get('ref') || '';
    if (ref) {
      this.service.getByReference(ref).subscribe(data => this.booking = data);
    }
  }

  downloadTicket() {
    if (!this.booking) return;

    // Capture HTML to Canvas
    html2canvas(this.ticketElement.nativeElement, { scale: 2 }).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      
      // Create PDF (A4 size)
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 208; 
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 10, imgWidth, imgHeight);
      pdf.save(`Skyward-Ticket-${this.booking?.bookingReference}.pdf`);
    });
  }
}