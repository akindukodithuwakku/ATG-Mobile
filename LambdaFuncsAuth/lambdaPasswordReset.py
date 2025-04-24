import json
import boto3

# Initialize the Cognito client
client = boto3.client('cognito-idp')

def lambda_handler(event, context):
    # Parse the incoming event
    print("Received event: " + json.dumps(event))
    
    # Extract parameters from the event
    previous_password = event.get('previous_password')
    new_password = event.get('new_password')
    access_token = event.get('access_token')
    
    if not previous_password or not new_password or not access_token:
        return {
            'statusCode': 404,
            'body': json.dumps({
                'success': False,
                'message': 'Previous password, new password, and access token are required',
                'code': 'InvalidParameterException'
            })
        }
    
    try:
        # Change the password for the authenticated user
        response = client.change_password(
            PreviousPassword=previous_password,
            ProposedPassword=new_password,
            AccessToken=access_token
        )
        
        print("Response:", response)
        print("Password changed successfully")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Password changed successfully'
            })
        }
        
    except client.exceptions.InvalidPasswordException as e:
        # Password doesn't match the policy.
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
        print("Invalid Access Token, Access Token has been revoked, or Incorrect previous password")
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