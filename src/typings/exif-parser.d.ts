declare module 'exif-parser' {
  export interface IResult {
    tags: {
      DateTimeOriginal?: number
    }
    imageSize: {
      width: number
      height: number
    }
    [key: string]: any
  }

  export interface IParser {
    parse (): IResult
  }

  export function create (buffer: Buffer | ArrayBuffer): IParser
}
