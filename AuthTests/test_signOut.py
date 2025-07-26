import requests

# API Gateway URL for sign out endpoint
API_URL = 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signOut'

def test_case(description, payload):
    print(f"\n=== Test: {description} ===")
    try:
        response = requests.post(API_URL, json=payload)
        print("Status Code:", response.status_code)
        print("Response Body:", response.json())
    except Exception as e:
        print("Request failed:", str(e))

def main():
    # 1. Successful sign out with valid access token
    test_case("Successful Sign Out", {
        "accessToken": "dVbVVUSXpGeDZXZGIyNXVjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MTAzOGQ4YS05MDgxLTcwNDEtOTMzYy1kMGE0M2I0NTA3NzgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xXzJBVXNjcHJjSiIsImNsaWVudF9pZCI6IjJrdjdlZmttaG1tbzN1bzBtMnRoNGdoMGRnIiwib3JpZ2luX2p0aSI6ImFlMmU1MTRkLTFmZTAtNGQwNi1iM2Y5LTFkY2NkZTIwYzZmNCIsImV2ZW50X2lkIjoiMjQwN2RlNjctNWY0Yy00ODM3LThhNGUtYmY0ODU3OGZjMjcwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc1MzM2NTM5NiwiZXhwIjoxNzUzMzY4OTk2LCJpYXQiOjE3NTMzNjUzOTYsImp0aSI6IjZkYWZjZDk2LTQwYmYtNGM2MS1hMTEzLTNlOTk1MmEwYjk0NiIsInVzZXJuYW1lIjoia2F2aW5keWFfMDIifQ.cmxhSz1oahJf6fyNOXrD9zlWZXrnODq_Zp35SeZ_1-wEixYr5EITkvpcrKzif0qUDT4pOdoeZhWI3mwS23xjgC4ieSdwlkmcvLllEWT6Jw1LOWvkxcvt3wFbE-UdT5uhptrnrlJfxpE6U59lXD4CZFSShZn0W8lWynYMjN21SxFjh2Q7ytSrO1T2-69Mav9yJzcNZag81BMdTZDsxanUA248zQsen6JcquYZs6HaiiaM7v1rggu8Qpo6LAKEd96JFfKc5jU_NcQSPdYQZdr-KBXSSZ4nN-fbvsyvsFlR8F4hRtuRjQugSuMb2zFOvLBprJvQ-bKRirWv5EOv3RRiiw" 
    })

    # 2. Missing access token
    test_case("Missing Access Token", {})

    # 3. Empty access token
    test_case("Empty Access Token", {
        "accessToken": ""
    })

    # 4. Invalid/malformed access token
    test_case("Invalid Access Token", {
        "accessToken": "ZXZGIyNXVjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MTAzOGQ4YS05MDgxLTcwNDEtOTMzYy1kMGE0M2I0NTA3NzgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xXzJBVXNjcHJjSiIsImNsaWVudF9pZCI6IjJrdjdlZmttaG1tbzN1bzBtMnRoNGdoMGRnIiwib3JpZ2luX2p0aSI6ImNjYjRhY2MxLWI4MDEtNDdiYy05MzdiLTA4MzY5NzViZjUxZiIsImV2ZW50X2lkIjoiMmRiOGFkMzMtN2Y2Ny00ZjA2LThhNzctNDhmNTZlZjJiNjMxIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc1MzM2NTMwMSwiZXhwIjoxNzUzMzY4OTAxLCJpYXQiOjE3NTMzNjUzMDEsImp0aSI6Ijc4N2JjZjc3LTBkNjUtNDFmNC05M2EyLTcwMTJlZWY3NTZhNCIsInVzZXJuYW1lIjoia2F2aW5keWFfMDIifQ.muXxGoiVOxiuctngsx2K0uJBeNqqGsdLt72085CF9p1aY_JfCnDlryk9R-txRVjGgBWcN4GFW4QjKu2vdctHyuLo0u2dUVRK0vze43G_tj3kce8amPozsIHn3HYFGExDbS4C5gRd93g15K9z2vD6HKnTNSXYXVw3G48P87e79hIb9hYiLEJHPkUuS_eiCUNOc0s8zL4maXi79zJCp2HuN4dNJMrMkjznB3QJcWEfOrQ2Fy4GFoyLoIqmP-ZI1bny6bSEjZdh1cakzmjHz0CRBIIiH8rIEXYo5lsQjyePliT5t4fLG7v82T1cU4k_tVN1brMYJaIXGges8NQbgVMYpw"
    })

    # 5. Expired access token
    test_case("Expired Access Token", {
        "accessToken": "eyJraWQiOiJoZEd6aXk2aXJuZks0VXlmdktYT3FiRWVOQmdVbVVUSXpGeDZXZGIyNXVjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MTAzOGQ4YS05MDgxLTcwNDEtOTMzYy1kMGE0M2I0NTA3NzgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xXzJBVXNjcHJjSiIsImNsaWVudF9pZCI6IjJrdjdlZmttaG1tbzN1bzBtMnRoNGdoMGRnIiwib3JpZ2luX2p0aSI6ImNjYjRhY2MxLWI4MDEtNDdiYy05MzdiLTA4MzY5NzViZjUxZiIsImV2ZW50X2lkIjoiMmRiOGFkMzMtN2Y2Ny00ZjA2LThhNzctNDhmNTZlZjJiNjMxIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc1MzM2NTMwMSwiZXhwIjoxNzUzMzY4OTAxLCJpYXQiOjE3NTMzNjUzMDEsImp0aSI6Ijc4N2JjZjc3LTBkNjUtNDFmNC05M2EyLTcwMTJlZWY3NTZhNCIsInVzZXJuYW1lIjoia2F2aW5keWFfMDIifQ.muXxGoiVOxiuctngsx2K0uJBeNqqGsdLt72085CF9p1aY_JfCnDlryk9R-txRVjGgBWcN4GFW4QjKu2vdctHyuLo0u2dUVRK0vze43G_tj3kce8amPozsIHn3HYFGExDbS4C5gRd93g15K9z2vD6HKnTNSXYXVw3G48P87e79hIb9hYiLEJHPkUuS_eiCUNOc0s8zL4maXi79zJCp2HuN4dNJMrMkjznB3QJcWEfOrQ2Fy4GFoyLoIqmP-ZI1bny6bSEjZdh1cakzmjHz0CRBIIiH8rIEXYo5lsQjyePliT5t4fLG7v82T1cU4k_tVN1brMYJaIXGges8NQbgVMYpw"
    })

    # 6. Valid format but non-existent token
    # test_case("Non-existent Valid Format Token", {
    #     "accessToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IlJTMjU2In0"
    # })

def test_with_dynamic_token():
    """
    Helper function to test sign out with dynamically obtained access token
    Through a successful sign-in first
    """
    print("\n=== Dynamic Test: Sign In then Sign Out ===")
    
    # First, sign in to get a valid access token
    signin_url = 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn'
    signin_payload = {
        "username": "suwan_02",
        "password": "Suwan@123"
    }
    
    try:
        # Get access token from sign in
        signin_response = requests.post(signin_url, json=signin_payload)
        if signin_response.status_code == 200:
            signin_data = signin_response.json()
            access_token = signin_data['tokens']['accessToken']
            print("Sign-in successful, got access token")
            
            # Now test sign out with the valid token
            test_case("Sign Out with Fresh Token", {
                "accessToken": access_token
            })
        else:
            print("Sign-in failed, cannot test with fresh token")
            print("Sign-in response:", signin_response.json())
            
    except Exception as e:
        print("Dynamic test failed:", str(e))

if __name__ == "__main__":
    print("=== SIGN OUT LAMBDA FUNCTION TESTS ===")
    
    # Basic tests
    main()
    
    # Dynamic test
    test_with_dynamic_token()