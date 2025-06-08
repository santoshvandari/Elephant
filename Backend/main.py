from fastapi import FastAPI,status

app = FastAPI()

@app.get("/")
def read_root():
    return {status:status.HTTP_200_OK, "message": "Welcome to the FastAPI application!"} 

