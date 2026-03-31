#!/usr/bin/env python3
"""
AWS Architecture Diagram for Women's Health & Safety Platform
Generated using AWS Diagrams MCP Server
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, EC2
from diagrams.aws.database import RDS, DynamoDB
from diagrams.aws.network import APIGateway, CloudFront, Route53
from diagrams.aws.storage import S3
from diagrams.aws.integration import EventBridge, SNS, SQS
from diagrams.aws.analytics import Comprehend
from diagrams.aws.healthcare import HealthLake
from diagrams.aws.security import IAM, SecretsManager
from diagrams.aws.management import CloudWatch
from diagrams.onprem.client import Client
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.inmemory import Redis

# Create the main diagram
with Diagram("Women's Health & Safety Platform - AWS Architecture", 
             filename="aws_architecture_diagram",
             show=False,
             direction="TB",
             graph_attr={"bgcolor": "white"}):
    
    # ============================================================
    # CLIENT LAYER
    # ============================================================
    with Cluster("Client Layer"):
        web_client = Client("Web Browser\n(React App)")
        mobile_client = Client("Mobile App\n(PWA)")
    
    # ============================================================
    # CDN & DNS
    # ============================================================
    with Cluster("Content Delivery"):
        route53 = Route53("Route 53\n(DNS)")
        cloudfront = CloudFront("CloudFront\n(CDN)")
    
    # ============================================================
    # API LAYER
    # ============================================================
    with Cluster("API Gateway & Load Balancing"):
        api_gateway = APIGateway("API Gateway\n(REST)")
    
    # ============================================================
    # COMPUTE LAYER
    # ============================================================
    with Cluster("Compute Layer"):
        with Cluster("Backend Services (Express.js)"):
            backend_1 = EC2("Backend Instance 1")
            backend_2 = EC2("Backend Instance 2")
            backend_3 = EC2("Backend Instance 3")
        
        with Cluster("Serverless Functions"):
            period_alert_lambda = Lambda("Period Alert\nLambda")
            reminder_processor = Lambda("Reminder\nProcessor")
            ai_handler = Lambda("AI Handler\nLambda")
    
    # ============================================================
    # DATA LAYER
    # ============================================================
    with Cluster("Data Layer"):
        with Cluster("Primary Database"):
            postgres_db = RDS("PostgreSQL\n(Primary DB)")
        
        with Cluster("Cache Layer"):
            redis_cache = Redis("Redis\n(Session Cache)")
        
        with Cluster("AWS Healthcare"):
            healthlake = HealthLake("HealthLake\n(Medical Records)")
    
    # ============================================================
    # STORAGE LAYER
    # ============================================================
    with Cluster("Storage"):
        s3_documents = S3("S3 Bucket\n(PDFs, Audio)")
        s3_static = S3("S3 Bucket\n(Static Assets)")
    
    # ============================================================
    # INTEGRATION & MESSAGING
    # ============================================================
    with Cluster("Integration & Messaging"):
        eventbridge = EventBridge("EventBridge\n(Scheduling)")
        sns = SNS("SNS\n(Notifications)")
        sqs = SQS("SQS\n(Message Queue)")
    
    # ============================================================
    # AI & ANALYTICS
    # ============================================================
    with Cluster("AI & Analytics"):
        comprehend_medical = Comprehend("Comprehend Medical\n(Text Analysis)")
        cloudwatch = CloudWatch("CloudWatch\n(Monitoring)")
    
    # ============================================================
    # SECURITY
    # ============================================================
    with Cluster("Security & Secrets"):
        iam = IAM("IAM\n(Access Control)")
        secrets = SecretsManager("Secrets Manager\n(Credentials)")
    
    # ============================================================
    # EXTERNAL SERVICES
    # ============================================================
    with Cluster("External Services"):
        google_ai = Client("Google Generative AI\n(Gemini)")
        email_service = Client("Resend\n(Email)")
        firebase = Client("Firebase\n(Auth)")
    
    # ============================================================
    # CONNECTIONS - CLIENT TO CDN
    # ============================================================
    web_client >> route53
    mobile_client >> route53
    route53 >> cloudfront
    cloudfront >> s3_static
    
    # ============================================================
    # CONNECTIONS - CDN TO API
    # ============================================================
    cloudfront >> api_gateway
    
    # ============================================================
    # CONNECTIONS - API TO BACKEND
    # ============================================================
    api_gateway >> backend_1
    api_gateway >> backend_2
    api_gateway >> backend_3
    
    # ============================================================
    # CONNECTIONS - BACKEND TO DATABASE
    # ============================================================
    backend_1 >> postgres_db
    backend_2 >> postgres_db
    backend_3 >> postgres_db
    
    # ============================================================
    # CONNECTIONS - BACKEND TO CACHE
    # ============================================================
    backend_1 >> redis_cache
    backend_2 >> redis_cache
    backend_3 >> redis_cache
    
    # ============================================================
    # CONNECTIONS - BACKEND TO STORAGE
    # ============================================================
    backend_1 >> s3_documents
    backend_2 >> s3_documents
    backend_3 >> s3_documents
    
    # ============================================================
    # CONNECTIONS - BACKEND TO HEALTHCARE
    # ============================================================
    backend_1 >> healthlake
    backend_2 >> healthlake
    
    # ============================================================
    # CONNECTIONS - BACKEND TO MESSAGING
    # ============================================================
    backend_1 >> sns
    backend_2 >> sqs
    backend_3 >> eventbridge
    
    # ============================================================
    # CONNECTIONS - MESSAGING TO LAMBDAS
    # ============================================================
    eventbridge >> period_alert_lambda
    eventbridge >> reminder_processor
    sns >> period_alert_lambda
    sqs >> reminder_processor
    
    # ============================================================
    # CONNECTIONS - LAMBDAS TO SERVICES
    # ============================================================
    period_alert_lambda >> sns
    reminder_processor >> sns
    ai_handler >> google_ai
    
    # ============================================================
    # CONNECTIONS - BACKEND TO AI
    # ============================================================
    backend_1 >> comprehend_medical
    backend_2 >> comprehend_medical
    backend_1 >> ai_handler
    
    # ============================================================
    # CONNECTIONS - BACKEND TO EXTERNAL SERVICES
    # ============================================================
    backend_1 >> google_ai
    backend_2 >> email_service
    backend_3 >> firebase
    
    # ============================================================
    # CONNECTIONS - MONITORING
    # ============================================================
    backend_1 >> cloudwatch
    backend_2 >> cloudwatch
    backend_3 >> cloudwatch
    postgres_db >> cloudwatch
    sns >> cloudwatch
    eventbridge >> cloudwatch
    
    # ============================================================
    # CONNECTIONS - SECURITY
    # ============================================================
    backend_1 >> iam
    backend_2 >> iam
    backend_3 >> iam
    backend_1 >> secrets
    backend_2 >> secrets
    backend_3 >> secrets

print("✅ AWS Architecture Diagram generated successfully!")
print("📊 Output file: aws_architecture_diagram.png")
print("📄 Diagram shows the complete Women's Health & Safety Platform architecture")
