import logging
import sys
import os
sys.path.append(os.path.abspath("recognize-anything"))

from fastapi import FastAPI
from ram.models import ram_plus
from pydantic import BaseModel
from utils import download_image, run_ram_plus

#server run command: PYTHONPATH=/workspace/dependencies python3 -m uvicorn main:app --host=0.0.0.0 --port=8000
#IP address for api: zbpu6fv2frpdqd

app = FastAPI()
model = None
model_loaded = False

#logging configuration, logs should show up in server terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("uvicorn")

#boot up the RAM++ model on api call
@app.on_event("startup")
def load_model():
    global model, model_loaded
    model = ram_plus(pretrained = "/workspace/pretrained/ram_plus_swin_large_14m.pth",
                     image_size = 384,
                     vit = 'swin_l'
                    )
    model_loaded = True

@app.get("/healthz")
def health_check():
    return {"ready": model_loaded}

class ImageData(BaseModel):
    id: str
    source: str

@app.post("/")
def root(images: list[ImageData]):
    global model
    results = []

    for image in images:
        try:
            local_path = download_image(image.id, image.source)
            tags = run_ram_plus(local_path, model)
            tag_list = [tag.strip() for tag in tags.split("|") if tag.strip()]

            #get tags from RAM++ and then store them in results 
            logger.info(f"Image Tags: {tags}")
            results.append({"id": image.id, "tags": tag_list})
        except Exception as e:
            logger.error(f"{e} SOMETHING MESSED UP")
    try:
        shutil.rmtree("temp_images")
        os.makedirs("temp_images")
    except Exception as e:
        logger.warning(f"Failed to clear temp_images folder: {e}")
    return results