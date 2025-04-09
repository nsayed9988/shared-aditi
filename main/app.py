from flask import Flask, Blueprint, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import pandas as pd
from tourist_recommender import TouristPlaceRecommender
import os
import requests
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create the main Flask app with primary template and static folders
app = Flask(__name__, 
            template_folder='frontend',  # Primary template folder 
            static_folder='frontend/assets')  # Primary static folder

# Create a Blueprint for Travi Dashboard with its own template and static folders
travi_dash = Blueprint('travi_dash', __name__, 
                       template_folder='travi-dash', 
                       static_folder='travi-dash/assets',  
                       url_prefix='/travi-dash')  

# Define all blueprint routes BEFORE registering the blueprint
@travi_dash.route('/')
def dashboard_home():
    return render_template('budget.html')  # Will look for budget.html in travi-dash folder


@app.route('/about')
def about():
    return render_template('about.html')


@travi_dash.route('/login.html')
def dashboard_login():
    return render_template('login.html')  # Will look for login.html in travi-dash folder

@travi_dash.route('/add-tour.html')
def dashboard_add_tour():
    return render_template('add-tour.html')  # Will look for add-tour.html in travi-dash folder

@travi_dash.route('/assets/<path:filename>')
def dashboard_static(filename):
    return send_from_directory(travi_dash.static_folder, filename)

@app.route('/gallery')
def gallery():
    return render_template('gallery.html')

@app.route('/blog-grid')
def blog_grid():
    return render_template('blog-grid.html')

@app.route('/contact')
def contact():
    return render_template('contact.html')

    
@travi_dash.route('/my-profile.html')
def my_profile():
    return render_template('my-profile.html')

@travi_dash.route('/dashindex.html')
def travi_index():
    return render_template('dashindex.html')

# AFTER all blueprint routes are defined, register the blueprint
app.register_blueprint(travi_dash)  # No need to specify url_prefix again

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

# Main app routes - these will use the primary template folder (frontend)
@app.route('/')
def home():
    return render_template('index.html')  # Looks for Index.html in frontend folder

@app.route('/tour-gridmain')
def tour_grid():
    return render_template('tour-gridmain.html')  # Looks for tour-gridmain.html in frontend folder

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

# Add 404 error handler
@app.errorhandler(404)
def page_not_found(e):
    # Log the error for debugging
    print(f"404 Error: {request.path}")
    return render_template('404.html'), 404  # Create a 404.html template in your frontend folder

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
    app.run(host='0.0.0.0', port=10000)
