import { Component, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { UserReqService } from '../../../shared/services/api-request-services/user-request-service/user-request.service';
import { UserDto } from '../../../../../../data/models/model.dto';
import { UserService } from '../../../shared/services/user-service/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { AppService } from '../../../shared/services/app-service/app.service';

@Component({
  selector: 'admin-user',
  templateUrl: './user-admin.component.html',
  styleUrl: './user-admin.component.scss',
  animations: [
    trigger('detailExpand', [
      state('collapsed,void', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ])
  ]
})
export class UserAdminComponent {
  @ViewChild(MatPaginator) paginator = {} as MatPaginator;
  @ViewChild(MatSort) sort = {} as MatSort;

  private _expandedUser: UserDto | null;

  userDataSource: MatTableDataSource<UserDto> = new MatTableDataSource();

  tableColumns = [
    'id','nameLast','nameFirst','role','registered','lastLogIn'
  ];

  expandedColumns = [...this.tableColumns, "expandAction"]

  constructor(
    private _apiReqUserService: UserReqService,
    private _userService: UserService,
    private _snackBar: MatSnackBar) {
  }

  ngAfterViewInit() {
    this.fetchUserData().subscribe(userData => {
      this.userDataSource.data = userData;
      this.userDataSource.paginator = this.paginator;
      this.userDataSource.sort = this.sort;
    });
  }

  get availableRoles(): string[] {
    return AppService.availableRoles;
  }

  get currentUser(): UserDto | null {
    return this._userService.siteUser;
  }

  get selectedUser(): UserDto {
    if(this._expandedUser) return this._expandedUser;
    return { 
      id: undefined,
      name: null,
      nameFirst: null,
      nameLast: null,
      email: null,
      role: null,
      registered: null,
      lastLogIn: null,
      provider: null,
      providerId: ""
     };
  }

  set selectedUser(user: UserDto) {
    if(user.id !== this._userService.siteUser?.id) {
      if(user.id === this._expandedUser?.id) {
        this._expandedUser = null;
      } else {
        this._expandedUser = user;
      }
    }
  }

  get userRole(): string {
    return this._expandedUser?.role ?? "standard";
  }

  set userRole(newRole: string) {
    if(this._expandedUser?.role && this._expandedUser.role !== newRole) {
      this._expandedUser.role = newRole;
      this._apiReqUserService.updateUser(this._expandedUser).subscribe((result) => {
        this._snackBar.open(
          `Role updated for ${this._expandedUser?.name}`, 
          'Dismiss',
          { duration: 3600 }
        );
      });
    }
  }

  fetchUserData(): Observable<UserDto[]> {
    return this._apiReqUserService.getUsers();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.userDataSource.filter = filterValue.trim().toLowerCase();

    if (this.userDataSource.paginator) {
      this.userDataSource.paginator.firstPage();
    }
  }
}