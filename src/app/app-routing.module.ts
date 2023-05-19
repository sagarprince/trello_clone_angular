import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardsComponent } from './components/boards/boards.component';
import { ListsComponent } from './components/lists/lists.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'boards', 
    pathMatch: 'full'
  },
  { 
    path: 'boards', 
    component: BoardsComponent,
    children: [
      {
        path: ':id',
        component: ListsComponent
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
