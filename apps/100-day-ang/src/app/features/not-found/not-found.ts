import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHouse } from '@ng-icons/lucide';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.html',
  imports: [RouterLink, NgIcon],
  providers: [provideIcons({ lucideHouse })],
})
export class NotFound {}
