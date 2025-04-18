import json
import boto3
import os

# Initialize the Cognito client
client = boto3.client('cognito-idp')

CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')
USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')

def lambda_handler(event, context):
    # Parse the incoming JSON body
    print("Received event: " + json.dumps(event))

    ## API GW
    username = event.get('username')
    password = event.get('password')
    email = event.get('email')

    if not username or not password or not email:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Username, password, and email are required',
                'code': 'InvalidParameterException'
            })
        }

    try:
        # Attempt to sign up the user using Cognito
        response = client.sign_up(
            ClientId=CLIENT_ID,
            Username=username,
            Password=password,
            UserAttributes=[
                {
                    'Name': 'email',
                    'Value': email
                }
            ]
        )

        # Return the successful response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'User registration successful',
                'userSub': response['UserSub'],
                'userConfirmed': response['UserConfirmed']
            })
        }

    except client.exceptions.UsernameExistsException:
        print(f"Signup failed: Username {username} already exists.")
        return {
            'statusCode': 409,
            'body': json.dumps({
                'success': False,
                'message': 'Username already exists',
                'code': 'UsernameExistsException'
            })
        }
    except client.exceptions.InvalidParameterException as e:
        print(f"Signup failed: Invalid parameter. {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': str(e),
                'code': 'InvalidParameterException'
            })
        }
    except client.exceptions.InvalidPasswordException as e:
        print(f"Signup failed: Invalid password. {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Password does not meet requirements',
                'code': 'InvalidPasswordException'
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