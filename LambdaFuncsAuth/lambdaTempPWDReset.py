import json
import boto3
import os

# Initialize the Cognito client
client = boto3.client('cognito-idp')

CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

def lambda_handler(event, context):
    # Parse the incoming JSON body
    print("Received event: " + json.dumps(event))

    # Extract parameters
    username = event.get('username')
    new_password = event.get('new_password')
    session = event.get('session')  # Received at login, from the challenge response
    
    if not new_password:    # Availability of the sessionString and username is being checked at frontend before calling the lambda
        return {
            'statusCode': 404,
            'body': json.dumps({
                'success': False,
                'message': 'New password is required',
                'code': 'InvalidParameterException'
            })
        }

    try:
        # Respond to the NEW_PASSWORD_REQUIRED challenge
        response = client.respond_to_auth_challenge(
            ClientId=CLIENT_ID,
            ChallengeName='NEW_PASSWORD_REQUIRED',
            Session=session,
            ChallengeResponses={
                'USERNAME': username,
                'NEW_PASSWORD': new_password,
                'userAttributes.preferred_username': username
            }
        )
        print("Respond to auth challenge response: " + json.dumps(response))
        
        # Extract the tokens from the response
        id_token = response['AuthenticationResult']['IdToken']
        access_token = response['AuthenticationResult']['AccessToken']
        refresh_token = response['AuthenticationResult']['RefreshToken']
        expires_in = response['AuthenticationResult']['ExpiresIn']
        
        print("Password changed successfully and user authenticated!")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Password changed successfully',
                'tokens': {
                    'idToken': id_token,
                    'accessToken': access_token,
                    'refreshToken': refresh_token,
                    'expiresIn': expires_in
                }
            })
        }
        
    except client.exceptions.InvalidPasswordException as e:
        print(f"Invalid password: {str(e)}")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': str(e),
                'code': 'InvalidPasswordException'
            })
        }
    except client.exceptions.NotAuthorizedException as e:
        print("Invalid temporary password or session expired")
        return {
            'statusCode': 401,
            'body': json.dumps({
                'success': False,
                'message': str(e),
                'code': 'NotAuthorizedException'
            })
        }
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'message': str(e),
                'code': 'UnknownError'
            })
        }