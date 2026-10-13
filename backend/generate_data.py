import numpy as np
import pandas as pd
import os

def generate_king_county_dataset(output_path: str, num_samples: int = 1500, random_seed: int = 42):
    np.random.seed(random_seed)
    
    zipcodes = [98001, 98004, 98006, 98033, 98039, 98040, 98052, 98074, 98103, 98105, 98112, 98115, 98119, 98122, 98133, 98155]
    zip_multipliers = {
        98039: 2.5, 98004: 2.1, 98040: 1.8, 98033: 1.6, 98112: 1.6,
        98006: 1.4, 98052: 1.35, 98105: 1.3, 98119: 1.25, 98103: 1.2,
        98115: 1.15, 98122: 1.1, 98074: 1.1, 98155: 0.95, 98133: 0.9, 98001: 0.8
    }

    ids = np.random.randint(100000000, 999999999, size=num_samples)
    dates = pd.date_range(start='2014-05-02', end='2015-05-27', periods=num_samples).strftime('%Y%m%dT000000')
    
    bedrooms = np.random.choice([1, 2, 3, 4, 5, 6], size=num_samples, p=[0.05, 0.20, 0.45, 0.22, 0.06, 0.02])
    
    # Bathrooms correlated with bedrooms
    bathrooms = []
    for b in bedrooms:
        base_bath = max(1.0, b * 0.6 + np.random.choice([0, 0.25, 0.5, 0.75, 1.0]))
        bathrooms.append(round(base_bath, 2))
    bathrooms = np.array(bathrooms)
    
    # Sqft living correlated with bedrooms and bathrooms
    sqft_living = bedrooms * 350 + bathrooms * 300 + np.random.normal(500, 300, size=num_samples)
    sqft_living = np.clip(sqft_living, 550, 7500).astype(int)
    
    # Sqft lot
    sqft_lot = sqft_living * np.random.uniform(1.8, 8.0, size=num_samples) + np.random.exponential(3000, size=num_samples)
    sqft_lot = np.clip(sqft_lot, 800, 50000).astype(int)
    
    floors = np.random.choice([1.0, 1.5, 2.0, 2.5, 3.0], size=num_samples, p=[0.45, 0.1, 0.4, 0.02, 0.03])
    
    # Waterfront (rare ~1.5%)
    waterfront = np.random.choice([0, 1], size=num_samples, p=[0.982, 0.018])
    
    # View (0-4)
    view = np.where(waterfront == 1, np.random.choice([3, 4], size=num_samples), np.random.choice([0, 1, 2, 3], size=num_samples, p=[0.88, 0.07, 0.03, 0.02]))
    
    condition = np.random.choice([1, 2, 3, 4, 5], size=num_samples, p=[0.01, 0.05, 0.64, 0.24, 0.06])
    
    # Grade (3-13)
    grade = np.clip(np.round(sqft_living / 400 + np.random.normal(4, 1, size=num_samples)), 4, 12).astype(int)
    
    # Sqft basement & above
    has_basement = np.random.choice([0, 1], size=num_samples, p=[0.6, 0.4])
    sqft_basement = np.where(has_basement == 1, np.round(sqft_living * np.random.uniform(0.2, 0.5, size=num_samples)), 0).astype(int)
    sqft_above = sqft_living - sqft_basement
    
    yr_built = np.random.randint(1900, 2021, size=num_samples)
    
    # Renovation (~10% renovated)
    is_renovated = np.random.choice([0, 1], size=num_samples, p=[0.9, 0.1])
    yr_renovated = np.where(is_renovated == 1, np.random.randint(1985, 2021, size=num_samples), 0)
    
    selected_zipcodes = np.random.choice(zipcodes, size=num_samples)
    
    # Coordinates centered near Seattle / Bellevue / King County
    lats = np.round(np.random.uniform(47.20, 47.77, size=num_samples), 4)
    longs = np.round(np.random.uniform(-122.45, -121.90, size=num_samples), 4)
    
    sqft_living15 = np.clip(sqft_living + np.random.normal(0, 200, size=num_samples), 600, 7000).astype(int)
    sqft_lot15 = np.clip(sqft_lot + np.random.normal(0, 500, size=num_samples), 900, 45000).astype(int)
    
    # Price model formula based on actual King County statistical weights
    base_price = 120000
    price = (
        base_price +
        sqft_living * 210 +
        grade * 42000 +
        bathrooms * 28000 +
        bedrooms * 12000 +
        waterfront * 350000 +
        view * 38000 +
        (condition - 3) * 18000 +
        (yr_built - 1900) * 450 +
        np.where(yr_renovated > 0, 40000, 0)
    )
    
    # Apply zipcode multipliers and realistic log-normal noise
    zip_mults = np.array([zip_multipliers.get(z, 1.0) for z in selected_zipcodes])
    price = price * zip_mults * np.random.lognormal(mean=0, sigma=0.12, size=num_samples)
    price = np.round(price, -2) # round to nearest hundred
    
    df = pd.DataFrame({
        'id': ids,
        'date': dates,
        'price': price,
        'bedrooms': bedrooms,
        'bathrooms': bathrooms,
        'sqft_living': sqft_living,
        'sqft_lot': sqft_lot,
        'floors': floors,
        'waterfront': waterfront,
        'view': view,
        'condition': condition,
        'grade': grade,
        'sqft_above': sqft_above,
        'sqft_basement': sqft_basement,
        'yr_built': yr_built,
        'yr_renovated': yr_renovated,
        'zipcode': selected_zipcodes,
        'lat': lats,
        'long': longs,
        'sqft_living15': sqft_living15,
        'sqft_lot15': sqft_lot15
    })
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"Generated King County dataset with {len(df)} records at: {output_path}")

if __name__ == '__main__':
    generate_king_county_dataset('c:/Users/Akshitha/OneDrive/Desktop/Task2/backend/data/kc_house_data.csv')
