
# **NetPulse**

### Web-Based Adaptive Network Congestion Detection & Rate Control System

---

## Overview

**NetPulse** is a web-based network monitoring and control system that detects congestion conditions in real time and dynamically adjusts traffic sending rates to maintain network stability.

The system continuously observes **latency (RTT)**, **throughput**, **packet loss**, and **interface utilization**, classifies the current network state, and applies adaptive rate control using a feedback loop.
All metrics and state transitions are visualized live through an interactive browser dashboard.

---

## Motivation

Static rate limits and delayed congestion handling often result in:

* High packet loss
* Sudden latency spikes
* Throughput collapse under load

NetPulse addresses this by **detecting congestion early** and **reacting immediately**, allowing the system to stabilize traffic before performance degrades further.

---

## Key Features

* Real-time network traffic simulation
* Live monitoring of:

  * Packet loss
  * RTT (latency)
  * Throughput
  * Interface utilization
* Congestion classification:

  * Network Stable
  * High Latency
  * Packet Loss
  * Bandwidth Saturation
* Adaptive rate control using a token-bucket model
* Fully web-based dashboard (no CLI interaction)

---

## System Architecture

### Backend

* **Python**
* **Flask** (HTTP server)
* Python sockets for traffic simulation
* Background worker threads
* Server-Sent Events (SSE) for live metric streaming

### Frontend

* HTML, CSS, Vanilla JavaScript
* Served directly by Flask
* Real-time updates without page refresh
* Lightweight chart rendering

---

## Core Components

### Traffic Generator

* Sends packets at a configurable rate (requests/sec)
* Controlled using a token-bucket mechanism
* Rate dynamically adjusted by the control loop

### Traffic Receiver

* Receives packets and measures:

  * RTT
  * Packet loss percentage
  * Throughput (Mbps)

### Congestion Monitor

* Evaluates network health using configurable thresholds:

  * RTT threshold (ms)
  * Packet loss (%)
  * Interface utilization (%)
* Determines congestion state in real time

### Rate Control Engine

* Reduces traffic rate on congestion detection
* Gradually increases rate when network stabilizes
* Operates on a fixed control loop interval

---

## Web Dashboard

The NetPulse dashboard (see screenshot, page 1) displays live system state including :

* **Current Rate (RPS)**
* **Token Bucket Level**
* **Interface Utilization**
* **Packet Loss Percentage**
* **Congestion Indicators**
* **Latency (RTT) timeline**
* **Throughput timeline**

A configuration panel (page 2) allows runtime tuning of :

* Rate limits (min / max / initial)
* Congestion thresholds
* Token bucket capacity and refill rate
* Control loop interval
* Target network host and interface

All changes take effect immediately without restarting the system.

---

## Event Flow

1. User starts traffic simulation from the web UI
2. Traffic generator begins sending packets
3. Receiver measures network metrics
4. Congestion monitor evaluates thresholds
5. Rate controller adjusts traffic rate
6. Updated metrics and state streamed to UI via SSE

---

## API Endpoints

| Method | Endpoint   | Description              |
| ------ | ---------- | ------------------------ |
| GET    | `/`        | Dashboard UI             |
| POST   | `/start`   | Start traffic simulation |
| POST   | `/stop`    | Stop traffic simulation  |
| GET    | `/metrics` | Current metrics snapshot |
| GET    | `/stream`  | Live metric stream (SSE) |

---

## Results & Observations

From the captured run (page 1 of the outcome PDF) :

* Packet loss reached **100%**, triggering a **Packet Loss** congestion state
* Interface utilization remained low, indicating loss-dominated congestion
* Throughput fluctuated between **~0.2–0.4 Mbps**
* The control system correctly classified congestion and maintained minimum rate limits instead of collapsing traffic entirely

This demonstrates that NetPulse:

* Detects failure conditions early
* Prevents uncontrolled traffic escalation
* Maintains system responsiveness under adverse network conditions

---

## Running Locally (VS Code)

### Prerequisites

* Python 3.9+
* VS Code
* Browser

### Steps

```bash
git clone <repository-url>
cd netpulse
pip install -r requirements.txt
python app.py
```

Open in browser:

```
http://localhost:5000
```

---

## Project Structure

```
netpulse/
 ├── app.py                 # Flask entry point
 ├── traffic/
 │    ├── sender.py         # Traffic generation
 │    ├── receiver.py       # Metric collection
 │    ├── monitor.py        # Congestion detection
 │    └── controller.py     # Rate control logic
 ├── templates/
 │    └── index.html        # Dashboard UI
 ├── static/
 │    ├── style.css
 │    └── dashboard.js
 └── README.md
```

---

## Design Decisions

* **Web-first design** for observability
* **SSE over polling** for efficient real-time updates
* **Token bucket control** for predictable rate shaping
* **No ML** to keep behavior transparent and debuggable
* **No external infrastructure dependencies**

---

## Scope for Extension

* Multi-flow traffic simulation
* Persistent metric storage
* Advanced congestion heuristics
* Authentication and role-based views
* Containerized deployment

---

## Author

Developed as a systems-focused project demonstrating:

* Networking fundamentals
* Feedback-based rate control
* Real-time observability
* Clean web-based system design


