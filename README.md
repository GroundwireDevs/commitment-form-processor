# commitment-form-processor

## Overview

1. User submits a commitment form, such as from [JesusCares Forms](http://github.com/GroundwireDevs/jesuscares-forms). Request is directed by CloudFront through API gateway (defined in this repository) into a Step Functions state machine (also defined).
2. Asynchronous
   * Email is sent to user with more information.
   * User's information is written to Google Sheets.
3. The state machine completes.

## Deployment

1. Create the deployment package by simply zipping root of the repository. Make sure that file permissions are correct, see buildspec.yml for an example of how CodeBuild does it.
2. Upload the deployment package to S3 and change commitment-form-processor.template CodeUri values to the package's S3 URI.
3. Create a new CloudFormation stack with commitment-form-processor.template, fill in all parameters.

## Groundwire-specific Deployment

1. Builds and deployments are automated by CodePipeline. Changes to the prod branch will run the build and deploy to dev automatically. Approve in order to deploy to prod.

2. Changes to responses templates should be done manually using awscli.

3. Changes to CloudFormation parameters should be done in config.json on S3, see CodePipeline for URI.
