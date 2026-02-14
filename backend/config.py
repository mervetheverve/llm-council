"""Configuration for the LLM Council."""

import os
from dotenv import load_dotenv

load_dotenv()

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Top frontier models to show in the selector (fetched names cached at startup)
TOP_MODEL_IDS = [
    "openai/gpt-5.2",
    "openai/gpt-5.1",
    "openai/o3",
    "openai/o4-mini",
    "anthropic/claude-sonnet-4.5",
    "anthropic/claude-opus-4",
    "google/gemini-3-pro-preview",
    "google/gemini-2.5-pro",
    "google/gemini-2.5-flash",
    "x-ai/grok-4",
    "x-ai/grok-4-fast",
    "deepseek/deepseek-r1",
    "meta-llama/llama-4-maverick",
    "mistralai/mistral-large-2411",
    "qwen/qwen3-235b-a22b",
]

# Will be populated at startup with {id, name} dicts from OpenRouter
AVAILABLE_MODELS = []

# Council members - list of OpenRouter model identifiers (mutable at runtime)
COUNCIL_MODELS = [
    "openai/gpt-5.2",
    "google/gemini-3-pro-preview",
    "anthropic/claude-sonnet-4.5",
    "x-ai/grok-4",
]

# Chairman model - synthesizes final response (mutable at runtime)
CHAIRMAN_MODEL = "openai/gpt-5.2"

# OpenRouter API endpoint
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"

# Data directory for conversation storage
DATA_DIR = "data/conversations"
