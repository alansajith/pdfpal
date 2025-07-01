declare module "pdf-parse" {
  const pdfParse: (buffer: Buffer) => Promise<{
    text: string;
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    version: string;
  }>;
  export default pdfParse;
}
