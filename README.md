# Collective Intelligence Decision Platform

An open-source platform that enhances group decision-making by identifying cognitive biases, synthesizing diverse perspectives, visualizing agreement/disagreement patterns, and facilitating structured deliberation.

## Project Vision

This platform aims to:
- Identify and mitigate cognitive biases in group discussions
- Synthesize diverse perspectives into coherent viewpoints
- Visualize agreement and disagreement patterns
- Facilitate transparent and structured deliberation
- Build consensus through data-driven insights

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 14+
- Docker (optional)

### Development Setup

1. Clone the repository
git clone https://github.com/yourusername/collective-intelligence-platform.git
cd collective-intelligence-platform



2. Set up backend
```
cd backend
python -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python main.py
```


3. Set up frontend
```
cd frontend
npm install
npm start
```
## Docker Setup
```
docker-compose up
```

## Project Structure
- `/backend` - Python Flask/FastAPI backend
- `/frontend` - React TypeScript frontend
- `/docs` - Documentation
- `/scripts` - Utility scripts

## Features
- User authentication and workspace management
- Discussion threads and messaging
- Bias detection and visualization (coming soon)
- Perspective clustering and synthesis (coming soon)
- Decision quality metrics and tracking (coming soon)

## Contributing
Contributions are welcome! Please check out our [Contributing Guide](docs/developer/CONTRIBUTING.md) for details.

## License
This project is licensed under the Apache License - see the LICENSE file for details.
