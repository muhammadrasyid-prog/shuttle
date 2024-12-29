// ANGULAR
import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';

// THIRD-PARTY LIBRARIES
import {
  _isAnimateRows,
  ColDef,
  GridOptions,
  ICellRendererParams,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { CookieService } from 'ngx-cookie-service';
import axios from 'axios';
import Swal from 'sweetalert2';

// COMPONENTS
import { HeaderComponent } from '@layouts/header/header.component';
import { AsteriskComponent } from '@shared/components/asterisk/asterisk.component';
import { RequiredCommonComponent } from '@shared/components/required-common/required-common.component';

// SHARED
import { Response, User } from '@core/interfaces';
import { TimeDateFormatPipe } from '@shared/pipes/time-date-format.pipe';
import { ToastService } from '@core/services/toast/toast.service';
import { SpinnerComponent } from '@shared/components/spinner/spinner.component';

import { toastInOutAnimation } from '@shared/utils/toast.animation';
import { modalScaleAnimation } from '@shared/utils/modal.animation';

interface Route {
  route_uuid: string;
  // driver: driverDetail;
  // student: studentDetail;
  driver_uuid: string;
  driver_name: string;
  student_uuid: string;
  student_name: string;
  school: schoolDetail;
  route_name: string;
  route_description: string;
}

interface driverDetail {
  user_uuid: string;
  user_username: string;
}

interface studentDetail {
  student_uuid: string;
  student_first_name: string;
}

interface schoolDetail {
  school_id: string;
  school_name: string;
}

@Component({
  selector: 'app-routes',
  standalone: true,
  imports: [
    AgGridAngular,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular,
    AsteriskComponent,
    RequiredCommonComponent,
    SpinnerComponent,
  ],
  templateUrl: './routes.component.html',
  styleUrl: './routes.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class RoutesComponent implements OnInit {
    // For token
    token: string | null = '';
    // For sorting
    sortBy: string = 'user_id';
    sortDirection: string = 'asc';
  
    // For pagination
    paginationPage: number = 1;
    paginationCurrentPage: number = 1;
    paginationItemsLimit: number = 10;
    paginationTotalPage: number = 0;
    showing: string = '';
    pages: number[] = [];

  // For data routes
  route_uuid: string = '';
  driver_uuid: string = '';
  driver_name: string = '';
  student_uuid: string = '';
  student_name: string = '';
  school_id: string = '';
  route_name: string = '';
  route_description: string = '';

  // For initial avatar
  initialAvatar: string = '';

  // For loading
  isLoading: boolean = false;

  // For CRUD Modal
  isModalAddOpen: boolean = false;
  isModalEditOpen: boolean = false;
  isModalDetailOpen: boolean = false;
  isModalDeleteOpen: boolean = false;

  // Row list data routes
  rowListAllRoute: Route[] = [];

  // Row list data driver
  rowListAllDriver: driverDetail[] = [];

  // Row list data student
  rowListAllStudent: studentDetail[] = [];

  // Row list data school
  rowListAllSchool: schoolDetail[] = [];

  constructor(
    private cookieService: CookieService,
    private cdRef: ChangeDetectorRef,
    public toastService: ToastService,
    @Inject('apiUrl') private apiUrl: string,
  ) {
    this.apiUrl = apiUrl;
    this.token = this.cookieService.get('accessToken');
  }

  ngOnInit(): void {
    this.getAllRoute();
    this.getAllDriver();
    this.getAllStudent();
  }

  themeClass = 'ag-theme-quartz';
  
  gridOptions = {
    ensureDomOrder: true,
    pagination: true,
    paginationPageSizeSelector: [10, 20, 50, 100],
    suppressPaginationPanel: true,
    // penyesuaian request onSortChanged
    // onSortChanged: (event: any) => {
    //   this.onSortChanged(event);
    // },
    // onSortChanged: this.onSortChanged.bind(this),
    onGridReady: () => {
      console.log('Grid sudah siap!');
    },
  };
  
 // Column Definitions
    colHeaderListRoutes: ColDef<Route>[] = [
      { headerName: 'No.',
        valueGetter: 'node.rowIndex + 1', 
        width: 50,
        maxWidth: 70,
        pinned: 'left',
        sortable: false,
      },
      { headerName: 'Route Name', 
        field: 'route_name', 
        maxWidth: 250,
        sortable: true,
      },
      { headerName: 'Driver Name', 
        // field: 'driver.user_username',
        field: 'driver_name',
        maxWidth: 250,
        sortable: true,
      },
      { headerName: 'Student Name', 
        // field: 'student.student_first_name',
        field: 'student_name',
        maxWidth: 250,
        sortable: true,
      },
      // { headerName: 'School', 
      //   field: 'school.school_name',
      //   maxWidth: 250,
      //   sortable: true,
      // },
      { headerName: 'Route Description', 
        field: 'route_description',
        maxWidth: 250,
        sortable: true,
      },
      {
        headerName: 'Actions',
        pinned: 'right',
      },
    ];

     // Default column definitions for consistency
     defaultColDef: ColDef = {
      flex: 1,
      width: 130,
      minWidth: 120,
      wrapHeaderText: true,
      autoHeaderHeight: true,
      sortable: false,
    };

    goToPage(page: number) {
      if (page >= 1 && page <= this.paginationTotalPage) {
        this.paginationPage = page;
        this.getAllStudent();
      }
    }
  
    goToNextPage() {
      if (this.paginationPage < this.paginationTotalPage) {
        this.paginationPage++;
        this.getAllStudent();
      }
    }
  
    goToPreviousPage() {
      if (this.paginationPage > 1) {
        this.paginationPage--;
        this.getAllStudent();
      }
    }
  
    changeMaxItemsPerPage(event: Event) {
      const target = event.target as HTMLSelectElement;
      this.paginationItemsLimit = +target.value;
      this.paginationPage = 1;
      this.getAllStudent();
    }

    // Get all routes
    getAllRoute() {
      this.isLoading = true;
      axios
        .get(`${this.apiUrl}/api/school/route/all`, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          this.rowListAllRoute = response.data.routes;
          console.log('route', response);
          this.paginationTotalPage = response.data.data.meta.total_page;
          this.pages = Array.from(
            { length: this.paginationTotalPage },
            (_, i) => i + 1
          ); // Copy data
          this.showing = response.data.data.meta.showing;
  
          this.isLoading = false;
          this.cdRef.detectChanges();
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
          this.isLoading = false;
        });
    }

    // Get all driver
    getAllDriver() {
      axios
        .get(`${this.apiUrl}/api/school/user/driver/all`, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          this.rowListAllDriver = response.data.data.data;
          console.log('driver', this.rowListAllDriver);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }

    // Get all student
    getAllStudent() {
      axios
        .get(`${this.apiUrl}/api/school/student/all`, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          this.rowListAllStudent = response.data.data.data;
          console.log('student', this.rowListAllStudent);
        })
        .catch((error) => {
          console.error('Error fetching data:', error);
        });
    }

    openAddModal() {
      this.isModalAddOpen = true;
    }

    //Add route
    addRoute() {
      const requestData = {
        driver_uuid: this.driver_uuid,
        student_uuid: this.student_uuid,
        school_id: this.school_id,
        route_name: this.route_name,
        route_description: this.route_description,
      }
      console.log('request', requestData);
      axios
        .post(`${this.apiUrl}/api/school/route/add`, requestData, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          const responseMessage = response.data?.message || 'Success.';
          this.showToast(responseMessage, 3000, Response.Success);
    
          this.getAllRoute();
          this.isModalDeleteOpen = false;
        })
        .catch((error) => {
          const responseMessage =
            error.response?.data?.message || 'An unexpected error occurred.';
          this.showToast(responseMessage, 3000, Response.Error);
        });
    }

    closeAddModal() {
      this.isModalAddOpen = false;
      this.cdRef.detectChanges();
    }
    
    showToast(message: string, duration: number, type: Response) {
      this.toastService.add(message, duration, type);
    }
  
    removeToast(index: number) {
      this.toastService.remove(index);
    }

}
