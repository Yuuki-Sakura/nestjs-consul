export const setValue = (
  value: string,
  target,
  property,
  type,
  transformer,
) => {
  if (transformer) {
    target[property] = transformer(value);
  } else {
    if (type === Number) {
      const number = Number(value);
      target[property] = isNaN(number) ? value : number;
    } else {
      target[property] = value;
    }
  }
};
