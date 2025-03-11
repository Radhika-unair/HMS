import requests
import json
from typing import List, Generator, Optional

class OllamaModel:
    def __init__(self, host_url: str = "http://127.0.0.1", port: int = 11434):
        """Initialize Ollama API client"""
        self.url = f"{host_url}:{port}"
        self.model_list: List[str] = []
        self.current_model: str = ""
        # User a session 
        self._session = requests.Session()
    
    def get_available_models(self) -> List[str]:
        """Fetch available models efficiently"""
        try:
            response = self._session.get(f"{self.url}/api/tags")
            response.raise_for_status()
            
            models_data = response.json()
            self.model_list = [model["name"] for model in models_data.get("models", [])]
            
            if self.model_list:
                self.current_model = self.model_list[0]
            
            return self.model_list
            
        except requests.RequestException as e:
            print(f"Error fetching models: {e}")
            return []
    
    def ask_to_model(self, problem_stream: str, current_model: Optional[str] = None) -> None:
        """
        Send prompts to model and handle streaming response efficiently
        """
        model = current_model or self.current_model
        if not model:
            raise ValueError("No model specified or available")

        payload = {
            "model": "meditron:7b", #model,
            "prompt": problem_stream,
            "stream": True
        }

        try:
            # Use stream=True for efficient memory usage
            with self._session.post(
                f"{self.url}/api/generate",
                json=payload,
                stream=True
            ) as response:
                response.raise_for_status()
                self._process_stream(response)
                
        except requests.RequestException as e:
            print(f"Error during API call: {e}")
        except Exception as e:
            print(f"Unexpected error: {e}")

    def _process_stream(self, response: requests.Response) -> None:
        """Process the streaming response efficiently"""
        buffer = ""
        
        # Use generator expression for memory efficiency
        for chunk in response.iter_lines(decode_unicode=True):
            if chunk:
                try:
                    result = json.loads(chunk)
                    response_text = result.get("response", "")
                    if response_text:
                        print(response_text, end="", flush=True)
                except json.JSONDecodeError as e:
                    print(f"Error parsing JSON: {e}")
                    continue

    def __enter__(self):
        """Context manager entry"""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - cleanup resources"""
        self._session.close()

