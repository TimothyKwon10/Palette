from fastapi import FastAPI
from open_clip import create_model_and_transforms, get_tokenizer
from pydantic import BaseModel
import torch
import torch.nn.functional as F
import numpy as np
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json

app = FastAPI()

if "FIREBASE_SERVICE_ACCOUNT_JSON" in os.environ:
    # Railway production mode
    service_account_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    cred = credentials.Certificate(service_account_info)
# else:
#     # Local development
#     cred = credentials.Certificate("../../serviceAccountKey.json")

firebase_admin.initialize_app(cred)
db = firestore.client()

def l2_normalize(arr: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    return arr / np.where(norms == 0, 1, norms)

#Store vector data in RAM for quick cosine similarity comparisons
image_vector_cache = {
    "ids": [],
    "embeddings": None,
    "matrix": None
}

def collect_image_vectors():
    snapshot = db.collection("generalImages") \
        .where("image_vector", "!=", []) \
        .stream()

    vectors = [(doc.id, doc.to_dict()["image_vector"]) for doc in snapshot]
    ids, embeddings = zip(*vectors)

    #create a normalized matrix (all unit vectors) for image vectors 
    matrix = l2_normalize(np.array(embeddings))

    image_vector_cache["ids"] = list(ids)
    image_vector_cache["embeddings"] = embeddings
    image_vector_cache["matrix"] = matrix

@app.on_event("startup")
def load_image_vectors():
    collect_image_vectors()

@app.post("/refresh")
def refresh_db_vectors():
    collect_image_vectors()
    return {"status": "refreshed", "count": len(image_vector_cache['ids'])}


device = "cpu"
model, _, preprocess = create_model_and_transforms("ViT-B-32", pretrained="laion2b_s34b_b79k")
tokenizer = get_tokenizer("ViT-B-32")
model.to(device).eval()

class Query(BaseModel):
    text: str

@app.post("/vectorizeAndCompare")
def root(query: Query):
    tokens = tokenizer([query.text]).to(device)

    with torch.no_grad():
        text_features = model.encode_text(tokens)
        text_features = F.normalize(text_features, dim=-1)

    #normalize query vector to allow for easy cosine comparison with image embeddings matrix
    query_vector = text_features.squeeze().cpu().numpy().reshape(1, -1)

    #run cosine similarity on vector and image matrix 
    similarities = np.dot(image_vector_cache["matrix"], query_vector.T).flatten()
    top_indices = similarities.argsort()[::-1][:5]
    results = [{"id": image_vector_cache["ids"][i], "score": float(similarities[i])} for i in top_indices]

    return {"matches": results}
    