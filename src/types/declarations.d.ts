declare module 'cloudscraper' {
  interface Cloudscraper {
    (options: any): Promise<any>;
    get(url: string | any, options?: any): Promise<any>;
    post(url: string | any, options?: any): Promise<any>;
    request(options: any): Promise<any>;
    default: Cloudscraper;
  }
  const cloudscraper: Cloudscraper;
  export default cloudscraper;
}
