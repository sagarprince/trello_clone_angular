import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BoardsComponent } from './components/boards/boards.component';
import { BoardComponent } from './components/board/board.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'boards', 
    pathMatch: 'full'
  },
  { 
    path: 'boards', 
    component: BoardsComponent,
  },
  {
    path: 'board/:id',
    component: BoardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
