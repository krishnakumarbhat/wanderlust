import requests
import sys
from datetime import datetime
import json

class WanderlustAPITester:
    def __init__(self, base_url="https://ab6c7a8f-8536-4040-a05a-ac0a448759c4.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                    return True, response_data
                except:
                    return True, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    "test": name,
                    "expected": expected_status,
                    "actual": response.status_code,
                    "endpoint": endpoint
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                "test": name,
                "error": str(e),
                "endpoint": endpoint
            })
            return False, {}

    def test_health_endpoint(self):
        """Test health check endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_destinations_endpoint(self):
        """Test destinations endpoint"""
        success, response = self.run_test("Get Destinations", "GET", "api/destinations", 200)
        if success and isinstance(response, dict):
            destinations = response.get('destinations', [])
            print(f"   Found {len(destinations)} destinations")
            if len(destinations) > 0:
                print(f"   First destination: {destinations[0].get('name', 'Unknown')}")
        return success

    def test_recommendations_endpoint(self):
        """Test recommendations endpoint"""
        success, response = self.run_test("Get Recommendations", "GET", "api/recommendations", 200)
        if success and isinstance(response, dict):
            recommendations = response.get('recommendations', [])
            print(f"   Found {len(recommendations)} recommendations")
        return success

    def test_auth_login(self):
        """Test login endpoint"""
        test_data = {
            "email": "test@wanderlust.app",
            "password": "testpassword123"
        }
        success, response = self.run_test("Auth Login", "POST", "api/auth/login", 200, data=test_data)
        if success and isinstance(response, dict):
            self.token = response.get('token')
            user = response.get('user', {})
            print(f"   User: {user.get('username', 'Unknown')} ({user.get('email', 'No email')})")
            print(f"   Token received: {'Yes' if self.token else 'No'}")
        return success

    def test_auth_register(self):
        """Test register endpoint"""
        test_data = {
            "username": f"testuser_{datetime.now().strftime('%H%M%S')}",
            "email": f"test_{datetime.now().strftime('%H%M%S')}@wanderlust.app",
            "password": "testpassword123"
        }
        success, response = self.run_test("Auth Register", "POST", "api/auth/register", 200, data=test_data)
        if success and isinstance(response, dict):
            user = response.get('user', {})
            print(f"   New user: {user.get('username', 'Unknown')} ({user.get('email', 'No email')})")
        return success

    def test_social_feed(self):
        """Test social feed endpoint"""
        success, response = self.run_test("Social Feed", "GET", "api/social/feed", 200)
        if success and isinstance(response, dict):
            feed = response.get('feed', [])
            print(f"   Found {len(feed)} social feed items")
            if len(feed) > 0:
                print(f"   First item: {feed[0].get('user', 'Unknown')} - {feed[0].get('action', 'Unknown action')}")
        return success

def main():
    print("🚀 Starting Wanderlust Mobile Backend API Tests")
    print("=" * 60)
    
    # Initialize tester
    tester = WanderlustAPITester()
    
    # Run all tests
    test_results = []
    
    # Test health endpoint first
    test_results.append(("Health Check", tester.test_health_endpoint()))
    
    # Test destinations endpoints
    test_results.append(("Destinations", tester.test_destinations_endpoint()))
    test_results.append(("Recommendations", tester.test_recommendations_endpoint()))
    
    # Test auth endpoints
    test_results.append(("Login", tester.test_auth_login()))
    test_results.append(("Register", tester.test_auth_register()))
    
    # Test social endpoints
    test_results.append(("Social Feed", tester.test_social_feed()))
    
    # Print summary
    print("\n" + "=" * 60)
    print(f"📊 TEST SUMMARY")
    print(f"Tests Run: {tester.tests_run}")
    print(f"Tests Passed: {tester.tests_passed}")
    print(f"Tests Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests:")
        for failure in tester.failed_tests:
            error_msg = failure.get('error', f"Status {failure.get('actual')} (expected {failure.get('expected')})")
            print(f"   • {failure.get('test')} - {error_msg}")
    
    # Return 0 if all tests passed, 1 if any failed
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())