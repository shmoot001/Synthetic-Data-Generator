from fastapi import FastAPI

app = FastAPI()

@app.get("/test/hello")
def read_hello():
    return {"message": "Hello from test API"}
