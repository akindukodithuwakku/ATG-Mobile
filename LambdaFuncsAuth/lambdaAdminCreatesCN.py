import json
import boto3
import os

# Initialize the Cognito client
client = boto3.client('cognito-idp')

USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')

def lambda_handler(event, context):
    # Parse the incoming JSON body
    print("Received event: " + json.dumps(event))

    ## API GW
    username = event.get('username')
    email = event.get('email')
    
    # Additional attributes (optional)
    user_attributes = event.get('userAttributes', {})
    
    if not username or not email:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Both username and email are required',
                'code': 'InvalidParameterException'
            })
        }

    try:
        # Prepare user attributes
        attributes = [
            {
                'Name': 'email',
                'Value': email
            },
            {
                'Name': 'email_verified',
                'Value': 'true'  # Setting email as verified since this is admin creation
            }
        ]
        
        # Create the user in Cognito
        response = client.admin_create_user(
            UserPoolId=USER_POOL_ID,
            Username=username,
            UserAttributes=attributes,
            DesiredDeliveryMediums=['EMAIL']  # Sending temporary password via email
        )
        print("Response:", response)
        
        user = response['User']
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'User created successfully. Temporary password sent via email.',
                'user': {
                    'username': username,
                    'email': email,
                    'status': user['UserStatus'],
                    'userAttributes': user_attributes
                }
            })
        }
    
    except client.exceptions.UsernameExistsException:
        return {
            'statusCode': 409,
            'body': json.dumps({
                'success': False,
                'message': 'A user with this username already exists',
                'code': 'UsernameExistsException'
            })
        }
    
    except client.exceptions.InvalidParameterException as e:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': str(e),
                'code': 'InvalidParameterException'
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