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

interface Vehicle {
  vehicle_uuid: string;
  school_uuid: string;
  school_name: string;
  driver_name: string;
  vehicle_name: string;
  vehicle_number: string;
  vehicle_type: string;
  vehicle_color: string;
  vehicle_seats: number;
  vehicle_status: string;
}

interface driverDetail {
  user_uuid: string;
  user_username: string;
}

@Component({
  selector: 'app-vehicle',
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
  templateUrl: './vehicle.component.html',
  styleUrl: './vehicle.component.css',
  animations: [toastInOutAnimation, modalScaleAnimation],
})
export class VehicleComponent {
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

  // For data vehicle
  vehicle_uuid: string = '';
  school_uuid: string = '';
  school_name: string = '';
  vehicle_name: string = '';
  vehicle_number: string = '';
  vehicle_type: string = '';
  vehicle_color: string = '';
  vehicle_seats: number = 0;
  vehicle_status: string = '';
 
   // For initial avatar
   initialAvatar: string = '';
 
   // For loading
   isLoading: boolean = false;
 
   // For CRUD Modal
   isModalAddOpen: boolean = false;
   isModalEditOpen: boolean = false;
   isModalDetailOpen: boolean = false;
   isModalDeleteOpen: boolean = false;

  // Row list data vehicle
  rowListAllVehicle: Vehicle[] = [];

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
    this.getAllVehicle();
  }

  themeClass =
        "ag-theme-quartz";
  
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
      colHeaderListVehicle : ColDef<Vehicle>[] = [
        { headerName: 'No.',
          valueGetter: 'node.rowIndex + 1', 
          width: 50,
          maxWidth: 70,
          pinned: 'left',
          sortable: false,
        },
        // { headerName: 'Driver Name', 
        //   field: 'driver_name', 
        //   maxWidth: 250,
        //   sortable: true,
        // },
        // { headerName: 'School Name', 
        //   field: 'school_name',
        //   maxWidth: 250,
        //   sortable: true,
        // },
        { headerName: 'Vehicle Name', 
          field: 'vehicle_name',
          maxWidth: 250,
          sortable: true,
        },
        { headerName: 'Vehicle Number', 
          field: 'vehicle_number',
          maxWidth: 250,
          sortable: true,
        },
        { headerName: 'Type', 
          field: 'vehicle_type',
          maxWidth: 250,
          sortable: true,
        },
        { headerName: 'Vehicle Color', 
          field: 'vehicle_color',
          maxWidth: 250,
          sortable: true,
        },
        { headerName: 'Capacity', 
          field: 'vehicle_seats',
          maxWidth: 250,
          sortable: true,
        },
        { headerName: 'Status', 
          field: 'vehicle_status',
          maxWidth: 250,
          sortable: true,
        },
        {
          headerName: 'Actions',
          headerClass: 'justify-center',
          cellStyle: { textAlign: 'center' },
          sortable: false,
          autoHeight: true,
          cellRenderer: (params: ICellRendererParams) => {
            const buttonContainer = document.createElement('div');
            buttonContainer.classList.add(
              'flex',
              'items-center',
              'justify-center',
              'py-2',
              'gap-x-1',
            );
    
            const editButton = document.createElement('button');
            editButton.innerText = 'Edit';
            editButton.title = 'Click to Edit';
            editButton.classList.add('hover:bg-white', 'p-1', 'rounded-full');
            editButton.innerHTML = `
          <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="m7 17.011 4.413-.015 9.632-9.54c.378-.378.586-.88.586-1.414 0-.534-.208-1.036-.586-1.414l-1.586-1.586c-.756-.756-2.075-.752-2.825-.003L7 12.581v4.43ZM18.045 4.456l1.589 1.583-1.597 1.582-1.586-1.585 1.594-1.58ZM9 13.416l6.03-5.974 1.586 1.586L10.587 15 9 15.004v-1.589Z"></path>
            <path d="M5 21h14c1.103 0 2-.897 2-2v-8.668l-2 2V19H8.158c-.026 0-.053.01-.079.01-.033 0-.066-.009-.1-.01H5V5h6.847l2-2H5c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2Z"></path>
          </svg>
            `;
            editButton.addEventListener('click', (event) => {
              event.stopPropagation();
              this.openEditModal(params.data.vehicle_uuid);
            });
    
            const viewButton = document.createElement('button');
            viewButton.innerText = 'View';
            viewButton.title = 'Click to View';
            viewButton.classList.add('hover:bg-white', 'p-1', 'rounded-full');
            viewButton.innerHTML = `
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2Zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8Z"></path>
              <path d="M11 11h2v6h-2v-6Zm0-4h2v2h-2V7Z"></path>
            </svg>
            `;
            viewButton.addEventListener('click', (event) => {
              event.stopPropagation();
              // this.openDetailModal(params.data.student_uuid);
            });
    
            const deleteButton = document.createElement('button');
            deleteButton.innerText = 'Delete';
            deleteButton.title = 'Click to Delete';
            deleteButton.classList.add(
              'text-red-500',
              'hover:bg-white',
              'p-1',
              'rounded-full',
            );
            deleteButton.innerHTML = `
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8h2V6h-4V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v2H3v2h2v12ZM9 4h6v2H9V4ZM8 8h9v12H7V8h1Z"></path>
                <path d="M9 10h2v8H9v-8Zm4 0h2v8h-2v-8Z"></path>
              </svg>
            `;
            deleteButton.addEventListener('click', (event) => {
              event.stopPropagation();
              this.onDeleteVehicle(params.data.vehicle_uuid);
            });
    
            buttonContainer.appendChild(editButton);
            buttonContainer.appendChild(viewButton);
            buttonContainer.appendChild(deleteButton);
    
            return buttonContainer;
          },
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
      this.getAllVehicle();
    }
  }

  goToNextPage() {
    if (this.paginationPage < this.paginationTotalPage) {
      this.paginationPage++;
      this.getAllVehicle();
    }
  }

  goToPreviousPage() {
    if (this.paginationPage > 1) {
      this.paginationPage--;
      this.getAllVehicle();
    }
  }

  changeMaxItemsPerPage(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.paginationItemsLimit = +target.value;
    this.paginationPage = 1;
    this.getAllVehicle();
  }

  getAllVehicle() {
    this.isLoading = true;
    axios
      .get(`${this.apiUrl}/api/school/vehicle/all`, {
        headers: {
          Authorization: `${this.cookieService.get('accessToken')}`,
        },
      })
      .then((response) => {
        this.rowListAllVehicle = response.data.data.data;
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

    openAddModal() {
      this.isModalAddOpen = true;
    }

    addVehicle() {
      const requestData = {
        vehicle_name: this.vehicle_name,
        vehicle_number: this.vehicle_number,
        vehicle_type: this.vehicle_type,
        vehicle_color: this.vehicle_color,
        vehicle_seats: this.vehicle_seats,
        vehicle_status: this.vehicle_status,
        school_id: this.school_uuid,
      };
      console.log('request', requestData);
      axios
        .post(`${this.apiUrl}/api/school/vehicle/add`, requestData, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          const responseMessage = response.data?.message || 'Success.';
          this.showToast(responseMessage, 3000, Response.Success);
    
          this.getAllVehicle();
          this.isModalAddOpen = false;
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

    openEditModal(vehicle_uuid: string) {
      axios
        .get(`${this.apiUrl}/api/school/vehicle/${vehicle_uuid}`, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          console.log('edit', response);
          const editData = response.data.data;
          this.vehicle_uuid = editData.vehicle_uuid;
          this.school_uuid = editData.school_uuid;
          this.vehicle_name = editData.vehicle_name;
          this.vehicle_number = editData.vehicle_number;
          this.vehicle_type = editData.vehicle_type;
          this.vehicle_color = editData.vehicle_color;
          this.vehicle_seats = editData.vehicle_seats;
          this.vehicle_status = editData.vehicle_status;
    
          this.isModalEditOpen = true;
          this.cdRef.detectChanges();
        })
        .catch((error) => {
          Swal.fire({
            title: 'Error',
            text: error.response.data.message,
            icon: 'error',
            timer: 2000,
            timerProgressBar: true,
            showCancelButton: false,
            showConfirmButton: false,
        });
      });
    }

    updateVehicle() {
      const requestData = {
        vehicle_name: this.vehicle_name,
        vehicle_number: this.vehicle_number,
        vehicle_type: this.vehicle_type,
        vehicle_color: this.vehicle_color,
        vehicle_seats: this.vehicle_seats,
        vehicle_status: this.vehicle_status,
        school_id: this.school_uuid,
      };
      console.log('request', requestData);

      axios
        .put(`${this.apiUrl}/api/school/vehicle/update/${this.vehicle_uuid}`, requestData, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          const responseMessage = response.data?.message || 'Success.';
          this.showToast(responseMessage, 3000, Response.Success);
    
          this.getAllVehicle();
          this.isModalEditOpen = false;
        })
        .catch((error) => {
          const responseMessage =
            error.response?.data?.message || 'An unexpected error occurred.';
          this.showToast(responseMessage, 3000, Response.Error);
        });
    }

    closeEditModal() {
      this.isModalEditOpen = false;
      this.cdRef.detectChanges();
    }

    onDeleteVehicle(vehicle_uuid: string) {
      this.isModalDeleteOpen = true;
      this.vehicle_uuid = vehicle_uuid;
      this.cdRef.detectChanges();
    }

    performDeleteVehicle(vehicle_uuid: string) {
      axios
        .delete(`${this.apiUrl}/api/school/vehicle/delete/${vehicle_uuid}`, {
          headers: {
            Authorization: `${this.cookieService.get('accessToken')}`,
          },
        })
        .then((response) => {
          const responseMessage = response.data?.message || 'Success.';
          this.showToast(responseMessage, 3000, Response.Success);
    
          this.getAllVehicle();
          this.isModalDeleteOpen = false;
        })
        .catch((error) => {
          const responseMessage =
            error.response?.data?.message || 'An unexpected error occurred.';
          this.showToast(responseMessage, 3000, Response.Error);
        });
    }

    closeDeleteModal() {
      this.isModalDeleteOpen = false;
      this.cdRef.detectChanges();
    }

    showToast(message: string, duration: number, type: Response) {
      this.toastService.add(message, duration, type);
    }
  
    removeToast(index: number) {
      this.toastService.remove(index);
    }

}
