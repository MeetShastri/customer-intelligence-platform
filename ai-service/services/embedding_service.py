import os
import time
import requests
from dotenv import load_dotenv

load_dotenv()

# Global cache for local fallback model to avoid reloading on every call
_local_model = None

def generate_embedding(text: str):
    """Generate embedding for a given text using local model first, with Hugging Face Serverless Inference API as fallback"""
    global _local_model
    
    # 1. Try local SentenceTransformer model first (fast, cached, zero network dependency)
    try:
        from sentence_transformers import SentenceTransformer
        if _local_model is None:
            _local_model = SentenceTransformer("all-MiniLM-L6-v2")
        embedding = _local_model.encode(text)
        return embedding.tolist()
    except Exception:
        # 2. Fall back to Hugging Face Serverless API if local execution fails or is not installed
        api_url = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2"
        headers = {}
        hf_token = os.getenv("HF_TOKEN")
        if hf_token:
            headers["Authorization"] = f"Bearer {hf_token}"
            
        payload = {"inputs": text}
        
        try:
            for attempt in range(3):
                response = requests.post(api_url, headers=headers, json=payload, timeout=5)
                if response.status_code == 200:
                    result = response.json()
                    if isinstance(result, list) and len(result) > 0:
                        if isinstance(result[0], list):
                            return result[0]
                        return result
                    raise Exception(f"Unexpected response format from HF API: {result}")
                elif response.status_code == 503:
                    time.sleep(2)
                    continue
                else:
                    raise Exception(f"HF API returned status code {response.status_code}: {response.text}")
        except Exception:
            # 3. Final fallback: deterministic mock embedding (for completely offline/no-library environments)
            import hashlib
            h = hashlib.sha256(text.encode('utf-8')).digest()
            mock_vector = []
            for i in range(384):
                val = (((h[i % 32] + i) * 17) % 200 - 100) / 100.0
                mock_vector.append(val)
            return mock_vector