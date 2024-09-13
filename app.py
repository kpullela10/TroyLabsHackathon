import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from flask import Flask, jsonify, request
from flask_cors import CORS
from apscheduler.schedulers.background import BackgroundScheduler

app = Flask(__name__)
CORS(app)

df = pd.DataFrame()
feature_importance = {}
user_segments = {}
retention_rates = {}
top_features = []
conversion_suggestion = ""

def generate_mock_data():
    global df
    np.random.seed(42)  
    n_samples = 1000
    df = pd.DataFrame({
        'Marketplace Usage': np.random.randint(0, 10, n_samples),
        'Chrome Extension Usage': np.random.randint(0, 20, n_samples),
        'Campaigns Created': np.random.randint(0, 5, n_samples),
        'Personalization Level': np.random.randint(1, 6, n_samples),  # 1-5 scale
        'Handwritten Notes Sent': np.random.randint(0, 15, n_samples),
        'converted_to_paid': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),  # 30% conversion rate
        'cohort': pd.date_range(start='2023-01-01', periods=n_samples).strftime('%Y-%m'),
        'is_active': np.random.choice([0, 1], n_samples, p=[0.2, 0.8])  # 80% active rate
    })

def process_data():
    global df, feature_importance, user_segments, retention_rates, top_features, conversion_suggestion
    
    X = df[['Marketplace Usage', 'Chrome Extension Usage', 'Campaigns Created', 
            'Personalization Level', 'Handwritten Notes Sent']]
    y = df['converted_to_paid']
    
    # calculate feature improtane
    model = RandomForestClassifier()
    model.fit(X, y)
    feature_importance = dict(zip(X.columns, model.feature_importances_))
    
    # what features should we focus on?
    top_features = sorted(feature_importance.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # hard-coded suggestion - use openai to interpret results in the future
    top_feature = top_features[0][0]
    conversion_suggestion = f"Based on these insights, we believe that the best way to increase conversions is to focus on improving '{top_feature.replace('_', ' ')}'. "
    conversion_suggestion += f"Additionally, optimizing '{top_features[1][0].replace('_', ' ')}' and '{top_features[2][0].replace('_', ' ')}' could also significantly impact user conversion rates."

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)
    kmeans = KMeans(n_clusters=3)
    df['segment'] = kmeans.fit_predict(X_scaled)
    user_segments = df.groupby('segment')[X.columns].mean().to_dict()
    

    retention_rates = df.groupby('cohort')['is_active'].mean().to_dict()

@app.route('/api/fetch_data', methods=['POST'])
def api_fetch_data():
    api_key = request.json.get('api_key')
    if api_key:
        # i dont have a mixpanel key - so for now ill just use mock data but otherwise i'd retrieve the same info from the site itself
        generate_mock_data()
    else:
        generate_mock_data()
    process_data()
    return jsonify({"message": "Data fetched and processed successfully"})

@app.route('/api/feature_importance')
def get_feature_importance():
    return jsonify(feature_importance)

@app.route('/api/user_segments')
def get_user_segments():
    return jsonify(user_segments)

@app.route('/api/retention_rates')
def get_retention_rates():
    return jsonify(retention_rates)

@app.route('/api/top_features')
def get_top_features():
    return jsonify({
        "top_features": top_features,
        "suggestion": conversion_suggestion
    })

if __name__ == '__main__':
    generate_mock_data() 
    process_data()
    app.run(port=8001, debug=True)