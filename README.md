[![Build Status](https://travis-ci.org/mdb/terraform-example.svg?branch=master)](https://travis-ci.org/mdb/terraform-example)

# terraform-example

An reference repo demonstrating how to continuously deploy via [terraform](http://terraform.io)
from [TravisCI](https://travis-ci.org/mdb/terraform-example).

Via TravisCI (or locally), use Node.js to compile a static website; use Terraform to:

* create `www.your-domain.com` and `your-domain.com` AWS S3 buckets configured for static website hosting
* redirect requests to the `www.your-domain.com` bucket to `your-domain.com`
* deploy the `index.html` and `error.html` objects to the `your-domain.com` bucket
* establish an AWS Route53 `your-domain.com` DNS zone
* establish a Route53 A record set pointing `your-domain.com` to the `your-domain.com` S3 bucket

## TravisCI build flow

TravisCI:

1. Uses Node.js to compile `src` to a static website.
2. If the branch is `master`, installs `terraform`
3. If the branch is `master`, executes `deploy.sh` to deploy the static website to AWS S3 website fronted by `mikeball.me` via:
  1. `terraform plan`
  2. `terraform apply`
  3. commit `terraform.tfstate` back to this repo with a `[ci skip]` commit message such that a TravisCI build is not triggered.

## Giving it a spin

To deploy your own:

1. Fork this repo.

2. Visit [travis-ci.org](https://travis-ci.org/profile); activate CI for your fork of this repo.

3. Install the `travis` CLI if you don't already have it:

  ```
  $ gem install travis
  ```

3. Use the `travis` CLI to encrypt your AWS credentials and your [Github access token]() in environment variables:

  ```
  $ travis encrypt AWS_ACCESS_KEY_ID=123 AWS_SECRET_ACCESS_KEY=456 GH_TOKEN=123
  ```

4. Add the encrypted credentials string to your `.travis.yml`, replacing the current `secure` value:

  ```
  ...
    env:
      secure: "ENCRYPTED STRING HERE"
  ...
  ```

5. Replace `GH_USER_NAME`, `GH_USER_EMAIL`, and `GH_REPO` in the `.travis.yml` with your details.

6. Replace the `domain` var in [`terraform/main.tf`](https://github.com/mdb/terraform-example/blob/master/terraform/main.tf#L6) with your domain name.

7. Remove my `tfstate` files to start fresh:

  ```
  $ git rm terraform/terraform.tfstate*
  $ git commit -m 'removed mdb tfstate'
  ```

8. Push & deploy:

  ```
  $ git push origin master
  ```

9. Note that you may need to point the DNS servers associated with `your-domain.com` to those dynamically assigned to
your A record by AWS. For example, my A record [uses these DNS servers](https://github.com/mdb/terraform-example/blob/master/terraform/terraform.tfstate#L48).
