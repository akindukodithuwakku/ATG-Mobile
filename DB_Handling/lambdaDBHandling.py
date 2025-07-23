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

                elif action == "get_client_details":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "SELECT full_name, date_of_birth, gender, contact_number, home_address FROM client_details WHERE client_username = %s"
                    cursor.execute(sql, (data["username"],))
                    result = cursor.fetchone()

                    if result:
                        result = serialize_result(result)
                        return response(200, result)
                    else:
                        return response(404, {"error": "Client details not found"})

                elif action == "get_cn_details":
                    if "username" not in data:
                        return response(400, {"error": "Missing 'username'"})
                    
                    sql = "SELECT full_name, date_of_birth, gender, contact_number, home_address FROM cn_details WHERE cn_username = %s"
                    cursor.execute(sql, (data["username"],))
                    result = cursor.fetchone()

                    if result:
                        result = serialize_result(result)
                        return response(200, result)
                    else:
                        return response(404, {"error": "Care Navigator details not found"})
                    
                elif action == "update_client_details":
                    # Validate required fields
                    required_fields = ["username", "full_name", "date_of_birth", "gender", "contact_number", "home_address"]
                    for field in required_fields:
                        if field not in data:
                            return response(400, {"error": f"Missing required field '{field}'"})
                        
                    sql = """
                        UPDATE client_details 
                        SET full_name = %s, 
                            date_of_birth = %s, 
                            gender = %s, 
                            contact_number = %s, 
                            home_address = %s
                        WHERE client_username = %s
                    """
                    cursor.execute(sql, (
                        data["full_name"],
                        data.get("date_of_birth", None),
                        data.get("gender", None),
                        data["contact_number"],
                        data.get("home_address", None),
                        data["username"]
                    ))
                    conn.commit()
                    return response(200, {"message": "Client details updated successfully", "username": data["username"]})
                    
                elif action == "update_cn_details":
                    # Validate required fields
                    required_fields = ["username", "full_name", "date_of_birth", "gender", "contact_number", "home_address"]
                    for field in required_fields:
                        if field not in data:
                            return response(400, {"error": f"Missing required field '{field}'"})
                        
                    sql = """
                        UPDATE cn_details 
                        SET full_name = %s, 
                            date_of_birth = %s, 
                            gender = %s, 
                            contact_number = %s, 
                            home_address = %s
                        WHERE cn_username = %s
                    """
                    cursor.execute(sql, (
                        data["full_name"],
                        data.get("date_of_birth", None),
                        data.get("gender", None),
                        data["contact_number"],
                        data.get("home_address", None),
                        data["username"]
                    ))
                    conn.commit()
                    return response(200, {"message": "Care navigator details updated successfully", "username": data["username"]})

                elif action == "get_client_care_navigator":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})
                    
                    sql = """
                        SELECT care_navigator_username 
                        FROM client_details 
                        WHERE client_username = %s
                    """
                    cursor.execute(sql, (data["client_username"],))
                    result = cursor.fetchone()
                    
                    if result:
                        return response(200, {"care_navigator_username": result["care_navigator_username"]})
                    else:
                        return response(404, {"error": "Care navigator not found for this client"})

                # For messaging and notifications
                elif action == "get_care_navigator_clients":
                    if "care_navigator_username" not in data:
                        return response(400, {"error": "Missing 'care_navigator_username'"})
                    
                    sql = """
                        SELECT client_username 
                        FROM client_details 
                        WHERE care_navigator_username = %s
                        ORDER BY client_username
                    """
                    cursor.execute(sql, (data["care_navigator_username"],))
                    results = cursor.fetchall()
                    
                    if results:
                        client_list = [row["client_username"] for row in results]
                        return response(200, {
                            "care_navigator_username": data["care_navigator_username"],
                            "clients": client_list,
                            "total_clients": len(client_list)
                        })
                    else:
                        return response(200, {
                            "care_navigator_username": data["care_navigator_username"],
                            "clients": [],
                            "total_clients": 0
                        })

                # For readiness                
                elif action == "get_navigator_clients":
                    if "care_navigator_username" not in data:
                        return response(400, {"error": "Missing 'care_navigator_username'"})
                    
                    sql = "SELECT DISTINCT client_username FROM client_details WHERE care_navigator_username = %s"
                    cursor.execute(sql, (data["care_navigator_username"],))
                    results = cursor.fetchall()
                    
                    if results:
                        clients = [{"client_username": row["client_username"]} for row in results]
                        return response(200, {"data": clients})
                    else:
                        return response(200, {"data": []})

                elif action == "get_client_readiness_details":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})
                    
                    sql = """
                        SELECT questionnaire_data, client_note, appointment_date_time 
                        FROM client_appointments 
                        WHERE client_username = %s AND status = 'active'
                        ORDER BY created_timestamp DESC 
                        LIMIT 1
                    """
                    cursor.execute(sql, (data["client_username"],))
                    result = cursor.fetchone()
                    
                    if result:
                        # Handle the datetime conversion properly - use dictionary keys
                        appointment_datetime = None
                        if result["appointment_date_time"]:
                            if hasattr(result["appointment_date_time"], 'isoformat'):
                                appointment_datetime = result["appointment_date_time"].isoformat()
                            else:
                                appointment_datetime = str(result["appointment_date_time"])
                        
                        readiness_data = {
                            "questionnaire_data": result["questionnaire_data"],
                            "client_note": result["client_note"],
                            "appointment_date_time": appointment_datetime
                        }
                        result = serialize_result(readiness_data)
                        return response(200, result)
                    else:
                        return response(404, {"error": "No active appointment found for this client"})
                    
                elif action == "get_client_appointment_history":
                    if "client_username" not in data:
                        return response(400, {"error": "Missing 'client_username'"})
                    
                    sql = """
                        SELECT appointment_id, client_username, appointment_date_time, 
                            status, created_timestamp, client_note
                        FROM client_appointments 
                        WHERE client_username = %s
                        ORDER BY appointment_date_time DESC
                    """
                    cursor.execute(sql, (data["client_username"],))
                    results = cursor.fetchall()
                    
                    if results:
                        appointments = []
                        for row in results:
                            appointment = serialize_result(row)
                            appointments.append(appointment)
                        return response(200, {"data": appointments})
                    else:
                        return response(404, {"error": "No appointment history found for this client"})

                elif action == "get_navigator_appointment_history":
                    if "care_navigator_username" not in data:
                        return response(400, {"error": "Missing 'care_navigator_username'"})
                    
                    sql = """
                        SELECT ca.appointment_id, ca.client_username, ca.appointment_date_time, 
                            ca.status, ca.created_timestamp, ca.client_note
                        FROM client_appointments ca
                        INNER JOIN client_details cd ON ca.client_username = cd.client_username
                        WHERE cd.care_navigator_username = %s
                        ORDER BY ca.appointment_date_time DESC
                    """
                    cursor.execute(sql, (data["care_navigator_username"],))
                    results = cursor.fetchall()
                    
                    if results:
                        appointments = []
                        for row in results:
                            appointment = serialize_result(row)
                            appointments.append(appointment)
                        return response(200, {"data": appointments})
                    else:
                        return response(404, {"error": "No appointment history found for this care navigator"})
                
                elif action == "assign_care_navigator":
                    # Requires client_username to be passed
                    if "client_username" not in data:
                        return response(400, {"error": "Missing required field 'client_username'"})
                    
                    client_username = data["client_username"]
                    
                    try:
                        # Check if client already has a care navigator assigned
                        check_existing_sql = """
                            SELECT care_navigator_username 
                            FROM client_details 
                            WHERE client_username = %s
                        """
                        cursor.execute(check_existing_sql, (client_username,))
                        existing_assignment = cursor.fetchone()
                        
                        if not existing_assignment:
                            return response(404, {"error": "Client not found in client_details table"})
                        
                        if existing_assignment["care_navigator_username"] and existing_assignment["care_navigator_username"].strip():
                            return response(200, {
                                "message": "Client already has a care navigator assigned",
                                "assigned_navigator": existing_assignment["care_navigator_username"]
                            })
                        
                        # Get care navigator with least assignments (active care navigators: role = 1, status = 2)
                        get_least_assigned_sql = """
                            SELECT 
                                u.username,
                                COALESCE(COUNT(cd.client_username), 0) as assignment_count
                            FROM users u
                            LEFT JOIN client_details cd ON u.username = cd.care_navigator_username
                            WHERE u.role = 1 AND u.status = 2
                            GROUP BY u.username
                            ORDER BY assignment_count ASC, u.username ASC
                            LIMIT 1
                        """
                        cursor.execute(get_least_assigned_sql)
                        least_assigned = cursor.fetchone()
                        
                        if not least_assigned:
                            return response(404, {"error": "No active care navigators found"})
                        
                        assigned_navigator = least_assigned["username"]
                        
                        # Update the client_details table with the assigned care navigator
                        update_sql = """
                            UPDATE client_details 
                            SET care_navigator_username = %s 
                            WHERE client_username = %s
                        """
                        
                        affected_rows = cursor.execute(update_sql, (assigned_navigator, client_username))
                        
                        if affected_rows > 0:
                            conn.commit()
                            return response(200, {
                                "message": "Care navigator assigned successfully",
                                "client_username": client_username,
                                "assigned_navigator": assigned_navigator,
                                "previous_assignment_count": least_assigned["assignment_count"]
                            })
                        else:
                            return response(500, {"error": "Failed to update client assignment"})
                        
                    except Exception as e:
                        conn.rollback()
                        return response(500, {"error": f"Database error: {str(e)}"})

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
