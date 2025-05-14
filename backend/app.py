from flask import Flask, request, jsonify
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
import time
from flask_cors import CORS

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Static location list (could be dynamic, but for MVP keep it fixed)
LOCATIONS = ["Sydney", "Melbourne", "Brisbane", "Adelaide", "Perth"]

@app.route("/api/locations", methods=["GET"])
def get_locations():
    return jsonify(LOCATIONS)

@app.route("/api/events", methods=["GET"])
def get_events():
    city = request.args.get("city")
    if not city:
        return jsonify({"error": "City not provided"}), 400

    city_formatted = city.lower().replace(" ", "-")
    url = f"https://www.eventbrite.com.au/d/australia--{city_formatted}/all-events/"

    options = Options()
    options.add_argument("--headless")
    options.add_argument("--disable-gpu")
    options.add_argument("--no-sandbox")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=options)

    try:
        driver.get(url)
        time.sleep(5)  # Allow time for the page to load fully

        events = []
        cards = driver.find_elements(By.CSS_SELECTOR, 'section.event-card-details')[:10]  # Limit to 10 events

        for card in cards:
            try:
                # Extract event title (h3 tag)
                title_elem = card.find_element(By.CSS_SELECTOR, "a.event-card-link h3")
                # Extract event date (p tag)
                date_elem = card.find_element(By.CSS_SELECTOR, "p.Typography_root__487rx.Typography_body-md__487rx.event-card__clamp-line--one")
                # Extract event location (p tag)
                location_elem = card.find_element(By.CSS_SELECTOR, "p.Typography_root__487rx.Typography_body-md__487rx.event-card__clamp-line--one + p")
                # Extract event URL (from the anchor tag)
                link_elem = card.find_element(By.CSS_SELECTOR, "a.event-card-link")

                events.append({
                    "title": title_elem.text.strip(),
                    "date": date_elem.text.strip() if date_elem else "TBA",
                    "location": location_elem.text.strip() if location_elem else "TBA",
                    "url": link_elem.get_attribute("href")
                })
            except Exception as e:
                print(f"Error parsing card: {e}")

        print(f"Found {len(events)} events for {city}")
        return jsonify(events)

    except Exception as e:
        print("Selenium error:", e)
        return jsonify([]), 500

    finally:
        driver.quit()
        
if __name__ == "__main__":
    app.run(debug=True)
