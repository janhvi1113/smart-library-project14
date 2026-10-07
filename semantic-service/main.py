from fastapi import FastAPI
from pydantic import BaseModel
from openai import OpenAI
from difflib import SequenceMatcher
import re

app = FastAPI(
    title="Smart Library Semantic Search",
    version="1.0.0"
)

client = OpenAI()


class SearchRequest(BaseModel):
    query: str
    books: list[dict]


class AIRequest(BaseModel):
    message: str
    userName: str
    userId: int
    libraryContext: str = ""


@app.get("/")
def home():
    return {
        "message": "Smart Library Semantic Search Service is running"
    }


def tokenize(text):
    return set(
        re.findall(
            r"[a-zA-Z0-9]+",
            str(text).lower()
        )
    )


def calculate_similarity(query, text):
    query_words = tokenize(query)
    text_words = tokenize(text)

    if not query_words or not text_words:
        return 0.0

    common_words = query_words.intersection(text_words)

    keyword_score = len(common_words) / len(query_words)

    sequence_score = SequenceMatcher(
        None,
        query.lower(),
        text.lower()
    ).ratio()

    return round(
        (keyword_score * 0.75) +
        (sequence_score * 0.25),
        4
    )


@app.post("/semantic-search")
def semantic_search(request: SearchRequest):

    query = request.query or ""

    if not query.strip():
        return {
            "query": query,
            "results": []
        }

    if not request.books:
        return {
            "query": query,
            "results": []
        }

    results = []

    for book in request.books:

        text = " ".join([
            str(book.get("title") or ""),
            str(book.get("author") or ""),
            str(book.get("category") or ""),
            str(book.get("description") or "")
        ])

        score = calculate_similarity(
            query,
            text
        )

        results.append({
            "book": book,
            "similarityScore": score
        })

    results.sort(
        key=lambda x: x["similarityScore"],
        reverse=True
    )

    return {
        "query": query,
        "results": results
    }


@app.post("/ai-chat")
def ai_chat(request: AIRequest):

    message = request.message.strip()

    if not message:
        return {
            "reply": "Please enter a message."
        }

    prompt = f"""
USER INFORMATION:

Name: {request.userName}
User ID: {request.userId}

CURRENT SMART LIBRARY DATA:

{request.libraryContext}

STUDENT QUESTION:

{message}
"""

    response = client.responses.create(
        model="gpt-6-luna",

        instructions="""
You are the Smart Library AI Assistant for a college library.

Your job is to help students with:

- Finding books
- Searching the Book Catalog
- Borrowing books
- Reserving books
- Checking their reservations
- Checking their borrowed books
- Checking circulation history
- Understanding book availability
- Understanding overdue books
- Library services

IMPORTANT RULES:

1. CURRENT LIBRARY DATA is provided in the user message.

2. Use the CURRENT LIBRARY DATA when answering questions about books,
availability, reservations, borrowing and circulation.

3. Never invent a book title.

4. Never claim that a book is available unless the CURRENT LIBRARY DATA
shows available copies.

5. If available copies are 0, clearly say that the book is currently
unavailable.

6. If the student asks about their reservation, use MY RESERVATIONS
from the CURRENT LIBRARY DATA.

7. If the student asks about their borrowed books or history, use
MY CIRCULATION HISTORY from the CURRENT LIBRARY DATA.

8. If the requested information is not available in the CURRENT LIBRARY
DATA, clearly say that the information is not available.

9. If the student wants to find a book, always mention the Book Catalog.

10. Give useful search terms based on what the student asks.

11. Do not ask unnecessary questions when the student's request is
already clear.

12. Keep answers short, practical and easy to understand.

13. Do not use Markdown formatting.

14. Do not use **bold**, ## headings, backticks, or other Markdown symbols.

15. When giving multiple search terms or steps, put each item on its own line.

16. For reservation questions, explain:

To reserve a book:

- Open the Book Catalog.
- Find the book.
- Select Reserve.
- If unavailable, join the reservation queue.

17. For overdue questions, explain:

For an overdue book:

- Open Notifications.
- Check the Circulation section.
- Return the book as soon as possible.

18. If the student asks something unrelated to the library, politely
explain that you are designed to assist with Smart Library services.

19. Do not give long explanations.

20. Never expose passwords, JWT tokens, API keys or other credentials.

21. Never claim that an action was performed unless the system actually
performed that action.

Always make the answer visually easy to read with separate lines.
""",

        input=prompt
    )

    return {
        "reply": response.output_text
    }
