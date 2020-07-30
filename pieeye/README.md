General setup instructions
- run `npm install`

To set up the backend Locally
- .env file contains `RUN_LOCAL`. Set this to `1` to run it locally
    

To set up the endpoint in AWS lambda

- Install awscli . Check (https://docs.aws.amazon.com/cli/latest/userguide/install-cliv1.html)
- Setup up your aws credentials with aws configure
- Run `npm i serverless -g`
- Check the serverless.yml file. The region is set to ap-south-1. You can update this based on your preference.
- Run `sls deploy`
- Update the frontend constants file with the URL you got after `sls deploy`. Change those constant instructions is given in frontend/README.md
- In case of any issue to debug with logs run `sls logs -f app`




