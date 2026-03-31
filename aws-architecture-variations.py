#!/usr/bin/env python3
"""
AWS Architecture Diagram Variations
Multiple diagram perspectives for the Women's Health & Safety Platform
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import Lambda, EC2
from diagrams.aws.database import RDS, DynamoDB
from diagrams.aws.network import APIGateway, CloudFront, Route53
from diagrams.aws.storage import S3
from diagrams.aws.integration import EventBridge, SNS, SQS
from diagrams.aws.analytics import Comprehend
from diagrams.aws.healthcare import HealthLake
from diagrams.aws.security import IAM, SecretsManager, KMS
from diagrams.aws.management import CloudWatch, CloudTrail
from diagrams.onprem.client import Client
from diagrams.onprem.database import PostgreSQL
from diagrams.onprem.inmemory import Redis

# ============================================================
# DIAGRAM 1: DATA FLOW ARCHITECTURE
# ============================================================
def create_data_flow_diagram():
    """Shows how data flows through the system"""
    with Diagram("Data Flow Architecture", 
                 filename="aws_data_flow_diagram",
                 show=False,
                 direction="LR"):
        
        # Input
        user = Client("User\n(Web/Mobile)")
        
        # API Layer
        api = APIGateway("API Gateway")
        
        # Processing
        with Cluster("Backend Processing"):
            backend = EC2("Express.js\nBackend")
        
        # Data Storage
        with Cluster("Data Storage"):
            cache = Redis("Redis\nCache")
            db = RDS("PostgreSQL\nDatabase")
            healthlake = HealthLake("HealthLake\nMedical Records")
        
        # External Services
        with Cluster("External Services"):
            comprehend = Comprehend("Comprehend\nMedical")
            s3 = S3("S3\nStorage")
        
        # Response
        response = Client("Response\nto User")
        
        # Connections
        user >> api >> backend
        backend >> cache
        backend >> db
        backend >> healthlake
        backend >> comprehend
        backend >> s3
        backend >> response

# ============================================================
# DIAGRAM 2: SECURITY ARCHITECTURE
# ============================================================
def create_security_architecture():
    """Shows security layers and controls"""
    with Diagram("Security Architecture", 
                 filename="aws_security_architecture",
                 show=False,
                 direction="TB"):
        
        with Cluster("Client Layer"):
            client = Client("User\n(HTTPS)")
        
        with Cluster("Network Security"):
            route53 = Route53("Route 53\n(DNS)")
            api = APIGateway("API Gateway\n(Rate Limiting)")
        
        with Cluster("Application Security"):
            iam = IAM("IAM\n(Access Control)")
            backend = EC2("Backend\n(JWT Auth)")
        
        with Cluster("Data Security"):
            secrets = SecretsManager("Secrets Manager\n(Credentials)")
            kms = KMS("KMS\n(Encryption)")
            db = RDS("PostgreSQL\n(Encrypted)")
        
        with Cluster("Monitoring & Audit"):
            cloudwatch = CloudWatch("CloudWatch\n(Logs)")
            cloudtrail = CloudTrail("CloudTrail\n(Audit)")
        
        # Connections
        client >> route53 >> api
        api >> iam >> backend
        backend >> secrets
        backend >> kms
        kms >> db
        backend >> cloudwatch
        backend >> cloudtrail

# ============================================================
# DIAGRAM 3: MESSAGING & NOTIFICATIONS
# ============================================================
def create_messaging_architecture():
    """Shows notification and messaging flow"""
    with Diagram("Messaging & Notifications Architecture", 
                 filename="aws_messaging_architecture",
                 show=False,
                 direction="TB"):
        
        with Cluster("Event Sources"):
            user_action = Client("User Action\n(Create Reminder)")
            scheduled = EventBridge("EventBridge\n(Scheduled)")
        
        with Cluster("Message Processing"):
            backend = EC2("Backend\nService")
            lambda_func = Lambda("Lambda\nProcessor")
        
        with Cluster("Message Queue"):
            sqs = SQS("SQS\nQueue")
        
        with Cluster("Notification Service"):
            sns = SNS("SNS\nNotification")
        
        with Cluster("Delivery Channels"):
            sms = Client("SMS\n(Twilio)")
            email = Client("Email\n(Resend)")
            push = Client("Push\n(Firebase)")
        
        # Connections
        user_action >> backend >> sqs
        scheduled >> lambda_func >> sqs
        sqs >> sns
        sns >> sms
        sns >> email
        sns >> push

# ============================================================
# DIAGRAM 4: HEALTH DATA PROCESSING
# ============================================================
def create_health_data_processing():
    """Shows health data collection and analysis"""
    with Diagram("Health Data Processing", 
                 filename="aws_health_data_processing",
                 show=False,
                 direction="LR"):
        
        with Cluster("Data Collection"):
            cycle = Client("Cycle\nTracking")
            symptom = Client("Symptom\nLogging")
            mood = Client("Mood\nTracking")
        
        with Cluster("API Layer"):
            api = APIGateway("API Gateway")
        
        with Cluster("Backend Processing"):
            backend = EC2("Express.js\nBackend")
        
        with Cluster("AI Analysis"):
            comprehend = Comprehend("Comprehend\nMedical")
        
        with Cluster("Data Storage"):
            db = RDS("PostgreSQL\nDatabase")
            healthlake = HealthLake("HealthLake\nMedical Records")
        
        with Cluster("Insights"):
            insights = Client("Medical\nInsights")
        
        # Connections
        cycle >> api >> backend
        symptom >> api >> backend
        mood >> api >> backend
        backend >> comprehend
        comprehend >> db
        backend >> healthlake
        db >> insights

# ============================================================
# DIAGRAM 5: DISASTER RECOVERY & BACKUP
# ============================================================
def create_disaster_recovery():
    """Shows backup and disaster recovery setup"""
    with Diagram("Disaster Recovery & Backup", 
                 filename="aws_disaster_recovery",
                 show=False,
                 direction="TB"):
        
        with Cluster("Primary Region"):
            with Cluster("Production"):
                backend = EC2("Backend\nServers")
                db = RDS("PostgreSQL\n(Primary)")
                s3 = S3("S3\n(Primary)")
        
        with Cluster("Backup Layer"):
            backup_db = RDS("RDS\nBackup")
            backup_s3 = S3("S3\nVersioning")
        
        with Cluster("Secondary Region"):
            with Cluster("Standby"):
                standby_db = RDS("PostgreSQL\n(Replica)")
                standby_s3 = S3("S3\n(Replica)")
        
        with Cluster("Monitoring"):
            cloudwatch = CloudWatch("CloudWatch\n(Health Checks)")
        
        # Connections
        backend >> cloudwatch
        db >> backup_db
        db >> standby_db
        s3 >> backup_s3
        s3 >> standby_s3

# ============================================================
# DIAGRAM 6: SCALABILITY & PERFORMANCE
# ============================================================
def create_scalability_architecture():
    """Shows auto-scaling and performance optimization"""
    with Diagram("Scalability & Performance", 
                 filename="aws_scalability_architecture",
                 show=False,
                 direction="TB"):
        
        with Cluster("Client Layer"):
            client = Client("Users")
        
        with Cluster("CDN & Caching"):
            cloudfront = CloudFront("CloudFront\n(CDN)")
            cache = Redis("Redis\n(Cache)")
        
        with Cluster("Load Balancing"):
            api = APIGateway("API Gateway\n(Load Balancer)")
        
        with Cluster("Auto-Scaling Compute"):
            backend1 = EC2("Backend 1")
            backend2 = EC2("Backend 2")
            backend3 = EC2("Backend 3")
        
        with Cluster("Database Layer"):
            db_primary = RDS("PostgreSQL\n(Primary)")
            db_replica = RDS("PostgreSQL\n(Read Replica)")
        
        with Cluster("Monitoring"):
            cloudwatch = CloudWatch("CloudWatch\n(Metrics)")
        
        # Connections
        client >> cloudfront >> cache
        client >> api
        api >> backend1
        api >> backend2
        api >> backend3
        backend1 >> db_primary
        backend2 >> db_primary
        backend3 >> db_replica
        backend1 >> cloudwatch
        backend2 >> cloudwatch
        backend3 >> cloudwatch

# ============================================================
# DIAGRAM 7: COST OPTIMIZATION
# ============================================================
def create_cost_optimization():
    """Shows cost-optimized architecture"""
    with Diagram("Cost Optimization", 
                 filename="aws_cost_optimization",
                 show=False,
                 direction="LR"):
        
        with Cluster("Cost Reduction"):
            with Cluster("Compute"):
                lambda_func = Lambda("Lambda\n(Serverless)")
                spot = EC2("Spot Instances\n(Non-critical)")
            
            with Cluster("Storage"):
                s3_standard = S3("S3 Standard\n(Hot Data)")
                s3_glacier = S3("S3 Glacier\n(Archive)")
            
            with Cluster("Data Transfer"):
                cloudfront = CloudFront("CloudFront\n(CDN)")
            
            with Cluster("Database"):
                rds = RDS("RDS\n(Right-sized)")
        
        with Cluster("Monitoring"):
            cloudwatch = CloudWatch("CloudWatch\n(Cost Analysis)")
        
        # Connections
        lambda_func >> cloudwatch
        spot >> cloudwatch
        s3_standard >> s3_glacier
        s3_standard >> cloudwatch
        cloudfront >> cloudwatch
        rds >> cloudwatch

# ============================================================
# DIAGRAM 8: SAFETY & EMERGENCY FEATURES
# ============================================================
def create_safety_architecture():
    """Shows safety and emergency response architecture"""
    with Diagram("Safety & Emergency Features", 
                 filename="aws_safety_architecture",
                 show=False,
                 direction="TB"):
        
        with Cluster("User Actions"):
            sos = Client("SOS Button")
            safe_walk = Client("Safe Walk")
        
        with Cluster("API Layer"):
            api = APIGateway("API Gateway")
        
        with Cluster("Backend Processing"):
            backend = EC2("Safety\nController")
        
        with Cluster("Data Storage"):
            db = RDS("PostgreSQL\n(Alerts)")
            s3 = S3("S3\n(Audio Evidence)")
        
        with Cluster("Notifications"):
            sns = SNS("SNS\nNotifications")
        
        with Cluster("Emergency Contacts"):
            sms = Client("SMS\n(Trusted Contacts)")
            email = Client("Email\n(Alerts)")
        
        with Cluster("Location Tracking"):
            location = Client("Real-time\nLocation")
        
        # Connections
        sos >> api >> backend
        safe_walk >> api >> backend
        backend >> db
        backend >> s3
        backend >> sns
        sns >> sms
        sns >> email
        backend >> location

# ============================================================
# MAIN EXECUTION
# ============================================================
if __name__ == "__main__":
    print("🏗️  Generating AWS Architecture Diagrams...")
    print()
    
    print("1️⃣  Creating Data Flow Diagram...")
    create_data_flow_diagram()
    print("   ✅ Generated: aws_data_flow_diagram.png")
    
    print("2️⃣  Creating Security Architecture...")
    create_security_architecture()
    print("   ✅ Generated: aws_security_architecture.png")
    
    print("3️⃣  Creating Messaging & Notifications...")
    create_messaging_architecture()
    print("   ✅ Generated: aws_messaging_architecture.png")
    
    print("4️⃣  Creating Health Data Processing...")
    create_health_data_processing()
    print("   ✅ Generated: aws_health_data_processing.png")
    
    print("5️⃣  Creating Disaster Recovery & Backup...")
    create_disaster_recovery()
    print("   ✅ Generated: aws_disaster_recovery.png")
    
    print("6️⃣  Creating Scalability & Performance...")
    create_scalability_architecture()
    print("   ✅ Generated: aws_scalability_architecture.png")
    
    print("7️⃣  Creating Cost Optimization...")
    create_cost_optimization()
    print("   ✅ Generated: aws_cost_optimization.png")
    
    print("8️⃣  Creating Safety & Emergency Features...")
    create_safety_architecture()
    print("   ✅ Generated: aws_safety_architecture.png")
    
    print()
    print("✨ All diagrams generated successfully!")
    print()
    print("📊 Generated Files:")
    print("   • aws_data_flow_diagram.png")
    print("   • aws_security_architecture.png")
    print("   • aws_messaging_architecture.png")
    print("   • aws_health_data_processing.png")
    print("   • aws_disaster_recovery.png")
    print("   • aws_scalability_architecture.png")
    print("   • aws_cost_optimization.png")
    print("   • aws_safety_architecture.png")
    print()
    print("📖 Documentation:")
    print("   • .kiro/aws-architecture.md")
    print("   • .kiro/DIAGRAM-GENERATION-GUIDE.md")
