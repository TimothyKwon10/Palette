from PIL import Image
from ram import get_transform, inference_ram as inference
import torch
import requests
import os
import sys
sys.path.append("/workspace/dependencies/rampp")
COLORTHIEF_PATH = "/workspace/dependencies"
if os.path.isdir(COLORTHIEF_PATH) and COLORTHIEF_PATH not in sys.path:
    sys.path.insert(0, COLORTHIEF_PATH)
    
from colorthief import ColorThief 

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

def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)

def extract_palette_from_file(path: str, k: int, quality: int) -> dict:
    ct = ColorThief(path)
    palette = ct.get_palette(color_count=k, quality=quality) or []
    dominant = ct.get_color(quality=quality)

    # hexify
    palette_hex = [rgb_to_hex(c) for c in palette]
    dominant_hex = rgb_to_hex(dominant)

    # ensure no duplicates
    if dominant_hex in palette_hex:
        palette_hex = [dominant_hex] + [h for h in palette_hex if h != dominant_hex]
    else:
        palette_hex = [dominant_hex] + palette_hex
    palette_hex = palette_hex[:k]

    return {
        "dominant": dominant_hex,
        "palette": palette_hex
    }