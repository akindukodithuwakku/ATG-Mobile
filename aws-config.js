import { Amplify } from "aws-amplify";

import {
  REACT_APP_REGION,
  REACT_APP_USER_POOL_ID,
  REACT_APP_USER_POOL_CLIENT_ID,
} from "@env";

const awsConfig = {
  Auth: {
    Cognito: {
      region: REACT_APP_REGION,
      userPoolId: REACT_APP_USER_POOL_ID,
      userPoolClientId: REACT_APP_USER_POOL_CLIENT_ID,
    },
  },
};

console.log(`process.env.REACT_APP_REGION: ${REACT_APP_REGION}`);
console.log(`process.env.REACT_APP_USER_POOL_ID: ${REACT_APP_USER_POOL_ID}`);
console.log(
  `process.env.REACT_APP_USER_POOL_CLIENT_ID: ${REACT_APP_USER_POOL_CLIENT_ID}`
);

Amplify.configure(awsConfig);

export default awsConfig;
