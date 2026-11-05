import urllib.request, json

BASE = "https://kumuvzthmqslfszgwjmq.supabase.co/rest/v1"
KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1bXV2enRobXFzbGZzemd3am1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2MzQ3NTIsImV4cCI6MjEwNjIxMDc1Mn0.6xUKnFd5LtB0mG51_cvbwpK5Wj9UeUZb3dgq1Hm8Ab8"
headers = {"apikey": KEY, "Authorization": f"Bearer {KEY}"}

def get(path):
    req = urllib.request.Request(BASE + path, headers=headers)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, r.read().decode()
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode()

print("PRODUCTS", get("/products?select=*&limit=50"))
print("REVIEWS", get("/reviews?select=id,name,item,rating&limit=20"))
print("ORDERS", get("/orders?select=id&limit=1"))
