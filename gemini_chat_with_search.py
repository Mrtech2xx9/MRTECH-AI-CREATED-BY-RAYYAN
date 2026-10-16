import os
from google import genai
from google.genai import types

# ---------------------------------------------------------
# 1. SETUP & INITIALIZATION
# ---------------------------------------------------------
# API Key സെറ്റ് ചെയ്യുന്നു (Environment variable അല്ലെങ്കിൽ ഇവിടെ നേരിട്ട് നൽകാം)
API_KEY = os.environ.get("GEMINI_API_KEY", "")

# Gemini Client പ്രാരംഭമായി സെറ്റ് ചെയ്യുന്നു
client = genai.Client(api_key=API_KEY) if API_KEY else genai.Client()

# ---------------------------------------------------------
# 2. CURRENT INFORMATION RULES & CONFIGURATION
# ---------------------------------------------------------
SYSTEM_INSTRUCTION = """You are MRTECH AI, an accurate and reliable AI assistant.

CURRENT INFORMATION RULES:
1. For questions about current facts, government officials, news, sports, technology, prices, and recent events, use Google Search grounding whenever available and relevant.
2. Never assume that information from your training data is still current.
3. Verify the current status using reliable, recent sources. Prefer official government websites for government-related questions.
4. Check the date of the source and distinguish current office holders from former office holders.
5. Give a direct answer first, followed by the date checked and supporting source links when available.
6. Never fabricate facts, dates, citations, or search results.
7. If search is unavailable or sources are inconclusive, clearly explain that the answer could not be verified.
8. Answer in the user's language. For Malayalam questions, answer in natural Malayalam.
9. Do not claim to have searched the web unless search was actually performed.

Accuracy and freshness are more important than guessing."""

# Google Search Grounding ഉൾപ്പെടുത്തിയ കോൺഫിഗറേഷൻ
config = types.GenerateContentConfig(
    system_instruction=SYSTEM_INSTRUCTION,
    temperature=0.2,  # കൃത്യത ഉറപ്പാക്കാൻ താഴ്ന്ന temperature
    max_output_tokens=1000,
    tools=[{"google_search": {}}]  # 🔍 Google Search Grounding Tool
)

# ---------------------------------------------------------
# 3. FUNCTION 1: ask_gemini (Single Prompt with Search Grounding)
# ---------------------------------------------------------
def ask_gemini(prompt: str) -> str:
    """
    ഒറ്റത്തവണ ചോദ്യങ്ങൾക്ക് ഗൂഗിൾ സെർച്ച് ഗ്രൗണ്ടിംഗ് വഴി
    തത്സമയ വിവരങ്ങൾ പരിശോധിച്ച് കൃത്യമായ മറുപടി നൽകുന്നു.
    """
    try:
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=config
        )
        
        reply = response.text or ""
        
        # Grounding source links ലഭ്യമാണെങ്കിൽ ചേർക്കുന്നു
        candidate = response.candidates[0] if response.candidates else None
        grounding = getattr(candidate, "grounding_metadata", None)
        if grounding and getattr(grounding, "grounding_chunks", None):
            sources = []
            for chunk in grounding.grounding_chunks:
                web = getattr(chunk, "web", None)
                if web and getattr(web, "uri", None):
                    title = getattr(web, "title", "Source") or "Source"
                    sources.append(f"- [{title}]({web.uri})")
            if sources:
                reply += "\n\n**Sources:**\n" + "\n".join(sources[:4])
                
        return reply
    except Exception as e:
        return f"Error: {e}"

# ---------------------------------------------------------
# 4. FUNCTION 2: start_chat_session (Interactive Session with Grounding)
# ---------------------------------------------------------
def start_chat_session():
    """
    തുടർച്ചയായ സംഭാഷണങ്ങളിൽ പഴയ ഹിസ്റ്ററി സൂക്ഷിച്ചുകൊണ്ട്
    തത്സമയ വെബ് സെർച്ച് വഴി കൃത്യമായ മറുപടി നൽകുന്നു.
    """
    print("\n--- MRTECH AI Chat Session ആരംഭിച്ചു ('exit' എന്ന് നൽകിയാൽ അവസാനിപ്പിക്കാം) ---")
    chat = client.chats.create(
        model="gemini-2.5-flash",
        config=config
    )
    
    while True:
        user_input = input("\nനിങ്ങൾ: ").strip()
        if not user_input:
            continue
        if user_input.lower() in ["exit", "quit", "പുറത്തുകടക്കുക"]:
            print("Chat അവസാനിച്ചു.")
            break
            
        try:
            response = chat.send_message(user_input)
            reply = response.text or ""
            
            candidate = response.candidates[0] if response.candidates else None
            grounding = getattr(candidate, "grounding_metadata", None)
            if grounding and getattr(grounding, "grounding_chunks", None):
                sources = []
                for chunk in grounding.grounding_chunks:
                    web = getattr(chunk, "web", None)
                    if web and getattr(web, "uri", None):
                        title = getattr(web, "title", "Source") or "Source"
                        sources.append(f"- [{title}]({web.uri})")
                if sources:
                    reply += "\n\n**Sources:**\n" + "\n".join(sources[:3])
                    
            print(f"\nMRTECH AI: {reply}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    start_chat_session()
