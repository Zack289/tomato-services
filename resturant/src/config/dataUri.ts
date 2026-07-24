import DataUriParser from "datauri/parser.js";
import path from "path";

const getBuffer = (file: any) => {
  const parser = new DataUriParser();

  const extName = path.extname(file.originalname).toString(); //to define the file extension like .jpg

  return parser.format(extName, file.buffer);
};

export default getBuffer;
