const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

AWS.config.update({ region: 'ap-south-1' }); // Replace with your region

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'CareIntakeForm';

exports.handler = async (event) => {
  const body = JSON.parse(event.body);

  const item = {
    userId: uuidv4(),
    fullName: body.fullName,
    dateOfBirth: body.dateOfBirth,
    gender: body.gender,
    contactNumber: body.contactNumber,
    homeAddress: body.homeAddress,
    conditions: body.conditions,
    otherCondition: body.otherCondition,
    allergies: body.allergies,
    medications: body.medications,
    surgeries: body.surgeries,
    emergencyContactName: body.emergencyContactName,
    emergencyContactNumber: body.emergencyContactNumber,
    relationship: body.relationship,
    submittedAt: new Date().toISOString()
};

  const params = {
    TableName: TABLE_NAME,
    Item: item
  };

  try {
    await dynamoDb.put(params).promise();
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Form submitted successfully!', formId: item.formId })
    };
  } catch (error) {
    console.error('DynamoDB error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Failed to submit form', error: error.message })
    };
  }
};
