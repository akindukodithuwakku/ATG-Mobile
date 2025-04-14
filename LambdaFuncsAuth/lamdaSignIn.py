import json
import boto3
import os

# Initialize the Cognito client
client = boto3.client('cognito-idp')

CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

def lambda_handler(event, context):
    # Parse the incoming JSON body
    print("Received event: " + json.dumps(event))

    ## API GW
    username = event.get('username')
    password = event.get('password')


    if not username or not password:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Username and password are required',
                'code': 'InvalidParameterException'
            })
        }

    try:
        # Attempt to authenticate the user using Cognito
        response = client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': username,
                'PASSWORD': password
            }
        )

        # Extract the tokens from the response
        id_token = response['AuthenticationResult']['IdToken']
        access_token = response['AuthenticationResult']['AccessToken']
        refresh_token = response['AuthenticationResult']['RefreshToken']
        expires_in = response['AuthenticationResult']['ExpiresIn']

        print("Login successful!", access_token)

        # Return the successful response with the tokens
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Authentication successful',
                'tokens': {
                    'idToken': id_token,
                    'accessToken': access_token,
                    'refreshToken': refresh_token,
                    'expiresIn': expires_in
                }
            })
        }

    except client.exceptions.NotAuthorizedException:
        print("Login failed: Incorrect username or password.")
        return {
            'statusCode': 401,
            'body': json.dumps({
                'success': False,
                'message': 'Incorrect username or password',
                'code': 'NotAuthorizedException'
            })
        }
    except client.exceptions.UserNotConfirmedException:
        print("Login failed: User not confirmed.")
        return {
            'statusCode': 403,
            'body': json.dumps({
                'success': False,
                'message': 'User not confirmed',
                'code': 'UserNotConfirmedException'
            })
        }
    except client.exceptions.UserNotFoundException:
        print("Login failed: User does not exist.")
        return {
            'statusCode': 404,
            'body': json.dumps({
                'success': False,
                'message': 'User does not exist',
                'code': 'UserNotFoundException'
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
