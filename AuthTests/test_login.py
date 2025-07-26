import requests

# API Gateway URL
API_URL = 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn'

def test_case(description, payload):
    print(f"\n=== Test: {description} ===")
    try:
        response = requests.post(API_URL, json=payload)
        print("Status Code:", response.status_code)
        print("Response Body:", response.json())
    except Exception as e:
        print("Request failed:", str(e))

def main():
    # 1. Valid login
    test_case("Successful Login", {
        "username": "kela_02",
        "password": "Kels@123"
    })

    # 2. Missing username
    test_case("Missing Username", {
        "password": "Kelci@237"
    })

    # 3. Missing password
    test_case("Missing Password", {
        "username": "kela_02"
    })

    # 4. Wrong password
    test_case("Incorrect Password", {
        "username": "kela_02",
        "password": "WrongPassword"
    })

    # 5. Unconfirmed user
    test_case("Unconfirmed User", {
        "username": "keerthi_06",
        "password": "Keerthi@007"
    })

    # 6. Nonexistent user
    test_case("User Does Not Exist", {
        "username": "GhostUser123",
        "password": "Password123"
    })

if __name__ == "__main__":
    main()
