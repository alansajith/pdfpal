declare module "pdf-parse" {
  const pdfParse: (buffer: Buffer) => Promise<{
    text: string;
    numpages: number;
    numrender: number;
    data: unknown;
    metadata: unknown;
    version: string;
  }>;
  export default pdfParse;
}
