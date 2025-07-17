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
    refresh_token = event.get('refreshToken')

    if not refresh_token:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Refresh token is required',
                'code': 'InvalidParameterException'
            })
        }

    try:
        # Attempt to refresh the access token using the refresh token
        response = client.initiate_auth(
            ClientId=CLIENT_ID,
            AuthFlow='REFRESH_TOKEN_AUTH',
            AuthParameters={
                'REFRESH_TOKEN': refresh_token
            }
        )
        print("Response:", response)
        
        # Extract the new tokens from the response
        auth_result = response['AuthenticationResult']
        new_access_token = auth_result['AccessToken']
        new_id_token = auth_result.get('IdToken', '')
        expires_in = auth_result.get('ExpiresIn', 3600)  # Default to 1 hour if not provided
        
        print("Token refreshed successfully.")

        # Return the successful response with new tokens
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Token refreshed successfully',
                'tokens': {
                    'accessToken': new_access_token,
                    'idToken': new_id_token,
                    'expiresIn': expires_in
                }
            })
        }

    except client.exceptions.NotAuthorizedException:
        print("Token refresh failed: Refresh token is invalid or expired.")
        return {
            'statusCode': 401,
            'body': json.dumps({
                'success': False,
                'message': 'Refresh token is invalid or expired',
                'code': 'NotAuthorizedException'
            })
        }
    except client.exceptions.ResourceNotFoundException:
        print("Token refresh failed: User pool or user does not exist.")
        return {
            'statusCode': 404,
            'body': json.dumps({
                'success': False,
                'message': 'User pool or user does not exist',
                'code': 'ResourceNotFoundException'
            })
        }
    except client.exceptions.InvalidParameterException:
        print("Token refresh failed: Invalid parameter provided.")
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Invalid parameter provided',
                'code': 'InvalidParameterException'
            })
        }
    except client.exceptions.InternalErrorException:
        print("Token refresh failed: An internal error occurred.")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'message': 'An internal error occurred',
                'code': 'InternalErrorException'
            })
        }
    except client.exceptions.TooManyRequestsException:
        print("Token refresh failed: Too many requests.")
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
                'code': 'UnknownError',
                'error': str(e)
            })
        }