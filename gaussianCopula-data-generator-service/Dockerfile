# Baserad på en lättvikts-Python-image
FROM python:3.12-slim

# Sätt arbetskatalogen
WORKDIR /app

# Kopiera requirements först för cache
COPY ./requirements.txt .

# Installera systemberoenden 
RUN apt-get update && \
    apt-get install -y build-essential gcc && \
    pip install --upgrade pip && \
    pip install -r requirements.txt && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Kopiera in hela applikationen
COPY . .

# Exponera FastAPI-port
EXPOSE 8000

# Startkommandot
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8002", "--reload"]
