import fitz
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM

def extract_text(file_path):
    doc = fitz.open(file_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def chunk_text(text, size=800):
    words = text.split()
    chunks = []
    for i in range(0, len(words), size):
        chunks.append(" ".join(words[i:i+size]))
    return chunks

def summarize_text(text):
    model_name = "sshleifer/distilbart-cnn-12-6"
    tokenizer = AutoTokenizer.from_pretrained(model_name)
    model = AutoModelForSeq2SeqLM.from_pretrained(model_name)

    # Tokenize the input text
    inputs = tokenizer(text, return_tensors="pt", max_length=1024, truncation=True)

    # Generate the summary (using the model's generate method)
    summary_ids = model.generate(
        inputs['input_ids'],  # Input text
        max_length=250,       # Increase max length for longer summary
        min_length=100,       # Ensure the summary is at least 100 tokens long
        num_beams=6,          # Use more beams for better quality
        length_penalty=0.8,   # Encourage a longer summary (less penalization for length)
        early_stopping=True   # Stop when the model deems the summary is finished
    )

    # Decode the summary back into text
    summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)

    # chunks = chunk_text(text)
    # final_summary = ""

    # for chunk in chunks:
    #     result = summarizer(
    #         chunk,
    #         max_length=120,
    #         min_length=30,
    #         do_sample=False
    #     )
    #     final_summary += result[0]['summary_text'] + " "

    return summary