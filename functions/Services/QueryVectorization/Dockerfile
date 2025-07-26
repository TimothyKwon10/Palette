FROM python:3.10-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && apt-get clean

# Copy everything into the image
COPY . .

# Install Python dependencies
RUN pip install --no-cache-dir -r ./vectorization_requirements.txt

# Expose the portx
EXPOSE 8000

# Start FastAPI app
CMD ["uvicorn", "queryToVector:app", "--host", "0.0.0.0", "--port", "8000"]
