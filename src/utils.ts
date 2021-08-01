export const wait = <PromiseType>(delay: number, value?: any): Promise<PromiseType> => new Promise((resolve) => setTimeout(resolve, delay, value));
