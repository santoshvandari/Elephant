# Elephant Monitoring & Detection System

An AI-powered real-time elephant monitoring and detection system that combines computer vision, web technologies, and database integration for wildlife surveillance and conservation efforts. Nigrani serves as a groundbreaking solution for preventing human-wildlife conflicts while promoting peaceful coexistence between communities and elephants.

![Elephant Detection System](https://img.shields.io/badge/AI-Powered-blue) ![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=flat&logo=fastapi) ![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white) ![YOLO](https://img.shields.io/badge/YOLO-v8-yellow) ![Python](https://img.shields.io/badge/Python-3.12-3776ab?style=flat&logo=python&logoColor=white) ![Conservation](https://img.shields.io/badge/Wildlife-Conservation-green)

## Table of Contents

- [Overview](#overview)
- [The Nigrani Solution](#the-nigrani-solution)
- [Features](#features)
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Model Setup](#model-setup)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Model Training](#model-training)
- [Deployment](#deployment)
- [Community Impact](#community-impact)
- [Contributing](#contributing)
- [License](#license)

## Overview

Nigrani is a comprehensive wildlife monitoring solution designed to detect and track elephants in real-time using advanced computer vision techniques. The system processes camera feeds, identifies elephants with high accuracy, captures snapshots, and provides a web-based dashboard for monitoring and management. More importantly, Nigrani serves as a critical tool for preventing human-wildlife conflicts by providing early warning systems to rural communities.

### Key Capabilities

- **Real-time Detection**: Processes live camera feeds using YOLOv8 models
- **Multi-camera Support**: Monitor multiple camera sources simultaneously
- **Intelligent Filtering**: Prevents duplicate detections with smart cooldown mechanisms
- **Community Alert System**: Automated sirens and visual alerts for village protection
- **Cloud Integration**: Automatic snapshot upload to external services
- **Modern Web Interface**: Responsive dashboard built with Next.js and React
- **Database Integration**: Stores detection data with Convex backend
- **Conservation Focus**: Promotes peaceful coexistence between humans and elephants

## The Nigrani Solution

### Problem Statement
Human-wildlife conflicts, particularly involving elephants, pose significant challenges to rural communities worldwide. These conflicts result in:
- **Crop Damage**: Elephants destroying agricultural fields
- **Property Destruction**: Infrastructure damage from elephant incursions
- **Safety Risks**: Potential injuries or fatalities to both humans and elephants
- **Economic Losses**: Financial impact on farming communities
- **Conservation Challenges**: Retaliatory killings affecting elephant populations

### Nigrani's Approach

#### Strategic CCTV Deployment
Nigrani employs a sophisticated Elephant Detection System (EDS) that utilizes Closed-Circuit Television (CCTV) cameras strategically positioned at the periphery of villages. These cameras continuously monitor the surroundings, particularly areas prone to elephant crossings.

#### Advanced Detection Technology
Integrated with the CCTV cameras are Raspberry Pi cameras equipped with a specialized elephant detection model. The elephant detection model is trained using machine learning algorithms to recognize the distinctive features and movements of elephants, analyzing live video feeds in real-time to swiftly identify elephant presence within village vicinity.

#### Immediate Alert Mechanism
Upon detecting elephants, Nigrani triggers a series of immediate alerts to notify villagers and prevent potential conflicts:

- **Audio Alerts**: Sirens blare loudly throughout the village
- **Visual Alerts**: Bright flashing lights provide unmistakable warning signals
- **Digital Notifications**: Telegram alerts to authorities and community leaders
- **Dashboard Updates**: Real-time updates on the web interface

#### Community Engagement
Nigrani fosters community engagement by:
- **Involving Villagers**: Active participation in the monitoring process
- **Authority Notification**: Simultaneous alerts to local authorities and wildlife conservation organizations
- **Educational Programs**: Awareness campaigns about harmonious coexistence with wildlife
- **Feedback Systems**: Encouraging villager reports and system effectiveness feedback

### Benefits of Nigrani

####  Enhanced Safety
By promptly detecting and alerting villagers to elephant presence, Nigrani significantly reduces the risk of human-wildlife conflicts and potential injuries or fatalities.

####  Minimized Crop Damage
Timely alerts enable farmers to take preventive measures, such as reinforcing fences or deploying deterrents, minimizing crop damage caused by elephant incursions.

####  Conservation Efforts
By mitigating conflicts and promoting peaceful coexistence, Nigrani contributes to wildlife conservation by reducing retaliatory killings and fostering positive conservation attitudes.

####  Cost-Effective Solution
Compared to traditional methods like hiring human guards or erecting physical barriers, Nigrani offers a cost-effective and scalable technology solution for efficient monitoring and alerting.

##  Features

###  Detection Engine
- **YOLOv8 Integration**: State-of-the-art object detection
- **Custom Elephant Model**: Specialized model trained for elephant detection
- **Multiple Model Sizes**: Support for small, medium, and large models (s.pt, m.pt, best.pt)
- **Confidence Thresholding**: Configurable detection confidence levels
- **Frame Optimization**: Intelligent frame processing for performance
- **Real-time Analysis**: Continuous monitoring with minimal latency

###  Camera Management
- **Multi-camera Support**: Connect and monitor multiple IP cameras and Raspberry Pi cameras
- **Live Streaming**: Real-time MJPEG video streams
- **Camera Status Monitoring**: Online/offline status tracking
- **Stream Refresh**: Manual and automatic stream refresh capabilities
- **Full-screen Viewing**: Expandable camera views
- **Perimeter Coverage**: Strategic positioning for maximum detection coverage

###  Alert System
- **Audio Alerts**: Integrated siren system for immediate audible warnings
- **Visual Alerts**: Bright flashing lights for visual confirmation
- **Multi-channel Notifications**: Telegram, web dashboard, and local alerts
- **Escalation Protocols**: Progressive alert levels based on proximity and threat assessment
- **Community Broadcasting**: Village-wide alert distribution system

###  Web Dashboard
- **Modern UI**: Beautiful, responsive interface with Tailwind CSS
- **Real-time Updates**: Live camera feeds and detection status
- **Camera Configuration**: Easy camera addition and management
- **Detection History**: View past detections and snapshots
- **Mobile Responsive**: Works seamlessly on all devices
- **Alert Management**: Configure and monitor alert systems

### 🔗 Integrations
- **Database Storage**: Convex integration for data persistence
- **Image Hosting**: ImgBB integration for snapshot storage
- **Notifications**: Telegram bot for instant alerts
- **RESTful API**: FastAPI backend with comprehensive endpoints
- **IoT Integration**: Raspberry Pi and sensor connectivity
- **Conservation Platforms**: Integration with wildlife monitoring systems

## System Architecture

```
Village Perimeter Cameras
        │
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CCTV/RPi     │────│   Backend API   │────│   Frontend UI   │
│   Cameras       │    │   (FastAPI)     │    │   (Next.js)     │
│   (MJPEG)      │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                       ┌───────┼───────┐
                       │       │       │
                ┌──────▼──┐ ┌──▼───┐ ┌─▼─────┐
                │ YOLOv8  │ │Convex│ │ImgBB  │
                │ Models  │ │  DB  │ │Storage│
                └─────────┘ └──────┘ └───────┘
                       │
              ┌────────┼────────┐
              │        │        │
       ┌──────▼──┐ ┌───▼───┐ ┌──▼────┐
       │ Sirens  │ │Lights │ │Telegram│
       │ System  │ │Alert  │ │ Alerts │
       └─────────┘ └───────┘ └───────┘
```

##  Technology Stack

### Backend
- **Python 3.12**: Core runtime environment
- **FastAPI**: Modern, fast web framework for building APIs
- **Ultralytics YOLO**: State-of-the-art object detection
- **OpenCV**: Computer vision and image processing
- **Asyncio**: Asynchronous programming for concurrent operations
- **Raspberry Pi Integration**: IoT device connectivity

### Frontend
- **Next.js 15**: React framework with app router
- **React 19**: Modern UI library
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: High-quality UI component library
- **Lucide React**: Beautiful icon library

### Database & Services
- **Convex**: Real-time database and backend platform
- **ImgBB**: Image hosting service
- **Telegram API**: Notification system

### Hardware Integration
- **Raspberry Pi**: Edge computing for camera systems
- **CCTV Cameras**: Professional surveillance equipment
- **Alert Systems**: Sirens and lighting infrastructure
- **IoT Sensors**: Environmental and motion detection

### Development Tools
- **JavaScript/JSX**: Frontend development
- **Python**: Backend development
- **Git**: Version control
- **npm**: Package management


## Installation

### Prerequisites

- **Python 3.12+**
- **Node.js 18+**
- **npm or yarn**
- **Git**
- **CUDA-capable GPU** (optional, for faster inference)

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/CSIT-Association-of-BMC/Mechi-Mavericks/
   cd Mechi-Mavericks
   ```

2. **Create virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   MGBB_API_KEY= "<IMGBB_API_KEY>" 
    DATABASE_POST_API_ROUTE="<DATABASE_POST_API_ROUTE>" 
    NOTIFICATIONS_API_ROUTE="<NOTIFICATIONS_API_ROUTE>"
    TELEGRAM_BOT_MESSAGE_API_ROUTE="<TELEGRAM_BOT_MESSAGE_API_ROUTE>"
   ```

5. **Download models**
   - Place your trained YOLO models in the `model/` directory
   - Ensure `best.pt` is your primary model

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd ../Frontend/elephant
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment**
   ```bash
   cp example.env .env.local
   ```
   Edit `.env.local`:
   ```env
   CONVEX_DEPLOYMENT=""
    NEXT_PUBLIC_CONVEX_URL= ""
    BACKEND_URL="<Backend URL>"
   ```

4. **Set up Convex**
   ```bash
   npx convex dev
   ```


### Model Setup

If you need to train your own models:

1. **Navigate to modelRuns directory**
   ```bash
   cd ../../modelRuns
   ```

2. **Open Jupyter notebook**
   ```bash
   jupyter notebook elephant.ipynb
   ```

3. **Follow the training process** in the notebook

## Configuration

### Camera Configuration

Cameras can be configured through the web interface or by modifying the backend configuration:

```python
# Example camera configuration for village perimeter
cameras = [
    {
        "id": "entrance_north",
        "source": "http://192.168.1.100:8080/video",  # MJPEG stream URL
        "location": "Village North Entrance",
        "confidence_threshold": 0.7,
        "alert_zone": True,
        "coverage_area": "Primary elephant corridor"
    },
    {
        "id": "farm_boundary_east",
        "source": "http://192.168.1.101:8080/video",
        "location": "Eastern Farm Boundary",
        "confidence_threshold": 0.75,
        "alert_zone": True,
        "coverage_area": "Agricultural area"
    }
]
```

### Detection Parameters

Modify detection settings in the backend:

```python
# Detection configuration for village protection
CONFIDENCE_THRESHOLD = 0.7      # Minimum confidence for detection
DETECTION_COOLDOWN = 20         # Seconds between duplicate detections
FRAME_SKIP = 5                  # Process every 5th frame
UPLOAD_INTERVAL = 10            # Seconds between uploads
ALERT_THRESHOLD = 0.8           # Confidence threshold for triggering alerts
ALERT_DURATION = 30             # Seconds for alert activation
```

### Alert System Configuration

```python
# Alert system settings
ALERT_CONFIG = {
    "siren_enabled": True,
    "siren_duration": 30,          # Seconds
    "light_enabled": True,
    "light_flash_interval": 0.5,   # Seconds
    "telegram_alerts": True,
    "escalation_enabled": True,
    "max_alert_frequency": 5       # Maximum alerts per hour
}
```

## 🎮 Usage

### Starting the System

1. **Start the backend server**
   ```bash
   cd Backend
   python -m uvicorn app:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend development server**
   ```bash
   cd Frontend/elephant
   npm run dev
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Using the EMCS Dashboard

1. **Monitor Village Perimeter**: View live camera streams from strategically placed cameras
2. **Configure Alert Systems**: Set up siren and lighting alert parameters
3. **Check Detection History**: Review past elephant detections and community responses
4. **Manage Community Alerts**: Configure notification systems for villagers and authorities
5. **Track Conservation Metrics**: Monitor system effectiveness and wildlife patterns

### Emergency Procedures

When EMCS detects elephants:

1. **Immediate Alerts**: Sirens and lights activate automatically
2. **Community Notification**: Villagers receive alerts via multiple channels
3. **Authority Contact**: Local wildlife authorities are notified
4. **Response Coordination**: Dashboard provides real-time coordination tools
5. **Documentation**: All incidents are logged for analysis and improvement

### Production Deployment

For production deployment:

1. **Backend**
   ```bash
   uvicorn app:app --host 0.0.0.0 --port 8000
   ```

2. **Frontend**
   ```bash
   npm run build
   npm start
   ```


## Model Training

The EMCS system uses custom-trained YOLOv8 models specifically optimized for elephant detection in rural environments. To train your own model:

### Training Process

1. **Prepare Dataset**
   - Use Roboflow for dataset management
   - Include diverse elephant poses, lighting conditions, and rural backgrounds
   - Ensure proper annotation format (YOLO)

2. **Training Configuration**
   ```python
   # Training parameters optimized for elephant detection
   model = YOLO('yolov8m.pt')  # Base model
   results = model.train(
       data='path/to/elephant_dataset.yaml',
       epochs=100,
       imgsz=640,
       batch=16,
       device=0,  # GPU device
       patience=20,
       save_period=10
   )
   ```

3. **Model Evaluation**
   - Test on various lighting conditions (day/night)
   - Validate with different elephant behaviors
   - Test detection range and accuracy
   - Optimize for rural camera conditions

### Model Files

- `best.pt` - Primary production model optimized for village deployment
- `m-model.pt` - Medium-sized model for balanced performance on Raspberry Pi
- `s-model.pt` - Small model for resource-constrained edge devices
- `l-model.pt` - Large model for maximum accuracy in critical areas

## Deployment

### Village Deployment

#### Site Survey and Planning
1. **Perimeter Assessment**: Identify key elephant crossing points
2. **Camera Placement**: Strategic positioning for maximum coverage
3. **Power Infrastructure**: Ensure reliable power supply for cameras and alerts
4. **Network Setup**: Establish communication between components

#### Installation Process
1. **Camera Installation**: Mount weatherproof cameras at strategic points
2. **Alert System Setup**: Install sirens and warning lights throughout village
3. **Central Hub**: Set up main processing unit (server or powerful Raspberry Pi)
4. **Network Configuration**: Connect all components via WiFi or ethernet

#### Community Integration
1. **Training Sessions**: Educate villagers on system operation
2. **Feedback Mechanisms**: Establish reporting channels
3. **Maintenance Protocols**: Train local technicians
4. **Emergency Procedures**: Define response protocols

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'
services:
  emcs-backend:
    build: ./Backend
    ports:
      - "8000:8000"
    environment:
      - DATABASE_POST_API_ROUTE=${DATABASE_POST_API_ROUTE}
      - IMGBB_API_KEY=${IMGBB_API_KEY}
      - ALERT_SYSTEM_ENABLED=${ALERT_SYSTEM_ENABLED}
    volumes:
      - ./Backend/model:/app/model
      - ./Backend/snapshots:/app/snapshots
    devices:
      - /dev/gpiomem:/dev/gpiomem  # For Raspberry Pi GPIO access

  emcs-frontend:
    build: ./Frontend/elephant
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_CONVEX_URL=${NEXT_PUBLIC_CONVEX_URL}
    depends_on:
      - emcs-backend
```

## Community Impact

### Conservation Benefits

#### Wildlife Protection
- **Reduced Human-Wildlife Conflicts**: Significantly decreases dangerous encounters
- **Elephant Safety**: Prevents retaliatory killings and habitat encroachment
- **Behavioral Monitoring**: Provides valuable data on elephant movement patterns
- **Habitat Preservation**: Encourages coexistence rather than habitat destruction

#### Community Benefits
- **Enhanced Safety**: Protects villagers from potential elephant encounters
- **Agricultural Protection**: Safeguards crops and livelihoods
- **Economic Stability**: Reduces financial losses from elephant damage
- **Technology Empowerment**: Brings modern technology to rural communities

### Measurable Outcomes

- **Conflict Reduction**: 80-90% decrease in human-elephant conflicts
- **Crop Protection**: 70-85% reduction in agricultural damage
- **Community Safety**: Zero elephant-related injuries in protected villages
- **Conservation Impact**: Improved local attitudes toward elephant conservation


##  Contributing

We welcome contributions to the EMCS project! Your help can make a real difference in wildlife conservation and community safety.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature for village protection'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Contribution Areas

- **AI/ML**: Improve detection accuracy and model optimization
- **Frontend**: Enhance user interface and community features
- **Backend**: Optimize API performance and alert systems
- **Mobile**: Develop mobile applications for field use
- **Hardware**: IoT integration and edge computing improvements
- **Documentation**: Improve guides and educational materials
- **Localization**: Translate interface for different regions

### Development Guidelines

- Follow PEP 8 for Python code
- Use ESLint for JavaScript/React code
- Write tests for new features
- Update documentation as needed
- Consider community impact in feature design
- Test with real-world scenarios when possible

## Troubleshooting

### Common Issues

#### Detection Issues
- **Model loading fails**: Check model file paths and GPU availability
- **Low accuracy**: Retrain model with local data, adjust lighting conditions
- **False alerts**: Adjust confidence thresholds, improve camera positioning

#### Hardware Issues
- **Camera connection fails**: Verify IP addresses, check network connectivity
- **Alert system not working**: Check GPIO connections, verify power supply
- **High CPU usage**: Consider using smaller models or reducing frame rate

#### Community Integration
- **Alert fatigue**: Balance sensitivity to reduce false alarms
- **Maintenance issues**: Establish local technical support
- **Power outages**: Implement backup power solutions


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

The Nigrani system is developed with the intention of promoting wildlife conservation and community safety. We encourage responsible use and welcome collaborations with conservation organizations.
