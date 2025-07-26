import logging
import sys
import os
import shutil
import json
sys.path.append("/workspace/dependencies/rampp")

from fastapi import FastAPI
from ram.models import ram_plus
from pydantic import BaseModel
from utils import download_image, run_ram_plus, run_clip

import open_clip
import torch

app = FastAPI()
RamModel = None
RamModel_loaded = False

ClipModel = None
preprocess = None
ClipModel_loaded = False

#logging configuration, logs should show up in server terminal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("uvicorn")

#boot up the RAM++ and Clip model on api call
@app.on_event("startup")
def load_model():
    global RamModel, RamModel_loaded
    RamModel = ram_plus(pretrained = "/workspace/models/ram_plus_swin_large_14m.pth",
                     image_size = 384,
                     vit = 'swin_l'
                    )
    RamModel_loaded = True

    global ClipModel, preprocess, ClipModel_loaded
    ClipModel, preprocess, tokenizer = open_clip.create_model_and_transforms(
        'ViT-B-32',
        pretrained='laion2b_s34b_b79k'
    )
    ClipModel.eval()
    ClipModel_loaded = True

@app.get("/healthz")
def health_check():
    return {"ready": RamModel_loaded}

class ImageData(BaseModel):
    id: str
    source: str

@app.post("/")
def root(images: list[ImageData]):
    global RamModel
    global ClipModel
    global preprocess
    
    RamResults = []
    ClipResults = []
    
    for image in images:
        try:
            local_path = download_image(image.id, image.source)
            tags = run_ram_plus(local_path, RamModel)
            tag_list = [tag.strip() for tag in tags.split("|") if tag.strip()]

            vectorized_image = run_clip(local_path, ClipModel, preprocess)
            
            #get tags from RAM++ and then store them in results 
            logger.info(f"Image Tags: {tags}")
            RamResults.append({"id": image.id, "tags": tag_list})
            ClipResults.append({"id": image.id, "image_vector": vectorized_image.tolist()})
            
        except Exception as e:
            logger.error(f"{e} SOMETHING MESSED UP")
    
    try:
        shutil.rmtree("temp_images")
        os.makedirs("temp_images")
    except Exception as e:
        logger.warning(f"Failed to clear temp_images folder: {e}")

    print("RAM Results:", json.dumps(RamResults, indent=2))
    print("CLIP Results:", json.dumps(ClipResults, indent=2))
    return {
        "ram_results": RamResults,
        "clip_results": ClipResults
    }
