import { Component, OnInit } from '@angular/core';
import { WPService } from '../wp.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss']
})
export class TableComponent implements OnInit {
  displayedColumns: string[] = ['id', 'title', 'slug', 'status', 'creation date'];
  tableData;
  error;

  constructor(service: WPService, public dialog: MatDialog) {
    service.getData().subscribe(
      (data) => this.tableData = data,
      error => this.error = error
    );
  }

  ngOnInit(): void {
  }

  onClickRow(row): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: 'auto',
      data: {title: row.title.rendered, link: row.link, content: row.content.rendered}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

}
