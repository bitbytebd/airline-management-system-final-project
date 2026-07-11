import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {
  currentUser: any = null;
  profileImage = '';
  permissions: string[] = [];
  private readonly apiBaseUrl = 'http://localhost:8080';
  private loggedInUser: any = null;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.loggedInUser = this.authService.getCurrentUser() || {};
    this.permissions = this.authService.getPermissions();
    this.setProfileUser(this.loggedInUser);
  }

  get displayName(): string {
    return this.currentUser?.fullName || this.currentUser?.username || 'Skyward User';
  }

  get role(): string {
    return this.currentUser?.role || 'STAFF';
  }

  get department(): string {
    return this.currentUser?.department || 'N/A';
  }

  get permissionPreview(): string[] {
    return this.permissions.includes('ALL') ? ['All modules'] : this.permissions;
  }

  get avatarUrl(): string {
    const encodedName = encodeURIComponent(this.displayName);
    return `https://ui-avatars.com/api/?name=${encodedName}&background=0f6ea8&color=fff&bold=true&size=180`;
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!this.currentUser?.id) {
      alert('Profile user was not found. Please login again.');
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.profileImage = String(reader.result || this.avatarUrl);
    };
    reader.readAsDataURL(file);

    const formData = new FormData();
    formData.append('file', file);
    this.http.post<any>(`${this.apiBaseUrl}/api/users/${this.currentUser.id}/profile-image`, formData)
      .subscribe({
        next: (updatedUser) => {
          const imageUrl = updatedUser?.profileImageUrl;
          console.debug('Profile image upload response:', updatedUser);
          this.currentUser = { ...this.currentUser, ...updatedUser, profileImageUrl: imageUrl };
          if (Number(this.currentUser?.id) === Number(this.loggedInUser?.id)) {
            this.loggedInUser = { ...this.loggedInUser, ...this.currentUser };
            localStorage.setItem('user', JSON.stringify(this.currentUser));
          }
          this.profileImage = this.resolveProfileImage(imageUrl) || this.avatarUrl;
          alert('Profile photo saved successfully.');
          input.value = '';
        },
        error: (error) => {
          this.profileImage = this.resolveProfileImage(this.currentUser?.profileImageUrl) || this.avatarUrl;
          alert(error?.error?.message || 'Profile photo could not be saved.');
          input.value = '';
        }
      });
  }

  private resolveProfileImage(url: string | null | undefined): string {
    if (!url) return '';
    if (/^https?:\/\//i.test(url) || url.startsWith('data:')) {
      return url;
    }
    return `${this.apiBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  }

  private setProfileUser(user: any): void {
    this.currentUser = user || {};
    this.profileImage = this.resolveProfileImage(this.currentUser?.profileImageUrl) || this.avatarUrl;
  }
}
