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
        print("String body:",body)

        action = body.get("action")
        data = body.get("data", {})
        print("String action:",action)
        print("String data:",data)

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
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    if "email" not in data:
                        return response(400, {"error": "Missing 'email'"})
                    if "role" not in data:
                        return response(400, {"error": "Missing 'role'"})
                    if "status" not in data:
                        return response(400, {"error": "Missing 'status'"})
                    if "created_at" not in data:
                        return response(400, {"error": "Missing 'created_at'"})

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
                    print("Result:", result)

                    if result:
                        result = serialize_result(result)

                    return response(200, result)
                
                elif action == "get_client_cn_calendly":
                    if "client_name" not in data:
                        return response(400, {"error": "Missing 'client_name'"})
                    
                    sql = """
                        SELECT u.calendly_name 
                        FROM users u
                        WHERE u.username = (
                            SELECT care_navigator_username 
                            FROM client_details 
                            WHERE client_name = %s
                        )
                    """
                    cursor.execute(sql, (data["client_name"],))
                    result = cursor.fetchone()
                    
                    if result and result.get("calendly_name"):
                        return response(200, {"calendly_name": result["calendly_name"]})
                    else:
                        return response(404, {"error": "CN calendly name not found for this client"})
                
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
                    cursor.execute(sql, (
                        data["username"],
                    ))
                    conn.commit()
                    return response(200, {"message": "Client email verified."})

                elif action == "active_user":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "UPDATE users SET status = 2 WHERE username = %s"
                    cursor.execute(sql, (
                        data["username"],
                    ))
                    conn.commit()
                    return response(200, {"message": "Active user."})

                elif action == "profile_incomplete_CN":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "UPDATE users SET status = 4 WHERE username = %s"
                    cursor.execute(sql, (
                        data["username"],
                    ))
                    conn.commit()
                    return response(200, {"message": "Permanent password created."})

                elif action == "create_appointment":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})
                    if "local_start_time" not in data:
                        return response(400, {"error": "Missing 'local_start_time'"})
                    if "created_timestamp" not in data:
                        return response(400, {"error": "Missing 'created_timestamp'"})
                    
                    sql = """
                        INSERT INTO client_appointments (client_username, local_start_time, status, note, created_timestamp)
                        VALUES (%s, %s, 'active', %s, %s)
                    """
                    cursor.execute(sql, (
                        data["client_username"], 
                        data["local_start_time"], 
                        data.get("note", ""),  # Optional field (Value or empty)
                        data["created_timestamp"]
                    ))
                    conn.commit()
                    return response(200, {"message": "Appointment created", "appointment_id": cursor.lastrowid})

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
                                    ORDER BY id DESC 
                                    LIMIT 1
                                ) AS subquery
                            )
                        """
                    cursor.execute(sql, (
                        data["client_username"],
                    ))
                    conn.commit()
                    return response(200, {"message": "Appointment cancelled"})
                
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
                                ORDER BY id DESC 
                                LIMIT 1
                            ) AS subquery
                        )
                    """
                    cursor.execute(sql, (data["client_username"],))
                    conn.commit()
                    return response(200, {"message": "Appointment marked as completed"})

                else:
                    return response(400, {"error": "Invalid action"})


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
