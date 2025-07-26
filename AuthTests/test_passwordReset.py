import requests

# API Gateway URL for password reset endpoint
API_URL = 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/mobile/passwordReset'

def test_case(description, payload):
    print(f"\n=== Test: {description} ===")
    try:
        response = requests.post(API_URL, json=payload)
        print("Status Code:", response.status_code)
        print("Response Body:", response.json())
    except Exception as e:
        print("Request failed:", str(e))

def main():
    valid_access_token = "eyJraWQiOiJSUzI1NiIsImFsZyI6IlJTMjU2In0..."
    
    # 1. Successful password change
    test_case("Successful Password Change", {
        "previous_password": "Kavin@123",
        "new_password": "NewKavin@123",
        "access_token": valid_access_token
    })

    # 2. Missing previous password
    test_case("Missing Previous Password", {
        "new_password": "NewKavin@123",
        "access_token": valid_access_token
    })

    # 3. Missing new password
    test_case("Missing New Password", {
        "previous_password": "Kavin@123",
        "access_token": valid_access_token
    })

    # 4. Missing access token
    test_case("Missing Access Token", {
        "previous_password": "Kavin@123",
        "new_password": "NewKavin@123"
    })

    # 5. Empty previous password
    test_case("Empty Previous Password", {
        "previous_password": "",
        "new_password": "NewKavin@123",
        "access_token": valid_access_token
    })

    # 6. Empty new password
    test_case("Empty New Password", {
        "previous_password": "Kavin@123",
        "new_password": "",
        "access_token": valid_access_token
    })

    # 7. Empty access token
    test_case("Empty Access Token", {
        "previous_password": "Kavin@123",
        "new_password": "NewKavin@123",
        "access_token": ""
    })

    # 8. Wrong previous password
    test_case("Incorrect Previous Password", {
        "previous_password": "WrongPassword@123",
        "new_password": "NewKavin@123",
        "access_token": valid_access_token
    })

    # 9. Invalid new password
    test_case("Invalid New Password - Doesn't match policy", {
        "previous_password": "Kavin@123",
        "new_password": "123",  # Too short, no special chars, etc.
        "access_token": valid_access_token
    })

    # 10. Invalid new password (same as current)
    test_case("Invalid New Password - Same as Current", {
        "previous_password": "Kavin@123",
        "new_password": "Kavin@123",  # Same as previous
        "access_token": valid_access_token
    })

    # 11. Invalid access token
    test_case("Invalid Access Token", {
        "previous_password": "Kavin@123",
        "new_password": "NewKavin@123",
        "access_token": "invalid.token"
    })

    # 12. Expired access token
    test_case("Expired Access Token", {
        "previous_password": "Kavin@123",
        "new_password": "NewKavin@123",
        "access_token": "eyJraWQiOiJoZEd6aXk2aXJuZks0VXlmdktYT3FiRWVOQmdVbVVUSXpGeDZXZGIyNXVjPSIsImFsZyI6IlJTMjU2In0.eyJzdWIiOiI4MTAzOGQ4YS05MDgxLTcwNDEtOTMzYy1kMGE0M2I0NTA3NzgiLCJpc3MiOiJodHRwczpcL1wvY29nbml0by1pZHAuYXAtc291dGgtMS5hbWF6b25hd3MuY29tXC9hcC1zb3V0aC0xXzJBVXNjcHJjSiIsImNsaWVudF9pZCI6IjJrdjdlZmttaG1tbzN1bzBtMnRoNGdoMGRnIiwib3JpZ2luX2p0aSI6ImFlMmU1MTRkLTFmZTAtNGQwNi1iM2Y5LTFkY2NkZTIwYzZmNCIsImV2ZW50X2lkIjoiMjQwN2RlNjctNWY0Yy00ODM3LThhNGUtYmY0ODU3OGZjMjcwIiwidG9rZW5fdXNlIjoiYWNjZXNzIiwic2NvcGUiOiJhd3MuY29nbml0by5zaWduaW4udXNlci5hZG1pbiIsImF1dGhfdGltZSI6MTc1MzM2NTM5NiwiZXhwIjoxNzUzMzY4OTk2LCJpYXQiOjE3NTMzNjUzOTYsImp0aSI6IjZkYWZjZDk2LTQwYmYtNGM2MS1hMTEzLTNlOTk1MmEwYjk0NiIsInVzZXJuYW1lIjoia2F2aW5keWFfMDIifQ.cmxhSz1oahJf6fyNOXrD9zlWZXrnODq_Zp35SeZ_1-wEixYr5EITkvpcrKzif0qUDT4pOdoeZhWI3mwS23xjgC4ieSdwlkmcvLllEWT6Jw1LOWvkxcvt3wFbE-UdT5uhptrnrlJfxpE6U59lXD4CZFSShZn0W8lWynYMjN21SxFjh2Q7ytSrO1T2-69Mav9yJzcNZag81BMdTZDsxanUA248zQsen6JcquYZs6HaiiaM7v1rggu8Qpo6LAKEd96JFfKc5jU_NcQSPdYQZdr-KBXSSZ4nN-fbvsyvsFlR8F4hRtuRjQugSuMb2zFOvLBprJvQ-bKRirWv5EOv3RRiiw"
    })

def test_password_policy_violations():
    """
    Test various password policy violations
    Adjust these based on your Cognito user pool password policy
    """
    print("\n\n=== PASSWORD POLICY VIOLATION TESTS ===")
    
    valid_access_token = "eyJraWQiOiJSUzI1NiIsImFsZyI6IlJTMjU2In0..."
    
    # Test different password policy violations
    policy_tests = [
        ("Too Short Password", "123"),
        ("No Uppercase", "kavin@123"),
        ("No Lowercase", "KAVIN@123"),
        ("No Numbers", "Kavin@abc"),
        ("No Special Characters", "Kavin123"),
        ("Too Common Password", "Password123"),
        ("Contains Username", "kavindya123"),  # If username is part of password policy
    ]
    
    for description, weak_password in policy_tests:
        test_case(f"Password Policy - {description}", {
            "previous_password": "Kavin@123",
            "new_password": weak_password,
            "access_token": valid_access_token
        })

def test_with_dynamic_token():
    """
    Helper function to test password reset with dynamically obtained access token
    Through a successful sign-in first
    """
    print("\n\n=== DYNAMIC TEST: Sign In then Password Reset ===")
    
    # First, sign in to get a valid access token
    signin_url = 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn'
    signin_payload = {
        "username": "kela_02",
        "password": "Kavin@123"
    }
    
    try:
        # Get access token from sign in
        signin_response = requests.post(signin_url, json=signin_payload)
        if signin_response.status_code == 200:
            signin_data = signin_response.json()
            access_token = signin_data['tokens']['accessToken']
            print("Sign-in successful, got access token")
            
            # Test password change with fresh token
            test_case("Password Reset with Fresh Token", {
                "previous_password": "Kavin@123",
                "new_password": "TempNewKavin@123",
                "access_token": access_token
            })
            
            # If the password change was successful, change it back
            test_case("Change Password Back", {
                "previous_password": "TempNewKavin@123",
                "new_password": "Kavin@123",
                "access_token": access_token
            })
            
        else:
            print("Sign-in failed, cannot test with fresh token")
            print("Sign-in response:", signin_response.json())
            
    except Exception as e:
        print("Dynamic test failed:", str(e))

def test_sequential_operations():
    """
    Test sequential password changes to verify token validity after password change
    """
    print("\n\n=== SEQUENTIAL OPERATIONS TEST ===")
    
    # This would test if the access token remains valid after password change
    # and test multiple password changes in sequence
    
    signin_url = 'https://uqzl6jyqvg.execute-api.ap-south-1.amazonaws.com/dev/signIn'
    signin_payload = {
        "username": "kela_02",
        "password": "Kavin@123"
    }
    
    try:
        signin_response = requests.post(signin_url, json=signin_payload)
        if signin_response.status_code == 200:
            signin_data = signin_response.json()
            access_token = signin_data['tokens']['accessToken']
            
            # First password change
            test_case("First Password Change", {
                "previous_password": "Kavin@123",
                "new_password": "Temp1@123",
                "access_token": access_token
            })
            
            # Try to use same token for second password change
            test_case("Second Password Change (Same Token)", {
                "previous_password": "Temp1@123",
                "new_password": "Temp2@123",
                "access_token": access_token
            })
            
            # Change back to original
            test_case("Change Back to Original", {
                "previous_password": "Temp2@123",
                "new_password": "Kavin@123",
                "access_token": access_token
            })
            
    except Exception as e:
        print("Sequential operations test failed:", str(e))

if __name__ == "__main__":
    print("=== PASSWORD RESET LAMBDA FUNCTION TESTS ===")
    
    # Run basic tests
    main()
    
    # Run password policy tests
    test_password_policy_violations()
    
    # Run dynamic test
    test_with_dynamic_token()
    
    # Run sequential operations test
    test_sequential_operations()