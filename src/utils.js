export const wait = (delay, value) =>
  new Promise(resolve => setTimeout(resolve, delay, value));
