import { Component } from '@angular/core';
import { NetGridComponent } from './components/net-grid/net-grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NetGridComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'net-logger';
}
