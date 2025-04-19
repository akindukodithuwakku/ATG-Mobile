import json
import boto3
import os

# Initialize the Cognito client
client = boto3.client('cognito-idp')

CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

def lambda_handler(event, context):
    # Parse the incoming event
    print("Received event: " + json.dumps(event))
    
    # Extract parameters from the event
    username = event.get('username')
    confirmation_code = event.get('code')
    new_password = event.get('password')
    
    if not username or not confirmation_code or not new_password:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Username, confirmation code, and new password are required',
                'code': 'InvalidParameterException'
            })
        }
    
    try:
        # Confirm the forgot password flow with the verification code and new password
        response = client.confirm_forgot_password(
            ClientId=CLIENT_ID,
            Username=username,
            ConfirmationCode=confirmation_code,
            Password=new_password
        )
        print(f"Confirm forgot response: {response}")
        
        print(f"Password reset confirmed for user: {username}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Password reset successful'
            })
        }
        
    except client.exceptions.CodeMismatchException:
        print("Invalid verification code")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Invalid verification code',
                'code': 'CodeMismatchException'
            })
        }
    except client.exceptions.ExpiredCodeException:
        print("Expired verification code")
        return {
            'statusCode': 410,
            'body': json.dumps({
                'success': False,
                'message': 'Verification code has expired. Please request a new one.',
                'code': 'ExpiredCodeException'
            })
        }
    except client.exceptions.LimitExceededException:
        print("Rate limit exceeded")
        return {
            'statusCode': 429,
            'body': json.dumps({
                'success': False,
                'message': 'Too many attempts. Please try again later.',
                'code': 'LimitExceededException'
            })
        }
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'message': 'An unexpected error occurred',
                'code': 'UnknownError'
            })
        }