import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from typing import List, Dict

class TouristPlaceRecommender:
    def __init__(self, data_path: str = 'dataset1.csv'):
        """
        Initialize the recommender system with ML capabilities.
        """
        # Load dataset
        self.places_data = pd.read_csv(data_path)
        
        # Check if required columns are present
        required_columns = ['place_id', 'country', 'place_name', 'activities', 'description']
        if not all(col in self.places_data.columns for col in required_columns):
            raise ValueError(f"Missing required columns. Expected columns: {required_columns}")
        
        # Initialize TF-IDF vectorizer
        self.tfidf = TfidfVectorizer(stop_words='english')
        
        # Process activities and description
        self.places_data['content'] = (
            self.places_data['activities'].str.lower() + ' ' + 
            self.places_data['description'].str.lower()
        )
        
        # Create TF-IDF matrix
        self.tfidf_matrix = self.tfidf.fit_transform(self.places_data['content'])
        
        # ML Enhancements
        self.user_interactions = {}
        self.preference_model = LogisticRegression(multi_class='ovr', max_iter=1000)
        self.place_features = self.tfidf_matrix
    
    def record_user_interaction(self, user_id: str, place_id: int, liked: bool = True):
        """
        Track user's interaction with a place
        
        Args:
            user_id (str): Unique identifier for user
            place_id (int): ID of the place interacted with
            liked (bool): Whether user liked the place
        """
        if user_id not in self.user_interactions:
            self.user_interactions[user_id] = []
        
        self.user_interactions[user_id].append({
            'place_id': place_id,
            'liked': liked
        })
    
    def train_preference_model(self):
        """
        Train a preference prediction model based on user interactions
        """
        # Prepare training data
        X = []  # Feature matrix
        y = []  # Labels (liked/not liked)
        
        for user_id, interactions in self.user_interactions.items():
            for interaction in interactions:
                place_index = self.places_data[
                    self.places_data['place_id'] == interaction['place_id']
                ].index[0]
                
                X.append(self.place_features[place_index].toarray()[0])
                y.append(1 if interaction['liked'] else 0)
        
        # Only train if we have interactions
        if len(X) > 0:
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            self.preference_model.fit(X_train, y_train)
            print(f"Model Accuracy: {self.preference_model.score(X_test, y_test)}")
    
    def get_recommendations(
        self, 
        country: str, 
        preferred_activities: List[str], 
        num_recommendations: int = 25,
        user_id: str = None
    ) -> List[Dict[str, str]]:
        # Filter places by country first
        country_mask = self.places_data['country'].str.lower() == country.lower()
        
        # Match activities more precisely
        def match_activities(place_activities):
            place_activity_list = place_activities.split('|')
            return any(
                activity in place_activity_list 
                for activity in preferred_activities
            )
        
        # Filter places with matching activities
        country_places = self.places_data[country_mask]
        filtered_places = country_places[country_places['activities'].apply(match_activities)]
        
        if len(filtered_places) == 0:
            return []
        
        # Prepare the TF-IDF matrix for filtered places
        filtered_indices = filtered_places.index
        filtered_tfidf = self.tfidf_matrix[filtered_indices]
        
        # Create activity query string and transform
        activity_query = ' '.join(preferred_activities)
        query_vector = self.tfidf.transform([activity_query])
        
        # Calculate initial similarity scores
        similarity_scores = cosine_similarity(query_vector, filtered_tfidf)[0]
        
        # If user has interaction history and model is trained, adjust recommendations
        if user_id and user_id in self.user_interactions and hasattr(self.preference_model, 'predict_proba'):
            try:
                # Predict preference probabilities
                preference_scores = self.preference_model.predict_proba(filtered_tfidf)[:, 1]
                
                # Combine similarity and preference scores
                combined_scores = 0.7 * similarity_scores + 0.3 * preference_scores
                top_indices = np.argsort(combined_scores)[-num_recommendations:][::-1]
            except:
                # Fallback to original scoring if model prediction fails
                top_indices = np.argsort(similarity_scores)[-num_recommendations:][::-1]
        else:
            # Original recommendation logic
            top_indices = np.argsort(similarity_scores)[-num_recommendations:][::-1]
        
        # Prepare recommendations
        recommendations = []
        for idx in filtered_indices[top_indices]:
            place = self.places_data.loc[idx]
            recommendations.append({
                'place_id': int(place['place_id']),
                'place_name': place['place_name'],
                'activities': place['activities'].split('|'),
                'description': place['description'],
                'similarity_score': 1.0  # Placeholder, could be enhanced
            })
        
        return recommendations

    def add_new_place(
        self,
        country: str,
        place_name: str,
        activities: List[str],
        description: str
    ) -> None:
        """Add a new place to the dataset and update TF-IDF matrix"""
        new_place = pd.DataFrame({
            'place_id': [self.places_data['place_id'].max() + 1],
            'country': [country],
            'place_name': [place_name],
            'activities': [','.join(activities)],
            'description': [description]
        })
        
        # Add content field
        new_place['content'] = (
            new_place['activities'].str.lower() + ' ' + 
            new_place['description'].str.lower()
        )
        
        # Update dataset
        self.places_data = pd.concat([self.places_data, new_place], ignore_index=True)
        
        # Recompute TF-IDF matrix
        self.tfidf_matrix = self.tfidf.fit_transform(self.places_data['content'])