# AWS Architecture Diagram Generation Guide

## Overview

This guide explains how to generate AWS architecture diagrams for the Women's Health & Safety Platform using the AWS Diagram MCP Server.

---

## Prerequisites

### 1. Install Required Tools

#### Option A: Using UV (Recommended)
```bash
# Install UV (Python package manager)
# Windows: Use pip or chocolatey
pip install uv

# Or download from: https://docs.astral.sh/uv/getting-started/installation/
```

#### Option B: Using Python Directly
```bash
# Install Python 3.10+
python --version

# Install required packages
pip install diagrams graphviz
```

### 2. Install GraphViz

**Windows:**
```bash
# Using Chocolatey
choco install graphviz

# Or download from: https://graphviz.org/download/
```

**macOS:**
```bash
brew install graphviz
```

**Linux:**
```bash
sudo apt-get install graphviz
```

### 3. Configure MCP Server

Edit `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "aws-diagram": {
      "disabled": false,
      "timeout": 60,
      "type": "stdio",
      "command": "uv",
      "args": [
        "tool",
        "run",
        "--from",
        "awslabs.aws-diagram-mcp-server@latest",
        "awslabs.aws-diagram-mcp-server.exe"
      ],
      "env": {
        "FASTMCP_LOG_LEVEL": "ERROR"
      },
      "autoApprove": ["create_diagram"]
    }
  }
}
```

---

## Generating Diagrams

### Method 1: Using Python Script (Recommended)

Run the provided Python script:

```bash
python aws-architecture-diagram.py
```

This generates:
- `aws_architecture_diagram.png` - Visual diagram
- `aws_architecture_diagram.dot` - Graphviz source

### Method 2: Using AWS Diagram MCP Server

The MCP server provides tools to generate diagrams programmatically.

#### Available Tools

1. **create_diagram**
   - Input: Python code using diagrams DSL
   - Output: PNG/SVG image and Graphviz source

2. **list_icons**
   - Lists available AWS service icons
   - Filters by provider and service

3. **get_diagram_examples**
   - Returns example diagram code
   - Supports: aws, sequence, flow, class, k8s, onprem, custom

---

## Diagram Components

### AWS Services Used

#### Compute
- **EC2**: Backend application servers
- **Lambda**: Serverless functions (period alerts, reminders)

#### Database
- **RDS**: PostgreSQL primary database
- **DynamoDB**: Optional for high-scale data

#### Storage
- **S3**: Static assets, documents, audio

#### Networking
- **API Gateway**: REST API endpoint
- **CloudFront**: CDN for static assets
- **Route 53**: DNS and health checks

#### Integration
- **EventBridge**: Scheduled event processing
- **SNS**: Notifications (SMS, email)
- **SQS**: Message queue

#### Analytics & AI
- **Comprehend Medical**: Medical text analysis
- **CloudWatch**: Monitoring and logging

#### Healthcare
- **HealthLake**: HIPAA-compliant medical records

#### Security
- **IAM**: Access control
- **Secrets Manager**: Credential management

---

## Customizing Diagrams

### Edit the Python Script

Modify `aws-architecture-diagram.py` to:

1. **Add/Remove Services**
```python
from diagrams.aws.compute import Lambda, EC2
from diagrams.aws.database import RDS

# Add new service
new_service = RDS("My Database")
```

2. **Change Connections**
```python
# Add connection
service1 >> service2

# Add labeled connection
service1 >> Edge(label="HTTPS") >> service2

# Add styled connection
service1 >> Edge(color="red", style="dashed") >> service2
```

3. **Modify Clusters**
```python
with Cluster("My Cluster"):
    service1 = Service("Service 1")
    service2 = Service("Service 2")
```

4. **Change Layout**
```python
# Direction options: TB (top-bottom), LR (left-right), RL, BT
with Diagram("Title", direction="LR"):
    # diagram code
```

---

## Available AWS Icons

### Compute
- `Lambda` - AWS Lambda
- `EC2` - EC2 instances
- `ECS` - Elastic Container Service
- `EKS` - Elastic Kubernetes Service
- `Batch` - AWS Batch

### Database
- `RDS` - Relational Database Service
- `DynamoDB` - NoSQL database
- `ElastiCache` - In-memory cache
- `Redshift` - Data warehouse
- `Neptune` - Graph database

### Storage
- `S3` - Simple Storage Service
- `EBS` - Elastic Block Store
- `EFS` - Elastic File System
- `Glacier` - Archive storage

### Networking
- `APIGateway` - API Gateway
- `CloudFront` - CloudFront CDN
- `Route53` - Route 53 DNS
- `ELB` - Elastic Load Balancer
- `VPC` - Virtual Private Cloud

### Integration
- `EventBridge` - EventBridge
- `SNS` - Simple Notification Service
- `SQS` - Simple Queue Service
- `Kinesis` - Kinesis streaming
- `AppSync` - AppSync GraphQL

### Analytics & AI
- `Comprehend` - Comprehend NLP
- `Forecast` - Forecast service
- `Lookout` - Lookout services
- `SageMaker` - SageMaker ML

### Healthcare
- `HealthLake` - HealthLake service

### Security
- `IAM` - Identity & Access Management
- `SecretsManager` - Secrets Manager
- `KMS` - Key Management Service
- `ACM` - Certificate Manager

### Management
- `CloudWatch` - CloudWatch monitoring
- `CloudTrail` - CloudTrail logging
- `Config` - AWS Config
- `SystemsManager` - Systems Manager

---

## Diagram Examples

### Example 1: Simple API Architecture
```python
from diagrams import Diagram
from diagrams.aws.network import APIGateway
from diagrams.aws.compute import Lambda
from diagrams.aws.database import DynamoDB

with Diagram("Simple API", show=False):
    api = APIGateway("API")
    func = Lambda("Function")
    db = DynamoDB("Database")
    
    api >> func >> db
```

### Example 2: Multi-Tier Application
```python
from diagrams import Diagram, Cluster
from diagrams.aws.network import CloudFront, APIGateway
from diagrams.aws.compute import EC2
from diagrams.aws.database import RDS
from diagrams.aws.storage import S3

with Diagram("Multi-Tier App", show=False):
    with Cluster("CDN"):
        cdn = CloudFront("CloudFront")
        assets = S3("Static Assets")
    
    with Cluster("API"):
        api = APIGateway("API Gateway")
    
    with Cluster("Compute"):
        web = EC2("Web Server")
    
    with Cluster("Database"):
        db = RDS("PostgreSQL")
    
    cdn >> assets
    cdn >> api >> web >> db
```

### Example 3: Event-Driven Architecture
```python
from diagrams import Diagram, Cluster
from diagrams.aws.integration import EventBridge, SNS
from diagrams.aws.compute import Lambda
from diagrams.aws.database import DynamoDB

with Diagram("Event-Driven", show=False):
    with Cluster("Events"):
        events = EventBridge("EventBridge")
    
    with Cluster("Processing"):
        func1 = Lambda("Function 1")
        func2 = Lambda("Function 2")
    
    with Cluster("Notifications"):
        notify = SNS("SNS")
    
    with Cluster("Storage"):
        db = DynamoDB("DynamoDB")
    
    events >> func1 >> db
    events >> func2 >> notify
```

---

## Output Formats

### PNG (Default)
```bash
python aws-architecture-diagram.py
# Generates: aws_architecture_diagram.png
```

### SVG (Scalable Vector)
```python
with Diagram("Title", filename="diagram.svg", show=False):
    # diagram code
```

### Graphviz DOT Format
```python
# Automatically generated as .dot file
# Can be edited and re-rendered with: dot -Tpng diagram.dot -o diagram.png
```

---

## Troubleshooting

### Issue: GraphViz not found
```
Error: "dot" not found in PATH
```

**Solution:**
1. Install GraphViz (see Prerequisites)
2. Add GraphViz to PATH:
   - Windows: `C:\Program Files\Graphviz\bin`
   - macOS: `/usr/local/bin`
   - Linux: `/usr/bin`

### Issue: Module not found
```
Error: ModuleNotFoundError: No module named 'diagrams'
```

**Solution:**
```bash
pip install diagrams
# Or using UV:
uv pip install diagrams
```

### Issue: MCP Server not connecting
```
Error: MCP server connection failed
```

**Solution:**
1. Check `.kiro/settings/mcp.json` configuration
2. Verify UV is installed: `uv --version`
3. Restart Kiro IDE
4. Check MCP server logs

### Issue: Diagram generation timeout
```
Error: Diagram generation timed out
```

**Solution:**
1. Increase timeout in MCP config: `"timeout": 120`
2. Simplify diagram (fewer services/connections)
3. Check system resources (CPU, memory)

---

## Best Practices

### 1. Organize with Clusters
```python
with Cluster("Layer Name"):
    # Group related services
```

### 2. Use Descriptive Labels
```python
service = Service("Service Name\n(Description)")
```

### 3. Add Edge Labels
```python
service1 >> Edge(label="HTTPS") >> service2
```

### 4. Color Code by Type
```python
# Use Edge colors to indicate connection types
service1 >> Edge(color="red") >> service2  # Error path
service1 >> Edge(color="green") >> service2  # Success path
```

### 5. Logical Flow
- Left to right: Input → Processing → Output
- Top to bottom: Client → API → Database
- Group related services together

### 6. Keep It Simple
- Don't overcrowd the diagram
- Use multiple diagrams for different aspects
- Focus on key components

---

## Generating Multiple Diagrams

Create separate diagrams for different aspects:

### 1. Data Flow Diagram
```python
# Focus on data movement
# Show: Client → API → Database
```

### 2. Security Architecture
```python
# Focus on security layers
# Show: IAM, Secrets Manager, Encryption
```

### 3. Disaster Recovery
```python
# Focus on backup and failover
# Show: Multi-AZ, Replication, Backup
```

### 4. Cost Optimization
```python
# Focus on cost-saving components
# Show: CloudFront, S3, Lambda
```

---

## Integration with Documentation

### Embed in Markdown
```markdown
# Architecture Diagram

![AWS Architecture](aws_architecture_diagram.png)

## Components

- **Frontend**: React application
- **Backend**: Express.js on EC2
- **Database**: PostgreSQL on RDS
```

### Version Control
```bash
# Add to git
git add aws-architecture-diagram.py
git add aws_architecture_diagram.png
git commit -m "Add AWS architecture diagram"
```

### CI/CD Integration
```yaml
# GitHub Actions example
- name: Generate Architecture Diagram
  run: python aws-architecture-diagram.py
  
- name: Upload Diagram
  uses: actions/upload-artifact@v2
  with:
    name: architecture-diagram
    path: aws_architecture_diagram.png
```

---

## Resources

- [AWS Diagrams Documentation](https://diagrams.mingrammer.com/)
- [AWS Icons Reference](https://diagrams.mingrammer.com/docs/guides/diagram)
- [Graphviz Documentation](https://graphviz.org/documentation/)
- [AWS Architecture Best Practices](https://aws.amazon.com/architecture/well-architected/)

