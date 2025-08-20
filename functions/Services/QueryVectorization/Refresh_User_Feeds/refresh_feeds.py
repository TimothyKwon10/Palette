import requests
import os

url = os.getenv("FEED_REFRESH_ENDPOINT")
ADMIN_REFRESH_KEY = os.environ["ADMIN_REFRESH_KEY"]

headers = {
    "Authorization": f"Bearer {ADMIN_REFRESH_KEY}"
}

response = requests.post(url, headers=headers)
print(response.json())