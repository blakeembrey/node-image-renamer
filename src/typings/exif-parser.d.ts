declare module 'exif-parser' {
  export interface IResult {
    tags: {
      DateTimeOriginal?: number
    }
  }

  export interface IParser {
    parse (): IResult
  }

  export function create (buffer: Buffer | ArrayBuffer): IParser
}
