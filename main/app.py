from flask import Flask, request, jsonify, render_template
from flask_cors import CORS
import pandas as pd
from tourist_recommender import TouristPlaceRecommender
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()



app = Flask(__name__, 
            template_folder='frontend',  # Point to your frontend directory
            static_folder='frontend/assets')    # Static files are also in frontend
CORS(app)

# Google Custom Search API configuration
GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY')
GOOGLE_CX = os.getenv('GOOGLE_CX')  # Custom Search Engine ID
GOOGLE_SEARCH_API_URL = 'https://www.googleapis.com/customsearch/v1'

# Debug print to verify keys are loaded (remove in production)
print(f"Google API Key loaded: {'Yes' if GOOGLE_API_KEY else 'No'}")
print(f"Google CX loaded: {'Yes' if GOOGLE_CX else 'No'}")

# Initialize the recommender with the dataset
def initialize_recommender():
    recommender = TouristPlaceRecommender(data_path='dataset1.csv')
    return recommender

# Initialize the recommender
recommender = initialize_recommender()


@app.route('/')
def home():
    return render_template('index-2.html')  # Updated to match your main index file

@app.route('/tour-gridmain')
def tour_grid():
    return render_template('tour-gridmain.html')

# Add routes for all your other HTML files
@app.route('/tour-detail')
def tour_detail():
    return render_template('tour-detail.html')

@app.route('/review')
def review():
    return render_template('review.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.route('/terms')
def terms():
    return render_template('term.html')


 # Add travi-dash separately

@app.route('/travi-dash/login')
def travi_dash_login():
    return render_template('login.html')

if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, render_template

app = Flask(__name__)


def fetch_image_for_place(place_name, country):
    """
    Fetch a high-quality image from Google Custom Search API for a tourist place.
    """
    if not GOOGLE_API_KEY or not GOOGLE_CX:
        print("Warning: Google API key or CX not found. Images will not be fetched.")
        return None

    try:
        # Make the query more specific
        query = f'"{place_name}" {country} travel destination HD'

        print(f"Fetching image for query: {query}")

        # Make request to Google Custom Search API
        response = requests.get(
            GOOGLE_SEARCH_API_URL,
            params={
                'q': query,
                'cx': GOOGLE_CX,
                'key': GOOGLE_API_KEY,
                'searchType': 'image',
                'num': 5,  # Fetch more images to select the best one
                'imgSize': 'huge',  # Request high-quality images
                'imgType': 'photo',  # Filter out clipart or drawings
                'safe': 'active'
            }
        )

        print(f"Google API response status: {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            best_image = None
            best_resolution = 0

            for item in data.get('items', []):
                image_info = item.get('image', {})
                width = image_info.get('width', 0)
                height = image_info.get('height', 0)
                resolution = width * height  # Calculate image resolution

                # Skip low-resolution images
                if resolution > best_resolution:
                    best_resolution = resolution
                    best_image = item

            if best_image:
                image_data = {
                    'url': best_image['link'],
                    'small_url': best_image.get('image', {}).get('thumbnailLink', best_image['link']),
                    'thumb_url': best_image.get('image', {}).get('thumbnailLink', best_image['link']),
                    'alt_description': best_image.get('title', f"Image of {place_name}"),
                    'source_name': best_image.get('displayLink', 'Google Search'),
                    'source_url': best_image.get('image', {}).get('contextLink', '')
                }
                return image_data

            else:
                print(f"No high-quality image results found for {query}")

        else:
            print(f"Error response from Google API: {response.text}")

        return None
    except Exception as e:
        print(f"Error fetching image: {str(e)}")
        return None


@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    try:
        data = request.json
        country = data.get('country')
        activities = data.get('activities', [])
        
        if not country or not activities:
            return jsonify({'error': 'Missing country or activities'}), 400
        
        print(f"Fetching recommendations for country: {country}, activities: {activities}")
        
        # Get recommendations first
        recommendations = recommender.get_recommendations(
            country=country,
            preferred_activities=activities,
            num_recommendations=25
        )
        
        if not recommendations:
            print(f"No recommendations found for {country} with activities {activities}")
            return jsonify({
                'status': 'success',
                'recommendations': []
            })
        
        print(f"Found {len(recommendations)} recommendations")
        
        # Enhance recommendations with images - but don't fail if image fetching fails
        for recommendation in recommendations:
            place_name = recommendation['place_name']
            try:
                image_data = fetch_image_for_place(place_name, country)
                if image_data:
                    recommendation['image'] = image_data
                else:
                    recommendation['image'] = None  # Explicitly set to None if no image
            except Exception as img_error:
                print(f"Error adding image for {place_name}: {str(img_error)}")
                recommendation['image'] = None  # Set to None if there's an error
        
        return jsonify({
            'status': 'success',
            'recommendations': recommendations
        })
    except Exception as e:
        print(f"Error in recommendations endpoint: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/countries', methods=['GET'])
def get_countries():
    try:
        countries = recommender.places_data['country'].unique().tolist()
        return jsonify({
            'status': 'success',
            'countries': countries
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/activities', methods=['GET'])
def get_activities():
    try:
        # Get all unique activities
        all_activities = []
        for activities_str in recommender.places_data['activities']:
            activities_list = activities_str.split('|')
            all_activities.extend(activities_list)
        unique_activities = list(set(all_activities))
        return jsonify({
            'status': 'success',
            'activities': unique_activities
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/record_interaction', methods=['POST'])
def record_interaction():
    """
    Record user interactions with places to improve recommendations
    """
    try:
        data = request.json
        user_id = data.get('user_id', 'anonymous')
        place_id = data.get('place_id')
        liked = data.get('liked', True)
        
        if not place_id:
            return jsonify({'error': 'Place ID is required'}), 400
            
        recommender.record_user_interaction(user_id, place_id, liked)
        return jsonify({
            'status': 'success',
            'message': 'Interaction recorded'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/train_model', methods=['POST'])
def train_model():
    """
    Manually trigger model training
    """
    try:
        recommender.train_preference_model()
        return jsonify({
            'status': 'success',
            'message': 'Model trained successfully'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)