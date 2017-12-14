# commitment-form-processor

## Overview

1. User submits a commitment form, such as from [JesusCares Forms](https://github.com/GroundwireDevs/jesuscares-forms). Request is directed through API gateway (defined in this repository) into an AWS Step Functions state machine (also defined).
2. Asynchronous
   * Email is sent to user with more information.
   * User's information is written to Google Sheets.
3. The state machine completes.
4. If the email is responded to, it gets forwarded to ForwardAddress (set in CloudFormation parameters)

## Deployment

1. Clone the repository, install package with `npm install`.
2. Test the package, `npm test`.
3. Remove devDependencies using `npm prune --production`.
4. Make sure that the file permissions are correct, for example, `chmod -R 777 *`
5. Zip the package's contents, for example, `zip -r commitment-form-processor.zip .`.
6. Upload the deployment package to S3 and change commitment-form-processor.template CodeUri values to the package's S3 URI.
7. Create a new CloudFormation stack with commitment-form-processor.template, fill in all parameters.
8. [Create and/or update email templates with AWS CLI.](https://github.com/GroundwireDevs/commitment-form-processor/wiki/Creating-and-updating-email-templates)
9. Ensure that [template-map.json](https://github.com/GroundwireDevs/commitment-form-processor/blob/prod/template-map.json) is set correctly and validates against [template-map.schema.json](https://github.com/GroundwireDevs/commitment-form-processor/blob/prod/template-map.schema.json).

## Groundwire-specific Deployment

1. Builds and deployments are automated by CodePipeline. Changes to the prod branch will run the build and deploy to dev CloudFormation stack automatically. Approve in order to deploy to prod.

2. Changes to responses templates should be done manually using awscli.

3. Changes to CloudFormation parameters should be done in config.json on S3, see CodePipeline for URI.
