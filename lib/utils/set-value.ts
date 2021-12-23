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
    } else if (type === Boolean) {
      if (typeof value === 'string' && value.toLowerCase() == 'false') {
        target[property] = false;
      } else if (typeof value === 'string' && !isNaN(Number(value))) {
        target[property] = Boolean(Number(value));
      } else {
        target[property] = Boolean(value);
      }
    } else if (type === Date) {
      const date = new Date(value);
      target[property] = isNaN(date.getTime()) ? value : date;
    } else if (type === Object) {
      try {
        target[property] = JSON.parse(value);
      } catch (e) {
        target[property] = value;
      }
    } else {
      target[property] = value;
    }
  }
};
