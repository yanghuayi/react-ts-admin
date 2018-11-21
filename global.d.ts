import { string } from "prop-types";

interface Routers {
  path: string,
  component: any,
}

declare module '*.less' {
  const content: any;
  export default content;
}

interface Date {
  format: (date: string) => string
} 

interface String {
  hyphenToHump: () => string,
  humpToHyphen: () => string,
}