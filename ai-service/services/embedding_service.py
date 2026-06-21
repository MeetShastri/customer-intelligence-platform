import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# Global cache for local fallback model to avoid reloading on every call
_local_model = None

def generate_embedding(text: str):
    """Generate embedding for a given text using Hugging Face Serverless Inference API with local fallback"""
    
    # Try Hugging Face Serverless API first (lightweight, zero-dependency)
    api_url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
    headers = {}
    hf_token = os.getenv("HF_TOKEN")
    if hf_token:
        headers["Authorization"] = f"Bearer {hf_token}"
        
    payload = {"inputs": text}
    
    try:
        for attempt in range(3):
            response = requests.post(api_url, headers=headers, json=payload, timeout=10)
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    if isinstance(result[0], list):
                        return result[0]
                    return result
                raise Exception(f"Unexpected response format from HF API: {result}")
            elif response.status_code == 503:
                # Model is loading on Hugging Face hub
                time.sleep(3)
                continue
            else:
                raise Exception(f"HF API returned status code {response.status_code}: {response.text}")
    except Exception as api_err:
        print(f"Hugging Face API failed: {api_err}. Attempting local fallback...")
        
        # Local fallback (lazy loaded)
        try:
            from sentence_transformers import SentenceTransformer
            global _local_model
            if _local_model is None:
                _local_model = SentenceTransformer("all-MiniLM-L6-v2")
            embedding = _local_model.encode(text)
            return embedding.tolist()
        except ImportError:
            print("Local sentence_transformers is not installed. Using a deterministic mock embedding (384 dimensions) for offline development.")
            import hashlib
            # Generate a deterministic 384-dimensional mock vector based on the text hash
            h = hashlib.sha256(text.encode('utf-8')).digest()
            mock_vector = []
            for i in range(384):
                # Deterministic float between -1.0 and 1.0
                val = (((h[i % 32] + i) * 17) % 200 - 100) / 100.0
                mock_vector.append(val)
            return mock_vector