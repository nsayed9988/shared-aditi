import requests
from bs4 import BeautifulSoup
import nltk
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

# Ensure you have the necessary nltk packages
nltk.download('punkt')

def fetch_webpage_data(url):
    """ Fetch webpage and parse for popular places data """
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # Example: Extract place names from a specific part of the webpage
    places = []
    for item in soup.find_all('h3'):  # assuming places are under <h3> tags
        places.append(item.get_text())

    return places

def recommend_places(user_input, places_data):
    """ Recommend places based on user input using cosine similarity """
    # Using TF-IDF Vectorizer to compare text data
    vectorizer = TfidfVectorizer(stop_words='english')
    tfidf_matrix = vectorizer.fit_transform(places_data)

    user_input_vector = vectorizer.transform([user_input])
    cosine_sim = cosine_similarity(user_input_vector, tfidf_matrix)

    # Get the index of the most similar place
    recommended_index = cosine_sim.argmax()
    return places_data[recommended_index]

def main():
    urls = [
        'https://example.com/popular-places-in-new-york',
        'https://example.com/top-travel-destinations'
    ]
    
    all_places = []
    for url in urls:
        places = fetch_webpage_data(url)
        all_places.extend(places)
    
    # Assuming the user provides a preference or interest for the recommendation
    user_input = input("Enter a location or type of place you're interested in: ")

    recommendation = recommend_places(user_input, all_places)
    
    print(f"Recommended place based on your input: {recommendation}")

if __name__ == "__main__":
    main()
