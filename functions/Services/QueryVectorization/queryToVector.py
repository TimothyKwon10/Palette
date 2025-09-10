from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import os, json, numpy as np, torch, torch.nn.functional as F
import firebase_admin
import random
from datetime import datetime, timezone
from fastapi import FastAPI, Header, HTTPException, status, Depends, BackgroundTasks, Query
from fastapi.responses import Response
import httpx
from firebase_admin import credentials, firestore, auth as fb_auth

# -------------------- FastAPI --------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # accept from all
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- Firebase -------------------
if "FIREBASE_SERVICE_ACCOUNT_JSON" in os.environ:
    cred = credentials.Certificate(json.loads(os.environ["FIREBASE_SERVICE_ACCOUNT_JSON"]))
else:
    cred = credentials.Certificate("../../serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# -------------------- Model (example) ------------
from open_clip import create_model_and_transforms, get_tokenizer
device = "cpu"
model, _, preprocess = create_model_and_transforms("ViT-B-32", pretrained="laion2b_s34b_b79k")
tokenizer = get_tokenizer("ViT-B-32")
model.to(device).eval()

# -------------------- Cache ----------------------
RANGE_FIELD = "updatedAt"
COLLECTION  = "generalImages"

def l2_normalize(arr: np.ndarray) -> np.ndarray:
    if arr.size == 0:
        return arr
    norms = np.linalg.norm(arr, axis=1, keepdims=True)
    norms = np.where(norms == 0, 1.0, norms)
    return arr / norms

image_vector_cache = {
    "ids": [],
    "urls": [],
    "embeddings": [],
    "matrix": None,
    "id_to_idx": {},
    "last_refresh": None,
    "widths": [],
    "heights": []
}

def _rebuild_matrix():
    embs = np.asarray(image_vector_cache["embeddings"], dtype=np.float32)
    image_vector_cache["matrix"] = l2_normalize(embs) if embs.size else None

# -------------------- Loaders --------------------
def collect_image_vectors_full():
    """Full warm-up: load all docs that already have vectors."""
    docs = db.collection(COLLECTION).where("hasVector", "==", True).stream()

    ids, urls, widths, heights, embs = [], [], [], [], []
    for doc in docs:
        d = doc.to_dict()
        vec = d.get("image_vector")
        if not vec:
            continue
        ids.append(doc.id)
        urls.append(d.get("url"))
        widths.append(d.get("width"))
        heights.append(d.get("height"))
        embs.append(vec)

    image_vector_cache["widths"] = widths
    image_vector_cache["heights"] = heights
    image_vector_cache["ids"] = ids
    image_vector_cache["urls"] = urls
    image_vector_cache["embeddings"] = embs
    image_vector_cache["id_to_idx"] = {doc_id: i for i, doc_id in enumerate(ids)}
    image_vector_cache["last_refresh"] = datetime.now(timezone.utc)
    _rebuild_matrix()
    print(f"Loaded {len(ids)} image vectors into cache")

def collect_image_vectors_new_only():
    last = image_vector_cache["last_refresh"]
    if last is None:
        collect_image_vectors_full()
        return 0

    # Firestore requires order_by on the same field used in range filter
    q = (db.collection(COLLECTION)
           .where("hasVector", "==", True)
           .where(RANGE_FIELD, ">", last)
           .order_by(RANGE_FIELD))

    new_docs = list(q.stream())
    if not new_docs:
        image_vector_cache["last_refresh"] = datetime.now(timezone.utc)
        return 0

    added = 0
    ids   = image_vector_cache["ids"]
    urls  = image_vector_cache["urls"]
    embs  = image_vector_cache["embeddings"]
    idx   = image_vector_cache["id_to_idx"]

    for doc in new_docs:
        if doc.id in idx:
            # skip: "only pull images that are currently not in the cache"
            continue
        d   = doc.to_dict()
        vec = d.get("image_vector")
        if not vec:
            continue
        idx[doc.id] = len(ids)
        ids.append(doc.id)
        urls.append(d.get("url"))
        image_vector_cache["widths"].append(d.get("width"))
        image_vector_cache["heights"].append(d.get("height"))
        embs.append(vec)
        added += 1

    if added:
        _rebuild_matrix()

    image_vector_cache["last_refresh"] = datetime.now(timezone.utc)
    return added

# -------------------- FastAPI hooks ----------------
@app.on_event("startup")
def load_image_vectors():
    collect_image_vectors_full()

@app.post("/refresh")
def refresh_db_vectors():
    added = collect_image_vectors_new_only()
    return {
        "status": "ok",
        "added": added,
        "total_in_cache": len(image_vector_cache["ids"]),
        "refreshed_at": image_vector_cache["last_refresh"].isoformat()
    }

class Q(BaseModel):
    text: str

@app.post("/vectorizeAndCompare")
def root(query: Q):
    tokens = tokenizer([query.text]).to(device)

    with torch.no_grad():
        text_features = model.encode_text(tokens)
        text_features = F.normalize(text_features, dim=-1)

    #normalize query vector to allow for easy cosine comparison with image embeddings matrix
    query_vector = text_features.squeeze().cpu().numpy().reshape(1, -1)

    #run cosine similarity on vector and image matrix 
    similarities = np.dot(image_vector_cache["matrix"], query_vector.T).flatten()
    top_indices = similarities.argsort()[::-1][:160]

    shuffled_part = top_indices[:80].copy()
    np.random.shuffle(shuffled_part)

    final_indices = np.concatenate([shuffled_part, top_indices[80:]])

    return {
        "matches": [
            {
                "id": image_vector_cache["ids"][i],
                "url": image_vector_cache["urls"][i],
                "width": image_vector_cache["widths"][i],
                "height": image_vector_cache["heights"][i]
            }
            for i in final_indices
        ]
    }

# @app.post("/admin/refresh-feeds")
# def generateFeed(authorization: str = Header(None, alias = "Authorization")):
#     require_service_key(authorization)

#     categoriesDict = {
#         "Digital Art": "High-quality digital artworks created on a computer, in a variety of styles.",
#         "Photography": "High-quality photographs capturing a subject, scene, or atmosphere.",
#         "Illustration": "A high-quality illustration or drawing with line, form, and color.",
#         "3D Art": "A high-quality 3D render or model.",
#         "Concept Art": "High-quality concept art exploring mood, setting, or design ideas.",
#         "Character Design": "High-quality artwork focused on designing a character.",
#         "Landscape": "A high-quality landscape scene of nature or environment.",
#         "Portraiture": "A high-quality portrait of a person or character.",
#         "Cooking": "High-quality food imagery related to cooking, dishes, ingredients, or finished meals.",
#         "Architecture": "High-quality images of architecture, buildings, or structures.",
#         "Anime": "High-quality anime-style artwork, characters, or settings.",
#         "Fashion": "High-quality fashion photos highlighting unique clothing and style.",
#         "Abstract": "High-quality abstract art emphasizing shapes, color, and texture.",
#         "Traditional Painting": "A high-quality traditional painting created with physical media.",
#         "Graphic Design": "High-quality graphic design featuring typography and layout."
#     }

#     for snap in db.collection("users").stream():
#         uid = snap.id
#         data = snap.to_dict()
#         prefs = data.get("preferences") or []

#         queries = [categoriesDict.get(pref, pref) for pref in prefs]
#         batch_results = run_batch(queries)

#         random_results = get_random_images(125)
#         combined = batch_results + random_results

#         best = {}
#         for r in combined:
#             if r["id"] not in best:
#                 best[r["id"]] = r

#         # Shuffle personalized + 125 randoms
#         mixed_feed_results = list(best.values())
#         random.shuffle(mixed_feed_results)

#         # Now tack on 300 *purely random* extras at the end
#         extra_randoms = get_random_images(300)

#         extra_unique = []
#         seen_ids = {r["id"] for r in mixed_feed_results}
#         for r in extra_randoms:
#             if r["id"] not in seen_ids:
#                 extra_unique.append(r)
#                 seen_ids.add(r["id"])

#         # Final combined feed
#         final_results = mixed_feed_results + extra_unique

#         db.collection("users").document(uid).set(
#             {"personal_feed": final_results},
#             merge=True
#         )

#     return {"Refreshed Feed": True}

def verify_id_token(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    try:
        return fb_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")

def build_user_feed(uid: str):
    uref  = db.collection("users").document(uid)
    usnap = uref.get()
    data  = usnap.to_dict() or {}
    prefs = data.get("preferences") or []

    categoriesDict = {
        "Digital Art": "High-quality digital artworks created on a computer, in a variety of styles.",
        "Photography": "High-quality photos of people, landscapes, or scenes. Exclude cameras, products, or equipment.",
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

    queries = [categoriesDict.get(pref, pref) for pref in prefs]
    batch_results = run_batch(queries)

    random_results = get_random_images(50)
    combined = batch_results + random_results

    best = {}
    for r in combined:
        if r["id"] not in best:
            best[r["id"]] = r

    # Shuffle personalized + 50 randoms
    mixed_feed_results = list(best.values())
    random.shuffle(mixed_feed_results)

    # Now tack on 100 *purely random* extras at the end
    extra_randoms = get_random_images(100)

    extra_unique = []
    seen_ids = {r["id"] for r in mixed_feed_results}
    for r in extra_randoms:
        if r["id"] not in seen_ids:
            extra_unique.append(r)
            seen_ids.add(r["id"])

    # Final combined feed
    final_results = mixed_feed_results + extra_unique

    db.collection("users").document(uid).set(
        {"personal_feed": final_results},
        merge=True
    )

    return {"Refreshed Personal Feed": True}

@app.post("/refresh-personal-feed")
def refresh_feed_for_user(decoded=Depends(verify_id_token)):
    uid = decoded["uid"]
    return build_user_feed(uid)

# ADMIN_REFRESH_KEY = os.environ["ADMIN_REFRESH_KEY"]

def run_batch(texts: list[str]):
    results = []
    for text in texts:
        tokens = tokenizer([text]).to(device)
        with torch.no_grad():
            text_features = model.encode_text(tokens)
            text_features = F.normalize(text_features, dim=-1)

        query_vector = text_features.squeeze().cpu().numpy().reshape(1, -1)
        similarities = np.dot(image_vector_cache["matrix"], query_vector.T).flatten()
        top_indices = similarities.argsort()[::-1][:50]

        results.extend([
        {
            "id": image_vector_cache["ids"][i],
            "url": image_vector_cache["urls"][i],
            "width": image_vector_cache["widths"][i],
            "height": image_vector_cache["heights"][i]
        }
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

# def require_service_key(authorization: str = Header(None, alias="Authorization")):
#     if authorization != f"Bearer {ADMIN_REFRESH_KEY}":
#         raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="unauthorized")

def get_random_images(k=125):
    all_ids = image_vector_cache["ids"]
    all_urls = image_vector_cache["urls"]

    if not all_ids:
        return []

    sample_size = min(k, len(all_ids))
    indices = random.sample(range(len(all_ids)), sample_size)

    return [
    {
        "id": all_ids[i],
        "url": all_urls[i],
        "width": image_vector_cache["widths"][i],
        "height": image_vector_cache["heights"][i]
    }
    for i in indices
    ]

@app.get("/cai")
async def process_cai_image(
    id: str = Query(..., description="The CAI IIIF image ID"),
    w: int = Query(1200, description="Requested width (default 1200)")
):
    url = f"https://www.artic.edu/iiif/2/{id}/full/{w},/0/default.jpg"

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                      "AppleWebKit/537.36 (KHTML, like Gecko) "
                      "Chrome/115.0.0.0 Safari/537.36"
    }

    try:
        async with httpx.AsyncClient(timeout=60.0, headers=headers, follow_redirects=True) as client:
            r = await client.get(url)
            if r.status_code != 200:
                raise HTTPException(
                    status_code=r.status_code,
                    detail=f"Upstream error {r.status_code} at {url}"
                )
            return Response(
                content=r.content,
                media_type="image/jpeg",
                headers={"Cache-Control": "public, max-age=31536000, immutable"}
            )
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Proxy error: {str(e)}")