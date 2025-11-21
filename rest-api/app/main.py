import os
from typing import Union
import uuid

from fastapi import FastAPI, HTTPException, UploadFile
from fastapi.params import File
from fastapi.responses import FileResponse

app = FastAPI()
DATA_DIR = "/data/files"
os.makedirs(DATA_DIR, exist_ok=True)

@app.post("/files")
async def upload_file(file: UploadFile = File(...)):
    file_id = str(uuid.uuid4())
    filename = f"{file_id}_{file.filename}"
    path = os.path.join(DATA_DIR, filename)
    with open(path, "wb") as f:
        contents = await file.read()
        f.write(contents)
    return {"id": file_id, "filename": file.filename, "path": filename}

@app.get("/files/{file_id}")
def download_file(file_id: str):
    for name in os.listdir(DATA_DIR):
        if name.startswith(file_id + "_"):
            real_name = name.split("_",1)[1]
            return FileResponse(os.path.join(DATA_DIR, name), filename=real_name)
    raise HTTPException(status_code=404, detail="File not found")

@app.get("/files")
def list_files():
    out = []
    for name in os.listdir(DATA_DIR):
        if "_" in name:
            fid, fname = name.split("_", 1)
            out.append({"id": fid, "filename": fname})
    return out

@app.delete("/files/{file_id}")
def delete_file(file_id: str):
    for name in os.listdir(DATA_DIR):
        if name.startswith(file_id + "_"):
            os.remove(os.path.join(DATA_DIR, name))
            return {"deleted": file_id}
    raise HTTPException(status_code=404, detail="File not found")