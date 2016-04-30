variable "region" {
  default = "us-west-2"
}

variable "domain_name" {
  default = "mikeball.me"
}

provider "aws" {
  region = "${var.region}"
}

resource "aws_s3_bucket" "blog" {
  bucket = "${var.domain_name}"
  region = "${var.region}"
  acl = "public-read"
  website {
    index_document = "index.html"
    error_document = "error.html"
  }
  policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "PublicReadForGetBucketObjects",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": ["arn:aws:s3:::${var.DOMAIN_NAME}/*"]
  }]
}
EOF
}

resource "aws_s3_bucket" "wwwblog" {
  bucket = "www.${var.DOMAIN_NAME}"
  region = "${var.region}"
  acl = "public-read"
  website {
    redirect_all_requests_to = "${var.DOMAIN_NAME}"
  }
}

resource "aws_s3_bucket_object" "index_file" {
  bucket = "${var.DOMAIN_NAME}"
  source = "../dist/index.html"
  key = "index.html"
  etag = "${md5(file("../dist/index.html"))}"
  content_type = "text/html"
  depends_on = [
    "aws_s3_bucket.blog"
  ]
}

resource "aws_s3_bucket_object" "error_file" {
  bucket = "${var.DOMAIN_NAME}"
  source = "../dist/error.html"
  key = "error.html"
  etag = "${md5(file("../dist/error.html"))}"
  content_type = "text/html"
  depends_on = [
    "aws_s3_bucket.blog"
  ]
}

resource "aws_route53_zone" "primary" {
  name = "${var.DOMAIN_NAME}"
}

resource "aws_route53_record" "blog" {
  zone_id = "${aws_route53_zone.primary.zone_id}"
  name = "${var.DOMAIN_NAME}"
  type = "A"
  alias {
    name = "${aws_s3_bucket.blog.website_domain}"
    zone_id = "${aws_s3_bucket.blog.hosted_zone_id}"
    evaluate_target_health = false
  }
}
