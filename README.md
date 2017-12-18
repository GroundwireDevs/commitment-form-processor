# commitment-form-processor

## Overview

1. User submits a commitment form, such as from [JesusCares Forms](https://github.com/GroundwireDevs/jesuscares-forms). Request is directed through API gateway (defined in this repository) into an AWS Step Functions state machine (also defined).
2. (Asynchronous)
   * Email is sent to user with more information.
   * User's information is written to Google Sheets.
3. The state machine completes.
4. If the email is responded to, it gets forwarded to ForwardAddress (set in CloudFormation parameters)

## Deployment

(See [buildspec.yml](https://github.com/GroundwireDevs/commitment-form-processor/blob/prod/buildspec.yml) to see practical ways to accomplish many of these commands automatically.) and [CodePipeline example](https://github.com/GroundwireDevs/commitment-form-processor/wiki/CodePipeline-example) of CI/CD solution on AWS CodePipeline.

1. Clone the repository, install package with `npm install`.
2. Create a template-map.json file and ensure that it validates against  [template-map.schema.json](https://github.com/GroundwireDevs/commitment-form-processor/blob/prod/template-map.schema.json). This file determines different settings depending on the commitment langauge and type. Place the file into the root of the repository.
3. [Create and/or update email templates with AWS CLI.](https://github.com/GroundwireDevs/commitment-form-processor/wiki/Creating-and-updating-email-templates)
4. Test the package, `npm test`.
5. Remove devDependencies using `npm prune --production`.
6. Make sure that the file permissions are correct, for example, `chmod -R 777 *`
7. Zip the package's contents, for example, `zip -r commitment-form-processor.zip .`.
8. Upload the deployment package to S3 and change commitment-form-processor.template CodeUri values to the package's S3 URI.
9. Create a new CloudFormation stack with commitment-form-processor.template, fill in all parameters.
10. [Set an SES email rule to save email to S3 and trigger the forward Lambda function.](https://github.com/GroundwireDevs/commitment-form-processor/wiki/Setting-the-SES-rule-for-email-forwarding)
