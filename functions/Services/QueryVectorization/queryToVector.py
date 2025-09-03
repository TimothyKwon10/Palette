from fastapi import FastAPI, Header, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware 

from open_clip import create_model_and_transforms, get_tokenizer
from pydantic import BaseModel
from typing import List
import torch
import torch.nn.functional as F
import numpy as np
import firebase_admin
from firebase_admin import credentials, firestore 
import os
import json
import requests
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if "FIREBASE_SERVICE_ACCOUNT_JSON" in os.environ:
    # Railway production mode
    service_account_info = json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"])
    cred = credentials.Certificate(service_account_info)
else:
    # Local development
    cred = credentials.Certificate("../../serviceAccountKey.json")

firebase_admin.initialize_app(cred)
db = firestore.client()

def l2_normalize(arr: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    return arr / np.where(norms == 0, 1, norms)

#Store vector data in RAM for quick cosine similarity comparisons
image_vector_cache = {
    "ids": [],
    "urls": [],
    "embeddings": None,
    "matrix": None
}

def collect_image_vectors():
    snapshot = db.collection("generalImages") \
        .where("image_vector", "!=", []) \
        .stream()

    vectors = [(doc.id, doc.to_dict()["image_vector"], doc.to_dict().get("url")) for doc in snapshot]
    ids, embeddings, urls = zip(*vectors)

    #create a normalized matrix (all unit vectors) for image vectors 
    matrix = l2_normalize(np.array(embeddings))

    image_vector_cache["ids"] = list(ids)
    image_vector_cache["urls"] = list(urls)
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
    top_indices = similarities.argsort()[::-1][:200]
    np.random.shuffle(top_indices)
    results = [{"id": image_vector_cache["ids"][i], "score": float(similarities[i])} for i in top_indices]

    return {"matches": results}


class BatchQuery(BaseModel):
    texts: List[str]

@app.post("/admin/refresh-feeds")
def generateFeed(authorization: str = Header(None, alias = "Authorization")):
    require_service_key(authorization)
    url = "http://127.0.0.1:8000/vectorizeAndCompareBatch" #THIS NEEDS TO CHANGE FOR RAILWAY

    categoriesDict = {
        "Digital Art": "High-quality digital artworks created on a computer, in a variety of styles.",
        "Photography": "High-quality photographs capturing a subject, scene, or atmosphere.",
        "Illustration": "A high-quality illustration or drawing with line, form, and color.",
        "3D Art": "A high-quality 3D render or model.",
        "Concept Art": "High-quality concept art exploring mood, setting, or design ideas.",
        "Character Design": "High-quality artwork focused on designing a character.",
        "Landscape": "A high-quality landscape scene of nature or environment.",
        "Portraiture": "A high-quality portrait of a person or character.",
        "Cooking": "High-quality food imagery related to cooking, dishes, ingredients, or finished meals.",
        "Architecture": "High-quality images of architecture, buildings, or structures.",
        "Anime": "High-quality anime-style artwork, characters, or settings.",
        "Fashion": "High-quality fashion photos highlighting unique clothing and style.",
        "Abstract": "High-quality abstract art emphasizing shapes, color, and texture.",
        "Traditional Painting": "A high-quality traditional painting created with physical media.",
        "Graphic Design": "High-quality graphic design featuring typography and layout."
    }

    for snap in db.collection("users").stream():
        uid = snap.id
        data = snap.to_dict()
        prefs = data.get("preferences") or []

        queries = [categoriesDict.get(pref, pref) for pref in prefs]
        batch_results = run_batch(queries)

        db.collection("users").document(uid).set(
            {"personal_feed": batch_results},
            merge=True
        )

    return {"Refreshed Feed": True}

ADMIN_REFRESH_KEY = os.environ["ADMIN_REFRESH_KEY"]

def run_batch(texts: list[str]):
    results = []
    for text in texts:
        tokens = tokenizer([text]).to(device)
        with torch.no_grad():
            text_features = model.encode_text(tokens)
            text_features = F.normalize(text_features, dim=-1)

        query_vector = text_features.squeeze().cpu().numpy().reshape(1, -1)
        similarities = np.dot(image_vector_cache["matrix"], query_vector.T).flatten()
        top_indices = similarities.argsort()[::-1][:20]

        results.extend([
            {"id": image_vector_cache["ids"][i], "url": image_vector_cache["urls"][i]}
            for i in top_indices
        ])

    # de-dupe + shuffle
    best = {}
    for r in results:
        if r["id"] not in best:
            best[r["id"]] = r
            
    results = list(best.values())
    random.shuffle(results)

    return (results)

def require_service_key(authorization: str = Header(None, alias="Authorization")):
    if authorization != f"Bearer {ADMIN_REFRESH_KEY}":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized")