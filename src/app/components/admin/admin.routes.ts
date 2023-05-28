import { Routes } from '@angular/router';
import { BoardsComponent } from './boards/boards.component';
import { BoardComponent } from './board/board.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
    {
        path: '',
        redirectTo: 'boards',
        pathMatch: 'full'
    },
    {
        path: '',
        component: DashboardComponent,
        children: [
            {
                path: 'boards',
                component: BoardsComponent,
            },
            {
                path: 'board/:id',
                component: BoardComponent,
            }
        ]
    }
];