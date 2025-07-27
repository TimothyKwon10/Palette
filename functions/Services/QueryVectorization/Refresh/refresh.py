import requests
import os

url = os.getenv("VECTOR_REFRESH_ENDPOINT")
response = requests.post(url)
print(response.json())