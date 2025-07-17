const mysql = require('mysql2/promise');

exports.handler = async (event) => {
  try {
    const body = JSON.parse(event.body);

    const {
      client_username,
      care_navigator_username,
      full_name,
      date_of_birth,
      gender,
      contact_number,
      home_address,
      current_medical_conditions_diabetes,
      current_medical_conditions_hypertension,
      current_medical_conditions_arthritis,
      current_medical_conditions_heart_disease,
      current_medical_conditions_other,
      known_allergies,
      current_medications,
      history_of_surgeries_procedures,
      primary_reason_for_care,
      current_medical_conditions_weekdays,
      current_medical_conditions_weekends,
      current_medical_conditions_morning,
      current_medical_conditions_evening,
      special_assistance_mobility,
      special_assistance_hypertension,
      special_assistance_medication_management,
      special_assistance_hygiene,
      additional_notes,
      emergency_contact_name,
      emergency_contact_number,
      relationship_to_emergency_contact
    } = body;

    const connection = await mysql.createConnection({
      host: 'atghealthcare.cjmme44o6mb1.ap-south-1.rds.amazonaws.com',
      user: 'admin',
      password: 'Atghealth.12',
      database: 'atghealthcare', // ✅ Correct database name
    });

    const query = `
      INSERT INTO care_intake (
        client_username, care_navigator_username, full_name, date_of_birth, gender,
        contact_number, home_address, current_medical_conditions_diabetes,
        current_medical_conditions_hypertension, current_medical_conditions_arthritis,
        current_medical_conditions_heart_disease, current_medical_conditions_other,
        known_allergies, current_medications, history_of_surgeries_procedures,
        primary_reason_for_care, current_medical_conditions_weekdays,
        current_medical_conditions_weekends, current_medical_conditions_morning,
        current_medical_conditions_evening, special_assistance_mobility,
        special_assistance_hypertension, special_assistance_medication_management,
        special_assistance_hygiene, additional_notes, emergency_contact_name,
        emergency_contact_number, relationship_to_emergency_contact
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      client_username, care_navigator_username, full_name, date_of_birth, gender,
      contact_number, home_address, current_medical_conditions_diabetes,
      current_medical_conditions_hypertension, current_medical_conditions_arthritis,
      current_medical_conditions_heart_disease, current_medical_conditions_other,
      known_allergies, current_medications, history_of_surgeries_procedures,
      primary_reason_for_care, current_medical_conditions_weekdays,
      current_medical_conditions_weekends, current_medical_conditions_morning,
      current_medical_conditions_evening, special_assistance_mobility,
      special_assistance_hypertension, special_assistance_medication_management,
      special_assistance_hygiene, additional_notes, emergency_contact_name,
      emergency_contact_number, relationship_to_emergency_contact
    ];

    await connection.execute(query, values);
    await connection.end();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Care intake submitted successfully!' }),
    };

  } catch (error) {
    console.error('Error submitting care intake:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error: ' + error.message }),
    };
  }
};