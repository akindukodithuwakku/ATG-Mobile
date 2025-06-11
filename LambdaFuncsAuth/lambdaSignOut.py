import json
import boto3

# Initialize the Cognito client
client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    # Parse the incoming JSON body
    print("Received event: " + json.dumps(event))

    ## API GW
    access_token = event.get('accessToken')

    if not access_token:
        return {
            'statusCode': 400,
            'body': json.dumps({
                'success': False,
                'message': 'Access token is required',
                'code': 'InvalidParameterException'
            })
        }

    try:
        # Attempt to sign out the user using their access token
        response = client.global_sign_out(
            AccessToken=access_token
        )
        print("User signed out successfully.", response)

        # Return the successful response
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'User signed out successfully'
            })
        }

    except client.exceptions.NotAuthorizedException:
        print("Signout failed: Access token is invalid or expired.")
        return {
            'statusCode': 401,
            'body': json.dumps({
                'success': False,
                'message': 'Access token is invalid or expired',
                'code': 'NotAuthorizedException'
            })
        }
    except client.exceptions.ResourceNotFoundException:
        print("Signout failed: User pool or user does not exist.")
        return {
            'statusCode': 404,
            'body': json.dumps({
                'success': False,
                'message': 'User pool or user does not exist',
                'code': 'ResourceNotFoundException'
            })
        }
    except client.exceptions.InternalErrorException:
        print("Signout failed: An internal error occurred.")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'message': 'An internal error occurred',
                'code': 'InternalErrorException'
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
                'code': 'UnknownError',
                'error': str(e)
            })
        }