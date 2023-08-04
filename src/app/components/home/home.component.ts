import { Component } from '@angular/core';
import { faPenToSquare } from '@fortawesome/free-regular-svg-icons';
import { faTrashCan, faE } from '@fortawesome/free-solid-svg-icons';
import { from, map } from 'rxjs';
import * as pdfjsLib from 'pdfjs-dist'
import { TextItem } from 'pdfjs-dist/types/src/display/api';

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
  totalTransactions: number = 0;

  // icons
  faEdit = faPenToSquare;
  faDelete = faTrashCan;
  faE = faE;

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = "//cdn.jsdelivr.net/npm/pdfjs-dist@3.9.179/build/pdf.worker.js"

    this.tableData = {
      headers: [],
      data: []
    }
  }

  fileUpload(event: Event) {
    const files = (event.target as HTMLInputElement).files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type === 'application/pdf') {
        console.log('PDF File: ', file);
        this.buildTableArrayFromPDF(file);
      } else if (file.type === 'text/csv') {
        console.log('CSV File: ', file);
        this.buildTableArrayFromCSV(file);
      }
    }

  }

  async buildTableArrayFromPDF(file: File) { 
    const include = [3, 4];
    const pdf = await pdfjsLib.getDocument(await file.arrayBuffer()).promise;
    const countPromises = []; // collecting all page promises
    for (let i = 1; i <= pdf.numPages; i++) {
      if (!include.includes(i)) continue;
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      countPromises.push(textContent.items.map((s) => (s as TextItem).str).join(''));
    }
    const pageContents = await Promise.all(countPromises);
    console.log(pageContents);

    // cleanup
    const str = pageContents.join('');
    const matches = [...str.matchAll(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/g)].map(m => new Date(m['0']));
    const split = str.split(/[0-9]{2}\/[0-9]{2}\/[0-9]{4}/).slice(1);
    console.log(matches);
    console.log(split);

    const cleanedData = split.map(s => {
      const x = s.trim().split(' ');
      return {
        tranAmount: Number(x[0].replace('$', '')),
        desc: x.slice(1).join(' ')
      }
    })

    console.log(cleanedData);

    for (let i = 0; i < matches.length; i++) {
      const date = matches[i];
      const x = cleanedData[i];
      this.addDataElement({
        index: this.dataElements.length + 1,
        transactionDate: date,
        postDate: date,
        description: x.desc,
        category: '',
        type: '',
        amount: x.tranAmount,
        memo: ''
      })
    }
  }

  buildTableArrayFromCSV(file: File) {
    from(file.text() ?? '').pipe(
      map(text => text.split('\n')),
      map(res => res.map(line => line.split(','))
        .filter(lineArr => lineArr.some(item => item !== '')))
    ).subscribe(res => {
      // if (res?.length > 0) {
        // this.tableData.headers = res[0];
      // }

      if (res?.length > 1) {
        // this.tableData.data = res.slice(1);
        const arr = res.slice(1);
        for (let i = 0; i < arr.length; i++) {
          this.addDataElement({
            index: this.dataElements.length + 1,
            transactionDate: new Date(arr[i][0]),
            postDate: new Date(arr[i][1]),
            description: arr[i][2],
            category: arr[i][3],
            type: arr[i][4],
            amount: Number(arr[i][5]),
            memo: arr[i][6]
          });
        }
      }
    });
  }

  addDataElement(dataElement: DataElement) {
    console.log(dataElement);
    dataElement.index = this.dataElements.length + 1;
    this.dataElements.push(dataElement);
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
    this.totalTransactions = this.dataElements?.length;
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
