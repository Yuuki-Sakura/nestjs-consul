export function sleep(time = 2000) {
  return new Promise<void>((resolve) => {
    setTimeout(() => resolve(), time);
  });
}
