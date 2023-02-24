import express from "express";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import azureStorage from "azure-storage";
import intoStream from "into-stream";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const port = process.env.PORT || 4001;
const instance = new express();
const containerName = "";
const __dirname = path.dirname(__filename);

dotenv.config();

instance.use(
  fileUpload({
    createParentPath: true,
  })
);

const blobService = azureStorage.createBlobService(
    //connection string 
    ""
    );

instance.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

instance.post("/fileupload", (request, response) => {
  if (!request.files) {
    return res.status(400).send("No files are received.");
  }

  const file = request.files.file;
  const path = __dirname + "/files/" + file.name;

  file.mv(path, (err) => {
    if (err) {
      return response.status(500).send(err);
    }

    return response.send({ status: "success", path: path });
  });
});

instance.post("/blobupload", (request, response) => {
  if (!request.files) {
    return res.status(400).send("No files are received.");
  }

  const blobName = request.files.file.name;
  console.log(`Blob Name ${blobName}`);

  const stream = intoStream(request.files.file.data);
  console.log(`stream ${stream}`);

  const streamLength = request.files.file.data.length;
  console.log(`Length ${streamLength}`);

  blobService.createBlockBlobFromStream(
    containerName,
    blobName,
    stream,
    streamLength,
    (err) => {
      if (err) {
        response.status(500);
        response.send({ message: "Ocurrio un error" });
        return;
      }

      response
        .status(200)
        .send({ message: "El archivo se subio de manera exito en el BLOB" });
    }
  );
});

instance.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
