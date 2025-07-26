import json
import boto3
import os

# Initialize the Cognito client
client = boto3.client('cognito-idp')

USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')

def lambda_handler(event, context):
    # Parse the incoming JSON body
    print("Received event: " + json.dumps(event))

    # Extract parameters
    username = event.get('username')
    tempPWD = event.get('tempPWD')
    
    if not username:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Username is required',
                'code': 'InvalidParameterException'
            })
        }

    try:
        # Reset the user's password
        response = client.admin_set_user_password(
            UserPoolId=USER_POOL_ID,
            Username=username,
            Password=tempPWD,
            Permanent=False  # Forces password change on next login
        )
        print("Response:", response)
        
        print("Password reset requested successfully for user:", username)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Password reset successful.',
                'username': username
            })
        }
        
    except client.exceptions.UserNotFoundException:
        print(f"User not found: {username}")
        return {
            'statusCode': 404,
            'body': json.dumps({
                'success': False,
                'message': 'User not found',
                'code': 'UserNotFoundException'
            })
        }
        
    except client.exceptions.InvalidParameterException as e:
        print(f"Invalid parameter: {str(e)}")
        return {
            'statusCode': 401,
            'body': json.dumps({
                'success': False,
                'message': str(e),
                'code': 'InvalidParameterException'
            })
        }
        
    except client.exceptions.LimitExceededException as e:
        print(f"Limit exceeded: {str(e)}")
        return {
            'statusCode': 429,
            'body': json.dumps({
                'success': False,
                'message': 'Too many requests. Please try again later.',
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
                'code': 'UnknownError',
                'error': str(e)
            })
        }