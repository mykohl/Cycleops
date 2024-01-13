import { Component, NgZone } from '@angular/core';
import { SocialAuthService, SocialUser, GoogleLoginProvider } from '@abacritt/angularx-social-login';
import { UserService } from './services/user.service';
import { ApiReqUserService } from './services/api-request-services/api-req-user.service';
import { ApiReqMakerService } from './services/api-request-services/api-req-maker.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'cycle-ops-app';
  makers: any[] = [];
  private _socialUser: SocialUser | null = null;

  constructor(
    private _socialAuthService: SocialAuthService,
    private _userService: UserService,
    private _apiReqUserService: ApiReqUserService,
    private _zone: NgZone
  ) {}

  ngOnInit() {
    this._socialAuthService.authState.subscribe((socialUser) => {
      if (socialUser) {
        this._socialUser = socialUser;
        const userDto = this._userService.map(socialUser);
        this._zone.run(() => {
          this._apiReqUserService.updateUser(userDto).subscribe(
            (response) => console.log('Update response: ', response),
            (error) => console.error('Update error:', error)
          );
        });
      }
    });
  }

  refreshGoogleToken(): void {
    this._socialAuthService.refreshAuthToken(GoogleLoginProvider.PROVIDER_ID);
  }
}