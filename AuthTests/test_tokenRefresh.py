import requests

# API Gateway URL for token refresh endpoint
API_URL = 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/mobile/refreshToken'

def test_case(description, payload):
    print(f"\n=== Test: {description} ===")
    try:
        response = requests.post(API_URL, json=payload)
        print("Status Code:", response.status_code)
        print("Response Body:", response.json())
    except Exception as e:
        print("Request failed:", str(e))

def main():
    valid_refresh_token = "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ..."
    
    # 1. Successful token refresh
    test_case("Successful Token Refresh", {
        "refreshToken": valid_refresh_token
    })

    # 2. Missing refresh token
    test_case("Missing Refresh Token", {})

    # 3. Empty refresh token
    test_case("Empty Refresh Token", {
        "refreshToken": ""
    })

    # 4. Null refresh token
    test_case("Null Refresh Token", {
        "refreshToken": None
    })

    # 5. Invalid refresh token format
    test_case("Invalid Refresh Token Format", {
        "refreshToken": "invalid.token"
    })

    # 6. Malformed refresh token
    test_case("Malformed Refresh Token", {
        "refreshToken": "not_a_valid_token"
    })

    # 7. Expired refresh token
    test_case("Expired Refresh Token", {
        "refreshToken": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ"
    })

    # 8. Revoked refresh token
    test_case("Revoked Refresh Token", {
        "refreshToken": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ"
    })

    # 9. Refresh token from different user pool
    test_case("Wrong User Pool Refresh Token", {
        "refreshToken": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ"
    })

    # 10. Refresh token with valid format but non-existent
    test_case("Non-existent Valid Format Token", {
        "refreshToken": "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9"
    })

if __name__ == "__main__":
    print("=== TOKEN REFRESH LAMBDA FUNCTION TESTS ===")
    
    main()