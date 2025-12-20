import requests
import sys
from datetime import datetime

class FitnessProAPITester:
    def __init__(self, base_url="https://fitness-coach-146.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {response_data}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Error: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health endpoint"""
        return self.run_test("Health Check", "GET", "api/health", 200)

    def test_login_student(self):
        """Test student login"""
        success, response = self.run_test(
            "Student Login",
            "POST",
            "api/auth/login",
            200,
            data={
                "email": "maria@test.com",
                "senha": "teste123",
                "tipo": "aluno"
            }
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['usuario']['id']
            print(f"   Token obtained: {self.token[:20]}...")
            print(f"   User ID: {self.user_id}")
            return True
        return False

    def test_get_current_user(self):
        """Test getting current user info"""
        return self.run_test("Get Current User", "GET", "api/usuarios/me", 200)

    def test_update_user_profile(self):
        """Test updating user profile (name and avatar)"""
        if not self.user_id:
            print("❌ No user ID available for profile update test")
            return False
            
        update_data = {
            "nome": "Maria Silva Updated",
            "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        }
        
        success, response = self.run_test(
            "Update User Profile",
            "PUT",
            f"api/usuarios/{self.user_id}",
            200,
            data=update_data
        )
        
        if success and response.get('nome') == update_data['nome']:
            print("   ✅ Name update verified")
            return True
        return False

    def test_get_user_by_id(self):
        """Test getting user by ID"""
        if not self.user_id:
            print("❌ No user ID available for get user test")
            return False
            
        return self.run_test("Get User by ID", "GET", f"api/usuarios/{self.user_id}", 200)

    def test_unauthorized_access(self):
        """Test unauthorized access without token"""
        # Temporarily remove token
        temp_token = self.token
        self.token = None
        
        success, _ = self.run_test("Unauthorized Access", "GET", "api/usuarios/me", 401)
        
        # Restore token
        self.token = temp_token
        return success

    def test_invalid_user_update(self):
        """Test updating non-existent user"""
        return self.run_test(
            "Update Invalid User",
            "PUT",
            "api/usuarios/invalid_id",
            404,
            data={"nome": "Test"}
        )

def main():
    print("🚀 Starting FitnessPro API Tests")
    print("=" * 50)
    
    tester = FitnessProAPITester()
    
    # Test sequence
    tests = [
        ("Health Check", tester.test_health_check),
        ("Student Login", tester.test_login_student),
        ("Get Current User", tester.test_get_current_user),
        ("Update User Profile", tester.test_update_user_profile),
        ("Get User by ID", tester.test_get_user_by_id),
        ("Unauthorized Access", tester.test_unauthorized_access),
        ("Invalid User Update", tester.test_invalid_user_update),
    ]
    
    failed_tests = []
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                failed_tests.append(test_name)
        except Exception as e:
            print(f"❌ {test_name} - Exception: {str(e)}")
            failed_tests.append(test_name)
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {len(failed_tests)}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    if failed_tests:
        print(f"\n❌ Failed tests: {', '.join(failed_tests)}")
        return 1
    else:
        print("\n✅ All tests passed!")
        return 0

if __name__ == "__main__":
    sys.exit(main())