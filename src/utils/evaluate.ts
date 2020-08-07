export function Evaluate(
  expression: string,
  argument: { name: string; value: any }[]
) {
  return Function(`"use strict"; 
  return function (${argument.map((a) => a.name).join(", ")}) { 
    return (${expression}); 
  }`)()(...argument.map((a) => a.value));
}

export function EvaluateAsync(
  expression: string,
  argument: { name: string; value: any }[]
): Promise<any> {
  return Function(`"use strict"; 
  return async function (${argument.map((a) => a.name).join(", ")}) { 
    return (${expression}); 
  }`)()(...argument.map((a) => a.value));
}
