from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def root():
    return {"message": "Welcome to your API!"}

@app.get("/health")
def health_check():
    return {"status": "OK"}


    