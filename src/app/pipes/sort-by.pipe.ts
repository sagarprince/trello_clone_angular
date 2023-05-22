import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sortBy',
  standalone: true
})
export class SortByPipe implements PipeTransform {

  transform(list: any[], sortFn?: (a: any, b: any) => number): any[] {
    return list.sort(sortFn);
  }

}
