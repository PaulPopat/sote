export function Evalulate(expression: string, props: any) {
  return Function(`"use strict";
  return function (props) {
    return (${expression});
  }`)()(props);
}