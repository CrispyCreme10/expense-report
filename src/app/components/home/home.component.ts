import { Component } from '@angular/core';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrashCan, faE } from '@fortawesome/free-solid-svg-icons';
import { from, map, min } from 'rxjs';

interface TableData {
  headers: string[];
  data: string[][];
}

interface DataElement {
  index: number,
  transactionDate: Date,
  postDate: Date,
  description: string,
  category: string,
  type: string,
  amount: number,
  memo: string
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent {

  columnsToDisplay = ['index', 'transactionDate', 'postDate', 'description', 'category', 'type', 'amount', 'memo'];
  dataElements: DataElement[] = [];
  tableData!: TableData;

  // stats
  dateRange: string = '';
  expenses: number = 0;
  payments: number = 0;
  returns: number = 0;
  erinTotal: number = 0;
  remainingBalance: number = 0;

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

    this.buildTableArrayFromCSV(files.item(0));
  }

  buildTableArrayFromCSV(file: File | null) {
    from(file?.text() ?? '').pipe(
      map(text => text.split('\n')),
      map(res => res.map(line => line.split(','))
        .filter(lineArr => lineArr.some(item => item !== '')))
    ).subscribe(res => {
      // if (res?.length > 0) {
        // this.tableData.headers = res[0];
      // }

      if (res?.length > 1) {
        // this.tableData.data = res.slice(1);
        this.dataElements = res.slice(1).map((transaction, index) => ({
          index: index + 1,
          transactionDate: new Date(transaction[0]),
          postDate: new Date(transaction[1]),
          description: transaction[2],
          category: transaction[3],
          type: transaction[4],
          amount: Number(transaction[5]),
          memo: transaction[6]
        }));
      }

      this.buildStats();
    });
  }

  private buildStats() {
    this.dateRange = this.getDateRange(this.dataElements.map(d => d.transactionDate));
    const expenses = this.dataElements.filter(d => d.type.toLowerCase() === 'sale')
    .map(d => d.amount)
    .reduce((acc, val) => acc + val, 0);
    this.expenses = expenses;
    this.payments = this.dataElements.filter(d => d.type.toLowerCase() === 'payment')
      .map(d => d.amount)
      .reduce((acc, val) => acc + val, 0);
    this.returns = this.dataElements.filter(d => d.type.toLowerCase() === 'return')
      .map(d => d.amount)
      .reduce((acc, val) => acc + val, 0);
    this.erinTotal = this.dataElements.filter(d => d.memo.toLowerCase() === 'erin')
      .map(d => d.amount)
      .reduce((acc, val) => acc + val, 0);
    this.remainingBalance = expenses + this.payments + this.returns;
  }

  private getDateRange(arr: Date[]): string {
    const minText = new Date(Math.min(...[...arr.map(x => x.getTime())])).toLocaleDateString('en-us', {month: 'long', day: 'numeric', year: 'numeric'});
    const maxText = new Date(Math.max(...[...arr.map(x => x.getTime())])).toLocaleDateString('en-us', {month: 'long', day: 'numeric', year: 'numeric'});
    return `${minText} - ${maxText}`;
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
