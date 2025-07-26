from PIL import Image
from ram import get_transform, inference_ram as inference
import torch
import requests
import os
import sys
sys.path.append("/workspace/dependencies/rampp")

def download_image(image_id: str, url: str, folder: str = "/workspace/temp_images") -> str:
    os.makedirs(folder, exist_ok=True)
    file_path = os.path.join(folder, f"{image_id}.jpg")

    #get url from the interenet 
    response = requests.get(url)
    if response.status_code == 200:
        with open(file_path, "wb") as f:
            #write image to cloud VM folder for later tag processing
            f.write(response.content)
        return file_path
    else:
        raise Exception(f"Failed to download image: {url}")

def run_ram_plus(local_path: str, model) -> list[str]:
    #prep image for necessary specifications from Ram++
    transform = get_transform(image_size=384) 
    image = transform(Image.open(local_path)).unsqueeze(0).to("cuda").float()

    model.eval()
    model = model.to("cuda").float()

    res = inference(image, model)
    return res[0]

def run_clip(local_path: str, model, preprocess) -> list[float]:
    #prep image for necessary specification from Clip
    image = preprocess(Image.open(local_path)).unsqueeze(0).to("cuda").float()
    model = model.to("cuda").float()

    with torch.no_grad(), torch.autocast("cuda"):
        vec = model.encode_image(image)
        vec /= vec.norm(dim=-1, keepdim=True)
        final_vector = vec[0].cpu().numpy()
    return final_vector