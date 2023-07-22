import { Component } from '@angular/core';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrashCan, faE } from '@fortawesome/free-solid-svg-icons';
import { Observable, from, map, skip, take, tap } from 'rxjs';

interface TableData {
  headers: string[];
  data: string[][];
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  tableData!: TableData;
  
  // icons
  faEdit = faPenToSquare;
  faDelete = faTrashCan;
  faE = faE;

  constructor() {
    this.tableData = {
      headers: [],
      data: []
    }
  }

  fileUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    from(files.item(0)?.text() ?? '').pipe(
      map(text => text.split('\n')),
      map(res => res.map(line => line.split(',')).filter(lineArr => lineArr.some(item => item !== '')))
    ).subscribe(res => {
      if (res?.length > 0) {
        this.tableData.headers = res[0];
      }

      if (res?.length > 1) {
        this.tableData.data = res.slice(1);
      }
    });
  }

  fieldChanged(event: Event) {
    const target = (event.target as HTMLInputElement);

    console.log(target.value);
  }

  editRow(rowIndex: number) {
    
  }

  deleteRow(rowIndex: number) {

  }

  setErin(rowIndex: number) {
    
  }

}
