import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'arrange',
  pure: false
})
export class ArrangePipe implements PipeTransform {

  transform(value: Array<any>, ...args: any): unknown {
    value.sort((a, b) => (a[args] > b[args] ? -1 : 1));
    return value
  }

}
