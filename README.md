# commitment-form-processor

## Overview

1. User submits a commitment form, such as from [JesusCares Forms](http://github.com/GroundwireDevs/jesuscares-forms). Request is directed by CloudFront through API gateway (defined in this repository) into a Step Functions state machine (also defined).
2. Asynchronous
   * Email is sent to user with more information.
   * User's information is written to Google Sheets.
3. The state machine completes.
