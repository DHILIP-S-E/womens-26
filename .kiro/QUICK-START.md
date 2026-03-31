# AWS Architecture Diagrams - Quick Start

## ⚡ 30-Second Setup

### 1. Install Prerequisites
```bash
# Install GraphViz
# Windows: choco install graphviz
# macOS: brew install graphviz
# Linux: sudo apt-get install graphviz

# Install Python packages
pip install diagrams
```

### 2. Generate Diagrams
```bash
# Main architecture diagram
python aws-architecture-diagram.py

# All 8 variations
python aws-architecture-variations.py
```

### 3. View Results
- Open generated `.png` files in your image viewer
- All diagrams are in the project root directory

---

## 📊 Generated Diagrams

| Diagram | File | Purpose |
|---------|------|---------|
| Main Architecture | `aws_architecture_diagram.png` | Complete system overview |
| Data Flow | `aws_data_flow_diagram.png` | How data moves through system |
| Security | `aws_security_architecture.png` | Security layers and controls |
| Messaging | `aws_messaging_architecture.png` | Notification flow |
| Health Data | `aws_health_data_processing.png` | Health data pipeline |
| Disaster Recovery | `aws_disaster_recovery.png` | Backup and recovery |
| Scalability | `aws_scalability_architecture.png` | Auto-scaling setup |
| Cost Optimization | `aws_cost_optimization.png` | Cost-saving components |
| Safety Features | `aws_safety_architecture.png` | Emergency response |

---

## 📚 Documentation

| File | Purpose |
|------|---------|
| `.kiro/aws-architecture.md` | Complete architecture documentation |
| `.kiro/DIAGRAM-GENERATION-GUIDE.md` | How to generate and customize diagrams |
| `.kiro/AWS-DIAGRAMS-SUMMARY.md` | Overview of all diagrams |
| `.kiro/QUICK-START.md` | This file |

---

## 🔧 Customization

### Edit Diagram
```python
# Open aws-architecture-diagram.py
# Modify services, connections, or layout
# Run: python aws-architecture-diagram.py
```

### Add AWS Service
```python
from diagrams.aws.service_category import ServiceName

service = ServiceName("Label")
service >> other_service
```

### Change Layout
```python
# Direction: TB (top-bottom), LR (left-right), RL, BT
with Diagram("Title", direction="LR"):
    # code
```

---

## 🏗️ Key AWS Services

### Compute
- **EC2**: Backend servers
- **Lambda**: Serverless functions

### Database
- **RDS**: PostgreSQL database
- **Redis**: Cache layer
- **HealthLake**: Medical records

### Storage
- **S3**: Files and assets

### Networking
- **API Gateway**: REST API
- **CloudFront**: CDN
- **Route 53**: DNS

### Integration
- **EventBridge**: Scheduling
- **SNS**: Notifications
- **SQS**: Message queue

### Analytics
- **Comprehend Medical**: Text analysis
- **CloudWatch**: Monitoring

### Security
- **IAM**: Access control
- **Secrets Manager**: Credentials
- **KMS**: Encryption

---

## 🎯 Common Tasks

### View Architecture
```bash
# Open PNG file
open aws_architecture_diagram.png  # macOS
start aws_architecture_diagram.png # Windows
xdg-open aws_architecture_diagram.png # Linux
```

### Modify Diagram
```bash
# Edit Python file
nano aws-architecture-diagram.py

# Regenerate
python aws-architecture-diagram.py
```

### Export to Different Format
```python
# In Python script, change filename extension
with Diagram("Title", filename="diagram.svg"):
    # code
```

### Share Diagram
```bash
# Copy PNG file
cp aws_architecture_diagram.png ~/Documents/

# Or embed in documentation
# ![Architecture](aws_architecture_diagram.png)
```

---

## 🐛 Troubleshooting

### GraphViz Not Found
```bash
# Install GraphViz
# Windows: choco install graphviz
# macOS: brew install graphviz
# Linux: sudo apt-get install graphviz
```

### Module Not Found
```bash
pip install diagrams
```

### Permission Denied
```bash
chmod +x aws-architecture-diagram.py
python aws-architecture-diagram.py
```

### Timeout Error
- Increase timeout in `.kiro/settings/mcp.json`
- Simplify diagram (fewer services)
- Check system resources

---

## 📖 Learn More

- **AWS Diagrams**: https://diagrams.mingrammer.com/
- **AWS Architecture**: https://aws.amazon.com/architecture/
- **Well-Architected**: https://aws.amazon.com/architecture/well-architected/

---

## ✅ Checklist

- [ ] GraphViz installed
- [ ] Python packages installed
- [ ] Generated main diagram
- [ ] Generated all variations
- [ ] Reviewed documentation
- [ ] Customized diagrams (optional)
- [ ] Shared with team

---

## 🚀 Next Steps

1. **Review**: Open and review all generated diagrams
2. **Understand**: Read `.kiro/aws-architecture.md`
3. **Customize**: Modify Python scripts for your needs
4. **Deploy**: Use as basis for infrastructure as code
5. **Monitor**: Set up CloudWatch dashboards
6. **Optimize**: Review costs and performance

---

## 💡 Tips

- Keep diagrams simple and focused
- Use multiple diagrams for different aspects
- Update diagrams when architecture changes
- Version control diagram scripts
- Share diagrams with team for feedback
- Use as documentation for new team members

---

## 📞 Support

For issues or questions:
1. Check `.kiro/DIAGRAM-GENERATION-GUIDE.md` troubleshooting section
2. Review AWS Diagrams documentation
3. Check Python and GraphViz installation
4. Verify MCP configuration in `.kiro/settings/mcp.json`

---

**Happy diagramming! 🎉**

