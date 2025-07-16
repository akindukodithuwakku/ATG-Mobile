import json
import boto3
import os

# Initialize the Cognito client
client = boto3.client('cognito-idp')

CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')
USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')

def lambda_handler(event, context):
    # Parse the incoming event
    print("Received event: " + json.dumps(event))
    
    # Extract username from the event
    username = event.get('username')
    
    if not username:
        return {
            'statusCode': 404,
            'body': json.dumps({
                'success': False,
                'message': 'Username is required',
                'code': 'InvalidParameterException'
            })
        }
    
    try:
        # Check if the user exists in the User Pool
        try:
            user_response = client.admin_get_user(
                UserPoolId=USER_POOL_ID,
                Username=username
            )
            print(f"User found: {username}")
            
            # Check if user is confirmed
            user_status = user_response.get('UserStatus')
            if user_status == 'UNCONFIRMED':
                return {
                    'statusCode': 400,
                    'body': json.dumps({
                        'success': False,
                        'message': 'User account is not confirmed. Please verify your email first.',
                        'code': 'UserNotConfirmedException'
                    })
                }
            
        # If user doesn't exist
        except client.exceptions.UserNotFoundException:
            print(f"User not found: {username}")
            return {
                'statusCode': 404,
                'body': json.dumps({
                    'success': False,
                    'message': 'User not found. Please check your username and try again.',
                    'code': 'UserNotFoundException'
                })
            }
        
        # If user exists and is confirmed, proceeding with forgot password flow
        response = client.forgot_password(
            ClientId=CLIENT_ID,
            Username=username
        )
        print(f"Forgot password response: {response}")
        
        print(f"Forgot password initiated for user: {username}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Verification code sent successfully',
                'delivery': {
                    'destination': response.get('CodeDeliveryDetails', {}).get('Destination', 'your email'),
                    'medium': response.get('CodeDeliveryDetails', {}).get('DeliveryMedium', 'EMAIL')
                }
            })
        }
        
    except client.exceptions.InvalidParameterException as e:
        print(f"Invalid parameter: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': str(e),
                'code': 'InvalidParameterException'
            })
        }
    except client.exceptions.TooManyRequestsException:
        print("Signout failed: Too many requests.")
        return {
            'statusCode': 429,
            'body': json.dumps({
                'success': False,
                'message': 'Too many requests, please try again later',
                'code': 'TooManyRequestsException'
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