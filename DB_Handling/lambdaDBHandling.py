import json
import pymysql
import os
from datetime import datetime, date

db_config = {
    "host": os.environ['DB_HOST'],
    "user": os.environ['DB_USER'],
    "password": os.environ['DB_PASSWORD'],
    "database": os.environ['DB_NAME'],
}

def serialize_result(result):
    def convert(obj):
        if isinstance(obj, (datetime, date)):
            return obj.isoformat()
        return obj

    return {k: convert(v) for k, v in result.items()}

def lambda_handler(event, context):
    try:
        body = json.loads(event["body"]) if "body" in event else event

        action = body.get("action")
        data = body.get("data", {})

        # To be removed
        print("String action:",action)
        print("String data:",data)
        
        # Input validation
        if not action:
            return response(400, {"error": "Missing required parameter 'action'"})
        if not data:
            return response(400, {"error": "Missing required parameter 'data'"})

        conn = pymysql.connect(
            host=db_config["host"],
            user=db_config["user"],
            password=db_config["password"],
            database=db_config["database"],
            cursorclass=pymysql.cursors.DictCursor
        )

        with conn:
            with conn.cursor() as cursor:
                if action == "create_user":
                    # Validate required fields
                    required_fields = ["username", "email", "role", "status", "created_at"]
                    for field in required_fields:
                        if field not in data:
                            return response(400, {"error": f"Missing required field '{field}'"})

                    sql = """
                        INSERT INTO users (username, email, role, status, calendly_name, created_at)
                        VALUES (%s, %s, %s, %s, %s, %s)
                    """
                    cursor.execute(sql, (
                        data["username"],
                        data["email"],
                        data["role"],
                        data["status"],
                        data.get("calendly_name", None),  # Optional field (Value or None)
                        data["created_at"]
                    ))
                    conn.commit()
                    return response(200, {"message": "User created", "username": data["username"]})
                
                elif action == "get_user_role":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "SELECT role FROM users WHERE username = %s"
                    cursor.execute(sql, (
                        data["username"],
                    ))
                    result = cursor.fetchone()

                    if result:
                        result = serialize_result(result)
                        return response(200, result)
                    else:
                        return response(404, {"error": "User not found"})
                
                elif action == "get_user_status":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "SELECT status FROM users WHERE username = %s"
                    cursor.execute(sql, (
                        data["username"],
                    ))
                    result = cursor.fetchone()

                    if result:
                        result = serialize_result(result)
                        return response(200, result)
                    else:
                        return response(404, {"error": "User not found"})
                
                elif action == "get_client_cn_calendly":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})
                    
                    sql = """
                        SELECT u.calendly_name 
                        FROM users u
                        WHERE u.username = (
                            SELECT care_navigator_username 
                            FROM client_details 
                            WHERE client_username = %s
                        )
                    """
                    cursor.execute(sql, (data["client_username"],))
                    result = cursor.fetchone()
                    
                    if result and result.get("calendly_name"):
                        return response(200, {"calendly_name": result["calendly_name"]})
                    else:
                        return response(404, {"error": "Care navigator calendly name not found for this client"})
                
                elif action == "get_cn_calendly_name":
                    if "cn_username" not in data:
                        return response(400, {"error": "Missing 'cn_username'"})
                    
                    sql = """
                        SELECT u.calendly_name 
                        FROM users u
                        WHERE u.username =  %s
                    """
                    cursor.execute(sql, (data["cn_username"],))
                    result = cursor.fetchone()
                    
                    if result and result.get("calendly_name"):
                        return response(200, {"calendly_name": result["calendly_name"]})
                    else:
                        return response(404, {"error": "Calendly name not found for this care navigator"})

                elif action == "confirmed_client":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "UPDATE users SET status = 1 WHERE username = %s"
                    affected_rows = cursor.execute(sql, (data["username"],))
                    conn.commit()
                    
                    if affected_rows > 0:
                        return response(200, {"message": "Client email verified successfully"})
                    else:
                        return response(404, {"error": "User not found"})

                elif action == "active_user":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "UPDATE users SET status = 2 WHERE username = %s"
                    affected_rows = cursor.execute(sql, (data["username"],))
                    conn.commit()
                    
                    if affected_rows > 0:
                        return response(200, {"message": "User activated successfully"})
                    else:
                        return response(404, {"error": "User not found"})

                elif action == "profile_incomplete_CN":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "UPDATE users SET status = 4 WHERE username = %s"
                    affected_rows = cursor.execute(sql, (data["username"],))
                    conn.commit()
                    
                    if affected_rows > 0:
                        return response(200, {"message": "Permanent password created successfully"})
                    else:
                        return response(404, {"error": "User not found"})

                elif action == "create_appointment":
                    # Validate required fields
                    required_fields = ["client_username", "local_start_time"]
                    for field in required_fields:
                        if field not in data:
                            return response(400, {"error": f"Missing required field '{field}'"})
                    
                    # Extract questionnaire data
                    questionnaire_data = data.get("questionnaire_data", None)
                    
                    sql = """
                        INSERT INTO client_appointments (
                            client_username, 
                            appointment_date_time, 
                            client_note, 
                            questionnaire_data
                        )
                        VALUES (%s, %s, %s, %s)
                    """
                    
                    cursor.execute(sql, (
                        data["client_username"], 
                        data["local_start_time"], 
                        data.get("client_note", ""),
                        questionnaire_data
                    ))
                    conn.commit()

                    return response(200, {
                        "message": "Appointment created successfully", 
                        "appointment_id": cursor.lastrowid
                    })
                
                elif action == "get_active_appointment":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})
                    
                    sql = """
                        SELECT CONVERT_TZ(appointment_date_time, @@session.time_zone, '+00:00') AS appointment_date_time
                        FROM client_appointments
                        WHERE client_username = %s
                        AND status = 'active'
                        AND appointment_date_time > UTC_TIMESTAMP()
                        ORDER BY appointment_date_time ASC
                        LIMIT 1
                    """
                    cursor.execute(sql, (data["client_username"],))
                    result = cursor.fetchone()

                    if result:
                        appointment_time = result["appointment_date_time"]
                        if appointment_time.tzinfo is None:
                            from datetime import timezone
                            appointment_time = appointment_time.replace(tzinfo=timezone.utc)

                        return response(200, {
                            "hasAppointment": True,
                            "appointmentDateTime": appointment_time.isoformat()
                        })
                    else:
                        return response(200, {
                            "hasAppointment": False,
                            "appointmentDateTime": None
                        })

                elif action == "cancel_appointment":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})
                    
                    sql = """
                            UPDATE client_appointments 
                            SET status = 'cancelled'
                            WHERE appointment_id = (
                                SELECT appointment_id FROM (
                                    SELECT appointment_id 
                                    FROM client_appointments 
                                    WHERE client_username = %s AND status = 'active'
                                    ORDER BY appointment_id DESC 
                                    LIMIT 1
                                ) AS subquery
                            )
                        """
                    affected_rows = cursor.execute(sql, (data["client_username"],))
                    conn.commit()
                    
                    if affected_rows > 0:
                        return response(200, {"message": "Appointment cancelled successfully"})
                    else:
                        return response(404, {"error": "No active appointment found for this client"})
                
                elif action == "complete_appointment":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})

                    sql = """
                        UPDATE client_appointments 
                        SET status = 'completed'
                        WHERE appointment_id = (
                            SELECT appointment_id FROM (
                                SELECT appointment_id 
                                FROM client_appointments 
                                WHERE client_username = %s AND status = 'active'
                                ORDER BY appointment_id DESC 
                                LIMIT 1
                            ) AS subquery
                        )
                    """
                    affected_rows = cursor.execute(sql, (data["client_username"],))
                    conn.commit()
                    
                    if affected_rows > 0:
                        return response(200, {"message": "Appointment marked as completed successfully"})
                    else:
                        return response(404, {"error": "No active appointment found for this client"})

                else:
                    return response(400, {"error": f"Invalid action: '{action}'"})


    except Exception as e:
        print(f"Error: {str(e)}")
        return response(500, {"error": str(e)})

def response(status_code, body):
    return {
        "statusCode": status_code,
        "headers": {
            "Access-Control-Allow-Origin": "*",
            "Content-Type": "application/json"
        },
        "body": json.dumps(body)
    }
